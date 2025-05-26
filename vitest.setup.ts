/**
 * Vitest Setup File
 * 
 * This file contains setup code for the Vitest testing environment.
 * It provides mocks and polyfills for browser APIs that are not available
 * in the testing environment or need to be mocked for tests to pass.
 */

import { vi } from 'vitest';
import http from 'node:http';
import https from 'node:https';
import { EventEmitter } from 'node:events';

// Types for our HTTP mocks
interface MockClientResponse {
  statusCode: number;
  headers: Record<string, string>;
  on: (event: string, handler: (...args: any[]) => void) => MockClientResponse;
  once: (event: string, handler: (...args: any[]) => void) => MockClientResponse;
}

interface MockClientRequest {
  on: (event: string, handler: (...args: any[]) => void) => MockClientRequest;
  once: (event: string, handler: (...args: any[]) => void) => MockClientRequest;
  emit: (event: string, ...args: any[]) => boolean;
  end: () => MockClientRequest;
  write: (chunk: any) => MockClientRequest;
  abort: () => void;
  setTimeout: (msecs: number, callback?: () => void) => MockClientRequest;
  setHeader: (name: string, value: string | string[]) => MockClientRequest;
  removeHeader: (name: string) => MockClientRequest;
}

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn().mockImplementation((param) => {
      const params: Record<string, string> = {
        q: "",
        category: "All",
        tag: "All",
      };
      return params[param] || null;
    }),
    getAll: vi.fn().mockReturnValue([]),
    has: vi.fn().mockReturnValue(false),
    entries: vi.fn().mockReturnValue([]),
    keys: vi.fn().mockReturnValue([]),
    values: vi.fn().mockReturnValue([]),
    forEach: vi.fn(),
  }),
  useParams: () => ({
    slug: 'test-slug',
    category: 'test-category',
  }),
  redirect: vi.fn(),
  notFound: vi.fn(),
}));

// Mock HTTP and HTTPS modules for handling network requests in tests
// This is crucial for avoiding ECONNREFUSED errors, especially on localhost
// Create robust mocks that handle all scenarios including error events
const mockRequestImplementation = (module: typeof http | typeof https) => {
  // Keep a reference to the original request method
  const originalRequest = module.request;
  
  // Mock the request method to catch all HTTP requests
  module.request = vi.fn((...args: any[]) => {
    // Return a fake clientRequest object
    const handlers: Record<string, Array<(...args: any[]) => void>> = {};
    
    // Create a minimal EventEmitter-like implementation
    const eventEmitter = {
      on: function(this: any, event: string, handler: (...args: any[]) => void) {
        if (!handlers[event]) {
          handlers[event] = [];
        }
        handlers[event].push(handler);
        return this;
      },
      emit: function(event: string, ...args: any[]) {
        if (handlers[event]) {
          handlers[event].forEach(handler => handler(...args));
        }
        return true;
      },
      once: function(this: any, event: string, handler: (...args: any[]) => void) {
        if (!handlers[event]) {
          handlers[event] = [];
        }
        const wrappedHandler = (...args: any[]) => {
          handler(...args);
          handlers[event] = handlers[event].filter(h => h !== wrappedHandler);
        };
        handlers[event].push(wrappedHandler);
        return this;
      },
    };
    
    // Create clientRequest with explicit type to avoid circular reference
    const clientRequest: MockClientRequest = Object.assign({}, eventEmitter, {
      end: vi.fn(() => {
        // Simulate responding with an error for localhost to avoid ECONNREFUSED
        const url = typeof args[0] === 'string' ? args[0] : args[0]?.hostname || '';
        if (url.includes('localhost') || url.includes('127.0.0.1')) {
          // For localhost, emit a connection refused error
          setTimeout(() => {
            const error = new Error('Connection refused');
            (error as any).code = 'ECONNREFUSED';
            eventEmitter.emit('error', error);
          }, 0);
        } else {
          // For other URLs, emit a mock response
          setTimeout(() => {
            const response: MockClientResponse = {
              statusCode: 200,
              headers: {},
              on: eventEmitter.on,
              once: eventEmitter.once,
            };
            eventEmitter.emit('response', response);
          }, 0);
        }
        return clientRequest;
      }),
      write: vi.fn(() => clientRequest),
      abort: vi.fn(),
      setTimeout: vi.fn(() => clientRequest),
      setHeader: vi.fn(() => clientRequest),
      removeHeader: vi.fn(() => clientRequest),
    });
    
    return clientRequest;
  }) as unknown as typeof originalRequest;
};

// Apply our mock implementation to both http and https modules
mockRequestImplementation(http);
mockRequestImplementation(https);

// Create a global mock for fetch to handle network issues consistently
global.fetch = vi.fn().mockImplementation((url: string) => {
  // Specifically handle localhost requests to simulate errors
  if (url.includes('localhost') || url.includes('127.0.0.1')) {
    return Promise.reject(new Error('fetch failed'));
  }
  
  // Return mock success for other URLs
  return Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    headers: new Headers(),
  });
});

// Add ClassList mock for theme testing
type ClassListMockMethod = 'add' | 'remove' | 'toggle' | 'contains' | 'replace';

// Keep track of added classes to properly implement contains method
const classListMap = new WeakMap<Element, Set<string>>();

