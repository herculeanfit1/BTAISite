/**
 * Safari-compatible Next.js Server
 *
 * This server is specially configured to work with Safari by:
 * 1. Using 'localhost' instead of '0.0.0.0' for the hostname
 * 2. Setting appropriate CORS headers to allow Safari connections
 * 3. Setting proper Content-Type headers for all response types
 * 4. Disabling HTTP/2 which can cause issues with Safari
 */
const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const path = require("path");

// Configure Next.js based on environment
const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost"; // Use 'localhost' instead of '0.0.0.0'
const port = 8081; // Use port 8081 to avoid conflicts

// Initialize Next.js
const app = next({
  dev,
  hostname,
  port,
});

const handle = app.getRequestHandler();

// Start the server after Next.js is ready
app.prepare().then(() => {
  createServer((req, res) => {
    // Add CORS headers for Safari
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, OPTIONS, PUT, PATCH, DELETE",
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "X-Requested-With,content-type",
    );

    // Handle preflight requests
    if (req.method === "OPTIONS") {
      res.writeHead(200);
      res.end();
      return;
    }

    // Parse the URL to let Next.js handle routing
    const parsedUrl = parse(req.url, true);
    console.log(`Handling request: ${req.url}`);

    // Set Content-Type based on extension
    const ext = path.extname(parsedUrl.pathname);
    if (!ext || ext === ".html") {
      res.setHeader("Content-Type", "text/html; charset=utf-8");
    } else if (ext === ".js") {
      res.setHeader("Content-Type", "application/javascript; charset=UTF-8");
    } else if (ext === ".css") {
      res.setHeader("Content-Type", "text/css; charset=UTF-8");
    } else if (ext === ".json") {
      res.setHeader("Content-Type", "application/json; charset=UTF-8");
    } else if (ext === ".svg") {
      res.setHeader("Content-Type", "image/svg+xml");
    }

    // Let Next.js handle the request with detailed error logging
    try {
      handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error handling request:", err);
      res.statusCode = 500;
      res.end("Internal Server Error");
    }
  }).listen(port, hostname, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log("> Server optimized for Safari compatibility");
  });
});
