#!/bin/bash
# find-github-app-installation.sh
# Helper script to find GitHub App installation IDs

set -e

# Color outputs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# GitHub App ID
GITHUB_APP_ID=${GITHUB_APP_ID:-"1243050"}  # Default to your App ID
PRIVATE_KEY_PATH=${PRIVATE_KEY_PATH:-""}
DEBUG=${DEBUG:-"false"}

print_usage() {
  echo -e "${BLUE}GitHub App Installation Finder${NC}"
  echo "This script helps find the installation ID for your GitHub App"
  echo ""
  echo "Usage: $0 [options]"
  echo ""
  echo "Options:"
  echo "  -a, --app-id ID       GitHub App ID (default: 1243050)"
  echo "  -k, --key-path PATH   Path to GitHub App private key file"
  echo "  -d, --debug           Enable debug output"
  echo "  -h, --help            Show this help message"
  echo ""
  echo "Example:"
  echo "  $0 -k /path/to/private-key.pem"
}

# Parse command-line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    -a|--app-id)
      GITHUB_APP_ID="$2"
      shift 2
      ;;
    -k|--key-path)
      PRIVATE_KEY_PATH="$2"
      shift 2
      ;;
    -d|--debug)
      DEBUG="true"
      shift
      ;;
    -h|--help)
      print_usage
      exit 0
      ;;
    *)
      echo -e "${RED}Error: Unknown option $1${NC}" >&2
      print_usage
      exit 1
      ;;
  esac
done

# Check if required tools are installed
command -v curl >/dev/null 2>&1 || { echo -e "${RED}Error: curl is required but not installed.${NC}" >&2; exit 1; }
command -v jq >/dev/null 2>&1 || { echo -e "${RED}Error: jq is required but not installed.${NC}" >&2; exit 1; }
command -v openssl >/dev/null 2>&1 || { echo -e "${RED}Error: openssl is required but not installed.${NC}" >&2; exit 1; }

# Validate required parameters
if [[ -z "$PRIVATE_KEY_PATH" ]]; then
  echo -e "${RED}Error: Missing required parameter: GitHub App private key path${NC}" >&2
  print_usage
  exit 1
fi

# Check if private key file exists
if [[ ! -f "$PRIVATE_KEY_PATH" ]]; then
  echo -e "${RED}Error: Private key file not found at: $PRIVATE_KEY_PATH${NC}" >&2
  exit 1
fi

# Create a JWT for GitHub App authentication
create_jwt() {
  echo -e "${BLUE}Generating JWT for GitHub App authentication...${NC}"
  
  # Current time and expiration (10 minutes from now)
  local now=$(date +%s)
  local exp=$((now + 600))
  
  # Create JWT header and payload
  local header='{"alg":"RS256","typ":"JWT"}'
  local payload="{\"iat\":${now},\"exp\":${exp},\"iss\":${GITHUB_APP_ID}}"
  
  # Base64 encode header and payload
  local b64_header=$(echo -n "$header" | openssl base64 -e -A | tr '+/' '-_' | tr -d '=')
  local b64_payload=$(echo -n "$payload" | openssl base64 -e -A | tr '+/' '-_' | tr -d '=')
  
  # Create signature
  local signature_input="${b64_header}.${b64_payload}"
  local signature=$(echo -n "$signature_input" | openssl dgst -sha256 -sign "$PRIVATE_KEY_PATH" | openssl base64 -e -A | tr '+/' '-_' | tr -d '=')
  
  # Combine to create JWT
  echo "${b64_header}.${b64_payload}.${signature}"
}

# Get installations for the GitHub App
get_installations() {
  local jwt="$1"
  echo -e "${BLUE}Fetching installations for GitHub App ${GITHUB_APP_ID}...${NC}"
  
  local installations_response=$(curl -s -H "Authorization: Bearer $jwt" \
    -H "Accept: application/vnd.github+json" \
    -H "User-Agent: BTAI-GitHub-App-Finder" \
    "https://api.github.com/app/installations")
  
  # Debug output
  if [[ "$DEBUG" == "true" ]]; then
    echo -e "${YELLOW}Debug: Raw API response${NC}"
    echo "$installations_response"
    echo ""
  fi
  
  # Check for empty response
  if [[ -z "$installations_response" ]]; then
    echo -e "${RED}Error: Empty response from GitHub API${NC}" >&2
    exit 1
  fi
  
  # Check for message (error)
  if echo "$installations_response" | grep -q "message"; then
    echo -e "${RED}Error fetching installations:${NC}" >&2
    echo "$installations_response" | grep -A 5 "message" >&2
    
    # Extract specific error message
    local error_msg=$(echo "$installations_response" | grep -o '"message":"[^"]*"' | cut -d'"' -f4)
    if [[ -n "$error_msg" ]]; then
      echo -e "${RED}Specific error message: $error_msg${NC}" >&2
      
      # Provide helpful hints based on common errors
      case "$error_msg" in
        *"invalid"*"JWT"*)
          echo -e "${YELLOW}This may indicate an issue with your GitHub App private key or APP_ID.${NC}" >&2
          echo -e "${YELLOW}Recommendations:${NC}" >&2
          echo -e "  - Verify your GitHub App ID is correct: $GITHUB_APP_ID" >&2
          echo -e "  - Check that your private key is valid and in the correct format" >&2
          ;;
        *"not found"*)
          echo -e "${YELLOW}This may indicate the GitHub App ID is incorrect or the App doesn't exist.${NC}" >&2
          echo -e "${YELLOW}Recommendations:${NC}" >&2
          echo -e "  - Verify your GitHub App ID is correct" >&2
          echo -e "  - Check that the App exists and is properly set up" >&2
          ;;
      esac
    fi
    
    exit 1
  fi
  
  # Check if the response is valid JSON
  if ! echo "$installations_response" | jq -e . >/dev/null 2>&1; then
    echo -e "${RED}Error: Invalid JSON response from GitHub API${NC}" >&2
    echo -e "${YELLOW}First 100 characters:${NC}" >&2
    echo "$installations_response" | head -c 100 >&2
    echo -e "\n${YELLOW}Last 100 characters:${NC}" >&2
    echo "$installations_response" | tail -c 100 >&2
    exit 1
  fi
  
  echo "$installations_response"
}

