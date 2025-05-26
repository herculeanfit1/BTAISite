/**
 * Responsive test utilities for viewport testing
 */
import { vi } from "vitest";
import { act } from "react";

// Add declaration for IS_REACT_ACT_ENVIRONMENT to Window interface
declare global {
  interface Window {
    IS_REACT_ACT_ENVIRONMENT?: boolean;
  }
}

// Ensure React act environment is enabled
if (typeof window !== 'undefined') {
  window.IS_REACT_ACT_ENVIRONMENT = true;
}

// Safe wrapper for act that works in any environment
const safeAct = (callback: () => void) => {
  try {
    // First check if we're in a test environment
    if (typeof window !== 'undefined' && window.IS_REACT_ACT_ENVIRONMENT) {
      act(callback);
    } else {
      // If act is not available or causes errors, just run the callback
      callback();
    }
  } catch (e) {
    // Fallback if act throws an error
    console.warn('Could not use React.act(), running callback directly');
    callback();
  }
};

// Viewport size presets
export const VIEWPORT_SIZES = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1280, height: 800 },
};

// Default global window dimensions
const DEFAULT_WINDOW_DIMENSIONS = {
  width: 1280,
  height: 800,
};

/**
 * Set up a mock for window.matchMedia and resize the window for responsive tests
 * @param viewport - The viewport size to use ('mobile', 'tablet', 'desktop' or custom dimensions)
 */
export const setupResponsiveTest = (
  viewport: keyof typeof VIEWPORT_SIZES | { width: number; height: number },
) => {
  // Get dimensions based on the viewport preset or use custom dimensions
  const dimensions =
    typeof viewport === "string" ? VIEWPORT_SIZES[viewport] : viewport;

  // Store original dimensions
  const originalInnerWidth = window.innerWidth;
  const originalInnerHeight = window.innerHeight;

  // Mock window.matchMedia
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: matchMediaQueryToViewport(query, dimensions),
      media: query,
      onchange: null,
      addListener: vi.fn(), // Deprecated but kept for compatibility
      removeListener: vi.fn(), // Deprecated but kept for compatibility
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  // Update window dimensions
  Object.defineProperty(window, "innerWidth", {
    writable: true,
    value: dimensions.width,
  });

  Object.defineProperty(window, "innerHeight", {
    writable: true,
    value: dimensions.height,
  });

  // Trigger a resize event using our safe act wrapper
  safeAct(() => {
    global.dispatchEvent(new Event("resize"));
  });

  // Return a function to restore original dimensions
  return () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      value: originalInnerWidth,
    });

    Object.defineProperty(window, "innerHeight", {
      writable: true,
      value: originalInnerHeight,
    });

    safeAct(() => {
      global.dispatchEvent(new Event("resize"));
    });
  };
};

/**
 * Clean up responsive test mocks and restore window dimensions
 */
export const cleanupTests = () => {
  vi.resetAllMocks();
  
  // Reset to default window dimensions
  Object.defineProperty(window, "innerWidth", {
    writable: true,
    value: DEFAULT_WINDOW_DIMENSIONS.width,
  });

  Object.defineProperty(window, "innerHeight", {
    writable: true,
    value: DEFAULT_WINDOW_DIMENSIONS.height,
  });

  // Clean up matchMedia mock
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  // Trigger a resize event
  safeAct(() => {
    global.dispatchEvent(new Event("resize"));
  });
};

/**
 * Helper to determine if a media query matches the current viewport
 */
function matchMediaQueryToViewport(
  query: string,
  dimensions: { width: number; height: number },
): boolean {
  // Parse common media queries
  const minWidthMatch = query.match(/\(min-width:\s*(\d+)px\)/);
  const maxWidthMatch = query.match(/\(max-width:\s*(\d+)px\)/);

  if (minWidthMatch && maxWidthMatch) {
    const minWidth = parseInt(minWidthMatch[1], 10);
    const maxWidth = parseInt(maxWidthMatch[1], 10);
    return dimensions.width >= minWidth && dimensions.width <= maxWidth;
  }

  if (minWidthMatch) {
    const minWidth = parseInt(minWidthMatch[1], 10);
    return dimensions.width >= minWidth;
  }

  if (maxWidthMatch) {
    const maxWidth = parseInt(maxWidthMatch[1], 10);
    return dimensions.width <= maxWidth;
  }

  return false;
}
