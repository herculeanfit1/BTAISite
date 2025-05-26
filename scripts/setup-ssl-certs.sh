#!/bin/bash
# ========================================================================
# setup-ssl-certs.sh
# ========================================================================
#
# Script for setting up and renewing SSL certificates with Let's Encrypt for
# the Bridging Trust AI website. This script handles:
#
# 1. Checking if certificates exist and their expiration status
# 2. Requesting new certificates if none exist
# 3. Renewing certificates if they're close to expiration
# 4. Generating Diffie-Hellman parameters for improved security
#
# The script is designed to work with Docker and can be run either
# manually or as part of an automated renewal process.
#
# Usage:
#   ./scripts/setup-ssl-certs.sh
#
# Environment variables:
#   DOMAIN - Domain name (default: bridgingtrust.ai)
#   EMAIL - Contact email for Let's Encrypt (default: admin@bridgingtrust.ai)
#   STAGING - Use Let's Encrypt staging servers (1=true, 0=false)
#   CERT_DIR - Certificate directory (default: /etc/letsencrypt)
#   WWW_DIR - Web root for ACME challenges (default: ./certbot/www)
# ========================================================================

# Exit immediately if a command exits with a non-zero status
set -e

# ========================================================================
# Configuration variables
# ========================================================================

# Default domain and email (override with environment variables)
DOMAIN=${DOMAIN:-"bridgingtrust.ai"}
EMAIL=${EMAIL:-"admin@bridgingtrust.ai"}
STAGING=${STAGING:-0}  # Set to 1 for testing with Let's Encrypt staging servers

# Directories for certificates and ACME challenge files
CERT_DIR="/etc/letsencrypt"
WWW_DIR="./certbot/www"

# Create directories if they don't exist
mkdir -p "$WWW_DIR"

# ========================================================================
# Determine whether to use staging or production Let's Encrypt
# ========================================================================
# Staging is useful for testing without hitting Let's Encrypt rate limits
# but produces certificates that browsers will not trust
if [ "$STAGING" -eq 1 ]; then
  echo "Running certbot in staging mode (for testing)"
  STAGING_FLAG="--staging"
else
  echo "Running certbot in production mode"
  STAGING_FLAG=""
fi

# ========================================================================
# Function to check if certificates exist and are valid
# ========================================================================
# Returns 0 if certificates are valid and not expiring soon
# Returns 1 if certificates need to be requested or renewed
check_certs() {
  if [ -d "$CERT_DIR/live/$DOMAIN" ]; then
    # Check expiration (30 days or less is considered needing renewal)
    # Extract expiration date from certificate
    EXPIRY=$(openssl x509 -enddate -noout -in "$CERT_DIR/live/$DOMAIN/fullchain.pem" | cut -d= -f2)
    # Convert expiration date to epoch time
    EXPIRY_EPOCH=$(date -d "$EXPIRY" +%s)
    # Get current time in epoch format
    NOW_EPOCH=$(date +%s)
    # Calculate days left until expiration
    DAYS_LEFT=$(( ($EXPIRY_EPOCH - $NOW_EPOCH) / 86400 ))
    
    echo "SSL certificate for $DOMAIN expires in $DAYS_LEFT days"
    
    # If less than 30 days remaining, renewal is needed
    if [ "$DAYS_LEFT" -lt 30 ]; then
      echo "Certificate expires soon, will attempt renewal"
      return 1
    else
      echo "Certificate is still valid"
      return 0
    fi
  else
    echo "No certificate found for $DOMAIN"
    return 1
  fi
}

# ========================================================================
# Function to request new certificates
# ========================================================================
# Uses certbot in a Docker container to request new certificates
# for both the root domain and www subdomain
request_certificates() {
  echo "Requesting Let's Encrypt certificates for $DOMAIN"
  
  # Run certbot in a Docker container to isolate dependencies
  docker run --rm \
    -v "$CERT_DIR:/etc/letsencrypt" \
    -v "$WWW_DIR:/var/www/certbot" \
    certbot/certbot certonly \
    --webroot --webroot-path /var/www/certbot \
    $STAGING_FLAG \
    --email "$EMAIL" \
    --agree-tos \
    --no-eff-email \
    -d "$DOMAIN" \
    -d "www.$DOMAIN"
    
  echo "Certificate installation complete"
}

# ========================================================================
# Function to renew existing certificates
# ========================================================================
# Uses certbot in a Docker container to attempt renewal of all
# installed certificates that are close to expiration
renew_certificates() {
  echo "Renewing Let's Encrypt certificates for $DOMAIN"
  
  # Run certbot in a Docker container to isolate dependencies
  docker run --rm \
    -v "$CERT_DIR:/etc/letsencrypt" \
    -v "$WWW_DIR:/var/www/certbot" \
    certbot/certbot renew \
    $STAGING_FLAG
    
  echo "Certificate renewal complete"
}

# ========================================================================
# Main execution
# ========================================================================
echo "Checking SSL certificates for $DOMAIN..."

if ! check_certs; then
  if [ -d "$CERT_DIR/live/$DOMAIN" ]; then
    # Certificate exists but is expiring soon, renew it
    renew_certificates
  else
    # No certificate exists, request a new one
    request_certificates
  fi
fi

# ========================================================================
# Generate Diffie-Hellman parameters for improved security
# ========================================================================
# DH parameters are used for the DHE-RSA key exchange algorithm
# This improves forward secrecy but can take a while to generate
if [ ! -f "$CERT_DIR/ssl-dhparams.pem" ]; then
  echo "Generating DH parameters (2048 bit), this may take a while..."
  openssl dhparam -out "$CERT_DIR/ssl-dhparams.pem" 2048
  echo "DH parameters generation complete"
fi

echo "SSL certificate setup complete for $DOMAIN"
echo "You can now run the application with docker-compose up -d" 