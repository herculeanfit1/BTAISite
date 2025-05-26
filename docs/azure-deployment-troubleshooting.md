# Azure Static Web Apps Deployment Troubleshooting

## Issue: Inconsistent Loading Behavior

### Symptoms
- Sometimes the site loads correctly
- Sometimes shows "offloaded" status
- Sometimes displays default Azure page
- Behavior varies on refresh

### Root Causes & Solutions

## 1. **Caching Issues (Most Likely)**

### Problem
Azure Static Web Apps uses aggressive caching at multiple levels:
- Browser cache
- Azure CDN cache
- Static Web Apps internal cache

### Solutions

#### A. Update staticwebapp.config.json Cache Headers
```json
{
  "routes": [
    {
      "route": "/",
      "headers": {
        "cache-control": "public, max-age=300, must-revalidate"
      }
    },
    {
      "route": "/*.html",
      "headers": {
        "cache-control": "public, max-age=300, must-revalidate"
      }
    }
  ]
}
```

#### B. Add Cache Busting
- Ensure build generates unique file names
- Add version query parameters to critical resources

## 2. **Build Output Issues**

### Problem
Static export may not be generating consistent output

### Solutions

#### A. Verify Build Process
```bash
# Clean build
rm -rf .next out
npm run build:static
```

#### B. Check Output Directory
Ensure `out/` directory contains:
- `index.html`
- All static assets
- Proper directory structure

## 3. **Deployment Configuration Issues**

### Problem
GitHub Actions workflow may have timing or configuration issues

### Solutions

#### A. Update Workflow
```yaml
- name: Build application
  run: |
    npm ci
    rm -rf .next out
    npm run build:static
    ls -la out/  # Verify output
```

#### B. Add Deployment Verification
```yaml
- name: Verify deployment
  run: |
    if [ ! -f "out/index.html" ]; then
      echo "Build failed - no index.html found"
      exit 1
    fi
```

## 4. **Azure Static Web Apps Service Issues**

### Problem
Azure service may have regional or temporary issues

### Solutions

#### A. Check Azure Status
- Monitor Azure Service Health
- Check specific region status

#### B. Force Redeploy
```bash
# Trigger new deployment
git commit --allow-empty -m "Force redeploy"
git push origin main
```

## 5. **DNS/CDN Propagation**

### Problem
DNS or CDN changes may not have fully propagated

### Solutions

#### A. Check DNS Propagation
```bash
nslookup bridgingtrust.ai
dig bridgingtrust.ai
```

#### B. Test Direct Azure URL
Test using the direct `*.azurestaticapps.net` URL instead of custom domain

## Immediate Action Items

### 1. Update Cache Configuration
- Modify `staticwebapp.config.json` with shorter cache times
- Add cache-busting headers

### 2. Verify Build Output
- Check that `npm run build:static` produces consistent output
- Ensure all required files are in `out/` directory

### 3. Monitor Deployments
- Check GitHub Actions logs for any warnings
- Verify deployment completion in Azure portal

### 4. Test Systematically
- Test direct Azure URL vs custom domain
- Test from different browsers/devices
- Test with cache disabled

## Prevention Strategies

### 1. Automated Testing
Add deployment verification to CI/CD:
```yaml
- name: Test deployment
  run: |
    sleep 30  # Wait for deployment
    curl -f https://your-site.azurestaticapps.net/ || exit 1
```

### 2. Monitoring
- Set up Azure Application Insights
- Monitor for 404s and failed requests
- Alert on deployment failures

### 3. Staging Environment
- Use staging slots for testing
- Verify changes before production deployment

## Emergency Procedures

### If Site is Down
1. Check Azure portal for service issues
2. Verify GitHub Actions completed successfully
3. Test direct Azure URL
4. Force redeploy if necessary
5. Contact Azure support if service issue

### Quick Fixes
```bash
# Force cache clear and redeploy
git commit --allow-empty -m "Emergency redeploy - cache clear"
git push origin main
```

## Monitoring Commands

```bash
# Check deployment status
curl -I https://bridgingtrust.ai/

# Check Azure direct URL
curl -I https://your-site.azurestaticapps.net/

# Verify build output
ls -la out/
cat out/index.html | head -20
``` 