'use client';

import { useState, useEffect } from 'react';

export function useConsent(): boolean {
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    const match = document.cookie.match(/btai_consent=accepted/);
    setHasConsent(!!match);
  }, []);

  return hasConsent;
}
