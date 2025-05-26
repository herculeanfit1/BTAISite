# Email Setup for Bridging Trust AI

## Overview

The Bridging Trust AI website uses **Resend.com** for transactional email delivery. This setup handles contact form submissions with automatic confirmation emails to users and notification emails to the admin team.

## Email Service Provider: Resend

- **Service**: [Resend.com](https://resend.com) - Modern transactional email API
- **Domain**: `bridgingtrust.ai` (needs to be verified in Resend dashboard)
- **API Integration**: Resend JavaScript SDK

## Environment Variables Configuration

Add these environment variables to your `.env.local` file for development and to your production environment:

```bash
# Core Email Configuration
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=Bridging Trust AI <hello@bridgingtrust.ai>
EMAIL_REPLY_TO=support@bridgingtrust.ai
EMAIL_ADMIN=admin@bridgingtrust.ai

# Email Usage Limits & Protection
EMAIL_DAILY_LIMIT=100
EMAIL_MONTHLY_LIMIT=1000
EMAIL_HOURLY_LIMIT=10
EMAIL_MAX_FAILURES=5
EMAIL_CIRCUIT_BREAKER_TIMEOUT=300000

# Development/Debug Settings
SEND_EMAILS_IN_DEVELOPMENT=true
DEBUG_EMAIL=false  # Set to true to redirect all emails to delivered@resend.dev
```

## Email Architecture

### 1. Core Email Service (`lib/email.ts`)
- Centralized email sending with Resend API
- Built-in usage monitoring and rate limiting
- Circuit breaker pattern for failure handling
- Quota checking before sending

### 2. Email Templates (`lib/email-templates/`)
- **Contact Confirmation**: Welcome email for contact form submissions
- **Admin Notifications**: Internal alerts for new contact submissions
- Responsive HTML + plain text versions
- Reusable template system

### 3. Email Types Implemented
- **Contact Confirmation**: Sent to users who submit the contact form
- **Admin Notifications**: Sent to admin team for new contact submissions

## API Integration

### Contact Form Endpoint (`/api/contact`)
- **Rate Limited**: 5 submissions per hour per IP
- **Validates input**: Uses Zod schema validation
- **Sends dual emails**: Confirmation + admin notification
- **Handles failures gracefully**: Detailed logging and error handling

### Email Configuration Check (`/api/email-config`)
- Returns email service status without exposing secrets
- Used by frontend to show/hide email-dependent features

## Domain & DNS Configuration

### Resend Domain Setup
1. **Domain**: `bridgingtrust.ai` must be verified in Resend dashboard
2. **DNS Records**: Configure SPF, DKIM, and DMARC records for deliverability
3. **Verification**: Complete domain verification process in Resend

### Required DNS Records (to be added to bridgingtrust.ai)
```
# SPF Record
TXT @ "v=spf1 include:_spf.resend.com ~all"

# DKIM Record (provided by Resend after domain verification)
TXT resend._domainkey "v=DKIM1; k=rsa; p=[public_key_from_resend]"

# DMARC Record
TXT _dmarc "v=DMARC1; p=quarantine; rua=mailto:dmarc@bridgingtrust.ai"
```

## Email Addresses Used

### Primary Addresses
- **From**: `hello@bridgingtrust.ai` (verified sender)
- **Reply-To**: `support@bridgingtrust.ai`
- **Admin**: `admin@bridgingtrust.ai` (internal notifications)

### Additional Addresses (recommended)
- **DMARC Reports**: `dmarc@bridgingtrust.ai`
- **Sales**: `sales@bridgingtrust.ai`
- **Info**: `info@bridgingtrust.ai`

## Azure Static Web Apps Integration

### Environment Variables in Azure
Set these via Azure Portal or Azure CLI:

```bash
# Set via Azure CLI
az staticwebapp appsettings set --name bridging-trust-ai \
  --setting-names \
    RESEND_API_KEY=your_resend_api_key \
    EMAIL_FROM="Bridging Trust AI <hello@bridgingtrust.ai>" \
    EMAIL_REPLY_TO=support@bridgingtrust.ai \
    EMAIL_ADMIN=admin@bridgingtrust.ai \
    EMAIL_DAILY_LIMIT=100 \
    EMAIL_MONTHLY_LIMIT=1000 \
    EMAIL_HOURLY_LIMIT=10 \
    SEND_EMAILS_IN_DEVELOPMENT=false \
    DEBUG_EMAIL=false
```

## Security Features

- **Rate Limiting**: IP-based rate limiting (5 submissions/hour)
- **Bot Protection**: Honeypot field detection
- **Input Validation**: Zod schema validation
- **Error Handling**: Graceful failure handling
- **Audit Logging**: All submissions logged with IP and user agent

## Testing

### Development Testing
1. Set `SEND_EMAILS_IN_DEVELOPMENT=true`
2. Set `DEBUG_EMAIL=true` to redirect emails to Resend's test inbox
3. Submit test contact forms to verify functionality

### Production Testing
1. Verify domain is properly configured in Resend
2. Test with real email addresses
3. Monitor Resend dashboard for delivery status
4. Check spam folders for initial emails

## Monitoring & Maintenance

### Resend Dashboard
- Monitor email delivery rates
- Check bounce and complaint rates
- Review sending statistics
- Manage domain reputation

### Application Logs
- Monitor rate limiting effectiveness
- Track email sending success/failure rates
- Review bot detection accuracy
- Monitor API response times

## Troubleshooting

### Common Issues
1. **Emails not sending**: Check RESEND_API_KEY and domain verification
2. **Emails in spam**: Verify SPF, DKIM, and DMARC records
3. **Rate limiting**: Adjust limits or implement Redis for production
4. **Template errors**: Check template data structure and HTML validity

### Debug Mode
Set `DEBUG_EMAIL=true` to redirect all emails to `delivered@resend.dev` for testing. 