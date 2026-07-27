# Fixing SSL Certificate Issues After Storage Account Deletion

This guide addresses how to restore SSL certificate functionality after deleting a storage account linked to an Azure Static Web App.

## What Happened

When a storage account that was linked to your Azure Static Web App is deleted, several SSL-related issues can occur:

1. Custom domain certificates may become invalid
2. CDN endpoints may lose their SSL bindings
3. Key Vault references for certificates may break
4. Certificate renewal automation may fail

## Solution Steps

### 1. ✅ Recreate the Storage Account

```bash
# Login to Azure if not already logged in
az login

# Storage account has been created:
# Name: bridgingtrustaistorage
# Resource Group: BTAI-RG1
```

### 2. Link the Storage Account to Static Web App

```bash
# Link storage account to static web app
az staticwebapp linked-service create \
  --name bridgingtrustai \
  --resource-group BTAI-RG1 \
  --app-name bridgingtrustaistorage \
  --app-type storage-account \
  --resource-id "/subscriptions/cd461b28-ac0b-4217-8fc3-94029cb11612/resourceGroups/BTAI-RG1/providers/Microsoft.Storage/storageAccounts/bridgingtrustaistorage"
```