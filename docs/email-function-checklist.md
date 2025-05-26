# Email Function Integration Checklist

## Local Environment Setup

- [ ] Create `.env.local` file in project root with:
  - [ ] `AZURE_FUNCTION_URL=https://btai-email-relay.azurewebsites.net/api/SendContactForm`
  - [ ] `AZURE_FUNCTION_KEY=[Get from Azure Portal]`
- [ ] Restart development server
- [ ] Run test script: `./scripts/test-email-api-route.sh`
- [ ] Verify successful email delivery

## Azure Function App

- [ ] Confirm function deployed to `btai-email-relay`
- [ ] Verify environment variables in Azure Portal:
  - [ ] `RESEND_API_KEY`
  - [ ] `EMAIL_FROM=no-reply@bridgingtrust.ai`
  - [ ] `EMAIL_TO=sales@bridgingtrust.ai`
- [ ] Test function directly via Portal or curl

## Production Environment

- [ ] Add environment variables to Azure Static Web App:
  - [ ] `AZURE_FUNCTION_URL`
  - [ ] `AZURE_FUNCTION_KEY`
- [ ] Rebuild and deploy website
- [ ] Test production API endpoint: `./scripts/test-email-api-route.sh https://www.bridgingtrust.ai/api/send-email`
- [ ] Test production form submission through browser

## Documentation

- [ ] Complete test results in `docs/email-function-test-results.md`
- [ ] Update README.md with email function information
- [ ] Document any issues encountered and their solutions

## Monitoring & Security

- [ ] Configure Azure Application Insights for monitoring
- [ ] Create a dedicated function key for the website
- [ ] Set up alerts for function failures
- [ ] Document key rotation procedure 