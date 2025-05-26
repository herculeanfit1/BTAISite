#!/bin/bash

# update-function-settings.sh
# Script to update Azure Function App settings for email functionality

set -e  # Exit on any error

# Configuration
FUNCTION_APP_NAME="btai-email-relay"
RESOURCE_GROUP="BTAI-RG1"

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

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
  error "Azure CLI is not installed. Please install it first."
fi

# Check if user is logged in to Azure
if ! az account show &> /dev/null; then
  log "Please log in to Azure..."
  az login || error "Failed to log in to Azure"
fi

# Prompt for Resend API Key if not provided
if [ -z "$RESEND_API_KEY" ]; then
  read -sp "Enter your Resend API Key: " RESEND_API_KEY
  echo
  if [ -z "$RESEND_API_KEY" ]; then
    error "Resend API Key is required"
  fi
fi

# Update Function App settings
log "Updating Azure Function App settings..."
az functionapp config appsettings set \
  --name "$FUNCTION_APP_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --settings \
  "RESEND_API_KEY=$RESEND_API_KEY" \
  "EMAIL_FROM=no-reply@bridgingtrust.ai" \
  "EMAIL_TO=sales@bridgingtrust.ai" || error "Failed to update Function App settings"

log "Function App settings updated successfully!"
log "Configured values:"
log "- EMAIL_FROM: no-reply@bridgingtrust.ai"
log "- EMAIL_TO: sales@bridgingtrust.ai"
log "- RESEND_API_KEY: [HIDDEN]"

# Restart the Function App to apply settings
log "Restarting Function App to apply new settings..."
az functionapp restart \
  --name "$FUNCTION_APP_NAME" \
  --resource-group "$RESOURCE_GROUP" || warn "Failed to restart Function App"

log "Checking Function App status..."
STATUS=$(az functionapp show \
  --name "$FUNCTION_APP_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --query "state" -o tsv) || warn "Failed to get Function App status"

if [ "$STATUS" == "Running" ]; then
  log "Function App is running!"
else
  warn "Function App state is: $STATUS"
fi

log "Settings have been updated. To test the email functionality:"
log "1. Run: bash scripts/test-email-function.sh"
log "2. Or test through the website contact form" 