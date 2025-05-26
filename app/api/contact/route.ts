/**
 * Contact Form API Route
 *
 * This API endpoint handles form submissions from the contact form.
 * It includes basic validation, spam protection, and would typically
 * connect to an email service or CRM in a production environment.
 */

// Make this file compatible with static exports by setting it to force-static instead of force-dynamic
// This is needed for Azure Static Web Apps

export const dynamic = "force-static";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withRateLimit } from "../../../lib/rate-limit";
import {
  isValidEmail,
  isValidName,
  isValidMessage,
} from "../../../lib/validation";

// Define schema for validation
const contactFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(100, { message: "Name must be less than 100 characters" })
    .regex(/^[a-zA-Z0-9\s\-'.]+$/, {
      message: "Name contains invalid characters",
    }),
  email: z
    .string()
    .email({ message: "Please enter a valid email address" })
    .max(100, { message: "Email must be less than 100 characters" }),
  message: z
    .string()
    .min(10, { message: "Message must be at least 10 characters" })
    .max(5000, { message: "Message must be less than 5000 characters" }),
  company: z
    .string()
    .max(100, { message: "Company name must be less than 100 characters" })
    .regex(/^[a-zA-Z0-9\s\-'.&]+$/, {
      message: "Company contains invalid characters",
    })
    .optional(),
  phone: z
    .string()
    .regex(/^[0-9+\-()\s.]+$/, {
      message: "Phone number contains invalid characters",
    })
    .max(20, { message: "Phone number must be less than 20 characters" })
    .optional(),
  recipient: z
    .string()
    .email({ message: "Recipient must be a valid email address" })
    .optional(),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

// Simple email regex for basic validation
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Honeypot field names to check (hidden fields that bots might fill)
const HONEYPOT_FIELDS = ["website", "url", "address", "fax"];

// Rate limiting parameters
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds
const MAX_REQUESTS_PER_WINDOW = 5; // Max submissions per hour

// Simple in-memory store for rate limiting
// In production, use Redis or another persistent store
const ipSubmissions: Record<string, number[]> = {};

async function handler(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get("x-forwarded-for") || "unknown";

    // Rate limiting check
    if (isRateLimited(ip)) {
      return NextResponse.json(
        {
          success: false,
          message: "Too many submissions, please try again later",
        },
        { status: 429 }
      );
    }

    // Get the request body and parse JSON
    const body = await request.json();

    // Bot detection - check if honeypot fields are filled
    for (const field of HONEYPOT_FIELDS) {
      if (body[field]) {
        // If honeypot field is filled, pretend success but don't process
        // This tricks bots into thinking the form was submitted
        console.log("Honeypot detected, ignoring submission");
        return NextResponse.json(
          {
            success: true,
            message:
              "Your message has been sent successfully. We will be in touch soon!",
          },
          { status: 200 }
        );
      }
    }

    // Validate the request body against our schema
    const result = contactFormSchema.safeParse(body);

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

    const { name, email, message, company, phone } = result.data;

    // Additional server-side validation
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: "Invalid email format" },
        { status: 400 }
      );
    }

    // Track submission for rate limiting
    trackSubmission(ip);

    // Sanitize data - convert to string and trim
    const sanitizedData = {
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      message: String(message).trim(),
      company: company ? String(company).trim() : undefined,
      phone: phone ? String(phone).trim() : undefined,
      recipient: "sales@bridgingtrust.ai", // Default recipient email
    };

    // Process the contact form submission
    // This would typically involve sending an email, storing in a database, etc.
    // For this example, we'll simulate success

    // Add artificial delay to simulate processing
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Log the form data (in a real app, you'd send emails or store in DB)
    console.log("Contact form submission:", sanitizedData);

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message:
          "Your message has been sent successfully. We will be in touch soon!",
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
    console.error("Contact form error:", error);

    // Return error response
    return NextResponse.json(
      {
        success: false,
        message:
          "There was an error processing your request. Please try again later.",
      },
      { status: 500 }
    );
  }
}

// Function to check if IP is rate limited
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const submissions = ipSubmissions[ip] || [];

  // Filter out submissions outside current window
  const recentSubmissions = submissions.filter(
    (time) => now - time < RATE_LIMIT_WINDOW
  );

  return recentSubmissions.length >= MAX_REQUESTS_PER_WINDOW;
}

// Function to track submission for rate limiting
function trackSubmission(ip: string): void {
  const now = Date.now();

  if (!ipSubmissions[ip]) {
    ipSubmissions[ip] = [];
  }

  // Add current submission time
  ipSubmissions[ip].push(now);

  // Clean up old submissions
  ipSubmissions[ip] = ipSubmissions[ip].filter(
    (time) => now - time < RATE_LIMIT_WINDOW
  );
}

// Apply rate limiting: 5 requests per minute
export const POST = withRateLimit(handler, {
  limit: 5,
  windowMs: 60 * 1000, // 1 minute
  message: "Too many contact form submissions. Please try again in a minute.",
});
