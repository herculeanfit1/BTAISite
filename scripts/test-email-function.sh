#!/bin/bash

# test-email-function.sh
# Script to test the Azure Function email sending capability
#
# This script tests:
# - Valid email submissions
# - Missing required fields
# - Invalid email format
# - Empty request body

set -e  # Exit on any error

# Configuration
FUNCTION_APP_NAME="btai-email-relay"
RESOURCE_GROUP="BTAI-RG1"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Print with timestamp
function log() {
  echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"
}

function warn() {
  echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

function error() {
  echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
  exit 1
}

function test_case() {
  echo -e "${CYAN}[TEST CASE] $1${NC}"
}

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
  error "Azure CLI is not installed. Please install it first."
fi

# Check if user is logged in to Azure
if ! az account show &> /dev/null; then
  log "Please log in to Azure..."
  az login || error "Failed to log in to Azure"
fi

# Check if jq is installed
if ! command -v jq &> /dev/null; then
  error "jq is not installed. Please install it first (https://stedolan.github.io/jq/download/)"
fi

# Check if curl is installed
if ! command -v curl &> /dev/null; then
  error "curl is not installed. Please install it first."
fi

# Get the function key
log "Getting function key for SendContactForm..."
KEY=$(az functionapp function keys list \
  --name "$FUNCTION_APP_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --function-name "SendContactForm" \
  --query "default" -o tsv) || warn "Could not retrieve function key, trying without it"

# Set the function URL with key if available
if [ -n "$KEY" ]; then
  FUNCTION_URL="https://$FUNCTION_APP_NAME.azurewebsites.net/api/SendContactForm?code=$KEY"
  log "Using function URL with key: $FUNCTION_URL"
else
  FUNCTION_URL="https://$FUNCTION_APP_NAME.azurewebsites.net/api/SendContactForm"
  warn "Function key not found. Using URL without key: $FUNCTION_URL"
fi

# Test Case 1: Valid submission
test_case "Valid submission with all fields"
log "Sending test request with all fields..."
RESPONSE=$(curl -s -X POST "$FUNCTION_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "company": "Test Company",
    "message": "This is a test message with all fields."
  }')

echo "Response:"
echo "$RESPONSE" | jq '.'

# Test Case 2: Valid submission without company field
test_case "Valid submission without optional fields"
log "Sending test request without company field..."
RESPONSE=$(curl -s -X POST "$FUNCTION_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "message": "This is a test message without company field."
  }')

echo "Response:"
echo "$RESPONSE" | jq '.'

# Test Case 3: Missing required field (name)
test_case "Missing required field (name)"
log "Sending test request with missing name field..."
RESPONSE=$(curl -s -X POST "$FUNCTION_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "message": "This is a test message with missing name."
  }')

echo "Response:"
echo "$RESPONSE" | jq '.'

# Test Case 4: Missing required field (email)
test_case "Missing required field (email)"
log "Sending test request with missing email field..."
RESPONSE=$(curl -s -X POST "$FUNCTION_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "message": "This is a test message with missing email."
  }')

echo "Response:"
echo "$RESPONSE" | jq '.'

# Test Case 5: Missing required field (message)
test_case "Missing required field (message)"
log "Sending test request with missing message field..."
RESPONSE=$(curl -s -X POST "$FUNCTION_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com"
  }')

echo "Response:"
echo "$RESPONSE" | jq '.'

# Test Case 6: Invalid email format
test_case "Invalid email format"
log "Sending test request with invalid email format..."
RESPONSE=$(curl -s -X POST "$FUNCTION_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "invalid-email",
    "message": "This is a test message with invalid email."
  }')

echo "Response:"
echo "$RESPONSE" | jq '.'

# Test Case 7: Empty request body
test_case "Empty request body"
log "Sending test request with empty body..."
RESPONSE=$(curl -s -X POST "$FUNCTION_URL" \
  -H "Content-Type: application/json" \
  -d '{}')

echo "Response:"
echo "$RESPONSE" | jq '.'

log "All tests completed."
log ""
log "To verify results:"
log "1. Check if test cases 1 and 2 returned success (status 200)"
log "2. Check if test cases 3-7 returned appropriate error messages"
log "3. Verify that test emails were received (for successful test cases)"
log "4. Check Azure Function logs in the Azure Portal for detailed diagnostics" 