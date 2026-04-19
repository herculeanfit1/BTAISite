import { app, HttpRequest, HttpResponseInit } from "@azure/functions";
import { z } from "zod";
import { getClientIp, checkRateLimit } from "../lib/rate-limit.js";

const newsletterSchema = z.object({
  email: z
    .string()
    .email({ message: "Please provide a valid email address" })
    .max(100, { message: "Email must be less than 100 characters" }),
  name: z
    .string()
    .max(100, { message: "Name must be less than 100 characters" })
    .regex(/^[a-zA-Z0-9\s\-'.]+$/, {
      message: "Name contains invalid characters",
    })
    .optional(),
});

const HONEYPOT_FIELDS = ["website", "url", "address", "phone"];

async function handler(
  request: HttpRequest,
): Promise<HttpResponseInit> {
  try {
    const ip = getClientIp(request);

    const rateLimitResponse = checkRateLimit(ip, {
      limit: 3,
      windowMs: 60 * 1000,
      message: "Too many subscription attempts. Please try again in a minute.",
    });
    if (rateLimitResponse) return rateLimitResponse;

    const body = (await request.json()) as Record<string, unknown>;

    for (const field of HONEYPOT_FIELDS) {
      if (body[field]) {
        console.warn("Honeypot detected, ignoring newsletter submission");
        return {
          status: 200,
          jsonBody: {
            success: true,
            message:
              "You have been successfully subscribed to our newsletter!",
          },
        };
      }
    }

    const result = newsletterSchema.safeParse(body);
    if (!result.success) {
      return {
        status: 400,
        jsonBody: {
          success: false,
          message: "Validation failed",
          errors: result.error.format(),
        },
      };
    }

    const sanitizedData = {
      email: String(result.data.email).trim().toLowerCase(),
      name: result.data.name ? String(result.data.name).trim() : undefined,
    };

    console.log("Newsletter subscription:", sanitizedData);

    return {
      status: 200,
      jsonBody: {
        success: true,
        message: "You have been successfully subscribed to our newsletter!",
      },
      headers: {
        "Cache-Control":
          "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    };
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    return {
      status: 500,
      jsonBody: {
        error: "Something went wrong while processing your request",
      },
    };
  }
}

app.http("newsletter", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "newsletter",
  handler,
});
