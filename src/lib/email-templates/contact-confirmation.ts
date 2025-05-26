/**
 * Contact form confirmation email template
 * Sent to users who submit the contact form
 */

export interface ContactConfirmationData {
  name: string;
  email: string;
  company?: string;
  message: string;
  submittedAt: string;
}

export const generateContactConfirmationEmail = (data: ContactConfirmationData) => {
  const { name, email, company, message, submittedAt } = data;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thank you for contacting Bridging Trust AI</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
    .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 40px 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
    .header p { margin: 10px 0 0; opacity: 0.9; font-size: 16px; }
    .content { padding: 40px 30px; }
    .message-box { background: #f1f5f9; border-left: 4px solid #6366f1; padding: 20px; margin: 20px 0; border-radius: 4px; }
    .details { background: #fafafa; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .details h3 { margin: 0 0 15px; color: #374151; font-size: 18px; }
    .detail-row { margin: 10px 0; }
    .detail-label { font-weight: 600; color: #6b7280; }
    .footer { background: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb; }
    .footer p { margin: 5px 0; color: #6b7280; font-size: 14px; }
    .cta-button { display: inline-block; background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
    .cta-button:hover { background: #5856eb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Thank You, ${name}!</h1>
      <p>We've received your message and will get back to you soon</p>
    </div>
    
    <div class="content">
      <p>Hello ${name},</p>
      
      <p>Thank you for reaching out to Bridging Trust AI. We've successfully received your message and our team will review it carefully.</p>
      
      <div class="message-box">
        <strong>What happens next?</strong>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>Our team will review your inquiry within 24 hours</li>
          <li>We'll respond with relevant information and next steps</li>
          <li>If needed, we'll schedule a consultation call</li>
        </ul>
      </div>
      
      <div class="details">
        <h3>Your Submission Details</h3>
        <div class="detail-row">
          <span class="detail-label">Name:</span> ${name}
        </div>
        <div class="detail-row">
          <span class="detail-label">Email:</span> ${email}
        </div>
        ${company ? `<div class="detail-row"><span class="detail-label">Company:</span> ${company}</div>` : ''}
        <div class="detail-row">
          <span class="detail-label">Submitted:</span> ${submittedAt}
        </div>
        <div class="detail-row" style="margin-top: 15px;">
          <span class="detail-label">Message:</span><br>
          <div style="margin-top: 8px; padding: 12px; background: white; border-radius: 4px; border: 1px solid #e5e7eb;">
            ${message.replace(/\n/g, '<br>')}
          </div>
        </div>
      </div>
      
      <p>In the meantime, feel free to explore our resources:</p>
      
      <a href="https://bridgingtrust.ai/services" class="cta-button">Explore Our Services</a>
      
      <p>If you have any urgent questions, please don't hesitate to contact us directly at <a href="mailto:support@bridgingtrust.ai">support@bridgingtrust.ai</a>.</p>
      
      <p>Best regards,<br>
      <strong>The Bridging Trust AI Team</strong></p>
    </div>
    
    <div class="footer">
      <p><strong>Bridging Trust AI</strong></p>
      <p>Empowering organizations with trustworthy AI solutions</p>
      <p>
        <a href="https://bridgingtrust.ai" style="color: #6366f1; text-decoration: none;">bridgingtrust.ai</a> | 
        <a href="mailto:support@bridgingtrust.ai" style="color: #6366f1; text-decoration: none;">support@bridgingtrust.ai</a>
      </p>
    </div>
  </div>
</body>
</html>`;

  const text = `
Thank You, ${name}!

We've received your message and will get back to you soon.

Hello ${name},

Thank you for reaching out to Bridging Trust AI. We've successfully received your message and our team will review it carefully.

What happens next?
- Our team will review your inquiry within 24 hours
- We'll respond with relevant information and next steps
- If needed, we'll schedule a consultation call

Your Submission Details:
Name: ${name}
Email: ${email}
${company ? `Company: ${company}` : ''}
Submitted: ${submittedAt}

Message:
${message}

In the meantime, feel free to explore our services at https://bridgingtrust.ai/services

If you have any urgent questions, please contact us at support@bridgingtrust.ai

Best regards,
The Bridging Trust AI Team

Bridging Trust AI
Empowering organizations with trustworthy AI solutions
bridgingtrust.ai | support@bridgingtrust.ai
`;

  return { html, text };
}; 