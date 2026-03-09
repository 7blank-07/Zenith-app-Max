'use client';

import { useEffect, useMemo, useState } from 'react';

function parseRefreshTime(timeStr) {
  if (!timeStr) return null;

  const source = String(timeStr).trim();
  const match12 = source.match(/(\d{1,2}):(\d{2}):(\d{2})\s*(AM|PM)/i);
  if (match12) {
    let hours = Number.parseInt(match12[1], 10);
    const minutes = Number.parseInt(match12[2], 10);
    const seconds = Number.parseInt(match12[3], 10);
    const meridiem = match12[4].toUpperCase();

    if (meridiem === 'PM' && hours !== 12) hours += 12;
    if (meridiem === 'AM' && hours === 12) hours = 0;

    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), hours, minutes, seconds));
  }

  const match24 = source.match(/(\d{1,2}):(\d{2}):(\d{2})/);
  if (!match24) return null;

  const hours = Number.parseInt(match24[1], 10);
  const minutes = Number.parseInt(match24[2], 10);
  const seconds = Number.parseInt(match24[3], 10);
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), hours, minutes, seconds));
}

function getAllRefreshTimes(baseTime) {
  const now = new Date();
  const refreshTimes = [];
  const baseHours = baseTime.getUTCHours();
  const baseMinutes = baseTime.getUTCMinutes();
  const baseSeconds = baseTime.getUTCSeconds();

  for (let dayOffset = -1; dayOffset <= 1; dayOffset += 1) {
    const baseDate = new Date(now);
    baseDate.setDate(baseDate.getDate() + dayOffset);
    baseDate.setUTCHours(baseHours, baseMinutes, baseSeconds, 0);

    for (let index = -6; index <= 6; index += 1) {
      const refreshTime = new Date(baseDate);
      refreshTime.setHours(refreshTime.getHours() + index * 2);
      refreshTimes.push(refreshTime);
    }
  }

  const uniqueTimes = [...new Set(refreshTimes.map((entry) => entry.getTime()))];
  return uniqueTimes.map((entry) => new Date(entry)).sort((a, b) => a.getTime() - b.getTime());
}

function getNextRefresh(baseTime) {
  const now = new Date();
  const allRefreshes = getAllRefreshTimes(baseTime);
  let futureRefreshes = allRefreshes.filter((entry) => entry > now);

  if (!futureRefreshes.length) {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 2);
    tomorrow.setUTCHours(baseTime.getUTCHours(), baseTime.getUTCMinutes(), baseTime.getUTCSeconds(), 0);

    for (let index = 0; index < 12; index += 1) {
      const refreshTime = new Date(tomorrow);
      refreshTime.setHours(refreshTime.getHours() + index * 2);
      futureRefreshes.push(refreshTime);
    }
    futureRefreshes = futureRefreshes.sort((a, b) => a.getTime() - b.getTime());
  }

  return futureRefreshes[0] || null;
}

function getUpcomingRefreshes(baseTime, count = 2) {
  const now = new Date();
  const allRefreshes = getAllRefreshTimes(baseTime);
  let futureRefreshes = allRefreshes.filter((entry) => entry > now);

  if (futureRefreshes.length < count + 1) {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 2);
    tomorrow.setUTCHours(baseTime.getUTCHours(), baseTime.getUTCMinutes(), baseTime.getUTCSeconds(), 0);

    for (let index = 0; index < 12; index += 1) {
      const refreshTime = new Date(tomorrow);
      refreshTime.setHours(refreshTime.getHours() + index * 2);
      futureRefreshes.push(refreshTime);
    }
    futureRefreshes = futureRefreshes.sort((a, b) => a.getTime() - b.getTime());
  }

  return futureRefreshes.slice(1, count + 1);
}

function formatTimeUntil(targetTime, nowMs) {
  const delta = targetTime.getTime() - nowMs;
  if (delta <= 0) return 'Refreshing...';

  const hours = Math.floor(delta / (1000 * 60 * 60));
  const minutes = Math.floor((delta / (1000 * 60)) % 60);
  if (hours > 0) return `in ${hours}h ${minutes}m`;
  return `in ${minutes}m`;
}

function getUserTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

function formatRefreshClock(value, timezone) {
  return value.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    timeZone: timezone
  });
}

