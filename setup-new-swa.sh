#!/bin/bash

# setup-new-swa.sh - Create a new Azure Static Web App in a different subscription
# This script automates moving the Bridging Trust AI website to a new subscription

set -e  # Exit on any error

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function for logging
function log() { echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"; }
function warn() { echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"; }
function error() { echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"; exit 1; }
function prompt() { echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"; }

# Configuration variables
TARGET_SUBSCRIPTION="cd461b28-ac0b-4217-8fc3-94029cb11612"
RESOURCE_GROUP="BTAI-RG1"
LOCATION="eastus"  # Default, will prompt to confirm
SWA_NAME="bridgingtrust-ai"  # Default, will prompt to confirm
GITHUB_REPO="your-github-org/BridgingTrustAI"  # Will prompt for this

log "Starting setup process for new Azure Static Web App"

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    error "Azure CLI is not installed. Please install it: https://docs.microsoft.com/cli/azure/install-azure-cli"
fi

# Login to Azure if not already logged in
az account show &> /dev/null || az login

# Verify subscription exists and set it as active
log "Setting target subscription: $TARGET_SUBSCRIPTION"
if ! az account show --subscription $TARGET_SUBSCRIPTION &> /dev/null; then
    error "Subscription $TARGET_SUBSCRIPTION not found or you don't have access to it."
fi
az account set --subscription $TARGET_SUBSCRIPTION

# Verify the resource group exists
log "Verifying resource group $RESOURCE_GROUP exists in subscription $TARGET_SUBSCRIPTION"
if ! az group show --name $RESOURCE_GROUP --subscription $TARGET_SUBSCRIPTION &> /dev/null; then
    error "Resource group $RESOURCE_GROUP not found in subscription $TARGET_SUBSCRIPTION"
fi
log "Resource group $RESOURCE_GROUP exists in the target subscription"

# Prompt for location
prompt "Enter Azure region for deployment [$LOCATION]: "
read input_location
LOCATION=${input_location:-$LOCATION}

# Prompt for Static Web App name
prompt "Enter name for new Static Web App [$SWA_NAME]: "
read input_swa_name
SWA_NAME=${input_swa_name:-$SWA_NAME}

# Prompt for GitHub repository information
prompt "Enter GitHub repository (format: owner/repo): "
read GITHUB_REPO

# Prompt for GitHub branch
prompt "Enter GitHub branch to deploy from [main]: "
read input_branch
GITHUB_BRANCH=${input_branch:-main}

# Prompt for Resend API key
prompt "Enter your Resend API key: "
read -s RESEND_API_KEY
echo ""

# Prompt for email configuration
prompt "Enter FROM email address [no-reply@bridgingtrust.ai]: "
read input_email_from
EMAIL_FROM=${input_email_from:-no-reply@bridgingtrust.ai}

prompt "Enter TO email address [sales@bridgingtrust.ai]: "
read input_email_to
EMAIL_TO=${input_email_to:-sales@bridgingtrust.ai}

# Checking available parameters for the command
log "Checking available parameters for az staticwebapp create..."
az staticwebapp create --help | grep -i "artifact\|api" || true

# Create the Static Web App
log "Creating Static Web App $SWA_NAME in resource group $RESOURCE_GROUP"
SWA_RESULT=$(az staticwebapp create \
    --name $SWA_NAME \
    --resource-group $RESOURCE_GROUP \
    --location $LOCATION \
    --source https://github.com/$GITHUB_REPO \
    --branch $GITHUB_BRANCH \
    --build-property app_location="/" \
    --build-property api_location="api" \
    --build-property output_location="out" \
    --login-with-github \
    --output json)

# Get the Static Web App ID
SWA_ID=$(echo $SWA_RESULT | jq -r '.id')
log "Static Web App created with ID: $SWA_ID"

# Set up environment variables
log "Configuring environment variables"
az staticwebapp appsettings set \
    --name $SWA_NAME \
    --resource-group $RESOURCE_GROUP \
    --setting-names \
    RESEND_API_KEY="$RESEND_API_KEY" \
    EMAIL_FROM="$EMAIL_FROM" \
    EMAIL_TO="$EMAIL_TO"

# Get the deployment token
DEPLOYMENT_TOKEN=$(az staticwebapp secrets list \
    --name $SWA_NAME \
    --resource-group $RESOURCE_GROUP \
    --query "properties.apiKey" -o tsv)

# Output summary
log "========================================================"
log "SETUP COMPLETE! Summary of new resources:"
log "========================================================"
log "Subscription ID: $TARGET_SUBSCRIPTION"
log "Resource Group:  $RESOURCE_GROUP"
log "Location:        $LOCATION"
log "Static Web App:  $SWA_NAME"
log "GitHub Repo:     $GITHUB_REPO"
log "Branch:          $GITHUB_BRANCH"
log "API Location:    api"
log "Build Output:    out"
log "========================================================"
log "IMPORTANT: Update your GitHub secrets with the new token"
log "========================================================"
log "Go to: https://github.com/$GITHUB_REPO/settings/secrets/actions"
log "Update secret: AZURE_STATIC_WEB_APPS_API_TOKEN"
log "New value: $DEPLOYMENT_TOKEN"
log "========================================================"
log "After updating the secret, trigger a new build with:"
log "git commit --allow-empty -m 'Trigger deployment to new Azure Static Web App'"
log "git push origin $GITHUB_BRANCH"
log "========================================================" 