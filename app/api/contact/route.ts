import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { sendContactEmail, type ContactFormData } from '@/src/lib/email';
import { logger } from '@/lib/logger';
import { trackEvent, trackException } from '@/src/lib/telemetry';

// Validation schema using Zod
const contactFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
  email: z.string().email('Invalid email address').max(100, 'Email too long'),
  company: z.string().max(100, 'Company name too long').optional(),
  interest: z.enum(['governance-assessment', 'data-readiness', 'copilot-readiness', 'general', '']).optional(),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000, 'Message too long'),
  _gotcha: z.string().optional(), // Honeypot field for bot protection
});

// Allowed origins for CORS — restrict to production and development domains
const ALLOWED_ORIGINS = [
  'https://bridgingtrust.ai',
  'https://www.bridgingtrust.ai',
];

// In development, also allow localhost
if (process.env.NODE_ENV === 'development') {
  ALLOWED_ORIGINS.push('http://localhost:3000', 'http://localhost:3010', 'http://localhost:3111', 'https://localhost:3001');
}

function getCorsHeaders(request: NextRequest) {
  const origin = request.headers.get('origin') || '';

  // Check if the origin is allowed, or if it matches Azure SWA preview pattern
  const isAllowed = ALLOWED_ORIGINS.includes(origin) ||
    /^https:\/\/[a-z0-9-]+\.azurestaticapps\.net$/.test(origin);

  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
  };
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, { status: 200, headers: getCorsHeaders(request) });
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP and User-Agent for tracking
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] || 
      request.headers.get('x-real-ip') || 
      request.headers.get('cf-connecting-ip') || 
      'unknown';
    
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Parse request body
    const body = await request.json();

    // Bot protection: Check honeypot field
    if (body._gotcha && body._gotcha.trim() !== '') {
      logger.warn('🤖 Bot detected via honeypot field:', { ipAddress, userAgent });
      return NextResponse.json(
        { success: false, message: 'Invalid submission' },
        { status: 400, headers: getCorsHeaders(request) }
      );
    }

    // Validate form data
    const validationResult = contactFormSchema.safeParse(body);
    if (!validationResult.success) {
      logger.warn('❌ Validation failed:', validationResult.error.errors);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Validation failed',
          errors: validationResult.error.errors 
        },
        { status: 400, headers: getCorsHeaders(request) }
      );
    }

    const formData: ContactFormData = {
      ...validationResult.data,
      ipAddress,
      userAgent,
    };

    // Send email
    const emailResult = await sendContactEmail(formData);

    if (emailResult.rateLimited) {
      trackEvent('contact_rate_limited', { ip: ipAddress });
      return NextResponse.json(
        { 
          success: false, 
          message: 'Too many requests. Please try again later.',
          rateLimited: true 
        },
        { status: 429, headers: getCorsHeaders(request) }
      );
    }

    if (emailResult.circuitBreakerOpen) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Service temporarily unavailable. Please try again later.',
          serviceUnavailable: true 
        },
        { status: 503, headers: getCorsHeaders(request) }
      );
    }

    if (!emailResult.success) {
      console.error('❌ Email sending failed:', emailResult.message);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Failed to send email. Please try again later.' 
        },
        { status: 500, headers: getCorsHeaders(request) }
      );
    }

    trackEvent('contact_form_submission', {
      interest: formData.interest || 'not-specified',
    });

    logger.info('✅ Contact form submission successful:', {
      name: `${formData.firstName} ${formData.lastName}`,
      email: formData.email,
      company: formData.company,
      ipAddress,
    });

    return NextResponse.json(
      { 
        success: true, 
        message: 'Thank you for your message! We\'ll get back to you soon.' 
      },
      { status: 200, headers: getCorsHeaders(request) }
    );

  } catch (error) {
    trackException(error instanceof Error ? error : new Error(String(error)), { source: 'contact-api' });
    console.error('❌ Contact API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error. Please try again later.' 
      },
      { status: 500, headers: getCorsHeaders(request) }
    );
  }
} 