#!/bin/bash
# retrieve-github-logs.sh
# Securely retrieves and analyzes GitHub Actions workflow logs
# Following the GitHub Workflow Guidelines for secure log retrieval

set -e

# Color outputs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration - replace with your values or use environment variables
GITHUB_APP_ID=${GITHUB_APP_ID:-""}
GITHUB_APP_INSTALLATION_ID=${GITHUB_APP_INSTALLATION_ID:-""}
GITHUB_REPO_OWNER=${GITHUB_REPO_OWNER:-"herculeanfit1"}
GITHUB_REPO_NAME=${GITHUB_REPO_NAME:-"BridgingTrustAI"}
PRIVATE_KEY_PATH=${PRIVATE_KEY_PATH:-""}
OUTPUT_DIR=${OUTPUT_DIR:-"./github-logs"}
DEBUG=${DEBUG:-"false"}

# Check if required tools are installed
command -v curl >/dev/null 2>&1 || { echo -e "${RED}Error: curl is required but not installed.${NC}" >&2; exit 1; }
command -v jq >/dev/null 2>&1 || { echo -e "${RED}Error: jq is required but not installed.${NC}" >&2; exit 1; }
command -v openssl >/dev/null 2>&1 || { echo -e "${RED}Error: openssl is required but not installed.${NC}" >&2; exit 1; }

print_usage() {
  echo -e "${BLUE}GitHub Workflow Logs Retriever${NC}"
  echo "Usage: $0 [options]"
  echo ""
  echo "Options:"
  echo "  -a, --app-id ID             GitHub App ID"
  echo "  -i, --installation-id ID    GitHub App Installation ID"
  echo "  -o, --owner OWNER           GitHub repository owner"
  echo "  -r, --repo REPO             GitHub repository name"
  echo "  -k, --key-path PATH         Path to GitHub App private key file"
  echo "  -w, --workflow-id ID        Specific workflow ID to analyze (optional)"
  echo "  -d, --output-dir DIR        Directory to save logs (default: ./github-logs)"
  echo "  --debug                     Enable debug output"
  echo "  -h, --help                  Show this help message"
  echo ""
  echo "Example:"
  echo "  $0 -a 12345 -i 98765 -o username -r repo-name -k /path/to/private-key.pem"
  echo ""
  echo "You can also set environment variables instead of using command-line options:"
  echo "  GITHUB_APP_ID, GITHUB_APP_INSTALLATION_ID, GITHUB_REPO_OWNER,"
  echo "  GITHUB_REPO_NAME, PRIVATE_KEY_PATH, OUTPUT_DIR"
}

# Parse command-line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    -a|--app-id)
      GITHUB_APP_ID="$2"
      shift 2
      ;;
    -i|--installation-id)
      GITHUB_APP_INSTALLATION_ID="$2"
      shift 2
      ;;
    -o|--owner)
      GITHUB_REPO_OWNER="$2"
      shift 2
      ;;
    -r|--repo)
      GITHUB_REPO_NAME="$2"
      shift 2
      ;;
    -k|--key-path)
      PRIVATE_KEY_PATH="$2"
      shift 2
      ;;
    -w|--workflow-id)
      WORKFLOW_ID="$2"
      shift 2
      ;;
    -d|--output-dir)
      OUTPUT_DIR="$2"
      shift 2
      ;;
    --debug)
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

