# Email Function Integration Summary

## Overview

The Bridging Trust AI website implements a secure, reliable email delivery system through Azure Functions. This integration connects the website's contact forms to a dedicated email service (Resend) while maintaining security and performance.

## Architecture

1. **Frontend**:
   - Contact forms in the website UI collect user information
   - Client-side validation ensures data quality
   - Forms submit to the Next.js API route

2. **API Route**:
   - Located at `/api/send-email`
   - Performs server-side validation using Zod
   - Forwards valid submissions to the Azure Function
   - Returns appropriate success/error responses

3. **Azure Function**:
   - Hosted at `btai-email-relay.azurewebsites.net`
   - Processes the submission data
   - Sends emails via the Resend API
   - Includes error handling and logging

## Security Considerations

- Input validation at multiple levels (client, API, function)
- HTTPS-only communication
- Function key authentication
- Rate limiting to prevent abuse
- No sensitive data stored or logged

## Environment Configuration

The integration requires these environment variables:

```
AZURE_FUNCTION_URL=https://btai-email-relay.azurewebsites.net/api/SendContactForm
AZURE_FUNCTION_KEY=[Secret Function Key]
```

The Azure Function requires:

```
RESEND_API_KEY=[Resend API Key]
EMAIL_FROM=no-reply@bridgingtrust.ai
EMAIL_TO=sales@bridgingtrust.ai
```

## Monitoring & Maintenance

- Azure Application Insights tracks function performance
- Request IDs allow tracing requests across systems
- Comprehensive logging at each step
- Regular key rotation recommended for security

## Error Handling

The system handles various error conditions:

1. **Validation Errors**: Returns detailed validation feedback
2. **Azure Function Failures**: Graceful error responses
3. **Email Delivery Issues**: Logged for investigation
4. **Rate Limiting**: Prevents abuse while informing users

## Future Improvements

Potential enhancements include:

1. Adding email templates for consistent formatting
2. Implementing webhook notifications for email status
3. Adding analytics for form submission metrics
4. Implementing attachment support for documents 