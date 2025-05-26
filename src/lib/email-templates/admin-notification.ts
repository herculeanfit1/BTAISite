/**
 * Admin notification email template
 * Sent to admin team when a new contact form is submitted
 */

export interface AdminNotificationData {
  name: string;
  email: string;
  company?: string;
  message: string;
  ip?: string;
  userAgent?: string;
  timestamp: string;
}

export const generateAdminNotificationEmail = (data: AdminNotificationData) => {
  const { name, email, company, message, ip, userAgent, timestamp } = data;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Contact Form Submission - Bridging Trust AI</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 700px;
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
      background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
      color: white;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      margin-bottom: 30px;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .alert-badge {
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #dc2626;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      display: inline-block;
      margin-bottom: 20px;
    }
    .contact-details {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 25px;
      margin: 20px 0;
    }
    .contact-details h3 {
      margin-top: 0;
      color: #1e40af;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 10px;
    }
    .detail-row {
      display: flex;
      margin: 12px 0;
      align-items: flex-start;
    }
    .detail-label {
      font-weight: 600;
      color: #374151;
      min-width: 100px;
      margin-right: 15px;
    }
    .detail-value {
      flex: 1;
      word-break: break-word;
    }
    .message-content {
      background: #fefefe;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      padding: 20px;
      margin: 15px 0;
      font-family: 'Courier New', monospace;
      white-space: pre-wrap;
      line-height: 1.5;
    }
    .technical-info {
      background: #f3f4f6;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
      font-size: 14px;
    }
    .technical-info h4 {
      margin-top: 0;
      color: #6b7280;
    }
    .action-buttons {
      text-align: center;
      margin: 30px 0;
    }
    .button {
      display: inline-block;
      background: #3b82f6;
      color: white;
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 6px;
      margin: 0 10px;
      font-weight: 500;
    }
    .button.reply {
      background: #059669;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
      text-align: center;
      color: #6b7280;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚨 New Contact Form Submission</h1>
      <p>Bridging Trust AI Website</p>
    </div>

    <div class="alert-badge">
      NEW INQUIRY • ${timestamp}
    </div>

    <div class="contact-details">
      <h3>Contact Information</h3>
      <div class="detail-row">
        <span class="detail-label">Name:</span>
        <span class="detail-value"><strong>${name}</strong></span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Email:</span>
        <span class="detail-value"><a href="mailto:${email}" style="color: #3b82f6;">${email}</a></span>
      </div>
      ${company ? `
      <div class="detail-row">
        <span class="detail-label">Company:</span>
        <span class="detail-value"><strong>${company}</strong></span>
      </div>
      ` : ''}
      <div class="detail-row">
        <span class="detail-label">Submitted:</span>
        <span class="detail-value">${timestamp}</span>
      </div>
    </div>

    <div class="contact-details">
      <h3>Message Content</h3>
      <div class="message-content">${message}</div>
    </div>

    ${ip || userAgent ? `
    <div class="technical-info">
      <h4>Technical Details</h4>
      ${ip ? `<p><strong>IP Address:</strong> ${ip}</p>` : ''}
      ${userAgent ? `<p><strong>User Agent:</strong> ${userAgent}</p>` : ''}
    </div>
    ` : ''}

    <div class="action-buttons">
      <a href="mailto:${email}?subject=Re: Your inquiry to Bridging Trust AI&body=Hi ${name},%0D%0A%0D%0AThank you for reaching out to Bridging Trust AI. " class="button reply">Reply to ${name}</a>
      <a href="https://bridgingtrust.ai/admin" class="button">Admin Dashboard</a>
    </div>

    <div class="footer">
      <p><strong>Bridging Trust AI</strong> - Admin Notification System</p>
      <p>This email was automatically generated from the contact form on bridgingtrust.ai</p>
    </div>
  </div>
</body>
</html>`;

  const text = `
🚨 NEW CONTACT FORM SUBMISSION - Bridging Trust AI

Contact Information:
- Name: ${name}
- Email: ${email}
${company ? `- Company: ${company}` : ''}
- Submitted: ${timestamp}

Message:
"${message}"

${ip || userAgent ? `
Technical Details:
${ip ? `- IP Address: ${ip}` : ''}
${userAgent ? `- User Agent: ${userAgent}` : ''}
` : ''}

Reply to this inquiry: mailto:${email}

---
This email was automatically generated from the contact form on bridgingtrust.ai
`;

  return { html, text };
}; 