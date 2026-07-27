// Contact submission orchestration, extracted from the route handler so it is
// unit-testable without next/server (unavailable under happy-dom). The route
// (app/api/contact/route.ts) is a thin adapter over this.
//
// Parity with the Azure Functions handler is exact for every response contract
// (status + JSON body), which the frontend and the CI detection step both parse.
// Two deliberate cross-runtime changes, per the plan:
//   - A1: HubSpot upsert and queue enqueue are awaited-with-catch — failure is
//     logged and swallowed (non-blocking) but the work completes before we
//     respond. On the Functions runtime post-response work survived; on the
//     managed hybrid backend it is undocumented whether it does, so unawaited
//     work could drop a lead behind a 200. Awaiting closes that gap.
//   - Q4: the whole external-call orchestration runs under a total time budget.
import { contactFormSchema } from "./contact-schema";
import { resolveCorsOrigin } from "./cors";
import { getClientIp } from "./rate-limit";
import { newCorrelationId } from "./correlation";
import { sendContactEmail, type ContactFormData } from "./email/send-contact-email";
import {
  INTEREST_TO_INQUIRY_TOPIC,
  upsertContactAndLogInquiry,
  type HubSpotUpsertResult,
} from "./hubspot";
import { buildClassifyMessage, QueueMessageTooLargeError } from "./classify-queue";
import { enqueueClassify } from "./queue-client";
import { apiLog } from "./log";

export interface ContactHandlerInput {
  method: string;
  headers: Headers;
  /** Lazily parse the request body (only called for non-OPTIONS methods). */
  readBody: () => Promise<unknown>;
}

export interface ContactHandlerResult {
  status: number;
  /** JSON body to return, or null for an empty (OPTIONS) response. */
  body: unknown;
  corsOrigin: string | null;
}

// Total wall-clock budget for the submission orchestration (plan Q4). Even if
// both external calls exhaust their 10s timeouts, we self-terminate with a
// well-formed JSON error, comfortably under the managed backend's undocumented
// request ceiling, instead of letting the platform kill us with an opaque 5xx.
const HANDLER_BUDGET_MS = 25_000;

/**
 * True when this is a non-production (preview) environment, where real
 * email/HubSpot/queue side effects must be skipped. Preview environments inherit
 * the production app settings — including the real Resend/HubSpot/queue
 * credentials (the Key Vault firewall blocks SWA KV references, so secrets are
 * plain settings that propagate) — so a real submission there would send real
 * email and write real records.
 *
 * Two independent signals, either sufficient:
 *  - PREVIEW_BUILD: baked into the build by the deploy-pr-to-azure job and inlined
 *    via next.config `env`. Deterministic and unspoofable at runtime; the
 *    production build (deploy-main-to-azure) never sets it.
 *  - x-forwarded-host: the managed backend's own `host` header is an internal
 *    *.azurewebsites.net host, but x-forwarded-host carries the real public host
 *    (`<app>-<pr>.<region>.azurestaticapps.net` for previews).
 *
 * Fail-safe for production: the production build has no PREVIEW_BUILD, and its
 * public host is the apex / www / origin, none of which match the preview pattern.
 */
function isNonProduction(headers: Headers): boolean {
  if (process.env.PREVIEW_BUILD === "true") return true;
  const fwd = (headers.get("x-forwarded-host") || "").toLowerCase();
  return fwd.endsWith(".azurestaticapps.net") && /-\d+\./.test(fwd);
}

/**
 * Log-safe stand-in for a client IP. An address identifies a person under GDPR
 * and these logs are retained for 30 days, so the log keeps only what is
 * diagnostically useful: whether a real client address was resolvable at all.
 * The correlation id already links every line of one request together.
 */
export function ipClass(ipAddress: string): "resolved" | "unknown" {
  return ipAddress === "unknown" ? "unknown" : "resolved";
}

// The contact schema caps `message` at 2000 chars, so a legitimate submission is
// a couple of KB at most. This rejects on the declared Content-Length BEFORE the
// body is parsed, so an oversized payload costs a header read rather than a full
// JSON parse. A body with no Content-Length is allowed through to the schema,
// which bounds every field anyway.
export const MAX_BODY_BYTES = 50_000;

export function isBodyTooLarge(headers: Headers): boolean {
  const raw = headers.get("content-length");
  if (!raw) return false;
  const len = Number(raw);
  return Number.isFinite(len) && len > MAX_BODY_BYTES;
}

function serviceUnavailable(corsOrigin: string | null): ContactHandlerResult {
  return {
    status: 503,
    body: {
      success: false,
      message: "Service temporarily unavailable. Please try again later.",
      serviceUnavailable: true,
    },
    corsOrigin,
  };
}

/** Resolve `work`, or `fallback` if it does not settle within `ms`. */
function withBudget<T>(ms: number, fallback: T, work: Promise<T>): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const budget = new Promise<T>((resolve) => {
    timer = setTimeout(() => resolve(fallback), ms);
  });
  return Promise.race([work, budget]).finally(() => clearTimeout(timer));
}

