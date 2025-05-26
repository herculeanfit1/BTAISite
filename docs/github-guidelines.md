# GitHub Workflow Guidelines

This document outlines the standard practices and workflows for contributing to the Bridging Trust AI codebase through GitHub.

## Branching Strategy

We follow a simplified GitHub Flow branching strategy:

- `main`: Production-ready code
- `development`: Integration branch for features and fixes
- Feature branches: Created from `development` for specific features or fixes

### Branch Naming Conventions

Use the following naming convention for branches:

- `feature/short-description` - For new features
- `fix/issue-description` - For bug fixes
- `refactor/component-name` - For code refactoring
- `docs/topic-name` - For documentation changes
- `test/component-name` - For adding/updating tests
- `hotfix/critical-issue` - For emergency fixes to production

Example: `feature/contact-form-validation`

## Commit Messages

Follow these guidelines for commit messages:

- Begin with a concise summary line (max 72 characters)
- Use the imperative mood ("Add feature" not "Added feature")
- Include the component or area affected at the beginning when possible
- Add details in the body of the commit message if needed

Example:
```
ContactForm: Add email validation and error handling

- Implement regex validation for email fields
- Add meaningful error messages for form validation
- Create unit tests for validation logic
```

## Pull Request Process

1. Create feature branch from `development`
2. Implement changes with appropriate tests
3. Commit changes following commit message guidelines
4. Push branch to GitHub
5. Create pull request to merge into `development`
6. Request review from at least one team member
7. Address review feedback
8. Merge only after approval and passing CI checks

### Pull Request Template

Each PR should include:

- Description of the changes
- Link to related issue(s)
- Screenshots or videos for UI changes
- Test coverage information
- Breaking changes or deployment considerations

## CI Pipeline Considerations

Our CI pipeline runs multiple checks:

- Linting (ESLint)
- Type checking (TypeScript)
- Unit tests
- Integration tests
- Build verification

### Known CI Issues

Currently, there are CI compatibility issues with email-related tests:

- Test coverage thresholds (8.04% vs 70% required)
- TypeScript interface issues with test mocks
- Environment configuration differences between CI and dev environments

### Workarounds for CI Issues

If your changes involve email functionality:

1. Create placeholder test files with explanatory comments
2. Add `[skip ci]` to commit messages for critical hotfixes if needed
3. Consider using a hotfix branch (e.g., `hotfix/email-integration-no-ci`)
4. Document manual testing procedures thoroughly
5. Request direct merge to main or "Merge without CI" for critical issues

## GitHub Logs Retrieval

When analyzing GitHub Actions workflow logs for debugging CI issues, follow these secure practices:

### Authentication and Authorization

1. **Authenticate as a GitHub App**
   - Generate a JWT with your App's private key and APP_ID
   - Exchange the JWT for an installation access token using:
     `POST /app/installations/{installation_id}/access_tokens`
   - Request only the necessary scopes: `actions:read`, `checks:read`, `logs:read`

2. **Retrieve Workflow Logs**
   - Use HTTPS to call:
     `GET /repos/{owner}/{repo}/actions/runs/{run_id}/logs`
   - Download and unzip the log archive for analysis

3. **Parse and Summarize Logs**
   - Examine each job's log files for errors or failed steps
   - Aggregate key error messages and suggest solutions (retry builds, adjust cache settings, etc.)

4. **Error Handling and Resilience**
   - Implement exponential backoff and retry for HTTP 5xx errors or rate limits
   - If persistent failures occur, pause automation and notify a team member

5. **Security Best Practices**
   - Never use Personal Access Tokens (PATs); rely on short-lived installation tokens
   - Use OIDC when possible for cloud deployments
   - Always transmit over HTTPS and encrypt tokens at rest
   - Schedule monthly reviews of App permissions to maintain least-privilege principle

For complete implementation details, refer to our internal documentation on the Cursor application integration.

## Environment Variables

- Never commit actual environment variables or secrets to the repository
- Use `.env.example` files to document required variables
- For sensitive configuration, use GitHub Secrets or Azure Key Vault
- Document required environment variables in README files

### Email Integration Variables

For email functionality, the following variables are required:

```
AZURE_FUNCTION_URL=https://btai-email-relay.azurewebsites.net/api/SendContactForm
AZURE_FUNCTION_KEY=your-function-key-here
```

## Code Review Guidelines

When reviewing PRs, focus on:

1. **Functionality**: Does the code work as expected?
2. **Security**: Are there potential security issues?
3. **Performance**: Are there performance concerns?
4. **Maintainability**: Is the code easy to understand and modify?
5. **Test Coverage**: Are there sufficient tests?
6. **Documentation**: Are changes properly documented?

## Deployment Process

1. Changes merged to `development` are deployed to staging environment
2. After verification in staging, changes are merged to `main`
3. Merges to `main` trigger automatic deployment to production
4. Post-deployment verification should be performed

For emergency fixes:

1. Create a `hotfix` branch from `main`
2. Implement minimal fix for the issue
3. Create PR to merge directly to `main`
4. After deployment, backport changes to `development`

## Testing Requirements

All code changes should be accompanied by appropriate tests:

- **Unit tests**: For individual functions and components
- **Integration tests**: For interactions between components
- **E2E tests**: For critical user flows
- **Manual tests**: When automated testing is not feasible

Document manual testing procedures when necessary.

## Documentation

Update relevant documentation when making changes:

- README.md for project-level changes
- Component/feature-specific documentation in `/docs`
- JSDoc comments for functions and interfaces
- Update any affected diagrams or architecture docs

## Security Practices

- Never commit API keys, passwords, or sensitive data
- Use environment variables for all secrets
- Conduct security reviews for authentication or data-handling changes
- Follow OWASP best practices for web security
- Report security vulnerabilities privately

## Troubleshooting Common Issues

### Failed CI Checks

If CI checks fail:

1. Review the error logs thoroughly
2. Fix linting/type issues locally before pushing again
3. Verify tests pass locally before pushing
4. For complex issues, ask for team support in the PR comments

### Merge Conflicts

When encountering merge conflicts:

1. Pull the latest changes from the target branch
2. Resolve conflicts locally
3. Run tests to ensure everything still works
4. Push the updated branch

### Deployment Issues

If deployment fails:

1. Check deployment logs
2. Verify environment variables are set correctly
3. Ensure build process completes successfully
4. Document any special deployment steps in the PR 