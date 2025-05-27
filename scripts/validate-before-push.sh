#!/bin/bash

# =============================================================================
# Validate Before Push - Bridging Trust AI
# =============================================================================
# Simple wrapper to run comprehensive validation before pushing to GitHub
# This minimizes GitHub Actions costs by catching issues locally
# =============================================================================

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🚀 BRIDGING TRUST AI - PRE-PUSH VALIDATION${NC}"
echo -e "${BLUE}===========================================${NC}\n"

echo -e "${YELLOW}💰 Cost-Conscious CI/CD Strategy:${NC}"
echo "   • Run comprehensive tests locally (FREE)"
echo "   • Minimize GitHub Actions usage (COST SAVINGS)"
echo "   • Only deploy if all tests pass (RELIABILITY)"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -f "next.config.js" ]; then
    echo "❌ Please run this script from the BTAISite root directory"
    exit 1
fi

# Run the comprehensive validation
echo -e "${BLUE}Running comprehensive local validation...${NC}"
./scripts/pre-commit-validation.sh "$@"

# If we get here, all tests passed
echo ""
echo -e "${GREEN}🎉 ALL VALIDATIONS PASSED!${NC}"
echo -e "${GREEN}✅ Your code is ready to push to GitHub${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "   1. git add -A"
echo "   2. git commit -m 'your commit message'"
echo "   3. git push"
echo ""
echo -e "${YELLOW}💡 GitHub Actions will run minimal validation only${NC}"
echo -e "${YELLOW}   (saving costs while ensuring deployment works)${NC}" 