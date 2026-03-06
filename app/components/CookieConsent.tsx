'use client';

import { useState, useEffect } from 'react';

type ConsentStatus = 'pending' | 'accepted' | 'declined';

function getConsentCookie(): ConsentStatus {
  if (typeof document === 'undefined') return 'pending';
  const match = document.cookie.match(/btai_consent=(accepted|declined)/);
  return match ? (match[1] as ConsentStatus) : 'pending';
}

function setConsentCookie(status: 'accepted' | 'declined') {
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `btai_consent=${status}; path=/; max-age=31536000; SameSite=Lax${secure}`;
}

export function CookieConsent() {
  const [consent, setConsent] = useState<ConsentStatus>('pending');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setConsent(getConsentCookie());
  }, []);

  const handleAccept = () => {
    setConsentCookie('accepted');
    setConsent('accepted');
    window.location.reload();
  };

  const handleDecline = () => {
    setConsentCookie('declined');
    setConsent('declined');
  };

  if (!mounted || consent !== 'pending') return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[2000] p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-gray-600 dark:text-gray-300 text-center sm:text-left">
          We use cookies and analytics to understand how visitors use our site and to improve your experience.
          See our{' '}
          <a href="/privacy" className="text-[#5B90B0] dark:text-[#7BA8C4] underline hover:no-underline">
            Privacy Policy
          </a>{' '}
          for details.
        </p>
        <div className="flex gap-3 flex-shrink-0">
          <button
            onClick={handleDecline}
            className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            className="px-4 py-2 text-sm font-medium text-white bg-[#5B90B0] rounded-lg hover:bg-[#3A5F77] transition-colors"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
