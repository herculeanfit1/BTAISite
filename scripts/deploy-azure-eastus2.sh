#!/bin/bash
# Create Azure resources for Bridging Trust AI website

# Set variables
RESOURCE_GROUP="BridgingTrustAI-RG"
LOCATION="eastus2"  # Using East US 2 region
STATIC_WEB_APP_NAME="bridging-trust-ai"
STORAGE_ACCOUNT_NAME="bridgingtrustaistorage"
FUNCTION_APP_NAME="bridging-trust-ai-func"
APP_SERVICE_PLAN="bridging-trust-ai-plan"
APP_INSIGHTS_NAME="bridging-trust-ai-insights"

# Login to Azure
az login

# Create a resource group
echo "Creating resource group..."
az group create --name $RESOURCE_GROUP --location $LOCATION

# Create storage account for Functions
echo "Creating storage account..."
az storage account create \
  --name $STORAGE_ACCOUNT_NAME \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --sku Standard_LRS \
  --kind StorageV2

# Get storage connection string
STORAGE_CONNECTION_STRING=$(az storage account show-connection-string \
  --name $STORAGE_ACCOUNT_NAME \
  --resource-group $RESOURCE_GROUP \
  --query connectionString \
  --output tsv)

# Create App Service Plan for Functions
echo "Creating App Service Plan..."
az appservice plan create \
  --name $APP_SERVICE_PLAN \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --sku B1 \
  --is-linux

# Create Application Insights
echo "Creating Application Insights..."
az monitor app-insights component create \
  --app $APP_INSIGHTS_NAME \
  --location $LOCATION \
  --resource-group $RESOURCE_GROUP \
  --application-type web

# Get Application Insights key
APP_INSIGHTS_KEY=$(az monitor app-insights component show \
  --app $APP_INSIGHTS_NAME \
  --resource-group $RESOURCE_GROUP \
  --query instrumentationKey \
  --output tsv)

# Create Function App
echo "Creating Function App..."
az functionapp create \
  --name $FUNCTION_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --storage-account $STORAGE_ACCOUNT_NAME \
  --consumption-plan-location $LOCATION \
  --runtime node \
  --runtime-version 20 \
  --functions-version 4 \
  --app-insights $APP_INSIGHTS_NAME \
  --app-insights-key $APP_INSIGHTS_KEY

# Create Static Web App
echo "Creating Static Web App..."
az staticwebapp create \
  --name $STATIC_WEB_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --sku Free

# Configure Static Web App with Function App
echo "Linking Static Web App with Function App..."
STATIC_WEB_APP_ID=$(az staticwebapp show \
  --name $STATIC_WEB_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --query id \
  --output tsv)

FUNCTION_APP_ID=$(az functionapp show \
  --name $FUNCTION_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --query id \
  --output tsv)

az staticwebapp linked-backend create \
  --name $STATIC_WEB_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --static-web-app-id $STATIC_WEB_APP_ID \
  --backend-resource-id $FUNCTION_APP_ID \
  --backend-region $LOCATION

# Set environment variables for Resend
echo "Setting environment variables for Resend..."
az functionapp config appsettings set \
  --name $FUNCTION_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --settings "RESEND_API_KEY=your-resend-api-key-here" "EMAIL_FROM=your-verified-email@domain.com" "EMAIL_TO=recipient@domain.com"

# Get Static Web App deployment token
DEPLOYMENT_TOKEN=$(az staticwebapp secrets list \
  --name $STATIC_WEB_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --query properties.apiKey \
  --output tsv)

echo "---------------------------------------------"
echo "Resource creation complete!"
echo "---------------------------------------------"
echo "Resource Group: $RESOURCE_GROUP"
echo "Static Web App: $STATIC_WEB_APP_NAME (in eastus2)"
echo "Function App: $FUNCTION_APP_NAME (in eastus2)"
echo "Storage Account: $STORAGE_ACCOUNT_NAME (in eastus2)"
echo "---------------------------------------------"
echo "Add this deployment token to your GitHub repository secrets as AZURE_STATIC_WEB_APPS_API_TOKEN:"
echo $DEPLOYMENT_TOKEN
echo "---------------------------------------------"
echo "IMPORTANT: Remember to replace the placeholder values for RESEND_API_KEY, EMAIL_FROM, and EMAIL_TO with your actual values." 