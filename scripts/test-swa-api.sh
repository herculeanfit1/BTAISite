#!/bin/bash

# test-swa-api.sh
# Script to test the Azure Static Web Apps API for email sending

set -e  # Exit on any error

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
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

log "Starting Azure Static Web Apps API test"

# Check if swa CLI is installed
if ! command -v swa &> /dev/null; then
  error "Azure Static Web Apps CLI is not installed. Please install it first with: npm install -g @azure/static-web-apps-cli"
fi

# Test data
TEST_DATA='{
  "name": "SWA API Test User",
  "email": "swa-test@example.com",
  "company": "SWA Test Company",
  "message": "This is a test message sent via the SWA API."
}'

# Run SWA CLI in development mode
log "Starting SWA development server..."
log "This will start a local SWA emulator with our API"

# Set environment variables for the API
export RESEND_API_KEY=$(grep -A 1 '"RESEND_API_KEY"' .github/workflows/azure-static-web-apps.yml | tail -1 | awk -F'"' '{print $4}' || echo "")
export EMAIL_FROM="no-reply@bridgingtrust.ai"
export EMAIL_TO="sales@bridgingtrust.ai" 
export RESEND_TEST_MODE="true"

# Output test configuration
log "Test configuration:"
log "EMAIL_FROM: ${EMAIL_FROM}"
log "EMAIL_TO: ${EMAIL_TO}"
log "RESEND_TEST_MODE: ${RESEND_TEST_MODE}"
log "RESEND_API_KEY: ${RESEND_API_KEY:0:8}..." 

# Start SWA CLI in the background with the API
swa start out --api-location api &
SWA_PID=$!

# Wait for SWA CLI to start
log "Waiting for SWA CLI to start..."
sleep 5

# Test the API
log "Testing API endpoint..."
RESPONSE=$(curl -s -X POST "http://localhost:4280/api/send-email" \
  -H "Content-Type: application/json" \
  -d "$TEST_DATA")

echo "Response: $RESPONSE"

# Kill the SWA CLI process
log "Stopping SWA CLI..."
kill $SWA_PID

log "Test completed!" 