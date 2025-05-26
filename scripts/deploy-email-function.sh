#!/bin/bash

# deploy-email-function.sh
# Script to deploy the email function to Azure Function App
# 
# This script handles:
# 1. Installing dependencies
# 2. Building the function
# 3. Deploying to Azure
# 4. Setting up Application Insights

set -e  # Exit on any error

# Configuration
RESOURCE_GROUP="BTAI-RG1"
FUNCTION_APP_NAME="btai-email-relay"
LOCATION="eastus"
STORAGE_ACCOUNT_NAME="btaiemailstorage"
APP_INSIGHTS_NAME="btai-email-insights"

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

# Create resource group if it doesn't exist
if ! az group show --name "$RESOURCE_GROUP" &> /dev/null; then
  log "Creating resource group $RESOURCE_GROUP in $LOCATION..."
  az group create --name "$RESOURCE_GROUP" --location "$LOCATION" || error "Failed to create resource group"
else
  log "Resource group $RESOURCE_GROUP already exists"
fi

# Create storage account if it doesn't exist
if ! az storage account show --name "$STORAGE_ACCOUNT_NAME" --resource-group "$RESOURCE_GROUP" &> /dev/null; then
  log "Creating storage account $STORAGE_ACCOUNT_NAME..."
  az storage account create \
    --name "$STORAGE_ACCOUNT_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --location "$LOCATION" \
    --sku "Standard_LRS" \
    --kind "StorageV2" || error "Failed to create storage account"
else
  log "Storage account $STORAGE_ACCOUNT_NAME already exists"
fi

# Create Application Insights resource if it doesn't exist
if ! az monitor app-insights component show --app "$APP_INSIGHTS_NAME" --resource-group "$RESOURCE_GROUP" &> /dev/null; then
  log "Creating Application Insights $APP_INSIGHTS_NAME..."
  az monitor app-insights component create \
    --app "$APP_INSIGHTS_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --location "$LOCATION" || warn "Failed to create Application Insights - may need to create manually in portal"
  
  # Get the instrumentation key
  INSTRUMENTATION_KEY=$(az monitor app-insights component show \
    --app "$APP_INSIGHTS_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --query "instrumentationKey" -o tsv) || warn "Could not retrieve instrumentation key"
else
  log "Application Insights $APP_INSIGHTS_NAME already exists"
  
  # Get the instrumentation key
  INSTRUMENTATION_KEY=$(az monitor app-insights component show \
    --app "$APP_INSIGHTS_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --query "instrumentationKey" -o tsv) || warn "Could not retrieve instrumentation key"
fi

# Create Function App if it doesn't exist
if ! az functionapp show --name "$FUNCTION_APP_NAME" --resource-group "$RESOURCE_GROUP" &> /dev/null; then
  log "Creating Function App $FUNCTION_APP_NAME..."
  az functionapp create \
    --name "$FUNCTION_APP_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --storage-account "$STORAGE_ACCOUNT_NAME" \
    --consumption-plan-location "$LOCATION" \
    --runtime "node" \
    --runtime-version "18" \
    --functions-version "4" \
    --app-insights "$APP_INSIGHTS_NAME" || error "Failed to create Function App"
else
  log "Function App $FUNCTION_APP_NAME already exists"
  
  # Update App Insights settings
  if [ ! -z "$INSTRUMENTATION_KEY" ]; then
    log "Updating Application Insights configuration..."
    az functionapp config appsettings set \
      --name "$FUNCTION_APP_NAME" \
      --resource-group "$RESOURCE_GROUP" \
      --settings "APPINSIGHTS_INSTRUMENTATIONKEY=$INSTRUMENTATION_KEY" || warn "Could not update Application Insights configuration"
  fi
fi

# Navigate to the email function directory
cd "$(dirname "$0")/../email-function" || error "Could not navigate to email-function directory"

# Install dependencies
log "Installing dependencies..."
npm ci || error "Failed to install dependencies"

# Deploy the function
log "Deploying function to Azure..."
if command -v func &> /dev/null; then
  func azure functionapp publish "$FUNCTION_APP_NAME" --force || error "Failed to deploy function"
else
  warn "Azure Functions Core Tools not installed. Installing..."
  npm install -g azure-functions-core-tools@4 --unsafe-perm || error "Failed to install Azure Functions Core Tools"
  func azure functionapp publish "$FUNCTION_APP_NAME" --force || error "Failed to deploy function"
fi

log "Deployment completed successfully!"
log "Function URL: https://$FUNCTION_APP_NAME.azurewebsites.net/api/SendContactForm"
log ""
log "NOTE: You still need to configure the following app settings:"
log "- RESEND_API_KEY"
log "- EMAIL_FROM"
log "- EMAIL_TO"
log ""
log "To configure these settings, run: ./scripts/configure-email-settings.sh" 