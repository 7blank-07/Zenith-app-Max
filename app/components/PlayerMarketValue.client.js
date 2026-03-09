'use client';

import { useEffect, useMemo, useState } from 'react';

function normalizeRank(rankValue) {
  const parsed = Number.parseInt(String(rankValue ?? '0'), 10);
  if (!Number.isFinite(parsed)) return 0;
  return Math.min(5, Math.max(0, parsed));
}

function formatMarketPrice(price) {
  const value = Number(price);
  if (!Number.isFinite(value) || value <= 0) return 'No data';
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(2)}K`;
  return String(Math.round(value));
}

export default function PlayerMarketValue({ playerId, rank = 0, isUntradable = false, fallbackPrice = 0 }) {
  const [value, setValue] = useState(null);
  const [loading, setLoading] = useState(!isUntradable);
  const [error, setError] = useState('');
  const normalizedRank = useMemo(() => normalizeRank(rank), [rank]);

  useEffect(() => {
    if (isUntradable) {
      setValue(null);
      setError('');
      setLoading(false);
      return () => {};
    }

    const controller = new AbortController();
    const fetchMarketValue = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await fetch(
          `/api/player-price?id=${encodeURIComponent(playerId)}&rank=${encodeURIComponent(normalizedRank)}`,
          { cache: 'no-store', signal: controller.signal }
        );
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload?.error || `Market value request failed (${response.status})`);
        }
        setValue(payload.price ?? null);
      } catch (requestError) {
        if (requestError.name === 'AbortError') return;
        setError(requestError.message);
        setValue(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMarketValue();
    return () => controller.abort();
  }, [isUntradable, normalizedRank, playerId]);

  if (isUntradable) return <>Non-Auctionable</>;
  if (loading) return <>Loading...</>;

  const resolvedFallback = Number(fallbackPrice);
  if (Number.isFinite(value) && value > 0) return <>{formatMarketPrice(value)}</>;
  if (Number.isFinite(resolvedFallback) && resolvedFallback > 0) return <>{formatMarketPrice(resolvedFallback)}</>;
  if (error) return <>No data</>;
  return <>No data</>;
}
