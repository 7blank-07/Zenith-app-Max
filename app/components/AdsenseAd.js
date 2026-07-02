'use client';

import { useEffect, useRef } from 'react';
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
 * @param {string} format - The ad format (auto, rectangle, horizontal, vertical, autorelaxed, fluid)
 * @param {string} layout - For In-article ads (data-ad-layout="in-article")
 * @param {string} layoutKey - For In-feed ads (data-ad-layout-key)
 * @param {boolean} responsive - Whether the ad is responsive
 * @param {object} style - Custom styles for the container
 */
export default function AdsenseAd({ slot, format = 'auto', layout = '', layoutKey = '', responsive = true, style = {} }) {
  const pathname = usePathname();
  const initialized = useRef(false);

  useEffect(() => {
    // Only initialize in the browser
    if (typeof window === 'undefined') return;

    // Small delay to ensure the DOM element is fully rendered and avoid hydration timing issues
    const timer = setTimeout(() => {
      try {
        if (window.adsbygoogle) {
          // Push a new ad request
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          initialized.current = true;
        }
      } catch (err) {
        // Silently handle errors like 'All ins elements already filled' or 'Script not loaded'
        if (process.env.NODE_ENV === 'development') {
          console.warn('[AdSense] Ad request failed or already filled:', err);
        }
      }
    }, 200);

    return () => {
      clearTimeout(timer);
      initialized.current = false;
    };
  }, [pathname, slot]); // Re-initialize on route change to refresh the ad

  // Reserve space based on format to reduce CLS
  const defaultMinHeight = format === 'autorelaxed' ? '500px' : (format === 'fluid' || layout === 'in-article') ? '120px' : '280px';

  const insHtml = `<ins class="adsbygoogle" style="display: block; min-width: 250px;" data-ad-client="ca-pub-4474200951186936" data-ad-slot="${slot}" data-ad-format="${format}" ${layout ? `data-ad-layout="${layout}"` : ''} ${layoutKey ? `data-ad-layout-key="${layoutKey}"` : ''} data-full-width-responsive="${responsive ? 'true' : 'false'}"></ins>`;

  return (
    <div 
      className="adsense-container"
      style={{ 
        margin: '32px 0', 
        textAlign: 'center', 
        minHeight: style.minHeight || defaultMinHeight, 
        overflow: 'hidden',
        width: '100%',
        clear: 'both',
        ...style
      }}
      dangerouslySetInnerHTML={{ __html: insHtml }}
    />
  );
}
