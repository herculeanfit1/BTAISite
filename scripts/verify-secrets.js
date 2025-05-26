/**
 * This script verifies that required secrets are available.
 * It's used by the CI pipeline to ensure all necessary configuration is in place.
 */

console.log('Verifying required secrets are available...');

// Check if Azure Static Web Apps API token is available
if (process.env.AZURE_STATIC_WEB_APPS_API_TOKEN) {
  console.log('✅ AZURE_STATIC_WEB_APPS_API_TOKEN is available');
} else {
  console.error('❌ AZURE_STATIC_WEB_APPS_API_TOKEN is missing');
  process.exit(1);
}

console.log('All required secrets are available!'); 