export async function handleContact(
  input: ContactHandlerInput,
): Promise<ContactHandlerResult> {
  const corsOrigin = resolveCorsOrigin(input.headers.get("origin") || "");

  if (input.method === "OPTIONS") {
    return { status: 200, body: null, corsOrigin };
  }

  const cid = newCorrelationId();
  try {
    const ipAddress = getClientIp(input.headers);
    const rawUserAgent = input.headers.get("user-agent");
    const userAgent = rawUserAgent || "unknown";
    const submissionUrl = input.headers.get("referer");
    if (isBodyTooLarge(input.headers)) {
      apiLog.warn(`[contact ${cid}] payload too large`, { ipAddress });
      return {
        status: 413,
        body: { success: false, message: "Payload too large" },
        corsOrigin,
      };
    }

    const body = (await input.readBody()) as Record<string, unknown>;

    if (body._gotcha && String(body._gotcha).trim() !== "") {
      apiLog.warn(`[contact ${cid}] honeypot triggered`, { ip: ipClass(ipAddress) });
      return {
        status: 400,
        body: { success: false, message: "Invalid submission" },
        corsOrigin,
      };
    }

    const parsed = contactFormSchema.safeParse(body);
    if (!parsed.success) {
      return {
        status: 400,
        body: {
          success: false,
          message: "Validation failed",
          errors: parsed.error.errors,
        },
        corsOrigin,
      };
    }
    // Never log the submitter's address. The correlation id already ties
    // this line to the rest of the request's trace, so the email adds no
    // diagnostic value while putting personal data in a 30-day log store.
    apiLog.info(`[contact ${cid}] validated`, {
      interest: parsed.data.interest || "unspecified",
      hasCompany: Boolean(parsed.data.company),
    });

    // Preview environments inherit production secrets, so skip all real side
    // effects there. Validation + honeypot still run (the form stays testable in
    // previews), but no real email/HubSpot/queue writes occur.
    if (isNonProduction(input.headers)) {
      apiLog.info(`[contact ${cid}] preview environment — skipping real email/HubSpot/queue`);
      return {
        status: 200,
        body: {
          success: true,
          message: "Thank you for your message! We'll get back to you soon.",
        },
        corsOrigin,
      };
    }

    const formData: ContactFormData = {
      ...parsed.data,
      ipAddress,
      userAgent,
    };

    const orchestration = (async (): Promise<ContactHandlerResult> => {
      const emailResult = await sendContactEmail(formData);

      if (emailResult.rateLimited) {
        return {
          status: 429,
          body: {
            success: false,
            message: "Too many requests. Please try again later.",
            rateLimited: true,
          },
          corsOrigin,
        };
      }
      if (emailResult.circuitBreakerOpen) {
        return serviceUnavailable(corsOrigin);
      }
      if (!emailResult.success) {
        return {
          status: 500,
          body: {
            success: false,
            message: "Failed to send email. Please try again later.",
          },
          corsOrigin,
        };
      }
      apiLog.info(`[contact ${cid}] emailed`);

      // HubSpot upsert — awaited-with-catch, failure non-blocking (A1).
      let hsResult: HubSpotUpsertResult | undefined;
      try {
        hsResult = await upsertContactAndLogInquiry(
          {
            firstName: parsed.data.firstName,
            lastName: parsed.data.lastName,
            email: parsed.data.email,
            company: parsed.data.company,
            message: parsed.data.message,
            interest: parsed.data.interest,
            submissionIp: ipAddress,
            submissionUrl: submissionUrl ?? undefined,
            utmSource: parsed.data.utmSource,
            utmMedium: parsed.data.utmMedium,
            utmCampaign: parsed.data.utmCampaign,
          },
          (m, meta) => apiLog.info(`[contact ${cid}] ${m}`, meta ?? {}),
        );
      } catch (err) {
        apiLog.error(`[contact ${cid}] hubspot.exception`, {
          error: err instanceof Error ? err.message : String(err),
        });
      }
      apiLog.info(`[contact ${cid}] hubspot`, { ok: hsResult?.success ?? false });

      // Queue enqueue — awaited-with-catch, failure non-blocking (A1). Only when
      // HubSpot produced a contactId, matching the original behaviour.
      try {
        if (hsResult?.success && hsResult.contactId) {
          const interest = parsed.data.interest;
          const inquiryTopic = interest
            ? INTEREST_TO_INQUIRY_TOPIC[interest] ?? "general_inquiry"
            : "general_inquiry";

          const msg = buildClassifyMessage({
            submittedAt: new Date().toISOString(),
            contactId: hsResult.contactId,
            noteId: hsResult.noteId,
            body: parsed.data,
            inquiryTopic,
            leadPriority: "p2_warm",
            ip: ipAddress,
            userAgent: rawUserAgent,
            submissionUrl: submissionUrl,
          });
          await enqueueClassify(msg);
          apiLog.info(`[contact ${cid}] enqueued`, {
            inquiryTopic: msg.inquiry.inquiryTopic,
          });
        }
      } catch (err) {
        const tag =
          err instanceof QueueMessageTooLargeError
            ? "classify.enqueue.too-large"
            : "classify.enqueue.exception";
        apiLog.error(`[contact ${cid}] ${tag}`, {
          message: err instanceof Error ? err.message : String(err),
        });
      }

      return {
        status: 200,
        body: {
          success: true,
          message: "Thank you for your message! We'll get back to you soon.",
        },
        corsOrigin,
      };
    })();

    return await withBudget(
      HANDLER_BUDGET_MS,
      serviceUnavailable(corsOrigin),
      orchestration,
    );
  } catch (error) {
    apiLog.error(`[contact ${cid}] unhandled error`, error);
    return {
      status: 500,
      body: {
        success: false,
        message: "Internal server error. Please try again later.",
      },
      corsOrigin,
    };
  }
}