# Test if private key is valid
test_private_key() {
  local key_path="$1"
  echo -e "${BLUE}Testing if the private key is valid...${NC}"
  
  # Try to extract public key from private key
  if ! openssl rsa -in "$key_path" -pubout >/dev/null 2>&1; then
    echo -e "${RED}Error: Private key in $key_path appears to be invalid.${NC}" >&2
    echo -e "${YELLOW}Recommendations:${NC}" >&2
    echo -e "  - Make sure the file contains a valid RSA private key in PEM format" >&2
    echo -e "  - Verify the key permissions (should be readable only by you)" >&2
    echo -e "  - Check that the key is not corrupted or incomplete" >&2
    return 1
  fi
  
  echo -e "${GREEN}Private key appears to be valid.${NC}"
  return 0
}

# Verify GitHub App exists
verify_github_app() {
  local app_id="$1"
  echo -e "${BLUE}Verifying GitHub App ${app_id} exists...${NC}"
  
  # Public GitHub App API doesn't need authentication
  local app_response=$(curl -s -H "Accept: application/vnd.github+json" \
    -H "User-Agent: BTAI-GitHub-App-Finder" \
    "https://api.github.com/app")
  
  # Debug output
  if [[ "$DEBUG" == "true" ]]; then
    echo -e "${YELLOW}Debug: GitHub App API response${NC}"
    echo "$app_response"
    echo ""
  fi
  
  # Check if response indicates app exists (may be limited information)
  if echo "$app_response" | grep -q '"id"' && ! echo "$app_response" | grep -q '"message".*"Not Found"'; then
    local app_name=$(echo "$app_response" | jq -r '.name // "Unknown"')
    local response_id=$(echo "$app_response" | jq -r '.id // "Unknown"')
    
    echo -e "${GREEN}Successfully verified GitHub App: ${app_name} (ID: ${response_id})${NC}"
    return 0
  else
    echo -e "${YELLOW}Warning: Could not verify GitHub App with ID ${app_id}${NC}" >&2
    echo -e "${YELLOW}This doesn't necessarily mean the App doesn't exist, but we couldn't verify it via public API.${NC}" >&2
    echo -e "${YELLOW}You may need to check your GitHub App settings in your GitHub account.${NC}" >&2
    return 1
  fi
}

# Main execution
main() {
  echo -e "${BLUE}Finding installation IDs for GitHub App ${GITHUB_APP_ID}...${NC}"
  
  # Test if private key is valid
  if ! test_private_key "$PRIVATE_KEY_PATH"; then
    exit 1
  fi
  
  # Verify GitHub App exists
  verify_github_app "$GITHUB_APP_ID"
  
  # Generate JWT
  local jwt=$(create_jwt)
  if [ -z "$jwt" ]; then
    echo -e "${RED}Failed to generate JWT${NC}" >&2
    exit 1
  fi
  
  echo -e "${GREEN}Successfully generated JWT${NC}"
  if [[ "$DEBUG" == "true" ]]; then
    echo -e "${YELLOW}Debug: JWT token${NC}"
    echo "$jwt"
    echo ""
  fi
  
  # Get installations
  local installations=$(get_installations "$jwt")
  
  # Check if installations array exists and is not empty
  if ! echo "$installations" | jq -e '.installations | length > 0' >/dev/null 2>&1; then
    echo -e "${YELLOW}No installations found for this GitHub App.${NC}"
    if [[ "$DEBUG" == "true" ]]; then
      echo -e "${YELLOW}Debug: Full API response${NC}"
      echo "$installations" | jq .
    fi
    exit 0
  fi
  
  echo -e "\n${GREEN}=== GitHub App Installations ===${NC}"
  echo "$installations" | jq '.installations[] | {id: .id, account_name: .account.login, target_type: .target_type, repository_selection: .repository_selection}'
  
  # Also write the full installation details to a file for reference
  echo "$installations" > github-app-installations.json
  echo -e "\n${GREEN}Full installation details saved to github-app-installations.json${NC}"
  
  # Extract useful information
  local install_id=$(echo "$installations" | jq -r '.installations[0].id')
  local account_name=$(echo "$installations" | jq -r '.installations[0].account.login')
  
  # Print how to use the information with the logs retrieval script
  echo -e "\n${BLUE}=== How to use this information ===${NC}"
  echo "To retrieve GitHub Actions logs, use the installation ID with the retrieve-github-logs.sh script:"
  echo "  ./scripts/retrieve-github-logs.sh \\"
  echo "    --app-id ${GITHUB_APP_ID} \\"
  echo "    --installation-id ${install_id} \\"
  echo "    --owner ${account_name} \\"
  echo "    --repo BridgingTrustAI \\"
  echo "    --key-path ${PRIVATE_KEY_PATH}"
}

# Run the script
main 