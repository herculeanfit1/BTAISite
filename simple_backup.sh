#!/bin/bash

SOURCE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_REPO="git@github.com:herculeanfit1/BridgingTrustAISite-Backups.git"
TEMP_DIR="/tmp/github-backup-$(date +%s)"

echo "DEBUG: BACKUP_REPO=$BACKUP_REPO"
echo "Backing up $SOURCE_DIR to $BACKUP_REPO"

# Create and change to temporary directory
mkdir -p "$TEMP_DIR" && cd "$TEMP_DIR"

# Clone the source directory
git clone "$SOURCE_DIR" source && cd source

# Add backup repository as remote and push
git remote add backup "$BACKUP_REPO" || echo "Remote already exists"
git push -f backup main

# Clean up
cd "$HOME"
rm -rf "$TEMP_DIR"
echo "Backup complete!" 