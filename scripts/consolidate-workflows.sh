#!/bin/bash

# Consolidate GitHub Action Workflows
# This script removes redundant workflows after consolidating their functionality
# into the main ci-pipeline.yml workflow.

GITHUB_DIR=".github/workflows"
BACKUP_DIR=".github/workflows-backup"
DOCS_DIR="docs"

# Create backup directory
echo "Creating backup directory..."
mkdir -p "$BACKUP_DIR"

# Document the consolidation process
echo "Creating documentation..."
cat > "$DOCS_DIR/workflow-consolidation.md" << EOF
# GitHub Actions Workflow Consolidation

This document details the consolidation of GitHub Actions workflows to improve maintainability
and reduce duplication in our CI/CD infrastructure.

## Consolidated Workflows

The following workflows have been merged into the main \`ci-pipeline.yml\` workflow:

1. **hybrid-tests.yml** - Docker-based testing capabilities integrated
2. **improved-tests.yml** - Component and API testing with retry logic integrated
3. **security-tests.yml** - Security scanning moved to Dependabot workflow and main pipeline
4. **ui-tests.yml** - Redundant with E2E tests in main pipeline
5. **playwright.yml** - Consolidated with other E2E testing
6. **performance-security-tests.yml** - Performance tests merged into main pipeline

## Remaining Core Workflows

1. **ci-pipeline.yml** (enhanced)
2. **dependabot-security.yml**
3. **dependency-checks.yml**
4. **deploy.yml**
5. **azure-static-web-apps.yml**
6. **visual-regression.yml**
7. **backup-repository.yml**

## Changes Made

- Added Docker-based testing to ci-pipeline.yml
- Added retry logic for flaky tests in main pipeline
- Ensured all actions use v4 of GitHub Actions
- Updated Node.js version to 20.19.1 consistently
- Added comprehensive test summary
- Added security testing to main pipeline
- Standardized artifacts and retention policies

This consolidation was performed on $(date).
EOF

# List of workflows to archive (move to backup)
WORKFLOWS_TO_ARCHIVE=(
  "hybrid-tests.yml"
  "improved-tests.yml"
  "security-tests.yml"
  "ui-tests.yml"
  "playwright.yml"
  "performance-security-tests.yml"
)

# Move redundant workflows to backup
for workflow in "${WORKFLOWS_TO_ARCHIVE[@]}"; do
  if [ -f "$GITHUB_DIR/$workflow" ]; then
    echo "Moving $workflow to backup..."
    mv "$GITHUB_DIR/$workflow" "$BACKUP_DIR/$workflow"
    echo "✅ Archived $workflow"
  else
    echo "⚠️ Warning: $workflow not found"
  fi
done

echo "Creating README in backup directory..."
cat > "$BACKUP_DIR/README.md" << EOF
# Archived GitHub Actions Workflows

These workflows were archived on $(date) as part of a consolidation effort.
Their functionality has been merged into the main \`ci-pipeline.yml\` workflow.

See \`docs/workflow-consolidation.md\` for details.
EOF

echo "✅ Consolidation completed. Redundant workflows have been moved to $BACKUP_DIR"
echo "📄 Documentation created at $DOCS_DIR/workflow-consolidation.md"
echo ""
echo "To verify the changes, run:"
echo "  git diff .github/workflows/ci-pipeline.yml"
echo ""
echo "To revert the changes if needed:"
echo "  for f in $BACKUP_DIR/*.yml; do mv \$f $GITHUB_DIR/; done" 