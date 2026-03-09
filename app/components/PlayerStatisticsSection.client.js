'use client';

import { useEffect, useMemo, useState } from 'react';
import { PLAYER_SKILL_BOOSTS_EVENT, buildLegacyStatsModel, getStatAccentColor } from './player-skill-stats-utils';

export default function PlayerStatisticsSection({ player, playerId }) {
  const normalizedPlayerId = String(playerId || player?.playerId || '').trim();
  const [skillBoosts, setSkillBoosts] = useState({});

  useEffect(() => {
    setSkillBoosts({});
  }, [normalizedPlayerId]);

  useEffect(() => {
    if (!normalizedPlayerId || typeof window === 'undefined') return undefined;
    const handleBoostChange = (event) => {
      const detail = event?.detail || {};
      const eventPlayerId = String(detail.playerId || '').trim();
      if (eventPlayerId !== normalizedPlayerId) return;
      const nextBoosts = detail.boosts && typeof detail.boosts === 'object' ? detail.boosts : {};
      setSkillBoosts(nextBoosts);
    };
    window.addEventListener(PLAYER_SKILL_BOOSTS_EVENT, handleBoostChange);
    return () => {
      window.removeEventListener(PLAYER_SKILL_BOOSTS_EVENT, handleBoostChange);
    };
  }, [normalizedPlayerId]);

  const statsModel = useMemo(() => buildLegacyStatsModel(player, { skillBoosts }), [player, skillBoosts]);

  return (
    <section className="player-stats-section" style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px 20px 24px' }}>
      <h2
        style={{
          fontSize: '22px',
          fontWeight: 800,
          color: 'var(--color-text-primary, #E6EEF2)',
          margin: '0 0 20px 0',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}
      >
        {statsModel.title}
      </h2>
      <div className="stats-grid-container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {statsModel.categories.map((category) => (
            <article
              key={category.key}
              style={{
                background: 'var(--color-graphite-800, #14181C)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderLeft: '4px solid #00C2A8',
                borderRadius: 'var(--radius-lg, 12px)',
                padding: '20px'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px',
                  paddingBottom: '12px',
                  borderBottom: '1px solid rgba(255,255,255,0.08)'
                }}
              >
                <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--color-text-primary, #E6EEF2)', textTransform: 'uppercase' }}>{category.name}</h3>
                <div style={{ fontSize: '30px', fontWeight: 900, color: getStatAccentColor(category.mainValue), lineHeight: 1 }}>{category.mainValue}</div>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  {category.substats.map((row, index) => (
                    <tr key={`${category.key}-${row.label}-${index}`}>
                      <th
                        scope="row"
                        style={{
                          textAlign: 'left',
                          padding: '7px 0',
                          borderBottom: '1px solid rgba(255,255,255,0.08)',
                          color: 'var(--color-text-muted, #98A0A6)',
                          fontWeight: 600,
                          width: '72%'
                        }}
                      >
                        {row.label}
                      </th>
                      <td
                        style={{
                          textAlign: 'right',
                          padding: '7px 0',
                          borderBottom: '1px solid rgba(255,255,255,0.08)',
                          color: getStatAccentColor(row.value),
                          fontWeight: 800
                        }}
                      >
                        {row.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
