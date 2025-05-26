#!/bin/bash

# update-resend-api-key.sh
# Script to update the Resend API key in all necessary places
# This will update:
# 1. Local settings file (email-function/local.settings.json)
# 2. Azure Function App settings
# And remind about:
# 3. GitHub secrets that need manual updates

set -e  # Exit on any error

# Configuration
FUNCTION_APP_NAME="btai-email-relay"
RESOURCE_GROUP="BTAI-RG1"
LOCAL_SETTINGS_FILE="email-function/local.settings.json"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
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

function info() {
  echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

# Check if jq is installed (used for JSON manipulation)
if ! command -v jq &> /dev/null; then
  error "jq is not installed. Please install it first (https://stedolan.github.io/jq/download/)"
fi

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
  warn "Azure CLI is not installed. Will not update Azure Function App settings."
  SKIP_AZURE=true
else
  SKIP_AZURE=false
fi

# Check if user is logged in to Azure
if [ "$SKIP_AZURE" = false ]; then
  if ! az account show &> /dev/null; then
    warn "Not logged in to Azure. Will not update Azure Function App settings."
    SKIP_AZURE=true
  fi
fi

# Check if local settings file exists
if [ ! -f "$LOCAL_SETTINGS_FILE" ]; then
  warn "Local settings file not found at $LOCAL_SETTINGS_FILE. Will not update local settings."
  SKIP_LOCAL=true
else
  SKIP_LOCAL=false
fi

# Prompt for the new Resend API key
echo "Please enter your new Resend API key (should start with 're_'):"
read -s RESEND_API_KEY
echo

# Validate the API key format
if [[ ! "$RESEND_API_KEY" =~ ^re_ ]]; then
  warn "The API key doesn't start with 're_'. Are you sure this is a valid Resend API key?"
  read -p "Continue anyway? (y/n): " CONTINUE
  if [[ ! "$CONTINUE" =~ ^[Yy] ]]; then
    error "Aborted by user."
  fi
fi

# Update local settings file
if [ "$SKIP_LOCAL" = false ]; then
  log "Updating local settings file..."
  
  # Create a backup
  cp "$LOCAL_SETTINGS_FILE" "${LOCAL_SETTINGS_FILE}.bak"
  
  # Update the RESEND_API_KEY in the local settings file
  cat "$LOCAL_SETTINGS_FILE" | jq --arg key "$RESEND_API_KEY" '.Values.RESEND_API_KEY = $key' > "${LOCAL_SETTINGS_FILE}.tmp"
  mv "${LOCAL_SETTINGS_FILE}.tmp" "$LOCAL_SETTINGS_FILE"
  
  log "Local settings file updated successfully. Backup created at ${LOCAL_SETTINGS_FILE}.bak"
fi

# Update Azure Function App settings
if [ "$SKIP_AZURE" = false ]; then
  log "Updating Azure Function App settings..."
  
  # Update the RESEND_API_KEY in Azure Function App settings
  az functionapp config appsettings set \
    --name "$FUNCTION_APP_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --settings "RESEND_API_KEY=$RESEND_API_KEY" \
    --output none
  
  log "Azure Function App settings updated successfully."
  
  # Restart the Function App to apply settings
  log "Restarting Function App to apply new settings..."
  az functionapp restart \
    --name "$FUNCTION_APP_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --output none
  
  log "Function App restarted."
fi

# Check if API key exists in any test scripts
log "Checking for hardcoded API keys in test scripts..."
API_KEY_FILES=$(grep -r "re_" --include="*.sh" --include="*.js" scripts/ 2>/dev/null || echo "")

if [ -n "$API_KEY_FILES" ]; then
  warn "Potential hardcoded API keys found in the following files:"
  echo "$API_KEY_FILES"
  warn "Please manually check and update these files if necessary."
else
  log "No hardcoded API keys found in test scripts."
fi

# Remind about GitHub secrets
info "IMPORTANT: Remember to update the RESEND_API_KEY in your GitHub repository secrets."
info "Go to your GitHub repository > Settings > Secrets and variables > Actions"
info "Update the RESEND_API_KEY secret with the new value."

# Final summary
log "==================================================="
log "Resend API Key Update Summary:"
log "==================================================="
if [ "$SKIP_LOCAL" = false ]; then
  log "✅ Local settings file: Updated"
else
  warn "❌ Local settings file: Skipped (file not found)"
fi

if [ "$SKIP_AZURE" = false ]; then
  log "✅ Azure Function App: Updated and restarted"
else
  warn "❌ Azure Function App: Skipped (Azure CLI not available or not logged in)"
fi

info "⚠️  GitHub Secrets: Manual update required"
if [ -n "$API_KEY_FILES" ]; then
  warn "⚠️  Test Scripts: Potential hardcoded keys found, manual check required"
else
  log "✅ Test Scripts: No hardcoded keys found"
fi
log "==================================================="

log "Resend API key update process completed." 