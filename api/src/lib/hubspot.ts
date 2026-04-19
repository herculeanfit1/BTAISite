const BASE = "https://api.hubapi.com";
const TIMEOUT = 10_000;

interface ContactSubmission {
  firstName: string;
  lastName: string;
  email: string;
  company?: string;
  message: string;
  interest?: string;
  submissionIp?: string;
  submissionUrl?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

type HubSpotUpsertResult =
  | { success: true; contactId: string }
  | { success: false; error: string };

export const INTEREST_TO_INQUIRY_TOPIC: Record<string, string> = {
  "governance-assessment": "ai_governance_readiness",
  "data-readiness": "data_governance_ai",
  "copilot-readiness": "microsoft_ai_enablement",
  "general": "general_inquiry",
};

type Logger = (msg: string, meta?: object) => void;

async function hubspotFetch(
  method: string,
  path: string,
  token: string,
  body?: unknown,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT);
  try {
    return await fetch(`${BASE}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

function buildProperties(
  sub: ContactSubmission,
  includeInitialMessage: boolean,
): Record<string, string> {
  const topic =
    sub.interest && sub.interest !== ""
      ? INTEREST_TO_INQUIRY_TOPIC[sub.interest] ?? "general_inquiry"
      : undefined;

  if (sub.interest && sub.interest !== "" && !INTEREST_TO_INQUIRY_TOPIC[sub.interest]) {
    console.warn(`hubspot: unmapped interest value "${sub.interest}", defaulting to general_inquiry`);
  }

  const props: Record<string, string> = {
    email: sub.email,
    firstname: sub.firstName,
    lastname: sub.lastName,
    website_source: "btai",
    lead_priority: "p2_warm",
  };

  if (sub.company) props.company = sub.company;
  if (topic) props.inquiry_topic = topic;
  if (includeInitialMessage) props.initial_message = sub.message;
  if (sub.submissionUrl) props.submission_url = sub.submissionUrl;
  if (sub.submissionIp) props.submission_ip = sub.submissionIp;
  if (sub.utmSource) props.utm_source = sub.utmSource;
  if (sub.utmMedium) props.utm_medium = sub.utmMedium;
  if (sub.utmCampaign) props.utm_campaign = sub.utmCampaign;

  return props;
}

async function createNote(
  contactId: string,
  message: string,
  token: string,
  log: Logger,
): Promise<void> {
  const date = new Date().toISOString().slice(0, 10);
  const body = {
    properties: {
      hs_timestamp: new Date().toISOString(),
      hs_note_body: `<strong>Initial inquiry submitted via contact form (${date})</strong><hr><p>${message}</p>`,
    },
    associations: [
      {
        to: { id: contactId },
        types: [
          {
            associationCategory: "HUBSPOT_DEFINED",
            associationTypeId: 202,
          },
        ],
      },
    ],
  };

  const res = await hubspotFetch("POST", "/crm/v3/objects/notes", token, body);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    log("hubspot.note.failed", { status: res.status, body: text });
  }
}

async function findContactByEmail(
  email: string,
  token: string,
): Promise<string | null> {
  const res = await hubspotFetch(
    "POST",
    "/crm/v3/objects/contacts/search",
    token,
    {
      filterGroups: [
        {
          filters: [
            { propertyName: "email", operator: "EQ", value: email },
          ],
        },
      ],
    },
  );

  if (!res.ok) return null;

  const data = (await res.json()) as { results?: { id: string }[] };
  return data.results?.[0]?.id ?? null;
}

export async function upsertContactAndLogInquiry(
  submission: ContactSubmission,
  log: Logger,
): Promise<HubSpotUpsertResult> {
  const token = process.env.HUBSPOT_TOKEN;
  if (!token) {
    log("hubspot.token.missing");
    return { success: false, error: "missing token" };
  }

  let contactId: string;

  try {
    // Try create first (includes initial_message)
    const createRes = await hubspotFetch(
      "POST",
      "/crm/v3/objects/contacts",
      token,
      { properties: buildProperties(submission, true) },
    );

    if (createRes.status === 201) {
      const created = (await createRes.json()) as { id: string };
      contactId = created.id;
      log("hubspot.contact.created", { contactId });
    } else if (createRes.status === 409) {
      // Contact exists — search and update (without initial_message)
      const existingId = await findContactByEmail(submission.email, token);
      if (!existingId) {
        return { success: false, error: "409 conflict but contact not found by email search" };
      }

      const patchRes = await hubspotFetch(
        "PATCH",
        `/crm/v3/objects/contacts/${existingId}`,
        token,
        { properties: buildProperties(submission, false) },
      );

      if (!patchRes.ok) {
        const text = await patchRes.text().catch(() => "");
        log("hubspot.contact.patch.failed", { status: patchRes.status, body: text });
        return { success: false, error: `patch failed (${patchRes.status})` };
      }

      contactId = existingId;
      log("hubspot.contact.updated", { contactId });
    } else {
      const text = await createRes.text().catch(() => "");
      log("hubspot.contact.create.failed", { status: createRes.status, body: text });
      return { success: false, error: `create failed (${createRes.status})` };
    }

    // Create note engagement
    await createNote(contactId, submission.message, token, log);

    return { success: true, contactId };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    log("hubspot.exception", { error: message });
    return { success: false, error: message };
  }
}
