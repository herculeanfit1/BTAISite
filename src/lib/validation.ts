/**
 * Validation utility functions for form input validation
 * Used across the application for consistent validation logic
 */

/**
 * Validates an email address format
 * @param email The email address to validate
 * @returns True if email is valid, false otherwise
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return !!email && emailRegex.test(email);
}

/**
 * Validates a name input
 * @param name The name to validate
 * @returns True if name is valid, false otherwise
 */
export function isValidName(name: string): boolean {
  return !!name && name.trim().length >= 2 && name.trim().length <= 100;
}

/**
 * Validates a message input
 * @param message The message to validate
 * @returns True if message is valid, false otherwise
 */
export function isValidMessage(message: string): boolean {
  return (
    !!message && message.trim().length >= 10 && message.trim().length <= 5000
  );
}

/**
 * Validates a phone number
 * @param phone The phone number to validate
 * @returns True if phone is valid, false otherwise
 */
export function isValidPhone(phone: string): boolean {
  // Allow empty phone as it might be optional
  if (!phone) return true;

  // Remove all non-digit characters for validation
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 15;
}

/**
 * Sanitizes a string input to prevent XSS attacks
 * @param input The string to sanitize
 * @returns Sanitized string
 */
export function sanitizeInput(input: string): string {
  if (!input) return "";

  // Basic sanitization - replace potentially dangerous characters
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Interface for contact form data validation
 */
export interface ContactFormData {
  name: string;
  email: string;
  message: string;
  phone?: string;
  company?: string;
}

/**
 * Validates all fields in contact form data
 * @param data The form data to validate
 * @returns Object with validation results
 */
export function validateContactForm(data: ContactFormData): {
  valid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  if (!isValidName(data.name)) {
    errors.name = "Please enter a valid name (2-100 characters)";
  }

  if (!isValidEmail(data.email)) {
    errors.email = "Please enter a valid email address";
  }

  if (!isValidMessage(data.message)) {
    errors.message = "Please enter a message (10-5000 characters)";
  }

  if (data.phone && !isValidPhone(data.phone)) {
    errors.phone = "Please enter a valid phone number";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
