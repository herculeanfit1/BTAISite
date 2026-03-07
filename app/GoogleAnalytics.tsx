'use client';

import Script from 'next/script';
import { useConsent } from '@/src/lib/use-consent';

interface GoogleAnalyticsProps {
  GA_MEASUREMENT_ID?: string;
  nonce?: string;
}

const GoogleAnalytics = ({ GA_MEASUREMENT_ID, nonce }: GoogleAnalyticsProps) => {
  const hasConsent = useConsent();

  const measurementId = GA_MEASUREMENT_ID || 'G-XXXXXXXXXX';

  // Don't load GA without consent, valid ID, or in development
  if (!hasConsent || !measurementId || measurementId === 'G-XXXXXXXXXX') {
    return null;
  }

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        nonce={nonce}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        nonce={nonce}
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${measurementId}');
          `,
        }}
      />
    </>
  );
};

export default GoogleAnalytics;
