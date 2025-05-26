import type { ContactFormData } from '../email';

export function generateConfirmationEmail(data: ContactFormData): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thank you for contacting Bridging Trust AI</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
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
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #e2e8f0;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            background: linear-gradient(90deg, #3A5F77 0%, #5B90B0 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 10px;
        }
        .title {
            color: #1e293b;
            font-size: 28px;
            font-weight: 600;
            margin: 0;
        }
        .content {
            margin-bottom: 30px;
        }
        .message-box {
            background-color: #f1f5f9;
            border-left: 4px solid #5B90B0;
            padding: 20px;
            margin: 20px 0;
            border-radius: 0 8px 8px 0;
        }
        .message-title {
            font-weight: 600;
            color: #334155;
            margin-bottom: 10px;
        }
        .message-content {
            color: #64748b;
            font-style: italic;
        }
        .next-steps {
            background-color: #ecfdf5;
            border: 1px solid #d1fae5;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .next-steps h3 {
            color: #065f46;
            margin-top: 0;
            margin-bottom: 15px;
        }
        .next-steps ul {
            color: #047857;
            margin: 0;
            padding-left: 20px;
        }
        .footer {
            text-align: center;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            color: #64748b;
            font-size: 14px;
        }
        .contact-info {
            margin-top: 20px;
            padding: 15px;
            background-color: #f8fafc;
            border-radius: 8px;
        }
        .btn {
            display: inline-block;
            background: linear-gradient(90deg, #3A5F77 0%, #5B90B0 100%);
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">Bridging Trust AI</div>
            <h1 class="title">Thank You for Reaching Out!</h1>
        </div>
        
        <div class="content">
            <p>Dear ${data.firstName},</p>
            
            <p>Thank you for contacting Bridging Trust AI. We've received your message and appreciate your interest in our AI consulting and implementation services.</p>
            
            <div class="message-box">
                <div class="message-title">Your Message:</div>
                <div class="message-content">"${data.message}"</div>
            </div>
            
            <div class="next-steps">
                <h3>What happens next?</h3>
                <ul>
                    <li>Our team will review your inquiry within 24 hours</li>
                    <li>We'll reach out to schedule a consultation if appropriate</li>
                    <li>You'll receive a personalized response addressing your specific needs</li>
                </ul>
            </div>
            
            <p>In the meantime, feel free to explore our website to learn more about how we help organizations implement enterprise-grade AI solutions.</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="https://bridgingtrust.ai" class="btn">Visit Our Website</a>
            </div>
            
            <div class="contact-info">
                <strong>Contact Information:</strong><br>
                Email: hello@bridgingtrust.ai<br>
                Website: https://bridgingtrust.ai
            </div>
        </div>
        
        <div class="footer">
            <p>This email was sent in response to your contact form submission.</p>
            <p>&copy; ${new Date().getFullYear()} Bridging Trust AI. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
  `.trim();
} 