/**
 * SendContactForm - Azure Function to handle contact form submissions
 *
 * This production version handles form validation and sends emails
 * using the Resend API with comprehensive error handling and logging.
 *
 * @param {Object} context - Azure Functions context object
 * @param {Object} req - HTTP request object containing form data
 */
module.exports = async function (context, req) {
  context.log("Contact form submission received");

  // Check for required environment variables
  if (!process.env.RESEND_API_KEY) {
    context.log.error("Missing RESEND_API_KEY environment variable");
    return {
      status: 500,
      body: {
        success: false,
        error: "Server configuration error",
        message: "Missing email service configuration",
      },
    };
  }

  if (!process.env.EMAIL_FROM || !process.env.EMAIL_TO) {
    context.log.error("Missing EMAIL_FROM or EMAIL_TO environment variables");
    return {
      status: 500,
      body: {
        success: false,
        error: "Server configuration error",
        message: "Missing email address configuration",
      },
    };
  }

  // Validate request
  if (!req.body) {
    context.log.warn("Missing request body");
    return {
      status: 400,
      body: {
        success: false,
        error: "Invalid request",
        message: "Request body is required",
      },
    };
  }

  // Extract and validate form fields
  const { name, email, message, company } = req.body;

  if (!name || !email || !message) {
    context.log.warn("Missing required fields", {
      name: !!name,
      email: !!email,
      message: !!message,
    });
    return {
      status: 400,
      body: {
        success: false,
        error: "Missing required fields",
        message: "Name, email, and message are required",
      },
    };
  }

  // Simple email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    context.log.warn("Invalid email format", { email });
    return {
      status: 400,
      body: {
        success: false,
        error: "Invalid email",
        message: "Please provide a valid email address",
      },
    };
  }

  try {
    // Import Resend API client
    const { Resend } = require("resend");

    // Initialize Resend with API key
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Format email content
    const htmlContent = `
      <html>
        <body>
          <h1>New Contact Form Submission</h1>
          <p><strong>Name:</strong> ${sanitizeHtml(name)}</p>
          <p><strong>Email:</strong> ${sanitizeHtml(email)}</p>
          ${company ? `<p><strong>Company:</strong> ${sanitizeHtml(company)}</p>` : ""}
          <h2>Message:</h2>
          <p>${sanitizeHtml(message).replace(/\n/g, "<br>")}</p>
        </body>
      </html>
    `;

    const textContent = `
      New Contact Form Submission
      
      Name: ${name}
      Email: ${email}
      ${company ? `Company: ${company}\n` : ""}
      
      Message:
      ${message}
    `;

    // Send email using Resend
    const data = await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_TO,
      subject: `Contact Form: ${name}`,
      html: htmlContent,
      text: textContent,
      reply_to: email,
    });

    context.log.info("Email sent successfully", { id: data.id });

    // Return success response
    return {
      status: 200,
      body: {
        success: true,
        message: "Your message has been sent successfully",
      },
    };
  } catch (error) {
    // Log detailed error with Application Insights
    context.log.error("Error sending email", {
      error: error.message,
      stack: error.stack,
      name: name,
      email: email,
      company: company || "N/A",
    });

    // Return error response to client
    return {
      status: 500,
      body: {
        success: false,
        error: "Failed to send email",
        message:
          "There was a problem sending your message. Please try again later.",
      },
    };
  }
};

/**
 * Simple HTML sanitization to prevent XSS
 * @param {string} text - Text to sanitize
 * @returns {string} Sanitized text
 */
function sanitizeHtml(text) {
  if (!text) return "";
  return text
    .toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
