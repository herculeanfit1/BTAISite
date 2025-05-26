#!/usr/bin/env node

/**
 * test-live-api.js
 * 
 * This script tests the live production API endpoint for sending emails.
 */

import fetch from 'node-fetch';

// Configuration - defaults to the live site
const SITE_URL = process.argv[2] || 'https://bridgingtrust.ai';
const API_ENDPOINT = '/api/send-email';

// Test data
const testData = {
  name: "Live API Test",
  email: "live-test@example.com",
  company: "Live Test Company",
  message: "This is a test message sent to the live production API."
};

// Test the live API endpoint
async function testLiveApi() {
  try {
    const url = `${SITE_URL}${API_ENDPOINT}`;
    console.log(`🌐 Testing live API endpoint: ${url}`);
    console.log(`📝 Submitting test data:`, testData);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });
    
    console.log(`🔄 Response status: ${response.status}`);
    
    const responseData = await response.json().catch(() => null);
    if (responseData) {
      console.log(`📋 Response data:`, responseData);
    } else {
      console.log(`⚠️ No valid JSON response received`);
    }
    
    if (response.ok) {
      console.log('✅ Live API endpoint test successful!');
      return true;
    } else {
      console.error('❌ Live API endpoint test failed!');
      return false;
    }
  } catch (error) {
    console.error('💥 Error testing live API endpoint:', error);
    return false;
  }
}

// Run the test
testLiveApi()
  .then(success => {
    if (!success) {
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('💥 Unexpected error:', err);
    process.exit(1);
  }); 