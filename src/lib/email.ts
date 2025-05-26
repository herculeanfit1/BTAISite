import { Resend } from 'resend';

/**
 * Email service configuration and utilities for Bridging Trust AI
 * Uses Resend.com for transactional email delivery
 */

// Email configuration
export const EMAIL_CONFIG = {
  FROM: process.env.EMAIL_FROM || 'Bridging Trust AI <hello@bridgingtrust.ai>',
  REPLY_TO: process.env.EMAIL_REPLY_TO || 'support@bridgingtrust.ai',
  ADMIN_EMAIL: process.env.EMAIL_ADMIN || 'admin@bridgingtrust.ai',
  DEBUG_MODE: process.env.DEBUG_EMAIL === 'true',
  DEBUG_EMAIL: 'delivered@resend.dev',
  SEND_IN_DEV: process.env.SEND_EMAILS_IN_DEVELOPMENT === 'true',
};

// Rate limiting and circuit breaker configuration
const RATE_LIMITS = {
  DAILY: parseInt(process.env.EMAIL_DAILY_LIMIT || '100'),
  MONTHLY: parseInt(process.env.EMAIL_MONTHLY_LIMIT || '1000'),
  HOURLY: parseInt(process.env.EMAIL_HOURLY_LIMIT || '10'),
  MAX_FAILURES: parseInt(process.env.EMAIL_MAX_FAILURES || '5'),
  CIRCUIT_BREAKER_TIMEOUT: parseInt(process.env.EMAIL_CIRCUIT_BREAKER_TIMEOUT || '300000'), // 5 minutes
};

// In-memory tracking (in production, you'd use Redis or a database)
let emailUsage = {
  daily: 0,
  monthly: 0,
  hourly: 0,
  failures: 0,
  lastFailure: 0,
  circuitBreakerOpen: false,
};

// Reset counters based on time
const resetCounters = () => {
  const now = Date.now();
  const hour = 60 * 60 * 1000;
  const day = 24 * hour;
  const month = 30 * day;

  // Reset hourly counter every hour
  if (now - emailUsage.lastFailure > hour) {
    emailUsage.hourly = 0;
  }

  // Reset daily counter every day
  if (now - emailUsage.lastFailure > day) {
    emailUsage.daily = 0;
  }

  // Reset monthly counter every month
  if (now - emailUsage.lastFailure > month) {
    emailUsage.monthly = 0;
  }

  // Reset circuit breaker if timeout has passed
  if (emailUsage.circuitBreakerOpen && now - emailUsage.lastFailure > RATE_LIMITS.CIRCUIT_BREAKER_TIMEOUT) {
    emailUsage.circuitBreakerOpen = false;
    emailUsage.failures = 0;
  }
};

// Check if we can send email based on rate limits
const canSendEmail = (): { canSend: boolean; reason?: string } => {
  resetCounters();

  if (emailUsage.circuitBreakerOpen) {
    return { canSend: false, reason: 'Circuit breaker is open due to too many failures' };
  }

  if (emailUsage.hourly >= RATE_LIMITS.HOURLY) {
    return { canSend: false, reason: 'Hourly email limit exceeded' };
  }

  if (emailUsage.daily >= RATE_LIMITS.DAILY) {
    return { canSend: false, reason: 'Daily email limit exceeded' };
  }

  if (emailUsage.monthly >= RATE_LIMITS.MONTHLY) {
    return { canSend: false, reason: 'Monthly email limit exceeded' };
  }

  return { canSend: true };
};

// Initialize Resend client (lazy initialization)
let resendClient: Resend | null = null;

const getResendClient = (): Resend => {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('RESEND_API_KEY environment variable is not set');
    }
    resendClient = new Resend(apiKey);
  }
  return resendClient;
};

// Email sending interface
export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}

// Main email sending function
export const sendEmail = async (options: EmailOptions): Promise<{ success: boolean; id?: string; error?: string }> => {
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Check if we should send emails in development
  if (isDevelopment && !EMAIL_CONFIG.SEND_IN_DEV) {
    console.log('📧 Email sending disabled in development');
    console.log(`To: ${Array.isArray(options.to) ? options.to.join(', ') : options.to}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`HTML: ${options.html.substring(0, 200)}...`);
    return { success: true, id: 'dev-mode-disabled' };
  }

  // Check rate limits
  const rateLimitCheck = canSendEmail();
  if (!rateLimitCheck.canSend) {
    console.error('Email rate limit exceeded:', rateLimitCheck.reason);
    return { success: false, error: rateLimitCheck.reason };
  }

  try {
    const resend = getResendClient();

    // Determine final recipient (use debug email if in debug mode)
    const finalTo = EMAIL_CONFIG.DEBUG_MODE ? EMAIL_CONFIG.DEBUG_EMAIL : options.to;
    const finalSubject = EMAIL_CONFIG.DEBUG_MODE ? `[DEBUG] ${options.subject}` : options.subject;

    // Send email
    const { data, error } = await resend.emails.send({
      from: EMAIL_CONFIG.FROM,
      to: finalTo,
      subject: finalSubject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo || EMAIL_CONFIG.REPLY_TO,
    });

    if (error) {
      throw new Error(`Resend API error: ${error.message}`);
    }

    // Update usage counters on success
    emailUsage.hourly++;
    emailUsage.daily++;
    emailUsage.monthly++;

    console.log('✅ Email sent successfully:', data?.id);
    return { success: true, id: data?.id };

  } catch (error) {
    // Handle failures and circuit breaker
    emailUsage.failures++;
    emailUsage.lastFailure = Date.now();

    if (emailUsage.failures >= RATE_LIMITS.MAX_FAILURES) {
      emailUsage.circuitBreakerOpen = true;
      console.error('🚨 Circuit breaker opened due to too many email failures');
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Email sending failed:', errorMessage);
    return { success: false, error: errorMessage };
  }
};

// Get email service status (for health checks)
export const getEmailStatus = () => {
  resetCounters();
  
  return {
    configured: Boolean(process.env.RESEND_API_KEY),
    circuitBreakerOpen: emailUsage.circuitBreakerOpen,
    usage: {
      hourly: emailUsage.hourly,
      daily: emailUsage.daily,
      monthly: emailUsage.monthly,
    },
    limits: RATE_LIMITS,
    debugMode: EMAIL_CONFIG.DEBUG_MODE,
    sendInDev: EMAIL_CONFIG.SEND_IN_DEV,
  };
}; 