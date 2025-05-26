#!/bin/bash
# generate-dhparam.sh
# Script for generating DH parameters for SSL/TLS

set -e

DHPARAM_FILE="./certbot/ssl-dhparams.pem"
DHPARAM_SIZE=2048

echo "Generating DH parameters ($DHPARAM_SIZE bits). This may take a few minutes..."

# Check if the file already exists
if [ -f "$DHPARAM_FILE" ]; then
  echo "DH parameters file already exists at $DHPARAM_FILE"
  exit 0
fi

# Create directory if it doesn't exist
mkdir -p $(dirname "$DHPARAM_FILE")

# Generate DH parameters
openssl dhparam -out "$DHPARAM_FILE" $DHPARAM_SIZE

echo "DH parameters generated successfully at $DHPARAM_FILE" 