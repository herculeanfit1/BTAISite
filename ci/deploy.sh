#!/bin/bash
# Deployment script for Azure Static Web Apps
# Part of the Node 20 LTS upgrade

set -Eeuo pipefail  # Enhanced error handling
IFS=$'\n\t'         # Secure IFS
trap 'echo "❌ Deployment failed at line $LINENO"' ERR

# Configuration
ENVIRONMENT=${1:-staging}  # Default to staging if no argument provided
MAIN_BRANCH="main"
STAGING_SLOT="staging"
PRODUCTION_SLOT="production"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting deployment to ${ENVIRONMENT}${NC}"

# Ensure we're using the right Node.js version
NODE_VERSION=$(node -v)
if [[ $NODE_VERSION != v20* ]]; then
  echo -e "${RED}Error: Node.js v20.x is required, but you have ${NODE_VERSION}${NC}"
  echo -e "${YELLOW}Try running: nvm use 20${NC}"
  exit 1
fi

# Ensure all changes are committed
if [[ -n $(git status --porcelain) ]]; then
  echo -e "${RED}Error: Working directory not clean. Commit or stash changes before deploying.${NC}"
  git status
  exit 1
fi

# Make sure we're on the main branch
CURRENT_BRANCH=$(git branch --show-current)
if [[ "$CURRENT_BRANCH" != "$MAIN_BRANCH" ]]; then
  echo -e "${YELLOW}You are not on the ${MAIN_BRANCH} branch. Switching...${NC}"
  git checkout $MAIN_BRANCH
fi

# Pull latest changes
echo -e "${YELLOW}Pulling latest changes from origin/${MAIN_BRANCH}...${NC}"
git pull origin $MAIN_BRANCH

# Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
npm ci

# Run tests
echo -e "${YELLOW}Running tests...${NC}"
npm test

# Create deployment assets
echo -e "${YELLOW}Creating deployment assets...${NC}"
npm run prepare:deploy

# Deploy to the appropriate environment
if [[ "$ENVIRONMENT" == "production" ]]; then
  echo -e "${YELLOW}Deploying to production...${NC}"
  npm run deploy:prod
  
  # Create a deployment tag
  VERSION=$(node -p "require('./package.json').version")
  TAG_NAME="v${VERSION}-node20-$(date +%Y%m%d%H%M)"
  
  echo -e "${YELLOW}Creating deployment tag: ${TAG_NAME}${NC}"
  git tag -a "$TAG_NAME" -m "Production deployment with Node 20 LTS"
  git push origin "$TAG_NAME"
else
  echo -e "${YELLOW}Deploying to staging...${NC}"
  npm run deploy:staging
fi

echo -e "${GREEN}Deployment preparation complete!${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo -e "1. Push the deployment to GitHub to trigger the GitHub Actions workflow"
echo -e "2. Monitor the deployment in the Azure Portal"
echo -e "3. Test the application in the ${ENVIRONMENT} environment"
echo ""
echo -e "To push to GitHub, run:"
echo -e "${GREEN}git push origin ${MAIN_BRANCH}${NC}"
echo ""
echo -e "To monitor the deployment, visit:"
echo -e "${GREEN}https://github.com/herculeanfit1/BridgingTrustAISite/actions${NC}"

exit 0 