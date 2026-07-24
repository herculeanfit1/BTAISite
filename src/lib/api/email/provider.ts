// EmailProvider seam (plan A2). The neutral interface + factory below are the
// ONLY email API the rest of the app sees; the concrete Resend implementation is
// isolated in resend-provider.ts (the only file that imports `resend`), enforced
// by __tests__/api/resend-import-guard.test.ts. Swapping providers
// (Postmark/SES/Microsoft Graph) later = one new *-provider.ts + one secret + a
// factory case; nothing else moves. The circuit breaker and email rate limit
// wrap this seam (in send-contact-email.ts), not the provider.
import { getResendProvider } from "./resend-provider";
import { apiLog } from "../log";

export interface EmailMessage {
  from: string;
  to: string | string[];
  cc?: string | string[];
  replyTo?: string;
  subject: string;
  html: string;
}

export interface EmailProvider {
  /** Send one message. Throws on failure. */
  send(message: EmailMessage): Promise<{ id: string }>;
}

/**
 * Test mode lives at the seam so it survives any future provider swap. The
 * preferred flag is EMAIL_TEST_MODE; the legacy RESEND_TEST_MODE is still
 * honoured for back-compat (A2).
 */
export function isEmailTestMode(): boolean {
  return (
    process.env.EMAIL_TEST_MODE === "true" ||
    process.env.RESEND_TEST_MODE === "true"
  );
}

const loggingNoopProvider: EmailProvider = {
  async send(message: EmailMessage): Promise<{ id: string }> {
    apiLog.info("[email:test-mode] would send", {
      to: message.to,
      from: message.from,
      subject: message.subject,
    });
    return { id: "test-mode" };
  },
};

export function getEmailProvider(): EmailProvider {
  if (isEmailTestMode()) return loggingNoopProvider;
  return getResendProvider();
}
