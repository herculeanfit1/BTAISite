/**
 * Post-Static Export Enhancement Script
 * 
 * This script runs all the improvement scripts after the static export is generated.
 */

import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const cwd = process.cwd();

// Create a log file
const logFile = path.join(cwd, 'post-export-log.txt');
fs.writeFileSync(logFile, `Post-Static Export Log - ${new Date().toISOString()}\n\n`, 'utf8');

// Helper function to run a script and log the output
function runScript(scriptPath, description) {
  console.log(`\n🔄 ${description}...`);
  fs.appendFileSync(logFile, `\n\n----- ${description} -----\n`, 'utf8');
  
  try {
    const output = execSync(`node ${scriptPath}`, { 
      encoding: 'utf8',
      maxBuffer: 5 * 1024 * 1024 // Increase buffer size to 5MB
    });
    
    console.log(`✅ ${description} completed successfully`);
    fs.appendFileSync(logFile, output, 'utf8');
    return true;
  } catch (error) {
    console.error(`❌ Error during ${description}:`);
    console.error(error.message);
    
    fs.appendFileSync(logFile, `ERROR: ${error.message}\n`, 'utf8');
    if (error.stdout) {
      fs.appendFileSync(logFile, error.stdout, 'utf8');
    }
    if (error.stderr) {
      fs.appendFileSync(logFile, error.stderr, 'utf8');
    }
    
    return false;
  }
}

// Main execution
console.log('🚀 Starting post-static export enhancements...');

// 1. Fix ESLint warnings - needs to be done before the build
runScript('scripts/fix-linting.js', 'Fixing ESLint warnings');

// 2. Create a directory for the Azure Functions
console.log('\n📝 Creating Azure Function for contact form handling...');
const azureFunctionPath = path.join(cwd, 'azure-functions');

if (!fs.existsSync(azureFunctionPath)) {
  fs.mkdirSync(azureFunctionPath, { recursive: true });
}

// Create a basic Azure Function for handling form submissions
const contactFormFunctionPath = path.join(azureFunctionPath, 'contact-form');
fs.mkdirSync(contactFormFunctionPath, { recursive: true });

// function.json
const functionJson = `{
  "bindings": [
    {
      "authLevel": "anonymous",
      "type": "httpTrigger",
      "direction": "in",
      "name": "req",
      "methods": ["post"],
      "route": "contact"
    },
    {
      "type": "http",
      "direction": "out",
      "name": "res"
    },
    {
      "type": "sendGrid",
      "name": "message",
      "direction": "out",
      "apiKey": "SENDGRID_API_KEY",
      "from": "%SENDER_EMAIL_ADDRESS%",
      "to": "%RECIPIENT_EMAIL_ADDRESS%"
    }
  ]
}`;

fs.writeFileSync(
  path.join(contactFormFunctionPath, 'function.json'),
  functionJson,
  'utf8'
);

// index.js
const indexJs = `module.exports = async function (context, req) {
  context.log('Processing contact form submission');

  if (!req.body) {
    context.res = {
      status: 400,
      body: { message: "Please provide form data in the request body" }
    };
    return;
  }

  const { name, email, message, subject } = req.body;

  // Validate required fields
  if (!name || !email || !message) {
    context.res = {
      status: 400,
      body: { message: "Name, email, and message are required fields" }
    };
    return;
  }

  // Basic email validation
  const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
  if (!emailRegex.test(email)) {
    context.res = {
      status: 400,
      body: { message: "Please provide a valid email address" }
    };
    return;
  }

  // Set up the email
  context.bindings.message = {
    subject: subject || \`New contact form submission from \${name}\`,
    content: [{
      type: 'text/html',
      value: \`
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> \${name}</p>
        <p><strong>Email:</strong> \${email}</p>
        <p><strong>Message:</strong></p>
        <p>\${message.replace(/\\n/g, '<br>')}</p>
        <hr>
        <p><em>This email was sent from the Bridging Trust AI website contact form.</em></p>
      \`
    }]
  };

  // Return a success response
  context.res = {
    status: 200,
    headers: {
      "Content-Type": "application/json"
    },
    body: { message: "Your message has been sent successfully!" }
  };
};`;

