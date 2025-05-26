import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { sendEmail, EMAIL_CONFIG } from '@/lib/email';
import { generateContactConfirmationEmail } from '@/lib/email-templates/contact-confirmation';
import { generateAdminNotificationEmail } from '@/lib/email-templates/admin-notification';

/**
 * Contact form submission API endpoint
 * Handles form validation, rate limiting, and email sending
 */

// Validation schema for contact form
const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  email: z.string().email('Invalid email address'),
  company: z.string().max(100, 'Company name too long').optional(),
  phone: z.string().max(20, 'Phone number too long').optional(),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000, 'Message too long'),
  honeypot: z.string().optional(), // Bot detection
});

// Rate limiting map (in production, use Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

/**
 * Check rate limiting based on IP address
 */
const checkRateLimit = (ip: string): boolean => {
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
 * Get client IP address from request
 */
const getClientIP = (request: NextRequest): string => {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return 'unknown';
};

/**
 * POST /api/contact
 * Handle contact form submissions
 */
export async function POST(request: NextRequest) {
  try {
    // Get client information
    const clientIP = getClientIP(request);
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    // Check rate limiting
    if (!checkRateLimit(clientIP)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Too many requests. Please try again later.',
          code: 'RATE_LIMIT_EXCEEDED'
        },
        { status: 429 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    
    // Check honeypot (bot detection)
    if (body.honeypot && body.honeypot.trim() !== '') {
      console.log('🤖 Bot detected via honeypot:', clientIP);
      return NextResponse.json(
        { success: true, message: 'Thank you for your message!' },
        { status: 200 }
      );
    }

    // Validate form data
    const validatedData = contactFormSchema.parse(body);
    const { name, email, company, phone, message } = validatedData;

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

    // Send confirmation email to user
    try {
      const confirmationTemplate = generateContactConfirmationEmail({
        name,
        email,
        company,
        message,
        submittedAt,
      });

      await sendEmail({
        to: email,
        subject: 'Thank you for contacting Bridging Trust AI',
        html: confirmationTemplate.html,
        text: confirmationTemplate.text,
        identifier: `user-${email}`,
      });

      console.log('✅ Confirmation email sent to:', email);
    } catch (error) {
      console.error('❌ Failed to send confirmation email:', error);
      // Don't fail the entire request if confirmation email fails
    }

    // Send notification email to admin
    try {
      const adminTemplate = generateAdminNotificationEmail({
        name,
        email,
        company,
        phone,
        message,
        submittedAt,
        userAgent,
        ipAddress: clientIP,
      });

      await sendEmail({
        to: EMAIL_CONFIG.ADMIN_EMAIL,
        subject: `New Contact Form Submission from ${name}`,
        html: adminTemplate.html,
        text: adminTemplate.text,
        identifier: 'admin-notifications',
      });

      console.log('✅ Admin notification sent');
    } catch (error) {
      console.error('❌ Failed to send admin notification:', error);
      // Don't fail the entire request if admin notification fails
    }

    // Log successful submission
    console.log('📝 Contact form submission:', {
      name,
      email,
      company,
      ip: clientIP,
      timestamp: submittedAt,
    });

    return NextResponse.json({
      success: true,
      message: 'Thank you for your message! We\'ll get back to you soon.',
    });

  } catch (error) {
    console.error('❌ Contact form error:', error);

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please check your form data and try again.',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
          code: 'VALIDATION_ERROR'
        },
        { status: 400 }
      );
    }

    // Handle email sending errors
    if (error instanceof Error && error.message.includes('rate limit')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email service temporarily unavailable. Please try again later.',
          code: 'EMAIL_RATE_LIMIT'
        },
        { status: 503 }
      );
    }

    // Generic error response
    return NextResponse.json(
      {
        success: false,
        error: 'Something went wrong. Please try again later.',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/contact
 * Return contact form configuration (for frontend)
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    config: {
      emailEnabled: !!process.env.RESEND_API_KEY,
      maxMessageLength: 2000,
      requiredFields: ['name', 'email', 'message'],
      optionalFields: ['company', 'phone'],
    },
  });
} 