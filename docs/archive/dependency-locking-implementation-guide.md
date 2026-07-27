# Dependency Locking Implementation Guide for AI Agents

## 🎯 **OBJECTIVE**
Implement the exact same comprehensive dependency locking strategy from the Bridging Trust AI project into a new project. This system provides production stability, security, and cost-effective CI/CD with minimal manual maintenance.

## 📋 **IMPLEMENTATION CHECKLIST**

### Phase 1: Core Files Creation

#### 1. Create Dependency Lock Management Script
**File**: `scripts/dependency-lock.sh`
**Make executable**: `chmod +x scripts/dependency-lock.sh`

```bash
#!/bin/bash

# =============================================================================
# Dependency Lock Management Script - [PROJECT_NAME]
# =============================================================================
# This script manages dependency locking for production stability and security
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# Function to check if package-lock.json exists and is valid
check_lockfile() {
    log_header "DEPENDENCY LOCK VALIDATION"
    
    if [ ! -f "package-lock.json" ]; then
        log_error "package-lock.json not found!"
        log_info "Run 'npm install' to generate lockfile"
        exit 1
    fi
    
    log_success "package-lock.json exists"
    
    # Check if lockfile is in sync with package.json
    if ! npm ls > /dev/null 2>&1; then
        log_warning "Dependencies may be out of sync"
        log_info "Consider running 'npm ci' to ensure clean install"
    else
        log_success "Dependencies are in sync"
    fi
}

# Function to audit dependencies for security vulnerabilities
audit_dependencies() {
    log_header "SECURITY AUDIT"
    
    log_info "Running npm audit..."
    
    # Run audit and capture output
    if npm audit --audit-level=moderate > audit-report.txt 2>&1; then
        log_success "No security vulnerabilities found"
        rm -f audit-report.txt
    else
        log_warning "Security vulnerabilities detected"
        cat audit-report.txt
        
        # Ask if user wants to fix automatically
        read -p "Attempt automatic fixes? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            if npm audit fix --dry-run > /dev/null 2>&1; then
                npm audit fix
                log_info "Automatic fixes applied"
            else
                log_warning "Automatic fixes not available - manual review required"
                log_info "These are likely devDependencies vulnerabilities"
            fi
        else
            log_warning "Manual review required for security issues"
        fi
        rm -f audit-report.txt
    fi
}

# Function to check for outdated dependencies
check_outdated() {
    log_header "OUTDATED DEPENDENCIES CHECK"
    
    log_info "Checking for outdated packages..."
    
    if npm outdated > outdated-report.txt 2>&1; then
        log_success "All dependencies are up to date"
        rm -f outdated-report.txt
    else
        log_warning "Outdated dependencies found:"
        cat outdated-report.txt
        
        echo ""
        log_info "To update dependencies:"
        log_info "  Minor updates: npm run ncu"
        log_info "  Major updates: npm run ncu:major"
        log_info "  Then run: npm install"
        
        rm -f outdated-report.txt
    fi
}

# Function to validate exact versions in package.json
validate_exact_versions() {
    log_header "EXACT VERSION VALIDATION"
    
    log_info "Checking for non-exact version specifications..."
    
    # Check for version ranges in dependencies
    local has_ranges=false
    
    # Check dependencies
    if grep -E '[\^~]' package.json | grep -E '"(dependencies|devDependencies)"' -A 50 | grep -E '[\^~]' > /dev/null; then
        log_warning "Found version ranges in dependencies:"
        grep -E '[\^~]' package.json | grep -v '"engines"'
        has_ranges=true
    fi
    
    if [ "$has_ranges" = false ]; then
        log_success "All dependencies use exact versions"
    else
        log_info "Consider using exact versions for production stability"
        log_info "Run 'npm run lock:freeze' to convert to exact versions"
    fi
}

# Function to freeze dependencies to exact versions
freeze_exact_versions() {
    log_header "FREEZING TO EXACT VERSIONS"
    
    log_info "Converting all dependencies to exact versions..."
    
    # Backup original package.json
    cp package.json package.json.backup
    
    # Remove ^ and ~ from version specifications
    sed -i.tmp 's/"\^/"/g; s/"~/"/g' package.json
    rm -f package.json.tmp
    
    log_success "Dependencies frozen to exact versions"
    log_info "Backup saved as package.json.backup"
    
    # Regenerate lockfile
    rm -f package-lock.json
    npm install
    
    log_success "New lockfile generated with exact versions"
}

# Function to validate lockfile integrity
validate_lockfile_integrity() {
    log_header "LOCKFILE INTEGRITY CHECK"
    
    log_info "Validating package-lock.json integrity..."
    
    # Check if lockfile matches package.json
    if npm ci --dry-run > /dev/null 2>&1; then
        log_success "Lockfile integrity validated"
    else
        log_error "Lockfile integrity check failed"
        log_info "Run 'npm install' to regenerate lockfile"
        exit 1
    fi
}

# Function to generate dependency report
generate_dependency_report() {
    log_header "DEPENDENCY REPORT GENERATION"
    
    local report_file="dependency-report-$(date +%Y%m%d-%H%M%S).md"
    
    log_info "Generating comprehensive dependency report..."
    
    cat > "$report_file" << EOF
# Dependency Report - $(date)

## Summary
- **Project**: $(jq -r '.name' package.json)
- **Version**: $(jq -r '.version' package.json)
- **Node Version**: $(jq -r '.engines.node' package.json)
- **Generated**: $(date)

## Dependencies
\`\`\`
$(npm ls --depth=0)
\`\`\`

## Security Audit
\`\`\`
$(npm audit 2>/dev/null || echo "No vulnerabilities found")
\`\`\`

## Outdated Packages
\`\`\`
$(npm outdated 2>/dev/null || echo "All packages up to date")
\`\`\`

## Lockfile Info
- **Lockfile Version**: $(jq -r '.lockfileVersion' package-lock.json)
- **Total Packages**: $(jq '.packages | length' package-lock.json)

## Production Dependencies
$(jq -r '.dependencies | keys[]' package.json | wc -l) packages

## Development Dependencies  
$(jq -r '.devDependencies | keys[]' package.json | wc -l) packages

EOF

    log_success "Report generated: $report_file"
}

# Main function
main() {
    log_header "DEPENDENCY LOCK MANAGEMENT"
    
    case "${1:-check}" in
        "check")
            check_lockfile
            validate_lockfile_integrity
            validate_exact_versions
            audit_dependencies
            check_outdated
            ;;
        "freeze")
            freeze_exact_versions
            ;;
        "audit")
            audit_dependencies
            ;;
        "report")
            generate_dependency_report
            ;;
        "validate")
            check_lockfile
            validate_lockfile_integrity
            ;;
        "help"|"-h"|"--help")
            echo "Usage: $0 [command]"
            echo ""
            echo "Commands:"
            echo "  check     - Full dependency check (default)"
            echo "  freeze    - Convert all deps to exact versions"
            echo "  audit     - Security audit only"
            echo "  report    - Generate dependency report"
            echo "  validate  - Validate lockfile integrity"
            echo "  help      - Show this help"
            echo ""
            echo "Examples:"
            echo "  $0                    # Run full check"
            echo "  $0 freeze            # Freeze to exact versions"
            echo "  $0 audit             # Security audit only"
            ;;
        *)
            log_error "Unknown command: $1"
            log_info "Run '$0 help' for usage information"
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
```