# Validate required parameters
validate_params() {
  local missing_params=()

  [[ -z "$GITHUB_APP_ID" ]] && missing_params+=("GitHub App ID")
  [[ -z "$GITHUB_APP_INSTALLATION_ID" ]] && missing_params+=("GitHub App Installation ID")
  [[ -z "$GITHUB_REPO_OWNER" ]] && missing_params+=("GitHub repository owner")
  [[ -z "$GITHUB_REPO_NAME" ]] && missing_params+=("GitHub repository name")
  [[ -z "$PRIVATE_KEY_PATH" ]] && missing_params+=("GitHub App private key path")

  if [[ ${#missing_params[@]} -gt 0 ]]; then
    echo -e "${RED}Error: Missing required parameters:${NC}" >&2
    for param in "${missing_params[@]}"; do
      echo "  - $param" >&2
    done
    print_usage
    exit 1
  fi

  # Check if private key file exists
  if [[ ! -f "$PRIVATE_KEY_PATH" ]]; then
    echo -e "${RED}Error: Private key file not found at: $PRIVATE_KEY_PATH${NC}" >&2
    exit 1
  fi
}

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

# Exchange JWT for an installation token
get_installation_token() {
  local jwt="$1"
  echo -e "${BLUE}Exchanging JWT for installation token...${NC}"
  
  local token_response=$(curl -s -X POST \
    -H "Authorization: Bearer $jwt" \
    -H "Accept: application/vnd.github+json" \
    -H "User-Agent: BTAI-GitHub-Workflow-Logger" \
    "https://api.github.com/app/installations/${GITHUB_APP_INSTALLATION_ID}/access_tokens" \
    -d '{"permissions":{"actions":"read","checks":"read"}}')
  
  # Save raw response for diagnosis
  if [[ "$DEBUG" == "true" ]]; then
    echo -e "${YELLOW}Debug: Installation token response:${NC}"
    echo "$token_response"
    echo ""
    
    # Save raw response to file for detailed inspection
    mkdir -p "$OUTPUT_DIR"
    echo "$token_response" > "$OUTPUT_DIR/token_response.txt"
    echo -e "${YELLOW}Debug: Token response saved to $OUTPUT_DIR/token_response.txt${NC}"
  fi
  
  # Check for empty response
  if [[ -z "$token_response" ]]; then
    echo -e "${RED}Error: Empty response from GitHub API when getting token${NC}" >&2
    exit 1
  fi
  
  # Check for errors (message field indicates error)
  if echo "$token_response" | grep -q "message"; then
    echo -e "${RED}Error obtaining installation token:${NC}" >&2
    echo "$token_response" | grep -A 3 "message" >&2
    
    # Extract the specific error message for more context
    local error_msg=$(echo "$token_response" | grep -o '"message":"[^"]*"' | cut -d'"' -f4)
    if [[ -n "$error_msg" ]]; then
      echo -e "${RED}Specific error message: $error_msg${NC}" >&2
      
      # Provide helpful hints based on common errors
      case "$error_msg" in
        *"invalid"*"JWT"*)
          echo -e "${YELLOW}This may indicate an issue with your GitHub App private key or APP_ID.${NC}" >&2
          echo -e "${YELLOW}Recommendations:${NC}" >&2
          echo -e "  - Verify your GitHub App ID is correct: $GITHUB_APP_ID" >&2
          echo -e "  - Check that your private key is valid and corresponds to this App" >&2
          echo -e "  - Make sure the private key format is correct (PEM format)" >&2
          ;;
        *"not found"*|*"404"*)
          echo -e "${YELLOW}This may indicate an issue with your Installation ID.${NC}" >&2
          echo -e "${YELLOW}Recommendations:${NC}" >&2
          echo -e "  - Verify your Installation ID is correct: $GITHUB_APP_INSTALLATION_ID" >&2
          echo -e "  - Make sure your GitHub App is installed on the repository" >&2
          echo -e "  - Run the find-github-app-installation.sh script to get the correct ID" >&2
          ;;
        *"permission"*|*"scope"*)
          echo -e "${YELLOW}This may indicate a permissions issue with your GitHub App.${NC}" >&2
          echo -e "${YELLOW}Recommendations:${NC}" >&2
          echo -e "  - Ensure your GitHub App has 'Actions: Read' and 'Metadata: Read' permissions" >&2
          echo -e "  - Re-install the GitHub App if necessary to update permissions" >&2
          ;;
      esac
    fi
    
    exit 1
  fi
  
  # Check if the response is valid JSON
  if ! echo "$token_response" | jq -e . >/dev/null 2>&1; then
    echo -e "${RED}Error: Invalid JSON response from GitHub API when getting token${NC}" >&2
    
    # Print part of the response for diagnosis
    echo -e "${YELLOW}First 100 characters of response:${NC}" >&2
    echo "$token_response" | head -c 100 >&2
    echo -e "\n${YELLOW}Last 100 characters of response:${NC}" >&2
    echo "$token_response" | tail -c 100 >&2
    
    # Try parsing with Python as an alternative
    if command -v python3 >/dev/null 2>&1; then
      echo -e "${YELLOW}Attempting to parse token response with Python...${NC}"
      if python3 -c "import json, sys; json.loads(sys.stdin.read())" <<< "$token_response" >/dev/null 2>&1; then
        echo -e "${GREEN}Python successfully parsed the JSON. jq might have issues.${NC}"
        # Extract token with Python
        local py_token=$(python3 -c "import json, sys; print(json.loads(sys.stdin.read()).get('token', ''))" <<< "$token_response")
        if [[ -n "$py_token" ]]; then
          echo -e "${GREEN}Successfully extracted token using Python.${NC}"
          echo "$py_token"
          return 0
        fi
      else
        echo -e "${RED}Python also failed to parse the JSON. The response is not valid JSON.${NC}"
      fi
    fi
    
    exit 1
  fi
  
  # Extract token
  local token=$(echo "$token_response" | jq -r '.token' 2>/dev/null)
  
  if [[ -z "$token" || "$token" == "null" ]]; then
    echo -e "${RED}Error: Failed to extract token from response${NC}" >&2
    echo -e "${YELLOW}JSON structure received:${NC}" >&2
    echo "$token_response" | jq 'keys' 2>/dev/null || echo "Could not parse JSON structure"
    exit 1
  fi
  
  echo "$token"
}

