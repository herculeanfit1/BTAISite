/**
 * Custom Next.js Server
 *
 * This server supports both development and production environments with improved
 * handling of SSL certificates including Let's Encrypt compatibility.
 *
 * Key features:
 * 1. Sets appropriate Content-Type header based on file extension
 * 2. Includes detailed error logging to help diagnose issues
 * 3. Uses standard Node.js http/https module for better compatibility
 * 4. Supports custom hostname configuration
 * 5. Supports both development (self-signed) and production (Let's Encrypt) SSL certificates
 * 6. Falls back to HTTP when in CI environments or when certificates are missing
 * 7. Environment-aware configuration using NODE_ENV and SSL_CERT_ENV
 */
import { createServer as createHttpServer } from 'http';
import { createServer as createHttpsServer } from 'https';
import { parse } from 'url';
import next from 'next';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get current directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Environment configuration
const dev = process.env.NODE_ENV !== "production";
const isCI = process.env.CI === "true";
const sslCertEnv = process.env.SSL_CERT_ENV || "dev"; // 'dev', 'prod', or 'none'
const hostname = process.env.HOST || "0.0.0.0"; // Allow connections from all network interfaces
const port = parseInt(process.env.PORT || "3000", 10);
const httpPort = parseInt(process.env.HTTP_PORT || "3000", 10);
const httpsPort = parseInt(process.env.HTTPS_PORT || "3001", 10); // Use a different port for HTTPS in development
const customHostname = process.env.CUSTOM_HOSTNAME || "dev.bridgingtrust.local";

console.log(`Starting server in ${dev ? 'development' : 'production'} mode`);
console.log(`Using HTTP port: ${httpPort}, HTTPS port: ${httpsPort}`);

/**
 * SSL Certificate Configuration
 * 
 * Three possible configurations:
 * 1. Development: Self-signed certificates (.cert/localhost.pem)
 * 2. Production: Let's Encrypt certificates (/etc/letsencrypt/live/domain)
 * 3. None: HTTP only (CI environments or when certificates are missing)
 */

// Development certificates path (self-signed)
const devCertPath = path.join(__dirname, ".cert");
const hasDevCerts = fs.existsSync(path.join(devCertPath, "localhost-key.pem")) && 
                   fs.existsSync(path.join(devCertPath, "localhost.pem"));

// Production certificates path (Let's Encrypt)
const prodDomain = process.env.DOMAIN || customHostname;
const prodCertPath = `/etc/letsencrypt/live/${prodDomain}`;
const hasProdCerts = fs.existsSync(path.join(prodCertPath, "privkey.pem")) && 
                    fs.existsSync(path.join(prodCertPath, "fullchain.pem"));

// Determine SSL strategy based on environment and available certificates
let useHttps = false;
let httpsOptions = null;

if (isCI || sslCertEnv === "none") {
  // Force HTTP in CI environments
  useHttps = false;
  console.log("Using HTTP (SSL disabled in CI or explicitly set to none)");
} else if (sslCertEnv === "prod" && hasProdCerts) {
  // Use Let's Encrypt certificates in production
  useHttps = true;
  httpsOptions = {
    key: fs.readFileSync(path.join(prodCertPath, "privkey.pem")),
    cert: fs.readFileSync(path.join(prodCertPath, "fullchain.pem")),
  };
  console.log("Using production SSL certificates (Let's Encrypt)");
} else if (hasDevCerts) {
  // Use self-signed certificates in development
  useHttps = true;
  httpsOptions = {
    key: fs.readFileSync(path.join(devCertPath, "localhost-key.pem")),
    cert: fs.readFileSync(path.join(devCertPath, "localhost.pem")),
  };
  console.log("Using development SSL certificates (self-signed)");
} else {
  // Fall back to HTTP when no certificates are available
  useHttps = false;
  console.log("No SSL certificates found, falling back to HTTP");
}

