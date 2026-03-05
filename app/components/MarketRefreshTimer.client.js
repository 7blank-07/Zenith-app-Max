'use client';

import { useEffect, useMemo, useState } from 'react';

const REFRESH_INTERVAL_SECONDS = 5 * 60;

function getSecondsUntilNextRefresh() {
  const currentSeconds = Math.floor(Date.now() / 1000);
  const remainder = currentSeconds % REFRESH_INTERVAL_SECONDS;
  const remaining = REFRESH_INTERVAL_SECONDS - remainder;
  return remaining === REFRESH_INTERVAL_SECONDS ? 0 : remaining;
}

function formatCountdown(totalSeconds) {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = String(Math.floor(safeSeconds / 60)).padStart(2, '0');
  const seconds = String(safeSeconds % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
}

export default function MarketRefreshTimer() {
  const [remainingSeconds, setRemainingSeconds] = useState(getSecondsUntilNextRefresh);
  const countdown = useMemo(() => formatCountdown(remainingSeconds), [remainingSeconds]);

  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingSeconds(getSecondsUntilNextRefresh());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section style={{ marginTop: '14px', padding: '14px', borderRadius: '10px', border: '1px solid #d5d8dc' }}>
      <h3 style={{ margin: 0, fontSize: '16px' }}>Market Refresh Timer</h3>
      <p style={{ marginTop: '8px', marginBottom: 0 }}>
        Next live refresh in <strong>{countdown}</strong>
      </p>
    </section>
  );
}
