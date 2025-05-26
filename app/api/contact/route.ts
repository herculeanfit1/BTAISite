import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { sendContactEmail, type ContactFormData } from '@/src/lib/email';

// Validation schema using Zod
const contactFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
  email: z.string().email('Invalid email address').max(100, 'Email too long'),
  company: z.string().max(100, 'Company name too long').optional(),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000, 'Message too long'),
  _gotcha: z.string().optional(), // Honeypot field for bot protection
});

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP and User-Agent for tracking
    const ipAddress = request.ip || 
      request.headers.get('x-forwarded-for')?.split(',')[0] || 
      request.headers.get('x-real-ip') || 
      'unknown';
    
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Parse request body
    const body = await request.json();

    // Bot protection: Check honeypot field
    if (body._gotcha && body._gotcha.trim() !== '') {
      console.log('🤖 Bot detected via honeypot field:', { ipAddress, userAgent });
      return NextResponse.json(
        { success: false, message: 'Invalid submission' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate form data
    const validationResult = contactFormSchema.safeParse(body);
    if (!validationResult.success) {
      console.log('❌ Validation failed:', validationResult.error.errors);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Validation failed',
          errors: validationResult.error.errors 
        },
        { status: 400, headers: corsHeaders }
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
      return NextResponse.json(
        { 
          success: false, 
          message: 'Too many requests. Please try again later.',
          rateLimited: true 
        },
        { status: 429, headers: corsHeaders }
      );
    }

    if (emailResult.circuitBreakerOpen) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Service temporarily unavailable. Please try again later.',
          serviceUnavailable: true 
        },
        { status: 503, headers: corsHeaders }
      );
    }

    if (!emailResult.success) {
      console.error('❌ Email sending failed:', emailResult.message);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Failed to send email. Please try again later.' 
        },
        { status: 500, headers: corsHeaders }
      );
    }

    console.log('✅ Contact form submission successful:', {
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
      { status: 200, headers: corsHeaders }
    );

  } catch (error) {
    console.error('❌ Contact API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error. Please try again later.' 
      },
      { status: 500, headers: corsHeaders }
    );
  }
} 