// Mock crucial Element.classList methods
const mockClassListMethods = () => {
  // For each method that we need to mock
  (['add', 'remove', 'toggle', 'contains', 'replace'] as ClassListMockMethod[]).forEach(method => {
    Object.defineProperty(Element.prototype.classList, method, {
      value: function(...args: string[]) {
        if (!classListMap.has(this)) {
          classListMap.set(this, new Set());
        }
        
        const classSet = classListMap.get(this)!;
        
        switch (method) {
          case 'add':
            args.forEach(cls => classSet.add(cls));
            break;
          case 'remove':
            args.forEach(cls => classSet.delete(cls));
            break;
          case 'toggle':
            args.forEach(cls => {
              if (classSet.has(cls)) {
                classSet.delete(cls);
              } else {
                classSet.add(cls);
              }
            });
            break;
          case 'contains':
            return classSet.has(args[0]);
          case 'replace':
            if (classSet.has(args[0])) {
              classSet.delete(args[0]);
              classSet.add(args[1]);
            }
            break;
        }
      },
      configurable: true,
    });
  });
};

// Apply the classList mocks
mockClassListMethods();

// Mock fetch API to avoid real network requests in tests
if (typeof global.fetch !== 'undefined') {
  vi.spyOn(global, 'fetch').mockImplementation((url) => {
    console.log(`[mocked] Fetch request to: ${url instanceof URL ? url.toString() : url}`);
    return Promise.resolve({
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: new Headers({ 'Content-Type': 'application/json' }),
      json: async () => ({ success: true, data: [], message: 'This is a mocked response' }),
      text: async () => '<div>Mocked HTML response</div>',
    } as Response);
  });
}

// Better stub methods on document.documentElement.classList to avoid errors in theme tests
if (document.documentElement) {
  // Create a more robust mock for classList
  const mockClassList = {
    add: vi.fn(),
    remove: vi.fn(),
    toggle: vi.fn().mockReturnValue(true),
    contains: vi.fn().mockImplementation((className: string) => {
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

// Mock Node.js http and https modules to prevent ECONNREFUSED errors
// Create a robust mock to handle all network events
const createMockEventEmitter = () => {
  const handlers: Record<string, Function[]> = {};
  
  return {
    on: vi.fn().mockImplementation(function(this: any, event: string, handler: Function) {
      if (!handlers[event]) {
        handlers[event] = [];
      }
      handlers[event].push(handler);
      return this;
    }),
    emit: function(event: string, ...args: any[]) {
      if (handlers[event]) {
        handlers[event].forEach(handler => handler(...args));
      }
      return true;
    },
    removeAllListeners: vi.fn().mockImplementation(function(this: any) {
      return this;
    })
  };
};

// Mock client request with comprehensive event handling
const mockClientRequest = {
  ...createMockEventEmitter(),
  end: vi.fn().mockImplementation(function(this: any) { 
    // Simulate successful completion
    setTimeout(() => {
      this.emit('response', createMockResponse());
    }, 0);
    return this; 
  }),
  write: vi.fn().mockImplementation(function(this: any) { return this; }),
  abort: vi.fn().mockImplementation(function(this: any) { return this; }),
  setTimeout: vi.fn().mockImplementation(function(this: any) { return this; }),
  setHeader: vi.fn().mockImplementation(function(this: any) { return this; }),
  getHeader: vi.fn().mockImplementation(function() { return 'mock-header-value'; }),
  removeHeader: vi.fn().mockImplementation(function(this: any) { return this; }),
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
    pipe: vi.fn().mockImplementation(function(this: any) { return this; }),
  };
  
  // Simulate data flow in the next tick
  setTimeout(() => {
    mockResponse.emit('data', Buffer.from(JSON.stringify({ mocked: true })));
    mockResponse.emit('end');
  }, 0);
  
  return mockResponse;
};

// Mock http.request - handle both callback style and event emitter style
vi.spyOn(http, 'request').mockImplementation((options: any, callback?: any) => {
  const mockReq = { ...mockClientRequest };
  
  if (typeof callback === 'function') {
    // Handle callback-style usage
    setTimeout(() => {
      callback(createMockResponse());
    }, 0);
  }
  
  return mockReq as any;
});

// Mock http.get for convenience
vi.spyOn(http, 'get').mockImplementation((options: any, callback?: any) => {
  const mockReq = http.request(options, callback);
  mockReq.end();
  return mockReq;
});

// Also mock https.request identically
vi.spyOn(https, 'request').mockImplementation((options: any, callback?: any) => {
  return http.request(options, callback);
});

// Mock https.get
vi.spyOn(https, 'get').mockImplementation((options: any, callback?: any) => {
  const mockReq = https.request(options, callback);
  mockReq.end();
  return mockReq;
});

// Polyfill for MessageChannel which is used by React in some cases
// but not available in the happy-dom environment
if (typeof global.MessageChannel === 'undefined') {
  global.MessageChannel = class {
    port1: any;
    port2: any;
    
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

// Polyfill for other missing APIs that might be needed by tests
if (typeof global.matchMedia === 'undefined') {
  global.matchMedia = vi.fn().mockImplementation((query) => {
    return {
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    };
  });
}

// Additional helpers for common testing needs
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Add any other mocks or polyfills needed for your tests below 