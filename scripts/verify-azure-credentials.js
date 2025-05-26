#!/usr/bin/env node

/**
 * Azure Credentials Verification Script
 * 
 * This script checks if the required Azure Static Web Apps credentials
 * are properly set in the environment variables.
 * 
 * It's useful for verifying deployment configurations both locally
 * and in CI/CD environments.
 * 
 * Usage:
 *   node scripts/verify-azure-credentials.js
 */

// ANSI color codes for console output
const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m'
};

/**
 * Checks if an environment variable is set
 * 
 * @param {string} varName - The name of the environment variable to check
 * @returns {boolean} - True if the variable is set, false otherwise
 */
function isEnvVarSet(varName) {
  return process.env[varName] !== undefined && process.env[varName] !== '';
}

/**
 * Main function to verify Azure credentials
 */
function verifyAzureCredentials() {
  console.log(`${COLORS.blue}Verifying Azure Static Web Apps credentials...${COLORS.reset}`);
  
  // Check the Azure Static Web Apps API token
  const tokenVarName = 'AZURE_STATIC_WEB_APPS_API_TOKEN';
  if (isEnvVarSet(tokenVarName)) {
    console.log(`${COLORS.green}✅ ${tokenVarName} is set${COLORS.reset}`);
  } else {
    console.error(`${COLORS.red}❌ ERROR: ${tokenVarName} is not set!${COLORS.reset}`);
    console.log(`
${COLORS.yellow}To fix this:${COLORS.reset}
1. Go to your Azure Static Web App in the Azure Portal
2. Navigate to Deployment > Deployment token
3. Copy the token
4. Set it as a secret in your GitHub repository:
   - Go to Settings > Secrets > Actions
   - Add a new repository secret named ${tokenVarName}
   - Paste the token as the value
    `);
    process.exit(1);
  }

  // Additional checks for other Azure-related environment variables
  // These are optional but recommended
  const optionalVars = [
    'AZURE_FUNCTION_APP_NAME',
    'AZURE_RESOURCE_GROUP',
    'AZURE_SUBSCRIPTION_ID'
  ];

  let missingOptional = 0;
  for (const varName of optionalVars) {
    if (isEnvVarSet(varName)) {
      console.log(`${COLORS.green}✅ ${varName} is set${COLORS.reset}`);
    } else {
      console.log(`${COLORS.yellow}⚠️ Warning: ${varName} is not set${COLORS.reset}`);
      missingOptional++;
    }
  }

  if (missingOptional > 0) {
    console.log(`
${COLORS.yellow}Note:${COLORS.reset} Some optional Azure configuration variables are not set.
These are not required for basic deployment but may be needed for advanced features.
    `);
  }

  console.log(`${COLORS.green}✅ Azure credential verification completed${COLORS.reset}`);
}

// Execute the verification
verifyAzureCredentials(); 