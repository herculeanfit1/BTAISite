# Secure GitHub Actions Logs Retrieval

This document outlines the secure approach to retrieving and analyzing GitHub Actions workflow logs for the Bridging Trust AI project using GitHub Apps for authentication rather than Personal Access Tokens (PATs).

## Overview

Our approach uses GitHub Apps with fine-grained permissions for secure access to workflow logs, following these key principles:

1. **Secure Authentication**: Using GitHub Apps instead of PATs
2. **Principle of Least Privilege**: Requesting only the necessary permissions
3. **Automated Analysis**: Processing logs to identify common failure patterns
4. **Secure Token Handling**: Short-lived tokens, secure transmission, and proper storage

## Prerequisites

To use the log retrieval scripts, you need:

1. A GitHub App with appropriate permissions
2. Private key for the GitHub App
3. Installation ID for your GitHub App
4. The following command-line tools:
   - `curl`
   - `jq`
   - `openssl`
   - `unzip`

## Setting Up a GitHub App (One-time Setup)

If you don't already have a GitHub App for log retrieval:

1. Go to GitHub Settings > Developer Settings > GitHub Apps
2. Click "New GitHub App"
3. Give it a name (e.g., "BTAI Logs Retriever")
4. Set the Homepage URL to your repository URL
5. Disable Webhook (uncheck "Active")
6. Under Permissions, grant the following **read-only** permissions:
   - Repository permissions:
     - Actions: Read-only
     - Metadata: Read-only
     - Checks: Read-only (for detailed job status)
7. Under "Where can this GitHub App be installed?", select "Only on this account"
8. Create the app and then click "Generate a private key"
9. Save the private key securely (e.g., in `~/.ssh/github_app/`)
10. Install the app on your repositories

## Finding Your GitHub App Installation ID

Use the provided script to find your GitHub App's installation ID:

```bash
./scripts/find-github-app-installation.sh \
  --app-id YOUR_APP_ID \
  --key-path /path/to/private-key.pem \
  --debug
```

The script will display all installations and save the output to `github-app-installations.json`.

## Retrieving Workflow Logs

Use the retrieval script to download and analyze workflow logs:

```bash
./scripts/retrieve-github-logs.sh \
  --app-id YOUR_APP_ID \
  --installation-id YOUR_INSTALLATION_ID \
  --owner herculeanfit1 \
  --repo BridgingTrustAI \
  --key-path /path/to/private-key.pem \
  --debug
```

Optional parameters:
- `--workflow-id ID`: Analyze a specific workflow
- `--output-dir DIR`: Specify where to save logs (default: `./github-logs`)

## Authentication Flow

The scripts follow this authentication flow:

1. **JWT Generation**: Create a JWT signed with the GitHub App's private key
2. **Token Exchange**: Exchange the JWT for an installation token
3. **API Requests**: Use the installation token to access workflow data
4. **Analysis**: Process the logs to identify errors and patterns

## Troubleshooting

### Common Issues

1. **Invalid JWT**
   - Verify your App ID is correct
   - Check your private key file for validity and permissions
   - Ensure the private key corresponds to your GitHub App

2. **Installation Not Found**
   - Verify the installation ID is correct
   - Confirm the App is installed on your repository
   - Run the `find-github-app-installation.sh` script to get the correct ID

3. **Permission Issues**
   - Ensure your GitHub App has the necessary permissions
   - You may need to re-install the App to update permissions

4. **JSON Parsing Errors**
   - The scripts attempt to handle malformed JSON
   - Use the `--debug` flag to save raw responses for inspection
   - Check if GitHub's API format has changed

5. **Rate Limiting**
   - The scripts include exponential backoff for rate limits
   - If persistent, spread requests over time or reduce frequency

### Debugging

For detailed troubleshooting:

1. Run scripts with `--debug` flag
2. Examine the raw API responses saved in the output directory
3. Check the terminal output for specific error messages and recommendations

## Security Best Practices

1. **Store private keys securely**:
   - Use restricted permissions: `chmod 600 /path/to/private-key.pem`
   - Consider using a key management service for production

2. **Rotate private keys periodically**:
   - Delete old keys and generate new ones in the GitHub App settings
   - Update your stored keys when rotated

3. **Limit app permissions**:
   - Only request necessary permissions
   - Use read-only permissions when possible

4. **Secure logs storage**:
   - Treat downloaded logs as potentially sensitive
   - Clean up logs after analysis when possible
   - Restrict access to log directories

## Automated CI/CD Integration

To integrate log retrieval into CI/CD workflows:

1. Store the private key as a GitHub Secret
2. Add a workflow step that runs after failed builds
3. Use the log analysis to identify patterns and suggest fixes

Example workflow snippet:
```yaml
on:
  workflow_run:
    workflows: ["CI Pipeline"]
    types: [completed]
    
jobs:
  analyze-failure:
    if: ${{ github.event.workflow_run.conclusion == 'failure' }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Analyze workflow failure
        run: |
          echo "${{ secrets.GITHUB_APP_PRIVATE_KEY }}" > private-key.pem
          chmod 600 private-key.pem
          ./scripts/retrieve-github-logs.sh \
            --app-id ${{ secrets.GITHUB_APP_ID }} \
            --installation-id ${{ secrets.GITHUB_APP_INSTALLATION_ID }} \
            --owner ${{ github.repository_owner }} \
            --repo ${{ github.event.repository.name }} \
            --key-path private-key.pem \
            --workflow-id ${{ github.event.workflow_run.id }}
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Further Reading

- [GitHub Apps Documentation](https://docs.github.com/en/developers/apps/about-apps)
- [JWT Authentication for GitHub Apps](https://docs.github.com/en/developers/apps/authenticating-with-github-apps#authenticating-as-a-github-app)
- [GitHub Actions API](https://docs.github.com/en/rest/reference/actions) 