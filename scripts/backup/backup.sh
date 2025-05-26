#!/bin/bash
#
# GitHub Repository Backup Script
# 
# This script creates a backup of your local Git repository to a GitHub backup repository.
#

# Configuration variables
SOURCE_REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"  # Current project directory
BACKUP_REPO="git@github.com:herculeanfit1/BridgingTrustAISite-Backups.git"
LOG_DIR="$HOME/logs/github-backup"
TEMP_DIR="/tmp/github-backup-$(date +%s)"

# Create log directory if it doesn't exist
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/backup-$(date +%Y%m%d-%H%M%S).log"

# Function for logging
log() {
  local timestamp=$(date +"%Y-%m-%d %H:%M:%S")
  echo "[$timestamp] $1" | tee -a "$LOG_FILE"
}

# Error handling function
handle_error() {
  log "ERROR: $1"
  log "Cleaning up temporary directory..."
  rm -rf "$TEMP_DIR"
  exit 1
}

log "Starting backup process"
log "Source: $SOURCE_REPO"
log "Destination: $BACKUP_REPO"

# Create and move to temporary directory
mkdir -p "$TEMP_DIR" || handle_error "Failed to create temporary directory"
cd "$TEMP_DIR" || handle_error "Failed to change directory"

# Clone the source repository (normal clone, not mirror)
log "Cloning source repository"
git clone "$SOURCE_REPO" repo || handle_error "Failed to clone source repository"
cd repo || handle_error "Failed to change to repository directory"

# Check if main branch exists in source
if ! git show-ref --verify --quiet refs/heads/main; then
  log "Main branch not found, using current branch instead"
  CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
else
  CURRENT_BRANCH="main"
fi

# Add the backup repository as a remote
log "Adding backup repository as remote"
git remote add backup "$BACKUP_REPO" || handle_error "Failed to add backup remote"

# Push the current branch to the backup repository
log "Pushing to backup repository"
git push -u backup "$CURRENT_BRANCH" || log "Warning: Push failed, repository may need initialization first"

# Clean up
log "Cleaning up temporary files"
cd "$HOME" || handle_error "Failed to return to home directory"
rm -rf "$TEMP_DIR" || handle_error "Failed to remove temporary directory"

log "Backup process completed"
exit 0 