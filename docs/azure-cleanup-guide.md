# Azure Cleanup Guide for Bridging Trust AI

## Overview
After migrating from Azure Functions + Resend to Formspree for contact form handling, several Azure resources are no longer needed and can be safely removed to reduce costs.

## Azure Resources to Keep

### ✅ Keep These Resources
1. **Azure Static Web App**: `bridgingtrustai`
   - **Resource Group**: `BTAI-RG1`
   - **Location**: Central US
   - **Purpose**: Main website hosting
   - **Status**: ✅ Required - This hosts your website

2. **GitHub Actions Integration**
   - **Secret**: `AZURE_STATIC_WEB_APPS_API_TOKEN_BRIDGINGTRUST_WEBSITE`
   - **Purpose**: Automated deployment from GitHub
   - **Status**: ✅ Required - This enables automatic deployments

## Azure Resources to Remove

### ❌ Safe to Delete
1. **Azure Storage Account**: `bridgingtrustaistorage`
   - **Resource Group**: `BTAI-RG1`
   - **Location**: Central US
   - **Purpose**: Was intended for blob storage and Azure Functions
   - **Status**: ❌ No longer needed
   - **Cost Impact**: ~$5-20/month depending on usage

2. **Azure Function Apps** (if any exist):
   - **Name**: `btai-email-relay` (or similar)
   - **Purpose**: Email processing (now handled by Formspree)
   - **Status**: ❌ No longer needed
   - **Cost Impact**: ~$10-50/month depending on plan

3. **Function App Storage Accounts** (if separate from main storage):
   - **Purpose**: Storage for Azure Functions runtime
   - **Status**: ❌ No longer needed if Functions are deleted

## How to Clean Up Azure Resources

### Step 1: Verify Current Resources
```bash
# List all resources in the resource group
az resource list --resource-group BTAI-RG1 --output table
```

### Step 2: Delete Storage Account
1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to Resource Groups → `BTAI-RG1`
3. Find `bridgingtrustaistorage`
4. Click Delete and confirm
5. **Estimated Savings**: $5-20/month

### Step 3: Delete Function Apps (if any)
1. In the same resource group, look for any Function Apps
2. Delete any Function Apps related to email processing
3. **Estimated Savings**: $10-50/month

### Step 4: Clean Up Associated Resources
- **Application Insights**: Delete if only used by deleted Function Apps
- **App Service Plans**: Delete if only used by deleted Function Apps
- **Storage Accounts**: Delete any additional storage accounts used only by Functions

## Environment Variables to Remove

Since you're no longer using Resend/Azure Functions, these environment variables can be removed from Azure Static Web Apps:

1. `RESEND_API_KEY`
2. `EMAIL_FROM`
3. `EMAIL_TO`
4. `EMAIL_ADMIN`
5. `RESEND_TEST_MODE`

### How to Remove Environment Variables:
1. Go to Azure Portal → Static Web Apps → `bridgingtrustai`
2. Navigate to Configuration
3. Remove the variables listed above
4. Save changes

## Files Already Cleaned Up

The following files have been removed from the codebase:
- ✅ `email-function/` directory (entire Azure Functions project)
- ✅ `link-azure-storage.md`
- ✅ `link-storage.json`
- ✅ Azure-specific deployment scripts
- ✅ Email testing scripts
- ✅ Resend and Zod dependencies from package.json

## Verification Steps

After cleanup, verify everything still works:

1. **Website Loading**: Visit https://bridgingtrust.ai
2. **Contact Form**: Test the contact form submission
3. **Deployment**: Push a small change to GitHub and verify deployment works

## Cost Savings Estimate

**Total Monthly Savings**: $15-70/month
- Storage Account: $5-20/month
- Function Apps: $10-50/month
- Associated resources: $0-10/month

## Support

If you need help with the cleanup process:
1. Azure Support Portal
2. Azure CLI documentation
3. Contact Azure billing support for cost analysis

---

**Last Updated**: 2025-01-27
**Status**: Ready for cleanup 