'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

const INITIAL_PROGRESS = 8;
const MAX_TRICKLE_PROGRESS = 92;
const HIDE_DELAY_MS = 170;
const SAFETY_TIMEOUT_MS = 15000;
const TRICKLE_INTERVAL_MS = 160;

export default function RouteProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  const trickleIntervalRef = useRef(null);
  const hideTimeoutRef = useRef(null);
  const safetyTimeoutRef = useRef(null);
  const previousRouteKeyRef = useRef(null);
  const isVisibleRef = useRef(false);
  const progressRef = useRef(0);

  const routeKey = useMemo(
    () => `${pathname || ''}?${searchParams?.toString() || ''}`,
    [pathname, searchParams]
  );

  useEffect(() => {
    isVisibleRef.current = isVisible;
  }, [isVisible]);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    const clearTrickle = () => {
      if (trickleIntervalRef.current) {
        clearInterval(trickleIntervalRef.current);
        trickleIntervalRef.current = null;
      }
    };

    const clearHideTimeout = () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
    };

    const clearSafetyTimeout = () => {
      if (safetyTimeoutRef.current) {
        clearTimeout(safetyTimeoutRef.current);
        safetyTimeoutRef.current = null;
      }
    };

    const startProgress = () => {
      clearHideTimeout();
      clearSafetyTimeout();

      if (!isVisibleRef.current) {
        setIsVisible(true);
      }

      // If we are already near the end, don't jump back to INITIAL_PROGRESS
      // but ensure we show movement
      setProgress((prev) => {
        if (prev < INITIAL_PROGRESS) return INITIAL_PROGRESS;
        if (prev >= MAX_TRICKLE_PROGRESS) return prev;
        return Math.min(MAX_TRICKLE_PROGRESS, prev + 2);
      });

      if (!trickleIntervalRef.current) {
        trickleIntervalRef.current = setInterval(() => {
          setProgress((currentProgress) => {
            if (currentProgress >= MAX_TRICKLE_PROGRESS) {
              return currentProgress;
            }
            const remaining = MAX_TRICKLE_PROGRESS - currentProgress;
            const step = Math.max(0.4, remaining * 0.12);
            return Math.min(MAX_TRICKLE_PROGRESS, currentProgress + step);
          });
        }, TRICKLE_INTERVAL_MS);
      }

      safetyTimeoutRef.current = setTimeout(() => {
        clearTrickle();
        setProgress(100);
        hideTimeoutRef.current = setTimeout(() => {
          setIsVisible(false);
          setProgress(0);
        }, HIDE_DELAY_MS);
      }, SAFETY_TIMEOUT_MS);
    };

    const isInternalNavigationClick = (event) => {
      if (event.defaultPrevented || event.button !== 0) return false;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;

      const target = event.target;
      const link = target?.closest?.('a[href]');
      if (!link) return false;

      if (link.target && link.target !== '_self') return false;
      if (link.hasAttribute('download')) return false;
      if (link.hasAttribute('data-no-progress')) return false;

      const rawHref = link.getAttribute('href');
      if (!rawHref || rawHref.startsWith('#')) return false;
      if (rawHref.startsWith('mailto:') || rawHref.startsWith('tel:')) return false;

      let destinationUrl;
      try {
        destinationUrl = new URL(link.href, window.location.href);
      } catch {
        return false;
      }

      if (destinationUrl.origin !== window.location.origin) return false;
      
      // Even if same path, search params might change which is a navigation
      if (
        destinationUrl.pathname === window.location.pathname &&
        destinationUrl.search === window.location.search &&
        destinationUrl.hash === window.location.hash
      ) {
        return false;
      }

      return true;
    };

    const handleDocumentClick = (event) => {
      // Ignore right clicks or clicks with modifiers
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const target = event.target;
      if (!target || !(target instanceof HTMLElement)) return;

      // 1. Standard internal link clicks
      if (isInternalNavigationClick(event)) {
        startProgress();
        return;
      }

      // 2. Programmatic navigation triggers (cards, buttons, etc.)
      // We look for elements that are known to trigger router.push()
      const trigger = target.closest(
        'button, [role="button"], .player-row-card, .dashboard-player-card, .player-row, .banner-slide, .market-nav-link, .player-card-item, .tool-card, .nav-item, .mobile-nav-item'
      );

      if (trigger) {
        // Skip if explicitly opted out or if it's a type="submit" in a form (usually handled by submit)
        if (trigger.hasAttribute('data-no-progress') || trigger.closest('[data-no-progress]')) {
          return;
        }
        
        // Skip for simple UI toggles if we can identify them (optional)
        // But the user said "any button", so we'll be generous
        startProgress();
      }
    };

    const handleCustomTrigger = () => {
      startProgress();
    };

    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function patchedPushState(...args) {
      startProgress();
      return originalPushState.apply(window.history, args);
    };

    window.history.replaceState = function patchedReplaceState(...args) {
      startProgress();
      return originalReplaceState.apply(window.history, args);
    };

    const handlePopState = () => {
      startProgress();
    };

    document.addEventListener('click', handleDocumentClick, true);
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('zenith:navigation-start', handleCustomTrigger);

    // Also expose a global function for manual triggers if needed
    window.startRouteProgress = startProgress;

    return () => {
      document.removeEventListener('click', handleDocumentClick, true);
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('zenith:navigation-start', handleCustomTrigger);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
      delete window.startRouteProgress;
      clearTrickle();
      clearHideTimeout();
      clearSafetyTimeout();
    };
  }, []);

  useEffect(() => {
    if (previousRouteKeyRef.current === null) {
      previousRouteKeyRef.current = routeKey;
      return;
    }

    if (previousRouteKeyRef.current !== routeKey) {
      previousRouteKeyRef.current = routeKey;
      setProgress(100);
      if (trickleIntervalRef.current) {
        clearInterval(trickleIntervalRef.current);
        trickleIntervalRef.current = null;
      }
      if (safetyTimeoutRef.current) {
        clearTimeout(safetyTimeoutRef.current);
        safetyTimeoutRef.current = null;
      }
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
      hideTimeoutRef.current = setTimeout(() => {
        setIsVisible(false);
        setProgress(0);
      }, HIDE_DELAY_MS);
    }
  }, [routeKey]);

  return (
    <div
      className={`route-loading-progress${isVisible ? ' is-visible' : ''}`}
      aria-hidden={!isVisible}
    >
      <span className="route-loading-progress__bar" style={{ width: `${progress}%` }} />
    </div>
  );
}
