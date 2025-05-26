#!/bin/bash

# manual-email-test.sh
# Script to manually test the Azure Function email sending capability with full response output

set -e  # Exit on any error

# Set the function URL with the key from environment variable
if [ -z "$AZURE_FUNCTION_KEY" ]; then
    echo "Error: AZURE_FUNCTION_KEY environment variable is not set"
    echo "Please set it with: export AZURE_FUNCTION_KEY=your_key_here"
    exit 1
fi

FUNCTION_URL="https://btai-email-relay.azurewebsites.net/api/SendContactForm?code=${AZURE_FUNCTION_KEY}"

echo "========================================"
echo "TEST CASE 1: Valid submission with all fields"
echo "========================================"
curl -s -X POST "$FUNCTION_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "company": "Test Company",
    "message": "This is a test message with all fields."
  }' | jq '.'

echo
echo "========================================"
echo "TEST CASE 2: Valid submission without company field"
echo "========================================"
curl -s -X POST "$FUNCTION_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "message": "This is a test message without company field."
  }' | jq '.'

echo
echo "========================================"
echo "TEST CASE 3: Missing required field (name)"
echo "========================================"
curl -s -X POST "$FUNCTION_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "message": "This is a test message with missing name."
  }' | jq '.'

echo
echo "========================================"
echo "TEST CASE 4: Missing required field (email)"
echo "========================================"
curl -s -X POST "$FUNCTION_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "message": "This is a test message with missing email."
  }' | jq '.'

echo
echo "========================================"
echo "TEST CASE 5: Missing required field (message)"
echo "========================================"
curl -s -X POST "$FUNCTION_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com"
  }' | jq '.'

echo
echo "========================================"
echo "TEST CASE 6: Invalid email format"
echo "========================================"
curl -s -X POST "$FUNCTION_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "invalid-email",
    "message": "This is a test message with invalid email."
  }' | jq '.'

echo
echo "========================================"
echo "TEST CASE 7: Empty request body"
echo "========================================"
curl -s -X POST "$FUNCTION_URL" \
  -H "Content-Type: application/json" \
  -d '{}' | jq '.'

echo
echo "========================================"
echo "TEST CASE 8: Special characters in message"
echo "========================================"
curl -s -X POST "$FUNCTION_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "message": "Special characters: áéíóú ñ € 😊 <script>alert(\"test\")</script>"
  }' | jq '.'

echo
echo "All tests completed."
echo "Please check your email inbox to verify receipt of the test emails." 