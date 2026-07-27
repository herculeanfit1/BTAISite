# Email System Setup - Bridging Trust AI

## Overview

The Bridging Trust AI website uses a custom email relay system built with Resend for handling contact form submissions. This system provides:

- Professional email templates for user confirmations and admin notifications
- Per-IP rate limiting and a circuit breaker for reliability
- Server-side bot protection
- Comprehensive logging and error handling

Thresholds and anti-abuse tunables are deliberately **not** documented in this
repo — it is public. See the private runbook.

## Architecture

```
Contact Form → Next.js route handler → Resend API → Email Delivery
     ↓                  ↓                   ↓            ↓
  Validation       Anti-abuse        Email Templates  Recipients
```

`/api/contact` is an App Router route handler (`app/api/contact/route.ts`) over the
orchestration in `src/lib/api/contact-handler.ts`, served by the Static Web Apps managed
hybrid backend. The Azure Functions app that previously served it was retired
2026-07-24.

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
2. **Direct API testing** against a local dev server with curl:
   ```bash
   curl -X POST http://localhost:3000/api/contact \
     -H "Content-Type: application/json" \
     -d '{
       "firstName": "Test",
       "lastName": "User",
       "email": "test@example.com",
       "company": "Test Company",
       "message": "Test message"
     }'
   ```
   Run it with `EMAIL_TEST_MODE=true` so no real mail is sent. Do not point this at
   production — a submission there creates a real HubSpot contact and a real queue
   message, and CRM records are cleaned up by the operator, not automatically.

A successful response will look like:

```json
{ "success": true, "message": "Emails sent successfully" }
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

### 3. Contact Function (`api/src/functions/contact.ts`)

Azure Functions handler that handles:

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

- **Limit**: per-IP, within a fixed window — values in the private runbook
- **Storage**: in-memory, so it resets on instance restart and is not
  multi-instance-safe. This is a known, accepted limitation, not an oversight; a
  durable limiter is roadmapped
- **Response**: HTTP 429 with a generic error message

## Circuit Breaker

- **Trip condition**: a run of consecutive upstream failures — values in the private
  runbook
- **Response**: HTTP 503 with a service-unavailable message

## Security Features

1. **Input Validation**: Zod schema validation for all form fields
2. **Bot Protection**: a server-side honeypot check that silently accepts and drops
   automated submissions
3. **Rate Limiting**: per-IP, plus a circuit breaker on the upstream mail provider
4. **CORS Headers**: proper cross-origin request handling
5. **Error Handling**: no sensitive information exposed in error messages

## Monitoring

### Development Mode

When `EMAIL_TEST_MODE=true` (or the legacy `RESEND_TEST_MODE=true`):

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

- The email system runs on Azure Functions (`func-btai-site-prod`), linked to SWA as a backend
- Oryx builds the Next.js frontend; Functions are deployed separately via `deploy-functions` CI job
- Secrets (`RESEND_API_KEY`) are stored in Key Vault and referenced via `@Microsoft.KeyVault()` app settings

## Future Enhancements

1. **Database Storage**: Replace in-memory rate limiting with Redis or database
2. **Email Templates**: Add more template variations for different use cases
3. **Analytics**: Add email delivery tracking and analytics
4. **Webhooks**: Implement Resend webhooks for delivery status updates
5. **Queue System**: Add email queue for high-volume scenarios