#### 2. Create NPM Configuration File
**File**: `.npmrc`

```ini
# =============================================================================
# NPM Configuration - [PROJECT_NAME]
# =============================================================================
# Enforces strict dependency management and security settings
# =============================================================================

# Security Settings
audit-level=moderate
fund=false

# Dependency Management
save-exact=true
package-lock=true
package-lock-only=false

# Performance & Reliability
prefer-offline=true
engine-strict=true

# Logging & Output
loglevel=warn
progress=true

# Registry & Authentication
registry=https://registry.npmjs.org/

# Installation Behavior
save=true
save-dev=false

# Lockfile Behavior
package-lock=true

# Security & Audit
audit=true
audit-level=moderate

# Peer Dependencies
legacy-peer-deps=false
strict-peer-deps=true
```

### Phase 2: Package.json Updates

#### 3. Add NPM Scripts
**Add these scripts to package.json**:

```json
{
  "scripts": {
    "lock:check": "./scripts/dependency-lock.sh check",
    "lock:freeze": "./scripts/dependency-lock.sh freeze",
    "lock:audit": "./scripts/dependency-lock.sh audit",
    "lock:report": "./scripts/dependency-lock.sh report",
    "lock:validate": "./scripts/dependency-lock.sh validate",
    "ncu": "npx npm-check-updates -u -t minor",
    "ncu:major": "npx npm-check-updates -u"
  }
}
```

#### 4. Set Exact Node Version
**Update package.json engines section**:

```json
{
  "engines": {
    "node": "20.19.1"
  }
}
```

#### 5. Move Build Dependencies to Production
**CRITICAL**: If this is a Next.js, React, or similar project, move these to `dependencies` (not `devDependencies`):

- `postcss`
- `postcss-import`
- `autoprefixer`
- `tailwindcss` (if using Tailwind)
- Any other build-essential packages

