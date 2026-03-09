'use client';

import { useEffect, useState } from 'react';
import { PLAYER_TRAINING_BOOSTS_EVENT, clamp, fetchTrainingBoosts, toNumber } from './player-skill-stats-utils';

function dispatchTrainingBoosts(playerId, trainingLevel, boosts) {
  if (typeof window === 'undefined') return;
  const normalizedPlayerId = String(playerId || '').trim();
  if (!normalizedPlayerId) return;
  window.dispatchEvent(
    new CustomEvent(PLAYER_TRAINING_BOOSTS_EVENT, {
      detail: {
        playerId: normalizedPlayerId,
        trainingLevel: clamp(toNumber(trainingLevel, 0), 0, 30),
        boosts: boosts && typeof boosts === 'object' ? boosts : {}
      }
    })
  );
}

export default function PlayerTrainingLevelPanel({ playerId, position, rank = 0 }) {
  const normalizedPlayerId = String(playerId || '').trim();
  const normalizedPosition = String(position || '').trim();
  const [trainingLevel, setTrainingLevel] = useState(0);

  useEffect(() => {
    setTrainingLevel(0);
    dispatchTrainingBoosts(normalizedPlayerId, 0, {});
  }, [normalizedPlayerId]);

  useEffect(() => {
    let isActive = true;
    const controller = new AbortController();
    const loadBoosts = async () => {
      if (!normalizedPlayerId || trainingLevel <= 0 || !normalizedPosition) {
        dispatchTrainingBoosts(normalizedPlayerId, trainingLevel, {});
        return;
      }
      try {
        const boosts = await fetchTrainingBoosts(normalizedPosition, trainingLevel, controller.signal);
        if (!isActive) return;
        dispatchTrainingBoosts(normalizedPlayerId, trainingLevel, boosts);
      } catch (error) {
        if (!isActive || error?.name === 'AbortError') return;
        console.error('[player-detail] Failed to load training boosts:', error);
        dispatchTrainingBoosts(normalizedPlayerId, trainingLevel, {});
      }
    };

    loadBoosts();
    return () => {
      isActive = false;
      controller.abort();
    };
  }, [normalizedPlayerId, normalizedPosition, trainingLevel]);

  useEffect(
    () => () => {
      dispatchTrainingBoosts(normalizedPlayerId, 0, {});
    },
    [normalizedPlayerId]
  );

  return (
    <div
      style={{
        background: 'rgba(20,24,28)',
        border: '1px solid rgba(0,194,168,0.12)',
        borderRadius: '10px',
        padding: '16px'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)', textTransform: 'uppercase' }}>Training Level</span>
        <div
          data-skill-points
          style={{
            background: 'rgba(0,194,168,0.15)',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: 700,
            color: 'var(--color-teal-500)'
          }}
        >
          {Math.max(0, clamp(toNumber(rank, 0), 0, 5))} Points
        </div>
      </div>
      <select
        id={`training-level-${normalizedPlayerId}`}
        data-training-level
        value={trainingLevel}
        onChange={(event) => {
          const nextLevel = clamp(toNumber(event.target.value, 0), 0, 30);
          setTrainingLevel(nextLevel);
        }}
        style={{
          width: '100%',
          background: 'var(--color-graphite-800)',
          border: '2px solid rgba(0,194,168,0.2)',
          borderRadius: '8px',
          padding: '12px 16px',
          fontSize: '14px',
          fontWeight: 600,
          color: 'var(--color-text-primary)',
          cursor: 'pointer'
        }}
      >
        <option value="0">No Training</option>
        {Array.from({ length: 30 }, (_, index) => index + 1).map((level) => (
          <option key={`${normalizedPlayerId}-training-${level}`} value={level}>
            Level {level}
          </option>
        ))}
      </select>

      <div
        data-training-indicator
        style={{
          marginTop: '12px',
          padding: '10px',
          background: 'rgba(59,214,113,0.08)',
          border: '1px solid rgba(59,214,113,0.15)',
          borderRadius: '6px',
          display: trainingLevel > 0 ? 'flex' : 'none',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        <span style={{ fontSize: '12px', color: '#3BD671', fontWeight: 600 }}>
          Training Level <span data-training-level-value>{trainingLevel}</span> Active
        </span>
      </div>
    </div>
  );
}
