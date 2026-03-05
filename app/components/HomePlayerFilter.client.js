'use client';

import { useEffect, useMemo, useState } from 'react';

export default function HomePlayerFilter({ positions = [] }) {
  const [selectedPosition, setSelectedPosition] = useState('all');
  const normalizedPositions = useMemo(
    () => [...new Set((positions || []).map((position) => String(position || '').trim()).filter(Boolean))].sort(),
    [positions]
  );

  useEffect(() => {
    const cards = document.querySelectorAll('[data-home-player-card]');
    cards.forEach((card) => {
      const cardPosition = (card.getAttribute('data-position') || '').trim();
      const shouldShow = selectedPosition === 'all' || selectedPosition === cardPosition;
      card.hidden = !shouldShow;
    });
  }, [selectedPosition]);

  return (
    <section style={{ marginBottom: '18px', padding: '10px 12px', border: '1px solid #d5d8dc', borderRadius: '8px' }}>
      <label htmlFor="home-position-filter" style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>
        Filter by Position
      </label>
      <select
        id="home-position-filter"
        value={selectedPosition}
        onChange={(event) => setSelectedPosition(event.target.value)}
        style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #bfc5cc', minWidth: '190px' }}
      >
        <option value="all">All Positions</option>
        {normalizedPositions.map((position) => (
          <option key={position} value={position}>
            {position}
          </option>
        ))}
      </select>
    </section>
  );
}
