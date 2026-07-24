// Contact-email orchestration: rate limit + circuit breaker + the two sends,
// all wrapping the EmailProvider seam (not the concrete provider — plan A2).
// Ported from api/src/lib/email.ts with the Resend coupling replaced by the seam.
import { getEmailProvider, isEmailTestMode } from "./provider";
import { generateConfirmationEmail } from "./templates/contact-confirmation";
import { generateAdminNotificationEmail } from "./templates/admin-notification";

// In-memory rate limiting + circuit breaker. Best-effort and single-instance
// (plan Q3 parity — the honeypot is the real spam defence); both reset on a
// managed-backend restart, exactly as the Flex Consumption version did.
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const circuitBreakerState = { failures: 0, lastFailureTime: 0, isOpen: false };

const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX_REQUESTS = 5;
const CIRCUIT_BREAKER_THRESHOLD = 5;
const CIRCUIT_BREAKER_TIMEOUT = 5 * 60 * 1000; // 5 minutes

export interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  company?: string;
  interest?: string;
  message: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface EmailResult {
  success: boolean;
  message: string;
  rateLimited?: boolean;
  circuitBreakerOpen?: boolean;
}

export function checkRateLimit(ipAddress: string): boolean {
  const now = Date.now();
  const key = `rate_limit_${ipAddress}`;
  const existing = rateLimitStore.get(key);

  if (!existing || now > existing.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (existing.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  existing.count++;
  return true;
}

function checkCircuitBreaker(): boolean {
  const now = Date.now();

  if (circuitBreakerState.isOpen) {
    if (now - circuitBreakerState.lastFailureTime > CIRCUIT_BREAKER_TIMEOUT) {
      circuitBreakerState.isOpen = false;
      circuitBreakerState.failures = 0;
    } else {
      return false;
    }
  }

  return true;
}

function recordFailure() {
  circuitBreakerState.failures++;
  circuitBreakerState.lastFailureTime = Date.now();

  if (circuitBreakerState.failures >= CIRCUIT_BREAKER_THRESHOLD) {
    circuitBreakerState.isOpen = true;
  }
}

function recordSuccess() {
  circuitBreakerState.failures = 0;
}

/** True when the email provider is configured for real sends (or in test mode). */
export function isEmailConfigured(): boolean {
  return isEmailTestMode() || Boolean(process.env.RESEND_API_KEY);
}

export async function sendContactEmail(
  data: ContactFormData,
): Promise<EmailResult> {
  try {
    if (data.ipAddress && !checkRateLimit(data.ipAddress)) {
      return {
        success: false,
        message: "Rate limit exceeded. Please try again later.",
        rateLimited: true,
      };
    }

    if (!checkCircuitBreaker()) {
      return {
        success: false,
        message: "Email service temporarily unavailable. Please try again later.",
        circuitBreakerOpen: true,
      };
    }

    // Preview safety (plan §5.2): Key Vault references do not resolve in preview
    // environments, so RESEND_API_KEY is absent there. Surface the existing 503
    // "service unavailable" shape rather than throwing — validation and the
    // honeypot still work in previews; real sends happen only in production.
    if (!isEmailConfigured()) {
      return {
        success: false,
        message: "Email service temporarily unavailable. Please try again later.",
        circuitBreakerOpen: true,
      };
    }

    const provider = getEmailProvider();
    const emailFrom = process.env.EMAIL_FROM || "hello@bridgingtrust.ai";
    const emailTo = process.env.EMAIL_TO || "sales@bridgingtrust.ai";
    const emailAdmin = process.env.EMAIL_ADMIN || "terence@bridgingtrust.ai";
    const emailReplyTo = process.env.EMAIL_REPLY_TO || "sales@bridgingtrust.ai";

    await provider.send({
      from: emailFrom,
      to: data.email,
      replyTo: emailReplyTo,
      subject: "Thank you for contacting Bridging Trust AI",
      html: generateConfirmationEmail(data),
    });

    await provider.send({
      from: emailFrom,
      to: emailTo,
      cc: emailAdmin,
      replyTo: emailReplyTo,
      subject: `New Contact Form Submission from ${data.firstName} ${data.lastName}`,
      html: generateAdminNotificationEmail(data),
    });

    recordSuccess();
    return { success: true, message: "Emails sent successfully" };
  } catch (error) {
    console.error("Email sending failed:", error);
    recordFailure();
    return {
      success: false,
      message: "Failed to send email. Please try again later.",
    };
  }
}
