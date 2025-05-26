#!/bin/bash
#
# GitHub Repository Initial Backup Script
# 
# This script creates the initial backup of your repository using GitHub CLI.
#

# Configuration variables
SOURCE_REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"  # Current project directory
BACKUP_REPO="herculeanfit1/BridgingTrustAISite-Backups"
BACKUP_URL="git@github.com:$BACKUP_REPO.git"
TEMP_DIR="/tmp/github-init-backup-$(date +%s)"

echo "Starting initial backup process"
echo "Source: $SOURCE_REPO"
echo "Destination: $BACKUP_URL"

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo "GitHub CLI not found. Please install it with: brew install gh"
    exit 1
fi

# Create temporary directory
mkdir -p "$TEMP_DIR"
cd "$TEMP_DIR" || exit 1

# Clone source repository
echo "Cloning source repository"
git clone "$SOURCE_REPO" repo || exit 1
cd repo || exit 1

# Add backup repository as remote
echo "Adding backup repository as remote"
git remote add backup "$BACKUP_URL" || echo "Remote already exists"

# Push to backup repository
echo "Pushing to backup repository"
git push -f backup main || {
    echo "Push failed, creating repo"
    gh repo create "$BACKUP_REPO" --private --source=. --push
}

# Clean up
echo "Cleaning up temporary files"
cd "$HOME" || exit 1
rm -rf "$TEMP_DIR"

echo "Initial backup completed successfully"
echo "Now you can run ./backup.sh for regular backups"
echo "Or run ./setup_backup.sh to set up automated backups" 