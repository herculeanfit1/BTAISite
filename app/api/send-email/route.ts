/**
 * Send Email API Route
 *
 * This API endpoint forwards contact form submissions to the Azure Function App
 * that handles email sending. It acts as a bridge between the frontend form
 * and the email service.
 */

// Make this file compatible with static exports by setting it to force-static
export const dynamic = "force-static";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Environment variables for Azure Function
const AZURE_FUNCTION_URL =
  process.env.AZURE_FUNCTION_URL ||
  "https://btai-email-relay.azurewebsites.net/api/SendContactForm";
const AZURE_FUNCTION_KEY = process.env.AZURE_FUNCTION_KEY;

// Define schema for validation
const contactFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(100, { message: "Name must be less than 100 characters" }),
  email: z
    .string()
    .email({ message: "Please enter a valid email address" })
    .max(100, { message: "Email must be less than 100 characters" }),
  message: z
    .string()
    .min(10, { message: "Message must be at least 10 characters" })
    .max(5000, { message: "Message must be less than 5000 characters" }),
  subject: z
    .string()
    .max(200, { message: "Subject must be less than 200 characters" })
    .optional(),
  company: z
    .string()
    .max(100, { message: "Company name must be less than 100 characters" })
    .optional(),
});

/**
 * Logs information about the request and any errors
 * @param message Log message
 * @param data Additional data to log
 * @param isError Whether this is an error log
 */
function logMessage(
  message: string,
  data?: Record<string, unknown>,
  isError = false
) {
  // In production, this function would log to a proper logging service
  // For now, we'll use console.error only for errors to assist with debugging
  if (isError) {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] [send-email] ${message}`, data || "");
  }
  // Non-error logs are suppressed to reduce console noise
}

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();

  try {
    logMessage(`Processing request ${requestId}`);

    // Get the request body
    const body = await request.json();

    // Safe access to body properties
    const requestData = {
      hasName: Boolean(body?.name),
      hasEmail: Boolean(body?.email),
      hasMessage: Boolean(body?.message),
      hasSubject: Boolean(body?.subject),
      hasCompany: Boolean(body?.company),
      requestHeaders: Object.fromEntries(request.headers),
    };

    // Log request (excluding sensitive data)
    logMessage(`Request ${requestId} payload received`, requestData);

    // Validate the request body
    const result = contactFormSchema.safeParse(body);

    if (!result.success) {
      // Log validation errors
      logMessage(
        `Request ${requestId} validation failed`,
        result.error.format(),
        true
      );

      // Return validation errors
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: result.error.format(),
          requestId,
        },
        { status: 400 }
      );
    }

    // Prepare data for Azure Function
    const { name, email, message, subject, company } = result.data;

    // Check if Azure Function key is available
    if (!AZURE_FUNCTION_KEY) {
      logMessage(
        `Request ${requestId} failed: Missing Azure Function Key`,
        {},
        true
      );
      return NextResponse.json(
        {
          success: false,
          error: "Configuration error",
          message:
            "The server is not properly configured to send emails. Please try again later or contact support.",
          requestId,
        },
        { status: 500 }
      );
    }

    // Construct the Azure Function URL with key
    const functionUrl = `${AZURE_FUNCTION_URL}?code=${AZURE_FUNCTION_KEY}`;

    logMessage(`Request ${requestId} forwarding to Azure Function`);

    // Forward the request to Azure Function
    const response = await fetch(functionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Request-ID": requestId,
      },
      body: JSON.stringify({
        name,
        email,
        message,
        subject,
        company,
      }),
    });

    // Log function response status
    logMessage(
      `Request ${requestId} Azure Function response status: ${response.status}`
    );

    // Check if response is ok
    if (!response.ok) {
      logMessage(
        `Request ${requestId} Azure Function returned error status: ${response.status}`,
        {
          statusText: response.statusText,
        },
        true
      );
    }

    // Get the response from Azure Function
    const functionResponse = await response.json();

    // Log success/failure (without sensitive details)
    logMessage(
      `Request ${requestId} completed with status: ${response.status}`,
      {
        success: functionResponse.success,
        statusCode: response.status,
      }
    );

    // Return the Azure Function response
    return NextResponse.json(
      {
        ...functionResponse,
        requestId,
      },
      {
        status: response.status,
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
          "X-Request-ID": requestId,
        },
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    // Log detailed error information
    logMessage(
      `Request ${requestId} failed with error: ${errorMessage}`,
      {
        error: errorMessage,
        stack: errorStack,
      },
      true
    );

    // Return error response
    return NextResponse.json(
      {
        success: false,
        error: "Failed to send message",
        message:
          "There was an error processing your request. Please try again later.",
        requestId,
      },
      {
        status: 500,
        headers: {
          "X-Request-ID": requestId,
        },
      }
    );
  }
}
