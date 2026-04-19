import { app, HttpRequest, HttpResponseInit } from "@azure/functions";
import { z } from "zod";
import { sendContactEmail, type ContactFormData } from "../lib/email.js";
import { getClientIp } from "../lib/rate-limit.js";

const contactFormSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name too long"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name too long"),
  email: z.string().email("Invalid email address").max(100, "Email too long"),
  company: z.string().max(100, "Company name too long").optional(),
  interest: z
    .enum([
      "governance-assessment",
      "data-readiness",
      "copilot-readiness",
      "general",
      "",
    ])
    .optional(),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message too long"),
  _gotcha: z.string().optional(),
});

const ALLOWED_ORIGINS = [
  "https://bridgingtrust.ai",
  "https://www.bridgingtrust.ai",
];

function getCorsHeaders(request: HttpRequest): Record<string, string> {
  const origin = request.headers.get("origin") || "";

  const isAllowed =
    ALLOWED_ORIGINS.includes(origin) ||
    /^https:\/\/[a-z0-9-]+\.azurestaticapps\.net$/.test(origin);

  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
}

async function handler(
  request: HttpRequest,
): Promise<HttpResponseInit> {
  if (request.method === "OPTIONS") {
    return { status: 200, headers: getCorsHeaders(request) };
  }

  try {
    const ipAddress = getClientIp(request);
    const userAgent = request.headers.get("user-agent") || "unknown";

    const body = (await request.json()) as Record<string, unknown>;

    if (body._gotcha && String(body._gotcha).trim() !== "") {
      console.warn("Bot detected via honeypot field:", { ipAddress, userAgent });
      return {
        status: 400,
        jsonBody: { success: false, message: "Invalid submission" },
        headers: getCorsHeaders(request),
      };
    }

    const validationResult = contactFormSchema.safeParse(body);
    if (!validationResult.success) {
      return {
        status: 400,
        jsonBody: {
          success: false,
          message: "Validation failed",
          errors: validationResult.error.errors,
        },
        headers: getCorsHeaders(request),
      };
    }

    const formData: ContactFormData = {
      ...validationResult.data,
      ipAddress,
      userAgent,
    };

    const emailResult = await sendContactEmail(formData);

    if (emailResult.rateLimited) {
      return {
        status: 429,
        jsonBody: {
          success: false,
          message: "Too many requests. Please try again later.",
          rateLimited: true,
        },
        headers: getCorsHeaders(request),
      };
    }

    if (emailResult.circuitBreakerOpen) {
      return {
        status: 503,
        jsonBody: {
          success: false,
          message: "Service temporarily unavailable. Please try again later.",
          serviceUnavailable: true,
        },
        headers: getCorsHeaders(request),
      };
    }

    if (!emailResult.success) {
      console.error("Email sending failed:", emailResult.message);
      return {
        status: 500,
        jsonBody: {
          success: false,
          message: "Failed to send email. Please try again later.",
        },
        headers: getCorsHeaders(request),
      };
    }

    console.log("Contact form submission successful:", {
      name: `${formData.firstName} ${formData.lastName}`,
      email: formData.email,
      company: formData.company,
      ipAddress,
    });

    return {
      status: 200,
      jsonBody: {
        success: true,
        message: "Thank you for your message! We'll get back to you soon.",
      },
      headers: getCorsHeaders(request),
    };
  } catch (error) {
    console.error("Contact API error:", error);
    return {
      status: 500,
      jsonBody: {
        success: false,
        message: "Internal server error. Please try again later.",
      },
      headers: getCorsHeaders(request),
    };
  }
}

app.http("contact", {
  methods: ["POST", "OPTIONS"],
  authLevel: "anonymous",
  route: "contact",
  handler,
});
