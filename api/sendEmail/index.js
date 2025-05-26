const { Resend } = require("resend");

/**
 * Sanitizes HTML to prevent XSS attacks
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

/**
 * Azure Function API to handle contact form submissions
 */
module.exports = async function (context, req) {
  context.log("Processing contact form submission");
  
  try {
    // Check for required environment variables
    if (!process.env.RESEND_API_KEY) {
      throw new Error("Missing RESEND_API_KEY environment variable");
    }
    
    if (!process.env.EMAIL_TO) {
      throw new Error("Missing EMAIL_TO environment variable");
    }
    
    // Get request body
    const body = req.body || {};
    
    // Extract form data
    const { name, email, message, subject, company } = body;

    // Log request (excluding sensitive data)
    context.log("Form submission received", {
      hasName: Boolean(name),
      hasEmail: Boolean(email),
      hasMessage: Boolean(message),
      hasSubject: Boolean(subject),
      hasCompany: Boolean(company)
    });

    // Validate required fields
    if (!name || !email || !message) {
      return {
        status: 400,
        body: { 
          success: false,
          error: "Missing required fields",
          message: "Name, email, and message are required"
        }
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        status: 400,
        body: {
          success: false,
          error: "Invalid email format",
          message: "Please provide a valid email address"
        }
      };
    }

    // Initialize Resend with API key
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Format email content with sanitization
    const htmlContent = `
      <html>
        <body>
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${sanitizeHtml(name)}</p>
          <p><strong>Email:</strong> ${sanitizeHtml(email)}</p>
          ${company ? `<p><strong>Company:</strong> ${sanitizeHtml(company)}</p>` : ""}
          <p><strong>Message:</strong></p>
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

    // Test mode detection - use Resend's test email in non-production
    const isTestMode = process.env.RESEND_TEST_MODE === 'true';
    const emailTo = isTestMode ? 'onboarding@resend.dev' : process.env.EMAIL_TO;
    
    context.log(`Sending email to ${isTestMode ? 'test address' : emailTo}`);

    // Send email
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "no-reply@bridgingtrust.ai",
      to: emailTo,
      subject: subject ? `Contact Form: ${subject}` : `Contact Form: ${name}`,
      html: htmlContent,
      text: textContent,
      reply_to: email
    });

    if (error) {
      throw new Error(`Resend API error: ${error.message}`);
    }

    context.log("Email sent successfully", { id: data.id });
    
    return {
      status: 200,
      body: { 
        success: true, 
        message: "Your message has been sent successfully!",
        id: data.id 
      }
    };
  } catch (error) {
    context.log.error("Error sending email:", error);
    
    return {
      status: 500,
      body: {
        success: false,
        error: "Failed to send email",
        message: "There was a problem sending your message. Please try again later."
      }
    };
  }
};
