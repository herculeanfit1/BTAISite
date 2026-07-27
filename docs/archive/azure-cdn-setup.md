# Azure CDN Setup Guide for Bridging Trust AI

This document provides step-by-step instructions for setting up Azure Content Delivery Network (CDN) to improve the performance of the Bridging Trust AI website.

## Overview

Azure CDN enhances website performance by caching content at edge locations around the world, reducing latency for users and offloading traffic from the origin server. Benefits include:

1. Faster page load times
2. Reduced bandwidth costs
3. Improved scalability during traffic spikes
4. Enhanced security with DDoS protection
5. Global reach with local performance

## Prerequisites

- Azure subscription with appropriate permissions
- Existing Azure Static Web App deployment for Bridging Trust AI
- Access to Azure Portal and Azure CLI
- Domain configuration already set up

## Implementation Steps

### 1. Create Azure CDN Profile

```bash
# Set variables
RESOURCE_GROUP="BTAI-RG1"
CDN_PROFILE_NAME="btai-cdn-profile"
LOCATION="global"
CDN_SKU="Standard_Microsoft" # Options: Standard_Akamai, Standard_Microsoft, Standard_Verizon, Premium_Verizon

# Create CDN Profile
az cdn profile create \
  --name $CDN_PROFILE_NAME \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --sku $CDN_SKU
```

### 2. Create CDN Endpoint

```bash
# Set variables
STATIC_WEBAPP_NAME="btai-website"
CDN_ENDPOINT_NAME="btai-cdn-endpoint"

# Get the Static Web App hostname
ORIGIN_HOSTNAME=$(az staticwebapp show \
  --name $STATIC_WEBAPP_NAME \
  --resource-group $RESOURCE_GROUP \
  --query "defaultHostname" -o tsv)

# Create CDN Endpoint
az cdn endpoint create \
  --name $CDN_ENDPOINT_NAME \
  --profile-name $CDN_PROFILE_NAME \
  --resource-group $RESOURCE_GROUP \
  --origin $ORIGIN_HOSTNAME \
  --origin-host-header $ORIGIN_HOSTNAME \
  --enable-compression true
```

### 3. Configure Cache Rules

Configure cache expiration rules to optimize caching:

```bash
# Configure default cache expiration (1 day)
az cdn endpoint update \
  --name $CDN_ENDPOINT_NAME \
  --profile-name $CDN_PROFILE_NAME \
  --resource-group $RESOURCE_GROUP \
  --query-string-caching-behavior "IgnoreQueryString" \
  --default-origin-group-id $ORIGIN_HOSTNAME

# Add caching rules for different content types
az cdn endpoint rule add \
  --name $CDN_ENDPOINT_NAME \
  --profile-name $CDN_PROFILE_NAME \
  --resource-group $RESOURCE_GROUP \
  --order 1 \
  --rule-name "CacheImages" \
  --action-name "CacheExpiration" \
  --cache-behavior "Override" \
  --cache-duration "7.00:00:00" \
  --match-variable "UrlFileExtension" \
  --operator "Equal" \
  --match-value "jpg" "jpeg" "png" "gif" "webp" "svg" "ico"

az cdn endpoint rule add \
  --name $CDN_ENDPOINT_NAME \
  --profile-name $CDN_PROFILE_NAME \
  --resource-group $RESOURCE_GROUP \
  --order 2 \
  --rule-name "CacheStaticAssets" \
  --action-name "CacheExpiration" \
  --cache-behavior "Override" \
  --cache-duration "30.00:00:00" \
  --match-variable "UrlFileExtension" \
  --operator "Equal" \
  --match-value "css" "js" "woff" "woff2" "ttf" "otf"

az cdn endpoint rule add \
  --name $CDN_ENDPOINT_NAME \
  --profile-name $CDN_PROFILE_NAME \
  --resource-group $RESOURCE_GROUP \
  --order 3 \
  --rule-name "NoCacheHTML" \
  --action-name "CacheExpiration" \
  --cache-behavior "Override" \
  --cache-duration "0.00:10:00" \
  --match-variable "UrlFileExtension" \
  --operator "Equal" \
  --match-value "html" "htm"
```

### 4. Configure Custom Domain

```bash
# Set variables
DOMAIN_NAME="bridgingtrust.ai"
CDN_CUSTOM_DOMAIN_NAME="www-cdn"

# Add custom domain to CDN endpoint
az cdn custom-domain create \
  --endpoint-name $CDN_ENDPOINT_NAME \
  --hostname $DOMAIN_NAME \
  --name $CDN_CUSTOM_DOMAIN_NAME \
  --profile-name $CDN_PROFILE_NAME \
  --resource-group $RESOURCE_GROUP
```

### 5. Enable HTTPS

