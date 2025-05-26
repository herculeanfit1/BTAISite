#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Default values
TEST_ENV="local"
TEST_TYPE="all"

# Parse arguments
while getopts "e:t:" opt; do
  case $opt in
    e) TEST_ENV="$OPTARG" ;;
    t) TEST_TYPE="$OPTARG" ;;
    *) echo "Usage: $0 [-e docker|local] [-t unit|integration|e2e|all]" >&2
       exit 1 ;;
  esac
done

echo -e "${BLUE}Running tests in ${TEST_ENV} environment, type: ${TEST_TYPE}${NC}"

# Function to run local tests
run_local_tests() {
  local test_type=$1
  
  case $test_type in
    unit)
      echo -e "${GREEN}Running unit tests locally${NC}"
      npm run test:unit
      ;;
    integration)
      echo -e "${GREEN}Running integration tests locally${NC}"
      npm run test:integration
      ;;
    e2e)
      echo -e "${GREEN}Running E2E tests locally${NC}"
      npm run test:e2e
      ;;
    all)
      echo -e "${GREEN}Running all tests locally${NC}"
      npm run test
      ;;
    *)
      echo -e "${RED}Unknown test type: $test_type${NC}"
      exit 1
      ;;
  esac
}

# Function to run Docker tests
run_docker_tests() {
  local test_type=$1
  
  echo -e "${GREEN}Building Docker test image${NC}"
  docker build -t bridging-trust-tests -f Dockerfile.test .
  
  case $test_type in
    unit)
      echo -e "${GREEN}Running unit tests in Docker${NC}"
      docker run --rm bridging-trust-tests npm run test:unit
      ;;
    integration)
      echo -e "${GREEN}Running integration tests in Docker${NC}"
      docker run --rm bridging-trust-tests npm run test:integration
      ;;
    e2e)
      echo -e "${GREEN}Running E2E tests in Docker${NC}"
      docker run --rm -v $(pwd)/playwright-report:/app/playwright-report bridging-trust-tests npm run test:e2e
      ;;
    all)
      echo -e "${GREEN}Running all tests in Docker${NC}"
      docker run --rm -v $(pwd)/playwright-report:/app/playwright-report bridging-trust-tests npm run test
      ;;
    *)
      echo -e "${RED}Unknown test type: $test_type${NC}"
      exit 1
      ;;
  esac
}

# Run tests based on environment
if [ "$TEST_ENV" = "docker" ]; then
  run_docker_tests $TEST_TYPE
else
  run_local_tests $TEST_TYPE
fi 