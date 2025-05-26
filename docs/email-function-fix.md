# Email Function Key Fix

## Problem Identified

Based on test results, the email functionality is failing with the error:

```json
{
  "success": false,
  "error": "Configuration error",
  "message": "The server is not properly configured to send emails. Please try again later or contact support.",
  "requestId": "a57adf3f-ccfa-4aa5-abff-292f20284ee9"
}
```

This error occurs because the `AZURE_FUNCTION_KEY` environment variable is missing in the application configuration.

## Quick Fix Steps

### 1. Obtain the Azure Function Key

1. Log in to the [Azure Portal](https://portal.azure.com)
2. Navigate to the Azure Function App: `btai-email-relay`
3. Select the **SendContactForm** function
4. Go to the **Function Keys** tab
5. Copy the default key or create a new one

### 2. Configure Environment Variables

#### For Local Development:

Create or update `.env.local` in the project root:

```
AZURE_FUNCTION_URL=https://btai-email-relay.azurewebsites.net/api/SendContactForm
AZURE_FUNCTION_KEY=your-function-key-from-azure-portal
```

#### For Production:

1. Log in to [Azure Portal](https://portal.azure.com)
2. Navigate to the Azure Static Web App for the website
3. Go to **Configuration** → **Application settings**
4. Add the following environment variables:
   - Name: `AZURE_FUNCTION_URL`
     Value: `https://btai-email-relay.azurewebsites.net/api/SendContactForm`
   - Name: `AZURE_FUNCTION_KEY`
     Value: `your-function-key-from-azure-portal`
5. Save the changes

### 3. Verify the Fix

1. Restart the development server (if testing locally)
2. Run the test script:
   ```bash
   ./scripts/test-email-api-route.sh
   ```
3. Check that the successful submission test case returns a success response
4. Verify email delivery to the configured recipient

### 4. Deploy the Fix

If the fix works locally, deploy to production:

1. Commit any local changes (but don't commit the .env.local file with secrets)
2. Push to the main branch to trigger the CI/CD pipeline
3. After deployment, test the production API endpoint:
   ```bash
   ./scripts/test-email-api-route.sh https://www.bridgingtrust.ai/api/send-email
   ```

## Security Considerations

- Store the function key securely and never commit it to the repository
- Consider using Azure Key Vault for storing sensitive keys
- Rotate the function key periodically
- Use a dedicated function key for the website rather than the master key
- Monitor function key usage for suspicious activity

## Troubleshooting

If issues persist after applying the fix:

1. Check the Azure Function logs for errors
2. Verify that the function itself is working by testing it directly
3. Check for any middleware or CORS issues that might be blocking the request
4. Verify that the environment variables are correctly configured and loaded 