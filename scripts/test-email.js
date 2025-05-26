#!/usr/bin/env node

/**
 * Email Configuration Test Script
 * Tests the email system configuration and functionality
 */

import { sendContactEmail } from '../src/lib/email.js';

async function testEmailConfiguration() {
  console.log('🧪 Testing Email Configuration...\n');

  // Check environment variables
  const requiredEnvVars = [
    'RESEND_API_KEY',
    'EMAIL_FROM',
    'EMAIL_TO',
    'EMAIL_ADMIN'
  ];

  console.log('📋 Environment Variables:');
  let missingVars = [];
  
  requiredEnvVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      console.log(`✅ ${varName}: ${value.substring(0, 10)}...`);
    } else {
      console.log(`❌ ${varName}: Missing`);
      missingVars.push(varName);
    }
  });

  if (missingVars.length > 0) {
    console.log(`\n❌ Missing required environment variables: ${missingVars.join(', ')}`);
    console.log('Please set these variables in your .env file or Azure Static Web Apps configuration.');
    return;
  }

  // Test email sending
  console.log('\n📧 Testing Email Sending...');
  
  const testData = {
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    company: 'Test Company',
    message: 'This is a test message from the email configuration script.',
    ipAddress: '127.0.0.1',
    userAgent: 'Email Test Script'
  };

  try {
    const result = await sendContactEmail(testData);
    
    if (result.success) {
      console.log('✅ Email test successful!');
      console.log(`📨 Message: ${result.message}`);
    } else {
      console.log('❌ Email test failed!');
      console.log(`📨 Message: ${result.message}`);
      
      if (result.rateLimited) {
        console.log('⏰ Rate limited - this is normal for testing');
      }
      
      if (result.circuitBreakerOpen) {
        console.log('🔌 Circuit breaker open - service temporarily unavailable');
      }
    }
  } catch (error) {
    console.log('❌ Email test error:', error.message);
  }

  console.log('\n🏁 Email configuration test complete!');
}

// Run the test
testEmailConfiguration().catch(console.error); 