# Get the latest workflow runs
get_latest_workflow_runs() {
  local token="$1"
  local max_runs="${2:-5}" # Default to 5 runs
  
  echo -e "${BLUE}Fetching latest workflow runs...${NC}"
  
  local workflow_param=""
  if [[ -n "$WORKFLOW_ID" ]]; then
    workflow_param="/workflows/$WORKFLOW_ID"
  fi
  
  local url="https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/actions${workflow_param}/runs?per_page=${max_runs}"
  
  if [[ "$DEBUG" == "true" ]]; then
    echo -e "${YELLOW}Debug: Workflow URL: $url${NC}"
  fi
  
  local runs_response=$(curl -s -H "Authorization: token $token" \
    -H "Accept: application/vnd.github+json" \
    -H "User-Agent: BTAI-GitHub-Workflow-Logger" \
    "$url")
  
  # Save raw response for diagnosis
  if [[ "$DEBUG" == "true" ]]; then
    echo -e "${YELLOW}Debug: Workflow runs response raw:${NC}"
    echo "$runs_response"
    echo ""
    
    # Write raw response to a file for detailed inspection
    mkdir -p "$OUTPUT_DIR"
    echo "$runs_response" > "$OUTPUT_DIR/raw_response.txt"
    echo -e "${YELLOW}Debug: Raw response saved to $OUTPUT_DIR/raw_response.txt${NC}"
  fi
  
  # Check for errors or empty response
  if [[ -z "$runs_response" ]]; then
    echo -e "${RED}Error: Empty response from GitHub API${NC}" >&2
    return 1
  fi
  
  # Check for error messages in the response
  if echo "$runs_response" | grep -q "message"; then
    echo -e "${RED}Error fetching workflow runs:${NC}" >&2
    echo "$runs_response" | grep -A 3 "message" >&2
    return 1
  fi
  
  # Check if the response is valid JSON
  if ! echo "$runs_response" | jq -e . >/dev/null 2>&1; then
    echo -e "${RED}Error: Invalid JSON response from GitHub API when getting runs${NC}" >&2
    echo -e "${YELLOW}First 100 characters of response:${NC}" >&2
    echo "$runs_response" | head -c 100 >&2
    echo -e "\n${YELLOW}Last 100 characters of response:${NC}" >&2
    echo "$runs_response" | tail -c 100 >&2
    
    # Try parsing with Python as an alternative (if available)
    if command -v python3 >/dev/null 2>&1; then
      echo -e "${YELLOW}Attempting to parse response with Python...${NC}"
      if python3 -c "import json, sys; json.loads(sys.stdin.read())" <<< "$runs_response" >/dev/null 2>&1; then
        echo -e "${GREEN}Python successfully parsed the JSON. jq might have issues.${NC}"
        # Save valid JSON for debugging
        python3 -c "import json, sys; print(json.dumps(json.loads(sys.stdin.read()), indent=2))" <<< "$runs_response" > "$OUTPUT_DIR/valid_json.json"
        echo -e "${YELLOW}Valid JSON saved to $OUTPUT_DIR/valid_json.json${NC}"
      else
        echo -e "${RED}Python also failed to parse the JSON. The response is not valid JSON.${NC}"
      fi
    fi
    
    return 1
  fi
  
  # Check if workflow_runs exists and has items
  if ! echo "$runs_response" | jq -e '.workflow_runs | length' >/dev/null 2>&1; then
    echo -e "${YELLOW}No workflow runs found for this repository.${NC}"
    return 1
  fi
  
  # Save parsed JSON for reference
  echo "$runs_response" | jq . > "$OUTPUT_DIR/parsed_workflow_runs.json"
  
  # Filter to only failed/cancelled runs
  local filtered_runs=$(echo "$runs_response" | jq '.workflow_runs[] | select(.conclusion != "success") | {id, name, conclusion, html_url, created_at}')
  
  if [[ -z "$filtered_runs" ]]; then
    echo -e "${YELLOW}No failed or cancelled workflow runs found.${NC}"
    return 1
  fi
  
  echo "$filtered_runs"
}

