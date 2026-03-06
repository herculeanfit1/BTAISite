'use client';

import { useEffect } from 'react';
import { initTelemetry } from '@/src/lib/telemetry';

export function TelemetryProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initTelemetry();
  }, []);

  return <>{children}</>;
}
