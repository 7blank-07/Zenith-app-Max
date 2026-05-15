'use client';

import { useEffect, useMemo, useState } from 'react';
import { PLAYER_SKILL_BOOSTS_EVENT, PLAYER_TRAINING_BOOSTS_EVENT, buildLegacyStatsModel, getStatAccentColor } from './player-skill-stats-utils';

function hasProfileValue(value) {
  if (value == null) return false;
  const text = String(value).trim();
  return text.length > 0 && text.toLowerCase() !== 'unknown';
}

export default function PlayerStatisticsSection({
  player,
  playerId,
  profileSectionTitle = 'Profile Overview',
  profileRows = [],
  profileCollections = [],
  profileSummary = ''
}) {
  const normalizedPlayerId = String(playerId || player?.playerId || '').trim();
  const [skillBoosts, setSkillBoosts] = useState({});
  const [trainingBoosts, setTrainingBoosts] = useState({});

  useEffect(() => {
    setSkillBoosts({});
    setTrainingBoosts({});
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

  useEffect(() => {
    if (!normalizedPlayerId || typeof window === 'undefined') return undefined;
    const handleTrainingBoostChange = (event) => {
      const detail = event?.detail || {};
      const eventPlayerId = String(detail.playerId || '').trim();
      if (eventPlayerId !== normalizedPlayerId) return;
      const nextBoosts = detail.boosts && typeof detail.boosts === 'object' ? detail.boosts : {};
      setTrainingBoosts(nextBoosts);
    };
    window.addEventListener(PLAYER_TRAINING_BOOSTS_EVENT, handleTrainingBoostChange);
    return () => {
      window.removeEventListener(PLAYER_TRAINING_BOOSTS_EVENT, handleTrainingBoostChange);
    };
  }, [normalizedPlayerId]);

  const statsModel = useMemo(
    () => buildLegacyStatsModel(player, { skillBoosts, trainingBoosts }),
    [player, skillBoosts, trainingBoosts]
  );
  const visibleRows = Array.isArray(profileRows)
    ? profileRows.filter((item) => item && item.label && hasProfileValue(item.value))
    : [];
  const visibleCollections = Array.isArray(profileCollections)
    ? profileCollections
        .map((group) => ({
          key: group?.key,
          title: group?.title,
          items: Array.isArray(group?.items) ? group.items.filter((item) => item && item.name) : []
        }))
        .filter((group) => group.title && group.items.length > 0)
    : [];
  const shouldRenderProfile = visibleRows.length > 0 || visibleCollections.length > 0 || hasProfileValue(profileSummary);
  const shouldUseInlineProfileRail = shouldRenderProfile && statsModel.categories.length >= 6;

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
        <div className={`player-detail-stats-layout ${shouldUseInlineProfileRail ? 'with-profile-rail' : ''}`}>
          <div className="player-detail-stats-grid">
            {statsModel.categories.map((category) => (
              <article
                key={category.key}
                className="player-detail-stat-card"
                style={{
                  background: 'var(--color-graphite-800, #14181C)',
                  border: '1px solid var(--player-detail-sub-panel-border)',
                  borderLeft: '4px solid #00C2A8',
                  borderRadius: 'var(--radius-lg, 12px)',
                  padding: '20px',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div
                  className="player-detail-stat-header"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '16px',
                    paddingBottom: '12px',
                    borderBottom: '1px solid var(--player-detail-sub-panel-border)'
                  }}
                >
                  <h3
                    className="player-detail-stat-title"
                    style={{
                      margin: 0,
                      fontSize: '16px',
                      color: 'var(--color-text-primary, #E6EEF2)',
                      textTransform: 'uppercase',
                      minWidth: 0
                    }}
                  >
                    {category.name}
                  </h3>
                  <div
                    className="player-detail-stat-value"
                    style={{
                      fontSize: '30px',
                      fontWeight: 900,
                      color: getStatAccentColor(category.mainValue),
                      lineHeight: 1,
                      flexShrink: 0
                    }}
                  >
                    {category.mainValue}
                  </div>
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
                            borderBottom: '1px solid var(--player-detail-sub-panel-border)',
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
                            borderBottom: '1px solid var(--player-detail-sub-panel-border)',
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
          {shouldRenderProfile ? (
            <aside className={`player-detail-profile-card ${shouldUseInlineProfileRail ? 'inline-rail' : ''}`}>
              <h3>{profileSectionTitle}</h3>
              {visibleRows.length > 0 ? (
                <div className="player-detail-profile-grid">
                  {visibleRows.map((item) => (
                    <article key={item.label} className="player-detail-profile-item">
                      <h4>{item.label}</h4>
                      <p>{item.value}</p>
                    </article>
                  ))}
                </div>
              ) : null}

              {visibleCollections.map((group) => (
                <div key={group.key || group.title} className="player-detail-profile-group">
                  <h4>{group.title}</h4>
                  <div className="player-detail-profile-media-grid">
                    {group.items.map((item) => (
                      <article key={item.id || item.name} className="player-detail-profile-media-item">
                        {item.icon ? (
                          <img
                            src={item.icon}
                            alt={item.name}
                            width="24"
                            height="24"
                            loading="lazy"
                            onError={(event) => {
                              event.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : null}
                        <span>{item.name}</span>
                      </article>
                    ))}
                  </div>
                </div>
              ))}

              {!visibleRows.length && !visibleCollections.length && hasProfileValue(profileSummary) ? (
                <p className="player-detail-profile-summary">{profileSummary}</p>
              ) : null}
            </aside>
          ) : null}
        </div>
      </div>
    </section>
  );
}