# Download workflow run logs
download_workflow_logs() {
  local token="$1"
  local run_id="$2"
  local output_dir="$3"
  
  echo -e "${BLUE}Downloading logs for workflow run ${run_id}...${NC}"
  
  mkdir -p "$output_dir"
  local log_file="${output_dir}/workflow_${run_id}.zip"
  
  # Download logs with exponential backoff for rate limits
  local max_attempts=5
  local attempt=1
  local wait_time=2
  
  while [ $attempt -le $max_attempts ]; do
    local http_code=$(curl -s -w "%{http_code}" -o "$log_file" \
      -H "Authorization: token $token" \
      -H "Accept: application/vnd.github+json" \
      "https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/actions/runs/${run_id}/logs")
    
    if [ "$http_code" -eq 200 ]; then
      echo -e "${GREEN}✓ Successfully downloaded logs for run ${run_id}${NC}"
      return 0
    elif [ "$http_code" -eq 429 ]; then
      echo -e "${YELLOW}Rate limited. Retrying in ${wait_time}s (Attempt ${attempt}/${max_attempts})${NC}" >&2
      sleep $wait_time
      wait_time=$((wait_time * 2))
      attempt=$((attempt + 1))
    elif [ "$http_code" -ge 500 ]; then
      echo -e "${YELLOW}Server error (${http_code}). Retrying in ${wait_time}s (Attempt ${attempt}/${max_attempts})${NC}" >&2
      sleep $wait_time
      wait_time=$((wait_time * 2))
      attempt=$((attempt + 1))
    else
      echo -e "${RED}Failed to download logs for run ${run_id}: HTTP ${http_code}${NC}" >&2
      return 1
    fi
  done
  
  echo -e "${RED}Failed to download logs after ${max_attempts} attempts.${NC}" >&2
  return 1
}

