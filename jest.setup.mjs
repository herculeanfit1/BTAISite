// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock Next.js router
global.jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    pathname: '/',
    query: {},
  }),
}));

// Mock next/image
global.jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

// Mock next/server
global.jest.mock('next/server', () => {
  class MockNextResponse {
    status;
    
    constructor(body, init) {
      this.body = body;
      this.status = init?.status || 200;
    }
    
    async json() {
      return this.body;
    }
  }
  
  return {
    NextResponse: {
      json: jest.fn().mockImplementation((body, init) => {
        return new MockNextResponse(body, init);
      }),
    },
  };
});

// Mock Web API used by Next.js App Router
if (typeof global.Request === 'undefined') {
  global.Request = class Request {};
}

// Mock next/navigation
global.jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => ({
    get: (key) => null,
    getAll: (key) => [],
    has: (key) => false,
  }),
  usePathname: () => '/',
})); 