// Initialize Next.js with detailed error handling
try {
  console.log("Initializing Next.js app...");
  // Initialize Next.js
  const app = next({
    dev,
    hostname,
    port,
  });

  const handle = app.getRequestHandler();

  // Start the server after Next.js is ready
  app.prepare().then(() => {
    console.log("Next.js app prepared, starting server...");
    
    // Common request handler function
    function handleRequest(req, res) {
      // Parse the URL to let Next.js handle routing
      const parsedUrl = parse(req.url, true);
      
      if (dev) {
        console.log(`Handling request: ${parsedUrl.pathname}`);
      }

      // Only set Content-Type for HTML responses, let Next.js handle other file types
      const ext = path.extname(parsedUrl.pathname);
      if (!ext || ext === ".html") {
        res.setHeader("Content-Type", "text/html; charset=utf-8");
      }

      // Let Next.js handle the request with detailed error logging
      try {
        handle(req, res, parsedUrl);
      } catch (err) {
        // Log detailed error information to help with debugging
        console.error("Error handling request:", err);
        res.statusCode = 500;
        res.end("Internal Server Error");
      }
    }

    // In development mode, start both HTTP and HTTPS servers if certificates are available
    if (dev && useHttps) {
      // Start HTTPS server
      const httpsServer = createHttpsServer(httpsOptions, handleRequest);
      httpsServer.listen(httpsPort, hostname, (err) => {
        if (err) {
          console.error("Failed to start HTTPS server:", err);
          throw err;
        }
        
        console.log(`> Ready on https://${hostname}:${httpsPort}`);
        console.log(`> You can access HTTPS at https://localhost:${httpsPort}`);
        
        if (sslCertEnv === "dev") {
          console.log(`> You can access the site at https://${customHostname}:${httpsPort}`);
          console.log("> IMPORTANT: Since we're using a self-signed certificate, you may need to:");
          console.log(`> 1. Visit https://${customHostname}:${httpsPort} in your browser`);
          console.log('> 2. Click "Show Details" when prompted about the certificate');
          console.log('> 3. Click "visit this website" and confirm to proceed');
        }
      });
      
      // Start HTTP server as well
      const httpServer = createHttpServer(handleRequest);
      httpServer.listen(httpPort, hostname, (err) => {
        if (err) {
          console.error("Failed to start HTTP server:", err);
          // Don't throw error here, as HTTPS server is already running
        } else {
          console.log(`> Also available on http://${hostname}:${httpPort}`);
          console.log(`> You can access HTTP at http://localhost:${httpPort}`);
        }
      });
      
      // Handle server errors for both servers
      httpsServer.on('error', (err) => {
        console.error('HTTPS server error:', err);
        if (err.code === 'EADDRINUSE') {
          console.error(`Port ${httpsPort} is already in use. Try using a different port.`);
        }
      });
      
      httpServer.on('error', (err) => {
        console.error('HTTP server error:', err);
        if (err.code === 'EADDRINUSE') {
          console.error(`Port ${httpPort} is already in use. Try using a different port.`);
        }
      });
    } else {
      // Create appropriate server based on environment (HTTP only)
      const server = useHttps 
        ? createHttpsServer(httpsOptions, handleRequest)
        : createHttpServer(handleRequest);

      server.listen(port, hostname, (err) => {
        if (err) {
          console.error("Failed to start server:", err);
          throw err;
        }
        
        const protocol = useHttps ? 'https' : 'http';
        console.log(`> Ready on ${protocol}://${hostname}:${port}`);
        console.log(`> You can also access at http://localhost:${port}`);
        
        if (useHttps && sslCertEnv === "dev") {
          console.log(`> You can access the site at https://${customHostname}:${port}`);
          console.log("> IMPORTANT: Since we're using a self-signed certificate, you may need to:");
          console.log(`> 1. Visit https://${customHostname}:${port} in your browser`);
          console.log('> 2. Click "Show Details" when prompted about the certificate');
          console.log('> 3. Click "visit this website" and confirm to proceed');
        }
      });

      // Handle server errors
      server.on('error', (err) => {
        console.error('Server error:', err);
        if (err.code === 'EADDRINUSE') {
          console.error(`Port ${port} is already in use. Try using a different port.`);
          process.exit(1);
        }
      });
    }
  }).catch(err => {
    console.error('Error during app.prepare():', err);
    process.exit(1);
  });

} catch (err) {
  console.error('Critical error during server initialization:', err);
  process.exit(1);
}
