import { ApplicationInsights } from '@microsoft/applicationinsights-web';

let appInsights: ApplicationInsights | null = null;

export function initTelemetry() {
  if (typeof window === 'undefined') return;
  if (appInsights) return;

  const connectionString = process.env.NEXT_PUBLIC_APPLICATIONINSIGHTS_CONNECTION_STRING;
  if (!connectionString) return;

  appInsights = new ApplicationInsights({
    config: {
      connectionString,
      enableAutoRouteTracking: true,
      disableFetchTracking: false,
      enableCorsCorrelation: true,
    },
  });

  appInsights.loadAppInsights();
}

export function trackException(error: Error, properties?: Record<string, string>) {
  if (!appInsights) return;
  appInsights.trackException({ exception: error }, properties);
}

export function trackEvent(name: string, properties?: Record<string, string>) {
  if (!appInsights) return;
  appInsights.trackEvent({ name }, properties);
}
