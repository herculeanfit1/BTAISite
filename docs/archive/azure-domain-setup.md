# Azure Static Web Apps Custom Domain Setup Guide

This document provides detailed instructions for configuring a custom domain with Azure Static Web Apps for the Bridging Trust AI website.

## Prerequisites

- An Azure account with access to the BTAI-RG1 resource group
- Access to the Namecheap domain control panel for bridgingtrust.ai
- The Azure Static Web App already deployed

## 1. Preparing the Azure Static Web App

Before adding a custom domain, ensure your Static Web App is properly deployed and functioning with the default Azure domain.

### Verify Static Web App Status

```bash
# Check the status of your Static Web App
az staticwebapp show --name bridgingtrust-website --resource-group BTAI-RG1
```

Ensure the `defaultHostname` field shows a value like `bridgingtrust-website.azurestaticapps.net` and the `status` is `Ready`.

## 2. Adding the Custom Domain in Azure

### Using Azure Portal (Recommended)

1. Navigate to the Azure Portal
2. Go to your Static Web App (bridgingtrust-website)
3. Select "Custom domains" from the left menu
4. Click "Add"
5. Enter your domain name (e.g., `bridgingtrust.ai` or `www.bridgingtrust.ai`)
6. Click "Next" to see the validation options

### Using Azure CLI

```bash
# Add a custom domain
az staticwebapp hostname add \
  --name bridgingtrust-website \
  --resource-group BTAI-RG1 \
  --hostname bridgingtrust.ai

# For www subdomain
az staticwebapp hostname add \
  --name bridgingtrust-website \
  --resource-group BTAI-RG1 \
  --hostname www.bridgingtrust.ai
```

## 3. Domain Validation Options

Azure provides two methods to validate that you own the domain:

### Option 1: CNAME Validation (Recommended for subdomains)

For subdomains like `www.bridgingtrust.ai`:

1. Take note of the CNAME record provided by Azure. It will look like:

   - Name: `www`
   - Value: `bridgingtrust-website.azurestaticapps.net`

2. Log in to your Namecheap account
3. Navigate to Domain List and select `bridgingtrust.ai`
4. Go to the "Advanced DNS" tab
5. Add a CNAME Record:
   - Type: CNAME
   - Host: `www` (or your subdomain)
   - Value: `bridgingtrust-website.azurestaticapps.net`
   - TTL: Automatic

### Option 2: TXT Validation (For apex domain)

For the apex domain `bridgingtrust.ai`:

1. Take note of the TXT record provided by Azure. It will look like:

   - Name: `asuid.bridgingtrust.ai`
   - Value: A unique identifier like `12345678-90ab-cdef-1234-567890abcdef`

2. Log in to your Namecheap account
3. Navigate to Domain List and select `bridgingtrust.ai`
4. Go to the "Advanced DNS" tab
5. Add a TXT Record:
   - Type: TXT
   - Host: `asuid`
   - Value: The unique identifier provided by Azure
   - TTL: Automatic

## 4. Configuring DNS Records

### For the Apex Domain (bridgingtrust.ai)

Since Azure Static Web Apps require CNAME records but DNS standards don't allow CNAME records on the apex domain, you have two options:

#### Option A: Using DNS Provider's ANAME/ALIAS Record (Recommended)

If Namecheap supports ANAME/ALIAS records:

1. Add an ALIAS record:
   - Type: ALIAS
   - Host: `@`
   - Value: `bridgingtrust-website.azurestaticapps.net`
   - TTL: Automatic

#### Option B: Using A Records to Azure IPs

If ALIAS is not supported:

1. Add A records pointing to Azure Static Web Apps IP addresses:
   - Type: A
   - Host: `@`
   - Value: `23.2.146.23` (Note: This IP may change, check Azure documentation for current IPs)
   - TTL: Automatic

### For WWW Subdomain

1. Add a CNAME record:
   - Type: CNAME
   - Host: `www`
   - Value: `bridgingtrust-website.azurestaticapps.net`
   - TTL: Automatic

## 5. Verifying Domain Setup

After setting up DNS records, return to Azure Portal:

1. On the Custom domains page, click "Validate"
2. Azure will check for the correct DNS records
3. If validation succeeds, the domain will be added to your Static Web App
4. SSL Certificate will be automatically provisioned

### DNS Propagation

DNS changes can take 24-48 hours to propagate globally. You can check the status with:

```bash
# Check DNS propagation
dig bridgingtrust.ai
dig www.bridgingtrust.ai
```

## 6. Setting up SSL/TLS Certificate

Azure Static Web Apps automatically provisions and renews SSL certificates for custom domains. You don't need to take any additional steps for SSL configuration.

To verify the certificate is working properly:

1. Wait for the "SSL State" to show "Healthy" in the Azure Portal
2. Test your domain with HTTPS: https://bridgingtrust.ai
3. Check the certificate details in your browser

## 7. Testing the Domain

After DNS propagation and SSL provisioning are complete:

1. Visit your domain in a browser: https://bridgingtrust.ai
2. Ensure all resources load correctly
3. Test functionality across the site
4. Verify that there are no mixed content warnings

## 8. Troubleshooting

If you encounter issues, check the following:

### DNS Configuration Issues

- Verify DNS records using `dig` or online DNS lookup tools
- Check for conflicting DNS records
- Ensure you've added the correct record types (A, CNAME, TXT)

### Certificate Issues

- If the certificate shows as "Pending" for more than 24 hours, try removing and re-adding the custom domain
- Ensure there are no CAA records blocking Azure from issuing certificates

### Azure Portal Issues

- Check the Static Web App logs for any errors
- Verify that the web app is running correctly with the default Azure domain

## 9. Best Practices

- Set up both www and non-www versions of your domain
- Configure a redirect from one to the other for consistency
- Monitor SSL certificate expiration (though Azure handles renewals)
- Regularly test your domain with security tools like SSL Labs

For Azure-specific questions, refer to the [Azure Static Web Apps documentation](https://docs.microsoft.com/en-us/azure/static-web-apps/custom-domain).

## 10. Domain Renewal Considerations

Remember that the domain itself needs to be renewed through Namecheap:

- Set up auto-renewal for the domain
- Ensure payment methods are up to date
- Set calendar reminders for domain expiration
