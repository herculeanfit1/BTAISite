# Email Function Integration Deployment Plan

## Current Status

Based on the testing results, the email function integration is partially implemented:

1. The Azure Function code (`email-function/SendContactForm/index.js`) is ready for deployment
2. The API route (`app/api/send-email/route.ts`) is implemented but lacks environment variables
3. The contact form component requires updates to connect to the correct API endpoint

## Deployment Steps

### 1. Azure Function Deployment

1. Deploy the Azure Function to the Azure Function App:
   ```bash
   cd email-function
   func azure functionapp publish btai-email-relay
   ```

2. Verify the following configuration settings in Azure Portal:
   - `RESEND_API_KEY`: The API key for Resend.com email service
   - `EMAIL_FROM`: Set to "no-reply@bridgingtrust.ai"
   - `EMAIL_TO`: Set to "sales@bridgingtrust.ai"

3. Test the deployed Azure Function directly:
   ```bash
   curl -X POST "https://btai-email-relay.azurewebsites.net/api/SendContactForm?code=YOUR_FUNCTION_KEY" \
     -H "Content-Type: application/json" \
     -d '{"name":"Test User","email":"test@example.com","message":"This is a test message"}'
   ```

### 2. Configure Environment Variables

1. Add the following environment variables in Azure Static Web Apps configuration:
   - `AZURE_FUNCTION_URL`: "https://btai-email-relay.azurewebsites.net/api/SendContactForm"
   - `AZURE_FUNCTION_KEY`: The function key from Azure Portal

2. If needed, add these variables to the local development environment:
   ```bash
   # Create or update .env.local
   echo "AZURE_FUNCTION_URL=https://btai-email-relay.azurewebsites.net/api/SendContactForm" >> .env.local
   echo "AZURE_FUNCTION_KEY=your-function-key" >> .env.local
   ```

### 3. Website Deployment

1. Update any contact form components using the old API endpoint
2. Run thorough testing on the integration between website forms and the email function
3. Deploy the updated website to Azure Static Web Apps

## Testing Plan

### 1. Local Testing

Before production deployment:

1. Test the API route with properly configured environment variables:
   ```bash
   ./scripts/test-email-api-route.sh
   ```

2. Test form submissions through the UI:
   - Fill out and submit the contact form
   - Verify success/error states display correctly
   - Check email delivery to the configured recipient

### 2. Production Testing

After deployment:

1. Test the live API endpoint:
   ```bash
   ./scripts/test-email-api-route.sh https://www.bridgingtrust.ai/api/send-email
   ```

2. Complete an end-to-end test of the live contact form:
   - Submit a test message through the website contact form
   - Verify the success message appears
   - Confirm email delivery to sales@bridgingtrust.ai

### 3. Error Handling Testing

Test error scenarios to ensure proper handling:

1. Invalid email format
2. Missing required fields
3. Rate limiting (multiple submissions)
4. Network failures

### 4. Document Test Results

Create a comprehensive test report:

1. Success/failure of all test cases
2. Screenshots of error states and success messages
3. Any unexpected behavior or edge cases
4. Performance metrics (response time)

## Integration Documentation

Once testing is complete, update the project documentation:

1. Update README.md with information about the email function
2. Document the API routes and their functionality
3. Create usage examples for developers
4. Document troubleshooting steps for common issues

## Monitoring Plan

Set up proper monitoring for the email function:

1. Configure Azure Application Insights for the Function App
2. Set up alerts for function failures
3. Monitor email delivery rates and failures
4. Review logs periodically for performance issues

## Rollback Plan

In case of issues:

1. Have a snapshot of the previous working configuration
2. Document steps to revert the Azure Function App deployment
3. Keep a backup of any changed environment variables
4. Test rollback procedure in advance 