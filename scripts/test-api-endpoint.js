#!/usr/bin/env node

/**
 * test-api-endpoint.js
 * 
 * This script tests the API endpoint for sending emails.
 * It simulates a contact form submission to the API endpoint.
 */

import fetch from 'node-fetch';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables from .env.test if it exists
try {
  const envFile = '.env.test';
  if (fs.existsSync(envFile)) {
    dotenv.config({ path: envFile });
    console.log(`✅ Loaded environment variables from ${envFile}`);
  } else {
    console.log('⚠️ No .env.test file found, using environment variables');
  }
} catch (error) {
  console.error('❌ Error loading environment variables:', error);
}

// Configure API endpoint
const API_URL = process.argv[2] || 'http://localhost:3000/api/send-email';

// Test data
const testData = {
  name: "API Test User",
  email: "api-test@example.com",
  company: "API Test Company",
  message: "This is a test message sent via the API endpoint."
};

// Send request to API endpoint
async function testApiEndpoint() {
  try {
    console.log(`🔌 Testing API endpoint: ${API_URL}`);
    console.log(`📝 Submitting test data:`, testData);
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });
    
    const responseData = await response.json();
    
    console.log(`🔄 Response status: ${response.status}`);
    console.log(`📋 Response data:`, responseData);
    
    if (response.ok) {
      console.log('✅ API endpoint test successful!');
      return true;
    } else {
      console.error('❌ API endpoint test failed!');
      return false;
    }
  } catch (error) {
    console.error('💥 Error testing API endpoint:', error);
    return false;
  }
}

// Run the test
testApiEndpoint()
  .then(success => {
    if (!success) {
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('💥 Unexpected error:', err);
    process.exit(1);
  }); 