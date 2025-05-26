/**
 * Test utilities for Bridging Trust AI components
 *
 * This file contains helper functions for testing React components,
 * particularly those with responsive behavior and Safari-specific adaptations.
 */

import { vi, type Mock } from "vitest";
import * as React from "react";

// Add JSX namespace for TypeScript
declare global {
  namespace JSX {
    interface IntrinsicElements {
      div: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
    }
  }
}

/**
 * Mock the window's innerWidth property to simulate different viewport sizes
 *
 * @param width - The simulated viewport width
 */
export const setWindowWidth = (width: number): void => {
  Object.defineProperty(window, "innerWidth", {
    writable: true,
    configurable: true,
    value: width,
  });
  window.dispatchEvent(new Event("resize"));
};

/**
 * Mock the matchMedia API for testing responsive designs
 *
 * @returns A mocked implementation of window.matchMedia
 */
export const mockMatchMedia = (): Mock => {
  return vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
};

/**
 * Convert viewport sizes to device categories
 *
 * @param width - Viewport width in pixels
 * @returns The corresponding device category
 */
export const getDeviceCategory = (width: number): string => {
  if (width < 640) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
};

/**
 * Setup responsive testing environment
 *
 * @param deviceCategory - 'mobile', 'tablet', or 'desktop'
 */
export const setupResponsiveTest = (deviceCategory: string): void => {
  // Define viewport widths for different device categories
  const viewportWidths = {
    mobile: 375,
    tablet: 768,
    desktop: 1280,
  };

  // Set window width based on device category
  const width =
    viewportWidths[deviceCategory as keyof typeof viewportWidths] || 1024;
  setWindowWidth(width);

  // Mock matchMedia API
  window.matchMedia = mockMatchMedia();
};

/**
 * Mock SVG icons rendering
 * This allows tests to run without needing to parse SVG content
 */
export const mockSvgIcons = async (): Promise<void> => {
  // Define the feature interface
  interface Feature {
    id: string;
    icon: React.ReactNode;
    [key: string]: any;
  }

  // Create a mock implementation for SVG component rendering
  vi.mock("../../app/vercel-safari/page", () => {
    // Mock up a simple feature array with icons
    const mockFeatures = [
      {
        id: "feature1",
        title: "Feature 1",
        description: "Description 1",
        icon: React.createElement(
          "div",
          { "data-testid": "icon-feature1" },
          "Icon"
        ),
      },
      {
        id: "feature2",
        title: "Feature 2",
        description: "Description 2",
        icon: React.createElement(
          "div",
          { "data-testid": "icon-feature2" },
          "Icon"
        ),
      },
    ];
    
    return {
      features: mockFeatures,
    };
  });
};

/**
 * Clean up all mocks and customizations after tests
 */
export const cleanupTests = (): void => {
  vi.clearAllMocks();
  vi.resetModules();
};

/**
 * Common test utilities for all tests
 */

/**
 * Utility to wait for a specified time in milliseconds
 */
export const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Creates a mock IntersectionObserver for testing components that use it
 */
export function mockIntersectionObserver(): Mock {
  const intersectionObserverMock = vi.fn();
  intersectionObserverMock.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null,
  });
  window.IntersectionObserver = intersectionObserverMock as unknown as typeof IntersectionObserver;
  return intersectionObserverMock;
}

/**
 * Mocks the fetch API for testing components that use it
 */
export function mockFetch(data: unknown, status = 200): any {
  return vi.spyOn(global, "fetch").mockImplementation(() =>
    Promise.resolve({
      json: () => Promise.resolve(data),
      text: () => Promise.resolve(JSON.stringify(data as any)),
      ok: status >= 200 && status < 300,
      status,
      headers: new Headers(),
    } as Response),
  );
}

// Re-export responsive test utilities
export * from "./responsive-test-utils";
