import { Resend } from 'resend';

/**
 * Email service configuration and utilities for Bridging Trust AI
 * Uses Resend.com for transactional email delivery
 */

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

// Email configuration
export const EMAIL_CONFIG = {
  FROM: process.env.EMAIL_FROM || 'Bridging Trust AI <hello@bridgingtrust.ai>',
  REPLY_TO: process.env.EMAIL_REPLY_TO || 'support@bridgingtrust.ai',
  ADMIN_EMAIL: process.env.EMAIL_ADMIN || 'admin@bridgingtrust.ai',
  
  // Rate limiting
  DAILY_LIMIT: parseInt(process.env.EMAIL_DAILY_LIMIT || '100'),
  MONTHLY_LIMIT: parseInt(process.env.EMAIL_MONTHLY_LIMIT || '1000'),
  HOURLY_LIMIT: parseInt(process.env.EMAIL_HOURLY_LIMIT || '10'),
  MAX_FAILURES: parseInt(process.env.EMAIL_MAX_FAILURES || '5'),
  CIRCUIT_BREAKER_TIMEOUT: parseInt(process.env.EMAIL_CIRCUIT_BREAKER_TIMEOUT || '300000'),
  
  // Development settings
  SEND_IN_DEV: process.env.SEND_EMAILS_IN_DEVELOPMENT === 'true',
  DEBUG_MODE: process.env.DEBUG_EMAIL === 'true',
  DEBUG_EMAIL: 'delivered@resend.dev',
};

// Email usage tracking (in-memory for now, should use Redis in production)
const emailUsage = {
  hourly: new Map<string, number>(),
  daily: new Map<string, number>(),
  monthly: new Map<string, number>(),
  failures: new Map<string, number>(),
  lastReset: {
    hourly: new Date(),
    daily: new Date(),
    monthly: new Date(),
  },
};

/**
 * Reset usage counters based on time periods
 */
const resetUsageCounters = () => {
  const now = new Date();
  
  // Reset hourly counter
  if (now.getTime() - emailUsage.lastReset.hourly.getTime() > 3600000) {
    emailUsage.hourly.clear();
    emailUsage.lastReset.hourly = now;
  }
  
  // Reset daily counter
  if (now.getDate() !== emailUsage.lastReset.daily.getDate()) {
    emailUsage.daily.clear();
    emailUsage.lastReset.daily = now;
  }
  
  // Reset monthly counter
  if (now.getMonth() !== emailUsage.lastReset.monthly.getMonth()) {
    emailUsage.monthly.clear();
    emailUsage.lastReset.monthly = now;
  }
};

/**
 * Check if email sending is allowed based on rate limits
 */
const checkRateLimits = (identifier: string = 'global'): boolean => {
  resetUsageCounters();
  
  const hourlyCount = emailUsage.hourly.get(identifier) || 0;
  const dailyCount = emailUsage.daily.get(identifier) || 0;
  const monthlyCount = emailUsage.monthly.get(identifier) || 0;
  const failureCount = emailUsage.failures.get(identifier) || 0;
  
  return (
    hourlyCount < EMAIL_CONFIG.HOURLY_LIMIT &&
    dailyCount < EMAIL_CONFIG.DAILY_LIMIT &&
    monthlyCount < EMAIL_CONFIG.MONTHLY_LIMIT &&
    failureCount < EMAIL_CONFIG.MAX_FAILURES
  );
};

/**
 * Update usage counters
 */
const updateUsageCounters = (identifier: string = 'global', success: boolean = true) => {
  if (success) {
    emailUsage.hourly.set(identifier, (emailUsage.hourly.get(identifier) || 0) + 1);
    emailUsage.daily.set(identifier, (emailUsage.daily.get(identifier) || 0) + 1);
    emailUsage.monthly.set(identifier, (emailUsage.monthly.get(identifier) || 0) + 1);
    
    // Reset failure count on success
    emailUsage.failures.delete(identifier);
  } else {
    emailUsage.failures.set(identifier, (emailUsage.failures.get(identifier) || 0) + 1);
  }
};

/**
 * Send email with rate limiting and error handling
 */
export const sendEmail = async (params: {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
  identifier?: string;
}) => {
  const {
    to,
    subject,
    html,
    text,
    from = EMAIL_CONFIG.FROM,
    replyTo = EMAIL_CONFIG.REPLY_TO,
    identifier = 'global',
  } = params;

  // Check if we're in development and emails are disabled
  if (process.env.NODE_ENV === 'development' && !EMAIL_CONFIG.SEND_IN_DEV) {
    console.log('📧 Email sending disabled in development');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('HTML:', html.substring(0, 200) + '...');
    return { success: true, messageId: 'dev-mode' };
  }

  // Check rate limits
  if (!checkRateLimits(identifier)) {
    throw new Error('Email rate limit exceeded');
  }

  try {
    // Use debug email in debug mode
    const finalTo = EMAIL_CONFIG.DEBUG_MODE ? EMAIL_CONFIG.DEBUG_EMAIL : to;
    
    const result = await resend.emails.send({
      from,
      to: finalTo,
      subject: EMAIL_CONFIG.DEBUG_MODE ? `[DEBUG] ${subject}` : subject,
      html,
      text,
      replyTo,
    });

    updateUsageCounters(identifier, true);
    
    console.log('✅ Email sent successfully:', result.data?.id);
    return { success: true, messageId: result.data?.id };
    
  } catch (error) {
    updateUsageCounters(identifier, false);
    console.error('❌ Email sending failed:', error);
    throw error;
  }
}; 