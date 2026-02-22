/**
 * Type definitions for test utilities
 */

// Visual regression test variant type
interface VisualRegressionTestVariant {
  name: string;
  setup?: () => Promise<void>;
  cleanup?: () => Promise<void>;
  threshold?: number;
  page?: import("@playwright/test").Page;
}

// Type for testVisualRegression function with variants support
interface TestVisualRegressionOptions {
  page: import("@playwright/test").Page;
  name: string;
  variants?: VisualRegressionTestVariant[];
  defaultThreshold?: number;
}

// Expanded TestCase interface with page parameter support
interface TestCase {
  name: string;
  url: string;
  waitForSelector?: string;
  page?: import("@playwright/test").Page;
}

// declare module for text content tests
declare module "text-content-tests" {
  export function testTextContent(
    testCase: TestCase,
    expectedTexts: string[]
  ): Promise<void>;
}

// Type declarations for performance metrics
interface PerformanceMetrics {
  ttfb?: number;
  fcp?: number;
  lcp?: number;
  cls?: number;
  fid?: number;
}
