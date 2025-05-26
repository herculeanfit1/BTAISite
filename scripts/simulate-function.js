#!/usr/bin/env node

/**
 * simulate-function.js
 * 
 * This script simulates the Azure Function environment locally
 * to help diagnose any issues with the email sending functionality.
 */

// Import Resend - since we're using ES modules in the project
import { Resend } from 'resend';

// Mock context for logging
const context = {
  log: console.log,
  log: {
    info: console.log,
    error: console.error,
    warn: console.warn
  }
};

// Simple HTML sanitization to prevent XSS
function sanitizeHtml(text) {
  if (!text) return "";
  return text
    .toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function simulateFunction() {
  // Use command line arguments for API key
  const apiKey = process.argv[2];
  
  if (!apiKey) {
    console.error('Please provide an API key as the first argument');
    console.error('Usage: node simulate-function.js YOUR_API_KEY');
    process.exit(1);
  }
  
  // Simulate a request
  const req = {
    body: {
      name: "Test User",
      email: "test@example.com",
      company: "Test Company",
      message: "This is a simulated test message"
    }
  };
  
  console.log("📧 Simulating function with request:", req.body);
  
  try {
    // Initialize Resend with API key
    const resend = new Resend(apiKey);
    
    // Extract form fields
    const { name, email, message, company } = req.body;
    
    // Format email content
    const htmlContent = `
      <html>
        <body>
          <h1>New Contact Form Submission</h1>
          <p><strong>Name:</strong> ${sanitizeHtml(name)}</p>
          <p><strong>Email:</strong> ${sanitizeHtml(email)}</p>
          ${company ? `<p><strong>Company:</strong> ${sanitizeHtml(company)}</p>` : ""}
          <h2>Message:</h2>
          <p>${sanitizeHtml(message).replace(/\n/g, "<br>")}</p>
        </body>
      </html>
    `;
    
    const textContent = `
      New Contact Form Submission
      
      Name: ${name}
      Email: ${email}
      ${company ? `Company: ${company}\n` : ""}
      
      Message:
      ${message}
    `;
    
    console.log("📤 Attempting to send to onboarding@resend.dev...");
    
    // Send email using Resend's test email
    const { data, error } = await resend.emails.send({
      from: "no-reply@bridgingtrust.ai",
      to: "onboarding@resend.dev",
      subject: `Contact Form: ${name}`,
      html: htmlContent,
      text: textContent,
      reply_to: email,
    });
    
    if (error) {
      console.error("❌ Error from Resend API:", error);
      return;
    }
    
    console.log("✅ Email sent successfully!");
    console.log("📨 Email ID:", data.id);
    
  } catch (error) {
    console.error("💥 Unexpected error:", error);
  }
}

// Run simulation
simulateFunction(); 