fs.writeFileSync(
  path.join(contactFormFunctionPath, 'index.js'),
  indexJs,
  'utf8'
);

// Create a package.json file for the function
const packageJson = `{
  "name": "bridging-trust-ai-contact-form",
  "version": "1.0.0",
  "description": "Azure Function for handling Bridging Trust AI contact form submissions",
  "main": "index.js",
  "scripts": {
    "test": "echo \\"Error: no test specified\\" && exit 1"
  },
  "dependencies": {
    "@azure/functions": "^3.5.0"
  }
}`;

fs.writeFileSync(
  path.join(contactFormFunctionPath, 'package.json'),
  packageJson,
  'utf8'
);

console.log('✅ Azure Function for contact form created');

// Generate deployment documentation
const deploymentDocs = `# Deploying the Static Website and Azure Functions

This document outlines the steps to deploy the Bridging Trust AI website and its associated Azure Functions.

## Static Website Deployment

### Option 1: Azure Static Web Apps

1. **Create an Azure Static Web App**
   - Go to the Azure Portal
   - Create a new Static Web App resource
   - Connect to your GitHub repository
   - Build configuration:
     - Build Preset: Custom
     - App location: /
     - Output location: out
     - API location: azure-functions

2. **Configure environment variables**
   - In the Azure Portal, navigate to your Static Web App
   - Go to Configuration > Application Settings
   - Add any necessary environment variables

### Option 2: Any Static Web Host

You can deploy the static files from the \`out\` directory to any static web host:

- Netlify
- Vercel
- GitHub Pages
- Amazon S3
- Azure Blob Storage

## Azure Function Deployment

If you're not using Azure Static Web Apps, you'll need to deploy the Azure Functions separately:

1. **Install Azure Functions Core Tools**
   \`\`\`
   npm install -g azure-functions-core-tools@4
   \`\`\`

2. **Create a Function App in Azure Portal**

3. **Deploy the functions from the command line**
   \`\`\`
   cd azure-functions
   func azure functionapp publish YOUR_FUNCTION_APP_NAME
   \`\`\`

4. **Configure CORS in Azure Portal**
   - Go to your Function App
   - Go to CORS settings
   - Add your website domain to the allowed origins

5. **Add environment variables**
   - Go to Configuration > Application Settings
   - Add:
     - SENDGRID_API_KEY: Your SendGrid API key
     - SENDER_EMAIL_ADDRESS: The email address to send from
     - RECIPIENT_EMAIL_ADDRESS: The email address to send to

## Testing the Deployment

After deployment:

1. Visit your website
2. Test the contact form
3. Check that form submissions are being sent via email

## Troubleshooting

- If the contact form isn't working, check the Function App logs
- Verify that CORS is configured correctly
- Confirm all environment variables are set properly
`;

fs.writeFileSync(
  path.join(azureFunctionPath, 'deployment.md'),
  deploymentDocs,
  'utf8'
);

console.log('✅ Deployment documentation created');

// Now that we have built the site and created the Azure Function, run the image optimization and browser compatibility scripts
// 3. Optimize the images - this will process the static output
runScript('scripts/optimize-images.js', 'Optimizing images');

// 4. Enhance browser compatibility - this will process the static output
runScript('scripts/enhance-browser-compat.js', 'Enhancing cross-browser compatibility');

// Final message
console.log('\n🎉 Post-static export enhancements completed!');
console.log('📝 Log file created at: post-export-log.txt');
console.log('\n🔍 Next steps:');
console.log('  1. Run the optimized static site: npx serve out');
console.log('  2. Check browser compatibility across different devices');
console.log('  3. Follow the deployment documentation in azure-functions/deployment.md'); 