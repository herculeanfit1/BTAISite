// The ONLY file in the app permitted to import `resend` (plan A2, enforced by
// __tests__/api/resend-import-guard.test.ts). Keep all Resend types and SDK
// usage behind the EmailProvider seam here.
import { Resend } from "resend";
import type { EmailMessage, EmailProvider } from "./provider";

let client: Resend | null = null;

function getClient(): Resend {
  if (!client) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("Missing required environment variable: RESEND_API_KEY");
    }
    client = new Resend(apiKey);
  }
  return client;
}

const resendProvider: EmailProvider = {
  async send(message: EmailMessage): Promise<{ id: string }> {
    const { data, error } = await getClient().emails.send({
      from: message.from,
      to: message.to,
      cc: message.cc,
      replyTo: message.replyTo,
      subject: message.subject,
      html: message.html,
    });
    // The Resend SDK returns API errors in `error` rather than throwing. The
    // original Functions code awaited send() without checking this and reported
    // success even when a send was rejected — a silent lead-loss path. Surfacing
    // it lets the circuit breaker and the 500 path in send-contact-email engage.
    if (error) {
      throw new Error(`Resend send failed: ${error.message ?? String(error)}`);
    }
    return { id: data?.id ?? "unknown" };
  },
};

export function getResendProvider(): EmailProvider {
  return resendProvider;
}
