#!/usr/bin/env node

/**
 * Generate Test Report
 *
 * This script combines results from Jest and Playwright tests
 * to create a comprehensive test report.
 */

const fs = require("fs");
const path = require("path");

// Paths to test results
const jestResultsPath = path.join(
  process.cwd(),
  "coverage/coverage-summary.json",
);
const playwrightResultsPath = path.join(
  process.cwd(),
  "test-results/test-results.json",
);
const testReportDir = path.join(process.cwd(), "test-report");

// Create test report directory if it doesn't exist
if (!fs.existsSync(testReportDir)) {
  fs.mkdirSync(testReportDir, { recursive: true });
}

// Function to read a JSON file safely
function readJsonFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
  }
  return null;
}

// Read test results
const jestResults = readJsonFile(jestResultsPath);
const playwrightResults = readJsonFile(playwrightResultsPath);

// Generate summary report
const summary = {
  timestamp: new Date().toISOString(),
  jest: jestResults
    ? {
        coverage: jestResults.total,
        files: Object.keys(jestResults).filter((key) => key !== "total").length,
      }
    : null,
  playwright: playwrightResults
    ? {
        tests: {
          total: playwrightResults.stats?.tests || 0,
          passed: playwrightResults.stats?.passes || 0,
          failed: playwrightResults.stats?.failures || 0,
          flaky: playwrightResults.stats?.flaky || 0,
          skipped: playwrightResults.stats?.skipped || 0,
        },
        duration: playwrightResults.stats?.duration || 0,
      }
    : null,
  environment: {
    os: process.platform,
    nodeVersion: process.version,
    testDate: new Date().toISOString(),
  },
};

// Write summary to file
fs.writeFileSync(
  path.join(testReportDir, "test-summary.json"),
  JSON.stringify(summary, null, 2),
);

// Generate HTML report
const htmlReport = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Test Report - Bridging Trust AI</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    header {
      margin-bottom: 20px;
      border-bottom: 1px solid #eee;
      padding-bottom: 20px;
    }
    h1, h2, h3 {
      color: #2563eb;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    .card {
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .stat {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 10px;
    }
    .passed { color: #22c55e; }
    .failed { color: #ef4444; }
    .skipped { color: #f59e0b; }
    .coverage { color: #3b82f6; }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    table, th, td {
      border: 1px solid #ddd;
    }
    th, td {
      padding: 12px;
      text-align: left;
    }
    th {
      background-color: #f8fafc;
    }
    tr:nth-child(even) {
      background-color: #f1f5f9;
    }
    footer {
      margin-top: 50px;
      text-align: center;
      color: #6b7280;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <header>
    <h1>Bridging Trust AI - Test Report</h1>
    <p>Generated on ${new Date().toLocaleString()}</p>
  </header>

  <main>
    <h2>Test Summary</h2>
    <div class="grid">
      <div class="card">
        <h3>Jest Unit Tests</h3>
        ${
          summary.jest
            ? `
        <div class="stat coverage">${Math.round(summary.jest.coverage.lines.pct)}% Coverage</div>
        <p>Files tested: ${summary.jest.files}</p>
        <p>Statements: ${summary.jest.coverage.statements.pct}%</p>
        <p>Branches: ${summary.jest.coverage.branches.pct}%</p>
        <p>Functions: ${summary.jest.coverage.functions.pct}%</p>
        <p>Lines: ${summary.jest.coverage.lines.pct}%</p>
        `
            : `<p>No Jest results found</p>`
        }
      </div>

      <div class="card">
        <h3>Playwright E2E Tests</h3>
        ${
          summary.playwright
            ? `
        <div class="stat passed">${summary.playwright.tests.passed} / ${summary.playwright.tests.total} Passed</div>
        <p>Failed: <span class="failed">${summary.playwright.tests.failed}</span></p>
        <p>Skipped: <span class="skipped">${summary.playwright.tests.skipped}</span></p>
        <p>Flaky: ${summary.playwright.tests.flaky}</p>
        <p>Duration: ${Math.round(summary.playwright.duration / 1000)}s</p>
        `
            : `<p>No Playwright results found</p>`
        }
      </div>

      <div class="card">
        <h3>Environment</h3>
        <p>OS: ${summary.environment.os}</p>
        <p>Node: ${summary.environment.nodeVersion}</p>
        <p>Test Date: ${new Date(summary.environment.testDate).toLocaleString()}</p>
      </div>
    </div>

    <h2>Coverage Thresholds</h2>
    <table>
      <thead>
        <tr>
          <th>Metric</th>
          <th>Current</th>
          <th>Target</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${
          summary.jest
            ? `
        <tr>
          <td>Statements</td>
          <td>${summary.jest.coverage.statements.pct}%</td>
          <td>70%</td>
          <td>${summary.jest.coverage.statements.pct >= 70 ? "✅" : "❌"}</td>
        </tr>
        <tr>
          <td>Branches</td>
          <td>${summary.jest.coverage.branches.pct}%</td>
          <td>60%</td>
          <td>${summary.jest.coverage.branches.pct >= 60 ? "✅" : "❌"}</td>
        </tr>
        <tr>
          <td>Functions</td>
          <td>${summary.jest.coverage.functions.pct}%</td>
          <td>70%</td>
          <td>${summary.jest.coverage.functions.pct >= 70 ? "✅" : "❌"}</td>
        </tr>
        <tr>
          <td>Lines</td>
          <td>${summary.jest.coverage.lines.pct}%</td>
          <td>70%</td>
          <td>${summary.jest.coverage.lines.pct >= 70 ? "✅" : "❌"}</td>
        </tr>
        `
            : `
        <tr>
          <td colspan="4">No coverage data available</td>
        </tr>
        `
        }
      </tbody>
    </table>
  </main>

  <footer>
    <p>Bridging Trust AI - Testing Suite</p>
  </footer>
</body>
</html>
`;

fs.writeFileSync(path.join(testReportDir, "index.html"), htmlReport);

console.log(
  `Test report generated at ${path.join(testReportDir, "index.html")}`,
);

// Make the script executable
try {
  fs.chmodSync(__filename, "755");
} catch (error) {
  // Ignore errors on platforms that don't support chmod
}
