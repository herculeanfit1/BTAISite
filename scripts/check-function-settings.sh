#!/bin/bash

# check-function-settings.sh
# Script to verify environment variables and settings for the email function
#
# This script checks:
# - If the function app exists
# - If required settings are configured (safely without exposing values)
# - Basic connectivity to the function app

set -e  # Exit on any error

# Configuration
RESOURCE_GROUP="BTAI-RG1"
FUNCTION_APP_NAME="btai-email-relay"

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

function success() {
  echo -e "${GREEN}✓ $1${NC}"
}

function failure() {
  echo -e "${RED}✗ $1${NC}"
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

log "Checking Function App settings for $FUNCTION_APP_NAME..."

# Check if Function App exists
if az functionapp show --name "$FUNCTION_APP_NAME" --resource-group "$RESOURCE_GROUP" &> /dev/null; then
  success "Function App $FUNCTION_APP_NAME exists"
else
  failure "Function App $FUNCTION_APP_NAME does not exist in resource group $RESOURCE_GROUP"
  error "Please create the function app first using the deploy-email-function.sh script"
fi

# Get Function App settings
log "Retrieving Function App settings..."
SETTINGS=$(az functionapp config appsettings list --name "$FUNCTION_APP_NAME" --resource-group "$RESOURCE_GROUP" -o json) || error "Failed to retrieve Function App settings"

# Check required settings
log "Checking required settings..."

# Check RESEND_API_KEY
if echo "$SETTINGS" | grep -q "RESEND_API_KEY"; then
  API_KEY=$(echo "$SETTINGS" | jq -r '.[] | select(.name=="RESEND_API_KEY") | .value')
  if [ -z "$API_KEY" ]; then
    failure "RESEND_API_KEY is configured but empty"
  else
    MASKED_KEY="${API_KEY:0:4}...${API_KEY:(-4)}"
    success "RESEND_API_KEY is configured ($MASKED_KEY)"
  fi
else
  failure "RESEND_API_KEY is not configured"
fi

# Check EMAIL_FROM
if echo "$SETTINGS" | grep -q "EMAIL_FROM"; then
  EMAIL_FROM=$(echo "$SETTINGS" | jq -r '.[] | select(.name=="EMAIL_FROM") | .value')
  if [ -z "$EMAIL_FROM" ]; then
    failure "EMAIL_FROM is configured but empty"
  else
    success "EMAIL_FROM is configured ($EMAIL_FROM)"
  fi
else
  failure "EMAIL_FROM is not configured"
fi

# Check EMAIL_TO
if echo "$SETTINGS" | grep -q "EMAIL_TO"; then
  EMAIL_TO=$(echo "$SETTINGS" | jq -r '.[] | select(.name=="EMAIL_TO") | .value')
  if [ -z "$EMAIL_TO" ]; then
    failure "EMAIL_TO is configured but empty"
  else
    success "EMAIL_TO is configured ($EMAIL_TO)"
  fi
else
  failure "EMAIL_TO is not configured"
fi

# Check application insights settings
log "Checking Application Insights configuration..."
if echo "$SETTINGS" | grep -q "APPINSIGHTS_INSTRUMENTATIONKEY"; then
  success "Application Insights is configured"
else
  warn "Application Insights is not configured, logging may be limited"
fi

# Check if function is running
log "Checking if function is running..."
STATUS=$(az functionapp show --name "$FUNCTION_APP_NAME" --resource-group "$RESOURCE_GROUP" --query "state" -o tsv)
if [ "$STATUS" == "Running" ]; then
  success "Function App is running"
else
  failure "Function App is not running (status: $STATUS)"
fi

# Check if function has SendContactForm
log "Checking for SendContactForm function..."
FUNCTIONS=$(az functionapp function list --name "$FUNCTION_APP_NAME" --resource-group "$RESOURCE_GROUP" -o json) || warn "Could not list functions"

if echo "$FUNCTIONS" | grep -q "SendContactForm"; then
  success "SendContactForm function exists"
else
  failure "SendContactForm function does not exist or could not be detected"
  warn "You may need to deploy the function code"
fi

# Check connectivity
log "Checking connectivity to function app..."
if curl -s "https://$FUNCTION_APP_NAME.azurewebsites.net/api/SendContactForm" > /dev/null; then
  success "Function app endpoint is accessible"
else
  warn "Function app endpoint returned an error (this may be normal if it expects POST requests)"
fi

log ""
log "Diagnostics complete. If you're experiencing issues:"
log "1. Check Azure Functions logs in the Azure Portal"
log "2. Verify Resend API key is valid at https://resend.com"
log "3. Make sure the sender domain is verified in Resend"
log "4. Try redeploying the function using deploy-email-function.sh" 