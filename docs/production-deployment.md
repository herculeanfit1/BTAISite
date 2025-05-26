# Production Deployment Guide with SSL

This guide outlines the steps to deploy the Bridging Trust AI website in production with proper SSL certification using Let's Encrypt.

## Prerequisites

- A server with Docker and Docker Compose installed
- Domain name pointed to your server's IP address
- Port 80 and 443 open on your server's firewall

## Deployment Steps

### 1. Clone the Repository

```bash
git clone https://github.com/your-organization/BridgingTrustAI.git
cd BridgingTrustAI
```

### 2. Set up Environment Variables

Create a `.env` file in the project root with the following variables:

```
NODE_ENV=production
SSL_CERT_ENV=prod
DOMAIN=bridgingtrust.ai
CUSTOM_HOSTNAME=bridgingtrust.ai
LETSENCRYPT_CERT_DIR=/etc/letsencrypt
LETSENCRYPT_WWW_DIR=./certbot/www
```

Adjust the `DOMAIN` and `CUSTOM_HOSTNAME` values to match your actual domain.

### 3. Set up SSL Certificates

Run the SSL certificate setup script:

```bash
./scripts/setup-ssl-certs.sh
```

This script will:
- Check for existing certificates
- Request new certificates from Let's Encrypt if needed
- Generate DH parameters for enhanced security

### 4. Deploy the Application

Start all services using Docker Compose:

```bash
docker-compose up -d
```

This will launch:
- The Next.js application
- Nginx as a reverse proxy with SSL termination
- Certbot for automatic certificate renewal

### 5. Verify Deployment

Visit your domain with HTTPS to verify the website is running correctly:

```
https://bridgingtrust.ai
```

## SSL Certificate Renewal

Certificates from Let's Encrypt expire every 90 days. Our setup includes an automatic renewal process via the Certbot container, which attempts renewal every 12 hours (certificates will only be renewed when they're close to expiration).

To manually trigger a renewal, run:

```bash
docker-compose exec certbot certbot renew
```

## Troubleshooting

### Certificate Issues

If there are issues with the certificates:

1. Check the Certbot logs:
   ```bash
   docker-compose logs certbot
   ```

2. Verify that your domain is correctly pointed to your server's IP address.

3. Ensure ports 80 and 443 are open on your server's firewall.

4. For testing purposes, you can use Let's Encrypt's staging environment by setting `STAGING=1` before running the setup script:
   ```bash
   STAGING=1 ./scripts/setup-ssl-certs.sh
   ```

### Application Issues

If the application is not running correctly:

1. Check the application logs:
   ```bash
   docker-compose logs app
   ```

2. Verify the Nginx configuration:
   ```bash
   docker-compose exec nginx nginx -t
   ```

## Continuous Integration (CI)

For CI environments, SSL is automatically disabled. The application will run in HTTP mode when the `CI` environment variable is set to `true`. This simplifies testing in CI pipelines.

To run the application in CI mode locally:

```bash
CI=true npm run dev
``` 