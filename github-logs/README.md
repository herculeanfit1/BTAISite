# GitHub Workflow Logs Analysis

This directory contains GitHub Actions workflow logs and analysis summaries for failed CI/CD runs. The logs are automatically retrieved and analyzed by the `retrieve-github-logs.sh` script.

## Directory Structure

```
github-logs/
├── workflow_<run_id>.zip          # Original downloaded log archive
├── raw_response.txt               # Raw API response (when run with --debug)
├── token_response.txt             # Token API response (when run with --debug)
├── parsed_workflow_runs.json      # Parsed workflow runs data
├── run_<run_id>/                  # Extracted logs for a specific run
│   ├── <job_1_name>.txt           # Individual job logs
│   ├── <job_2_name>.txt
│   └── analysis_summary.txt       # Analysis summary with issues and recommendations
└── ...
```

## Analysis Summary

Each `analysis_summary.txt` file contains:

1. **Error Messages**: Explicit error messages found in the logs
2. **Failed Steps**: GitHub Actions steps that failed
3. **Test Failures**: Details on any test failures
4. **Common CI Issues**: Detection of common problems:
   - npm errors
   - ESLint errors
   - TypeScript errors
   - Test coverage issues
5. **Recommendations**: Suggested fixes for detected issues

## How to Use

### Reviewing Analysis Summaries

1. Start with the `analysis_summary.txt` files to get a quick overview of issues
2. Look for patterns across multiple failures
3. Use the recommendations as a starting point for fixes

### Digging Deeper

If the analysis summary doesn't provide enough information:

1. Check the individual job log files in the same directory
2. For specific errors, search through the log files for more context
3. Use the original zip files if you need to see the complete, unprocessed logs

## Manual Log Retrieval

You can manually retrieve logs using:

```bash
./scripts/retrieve-github-logs.sh \
  --app-id YOUR_APP_ID \
  --installation-id YOUR_INSTALLATION_ID \
  --owner herculeanfit1 \
  --repo BridgingTrustAI \
  --key-path /path/to/private-key.pem \
  --debug
```

## Interpreting Common Failures

### npm Errors

* **Module not found**: Check package.json for missing dependencies
* **Version conflicts**: Look for incompatible package versions
* **Peer dependency issues**: Install required peer dependencies

### ESLint Errors

* Check `.eslintrc.json` for rule configuration
* Run `npm run lint` locally to fix issues
* Look for new rules added in dependencies

### TypeScript Errors

* Type definition mismatches
* Missing type declarations
* Interface implementation issues

### Test Coverage Issues

* Identify which components need additional tests
* Check for skipped tests
* Look for coverage threshold settings in jest.config.js

## Maintenance

This directory is automatically managed by scripts and workflows. It's good practice to:

1. Periodically clean up old log files (logs older than 30 days can usually be removed)
2. Update the scripts if GitHub Actions API changes
3. Review and adjust analysis patterns based on your project's specific needs

For more information, see the [GitHub Logs Retrieval Guide](../docs/github-logs-retrieval.md). 