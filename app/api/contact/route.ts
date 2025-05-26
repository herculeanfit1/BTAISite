import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { sendEmail, EMAIL_CONFIG } from '@/lib/email';
import { generateContactConfirmationEmail } from '@/lib/email-templates/contact-confirmation';
import { generateAdminNotificationEmail } from '@/lib/email-templates/admin-notification';

// Rate limiting storage (in production, use Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Validation schema
const contactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email address').max(255, 'Email too long'),
  company: z.string().max(100, 'Company name too long').optional(),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000, 'Message too long'),
  honeypot: z.string().optional(), // Bot protection
});

// Rate limiting function
const checkRateLimit = (ip: string): { allowed: boolean; remaining: number } => {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1 hour
  const maxRequests = 5; // 5 requests per hour per IP

  const current = rateLimitMap.get(ip);
  
  if (!current || now > current.resetTime) {
    // Reset or initialize
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (current.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  current.count++;
  return { allowed: true, remaining: maxRequests - current.count };
};

// Get client IP address
const getClientIP = (request: NextRequest): string => {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return request.ip || '127.0.0.1';
};

export async function POST(request: NextRequest) {
  try {
    // Get client information
    const ip = getClientIP(request);
    const userAgent = request.headers.get('user-agent') || 'Unknown';

    // Check rate limiting
    const rateLimit = checkRateLimit(ip);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Too many requests. Please try again later.',
          code: 'RATE_LIMIT_EXCEEDED'
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Date.now() + 60 * 60 * 1000),
          }
        }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    
    // Check honeypot (bot protection)
    if (body.honeypot && body.honeypot.trim() !== '') {
      console.log('🤖 Bot detected via honeypot field');
      return NextResponse.json(
        { success: false, error: 'Invalid submission', code: 'BOT_DETECTED' },
        { status: 400 }
      );
    }

    // Validate input
    const validatedData = contactSchema.parse(body);
    const { name, email, company, message } = validatedData;

    // Create timestamp
    const timestamp = new Date().toLocaleString('en-US', {
      timeZone: 'America/Chicago',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short'
    });

    // Send confirmation email to user
    const confirmationEmail = generateContactConfirmationEmail({
      name,
      email,
      company,
      message,
    });

    const confirmationResult = await sendEmail({
      to: email,
      subject: 'Thank you for contacting Bridging Trust AI',
      html: confirmationEmail.html,
      text: confirmationEmail.text,
    });

    if (confirmationResult.success) {
      console.log('✅ Confirmation email sent to:', email);
    } else {
      console.error('❌ Failed to send confirmation email:', confirmationResult.error);
    }

    // Send admin notification
    const adminEmail = generateAdminNotificationEmail({
      name,
      email,
      company,
      message,
      ip,
      userAgent,
      timestamp,
    });

    const adminResult = await sendEmail({
      to: EMAIL_CONFIG.ADMIN_EMAIL,
      subject: `New Contact Form Submission from ${name}`,
      html: adminEmail.html,
      text: adminEmail.text,
    });

    if (adminResult.success) {
      console.log('✅ Admin notification sent');
    } else {
      console.error('❌ Failed to send admin notification:', adminResult.error);
    }

    // Log submission details
    console.log('📝 Contact form submission:', {
      name,
      email,
      company,
      ip,
      timestamp,
    });

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: 'Thank you for your message! We\'ll get back to you within 24-48 hours.',
        emailSent: confirmationResult.success,
      },
      {
        status: 200,
        headers: {
          'X-RateLimit-Remaining': String(rateLimit.remaining),
        }
      }
    );

  } catch (error) {
    console.error('❌ Contact form error:', error);

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid form data',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
          code: 'VALIDATION_ERROR'
        },
        { status: 400 }
      );
    }

    // Handle other errors
    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred. Please try again later.',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    },
  });
} 