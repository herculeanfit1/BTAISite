#!/bin/bash

# =============================================================================
# Master Quality Gate Script - Bridging Trust AI
# =============================================================================
# Orchestrates all quality gates in sequence with fail-fast behavior
# Complies with cursor rules: Quality First, Security-by-Design, Performance
# =============================================================================

set -Eeuo pipefail  # Enhanced error handling
IFS=$'\n\t'         # Secure IFS
trap 'echo "❌ Gate failed at line $LINENO"' ERR

# Block --skip-tests in CI environment
if [[ -n "${CI:-}" ]] && printf '%s\n' "$@" | grep -q -- '--skip-tests'; then
  echo "❌ --skip-tests is not allowed in CI environment"
  echo "ℹ️  All tests must pass in CI for security and quality"
  exit 1
fi

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

# Parse command line arguments
VERBOSE=false
DEBUG=false
SKIP_TESTS=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --verbose)
            VERBOSE=true
            shift
            ;;
        --debug)
            DEBUG=true
            VERBOSE=true
            shift
            ;;
        --skip-tests)
            SKIP_TESTS=true
            shift
            ;;
        --help|-h)
            echo "Usage: $0 [options]"
            echo "Options:"
            echo "  --verbose     Show detailed progress"
            echo "  --debug       Show all commands and output"
            echo "  --skip-tests  Skip test execution (faster validation)"
            echo "  --help, -h    Show this help message"
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Track execution
START_TIME=$(date +%s)
GATES_PASSED=0
GATES_FAILED=0

# Function to run a quality gate
run_gate() {
    local gate_name="$1"
    local gate_script="$2"
    local gate_description="$3"
    
    log_info "Running $gate_name..."
    
    local gate_start=$(date +%s)
    
    if [ "$DEBUG" = true ]; then
        echo -e "${BLUE}🔍 Executing: $gate_script${NC}"
    fi
    
    if [ "$VERBOSE" = true ] || [ "$DEBUG" = true ]; then
        if ./ci/$gate_script; then
            local gate_end=$(date +%s)
            local gate_duration=$((gate_end - gate_start))
            log_success "$gate_name (${gate_duration}s) - $gate_description"
            ((GATES_PASSED++))
        else
            local gate_end=$(date +%s)
            local gate_duration=$((gate_end - gate_start))
            log_error "$gate_name (${gate_duration}s) - $gate_description"
            ((GATES_FAILED++))
            return 1
        fi
    else
        if ./ci/$gate_script > /dev/null 2>&1; then
            local gate_end=$(date +%s)
            local gate_duration=$((gate_end - gate_start))
            log_success "$gate_name (${gate_duration}s) - $gate_description"
            ((GATES_PASSED++))
        else
            local gate_end=$(date +%s)
            local gate_duration=$((gate_end - gate_start))
            log_error "$gate_name (${gate_duration}s) - $gate_description"
            ((GATES_FAILED++))
            return 1
        fi
    fi
}

# Main execution
main() {
    log_header "MASTER QUALITY GATE - BRIDGING TRUST AI"
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ] || [ ! -f "next.config.js" ]; then
        log_error "Please run this script from the BTAISite root directory"
        exit 1
    fi
    
    log_info "Starting quality gate validation..."
    log_info "Mode: $([ "$VERBOSE" = true ] && echo "Verbose" || echo "Silent")"
    log_info "Debug: $([ "$DEBUG" = true ] && echo "Enabled" || echo "Disabled")"
    log_info "Skip Tests: $([ "$SKIP_TESTS" = true ] && echo "Yes" || echo "No")"
    
    # Quality Gate Sequence (fail-fast)
    log_header "PHASE 1: BUILD VALIDATION"
    run_gate "g_build.sh" "g_build.sh" "Build validation passed"
    
    log_header "PHASE 2: CODE QUALITY"
    run_gate "g_type-check.sh" "g_type-check.sh" "TypeScript compilation clean"
    run_gate "g_lint.sh" "g_lint.sh" "Linting checks passed"
    
    if [ "$SKIP_TESTS" = false ]; then
        log_header "PHASE 3: TESTING"
        run_gate "g_test.sh" "g_test.sh" "Test execution passed"
    else
        log_warning "Skipping test execution (--skip-tests flag)"
    fi
    
    log_header "PHASE 4: SECURITY & DEPLOYMENT"
    run_gate "g_security.sh" "g_security.sh" "Security validation passed"
    run_gate "g_deploy-check.sh" "g_deploy-check.sh" "Deployment readiness confirmed"
    
    # Final results
    log_header "QUALITY GATE RESULTS"
    
    local end_time=$(date +%s)
    local total_duration=$((end_time - START_TIME))
    
    log_info "Total execution time: ${total_duration}s"
    log_info "Gates passed: $GATES_PASSED"
    
    if [ $GATES_FAILED -gt 0 ]; then
        log_error "Gates failed: $GATES_FAILED"
        log_error "QUALITY GATE FAILED - Code not ready for deployment"
        exit 1
    else
        log_success "ALL QUALITY GATES PASSED!"
        log_success "Code is ready for deployment"
        return 0
    fi
}

# Run main function
main "$@"
