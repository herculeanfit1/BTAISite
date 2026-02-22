import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { withRateLimit } from "../../../lib/rate-limit";
import { z } from "zod";
import { logger } from "../../../lib/logger";

// Define schema for validation
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

// Honeypot field names to check (hidden fields that bots might fill)
const HONEYPOT_FIELDS = ["website", "url", "address", "phone"];

// Make this file compatible with static exports by setting it to force-static instead of force-dynamic
// This is needed for Azure Static Web Apps

export const dynamic = "force-static";

async function handler(request: NextRequest) {
  try {
    // Parse the request body as JSON
    const body = await request.json();

    // Bot detection - check if honeypot fields are filled
    for (const field of HONEYPOT_FIELDS) {
      // eslint-disable-next-line security/detect-object-injection -- field is from hardcoded HONEYPOT_FIELDS array
      if (body[field]) {
        // If honeypot field is filled, pretend success but don't process
        logger.warn("Honeypot detected, ignoring newsletter submission");
        return NextResponse.json(
          {
            success: true,
            message: "You have been successfully subscribed to our newsletter!",
          },
          { status: 200 }
        );
      }
    }

    // Validate the request body against our schema
    const result = newsletterSchema.safeParse(body);

    if (!result.success) {
      // Return validation errors
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: result.error.format(),
        },
        { status: 400 }
      );
    }

    const { email, name } = result.data;

    // Sanitize data - convert to string, trim, and lowercase email
    const sanitizedData = {
      email: String(email).trim().toLowerCase(),
      name: name ? String(name).trim() : undefined,
    };

    // TODO: In production, implement actual email list subscription
    // For now, we'll just log the information and return a success response
    logger.info("Newsletter subscription:", sanitizedData);

    // In a real implementation, you would:
    // 1. Add the email to your newsletter service (e.g., Mailchimp, ConvertKit)
    // 2. Store the subscription in a database if needed
    // 3. Handle any errors from the newsletter service

    // Simulate success with a 100ms delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: "You have been successfully subscribed to our newsletter!",
      },
      {
        status: 200,
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (error) {
    console.error("Newsletter subscription error:", error);

    return NextResponse.json(
      { error: "Something went wrong while processing your request" },
      { status: 500 }
    );
  }
}

// Apply rate limiting: 3 requests per minute per IP
export const POST = withRateLimit(handler, {
  limit: 3,
  windowMs: 60 * 1000, // 1 minute
  message: "Too many subscription attempts. Please try again in a minute.",
});
