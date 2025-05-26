/**
 * Type definitions for test utilities
 */

// Visual regression test variant type
interface VisualRegressionTestVariant {
  name: string;
  setup?: () => Promise<void>;
  cleanup?: () => Promise<void>;
  threshold?: number;
  page?: any;
}

// Type for testVisualRegression function with variants support
interface TestVisualRegressionOptions {
  page: any;
  name: string;
  variants?: VisualRegressionTestVariant[];
  defaultThreshold?: number;
}

// Expanded TestCase interface with page parameter support
interface TestCase {
  name: string;
  url: string;
  waitForSelector?: string;
  page?: any;
}

// declare module for text content tests
declare module 'text-content-tests' {
  export function testTextContent(testCase: TestCase, expectedTexts: string[]): Promise<void>;
}

// Type declarations for performance metrics
interface PerformanceMetrics {
  ttfb?: number;
  fcp?: number;
  lcp?: number;
  cls?: number;
  fid?: number;
} 