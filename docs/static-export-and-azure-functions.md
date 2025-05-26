# Static Export and Azure Functions Integration

This document explains our approach to using a static export of our Next.js site with Azure Functions for form processing.

## Static Export Architecture

Our website is built as a static export, which means all pages are pre-rendered to static HTML, CSS, and JavaScript files. This approach provides several benefits:

1. **Enhanced Security**: No server-side code execution, minimizing attack vectors
2. **Improved Performance**: Pre-rendered HTML loads faster than server-rendered pages
3. **Reduced Costs**: Static hosting is significantly cheaper than running a Node.js server
4. **Simplified Deployment**: No runtime dependencies or server configuration needed
5. **Unlimited Scalability**: Static files can be served from CDNs with virtually unlimited capacity

## Form Processing with Azure Functions

While static sites have many advantages, they cannot process forms directly. We use Azure Functions as serverless compute to handle our contact form submissions:

### Architecture:

```
[Static Website] → [Contact Form] → [Azure Function] → [Email Notification]
```

### Benefits:

1. **Pay-per-execution**: We only pay for the actual form submissions processed
2. **Enhanced Security**: Form processing code is isolated from the main site
3. **Easy Scaling**: Functions auto-scale based on demand
4. **Simplified Maintenance**: Functions can be updated independently of the website

## Implementation

### Azure Function Details

We've created a serverless function for handling form submissions:

- **Location**: `azure-functions/contact-form/`
- **Technology**: Node.js Azure Function
- **Integration**: SendGrid for email delivery
- **Security**: Input validation and sanitization

### Contact Form Integration

The contact form on our website is configured to submit data to the Azure Function endpoint:

```javascript
// Example integration code
const submitForm = async (formData) => {
  try {
    const response = await fetch('https://your-function-app.azurewebsites.net/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });
    
    const data = await response.json();
    return { success: true, message: data.message };
  } catch (error) {
    return { success: false, message: 'Failed to submit form' };
  }
};
```

## Local Development Setup

To test the form functionality during local development:

1. **Install Azure Functions Core Tools**:
   ```
   npm install -g azure-functions-core-tools@4
   ```

2. **Start the local function emulator**:
   ```
   cd azure-functions
   func start
   ```

3. **Run the static site**:
   ```
   npm run build:static
   npx serve out
   ```

## Cross-Browser Compatibility

Since we're using a static export, we've implemented additional measures to ensure cross-browser compatibility:

1. **Vendor Prefixes**: Added via Autoprefixer to ensure CSS works across browsers
2. **Polyfills**: Core JavaScript polyfills for older browsers
3. **NoJS Fallbacks**: Basic functionality for users with JavaScript disabled
4. **Responsive Design**: Works across all device sizes and orientations

## Image Optimization

Next.js's built-in Image Optimization isn't available in static exports, so we:

1. **Pre-optimize images** during the build process
2. **Serve multiple resolutions** for different screen sizes
3. **Use modern formats** like WebP with JPEG fallbacks
4. **Set appropriate caching headers** for static assets

## Security Enhancements

Our static export approach has allowed additional security hardening:

1. **Content Security Policy**: Strict CSP headers to prevent XSS attacks
2. **Immutable Content**: Static files that can't be modified at runtime
3. **Reduced Attack Surface**: No server-side code execution on the main site
4. **Strict CORS Policy**: Azure Functions with controlled cross-origin access

## Deployment Process

The deployment process for our static site and Azure Functions:

1. **Build the enhanced static site**:
   ```
   npm run build:enhanced-static
   ```

2. **Deploy the static site** to your hosting provider (Azure Static Web Apps, Netlify, etc.)

3. **Deploy the Azure Functions**:
   ```
   cd azure-functions
   func azure functionapp publish YOUR_FUNCTION_APP_NAME
   ```

## Testing and Validation

Before deployment, we test:

1. **Form Submission**: Verify form data reaches the Azure Function correctly
2. **Email Delivery**: Confirm notifications are sent to the right recipients
3. **Error Handling**: Test form validation and error conditions
4. **Cross-Browser Testing**: Verify functionality in all major browsers
5. **Performance**: Measure load times and optimize as needed

## Monitoring and Maintenance

After deployment:

1. **Azure Function Logs**: Monitor for errors or suspicious activity
2. **Analytics**: Track form submission rates and errors
3. **Regular Updates**: Keep dependencies up-to-date for security
4. **Performance Monitoring**: Check load times and optimize as needed

## Conclusion

This hybrid approach of a static website with serverless functions provides the best of both worlds: the security, performance, and cost benefits of static sites combined with the dynamic capabilities of serverless computing for form processing. 