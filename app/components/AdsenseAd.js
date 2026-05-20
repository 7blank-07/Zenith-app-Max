'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * AdsenseAd
 * 
 * Reusable Google AdSense component for Next.js App Router.
 * 
 * Requirements:
 * - Production-safe implementation for Next.js App Router.
 * - Safely initializes (window.adsbygoogle).
 * - Avoids hydration and duplicate initialization errors.
 * - Supports responsive ads.
 * - Publisher ID: ca-pub-4474200951186936
 * 
 * @param {string} slot - The 10-digit AdSense Slot ID
 */
export default function AdsenseAd({ slot }) {
  const pathname = usePathname();

  useEffect(() => {
    // Only initialize in the browser
    if (typeof window === 'undefined') return;

    // Small delay to ensure the DOM element is fully rendered and avoid hydration timing issues
    const timer = setTimeout(() => {
      try {
        if (window.adsbygoogle) {
          // Push a new ad request
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        }
      } catch (err) {
        // Silently handle errors like 'All ins elements already filled' or 'Script not loaded'
        if (process.env.NODE_ENV === 'development') {
          console.warn('[AdSense] Ad request failed or already filled:', err);
        }
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [pathname, slot]); // Re-initialize on route change to refresh the ad

  return (
    <div 
      className="adsense-container"
      style={{ 
        margin: '32px 0', 
        textAlign: 'center', 
        minHeight: '100px', 
        overflow: 'hidden',
        width: '100%',
        clear: 'both'
      }}
    >
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-4474200951186936"
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
