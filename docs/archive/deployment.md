# Deployment Guide

This document outlines the deployment process for the Bridging Trust AI website.

## Environment Modes

The application can run in several environment modes:

- **Development**: Used for local development with hot reloading
- **Production**: Used for the live production environment
- **CI/Testing**: Used for continuous integration and testing

## SSL Configuration

The application supports the following SSL configurations:

- **Development**: Uses self-signed certificates for local development
- **Production**: Uses Let's Encrypt for automatic certificate generation
- **CI/Testing**: Runs in HTTP-only mode for testing and CI environments

### SSL Environment Variables

- `SSL_CERT_ENV`: Controls the SSL certificate source
  - `dev`: Uses self-signed certificates (default for development)
  - `prod`: Uses Let's Encrypt certificates (for production)
  - `none`: Disables SSL entirely (for CI/testing)
- `CI`: When set to `true`, forces HTTP-only mode regardless of SSL_CERT_ENV

## Docker Deployment

The application can be deployed using Docker with the following configurations:

### Development Mode

```bash
docker-compose up --build
```

### CI/Testing Mode

```bash
CI=true docker-compose up --build
```

### Production Mode

```bash
SSL_CERT_ENV=prod docker-compose up --build
```

## Azure Static Web App Deployment

The project is set up for deployment to Azure Static Web Apps. Use the deployment script:

```bash
./scripts/deploy-azure-staticwebapp.sh
```

### Azure Static Web App Configuration

In Azure Static Web App:

1. Configure custom domain
2. SSL certificates are automatically managed by Azure
3. Environment variables are set in the Azure portal

## Let's Encrypt SSL Certificate Setup (For Production Docker)

For production deployment using Docker with Let's Encrypt:

1. Set `SSL_CERT_ENV=prod` in your environment
2. Run the SSL certificate setup script:
   ```bash
   ./scripts/setup-ssl-certs.sh
   ```
3. Start the Docker containers:
   ```bash
   docker-compose up --build -d
   ```

The Certbot service will automatically handle certificate renewal.

## CI/CD Pipeline

The CI/CD pipeline is set up to:

1. Build and test the application in CI mode (HTTP only)
2. Deploy to staging environment for verification
3. Deploy to production environment with proper SSL configuration

For more details, see [Production Deployment](./production-deployment.md).

## Prerequisites

- Node.js 18.x
- Docker and Docker Compose (for containerized deployment)
- Namecheap shared hosting account with Node.js 18.17 support
- GitHub account for CI/CD
- Domain name with DNS access for SSL certificate setup

## Local Deployment

1. **Build the project**:

   ```bash
   npm run build
   ```

2. **Start production server**:

   ```bash
   npm start
   ```

3. **Testing internationalization locally**:
   Visit `http://localhost:3000/en` for English or `http://localhost:3000/es` for Spanish.

## Docker Deployment

1. **Build the Docker image**:

   ```bash
   docker build -t bridging-trust-ai .
   ```

2. **Run with Docker Compose**:

   ```bash
   docker-compose up -d
   ```

3. **Environment Variables**:

   - `DEFAULT_LOCALE`: Sets the default locale (e.g., 'en')
   - `AZURE_TENANT_ID`: For Business Central integration
   - `AZURE_CLIENT_ID`: For Business Central integration
   - `AZURE_CLIENT_SECRET`: For Business Central integration
   - `BC_COMPANY_ID`: Business Central company ID
   - `GA4_MEASUREMENT_ID`: Google Analytics 4 measurement ID
   - `SSL_CERT_ENV`: SSL certificate environment ('dev', 'prod', or 'none')
   - `DOMAIN`: Domain name for Let's Encrypt certificates
   - `HOST`: Server hostname (default: '0.0.0.0')
   - `PORT`: Server port (default: 3000)
   - `CUSTOM_HOSTNAME`: Custom hostname for development (default: 'dev.bridgingtrust.local')

4. **Volumes**:
   The `./messages` directory is mounted to `/app/messages` in the container to allow real-time updates to translation files without rebuilding the container.

## SSL Certificate Configuration

The application supports three SSL certificate configurations:

### 1. Development Environment (Self-signed Certificates)

For local development, you can generate self-signed certificates:

```bash
mkdir -p .cert
cd .cert
mkcert -install
mkcert localhost 127.0.0.1 ::1 dev.bridgingtrust.local
mv localhost+3-key.pem localhost-key.pem
mv localhost+3.pem localhost.pem
```

Set `SSL_CERT_ENV=dev` to use these certificates. Note that browsers will show a warning about self-signed certificates that you'll need to bypass.

### 2. Production Environment (Let's Encrypt)

For production, use Let's Encrypt certificates:

1. **Install Certbot**:

   ```bash
   # On Ubuntu/Debian
   sudo apt-get update
   sudo apt-get install certbot
   
   # On CentOS/RHEL
   sudo yum install certbot
   ```

2. **Obtain Let's Encrypt Certificates**:

   ```bash
   sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com
   ```

   This will create certificates in `/etc/letsencrypt/live/yourdomain.com/`.

3. **Configure the Application**:

   Set the following environment variables:
   ```
   SSL_CERT_ENV=prod
   DOMAIN=yourdomain.com
   ```

4. **Certificate Auto-renewal**:

   Set up a cron job to automatically renew certificates:
   ```bash
   sudo crontab -e
   ```
   
   Add this line to run renewal check twice daily:
   ```
   0 */12 * * * certbot renew --quiet
   ```

5. **Post-renewal Hook**:

   Create a script to restart your server after certificate renewal:
   ```bash
   sudo nano /etc/letsencrypt/renewal-hooks/post/restart-server.sh
   ```
   
   Add:
   ```bash
   #!/bin/bash
   systemctl restart your-service-name
   ```
   
   Make it executable:
   ```bash
   sudo chmod +x /etc/letsencrypt/renewal-hooks/post/restart-server.sh
   ```

### 3. HTTP Only (No SSL)

For CI environments or when no certificates are available, the server will run in HTTP mode:

- Set `SSL_CERT_ENV=none` or `CI=true`

## Namecheap cPanel Deployment

1. **Prepare the build**:

   ```bash
   npm run build
   ```

2. **Log in to cPanel** and navigate to the Node.js App setup.

3. **Configure Node.js App**:

   - Set the application root to your uploaded folder
   - Set the application URL to your domain
   - Set the application startup file to `server.js`
   - Set Node.js version to 18.17
   - Set environment variables (same as Docker deployment)

4. **Upload Files**:

   - Upload the `.next` directory
   - Upload the `public` directory
   - Upload the `node_modules` directory (or run `npm install --production` on the server)
   - Upload the `server.js` file
   - Upload the `messages` directory for internationalization
   - Upload the `middleware.ts` file for language routing

5. **SSL Configuration in cPanel**:

   - In cPanel, go to "SSL/TLS" and then "Manage SSL Sites"
   - Use the Let's Encrypt integration in cPanel to generate certificates
   - Set `SSL_CERT_ENV=none` as cPanel will handle SSL termination

6. **Start the Application** from the cPanel interface.

## Internationalization Considerations

1. **Locale Files**:

   - All locale files are stored in the `messages` directory
   - Each locale has its own JSON file (e.g., `en.json`, `es.json`)
   - To add a new language, create a new JSON file and add the locale to the `locales` array in `app/i18n.ts`

2. **URL Structure**:

   - Each page is accessible via its locale-prefixed URL (e.g., `/en/about`, `/es/about`)
   - The default locale redirects if accessed directly (e.g., `/about` → `/en/about`)

3. **SEO Considerations**:
   - Each language version of a page has its own unique URL
   - Set the `lang` attribute in the `<html>` tag for proper language identification
   - Use hreflang tags for language alternatives

## Monitoring and Troubleshooting

1. **Check Logs**:

   - For Docker: `docker-compose logs -f bridging-trust-ai`
   - For Namecheap: Check error logs in cPanel
   - For Azure: Check logs in Azure Portal

2. **SSL Troubleshooting**:

   - **Certificate path issues**: Verify the certificates exist at the expected paths
   - **Permission issues**: Ensure the application has read access to certificate files
   - **Renewal failures**: Check certbot logs at `/var/log/letsencrypt/`

3. **Common Issues**:
   - **404 on language routes**: Ensure middleware.ts is properly deployed
   - **Missing translations**: Check that all message files are properly uploaded
   - **Styling issues**: Verify that the .next directory was properly built and uploaded
