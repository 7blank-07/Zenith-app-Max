'use client';

import { useState, useCallback } from 'react';

export function useCopyToClipboard(options = {}) {
  const { timeout = 2000 } = options;
  const [isCopied, setIsCopied] = useState(false);

  const copy = useCallback(
    async (text) => {
      try {
        await navigator.clipboard.writeText(text);
        setIsCopied(true);

        // Reset after timeout
        const timer = setTimeout(() => {
          setIsCopied(false);
        }, timeout);

        return () => clearTimeout(timer);
      } catch (error) {
        console.error('Failed to copy to clipboard:', error);
        return () => {};
      }
    },
    [timeout]
  );

  return { isCopied, copy };
}
