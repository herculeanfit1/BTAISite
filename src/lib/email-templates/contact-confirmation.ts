/**
 * Contact form confirmation email template
 * Sent to users who submit the contact form
 */

export interface ContactConfirmationData {
  name: string;
  email: string;
  company?: string;
  message: string;
}

export const generateContactConfirmationEmail = (data: ContactConfirmationData) => {
  const { name, email, company, message } = data;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thank you for contacting Bridging Trust AI</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f8fafc;
    }
    .container {
      background: white;
      border-radius: 12px;
      padding: 40px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #e2e8f0;
    }
    .logo {
      font-size: 24px;
      font-weight: bold;
      color: #1e40af;
      margin-bottom: 10px;
    }
    .tagline {
      color: #64748b;
      font-size: 14px;
    }
    h1 {
      color: #1e293b;
      margin-bottom: 20px;
      font-size: 28px;
    }
    .message-box {
      background: #f1f5f9;
      border-left: 4px solid #3b82f6;
      padding: 20px;
      margin: 20px 0;
      border-radius: 0 8px 8px 0;
    }
    .message-box h3 {
      margin-top: 0;
      color: #1e40af;
    }
    .contact-info {
      background: #fef3c7;
      border: 1px solid #f59e0b;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }
    .contact-info h3 {
      margin-top: 0;
      color: #92400e;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
      text-align: center;
      color: #64748b;
      font-size: 14px;
    }
    .button {
      display: inline-block;
      background: #3b82f6;
      color: white;
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 6px;
      margin: 20px 0;
      font-weight: 500;
    }
    .social-links {
      margin: 20px 0;
    }
    .social-links a {
      color: #3b82f6;
      text-decoration: none;
      margin: 0 10px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Bridging Trust AI</div>
      <div class="tagline">Building Trust Through Transparent AI</div>
    </div>

    <h1>Thank you for reaching out, ${name}!</h1>

    <p>We've received your message and appreciate you taking the time to contact us. Our team will review your inquiry and get back to you within 24-48 hours.</p>

    <div class="message-box">
      <h3>Your Message Summary:</h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      ${company ? `<p><strong>Company:</strong> ${company}</p>` : ''}
      <p><strong>Message:</strong></p>
      <p style="font-style: italic; margin-left: 20px;">"${message}"</p>
    </div>

    <div class="contact-info">
      <h3>Need immediate assistance?</h3>
      <p>If your inquiry is urgent, you can reach us directly at:</p>
      <p>📧 <strong>support@bridgingtrust.ai</strong></p>
      <p>🌐 <strong>bridgingtrust.ai</strong></p>
    </div>

    <p>In the meantime, feel free to explore our website to learn more about how we're building trust through transparent AI solutions.</p>

    <div style="text-align: center;">
      <a href="https://bridgingtrust.ai" class="button">Visit Our Website</a>
    </div>

    <div class="social-links" style="text-align: center;">
      <a href="https://bridgingtrust.ai/about">About Us</a>
      <a href="https://bridgingtrust.ai/services">Services</a>
      <a href="https://bridgingtrust.ai/contact">Contact</a>
    </div>

    <div class="footer">
      <p>Best regards,<br>The Bridging Trust AI Team</p>
      <p style="margin-top: 20px; font-size: 12px;">
        This email was sent because you contacted us through our website. 
        If you didn't expect this email, please contact us at support@bridgingtrust.ai
      </p>
    </div>
  </div>
</body>
</html>`;

  const text = `
Thank you for contacting Bridging Trust AI, ${name}!

We've received your message and appreciate you taking the time to contact us. Our team will review your inquiry and get back to you within 24-48 hours.

Your Message Summary:
- Name: ${name}
- Email: ${email}
${company ? `- Company: ${company}` : ''}
- Message: "${message}"

Need immediate assistance?
If your inquiry is urgent, you can reach us directly at:
📧 support@bridgingtrust.ai
🌐 bridgingtrust.ai

In the meantime, feel free to explore our website to learn more about how we're building trust through transparent AI solutions.

Visit our website: https://bridgingtrust.ai

Best regards,
The Bridging Trust AI Team

---
This email was sent because you contacted us through our website. 
If you didn't expect this email, please contact us at support@bridgingtrust.ai
`;

  return { html, text };
}; 