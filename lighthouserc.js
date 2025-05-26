module.exports = {
  ci: {
    collect: {
      url: ["http://localhost:3000/"],
      staticDistDir: "./.next",
      numberOfRuns: 3,
      settings: {
        preset: "desktop",
        onlyCategories: [
          "performance",
          "accessibility",
          "best-practices",
          "seo",
        ],
        skipAudits: ["uses-http2"],
      },
    },
    upload: {
      target: "filesystem",
      outputDir: "./.lighthouseci",
    },
    assert: {
      preset: "lighthouse:recommended",
      assertions: {
        "categories:performance": ["warn", { minScore: 0.8 }],
        "categories:accessibility": ["warn", { minScore: 0.9 }],
        "categories:best-practices": ["warn", { minScore: 0.85 }],
        "categories:seo": ["warn", { minScore: 0.9 }],
        "first-contentful-paint": ["warn", { maxNumericValue: 3000 }],
        interactive: ["warn", { maxNumericValue: 5000 }],
        "max-potential-fid": ["warn", { maxNumericValue: 300 }],
        "cumulative-layout-shift": ["warn", { maxNumericValue: 0.1 }],
        "largest-contentful-paint": ["warn", { maxNumericValue: 2500 }],
        "first-meaningful-paint": ["warn", { maxNumericValue: 3000 }],
        "total-blocking-time": ["warn", { maxNumericValue: 300 }],
        "uses-http2": "off",
        "render-blocking-resources": "off",
        "uses-responsive-images": "warn",
        "offscreen-images": "warn",
        "unused-javascript": "warn",
        "modern-image-formats": "warn",
      },
    },
  },
};
