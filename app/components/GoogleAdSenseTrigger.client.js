'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * GoogleAdSenseTrigger
 * 
 * This component solves the "SPA Revenue Problem".
 * In a Next.js app, client-side navigation doesn't reload the page, 
 * so AdSense doesn't know the content has changed.
 * 
 * This hook watches the URL and "pokes" AdSense on every change
 * to force a new ad scan and record a new Page View.
 */
export default function GoogleAdSenseTrigger() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // When the URL changes (pathname or search params like ?id=...)
    if (typeof window !== 'undefined' && window.adsbygoogle) {
      try {
        // We tell AdSense that the page has changed.
        // For Auto Ads, pushing an empty object into the array 
        // triggers a re-scan of the new DOM content.
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        
        // Log for debugging in development (optional, but helpful to see it's working)
        if (process.env.NODE_ENV === 'development') {
          console.log('[AdSense] Route change detected. Triggering ad refresh for:', pathname);
        }
      } catch (e) {
        // Silently catch errors if AdSense isn't ready yet or blocked
        if (process.env.NODE_ENV === 'development') {
          console.warn('[AdSense] Trigger failed:', e);
        }
      }
    }
  }, [pathname, searchParams]);

  return null; // This component doesn't render anything
}
