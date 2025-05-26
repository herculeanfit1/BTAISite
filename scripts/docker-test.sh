#!/bin/bash

#######################################################################
# Docker Test Runner for Bridging Trust AI
# =======================================
#
# This script provides a standardized way to run tests in Docker containers,
# ensuring consistent test environments across all development machines
# and CI/CD pipelines regardless of the host operating system.
#
# Features:
# - Automatically builds/rebuilds Docker test image when needed
# - Supports multiple test types (unit, integration, quick, etc.)
# - Mounts volumes to preserve test results and coverage reports
# - Handles test output and reporting
#
# Usage: ./scripts/docker-test.sh [-t test_type] [-h]
#######################################################################

# Terminal output colors for better readability
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Default test type is 'quick' - runs unit and middleware tests
# which are the most crucial tests for fast feedback
TEST_TYPE="quick"

#######################################################################
# Command-line argument parsing
#######################################################################
while [[ $# -gt 0 ]]; do
  case "$1" in
    -t|--type)
      TEST_TYPE="$2"
      shift 2
      ;;
    -h|--help)
      echo -e "${GREEN}Docker Test Runner for Bridging Trust AI${NC}"
      echo "Usage: ./scripts/docker-test.sh [options]"
      echo ""
      echo "Options:"
      echo "  -t, --type TYPE    Specify test type: quick, unit, integration, all, middleware, config"
      echo "  -h, --help         Show this help message"
      echo ""
      echo "Examples:"
      echo "  ./scripts/docker-test.sh                    # Run quick tests (default)"
      echo "  ./scripts/docker-test.sh -t unit            # Run unit tests"
      echo "  ./scripts/docker-test.sh -t integration     # Run integration tests"
      echo "  ./scripts/docker-test.sh -t all             # Run all tests"
      echo "  ./scripts/docker-test.sh -t middleware      # Run middleware tests"
      exit 0
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      echo "Run ./scripts/docker-test.sh --help for usage information"
      exit 1
      ;;
  esac
done

#######################################################################
# Docker image management
# Handles building or rebuilding the Docker test image
#######################################################################
build_docker_image() {
  echo -e "${BLUE}Checking for Docker test image...${NC}"
  
  # Check if the test image already exists to avoid unnecessary rebuilds
  if docker image inspect bridging-trust-tests &>/dev/null; then
    echo -e "${GREEN}Docker test image already exists${NC}"
    
    # Ask user if they want to rebuild the image
    # This is useful when dependencies or test files have changed
    read -p "Do you want to rebuild the Docker test image? (y/N) " rebuild
    if [[ "$rebuild" =~ ^[Yy]$ ]]; then
      echo -e "${BLUE}Rebuilding Docker test image...${NC}"
      docker build -t bridging-trust-tests -f Dockerfile.test .
    fi
  else
    # First-time build if image doesn't exist
    echo -e "${BLUE}Building Docker test image...${NC}"
    docker build -t bridging-trust-tests -f Dockerfile.test .
  fi
}

# Build the Docker image
build_docker_image

#######################################################################
# Prepare local directories for test outputs
#######################################################################
# Create output directories if they don't exist
# These will be mounted as volumes in the Docker container
mkdir -p coverage test-results playwright-report

echo -e "${GREEN}Running $TEST_TYPE tests in Docker...${NC}"

#######################################################################
# Run tests based on the specified type
#######################################################################
case "$TEST_TYPE" in
  quick)
    # Quick mode runs unit tests + middleware tests
    # This is the fastest comprehensive test suite
    echo -e "${BLUE}Running quick tests (unit + middleware)...${NC}"
    # Run unit tests with coverage reporting
    docker run --rm -v "$(pwd)/coverage:/app/coverage" -v "$(pwd)/test-results:/app/test-results" bridging-trust-tests npm run test:unit
    # Run middleware tests to ensure core functionality works
    docker run --rm -v "$(pwd)/test-results:/app/test-results" bridging-trust-tests npm run test:middleware
    ;;
  unit)
    # Run only component/unit tests
    echo -e "${BLUE}Running unit tests...${NC}"
    docker run --rm -v "$(pwd)/coverage:/app/coverage" -v "$(pwd)/test-results:/app/test-results" bridging-trust-tests npm run test:unit
    ;;
  integration)
    # Run only integration tests
    echo -e "${BLUE}Running integration tests...${NC}"
    docker run --rm -v "$(pwd)/test-results:/app/test-results" bridging-trust-tests npm run test:integration
    ;;
  middleware)
    # Test only the middleware functionality
    echo -e "${BLUE}Running middleware tests...${NC}"
    docker run --rm -v "$(pwd)/test-results:/app/test-results" bridging-trust-tests npm run test:middleware
    ;;
  config)
    # Test the Next.js config setup
    echo -e "${BLUE}Running config tests...${NC}"
    docker run --rm -v "$(pwd)/test-results:/app/test-results" bridging-trust-tests npm run test:config
    ;;
  all)
    # Run the complete test suite
    echo -e "${BLUE}Running all tests...${NC}"
    docker run --rm -v "$(pwd)/coverage:/app/coverage" -v "$(pwd)/test-results:/app/test-results" bridging-trust-tests npm test
    ;;
  *)
    # Handle unknown test types
    echo -e "${RED}Unknown test type: $TEST_TYPE${NC}"
    exit 1
    ;;
esac

#######################################################################
# Report test completion and available results
#######################################################################
echo -e "${GREEN}Tests completed!${NC}"
echo -e "${YELLOW}Results and coverage are available in:${NC}"
echo -e "  - ./coverage"
echo -e "  - ./test-results"

# Exit with success
exit 0 