# Extract and analyze logs
analyze_logs() {
  local log_file="$1"
  local output_dir="$2"
  local run_id="$3"
  
  local extract_dir="${output_dir}/run_${run_id}"
  
  echo -e "${BLUE}Analyzing logs for workflow run ${run_id}...${NC}"
  
  # Create directory for extracted logs
  mkdir -p "$extract_dir"
  
  # Extract logs
  if ! unzip -q "$log_file" -d "$extract_dir"; then
    echo -e "${RED}Failed to extract logs for run ${run_id}${NC}" >&2
    return 1
  fi
  
  # Create analysis summary file
  local summary_file="${extract_dir}/analysis_summary.txt"
  {
    echo "==== Workflow Run ${run_id} Analysis Summary ===="
    echo "Generated on: $(date)"
    echo ""
    echo "=== Error Analysis ==="
  } > "$summary_file"
  
  # Find and analyze errors
  local error_count=0
  
  # Look for explicit error messages
  echo -e "${BLUE}Looking for error messages...${NC}"
  {
    echo "== Error Messages =="
    grep -r -i "error:" "$extract_dir" --include="*.txt" || echo "No explicit error messages found."
    echo ""
  } >> "$summary_file"
  
  # Look for failed steps
  echo -e "${BLUE}Looking for failed steps...${NC}"
  {
    echo "== Failed Steps =="
    grep -r -i "##\[error\]" "$extract_dir" --include="*.txt" || echo "No failed steps found."
    echo ""
  } >> "$summary_file"
  
  # Look for test failures
  echo -e "${BLUE}Looking for test failures...${NC}"
  {
    echo "== Test Failures =="
    grep -r -i "test.*failed" "$extract_dir" --include="*.txt" || echo "No test failures found."
    echo ""
  } >> "$summary_file"
  
  # Check for common CI issues
  echo -e "${BLUE}Checking for common CI issues...${NC}"
  {
    echo "== Common CI Issues =="
    
    # Check for npm errors
    grep -r -i "npm ERR!" "$extract_dir" --include="*.txt" && error_count=$((error_count + 1)) || echo "No npm errors found."
    
    # Check for linting errors
    grep -r -i "eslint" "$extract_dir" --include="*.txt" | grep -i "error" && error_count=$((error_count + 1)) || echo "No ESLint errors found."
    
    # Check for TypeScript errors
    grep -r -i "typescript" "$extract_dir" --include="*.txt" | grep -i "error" && error_count=$((error_count + 1)) || echo "No TypeScript errors found."
    
    # Check for test coverage issues
    grep -r -i "coverage threshold" "$extract_dir" --include="*.txt" && error_count=$((error_count + 1)) || echo "No coverage threshold issues found."
    
    echo ""
  } >> "$summary_file"
  
  # Add recommendations based on findings
  {
    echo "=== Recommendations ==="
    if grep -q -i "coverage threshold" "$extract_dir" --include="*.txt"; then
      echo "- Coverage threshold issues detected. Consider:"
      echo "  * Adding more tests to increase coverage"
      echo "  * Temporarily lowering coverage thresholds in jest.config.js"
      echo "  * Using placeholder tests as documented in github-guidelines.md"
    fi
    
    if grep -q -i "eslint" "$extract_dir" --include="*.txt" | grep -q -i "error"; then
      echo "- ESLint errors detected. Consider:"
      echo "  * Running 'npm run lint' locally to identify and fix issues"
      echo "  * Adding appropriate ESLint disable comments for special cases"
    fi
    
    if grep -q -i "typescript" "$extract_dir" --include="*.txt" | grep -q -i "error"; then
      echo "- TypeScript errors detected. Consider:"
      echo "  * Running 'npm run type-check' locally to identify and fix type issues"
      echo "  * Fixing type definitions or adding proper interfaces"
    fi
    
    if grep -q -i "npm ERR!" "$extract_dir" --include="*.txt"; then
      echo "- npm errors detected. Consider:"
      echo "  * Checking package.json for mismatched dependencies"
      echo "  * Verifying Node.js version compatibility"
      echo "  * Running 'npm ci' locally to validate dependency installation"
    fi
  } >> "$summary_file"
  
  echo -e "${GREEN}Analysis complete. Summary saved to: ${summary_file}${NC}"
  
  # Output short summary to console
  if [ $error_count -gt 0 ]; then
    echo -e "${YELLOW}Found ${error_count} types of issues in the workflow run.${NC}"
    echo -e "${YELLOW}See ${summary_file} for detailed analysis and recommendations.${NC}"
  else
    echo -e "${GREEN}No common issues found in the workflow run.${NC}"
  fi
  
  return 0
}

