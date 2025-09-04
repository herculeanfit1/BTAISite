#!/bin/bash

set -Eeuo pipefail  # Enhanced error handling
IFS=$'\n\t'         # Secure IFS
trap 'echo "❌ Deploy new SWA failed at line $LINENO"' ERR

# Azure Static Web App Deployment Script
# This script automates the deployment of the Bridging Trust AI website to Azure Static Web Apps
# It creates Azure resources directly without GitHub integration

# Exit on error
set -e

# Configuration variables
RESOURCE_GROUP="BTAI-RG1"  # Using existing resource group
LOCATION="eastus2"
APP_NAME="bridgingtrust-website"
APP_SRC_LOCATION="/"
APP_API_LOCATION="api"
APP_OUTPUT_LOCATION=".next"
NODE_VERSION="20.19.1"
APP_SKU="Standard"
CUSTOM_DOMAIN="bridgingtrust.ai"

# Print banner
echo "================================================"
echo "Bridging Trust AI - Azure Static Web App Deployment"
echo "================================================"
echo ""
echo "This script will create Azure resources for the Bridging Trust AI website."
echo "GitHub integration will need to be set up manually later."
echo ""
echo "Configuration:"
echo "  Resource Group: $RESOURCE_GROUP (existing)"
echo "  Location: $LOCATION"
echo "  App Name: $APP_NAME"
echo "  Node Version: $NODE_VERSION"
echo "  SKU: $APP_SKU"
echo ""

# Check if logged in to Azure CLI
if ! az account show &>/dev/null; then
  echo "⚠️ Not logged in to Azure CLI. Please run 'az login' first."
  exit 1
fi

echo "✅ Verified Azure CLI login"

# Check if resource group exists
if ! az group show --name "$RESOURCE_GROUP" &>/dev/null; then
  echo "❌ Resource group $RESOURCE_GROUP does not exist. Please create it first or check the name."
  exit 1
else
  echo "✅ Using existing resource group: $RESOURCE_GROUP"
fi

# Create Application Insights
echo "Creating Application Insights..."
APPINSIGHTS_NAME="${APP_NAME}-insights"
az monitor app-insights component create \
  --app "$APPINSIGHTS_NAME" \
  --location "$LOCATION" \
  --resource-group "$RESOURCE_GROUP" \
  --application-type web
APPINSIGHTS_KEY=$(az monitor app-insights component show \
  --app "$APPINSIGHTS_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --query instrumentationKey \
  --output tsv)
echo "✅ Application Insights created: $APPINSIGHTS_NAME"

# Create Static Web App without GitHub integration
echo "Creating Static Web App (without GitHub integration)..."
az staticwebapp create \
  --name "$APP_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --location "$LOCATION" \
  --sku "$APP_SKU"
echo "✅ Static Web App created: $APP_NAME"

# Configure environment variables
echo "Configuring environment variables..."
az staticwebapp appsettings set \
  --name "$APP_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --setting-names \
  APPINSIGHTS_INSTRUMENTATIONKEY="$APPINSIGHTS_KEY" \
  NODE_VERSION="$NODE_VERSION" \
  WEBSITE_NODE_DEFAULT_VERSION="$NODE_VERSION"
echo "✅ Environment variables configured"

# Get the default hostname
DEFAULT_HOSTNAME=$(az staticwebapp show \
  --name "$APP_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --query "defaultHostname" \
  --output tsv)
echo "✅ Default hostname: $DEFAULT_HOSTNAME"

# Output next steps for GitHub integration
echo ""
echo "GitHub Integration Steps"
echo "-------------------------"
echo "To connect this Static Web App to your GitHub repository:"
echo ""
echo "1. Go to the Azure Portal: https://portal.azure.com"
echo "2. Navigate to the Static Web App resource: $APP_NAME in resource group $RESOURCE_GROUP"
echo "3. Click on 'GitHub' under 'Source' in the left menu"
echo "4. Click 'Sign in with GitHub' and complete the OAuth flow (no PAT required)"
echo "5. Select your repository, branch, and build details:"
echo "   - App location: $APP_SRC_LOCATION"
echo "   - API location: $APP_API_LOCATION"
echo "   - Output location: $APP_OUTPUT_LOCATION"
echo ""

# Configure custom domain
echo ""
echo "Custom Domain Configuration"
echo "-------------------------"
echo "To configure your custom domain ($CUSTOM_DOMAIN):"
echo ""
echo "1. Navigate to the Azure Portal: https://portal.azure.com"
echo "2. Go to the Static Web App resource: $APP_NAME"
echo "3. Select 'Custom domains' from the left menu"
echo "4. Click 'Add' and follow the instructions to add your domain"
echo "5. Update your domain's DNS settings with the validation records provided by Azure"
echo ""

# Output next steps
echo ""
echo "Next Steps"
echo "-------------------------"
echo "1. Complete the GitHub integration using the Azure Portal"
echo "2. Set up additional environment variables in the Azure Portal"
echo "3. Configure custom domain and SSL certificate"
echo "4. Set up Azure CDN for improved performance (optional)"
echo "5. Monitor your application with Application Insights"
echo ""
echo "Your Static Web App URL: https://$DEFAULT_HOSTNAME"
echo ""
echo "Deployment completed successfully!" 