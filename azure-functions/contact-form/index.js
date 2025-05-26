const { Resend } = require('resend');

// Email configuration
const EMAIL_CONFIG = {
  FROM: process.env.EMAIL_FROM || 'Bridging Trust AI <hello@bridgingtrust.ai>',
  REPLY_TO: process.env.EMAIL_REPLY_TO || 'support@bridgingtrust.ai',
  ADMIN_EMAIL: process.env.EMAIL_ADMIN || 'admin@bridgingtrust.ai',
  DEBUG_MODE: process.env.DEBUG_EMAIL === 'true',
  DEBUG_EMAIL: 'delivered@resend.dev',
};

// Rate limiting map (in-memory)
const rateLimitMap = new Map();

/**
 * Check rate limiting based on IP address
 */
const checkRateLimit = (ip) => {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1 hour
  const maxRequests = 5; // 5 submissions per hour per IP

  const current = rateLimitMap.get(ip);
  
  if (!current || now > current.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (current.count >= maxRequests) {
    return false;
  }
  
  current.count++;
  return true;
};

/**
 * Generate confirmation email template
 */
const generateConfirmationEmail = ({ name, email, company, message, submittedAt }) => {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thank you for contacting Bridging Trust AI</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Thank You!</h1>
    <p style="color: #f0f0f0; margin: 10px 0 0 0; font-size: 16px;">We've received your message</p>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px; margin-bottom: 20px;">Dear ${name},</p>
    
    <p style="font-size: 16px; margin-bottom: 20px;">
      Thank you for reaching out to Bridging Trust AI. We've successfully received your message and our team will review it shortly.
    </p>
    
    <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #667eea;">Your Message Details:</h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      ${company ? `<p><strong>Company:</strong> ${company}</p>` : ''}
      <p><strong>Message:</strong></p>
      <p style="background: #f8f9fa; padding: 15px; border-radius: 5px; white-space: pre-wrap;">${message}</p>
      <p><strong>Submitted:</strong> ${submittedAt}</p>
    </div>
    
    <p style="font-size: 16px; margin-bottom: 20px;">
      We typically respond within 24-48 hours during business days. If your inquiry is urgent, please don't hesitate to call us directly.
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://bridgingtrust.ai" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Visit Our Website</a>
    </div>
    
    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
    
    <p style="font-size: 14px; color: #666; text-align: center;">
      Best regards,<br>
      <strong>The Bridging Trust AI Team</strong><br>
      <a href="mailto:support@bridgingtrust.ai" style="color: #667eea;">support@bridgingtrust.ai</a>
    </p>
  </div>
</body>
</html>`;

  const text = `Dear ${name},

Thank you for reaching out to Bridging Trust AI. We've successfully received your message and our team will review it shortly.

Your Message Details:
Name: ${name}
Email: ${email}
${company ? `Company: ${company}\n` : ''}Message: ${message}
Submitted: ${submittedAt}

We typically respond within 24-48 hours during business days. If your inquiry is urgent, please don't hesitate to call us directly.

Best regards,
The Bridging Trust AI Team
support@bridgingtrust.ai

Visit our website: https://bridgingtrust.ai`;

  return { html, text };
};

/**
 * Generate admin notification email template
 */
const generateAdminEmail = ({ name, email, company, phone, message, submittedAt, userAgent, ipAddress }) => {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Contact Form Submission - Bridging Trust AI</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #dc3545; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">🚨 New Contact Form Submission</h1>
  </div>
  
  <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
    <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
      <h2 style="margin-top: 0; color: #dc3545;">Contact Information</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
      ${company ? `<p><strong>Company:</strong> ${company}</p>` : ''}
      ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
      <p><strong>Submitted:</strong> ${submittedAt}</p>
    </div>
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
      <h3 style="margin-top: 0; color: #dc3545;">Message</h3>
      <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; white-space: pre-wrap;">${message}</div>
    </div>
    
    <div style="background: white; padding: 20px; border-radius: 8px;">
      <h3 style="margin-top: 0; color: #6c757d;">Technical Details</h3>
      <p><strong>IP Address:</strong> ${ipAddress}</p>
      <p><strong>User Agent:</strong> ${userAgent}</p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="mailto:${email}?subject=Re: Your inquiry to Bridging Trust AI" style="background: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Reply to ${name}</a>
    </div>
  </div>
</body>
</html>`;

  const text = `New Contact Form Submission - Bridging Trust AI

Contact Information:
Name: ${name}
Email: ${email}
${company ? `Company: ${company}\n` : ''}${phone ? `Phone: ${phone}\n` : ''}Submitted: ${submittedAt}

Message:
${message}

Technical Details:
IP Address: ${ipAddress}
User Agent: ${userAgent}

Reply to: ${email}`;

  return { html, text };
};

module.exports = async function (context, req) {
  context.log('Processing contact form submission');

  // Set CORS headers
  context.res = {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  };

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    context.res.status = 200;
    return;
  }

  if (!req.body) {
    context.res.status = 400;
    context.res.body = { 
      success: false,
      error: 'Please provide form data in the request body',
      code: 'MISSING_BODY'
    };
    return;
  }

  // Get client information
  const clientIP = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';

  // Check rate limiting
  if (!checkRateLimit(clientIP)) {
    context.res.status = 429;
    context.res.body = { 
      success: false,
      error: 'Too many requests. Please try again later.',
      code: 'RATE_LIMIT_EXCEEDED'
    };
    return;
  }

  const { name, email, company, phone, message, honeypot } = req.body;

  // Check honeypot (bot detection)
  if (honeypot && honeypot.trim() !== '') {
    context.log('Bot detected via honeypot:', clientIP);
    context.res.status = 200;
    context.res.body = { success: true, message: 'Thank you for your message!' };
    return;
  }

  // Validate required fields
  if (!name || !email || !message) {
    context.res.status = 400;
    context.res.body = { 
      success: false,
      error: 'Name, email, and message are required fields',
      code: 'VALIDATION_ERROR'
    };
    return;
  }

  // Validate field lengths
  if (name.length < 2 || name.length > 100) {
    context.res.status = 400;
    context.res.body = { 
      success: false,
      error: 'Name must be between 2 and 100 characters',
      code: 'VALIDATION_ERROR'
    };
    return;
  }

  if (message.length < 10 || message.length > 2000) {
    context.res.status = 400;
    context.res.body = { 
      success: false,
      error: 'Message must be between 10 and 2000 characters',
      code: 'VALIDATION_ERROR'
    };
    return;
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    context.res.status = 400;
    context.res.body = { 
      success: false,
      error: 'Please provide a valid email address',
      code: 'VALIDATION_ERROR'
    };
    return;
  }

  // Create timestamp
  const submittedAt = new Date().toLocaleString('en-US', {
    timeZone: 'America/Chicago',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  });

  // Initialize Resend client
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    context.log.error('RESEND_API_KEY not configured');
    context.res.status = 500;
    context.res.body = { 
      success: false,
      error: 'Email service not configured',
      code: 'CONFIG_ERROR'
    };
    return;
  }

  const resend = new Resend(resendApiKey);

  try {
    // Send confirmation email to user
    const confirmationTemplate = generateConfirmationEmail({
      name,
      email,
      company,
      message,
      submittedAt,
    });

    const finalUserEmail = EMAIL_CONFIG.DEBUG_MODE ? EMAIL_CONFIG.DEBUG_EMAIL : email;
    
    await resend.emails.send({
      from: EMAIL_CONFIG.FROM,
      to: finalUserEmail,
      subject: EMAIL_CONFIG.DEBUG_MODE ? '[DEBUG] Thank you for contacting Bridging Trust AI' : 'Thank you for contacting Bridging Trust AI',
      html: confirmationTemplate.html,
      text: confirmationTemplate.text,
      replyTo: EMAIL_CONFIG.REPLY_TO,
    });

    context.log('Confirmation email sent to:', email);

    // Send notification email to admin
    const adminTemplate = generateAdminEmail({
      name,
      email,
      company,
      phone,
      message,
      submittedAt,
      userAgent,
      ipAddress: clientIP,
    });

    const finalAdminEmail = EMAIL_CONFIG.DEBUG_MODE ? EMAIL_CONFIG.DEBUG_EMAIL : EMAIL_CONFIG.ADMIN_EMAIL;

    await resend.emails.send({
      from: EMAIL_CONFIG.FROM,
      to: finalAdminEmail,
      subject: EMAIL_CONFIG.DEBUG_MODE ? `[DEBUG] New Contact Form Submission from ${name}` : `New Contact Form Submission from ${name}`,
      html: adminTemplate.html,
      text: adminTemplate.text,
      replyTo: email,
    });

    context.log('Admin notification sent');

    // Log successful submission
    context.log('Contact form submission:', {
      name,
      email,
      company,
      ip: clientIP,
      timestamp: submittedAt,
    });

    context.res.status = 200;
    context.res.body = {
      success: true,
      message: "Thank you for your message! We'll get back to you soon.",
    };

  } catch (error) {
    context.log.error('Email sending failed:', error);
    
    context.res.status = 500;
    context.res.body = { 
      success: false,
      error: 'Failed to send email. Please try again later.',
      code: 'EMAIL_ERROR'
    };
  }
};