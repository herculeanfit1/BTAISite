import type { ContactFormData } from '../email';

export function generateAdminNotificationEmail(data: ContactFormData): string {
  const timestamp = new Date().toLocaleString('en-US', {
    timeZone: 'America/Chicago',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Contact Form Submission - Bridging Trust AI</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 700px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8fafc;
        }
        .container {
            background-color: white;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(90deg, #3A5F77 0%, #5B90B0 100%);
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
        .alert {
            background-color: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 20px;
            color: #92400e;
        }
        .contact-details {
            background-color: #f1f5f9;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .detail-row {
            display: flex;
            margin-bottom: 10px;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 8px;
        }
        .detail-row:last-child {
            border-bottom: none;
            margin-bottom: 0;
        }
        .detail-label {
            font-weight: 600;
            color: #374151;
            min-width: 120px;
            flex-shrink: 0;
        }
        .detail-value {
            color: #6b7280;
            flex-grow: 1;
        }
        .message-section {
            background-color: #f9fafb;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .message-title {
            font-weight: 600;
            color: #374151;
            margin-bottom: 15px;
            font-size: 16px;
        }
        .message-content {
            background-color: white;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            padding: 15px;
            color: #4b5563;
            white-space: pre-wrap;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .technical-info {
            background-color: #f3f4f6;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            font-size: 14px;
        }
        .technical-info h3 {
            margin-top: 0;
            margin-bottom: 10px;
            color: #374151;
            font-size: 16px;
        }
        .tech-detail {
            margin-bottom: 5px;
            color: #6b7280;
        }
        .actions {
            background-color: #ecfdf5;
            border: 1px solid #d1fae5;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .actions h3 {
            color: #065f46;
            margin-top: 0;
            margin-bottom: 15px;
        }
        .actions ul {
            color: #047857;
            margin: 0;
            padding-left: 20px;
        }
        .footer {
            text-align: center;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            color: #6b7280;
            font-size: 14px;
        }
        .priority-high {
            background-color: #fef2f2;
            border-color: #fecaca;
            color: #991b1b;
        }
        .btn {
            display: inline-block;
            background: linear-gradient(90deg, #3A5F77 0%, #5B90B0 100%);
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚨 New Contact Form Submission</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">Bridging Trust AI Website</p>
        </div>
        
        <div class="alert">
            <strong>⏰ Action Required:</strong> A new contact form submission has been received and requires follow-up.
        </div>
        
        <div class="contact-details">
            <h2 style="margin-top: 0; color: #374151;">Contact Information</h2>
            
            <div class="detail-row">
                <div class="detail-label">Name:</div>
                <div class="detail-value"><strong>${data.firstName} ${data.lastName}</strong></div>
            </div>
            
            <div class="detail-row">
                <div class="detail-label">Email:</div>
                <div class="detail-value"><a href="mailto:${data.email}" style="color: #3b82f6;">${data.email}</a></div>
            </div>
            
            ${data.company ? `
            <div class="detail-row">
                <div class="detail-label">Company:</div>
                <div class="detail-value"><strong>${data.company}</strong></div>
            </div>
            ` : ''}
            
            <div class="detail-row">
                <div class="detail-label">Submitted:</div>
                <div class="detail-value">${timestamp} (Central Time)</div>
            </div>
        </div>
        
        <div class="message-section">
            <div class="message-title">📝 Message Content</div>
            <div class="message-content">${data.message}</div>
        </div>
        
        <div class="actions">
            <h3>📋 Recommended Next Steps</h3>
            <ul>
                <li>Review the inquiry and assess the potential fit</li>
                <li>Respond within 24 hours to maintain professional standards</li>
                <li>Schedule a consultation call if the inquiry shows genuine interest</li>
                <li>Add contact information to CRM system</li>
            </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="mailto:${data.email}?subject=Re: Your inquiry to Bridging Trust AI&body=Dear ${data.firstName},%0D%0A%0D%0AThank you for reaching out to Bridging Trust AI..." class="btn">Reply to ${data.firstName}</a>
        </div>
        
        <div class="technical-info">
            <h3>🔧 Technical Details</h3>
            <div class="tech-detail"><strong>IP Address:</strong> ${data.ipAddress || 'Not available'}</div>
            <div class="tech-detail"><strong>User Agent:</strong> ${data.userAgent || 'Not available'}</div>
            <div class="tech-detail"><strong>Form Source:</strong> Contact page (bridgingtrust.ai)</div>
            <div class="tech-detail"><strong>Submission ID:</strong> ${Date.now()}-${Math.random().toString(36).substr(2, 9)}</div>
        </div>
        
        <div class="footer">
            <p>This email was automatically generated by the Bridging Trust AI contact form system.</p>
            <p>&copy; ${new Date().getFullYear()} Bridging Trust AI. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
  `.trim();
} 