export default function PlayerRefreshTimePanel({ playerId }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [baseRefreshTime, setBaseRefreshTime] = useState(null);
  const [nextRefresh, setNextRefresh] = useState(null);
  const [upcomingRefreshes, setUpcomingRefreshes] = useState([]);
  const [nowMs, setNowMs] = useState(Date.now());
  const [timezone, setTimezone] = useState('UTC');

  useEffect(() => {
    const controller = new AbortController();

    const loadRefreshData = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await fetch(`/api/player-refresh?id=${encodeURIComponent(playerId)}`, {
          cache: 'no-store',
          signal: controller.signal
        });
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload?.error || `Refresh time request failed (${response.status})`);
        }

        const parsedBase = parseRefreshTime(payload.refreshTime);
        if (!parsedBase) {
          throw new Error('Invalid refresh time format');
        }

        setTimezone(getUserTimezone());
        setBaseRefreshTime(parsedBase);
        setNextRefresh(getNextRefresh(parsedBase));
        setUpcomingRefreshes(getUpcomingRefreshes(parsedBase, 2));
      } catch (requestError) {
        if (requestError.name === 'AbortError') return;
        setError(requestError.message || 'Error loading refresh time');
        setBaseRefreshTime(null);
        setNextRefresh(null);
        setUpcomingRefreshes([]);
      } finally {
        setLoading(false);
      }
    };

    loadRefreshData();
    return () => controller.abort();
  }, [playerId]);

  useEffect(() => {
    if (!baseRefreshTime) return () => {};

    const intervalId = window.setInterval(() => {
      const currentNow = Date.now();
      setNowMs(currentNow);
      setNextRefresh((current) => {
        if (current && current.getTime() > currentNow) return current;
        setUpcomingRefreshes(getUpcomingRefreshes(baseRefreshTime, 2));
        return getNextRefresh(baseRefreshTime);
      });
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [baseRefreshTime]);

  const timezoneLabel = useMemo(() => timezone.split('/').pop()?.replace(/_/g, ' ') || 'UTC', [timezone]);
  const nextRefreshText = useMemo(() => {
    if (!nextRefresh) return loading ? 'Loading...' : 'N/A';
    return formatRefreshClock(nextRefresh, timezone);
  }, [loading, nextRefresh, timezone]);
  const countdownText = useMemo(() => {
    if (!nextRefresh) return loading ? 'Calculating...' : 'N/A';
    return formatTimeUntil(nextRefresh, nowMs);
  }, [loading, nextRefresh, nowMs]);
  const upcomingTexts = useMemo(
    () => upcomingRefreshes.map((entry) => formatRefreshClock(entry, timezone)),
    [upcomingRefreshes, timezone]
  );

  return (
    <div
      className="player-refresh-container"
      style={{
        background: 'var(--color-graphite-800)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        marginTop: '20px'
      }}
    >
      <div
        style={{
          fontSize: '16px',
          fontWeight: 800,
          color: 'var(--color-text-primary)',
          margin: '0 0 18px 0',
          textTransform: 'uppercase',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        Market Refresh
      </div>

      {!!error && (
        <div style={{ fontSize: '14px', color: 'var(--color-text-muted)', fontWeight: 600, textAlign: 'center' }}>{error}</div>
      )}

      {!error && (
        <>
          <div
            style={{
              background: 'rgba(0, 194, 168, 0.08)',
              border: '1px solid rgba(0, 194, 168, 0.25)',
              borderRadius: '10px',
              padding: '16px',
              marginBottom: '12px'
            }}
          >
            <div
              style={{
                fontSize: '13px',
                fontWeight: 700,
                color: 'var(--color-text-muted)',
                marginBottom: '8px',
                textTransform: 'uppercase'
              }}
            >
              Next Refresh
            </div>
            <div className="player-refresh-time-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <div className="player-refresh-time" style={{ fontSize: '20px', fontWeight: 900, color: 'var(--color-teal-500)' }}>
                {nextRefreshText}
              </div>
              <div
                className="player-refresh-countdown"
                style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  color: 'var(--color-teal-500)',
                  background: 'rgba(0,194,168,0.15)',
                  padding: '6px 12px',
                  borderRadius: '6px'
                }}
              >
                {countdownText}
              </div>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 600 }}>{timezoneLabel}</div>
          </div>

          {!!upcomingTexts.length && (
            <div style={{ marginTop: '12px' }}>
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: 'var(--color-text-muted)',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.3px'
                }}
              >
                Upcoming Refreshes
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '8px 12px' }}>
                {upcomingTexts.map((entry, index) => (
                  <div
                    key={`${playerId}-upcoming-${entry}-${index}`}
                    style={{
                      fontSize: '13px',
                      color: 'var(--color-text-muted)',
                      padding: '8px 0',
                      borderBottom: index === upcomingTexts.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.05)'
                    }}
                  >
                    • {entry}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
