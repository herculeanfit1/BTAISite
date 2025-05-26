#!/bin/bash

# test-email-api-route.sh
# Script to test the Next.js API route for email forwarding

set -e  # Exit on any error

# Set default values
API_URL="${1:-http://localhost:3000/api/send-email}"

echo "Testing email API route at: $API_URL"
echo

echo "========================================"
echo "TEST CASE 1: Valid submission with all fields"
echo "========================================"
curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "company": "Test Company",
    "subject": "API Route Test",
    "message": "This is a test message from the API route test script."
  }' | jq '.'

echo
echo "========================================"
echo "TEST CASE 2: Validation error (missing required field)"
echo "========================================"
curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "company": "Test Company",
    "subject": "Missing Email Test",
    "message": "This test should fail validation because email is missing."
  }' | jq '.'

echo
echo "========================================"
echo "TEST CASE 3: Validation error (invalid email format)"
echo "========================================"
curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "invalid-email",
    "subject": "Invalid Email Test",
    "message": "This test should fail validation because email format is invalid."
  }' | jq '.'

echo
echo "========================================"
echo "TEST CASE 4: Validation error (message too short)"
echo "========================================"
curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "subject": "Short Message Test",
    "message": "Too short"
  }' | jq '.'

echo
echo "All tests completed."
echo
echo "Next steps:"
echo "1. Check server logs for request processing details"
echo "2. Verify Azure Function logs in Azure Portal"
echo "3. Check email inbox for test messages (for successful tests)" 