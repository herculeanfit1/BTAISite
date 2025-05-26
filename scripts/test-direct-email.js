#!/usr/bin/env node

/**
 * test-direct-email.js
 * 
 * This script directly tests the email functionality using Resend
 * without going through the API route or Azure Function.
 */

import { Resend } from 'resend';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables from .env.local if it exists
try {
  if (fs.existsSync('.env.local')) {
    dotenv.config({ path: '.env.local' });
    console.log('✅ Loaded environment variables from .env.local');
  } else {
    console.log('⚠️ No .env.local file found, using environment variables');
  }
} catch (error) {
  console.error('❌ Error loading environment variables:', error);
}

// Get API key from environment or command-line argument
const apiKey = process.argv[2] || process.env.RESEND_API_KEY;
const emailFrom = process.env.EMAIL_FROM || 'no-reply@bridgingtrust.ai';
const emailTo = process.env.EMAIL_TO || 'sales@bridgingtrust.ai';

if (!apiKey) {
  console.error('❌ No API key provided.');
  console.error('Usage: node test-direct-email.js YOUR_API_KEY');
  console.error('   or: set RESEND_API_KEY in your .env.local file');
  process.exit(1);
}

console.log(`🔑 Testing with Resend API key: ${apiKey.substring(0, 10)}...`);
console.log(`📧 From: ${emailFrom}`);
console.log(`📬 To: onboarding@resend.dev (Resend test email)`);

// Create Resend instance
const resend = new Resend(apiKey);

// HTML sanitization function (same as in API route)
function sanitizeHtml(text) {
  if (!text) return "";
  return text
    .toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Test data
const testData = {
  name: "Test User",
  email: "test@example.com",
  company: "Test Company",
  message: "This is a test message sent directly via Resend."
};

// Format email content
const htmlContent = `
  <html>
    <body>
      <h1>New Contact Form Submission</h1>
      <p><strong>Name:</strong> ${sanitizeHtml(testData.name)}</p>
      <p><strong>Email:</strong> ${sanitizeHtml(testData.email)}</p>
      <p><strong>Company:</strong> ${sanitizeHtml(testData.company)}</p>
      <h2>Message:</h2>
      <p>${sanitizeHtml(testData.message).replace(/\n/g, "<br>")}</p>
    </body>
  </html>
`;

const textContent = `
  New Contact Form Submission
  
  Name: ${testData.name}
  Email: ${testData.email}
  Company: ${testData.company}
  
  Message:
  ${testData.message}
`;

// Send test email
async function sendTestEmail() {
  try {
    console.log('📨 Sending test email...');
    
    const { data, error } = await resend.emails.send({
      from: emailFrom,
      to: 'onboarding@resend.dev', // Using Resend's test email address
      subject: `Contact Form Test: ${testData.name}`,
      html: htmlContent,
      text: textContent,
      reply_to: testData.email,
    });
    
    if (error) {
      console.error('❌ Failed to send email:', error);
      return false;
    }
    
    console.log('✅ Email sent successfully!');
    console.log('📋 Response:', data);
    return true;
  } catch (error) {
    console.error('💥 Unexpected error:', error);
    return false;
  }
}

// Run the test
sendTestEmail()
  .then(success => {
    if (!success) {
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('💥 Unexpected error:', err);
    process.exit(1);
  }); 