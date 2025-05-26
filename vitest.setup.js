import React from "react";
import "@testing-library/jest-dom";
import { vi } from "vitest";
import './__tests__/utils/ci-test-mode.js';  // Import CI test mode

// Polyfill for TextEncoder/TextDecoder for React 19
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = class TextEncoder {
    encode(text) {
      const buff = new Uint8Array(text.length);
      for (let i = 0; i < text.length; i++) {
        buff[i] = text.charCodeAt(i);
      }
      return buff;
    }
  };
}

if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = class TextDecoder {
    decode(arr) {
      return String.fromCharCode.apply(null, arr);
    }
  };
}

// Mock Next.js router
vi.mock("next/router", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    pathname: "/",
    query: {},
  }),
}));

// Mock next/image
vi.mock("next/image", () => ({
  __esModule: true,
  default: ({ src, alt, priority, blurDataURL, fill, ...props }) => {
    // Handle booleans properly for React 19
    return React.createElement("img", {
      src,
      alt,
      "data-testid": "next-image",
      "data-priority": priority ? "true" : "false",
      "data-blur": blurDataURL ? "true" : "false",
      "data-fill": fill ? "true" : "false",
      ...props
    });
  },
}));

// Mock next/server
vi.mock("next/server", () => {
  const headers = new Map();
  
  class MockNextResponse {
    constructor(body, init) {
      this.body = body;
      this.status = init?.status || 200;
      this.headers = headers;
    }

    async json() {
      return this.body;
    }
  }

  return {
    NextResponse: {
      json: vi.fn().mockImplementation((body, init) => {
        return new MockNextResponse(body, init);
      }),
      next: vi.fn().mockImplementation(() => {
        return { headers };
      })
    },
    NextRequest: vi.fn()
  };
});

// Mock Web API used by Next.js App Router
if (typeof global.Request === "undefined") {
  global.Request = class Request {};
}

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => ({
    get: (key) => null,
    getAll: (key) => [],
    has: (key) => false,
  }),
  usePathname: () => "/",
}));

// Add MessageChannel polyfill for React testing
if (typeof global.MessageChannel === 'undefined') {
  global.MessageChannel = class {
    port1;
    port2;
    
    constructor() {
      this.port1 = {
        onmessage: null,
        postMessage: vi.fn(),
        close: vi.fn(),
      };
      this.port2 = {
        onmessage: null,
        postMessage: vi.fn(),
        close: vi.fn(),
      };
    }
  };
}

// React 19 requires scheduler/tracing
vi.mock('scheduler/tracing', () => ({
  __interactionsRef: { current: new Set() },
  __subscriberRef: { current: null },
  unstable_clear: vi.fn(),
  unstable_getCurrent: vi.fn(() => new Set()),
  unstable_getThreadID: vi.fn(() => 0),
  unstable_trace: vi.fn((name, timestamp, callback) => callback()),
  unstable_wrap: vi.fn(callback => callback),
  unstable_subscribe: vi.fn(),
  unstable_unsubscribe: vi.fn(),
}));

// Additional helpers for DOM testing
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Better stub methods on document.documentElement.classList to avoid errors in theme tests
if (document.documentElement) {
  // Create a more robust mock for classList
  const mockClassList = {
    add: vi.fn(),
    remove: vi.fn(),
    toggle: vi.fn().mockReturnValue(true),
    contains: vi.fn().mockImplementation((className) => {
      // Default implementation for contains
      if (className === "dark") {
        return false; // Default to light theme
      }
      return false;
    }),
  };
  
  // Apply the mocks using defineProperty to avoid errors
  Object.defineProperty(document.documentElement, 'classList', {
    writable: true,
    value: mockClassList
  });
}

// Prevent real network requests by mocking fetch API
global.fetch = vi.fn().mockImplementation((url) => {
  console.log(`[mocked] Fetch request to: ${url}`);
  return Promise.resolve({
    ok: true,
    status: 200,
    statusText: 'OK',
    headers: new Headers({ 'Content-Type': 'application/json' }),
    json: async () => ({ success: true, data: [], message: 'This is a mocked response' }),
    text: async () => '<div>Mocked HTML response</div>',
  });
});

// Skip Node.js specific mocks in browser environment
// This prevents errors when running in happy-dom (browser-like) environment
if (typeof process !== 'undefined' && process.versions?.node) {
  console.log("Setting up Node.js specific mocks");
  
  // Import Node modules dynamically only in Node environment
  import('node:http').then(httpModule => {
    const http = httpModule.default || httpModule;
    
    // Create a robust mock to handle all network events
    const createMockEventEmitter = () => {
      const handlers = {};
      
      return {
        on: vi.fn().mockImplementation(function(event, handler) {
          if (!handlers[event]) {
            handlers[event] = [];
          }
          handlers[event].push(handler);
          return this;
        }),
        emit: function(event, ...args) {
          if (handlers[event]) {
            handlers[event].forEach(handler => handler(...args));
          }
          return true;
        },
        removeAllListeners: vi.fn().mockImplementation(function() {
          return this;
        })
      };
    };
    
    // Mock client request with comprehensive event handling
    const mockClientRequest = {
      ...createMockEventEmitter(),
      end: vi.fn().mockImplementation(function() { 
        setTimeout(() => {
          this.emit('response', createMockResponse());
        }, 0);
        return this; 
      }),
      write: vi.fn().mockImplementation(function() { return this; }),
      abort: vi.fn().mockImplementation(function() { return this; }),
      setTimeout: vi.fn().mockImplementation(function() { return this; }),
      setHeader: vi.fn().mockImplementation(function() { return this; }),
      getHeader: vi.fn().mockImplementation(function() { return 'mock-header-value'; }),
      removeHeader: vi.fn().mockImplementation(function() { return this; }),
    };
    
    // Create a mock response that properly emits events
    const createMockResponse = () => {
      const mockResponse = {
        ...createMockEventEmitter(),
        statusCode: 200,
        statusMessage: 'OK',
        headers: {},
        resume: vi.fn(),
        destroy: vi.fn(),
        pipe: vi.fn().mockImplementation(function() { return this; }),
      };
      
      setTimeout(() => {
        mockResponse.emit('data', Buffer.from(JSON.stringify({ mocked: true })));
        mockResponse.emit('end');
      }, 0);
      
      return mockResponse;
    };
    
    // Only mock if http.request exists and is a function
    if (http && typeof http.request === 'function') {
      vi.spyOn(http, 'request').mockImplementation((options, callback) => {
        const mockReq = { ...mockClientRequest };
        
        if (typeof callback === 'function') {
          setTimeout(() => {
            callback(createMockResponse());
          }, 0);
        }
        
        return mockReq;
      });
      
      // Mock http.get for convenience if it exists
      if (typeof http.get === 'function') {
        vi.spyOn(http, 'get').mockImplementation((options, callback) => {
          const mockReq = http.request(options, callback);
          mockReq.end();
          return mockReq;
        });
      }
    }
    
    // Handle https module similarly
    import('node:https').then(httpsModule => {
      const https = httpsModule.default || httpsModule;
      
      if (https && typeof https.request === 'function') {
        vi.spyOn(https, 'request').mockImplementation((options, callback) => {
          return http.request(options, callback);
        });
        
        if (typeof https.get === 'function') {
          vi.spyOn(https, 'get').mockImplementation((options, callback) => {
            const mockReq = https.request(options, callback);
            mockReq.end();
            return mockReq;
          });
        }
      }
    }).catch(err => {
      console.warn('Failed to mock https module:', err.message);
    });
  }).catch(err => {
    console.warn('Failed to mock http module:', err.message);
  });
}
