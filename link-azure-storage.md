# Linking Azure Storage Account to Static Web App

After investigating, we've found that Azure Static Web Apps doesn't currently support linking storage accounts via ARM templates or CLI. The only supported method is through the Azure Portal.

## Step-by-Step Azure Portal Instructions

1. **Go to Azure Portal**
   - Navigate to [https://portal.azure.com](https://portal.azure.com)
   - Sign in with your credentials

2. **Access Your Static Web App**
   - Go to Resource Groups
   - Select resource group "BTAI-RG1"
   - Click on your Static Web App "bridgingtrustai"

3. **Navigate to Static Web App Storage**
   - In the left menu, locate the "Storage" section
   - Look for "Blob storage", "Storage integration", or "Storage accounts" 
   - If not visible in the main menu, check under "Settings"

   > Note: Azure has been updating the UI for Static Web Apps, so the exact option may vary.

4. **Add Storage Account**
   - Click "Add", "Link", or "Configure" button
   - Select your subscription and resource group (BTAI-RG1)
   - Choose storage account "bridgingtrustaistorage"
   - Set any access permissions as needed
   - Click "Link", "Save", or "Add" to complete

5. **Verify the Connection**
   - Once linked, the storage account should appear in the linked resources list
   - Check for a status indicator showing "Connected" or similar

## Alternative: Contact Azure Support

If you can't find the storage linking option in the portal:

1. Click the "?" icon in the top right corner of the Azure Portal
2. Select "Help + Support"
3. Create a new support request
4. Describe your need to link a storage account to your Static Web App
5. Include details about both resources

## Using the Storage with Static Web App

After linking, you can:

1. Store images and other static assets in Blob Storage
2. Configure CDN endpoints for the storage account
3. Set up custom domains that use certificates stored in the linked storage
4. Use Azure Functions to access the storage account

## Troubleshooting

If you encounter SSL certificate issues after linking:

1. Go to your Custom Domains settings in the Static Web App
2. Check certificate status for each domain
3. You may need to manually renew or reissue certificates
4. Make sure your DNS settings point correctly to the Static Web App 