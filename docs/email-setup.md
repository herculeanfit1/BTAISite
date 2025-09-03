# Email System Setup - Bridging Trust AI

## Overview

The Bridging Trust AI website uses a custom email relay system built with Resend for handling contact form submissions. This system provides:

- Professional email templates for user confirmations and admin notifications
- Rate limiting (5 requests per hour per IP)
- Circuit breaker pattern for reliability
- Bot protection with honeypot fields
- Comprehensive logging and error handling

## Architecture

```
Contact Form → Next.js API Route → Resend API → Email Delivery
     ↓              ↓                  ↓            ↓
  Validation   Rate Limiting      Email Templates  Recipients
```

## Required Environment Variables

Set these in your Azure Static Web Apps configuration:

```bash
RESEND_API_KEY=your_resend_api_key_here
EMAIL_FROM=hello@bridgingtrust.ai
EMAIL_TO=sales@bridgingtrust.ai
EMAIL_ADMIN=admin@bridgingtrust.ai
RESEND_TEST_MODE=false  # Set to true for testing without sending real emails
```

## How to Configure in Azure Static Web Apps

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to your Static Web App resource
3. Go to **Configuration** → **Application settings**
4. Add each environment variable:
   - Click **+ Add**
   - Enter the **Name** and **Value**
   - Click **OK**
5. Click **Save** at the top
6. The next deployment will pick up these variables automatically

## Testing the Email System

After configuration, you can test the email system by:

1. **Using the contact form** on the website
2. **Direct API testing** with curl:
   ```bash
   curl -X POST https://bridgingtrust.ai/api/contact \
     -H "Content-Type: application/json" \
     -d '{
       "firstName": "Test",
       "lastName": "User",
       "email": "test@example.com",
       "company": "Test Company",
       "message": "Test message",
       "_gotcha": ""
     }'
   ```

A successful response will look like:
```json
{"success": true, "message": "Emails sent successfully"}
```

## Email Addresses Setup

The following email addresses have been created and configured:

- **hello@bridgingtrust.ai** - Sender address for all outgoing emails
- **sales@bridgingtrust.ai** - Primary recipient for contact form submissions
- **admin@bridgingtrust.ai** - CC recipient for admin notifications

## Components

### 1. Email Service (`src/lib/email.ts`)

Core email functionality with:
- Lazy initialization of Resend client
- Rate limiting implementation
- Circuit breaker pattern
- Development mode simulation

### 2. Email Templates

#### User Confirmation (`src/lib/email-templates/contact-confirmation.ts`)
- Professional HTML template
- Branded styling with company colors
- Next steps information
- Contact information

#### Admin Notification (`src/lib/email-templates/admin-notification.ts`)
- Detailed contact information
- Technical details (IP, User-Agent)
- Recommended next steps
- Quick reply functionality

### 3. API Route (`app/api/contact/route.ts`)

Next.js API route that handles:
- Form validation with Zod schema
- Bot protection via honeypot field
- Rate limiting enforcement
- Email sending coordination
- Error handling and logging

### 4. Contact Form Components

Both `app/components/home/ContactSection.tsx` and `src/components/home/ContactSection.tsx` have been updated to:
- Submit to `/api/contact` endpoint
- Handle success/error states
- Include honeypot field for bot protection
- Provide user feedback

## Testing

### Local Testing

1. Set up environment variables in `.env.local`:
```bash
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=hello@bridgingtrust.ai
EMAIL_TO=sales@bridgingtrust.ai
EMAIL_ADMIN=admin@bridgingtrust.ai
RESEND_TEST_MODE=true
```

2. Run the test script:
```bash
node scripts/test-email.js
```

3. Test the contact form locally:
```bash
npm run dev
# Navigate to http://localhost:3000/#contact
```

### Production Testing

1. Verify environment variables are set in Azure Static Web Apps
2. Test the contact form on the live website
3. Check email delivery to both user and admin addresses

## Rate Limiting

- **Limit**: 5 requests per hour per IP address
- **Storage**: In-memory (for production, consider Redis)
- **Response**: HTTP 429 with appropriate error message

## Circuit Breaker

- **Threshold**: 5 consecutive failures
- **Timeout**: 5 minutes
- **Response**: HTTP 503 with service unavailable message

## Security Features

1. **Input Validation**: Zod schema validation for all form fields
2. **Bot Protection**: Honeypot field (`_gotcha`) to catch automated submissions
3. **Rate Limiting**: Prevents spam and abuse
4. **CORS Headers**: Proper cross-origin request handling
5. **Error Handling**: No sensitive information exposed in error messages

## Monitoring

### Development Mode

When `RESEND_TEST_MODE=true`:
- Emails are simulated (not actually sent)
- Console logging shows what would be sent
- Useful for development and testing

### Production Monitoring

- Check Azure Static Web Apps logs for API route execution
- Monitor Resend dashboard for email delivery status
- Review rate limiting and circuit breaker metrics

## Troubleshooting

### Common Issues

1. **"Missing required environment variable: RESEND_API_KEY"**
   - Verify the API key is set in Azure Static Web Apps configuration
   - Check the key is valid in Resend dashboard

2. **"Rate limit exceeded"**
   - Normal behavior for testing
   - Wait 1 hour or restart the application to reset

3. **"Service temporarily unavailable"**
   - Circuit breaker is open due to failures
   - Check Resend API status and credentials

4. **Emails not being received**
   - Verify email addresses are correct
   - Check spam folders
   - Confirm Resend domain verification

### Debug Steps

1. Check environment variables:
```bash
node scripts/test-email.js
```

2. Test API endpoint directly:
```bash
curl -X POST https://your-site.azurestaticapps.net/api/contact \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","lastName":"User","email":"test@example.com","message":"Test message"}'
```

3. Review Azure Static Web Apps logs in the Azure Portal

## Deployment Notes

- The system uses Next.js API routes (not Azure Functions)
- Static export is disabled to support API routes
- Azure Static Web Apps handles the Next.js build automatically
- Environment variables must be set in Azure Static Web Apps configuration

## Future Enhancements

1. **Database Storage**: Replace in-memory rate limiting with Redis or database
2. **Email Templates**: Add more template variations for different use cases
3. **Analytics**: Add email delivery tracking and analytics
4. **Webhooks**: Implement Resend webhooks for delivery status updates
5. **Queue System**: Add email queue for high-volume scenarios 