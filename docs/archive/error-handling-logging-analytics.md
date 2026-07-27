# Error Handling, Logging, and Analytics Documentation

This document outlines the implementation of error handling, logging, and analytics in the BridgingTrustAI website.

## Error Handling

Our application implements a comprehensive error handling strategy with multiple layers:

### 1. Global Error Boundary

The `ErrorBoundary` component in `app/components/ErrorBoundary.tsx` acts as a client-side error boundary that catches JavaScript errors in its child component tree. This prevents the entire app from crashing when an error occurs in a component.

**Usage:**

```tsx
<ErrorBoundary>
  <MyComponent />
</ErrorBoundary>
```

**Features:**

- Captures and logs runtime errors
- Displays user-friendly error messages
- Provides a "Try Again" functionality
- Shows detailed error information in development mode

### 2. App Router Error Handling

Next.js App Router error handling is implemented at multiple levels:

- **Root Error Handling:** `app/error.tsx` provides global error handling for the entire app.
- **Route-specific Error Handling:** Individual route segments can have their own error.tsx files (e.g., `app/blog/error.tsx`).
- **Not Found Handling:** `app/not-found.tsx` provides a custom 404 page.

### 3. Component-level Error Handling

The `ErrorHandler` component in `app/components/ErrorHandler.tsx` provides a standardized way to handle and display errors in specific page components.

**Usage:**

```tsx
export default function MyPage() {
  // ... page code ...
}

export function ErrorBoundary({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return <ErrorHandler error={error} reset={reset} />;
}
```

## Logging System

The logging system is implemented in `lib/logger.ts` and provides structured logging across the application.

### Features

- **Multiple Log Levels:** debug, info, warn, error
- **Environment-aware:** Different log levels for development and production
- **Structured Logging:** JSON-formatted logs with context
- **Client/Server Detection:** Automatically detects where code is running
- **Remote Logging:** Support for sending logs to external services in production

### Usage

```typescript
import { logger } from "@/lib/logger";

// Basic logging
logger.debug("Debug message");
logger.info("Info message");
logger.warn("Warning message");
logger.error("Error message");

// Structured logging with context
logger.info("User action", {
  userId: "123",
  action: "click_button",
});

// Error logging with additional context
try {
  // Some operation that might fail
} catch (error) {
  logger.error("Operation failed", {
    error: error instanceof Error ? error.message : String(error),
    context: "processing_payment",
  });
}
```

## Analytics

The analytics system is implemented in `lib/analytics.tsx` and provides a flexible way to track user behavior.

### Features

- **Multiple Providers:** Support for Google Analytics and a mock provider for development
- **Environment Awareness:** Uses different providers based on environment
- **Automatic Page View Tracking:** Tracks page views when routes change
- **Event Tracking:** Standardized event tracking with custom properties
- **User Identification:** Support for identifying users
- **GDPR Compliance:** IP anonymization and cookie flags for compliance
- **React Hooks:** Easy integration with React components through hooks

### Components

1. **Analytics Component:**

   - Located in `lib/analytics.tsx`
   - Automatically tracks page views
   - Initializes analytics in client-side code

2. **useAnalytics Hook:**
   - Located in `lib/useAnalytics.tsx`
   - Provides React components with easy access to tracking functions
   - Includes convenience methods for common tracking scenarios

### Usage

**Basic Tracking:**

```typescript
import { analytics } from "@/lib/analytics";

// Track custom event
analytics.track("button_clicked", { button_name: "subscribe" });

// Identify user
analytics.identify("user-123", { plan: "premium" });
```

**React Hook Usage:**

```typescript
import { useAnalytics } from '@/lib/useAnalytics';

function MyComponent() {
  const { trackEvent, trackButtonClick } = useAnalytics();

  const handleClick = () => {
    // Do something
    trackButtonClick('submit_form');
  };

  return <button onClick={handleClick}>Submit</button>;
}
```

**Form Tracking Example:**

The contact form (`app/contact/ContactForm.tsx`) demonstrates how to track form interactions:

- Form submission attempts
- Validation errors
- Successful submissions
- Submission errors

## Integration

These systems work together to provide a comprehensive solution:

1. **Error Boundary + Logger:** When the ErrorBoundary catches an error, it logs it through the logger.
2. **Analytics + Error Handling:** Error events can be tracked in analytics for monitoring user experience issues.
3. **Logger + Analytics:** Important user actions are both logged (for debugging) and tracked (for analysis).

## Configuration

### Environment Variables

- `NEXT_PUBLIC_GA_MEASUREMENT_ID`: Google Analytics measurement ID
- `LOG_ENDPOINT`: (Optional) Endpoint for remote logging service

### Feature Flags

- Environment detection automatically configures the systems based on development or production environment.
- Debug logging is enabled in development but disabled in production.
