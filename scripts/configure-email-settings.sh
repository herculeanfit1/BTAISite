#!/bin/bash

# configure-email-settings.sh
# Script to configure environment variables for the email function
#
# This script securely sets up:
# - RESEND_API_KEY: API key from Resend.com
# - EMAIL_FROM: Sender email 
# - EMAIL_TO: Recipient email

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

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
  error "Azure CLI is not installed. Please install it first."
fi

# Check if user is logged in to Azure
if ! az account show &> /dev/null; then
  log "Please log in to Azure..."
  az login || error "Failed to log in to Azure"
fi

# Check if Function App exists
if ! az functionapp show --name "$FUNCTION_APP_NAME" --resource-group "$RESOURCE_GROUP" &> /dev/null; then
  error "Function App $FUNCTION_APP_NAME does not exist in resource group $RESOURCE_GROUP"
fi

log "This script will configure the email settings for the Azure Function App."
log "You will be prompted to enter the following information:"
log "1. Resend API Key (from resend.com)"
log "2. Sender email address (must be verified in Resend)"
log "3. Recipient email address (where form submissions will be sent)"

# Prompt for Resend API Key
read -p "Enter your Resend API Key: " RESEND_API_KEY
if [ -z "$RESEND_API_KEY" ]; then
  error "Resend API Key cannot be empty"
fi

# Prompt for sender email
read -p "Enter sender email address (e.g., no-reply@bridgingtrust.ai): " EMAIL_FROM
if [ -z "$EMAIL_FROM" ]; then
  error "Sender email address cannot be empty"
fi

# Validate email format
if ! [[ "$EMAIL_FROM" =~ ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]]; then
  error "Invalid sender email format"
fi

# Prompt for recipient email
read -p "Enter recipient email address (e.g., sales@bridgingtrust.ai): " EMAIL_TO
if [ -z "$EMAIL_TO" ]; then
  error "Recipient email address cannot be empty"
fi

# Validate email format
if ! [[ "$EMAIL_TO" =~ ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]]; then
  error "Invalid recipient email format"
fi

# Set Function App settings
log "Setting Function App settings..."
az functionapp config appsettings set \
  --name "$FUNCTION_APP_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --settings \
    "RESEND_API_KEY=$RESEND_API_KEY" \
    "EMAIL_FROM=$EMAIL_FROM" \
    "EMAIL_TO=$EMAIL_TO" || error "Failed to set Function App settings"

log "Email settings configured successfully!"
log "Function App: $FUNCTION_APP_NAME"
log "Sender: $EMAIL_FROM"
log "Recipient: $EMAIL_TO"
log ""
log "You can test the function with:"
log "curl -X POST \"https://$FUNCTION_APP_NAME.azurewebsites.net/api/SendContactForm\" \\"
log "  -H \"Content-Type: application/json\" \\"
log "  -d '{\"name\":\"Test User\",\"email\":\"test@example.com\",\"message\":\"This is a test message\"}'" 