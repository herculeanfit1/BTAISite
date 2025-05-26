import { Resend } from 'resend';

// Lazy initialization to avoid build-time errors
let resendClient: Resend | null = null;

const getResendClient = () => {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('Missing required environment variable: RESEND_API_KEY');
    }
    resendClient = new Resend(apiKey);
  }
  return resendClient;
};

// Rate limiting storage (in production, use Redis or database)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Circuit breaker state
const circuitBreakerState = {
  failures: 0,
  lastFailureTime: 0,
  isOpen: false,
};

const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX_REQUESTS = 5; // 5 requests per hour per IP
const CIRCUIT_BREAKER_THRESHOLD = 5;
const CIRCUIT_BREAKER_TIMEOUT = 5 * 60 * 1000; // 5 minutes

export interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  company?: string;
  message: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface EmailResult {
  success: boolean;
  message: string;
  rateLimited?: boolean;
  circuitBreakerOpen?: boolean;
}

// Rate limiting check
export function checkRateLimit(ipAddress: string): boolean {
  const now = Date.now();
  const key = `rate_limit_${ipAddress}`;
  const existing = rateLimitStore.get(key);

  if (!existing || now > existing.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (existing.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  existing.count++;
  return true;
}

// Circuit breaker check
function checkCircuitBreaker(): boolean {
  const now = Date.now();
  
  if (circuitBreakerState.isOpen) {
    if (now - circuitBreakerState.lastFailureTime > CIRCUIT_BREAKER_TIMEOUT) {
      circuitBreakerState.isOpen = false;
      circuitBreakerState.failures = 0;
    } else {
      return false;
    }
  }
  
  return true;
}

// Record circuit breaker failure
function recordFailure() {
  circuitBreakerState.failures++;
  circuitBreakerState.lastFailureTime = Date.now();
  
  if (circuitBreakerState.failures >= CIRCUIT_BREAKER_THRESHOLD) {
    circuitBreakerState.isOpen = true;
  }
}

// Record circuit breaker success
function recordSuccess() {
  circuitBreakerState.failures = 0;
}

export async function sendContactEmail(data: ContactFormData): Promise<EmailResult> {
  try {
    // Check rate limiting
    if (data.ipAddress && !checkRateLimit(data.ipAddress)) {
      return {
        success: false,
        message: 'Rate limit exceeded. Please try again later.',
        rateLimited: true,
      };
    }

    // Check circuit breaker
    if (!checkCircuitBreaker()) {
      return {
        success: false,
        message: 'Email service temporarily unavailable. Please try again later.',
        circuitBreakerOpen: true,
      };
    }

    // Development mode simulation
    if (process.env.RESEND_TEST_MODE === 'true') {
      console.log('📧 Email would be sent (test mode):', {
        to: process.env.EMAIL_TO,
        from: process.env.EMAIL_FROM,
        subject: `New Contact Form Submission from ${data.firstName} ${data.lastName}`,
        data: data,
      });
      
      recordSuccess();
      return {
        success: true,
        message: 'Email sent successfully (test mode)',
      };
    }

    const resend = getResendClient();
    const emailFrom = process.env.EMAIL_FROM || 'hello@bridgingtrust.ai';
    const emailTo = process.env.EMAIL_TO || 'sales@bridgingtrust.ai';
    const emailAdmin = process.env.EMAIL_ADMIN || 'admin@bridgingtrust.ai';

    // Import email templates
    const { generateConfirmationEmail } = await import('./email-templates/contact-confirmation');
    const { generateAdminNotificationEmail } = await import('./email-templates/admin-notification');

    // Send confirmation email to user
    const confirmationResult = await resend.emails.send({
      from: emailFrom,
      to: data.email,
      subject: 'Thank you for contacting Bridging Trust AI',
      html: generateConfirmationEmail(data),
    });

    // Send notification email to admin
    const adminResult = await resend.emails.send({
      from: emailFrom,
      to: emailTo,
      cc: emailAdmin,
      subject: `New Contact Form Submission from ${data.firstName} ${data.lastName}`,
      html: generateAdminNotificationEmail(data),
    });

    console.log('📧 Emails sent successfully:', {
      confirmation: confirmationResult.data?.id,
      admin: adminResult.data?.id,
    });

    recordSuccess();
    return {
      success: true,
      message: 'Emails sent successfully',
    };

  } catch (error) {
    console.error('❌ Email sending failed:', error);
    recordFailure();
    
    return {
      success: false,
      message: 'Failed to send email. Please try again later.',
    };
  }
} 