/**
 * Global type declarations for fixing third-party module type issues
 */

// Fix for happy-dom private field errors
declare module 'happy-dom' {
  // Re-export with proper types
  export * from 'happy-dom/lib/index';

  // Override problematic types
  export interface HTMLInputElement extends HTMLElement {
    validationMessage: string;
    validity: ValidityState;
    value: string;
  }
}

// Augment performance API types for Web Vitals metrics
interface PerformanceEntry {
  // Add missing properties used in performance tests
  hadRecentInput?: boolean;
  value?: number;
}

// Add missing types for performance navigation
interface PerformanceNavigationTiming extends PerformanceEntry {
  responseStart: number;
  domContentLoadedEventEnd: number;
  loadEventEnd: number;
}

// Define types for missing global declarations
interface HeadersIterator<T> {
  next(): IteratorResult<T>;
  [Symbol.iterator](): HeadersIterator<T>;
}

// Add missing Lighthouse types for testing
interface LighthouseConfig {
  extends?: string | string[];
  settings?: {
    formFactor?: 'mobile' | 'desktop';
    throttling?: {
      cpuSlowdownMultiplier?: number;
      [key: string]: any;
    };
    screenEmulation?: {
      mobile?: boolean;
      width?: number;
      height?: number;
      deviceScaleFactor?: number;
      [key: string]: any;
    };
    [key: string]: any;
  };
  [key: string]: any;
}

interface MapIterator<T> {
  next(): IteratorResult<T>;
  [Symbol.iterator](): MapIterator<T>;
}

// Fix for IS_REACT_ACT_ENVIRONMENT in window object
interface Window {
  IS_REACT_ACT_ENVIRONMENT?: boolean;
} 