# Main execution
main() {
  # Validate parameters
  validate_params
  
  # Create output directory
  mkdir -p "$OUTPUT_DIR"
  
  # Generate JWT
  local jwt=$(create_jwt)
  if [ -z "$jwt" ]; then
    echo -e "${RED}Failed to generate JWT${NC}" >&2
    exit 1
  fi
  
  # Get installation token
  local token=$(get_installation_token "$jwt")
  if [ -z "$token" ]; then
    echo -e "${RED}Failed to get installation token${NC}" >&2
    exit 1
  fi
  
  # Get failed workflow runs
  local workflow_runs=$(get_latest_workflow_runs "$token")
  local get_runs_exit_code=$?
  
  if [ $get_runs_exit_code -ne 0 ] || [ -z "$workflow_runs" ]; then
    echo -e "${YELLOW}No failed workflow runs found or error occurred fetching runs.${NC}"
    # Check if we have raw response for further analysis
    if [[ -f "$OUTPUT_DIR/raw_response.txt" ]]; then
      echo -e "${YELLOW}Examining raw API response for further diagnosis...${NC}"
      # Try to extract run IDs directly from the raw response using grep
      local raw_ids=$(grep -o '"id":[0-9]*' "$OUTPUT_DIR/raw_response.txt" | grep -o '[0-9]*')
      if [[ -n "$raw_ids" ]]; then
        echo -e "${BLUE}Extracted workflow run IDs directly from raw response: ${NC}$raw_ids"
        process_run_ids "$token" "$raw_ids"
        exit 0
      else
        echo -e "${RED}Could not extract any run IDs from the raw response.${NC}"
        if [[ "$DEBUG" == "true" ]]; then
          echo -e "${YELLOW}Raw response content:${NC}"
          cat "$OUTPUT_DIR/raw_response.txt"
        fi
        exit 1
      fi
    else
      exit 1
    fi
  fi
  
  echo -e "${BLUE}Found failed workflow runs:${NC}"
  # Use a safer approach to display the workflow data
  echo "$workflow_runs" | while read -r line; do
    if [[ -n "$line" && "$line" != "null" ]]; then
      if echo "$line" | jq -e . >/dev/null 2>&1; then
        echo "$line" | jq -r '"ID: \(.id // "unknown") | Name: \(.name // "unnamed") | Conclusion: \(.conclusion // "unknown") | Created: \(.created_at // "unknown")"'
      else
        echo "Could not parse line: $line"
      fi
    fi
  done || echo -e "${RED}Error parsing workflow runs JSON${NC}"
  
  # Create temp file with workflow runs for processing
  echo "$workflow_runs" > "$OUTPUT_DIR/workflow_runs.json"
  
  if [[ "$DEBUG" == "true" ]]; then
    echo -e "${YELLOW}Debug: Saved workflow runs to $OUTPUT_DIR/workflow_runs.json${NC}"
  fi
  
  # First try to parse IDs as proper JSON
  local run_ids=$(echo "$workflow_runs" | jq -r '.id // empty' 2>/dev/null)
  
  if [[ -n "$run_ids" ]]; then
    process_run_ids "$token" "$run_ids"
  else
    # Fallback to regex extraction if jq parsing fails
    echo -e "${YELLOW}Attempting alternative parsing method...${NC}"
    
    # Use grep to extract IDs
    local raw_ids=$(echo "$workflow_runs" | grep -o '"id":[0-9]*' | grep -o '[0-9]*')
    
    if [[ -n "$raw_ids" ]]; then
      echo -e "${BLUE}Found workflow run IDs using alternative method:${NC} $raw_ids"
      process_run_ids "$token" "$raw_ids"
    else
      echo -e "${RED}Could not extract any run IDs using either method.${NC}"
      exit 1
    fi
  fi
  
  echo -e "${GREEN}Log retrieval and analysis complete.${NC}"
  echo -e "${GREEN}Results saved in: ${OUTPUT_DIR}${NC}"
}

# Process a list of run IDs
process_run_ids() {
  local token="$1"
  local ids="$2"
  
  for run_id in $ids; do
    if [[ -n "$run_id" && "$run_id" != "null" ]]; then
      # Download logs
      if download_workflow_logs "$token" "$run_id" "$OUTPUT_DIR"; then
        # Analyze logs
        analyze_logs "${OUTPUT_DIR}/workflow_${run_id}.zip" "$OUTPUT_DIR" "$run_id"
      fi
    fi
  done
}

# Run the script
main 