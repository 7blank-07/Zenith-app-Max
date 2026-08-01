'use client';

import { useState } from 'react';

function toText(value, fallback = '') {
  if (value === undefined || value === null) return fallback;
  return String(value).trim();
}

export default function CopyCodeButton({
  codeValue,
  className = '',
  copiedLabel = 'Copied',
  idleLabel = 'Copy code',
  redirectHref = ''
}) {
  const [status, setStatus] = useState('idle');

  async function handleCopy() {
    const code = toText(codeValue);
    if (!code) return;

    try {
      await navigator.clipboard.writeText(code);
      setStatus('copied');
      window.setTimeout(() => setStatus('idle'), 1400);

      const nextHref = toText(redirectHref);
      if (nextHref) {
        window.setTimeout(() => {
          window.location.assign(nextHref);
        }, 120);
      }
    } catch {
      setStatus('failed');
      window.setTimeout(() => setStatus('idle'), 1400);
    }
  }

  const renderLabel = () => {
    if (status === 'copied') return copiedLabel;
    if (status === 'failed') return 'Copy failed';
    return (
      <span translate="no" className="notranslate">
        {idleLabel}
      </span>
    );
  };

  return (
    <button type="button" className={className} onClick={handleCopy} aria-live="polite" data-status={status}>
      {renderLabel()}
    </button>
  );
}
