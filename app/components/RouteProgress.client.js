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

      if (progressRef.current < INITIAL_PROGRESS) {
        setProgress(INITIAL_PROGRESS);
      }

      if (!trickleIntervalRef.current) {
        trickleIntervalRef.current = setInterval(() => {
          setProgress((currentProgress) => {
            if (currentProgress >= MAX_TRICKLE_PROGRESS) {
              return currentProgress;
            }
            const remaining = MAX_TRICKLE_PROGRESS - currentProgress;
            const step = Math.max(0.8, remaining * 0.14);
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
      if (
        destinationUrl.pathname === window.location.pathname &&
        destinationUrl.search === window.location.search
      ) {
        return false;
      }

      return true;
    };

    const handleDocumentClick = (event) => {
      if (isInternalNavigationClick(event)) {
        startProgress();
      }
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

    return () => {
      document.removeEventListener('click', handleDocumentClick, true);
      window.removeEventListener('popstate', handlePopState);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
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
