#!/usr/bin/env node

/**
 * test-resend-api-key.js
 * 
 * A simple script to test if a Resend API key is working correctly
 * by attempting to send a test email.
 */

// Import Resend using ES modules
import { Resend } from 'resend';

// Get the API key from command line or environment
const apiKey = process.argv[2] || process.env.RESEND_API_KEY;

if (!apiKey) {
  console.error('❌ No API key provided.');
  console.error('Usage: node test-resend-api-key.js YOUR_API_KEY');
  console.error('   or: RESEND_API_KEY=your_key node test-resend-api-key.js');
  process.exit(1);
}

console.log(`🔑 Testing Resend API key: ${apiKey.substring(0, 10)}...`);

// Create Resend instance
const resend = new Resend(apiKey);

// Simple test function
async function testResendApi() {
  try {
    console.log('📧 Attempting to send a test email...');
    
    const data = await resend.emails.send({
      from: 'no-reply@bridgingtrust.ai',
      to: 'onboarding@resend.dev', // Resend's testing email address
      subject: 'API Key Test',
      html: '<p>This is a test to verify the Resend API key is working.</p>',
      text: 'This is a test to verify the Resend API key is working.'
    });
    
    console.log('✅ API key is valid!');
    console.log('📬 Response:', data);
    return true;
  } catch (error) {
    console.error('❌ API key test failed:');
    console.error('🔍 Error:', error);
    return false;
  }
}

// Run the test
testResendApi()
  .then(success => {
    if (!success) {
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('💥 Unexpected error:', err);
    process.exit(1);
  }); 