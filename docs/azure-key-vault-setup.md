# Azure Key Vault Setup Guide

This document provides instructions for configuring Azure Key Vault to securely store sensitive credentials used by the Bridging Trust AI website and its associated functions.

## Overview

Azure Key Vault provides a secure way to store and access application secrets, API keys, certificates, and other sensitive data. By implementing Key Vault, we can:

1. Remove sensitive information from source code and configuration files
2. Centrally manage access to all credentials
3. Implement automatic credential rotation
4. Track access to secrets with detailed logging
5. Simplify security auditing and compliance requirements

## Prerequisites

- Azure subscription with Owner or Contributor permissions
- Azure CLI installed and configured
- Access to Azure Portal
- Existing Azure Static Web Apps and Azure Functions deployments

## Implementation Steps

### 1. Create an Azure Key Vault

```bash
# Set variables
RESOURCE_GROUP="BTAI-RG1"
LOCATION="eastus"
KEYVAULT_NAME="btai-key-vault"

# Create Key Vault
az keyvault create --name $KEYVAULT_NAME \
                  --resource-group $RESOURCE_GROUP \
                  --location $LOCATION \
                  --enable-rbac-authorization true
```

### 2. Store Sensitive Credentials in Key Vault

```bash
# Store Resend API Key
az keyvault secret set --vault-name $KEYVAULT_NAME \
                      --name "RESEND-API-KEY" \
                      --value "your-resend-api-key-value"

# Store Email Addresses
az keyvault secret set --vault-name $KEYVAULT_NAME \
                      --name "EMAIL-FROM" \
                      --value "no-reply@bridgingtrust.ai"

az keyvault secret set --vault-name $KEYVAULT_NAME \
                      --name "EMAIL-TO" \
                      --value "contact@bridgingtrust.ai"

# Store any other sensitive credentials
# (Database connection strings, API keys, etc.)
```

### 3. Configure Access Policies

#### 3.1 Grant Access to Azure Functions

We need to allow the Azure Functions app to access secrets in Key Vault:

```bash
# Get the Function App's managed identity principal ID
FUNCTION_APP_NAME="btai-email-relay"
PRINCIPAL_ID=$(az functionapp identity show --name $FUNCTION_APP_NAME \
                                           --resource-group $RESOURCE_GROUP \
                                           --query principalId --output tsv)

# Assign Key Vault Secrets User role
az role assignment create --assignee $PRINCIPAL_ID \
                         --role "Key Vault Secrets User" \
                         --scope "/subscriptions/$(az account show --query id -o tsv)/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.KeyVault/vaults/$KEYVAULT_NAME"
```

#### 3.2 Grant Access to Static Web App (if needed)

```bash
# Get the Static Web App's managed identity principal ID
STATIC_WEB_APP_NAME="btai-website"
SWA_PRINCIPAL_ID=$(az staticwebapp identity show --name $STATIC_WEB_APP_NAME \
                                               --resource-group $RESOURCE_GROUP \
                                               --query principalId --output tsv)

# Assign Key Vault Secrets User role
az role assignment create --assignee $SWA_PRINCIPAL_ID \
                         --role "Key Vault Secrets User" \
                         --scope "/subscriptions/$(az account show --query id -o tsv)/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.KeyVault/vaults/$KEYVAULT_NAME"
```

### 4. Update Azure Function to Use Key Vault

#### 4.1 Enable Managed Identity

If not already enabled, enable managed identity for the Function App:

```bash
az functionapp identity assign --name $FUNCTION_APP_NAME \
                              --resource-group $RESOURCE_GROUP
```

#### 4.2 Update Function Code

Update the Azure Function to retrieve secrets from Key Vault:

```javascript
// email-function/SendContactForm/index.js

const { DefaultAzureCredential } = require("@azure/identity");
const { SecretClient } = require("@azure/keyvault-secrets");

module.exports = async function (context, req) {
  // ...existing code...
  
  // Key Vault configuration
  const keyVaultName = process.env.KEY_VAULT_NAME || "btai-key-vault";
  const keyVaultUrl = `https://${keyVaultName}.vault.azure.net`;
  
  try {
    // Get managed identity credentials
    const credential = new DefaultAzureCredential();
    
    // Create a secret client
    const secretClient = new SecretClient(keyVaultUrl, credential);
    
    // Retrieve secrets
    const resendApiKey = await secretClient.getSecret("RESEND-API-KEY");
    const emailFrom = await secretClient.getSecret("EMAIL-FROM");
    const emailTo = await secretClient.getSecret("EMAIL-TO");
    
    // Initialize Resend with API key from Key Vault
    const resend = new Resend(resendApiKey.value);
    
    // ...rest of email sending code...
    
    // Send email using retrieved secrets
    const data = await resend.emails.send({
      from: emailFrom.value,
      to: emailTo.value,
      subject: `Contact Form: ${name}`,
      html: htmlContent,
      text: textContent,
      reply_to: email,
    });
    
    // ...rest of function code...
  } catch (error) {
    // ...error handling...
  }
};
```

#### 4.3 Update Dependencies

Add the required packages to the Function App:

```bash
cd email-function
npm install @azure/identity @azure/keyvault-secrets --save
```

### 5. Configure Environment Variables

Update the Function App settings to include the Key Vault name:

```bash
az functionapp config appsettings set --name $FUNCTION_APP_NAME \
                                     --resource-group $RESOURCE_GROUP \
                                     --settings KEY_VAULT_NAME=$KEYVAULT_NAME
```

### 6. Test the Integration

1. Deploy the updated function code
2. Run a series of tests to verify that the function can access secrets from Key Vault
3. Check the Azure Monitor logs to ensure successful secret retrieval

## Security Best Practices

1. **Key Rotation**: Set up a schedule for rotating sensitive credentials
2. **Access Control**: Grant minimum required permissions using RBAC
3. **Monitoring**: Set up alerts for suspicious activities in Key Vault
4. **Backup**: Regularly back up Key Vault data
5. **Network Security**: Configure network access rules to restrict access

## Monitoring and Maintenance

### 1. Enable Diagnostic Logging

```bash
az monitor diagnostic-settings create --name "key-vault-logs" \
                                     --resource $KEYVAULT_NAME \
                                     --resource-type "Microsoft.KeyVault/vaults" \
                                     --logs '[{"category": "AuditEvent","enabled": true}]' \
                                     --workspace $(az resource show --resource-group $RESOURCE_GROUP \
                                                  --name "btai-log-analytics" \
                                                  --resource-type "Microsoft.OperationalInsights/workspaces" \
                                                  --query id -o tsv)
```

### 2. Set Up Alerts

Configure alerts in Azure Monitor to notify administrators when:
- Failed authentication attempts exceed a threshold
- Secrets are accessed outside of normal patterns
- Secret permissions are modified

## Disaster Recovery

In case of service disruption or data loss:

1. **Backup**: Regularly back up all secrets in Key Vault
2. **Restore Process**: Document steps to restore from backup
3. **Alternative Access**: Maintain emergency access procedures

## Next Steps After Implementation

1. Update deployment documentation to include Key Vault information
2. Train development team on Key Vault access procedures
3. Perform a security review of the implementation
4. Update the todo.md to mark off the Key Vault configuration task 