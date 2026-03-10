'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Chart from 'chart.js/auto';

const RANGE_OPTIONS = ['1D', '3D', '7D', '15D', '30D', 'Custom'];

function normalizeRank(rankValue) {
  const parsed = Number.parseInt(String(rankValue ?? '0'), 10);
  if (!Number.isFinite(parsed)) return 0;
  return Math.min(5, Math.max(0, parsed));
}

function getRangeDays(range, customDays) {
  switch (range) {
    case '1D':
      return 1;
    case '3D':
      return 3;
    case '7D':
      return 7;
    case '15D':
      return 15;
    case '30D':
      return 30;
    case 'Custom':
      return Math.min(Math.max(Number.parseInt(String(customDays || '7'), 10), 1), 30);
    default:
      return 7;
  }
}

function downsampleHistory(points, maxPoints = 200) {
  if (!Array.isArray(points) || points.length <= maxPoints) return points || [];
  const step = Math.ceil(points.length / maxPoints);
  const sampled = points.filter((_, index) => index % step === 0);
  const lastPoint = points[points.length - 1];
  if (sampled[sampled.length - 1] !== lastPoint) sampled.push(lastPoint);
  return sampled;
}

function formatMarketPrice(price) {
  const value = Number(price);
  if (!Number.isFinite(value) || value <= 0) return 'Free';
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(2)}K`;
  return value.toLocaleString();
}

async function fetchPriceHistoryFromApi({ playerId, rank, days }) {
  const params = new URLSearchParams({
    id: String(playerId),
    rank: String(rank),
    days: String(days)
  });
  const response = await fetch(`/api/player-price-history?${params.toString()}`);
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `HTTP ${response.status}`);
  }
  const json = await response.json();
  return Array.isArray(json.snapshots) ? json.snapshots : [];
}

export default function PlayerPriceHistorySection({ playerId, rank = 0, isAuctionable = true }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const [range, setRange] = useState('7D');
  const [customDays, setCustomDays] = useState(7);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [points, setPoints] = useState([]);
  const normalizedRank = useMemo(() => normalizeRank(rank), [rank]);
  const activeDays = useMemo(() => getRangeDays(range, customDays), [range, customDays]);

  useEffect(() => {
    if (!isAuctionable || !playerId) {
      setLoading(false);
      setError('');
      setPoints([]);
      return () => {};
    }

    let cancelled = false;
    const loadHistory = async () => {
      setLoading(true);
      setError('');

      try {
        console.info('[PRICE HISTORY] Fetching', { playerId, rank: normalizedRank, days: activeDays });
        const snapshots = await fetchPriceHistoryFromApi({
          playerId,
          rank: normalizedRank,
          days: activeDays
        });

        const normalized = (Array.isArray(snapshots) ? snapshots : [])
          .map((entry) => ({
            date: new Date(entry.capturedAt),
            price: Number(entry.price)
          }))
          .filter((entry) => Number.isFinite(entry.date.getTime()) && Number.isFinite(entry.price) && entry.price > 0)
          .sort((a, b) => a.date.getTime() - b.date.getTime());

        if (cancelled) return;
        const downsampled = downsampleHistory(normalized, 200);
        console.info('[PRICE HISTORY] Loaded', { playerId, pointsRaw: normalized.length, pointsDownsampled: downsampled.length });
        setPoints(downsampled);
      } catch (requestError) {
        if (cancelled) return;
        console.error('[PRICE HISTORY] Failed to load history:', { playerId, rank: normalizedRank, days: activeDays, error: requestError?.message || requestError });
        setError('Unable to load price history.');
        setPoints([]);
      } finally {
        if (cancelled) return;
        setLoading(false);
      }
    };

    loadHistory();
    return () => {
      cancelled = true;
    };
  }, [activeDays, isAuctionable, normalizedRank, playerId]);

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    if (!isAuctionable || loading || error || !points.length) return;

    const chartEl = canvasRef.current;
    if (!chartEl) return;

    const context = chartEl.getContext('2d');
    if (!context) return;

    const gradient = context.createLinearGradient(0, 0, 0, chartEl.parentElement?.clientHeight || chartEl.height || 200);
    gradient.addColorStop(0, 'rgba(0, 194, 168, 0.35)');
    gradient.addColorStop(1, 'rgba(0, 194, 168, 0.02)');

    chartRef.current = new Chart(context, {
      type: 'line',
      data: {
        labels: points.map((point) =>
          point.date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
          })
        ),
        datasets: [
          {
            data: points.map((point) => point.price),
            borderColor: '#00C2A8',
            backgroundColor: gradient,
            borderWidth: 2.5,
            fill: true,
            tension: 0.35,
            pointRadius: 0,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: '#E6EEF2',
            pointHoverBorderColor: '#00C2A8',
            pointHoverBorderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        resizeDelay: 80,
        plugins: {
          legend: { display: false },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: '#11161B',
            borderColor: 'rgba(0, 194, 168, 0.6)',
            borderWidth: 1,
            titleColor: '#E6EEF2',
            bodyColor: '#9CA3AF',
            padding: 12,
            displayColors: false,
            callbacks: {
              title(context) {
                const index = context?.[0]?.dataIndex ?? 0;
                const date = points[index]?.date;
                return date
                  ? date.toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric'
                    })
                  : '';
              },
              label(context) {
                return `Price: ${formatMarketPrice(context.parsed.y)}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255,255,255,0.04)' },
            ticks: {
              color: '#7E8A94',
              maxTicksLimit: 8
            }
          },
          y: {
            grid: { color: 'rgba(255,255,255,0.04)' },
            ticks: {
              color: '#7E8A94',
              callback(value) {
                return formatMarketPrice(value);
              }
            }
          }
        },
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false
        },
        animation: {
          duration: 600,
          easing: 'easeOutQuart'
        }
      }
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [error, isAuctionable, loading, points]);

  const showEmpty = !loading && (!isAuctionable || !!error || points.length === 0);
  const emptyMessage = !isAuctionable
    ? 'Price history unavailable for non-auctionable players.'
    : error || 'No price history data available for this range.';

  return (
    <section className="player-price-history-section" data-auctionable={isAuctionable ? 'true' : 'false'} data-range={range}>
      <div className="price-history-header">
        <div>
          <h3>Price History</h3>
          <span className="price-history-subtitle">Track market movement over time</span>
        </div>
        <div className="price-history-ranges" role="tablist" aria-label="Price history ranges">
          {RANGE_OPTIONS.map((label) => (
            <button
              key={`${playerId}-range-${label}`}
              className={`price-range-btn ${label === range ? 'active' : ''}`}
              data-range={label}
              type="button"
              onClick={() => setRange(label)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="price-history-custom">
        <div className="price-history-custom-label">
          Custom range: <span id="price-history-custom-days">{customDays}</span> days
        </div>
        <input
          className="price-history-slider"
          id="price-history-slider"
          type="range"
          min="1"
          max="30"
          value={customDays}
          onChange={(event) => setCustomDays(Math.min(Math.max(Number.parseInt(event.target.value, 10) || 7, 1), 30))}
        />
      </div>
      <div className="price-history-body">
        <div className="price-history-loading" id="price-history-loading" style={{ display: loading ? 'flex' : 'none' }}>
          <div className="price-history-skeleton" />
          <div className="price-history-skeleton" />
          <div className="price-history-skeleton" />
        </div>
        <div className="price-history-empty" id="price-history-empty" style={{ display: showEmpty ? 'flex' : 'none' }}>
          {emptyMessage}
        </div>
        <div className="price-history-chart">
          <canvas id="player-price-history-chart" ref={canvasRef} />
        </div>
      </div>
    </section>
  );
}
