/**
 * Admin notification email template
 * Sent to admin team when a new contact form is submitted
 */

export interface AdminNotificationData {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  message: string;
  submittedAt: string;
  userAgent?: string;
  ipAddress?: string;
}

export const generateAdminNotificationEmail = (data: AdminNotificationData) => {
  const { name, email, company, phone, message, submittedAt, userAgent, ipAddress } = data;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Contact Form Submission - Bridging Trust AI</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
    .container { max-width: 700px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
    .header { background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); color: white; padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 700; }
    .header p { margin: 10px 0 0; opacity: 0.9; font-size: 14px; }
    .content { padding: 30px; }
    .contact-info { background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 8px; padding: 25px; margin: 20px 0; }
    .contact-info h3 { margin: 0 0 20px; color: #374151; font-size: 18px; border-bottom: 2px solid #6366f1; padding-bottom: 8px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px; }
    .info-item { }
    .info-label { font-weight: 600; color: #6b7280; font-size: 14px; margin-bottom: 4px; }
    .info-value { color: #374151; font-size: 16px; }
    .message-section { margin-top: 25px; }
    .message-content { background: white; border: 1px solid #d1d5db; border-radius: 6px; padding: 20px; margin-top: 10px; white-space: pre-wrap; font-family: inherit; }
    .metadata { background: #fafafa; border-radius: 6px; padding: 15px; margin: 20px 0; font-size: 13px; color: #6b7280; }
    .metadata h4 { margin: 0 0 10px; color: #374151; font-size: 14px; }
    .action-buttons { text-align: center; margin: 30px 0; }
    .btn { display: inline-block; padding: 12px 24px; margin: 0 10px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; }
    .btn-primary { background: #6366f1; color: white; }
    .btn-secondary { background: #f3f4f6; color: #374151; border: 1px solid #d1d5db; }
    .footer { background: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; }
    @media (max-width: 600px) { .info-grid { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚨 New Contact Form Submission</h1>
      <p>Someone has reached out through the website</p>
    </div>
    
    <div class="content">
      <div class="contact-info">
        <h3>Contact Information</h3>
        
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">Full Name</div>
            <div class="info-value">${name}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Email Address</div>
            <div class="info-value"><a href="mailto:${email}" style="color: #6366f1;">${email}</a></div>
          </div>
          ${company ? `
          <div class="info-item">
            <div class="info-label">Company</div>
            <div class="info-value">${company}</div>
          </div>` : ''}
          ${phone ? `
          <div class="info-item">
            <div class="info-label">Phone</div>
            <div class="info-value"><a href="tel:${phone}" style="color: #6366f1;">${phone}</a></div>
          </div>` : ''}
          <div class="info-item">
            <div class="info-label">Submitted</div>
            <div class="info-value">${submittedAt}</div>
          </div>
        </div>
        
        <div class="message-section">
          <div class="info-label">Message</div>
          <div class="message-content">${message}</div>
        </div>
      </div>
      
      <div class="action-buttons">
        <a href="mailto:${email}?subject=Re: Your inquiry to Bridging Trust AI&body=Hello ${name},%0D%0A%0D%0AThank you for reaching out to Bridging Trust AI. " class="btn btn-primary">Reply to ${name}</a>
        <a href="https://bridgingtrust.ai/admin/contacts" class="btn btn-secondary">View All Contacts</a>
      </div>
      
      ${userAgent || ipAddress ? `
      <div class="metadata">
        <h4>Technical Details</h4>
        ${ipAddress ? `<div><strong>IP Address:</strong> ${ipAddress}</div>` : ''}
        ${userAgent ? `<div><strong>User Agent:</strong> ${userAgent}</div>` : ''}
      </div>` : ''}
      
      <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 15px; margin: 20px 0;">
        <strong>⚡ Quick Actions:</strong>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>Respond within 24 hours for best customer experience</li>
          <li>Add to CRM if this is a qualified lead</li>
          <li>Schedule follow-up if consultation is needed</li>
        </ul>
      </div>
    </div>
    
    <div class="footer">
      <p>This notification was sent from the Bridging Trust AI contact form</p>
      <p>Manage notification settings in your admin dashboard</p>
    </div>
  </div>
</body>
</html>`;

  const text = `
🚨 NEW CONTACT FORM SUBMISSION - Bridging Trust AI

Contact Information:
Name: ${name}
Email: ${email}
${company ? `Company: ${company}` : ''}
${phone ? `Phone: ${phone}` : ''}
Submitted: ${submittedAt}

Message:
${message}

Quick Actions:
- Reply to ${email}
- Respond within 24 hours for best customer experience
- Add to CRM if this is a qualified lead
- Schedule follow-up if consultation is needed

${userAgent || ipAddress ? `
Technical Details:
${ipAddress ? `IP Address: ${ipAddress}` : ''}
${userAgent ? `User Agent: ${userAgent}` : ''}
` : ''}

This notification was sent from the Bridging Trust AI contact form.
`;

  return { html, text };
}; 