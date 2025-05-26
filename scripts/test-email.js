#!/usr/bin/env node

/**
 * Email Testing Script for Bridging Trust AI
 * Tests the Resend email configuration
 */

import { config } from 'dotenv';
import { Resend } from 'resend';

config({ path: '.env.local' });

async function testEmailConfig() {
  console.log('🧪 Testing Bridging Trust AI Email Configuration\n');

  // Check environment variables
  const requiredVars = ['RESEND_API_KEY', 'EMAIL_FROM', 'EMAIL_ADMIN'];
  const missing = requiredVars.filter(varName => !process.env[varName]);

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(varName => console.error(`   - ${varName}`));
    console.error('\nPlease check your .env.local file');
    process.exit(1);
  }

  console.log('✅ Environment variables configured');
  console.log(`   - RESEND_API_KEY: ${process.env.RESEND_API_KEY?.substring(0, 10)}...`);
  console.log(`   - EMAIL_FROM: ${process.env.EMAIL_FROM}`);
  console.log(`   - EMAIL_ADMIN: ${process.env.EMAIL_ADMIN}`);
  console.log();

  // Test Resend connection
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);

    console.log('🔌 Testing Resend API connection...');
    
    // Try to get domains (this will validate the API key)
    const domains = await resend.domains.list();
    console.log('✅ Resend API connection successful');
    
    if (domains.data && domains.data.length > 0) {
      console.log('📧 Verified domains:');
      domains.data.forEach(domain => {
        console.log(`   - ${domain.name} (${domain.status})`);
      });
    } else {
      console.log('⚠️  No verified domains found. You need to verify bridgingtrust.ai in Resend dashboard.');
    }

  } catch (error) {
    console.error('❌ Resend API connection failed:', error.message);
    process.exit(1);
  }

  console.log('\n🎉 Email configuration test completed successfully!');
  console.log('\nNext steps:');
  console.log('1. Verify bridgingtrust.ai domain in Resend dashboard');
  console.log('2. Test contact form at http://localhost:3000');
  console.log('3. Deploy to Azure Static Web Apps with environment variables');
}

// Run the test
testEmailConfig().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
}); 