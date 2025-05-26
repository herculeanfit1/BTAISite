# Environment Variables Template

## Local Development (.env.local)

Create a `.env.local` file in the project root with the following content:

```
# Azure Function for email sending
AZURE_FUNCTION_URL=https://btai-email-relay.azurewebsites.net/api/SendContactForm
# Replace with your actual function key from Azure Portal
AZURE_FUNCTION_KEY=YOUR_AZURE_FUNCTION_KEY_HERE
```

## Production Environment (Azure Static Web Apps)

Configure these same environment variables in the Azure Static Web Apps configuration:

1. Log in to [Azure Portal](https://portal.azure.com)
2. Navigate to your Static Web App resource
3. Go to Configuration → Application settings
4. Add the following key-value pairs:
   - `AZURE_FUNCTION_URL`: https://btai-email-relay.azurewebsites.net/api/SendContactForm
   - `AZURE_FUNCTION_KEY`: [Your Function Key]

## How to Obtain the Azure Function Key

1. Log in to [Azure Portal](https://portal.azure.com)
2. Navigate to your Function App (btai-email-relay)
3. Select the SendContactForm function
4. Go to Function Keys (under Developer)
5. Copy the default key or create a new one specifically for the website

## Verifying Configuration

After setting up the environment variables:

1. Restart the development server (local) or redeploy (production)
2. Run the test script:
   ```bash
   # For local testing
   ./scripts/test-email-api-route.sh
   
   # For production testing
   ./scripts/test-email-api-route.sh https://www.bridgingtrust.ai/api/send-email
   ```

3. Check that the "Valid submission" test case returns a success response 