```bash
# Enable HTTPS with CDN-managed certificate
az cdn custom-domain enable-https \
  --endpoint-name $CDN_ENDPOINT_NAME \
  --name $CDN_CUSTOM_DOMAIN_NAME \
  --profile-name $CDN_PROFILE_NAME \
  --resource-group $RESOURCE_GROUP
```

### 6. Update DNS Configuration

Add a CNAME record in your DNS configuration:

1. Log in to your domain provider (Namecheap)
2. Navigate to the DNS management page for bridgingtrust.ai
3. Add a CNAME record pointing to the CDN endpoint:
   - Type: CNAME
   - Host: www
   - Value: `$CDN_ENDPOINT_NAME.azureedge.net`
   - TTL: 1 hour (3600 seconds)

### 7. Configure Compression

Enable compression for text-based content types:

```bash
# Enable compression
az cdn endpoint update \
  --name $CDN_ENDPOINT_NAME \
  --profile-name $CDN_PROFILE_NAME \
  --resource-group $RESOURCE_GROUP \
  --content-types-to-compress \
    "application/javascript" \
    "application/json" \
    "application/x-javascript" \
    "application/xml" \
    "text/css" \
    "text/html" \
    "text/javascript" \
    "text/plain" \
    "text/xml" \
  --is-compression-enabled true
```

### 8. Configure Purge Rules

Create a script to purge the CDN cache when new content is deployed:

```bash
#!/bin/bash
# cdn-purge.sh

# Set variables
RESOURCE_GROUP="BTAI-RG1"
CDN_PROFILE_NAME="btai-cdn-profile"
CDN_ENDPOINT_NAME="btai-cdn-endpoint"

# Purge specific content paths
az cdn endpoint purge \
  --name $CDN_ENDPOINT_NAME \
  --profile-name $CDN_PROFILE_NAME \
  --resource-group $RESOURCE_GROUP \
  --content-paths "/" "/blog/*" "/services/*"
```

Add this script to your CI/CD pipeline to automatically purge the cache after deployment.

## Validation and Testing

### 1. Verify CDN Endpoint

```bash
# Verify the CDN endpoint is provisioned and running
az cdn endpoint show \
  --name $CDN_ENDPOINT_NAME \
  --profile-name $CDN_PROFILE_NAME \
  --resource-group $RESOURCE_GROUP \
  --query "resourceState" -o tsv
```

### 2. Verify Custom Domain Configuration

```bash
# Verify custom domain is configured and HTTPS is enabled
az cdn custom-domain show \
  --endpoint-name $CDN_ENDPOINT_NAME \
  --name $CDN_CUSTOM_DOMAIN_NAME \
  --profile-name $CDN_PROFILE_NAME \
  --resource-group $RESOURCE_GROUP \
  --query "[name, customHttpsParameters.certificateSource]" -o tsv
```

### 3. Test Performance

1. Use Azure Front Door testing tools to verify CDN performance
2. Use third-party tools like WebPageTest or Lighthouse to compare performance
3. Compare latency metrics before and after CDN implementation

## Monitoring and Maintenance

### 1. Set Up CDN Metrics

```bash
# Create a metric alert for high bandwidth usage
az monitor metrics alert create \
  --name "CDN-High-Bandwidth" \
  --resource-group $RESOURCE_GROUP \
  --scopes "/subscriptions/$(az account show --query id -o tsv)/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.Cdn/profiles/$CDN_PROFILE_NAME/endpoints/$CDN_ENDPOINT_NAME" \
  --condition "avg BandwidthUtilized > 500" \
  --window-size 5m \
  --evaluation-frequency 1m \
  --action "/subscriptions/$(az account show --query id -o tsv)/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.Insights/actionGroups/EmailAdmins"
```

### 2. Review CDN Analytics

Regularly review CDN analytics in the Azure Portal:

1. Cache hit ratio
2. Bandwidth consumption
3. Request count
4. Response success rate
5. Latency metrics by region

## Cost Management

1. Choose the appropriate CDN tier based on needs
2. Set up budget alerts to monitor CDN costs
3. Optimize caching rules to maximize cache hit ratio
4. Consider geofiltering to serve content only to target regions

## Security Considerations

1. **Web Application Firewall (WAF)**: Consider enabling WAF with Azure Front Door
2. **HTTPS Only**: Ensure all traffic uses HTTPS
3. **Access Restrictions**: Use geo-filtering if needed
4. **Token Authentication**: Set up token authentication for sensitive content

## Disaster Recovery

1. Document CDN configuration settings
2. Include CDN in backup and recovery procedures
3. Create a fallback plan to direct traffic to the origin if CDN issues occur

## Next Steps After Implementation

1. Run performance tests to verify improvements
2. Update documentation with new CDN URLs
3. Train team members on cache purging procedures
4. Implement monitoring and alerts for CDN metrics
5. Update todo.md to mark the CDN configuration task as complete 