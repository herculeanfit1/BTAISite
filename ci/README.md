# CI Quality Gates - Bridging Trust AI

This directory contains the quality gate system for the Bridging Trust AI website. All scripts follow the **fail-fast** principle and comply with cursor rules for **Quality First**, **Security-by-Design**, and **Performance** standards.

## 🚀 Quick Start

```bash
# Run all quality gates
./ci/g_master.sh

# Run with verbose output
./ci/g_master.sh --verbose

# Run with debug output
./ci/g_master.sh --debug

# Skip tests for faster validation
./ci/g_master.sh --skip-tests
```

## 📋 Quality Gate Scripts

### `g_master.sh` - Master Quality Gate
Orchestrates all quality gates in sequence with fail-fast behavior.

**Usage:**
```bash
./ci/g_master.sh [--verbose] [--debug] [--skip-tests] [--help]
```

**Execution Order:**
1. `g_build.sh` - Build validation
2. `g_type-check.sh` - TypeScript compilation
3. `g_lint.sh` - Code quality checks
4. `g_test.sh` - Test execution (optional with --skip-tests)
5. `g_security.sh` - Security validation
6. `g_deploy-check.sh` - Deployment readiness

### `g_build.sh` - Build Validation
Validates that the application builds successfully.

**Checks:**
- Clean previous builds
- Install dependencies if needed
- Run `npm run build`
- Verify build output directory exists

### `g_type-check.sh` - TypeScript Validation
Validates TypeScript compilation without emitting files.

**Checks:**
- Run `npm run type-check`
- Ensure no type errors
- Comply with TypeScript strict mode

### `g_lint.sh` - Code Quality
Validates code quality with ESLint including security and accessibility.

**Checks:**
- Run `npm run lint:check`
- Ensure no warnings or errors
- Validate security and accessibility rules
- Enforce cursor rules: no warnings left behind

### `g_test.sh` - Test Execution
Validates test execution and coverage requirements.

**Checks:**
- Core functionality tests (`npm run test:ci-basic`)
- Middleware security tests (`npm run test:middleware`)
- Configuration tests (`npm run test:config`)
- Test coverage validation

### `g_security.sh` - Security Validation
Validates security compliance and vulnerability checks.

**Checks:**
- Scan for exposed secrets in code
- Validate CSP configuration
- Run security audit (`npm audit`)
- Check for dangerous patterns
- Validate rate limiting implementation

### `g_deploy-check.sh` - Deployment Readiness
Validates deployment readiness and performance budgets.

**Checks:**
- Required deployment files exist
- Next.js configuration validity
- E2E tests execution
- Accessibility compliance
- Environment variable configuration
- Performance optimizations
- Build output validation
- Azure Static Web Apps configuration

## 🎨 Output Format

All scripts provide colored output for better readability:

- ✅ **Green**: Success messages
- ❌ **Red**: Error messages
- ⚠️ **Yellow**: Warning messages
- ℹ️ **Blue**: Information messages

## ⏱️ Timing Information

Each script reports execution time to help identify performance bottlenecks:

```bash
✅ g_build.sh     (2.3s) - Build validation passed
✅ g_test.sh      (8.7s) - Test execution passed
❌ g_lint.sh      (1.2s) - Linting failed
```

## 🔧 Integration

### GitHub Actions
The quality gates integrate with the cost-optimized CI workflow:

```yaml
- name: Run Quality Gates
  run: ./ci/g_master.sh --verbose
```

### Local Development
Use before committing changes:

```bash
# Quick validation
./ci/g_master.sh --skip-tests

# Full validation
./ci/g_master.sh --verbose
```

## 📊 Compliance

All scripts comply with Bridging Trust AI cursor rules:

- **Quality First**: Code compiles, passes lint & tests in first draft
- **Security-by-Design**: CSP/SRI compliance, no secrets, rate limiting
- **Performance**: Performance budgets, optimization checks
- **Accessibility**: WCAG AA compliance, proper semantic HTML
- **TypeScript Strict**: No any types, strict compilation

## 🚨 Fail-Fast Behavior

All scripts exit immediately on first error to prevent broken code from progressing:

1. **Immediate feedback** on issues
2. **Clear error messages** with colored output
3. **No partial success** - either all gates pass or fail
4. **Easy debugging** - know exactly which gate failed

## 📁 Legacy Scripts

The following scripts have been moved from `scripts/` to `ci/` for better organization:

- `pre-commit-validation.sh` - Replaced by `g_master.sh`
- `local-ci-test.sh` - Integrated into quality gates
- `validate-before-push.sh` - Wrapper for `g_master.sh`
- `dependency-lock.sh` - Integrated into security gate
- `deploy*.sh` - Integrated into deploy-check gate

## 🔍 Troubleshooting

### Common Issues

1. **Permission Denied**: Ensure scripts are executable
   ```bash
   chmod +x ci/g_*.sh
   ```

2. **Wrong Directory**: Run from project root
   ```bash
   cd /path/to/BTAISite
   ./ci/g_master.sh
   ```

3. **Missing Dependencies**: Install first
   ```bash
   npm ci
   ```

4. **Build Issues**: Clean and rebuild
   ```bash
   rm -rf .next node_modules
   npm ci
   npm run build
   ```

### Debug Mode

Use `--debug` flag for detailed output:

```bash
./ci/g_master.sh --debug
```

This shows all commands being executed and their output.
