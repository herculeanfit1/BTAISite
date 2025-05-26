#!/bin/bash

# rollback.sh
# Rollback script for emergency deployments
# Usage: ./scripts/rollback.sh [commit-hash]
#
# This script:
# 1. Creates a rollback branch from the specified commit (or last successful deployment)
# 2. Pushes the branch to origin
# 3. Creates a pull request to trigger the deployment workflow

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Print with timestamp
function log() {
  echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"
}

function warn() {
  echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

function error() {
  echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
  exit 1
}

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
  error "GitHub CLI is not installed. Please install it first: https://cli.github.com/"
fi

# Check if user is logged in to GitHub
if ! gh auth status &> /dev/null; then
  error "You are not logged in to GitHub. Please run 'gh auth login' first."
fi

# If commit hash is not provided, use the last successful deployment
if [ -z "$1" ]; then
  log "No commit hash provided. Finding last successful deployment..."
  LAST_SUCCESSFUL=$(gh run list --workflow=azure-static-web-apps.yml --status=success --limit=1 --json headSha --jq '.[0].headSha')
  
  if [ -z "$LAST_SUCCESSFUL" ]; then
    error "Could not find last successful deployment. Please provide a commit hash."
  fi
  
  COMMIT_HASH=$LAST_SUCCESSFUL
  log "Found last successful deployment: $COMMIT_HASH"
else
  COMMIT_HASH=$1
  log "Using provided commit hash: $COMMIT_HASH"
fi

# Get current branch to return to it later
CURRENT_BRANCH=$(git branch --show-current)
log "Current branch: $CURRENT_BRANCH"

# Create rollback branch
BRANCH_NAME="rollback-$(date +%Y-%m-%d-%H-%M)"
log "Creating rollback branch: $BRANCH_NAME"

git fetch origin
git checkout -b $BRANCH_NAME main || error "Failed to create branch"
git reset --hard $COMMIT_HASH || error "Failed to reset to commit $COMMIT_HASH"

# Push the branch
log "Pushing branch to origin..."
git push origin $BRANCH_NAME || error "Failed to push branch"

# Create pull request
log "Creating pull request..."
PR_URL=$(gh pr create --title "ROLLBACK: Emergency rollback to $COMMIT_HASH" \
  --body "This is an emergency rollback to the last known good state at commit $COMMIT_HASH.

**Reason for rollback:**
[PLEASE DESCRIBE THE ISSUE THAT REQUIRES ROLLBACK]

**Changes being reverted:**
This rollback reverts all changes between commit $COMMIT_HASH and the current HEAD of main.

**Testing:**
- [ ] Verified that the rollback version functions correctly
- [ ] Tested critical features
" \
  --base main \
  --head $BRANCH_NAME)

if [ $? -ne 0 ]; then
  error "Failed to create pull request"
fi

log "Rollback PR created: $PR_URL"

# Return to original branch
git checkout $CURRENT_BRANCH

log "Rollback preparation complete."
log ""
log "Next steps:"
log "1. Review the pull request: $PR_URL"
log "2. Make any necessary adjustments to the rollback branch"
log "3. Get approval from required reviewers"
log "4. Merge the PR to trigger the deployment"
log ""
log "For expedited emergencies, you can also manually trigger the workflow:"
log "gh workflow run azure-static-web-apps.yml --ref $BRANCH_NAME" 