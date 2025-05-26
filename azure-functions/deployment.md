# Deploying the Static Website and Azure Functions

This document outlines the steps to deploy the Bridging Trust AI website and its associated Azure Functions.

## Static Website Deployment

### Option 1: Azure Static Web Apps

1. **Create an Azure Static Web App**
   - Go to the Azure Portal
   - Create a new Static Web App resource
   - Connect to your GitHub repository
   - Build configuration:
     - Build Preset: Custom
     - App location: /
     - Output location: out
     - API location: azure-functions

2. **Configure environment variables**
   - In the Azure Portal, navigate to your Static Web App
   - Go to Configuration > Application Settings
   - Add any necessary environment variables

### Option 2: Any Static Web Host

You can deploy the static files from the `out` directory to any static web host:

- Netlify
- Vercel
- GitHub Pages
- Amazon S3
- Azure Blob Storage

## Azure Function Deployment

If you're not using Azure Static Web Apps, you'll need to deploy the Azure Functions separately:

1. **Install Azure Functions Core Tools**
   ```
   npm install -g azure-functions-core-tools@4
   ```

2. **Create a Function App in Azure Portal**

3. **Deploy the functions from the command line**
   ```
   cd azure-functions
   func azure functionapp publish YOUR_FUNCTION_APP_NAME
   ```

4. **Configure CORS in Azure Portal**
   - Go to your Function App
   - Go to CORS settings
   - Add your website domain to the allowed origins

5. **Add environment variables**
   - Go to Configuration > Application Settings
   - Add:
     - SENDGRID_API_KEY: Your SendGrid API key
     - SENDER_EMAIL_ADDRESS: The email address to send from
     - RECIPIENT_EMAIL_ADDRESS: The email address to send to

## Testing the Deployment

After deployment:

1. Visit your website
2. Test the contact form
3. Check that form submissions are being sent via email

## Troubleshooting

- If the contact form isn't working, check the Function App logs
- Verify that CORS is configured correctly
- Confirm all environment variables are set properly
