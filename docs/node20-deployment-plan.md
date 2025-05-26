# Node 20 LTS Deployment Plan

This document outlines the steps to deploy the Node 20 LTS and React 19 upgraded application to the Azure Static Web Apps production environment.

## Pre-Deployment Checklist

- [x] Upgrade Node.js to version 20 LTS
- [x] Upgrade React to version 19.0.0
- [x] Update Next.js configuration
- [x] Test the application locally
- [x] Run all automated tests
- [x] Generate SBOM and security documentation
- [x] Document breaking changes and fixes
- [x] Merge changes to main branch

## Deployment Process

### 1. Prepare Azure Static Web Apps Environment

1. Update the Azure Static Web Apps configuration to use Node 20 LTS:
   - Verify the current `platform.apiRuntime` setting in staticwebapp.config.json is set to `node:20`
   - Check GitHub Actions workflow files to ensure they're using Node 20 for building

2. Create/update deployment slot for testing:
   - Create a staging deployment slot in Azure Static Web Apps
   - Configure GitHub Actions to deploy to the staging slot first

### 2. Deploy to Staging Environment

1. Push the changes to the GitHub repository:
   ```bash
   git push origin main
   ```

2. Monitor the GitHub Actions workflow:
   - Ensure the build completes successfully
   - Verify that the deployment to the staging slot succeeds

3. Perform thorough testing in the staging environment:
   - Verify all pages load correctly
   - Test all forms and API endpoints
   - Check for any visual regressions
   - Verify responsive behavior across different device sizes
   - Test dark/light mode switching
   - Analyze performance metrics (Lighthouse)
   - Check accessibility compliance

### 3. Production Deployment

1. If all tests pass in staging, perform the slot swap:
   - Use Azure Portal to swap staging and production slots
   - OR use Azure CLI:
     ```bash
     az staticwebapp environment swap --name bridgingtrust-website --source staging --target production
     ```

2. Verify the production environment:
   - Check all critical pages and functionality
   - Verify that API endpoints are working correctly
   - Monitor application insights for any errors

### 4. Post-Deployment Activities

1. Create a deployment tag:
   ```bash
   git tag -a v1.2.0-node20 -m "Node 20 LTS and React 19 upgrade"
   git push origin v1.2.0-node20
   ```

2. Update documentation:
   - Mark the deployment as complete in the project documentation
   - Update the README.md with the current Node.js version requirement
   - Document any manual steps performed during the deployment

3. Monitoring:
   - Set up additional monitoring for the first 24-48 hours
   - Configure alerts for any critical errors
   - Monitor performance metrics to ensure there's no degradation

## Rollback Plan

In case of deployment issues, follow these steps to rollback:

1. Swap back to the previous production slot:
   ```bash
   az staticwebapp environment swap --name bridgingtrust-website --source production --target staging
   ```

2. If needed, revert the changes in the Git repository:
   ```bash
   git revert HEAD~1
   git push origin main
   ```

3. Rebuild and redeploy the previous version.

## Contact Information

For deployment assistance or issues, contact:
- DevOps Team: devops@bridgingtrust.ai
- Lead Developer: developer@bridgingtrust.ai

## Additional Notes

- The middleware warnings about "output: export" during development are expected and do not affect the production build
- The API errors during the static build related to blog categories are expected as they are only available at runtime
- The application has been tested with Node.js 20.19.1 LTS 