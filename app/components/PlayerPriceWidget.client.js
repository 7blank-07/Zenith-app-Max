'use client';

import { useEffect, useMemo, useState } from 'react';

const coinsFormatter = new Intl.NumberFormat('en-US');

function normalizeRank(rankValue) {
  const parsed = Number.parseInt(String(rankValue ?? '0'), 10);
  if (!Number.isFinite(parsed)) return 0;
  return Math.min(5, Math.max(0, parsed));
}

function formatPrice(value) {
  if (value === null || value === undefined) return 'N/A';
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 'N/A';
  return `${coinsFormatter.format(Math.round(numeric))} coins`;
}

export default function PlayerPriceWidget({ playerId, rank = 0, compact = false }) {
  const [price, setPrice] = useState(null);
  const [capturedAt, setCapturedAt] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const normalizedRank = useMemo(() => normalizeRank(rank), [rank]);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchPrice() {
      setLoading(true);
      setError('');

      try {
        const response = await fetch(
          `/api/player-price?id=${encodeURIComponent(playerId)}&rank=${encodeURIComponent(normalizedRank)}`,
          { signal: controller.signal, cache: 'no-store' }
        );
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload?.error || `Price request failed (${response.status})`);
        }

        setPrice(payload.price ?? null);
        setCapturedAt(payload.capturedAt ?? null);
      } catch (requestError) {
        if (requestError.name === 'AbortError') return;
        setError(requestError.message);
        setPrice(null);
        setCapturedAt(null);
      } finally {
        setLoading(false);
      }
    }

    fetchPrice();
    return () => controller.abort();
  }, [playerId, normalizedRank]);

  if (compact) {
    if (loading) return <p style={{ margin: 0 }}>Live price: loading...</p>;
    if (error) return <p style={{ margin: 0 }}>Live price unavailable.</p>;
    return <p style={{ margin: 0 }}>Live price: {formatPrice(price)}</p>;
  }

  return (
    <section style={{ marginTop: '20px', padding: '14px', borderRadius: '10px', border: '1px solid #d5d8dc' }}>
      <h2 style={{ margin: 0, fontSize: '18px' }}>Live Market Price</h2>
      {loading && <p style={{ marginTop: '8px' }}>Loading live price...</p>}
      {!loading && error && <p style={{ marginTop: '8px' }}>Price unavailable: {error}</p>}
      {!loading && !error && (
        <>
          <p style={{ marginTop: '8px', marginBottom: '4px' }}>{formatPrice(price)}</p>
          <p style={{ margin: 0, opacity: 0.8 }}>
            Snapshot: {capturedAt ? new Date(capturedAt).toLocaleString() : 'Unknown'}
          </p>
        </>
      )}
    </section>
  );
}
