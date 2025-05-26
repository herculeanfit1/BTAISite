# Email Function

This Azure Function handles email sending for the Bridging Trust AI website. It acts as the backend service that processes contact form submissions and sends emails using the Resend API.

## Overview

The function is responsible for:
1. Receiving form data from the website's `/api/send-email` endpoint
2. Validating the submission data
3. Formatting the email content
4. Sending the email via Resend API
5. Returning success/error responses

## Configuration

The function requires the following environment variables:

| Variable | Description |
|----------|-------------|
| `RESEND_API_KEY` | API key for the Resend email service |
| `EMAIL_FROM` | Sender email address (e.g., `contact@bridgingtrust.ai`) |
| `EMAIL_TO` | Recipient email address(es) |

### Local Development

For local development, add these variables to the `local.settings.json` file:

```json
{
  "IsEncrypted": false,
  "Values": {
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "RESEND_API_KEY": "your-resend-api-key",
    "EMAIL_FROM": "contact@bridgingtrust.ai",
    "EMAIL_TO": "recipient@example.com"
  }
}
```

### Production Deployment

In production, these variables are configured in the Azure Function App settings.

## Testing

### Local Testing

To test the function locally:

1. Install the Azure Functions Core Tools
2. Configure `local.settings.json` with your test API keys
3. Run `func start` from the function directory
4. Use the provided test script:
   ```bash
   ../scripts/test-email-function.sh
   ```

### Manual Testing

For manual testing in any environment:
```bash
../scripts/manual-email-test.sh
```

This script provides detailed output of test requests and responses.

### End-to-End Testing

To test the complete integration from the website to email delivery:

1. Ensure the website's environment variables are configured to point to the function:
   ```
   AZURE_FUNCTION_URL=https://btai-email-relay.azurewebsites.net/api/SendContactForm
   AZURE_FUNCTION_KEY=your-function-key
   ```

2. Test the API route directly:
   ```bash
   ../scripts/test-email-api-route.sh
   ```

3. Submit the contact form on the website and verify email delivery

## Troubleshooting

Common issues and solutions:

### No Emails Being Sent
- Check the Resend API key is correct and active
- Verify the EMAIL_FROM and EMAIL_TO variables are set properly
- Look for errors in the function logs in Azure Portal

### Invalid Requests
- The function expects `name`, `email`, and `message` fields
- Email field must be a valid email address format
- Check the request payload is properly formatted JSON

## Maintenance

Regular maintenance tasks:

- Monitor Resend API usage and limits
- Check for rate limiting issues during high traffic
- Keep the Resend API key updated before expiration
- Monitor function logs for recurring errors 