### Phase 3: CI/CD Integration

#### 6. Update GitHub Actions Workflow
**Add dependency validation to your workflow**:

```yaml
- name: Dependency lock validation
  run: |
    # Validate dependency locking before build
    echo "🔒 Validating dependency locks..."
    npm run lock:validate
    echo "✅ Dependency locks validated"

- name: Install dependencies
  run: |
    # Install all dependencies needed for build
    npm ci --silent
    echo "✅ Dependencies installed"
```

#### 7. Add Pre-commit Hook Integration
**If you have pre-commit validation, add this step**:

```bash
run_test_step "Dependency lock validation" "npm run lock:validate" true
```

### Phase 4: Documentation

#### 8. Create Policy Documentation
**File**: `docs/dependency-locking-policy.md`

```markdown
# Dependency Locking Policy - [PROJECT_NAME]

## 🎯 Overview
This document outlines our comprehensive dependency locking strategy to ensure **production stability**, **security**, and **reproducible builds** across all environments.

## 🔒 Multi-Layer Locking Strategy

1. **package.json**: Exact versions only
2. **package-lock.json**: Full dependency tree with integrity hashes
3. **.npmrc**: Strict dependency management policies
4. **CI/CD**: Automated validation and enforcement

## 📋 Maintenance Schedule

### Weekly Tasks (5 minutes)
```bash
npm run lock:check
```

### Monthly Tasks (20 minutes)
```bash
npm run lock:report
npm run ncu:major  # Review major updates
```

### Emergency Response
```bash
npm run lock:audit
npm audit fix
npm run test && git commit && git push
```

## 🛠️ Commands

| Command | Purpose |
|---|---|
| `npm run lock:check` | Full dependency health check |
| `npm run lock:freeze` | Convert all deps to exact versions |
| `npm run lock:audit` | Security vulnerability scan |
| `npm run lock:report` | Generate dependency report |
| `npm run lock:validate` | Lockfile integrity check |
```

### Phase 5: Implementation Steps

#### 9. Execute Implementation
**Run these commands in order**:

```bash
# 1. Create scripts directory
mkdir -p scripts

# 2. Create and make executable the dependency lock script
# (Copy the script content above)
chmod +x scripts/dependency-lock.sh

# 3. Create .npmrc file
# (Copy the .npmrc content above)

# 4. Update package.json
# (Add the scripts and engines sections)

# 5. Move build dependencies to production if needed
# (Move postcss, autoprefixer, etc. to dependencies)

# 6. Freeze to exact versions
npm run lock:freeze

# 7. Validate everything works
npm run lock:check

# 8. Test build
npm run build

# 9. Commit everything
git add -A
git commit -m "feat: implement comprehensive dependency locking strategy"
git push
```

### Phase 6: Verification

#### 10. Verify Implementation
**Test these commands work**:

```bash
✅ npm run lock:validate
✅ npm run lock:check  
✅ npm run lock:audit
✅ npm run lock:report
✅ npm run build
✅ CI/CD pipeline passes
```

## 🎯 **SUCCESS CRITERIA**

The implementation is successful when:

1. ✅ All dependencies use exact versions
2. ✅ `npm run lock:validate` passes
3. ✅ Build works in CI/CD
4. ✅ Security audits run automatically
5. ✅ Weekly maintenance takes < 5 minutes

## 📞 **SUPPORT NOTES FOR AI AGENT**

### Common Issues & Solutions:

1. **Build fails with "Cannot find module"**:
   - Move the missing package from `devDependencies` to `dependencies`

2. **npm audit fix fails**:
   - This is normal for devDependencies vulnerabilities
   - Focus on production dependency security

3. **Version conflicts**:
   - Use `npm run lock:freeze` to convert all to exact versions
   - Regenerate package-lock.json with `npm install`

4. **CI/CD fails**:
   - Ensure workflow installs ALL dependencies (`npm ci` not `npm ci --omit=dev`)
   - Add dependency validation step before build

### Project-Specific Adaptations:

- **React/Next.js**: Move postcss, tailwindcss to dependencies
- **Node.js API**: Focus on production dependencies only
- **Full-stack**: Separate frontend/backend dependency strategies
- **Monorepo**: Apply to each package individually

## 🚀 **FINAL DELIVERABLE**

After implementation, the user will have:

1. **99% automated** dependency management
2. **5-minute weekly** maintenance routine
3. **Immediate security** vulnerability detection
4. **Cost-optimized** CI/CD pipeline
5. **Production-stable** dependency locking

The system will automatically handle daily security monitoring, validation, and enforcement with minimal manual intervention required. 