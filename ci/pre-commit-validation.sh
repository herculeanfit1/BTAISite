#!/bin/bash

# =============================================================================
# Pre-Commit Validation Script - Bridging Trust AI
# =============================================================================
# This script runs comprehensive testing locally to minimize GitHub Actions costs
# ALL tests must pass before code can be committed/pushed
# =============================================================================

set -Eeuo pipefail  # Enhanced error handling
IFS=$'\n\t'         # Secure IFS
trap 'echo "❌ Pre-commit validation failed at line $LINENO"' ERR

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_header() {
    echo -e "\n${BLUE}================================================${NC}"
    echo -e "${BLUE} $1${NC}"
    echo -e "${BLUE}================================================${NC}\n"
}

# Track test results
TESTS_PASSED=0
TESTS_FAILED=0
START_TIME=$(date +%s)

# Function to run a test step
run_test_step() {
    local step_name="$1"
    local command="$2"
    local required="${3:-true}"
    
    log_info "Running: $step_name"
    
    if eval "$command"; then
        log_success "$step_name passed"
        ((TESTS_PASSED++))
        return 0
    else
        if [ "$required" = "true" ]; then
            log_error "$step_name FAILED (REQUIRED)"
            ((TESTS_FAILED++))
            return 1
        else
            log_warning "$step_name failed (optional)"
            return 0
        fi
    fi
}

# Function to check if we're in a git repository
check_git_repo() {
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        log_error "Not in a git repository"
        exit 1
    fi
}

# Function to check for staged changes
check_staged_changes() {
    if ! git diff --cached --quiet; then
        log_info "Found staged changes, proceeding with validation"
        return 0
    else
        log_warning "No staged changes found"
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_info "Validation cancelled"
            exit 0
        fi
    fi
}

# Main validation function
main() {
    log_header "PRE-COMMIT VALIDATION - BRIDGING TRUST AI"
    
    # Initial checks
    check_git_repo
    check_staged_changes
    
    log_info "Starting comprehensive local testing to minimize GitHub Actions costs..."
    
    # 1. DEPENDENCY CHECK
    log_header "1. DEPENDENCY VALIDATION"
    run_test_step "Node.js version check" "node --version | grep -E 'v20\.[0-9]+\.[0-9]+'"
    run_test_step "NPM dependency check" "npm ci --silent"
    run_test_step "Dependency lock validation" "npm run lock:validate" true
    
    # 2. CODE QUALITY
    log_header "2. CODE QUALITY CHECKS"
    run_test_step "TypeScript type checking" "npm run type-check"
    run_test_step "ESLint validation" "npm run lint:check"
    run_test_step "Import fixes" "npm run fix:imports"
    
    # 3. CORE FUNCTIONALITY TESTS (MANDATORY)
    log_header "3. CORE FUNCTIONALITY TESTS (MANDATORY)"
    run_test_step "Component & API tests" "npm run test:ci-basic" true
    run_test_step "Middleware security tests" "npm run test:middleware" true
    run_test_step "Configuration tests" "npm run test:config" true
    
    # 4. BUILD VALIDATION (MANDATORY)
    log_header "4. BUILD VALIDATION (MANDATORY)"
    run_test_step "Production build" "npm run build" true
    run_test_step "Static export build" "npm run build:static" true
    
    # 5. DOCKER TESTS (if Docker is available)
    log_header "5. DOCKER TESTS (OPTIONAL)"
    if command -v docker &> /dev/null; then
        run_test_step "Docker unit tests" "npm run test:docker:unit" false
        run_test_step "Docker integration tests" "npm run test:docker:integration" false
    else
        log_warning "Docker not available, skipping Docker tests"
    fi
    
    # 6. SECURITY CHECKS
    log_header "6. SECURITY VALIDATION"
    run_test_step "Security audit" "npm run security:audit" false
    run_test_step "SBOM generation" "npm run generate-sbom" false
    
    # 7. PERFORMANCE CHECKS (if time allows)
    log_header "7. PERFORMANCE CHECKS (OPTIONAL)"
    if [ "${SKIP_PERFORMANCE:-false}" != "true" ]; then
        run_test_step "Performance tests" "npm run test:performance:all" false
    else
        log_info "Skipping performance tests (SKIP_PERFORMANCE=true)"
    fi
    
    # FINAL RESULTS
    log_header "VALIDATION RESULTS"
    
    END_TIME=$(date +%s)
    DURATION=$((END_TIME - START_TIME))
    
    log_info "Tests completed in ${DURATION} seconds"
    log_info "Passed: $TESTS_PASSED"
    
    if [ $TESTS_FAILED -gt 0 ]; then
        log_error "Failed: $TESTS_FAILED"
        log_error "VALIDATION FAILED - Cannot commit/push"
        log_error "Please fix the failing tests and try again"
        exit 1
    else
        log_success "ALL REQUIRED TESTS PASSED!"
        log_success "Code is ready for commit/push"
        log_info "GitHub Actions will only run minimal deployment validation"
        
        # Optional: Auto-stage any fixes that were applied
        if ! git diff --quiet; then
            log_info "Auto-fixes were applied, staging changes..."
            git add -A
        fi
        
        return 0
    fi
}

# Handle script arguments
case "${1:-}" in
    --help|-h)
        echo "Usage: $0 [options]"
        echo "Options:"
        echo "  --help, -h          Show this help message"
        echo "  --skip-performance  Skip performance tests"
        echo "  --quick            Run only mandatory tests"
        echo ""
        echo "Environment variables:"
        echo "  SKIP_PERFORMANCE=true   Skip performance tests"
        echo "  QUICK_MODE=true         Run only mandatory tests"
        exit 0
        ;;
    --skip-performance)
        export SKIP_PERFORMANCE=true
        ;;
    --quick)
        export QUICK_MODE=true
        export SKIP_PERFORMANCE=true
        ;;
esac

# Run main validation
main

log_success "Pre-commit validation completed successfully!"
log_info "Your code is ready for GitHub deployment with minimal CI/CD costs" 