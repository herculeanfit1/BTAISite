'use client';

import { useEffect } from 'react';
import { initTelemetry } from '@/src/lib/telemetry';
import { useConsent } from '@/src/lib/use-consent';

export function TelemetryProvider({ children }: { children: React.ReactNode }) {
  const hasConsent = useConsent();

  useEffect(() => {
    if (hasConsent) {
      initTelemetry();
    }
  }, [hasConsent]);

  return <>{children}</>;
}
