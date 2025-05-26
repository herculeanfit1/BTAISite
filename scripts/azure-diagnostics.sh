#!/bin/bash

# Azure Static Web Apps Diagnostic Script
# This script helps diagnose deployment and caching issues

set -e

echo "🔍 Azure Static Web Apps Diagnostic Tool"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SITE_URL="https://bridgingtrust.ai"
AZURE_URL="" # Will be set when known

echo -e "${BLUE}1. Checking build output...${NC}"
if [ -d "out" ]; then
    echo -e "${GREEN}✅ out/ directory exists${NC}"
    if [ -f "out/index.html" ]; then
        echo -e "${GREEN}✅ index.html found${NC}"
        echo "   Size: $(wc -c < out/index.html) bytes"
    else
        echo -e "${RED}❌ index.html missing${NC}"
    fi
    
    echo "   Files in out/:"
    ls -la out/ | head -10
else
    echo -e "${RED}❌ out/ directory missing${NC}"
    echo "   Run: npm run build:static"
fi

echo -e "\n${BLUE}2. Testing site accessibility...${NC}"
if command -v curl &> /dev/null; then
    echo "Testing main site..."
    if curl -s -I "$SITE_URL" | head -1 | grep -q "200"; then
        echo -e "${GREEN}✅ Site is accessible${NC}"
        
        # Check cache headers
        echo "Cache headers:"
        curl -s -I "$SITE_URL" | grep -i cache || echo "No cache headers found"
        
        # Check content type
        echo "Content type:"
        curl -s -I "$SITE_URL" | grep -i content-type || echo "No content-type header found"
        
    else
        echo -e "${RED}❌ Site not accessible or returning error${NC}"
        curl -s -I "$SITE_URL" | head -5
    fi
else
    echo -e "${YELLOW}⚠️  curl not available, skipping connectivity test${NC}"
fi

echo -e "\n${BLUE}3. Checking DNS resolution...${NC}"
if command -v nslookup &> /dev/null; then
    echo "DNS lookup for bridgingtrust.ai:"
    nslookup bridgingtrust.ai | grep -A 2 "Name:" || echo "DNS lookup failed"
else
    echo -e "${YELLOW}⚠️  nslookup not available${NC}"
fi

echo -e "\n${BLUE}4. Checking recent deployments...${NC}"
if [ -d ".git" ]; then
    echo "Recent commits:"
    git log --oneline -5
    
    echo -e "\nLast deployment commit:"
    git log -1 --pretty=format:"Commit: %h%nDate: %cd%nMessage: %s%n" --date=local
else
    echo -e "${YELLOW}⚠️  Not in a git repository${NC}"
fi

echo -e "\n${BLUE}5. Environment check...${NC}"
echo "Node version: $(node --version 2>/dev/null || echo 'Not available')"
echo "NPM version: $(npm --version 2>/dev/null || echo 'Not available')"

if [ -f "package.json" ]; then
    echo "Next.js version: $(grep '"next"' package.json | cut -d'"' -f4 || echo 'Not found')"
fi

echo -e "\n${BLUE}6. Configuration check...${NC}"
if [ -f "staticwebapp.config.json" ]; then
    echo -e "${GREEN}✅ staticwebapp.config.json exists${NC}"
    echo "Cache control settings:"
    grep -A 3 "cache-control" staticwebapp.config.json || echo "No cache-control settings found"
else
    echo -e "${RED}❌ staticwebapp.config.json missing${NC}"
fi

if [ -f "next.config.js" ]; then
    echo -e "${GREEN}✅ next.config.js exists${NC}"
    if grep -q "output.*export" next.config.js; then
        echo -e "${GREEN}✅ Static export configured${NC}"
    else
        echo -e "${YELLOW}⚠️  Static export not configured${NC}"
    fi
else
    echo -e "${RED}❌ next.config.js missing${NC}"
fi

echo -e "\n${BLUE}7. Recommendations...${NC}"
echo "If experiencing inconsistent loading:"
echo "1. Force redeploy: git commit --allow-empty -m 'Force redeploy' && git push"
echo "2. Clear browser cache completely"
echo "3. Test with direct Azure URL if available"
echo "4. Check Azure portal for deployment status"
echo "5. Monitor GitHub Actions for deployment errors"

echo -e "\n${GREEN}Diagnostic complete!${NC}" 