/**
 * SafeHtml Component - Bridging Trust AI
 * 
 * Wrapper for dangerouslySetInnerHTML that enforces safe usage patterns
 * Only allows specific components to use dangerouslySetInnerHTML
 */

import React from 'react';

interface SafeHtmlProps {
  html: string;
  component: 'GoogleAnalytics' | 'SchemaOrg' | 'TestComponent';
  className?: string;
  'data-testid'?: string;
}

const ALLOWED_COMPONENTS = ['GoogleAnalytics', 'SchemaOrg', 'TestComponent'] as const;

export const SafeHtml: React.FC<SafeHtmlProps> = ({ 
  html, 
  component, 
  className, 
  'data-testid': dataTestId 
}) => {
  // Validate component is allowed
  if (!ALLOWED_COMPONENTS.includes(component)) {
    throw new Error(
      `SafeHtml: Component '${component}' is not allowed to use dangerouslySetInnerHTML. ` +
      `Allowed components: ${ALLOWED_COMPONENTS.join(', ')}`
    );
  }

  // Basic HTML sanitization (in production, use isomorphic-dompurify)
  const sanitizedHtml = html
    .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/on\w+\s*=/gi, ''); // Remove event handlers

  return (
    <div
      className={className}
      data-testid={dataTestId}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
};
