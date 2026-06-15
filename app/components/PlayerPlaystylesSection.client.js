'use client';

import { useEffect, useState } from 'react';

export default function PlayerPlaystylesSection({ playerId, currentRank = 0 }) {
  const [playstyles, setPlaystyles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!playerId) return;
    setLoading(true);
    fetch(`/api/players/${encodeURIComponent(playerId)}?rank=${currentRank}&_t=${Date.now()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.playstyles) setPlaystyles(data.playstyles);
      })
      .catch((e) => console.error('[PlayerPlaystylesSection]', e))
      .finally(() => setLoading(false));
  }, [playerId, currentRank]);

  if (loading) return null;
  if (!playstyles || playstyles.length === 0) return null;

  return (
    <section className="player-skills-section" style={{ marginTop: '24px' }}>
      <div className="skills-header" style={{ marginBottom: '16px' }}>
        <h3>Playstyles</h3>
      </div>
      <div className="skills-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '16px'
      }}>
        {playstyles.map((ps) => {
          const icon = ps.level === 2 ? ps.icon_level_2 : ps.icon_level_1;
          const isGold = ps.level === 2;
          const levelName = isGold ? 'Level 2' : 'Level 1';
          const color = isGold ? '#FFD700' : '#E0E0E0';
          const bgGradient = isGold 
            ? 'linear-gradient(135deg, rgba(255,215,0,0.1) 0%, rgba(255,215,0,0.02) 100%)'
            : 'linear-gradient(135deg, rgba(224,224,224,0.1) 0%, rgba(224,224,224,0.02) 100%)';
          
          return (
            <div key={ps.playstyle_name} style={{
              background: bgGradient,
              border: `1px solid ${color}40`,
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: '16px',
              boxShadow: `0 8px 24px ${color}10`,
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'default',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = `0 12px 32px ${color}20`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = `0 8px 24px ${color}10`;
            }}>
              {icon && (
                <div style={{ flexShrink: 0, width: '64px', height: '64px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <img src={icon} alt={ps.playstyle_name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                </div>
              )}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <div style={{ fontWeight: 800, fontSize: '15px', color: 'var(--color-text-primary, #fff)', textTransform: 'uppercase' }}>
                    {ps.playstyle_name}
                  </div>
                  <div style={{ 
                    fontSize: '11px', 
                    fontWeight: 800, 
                    color: '#14181C', 
                    background: color,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    textTransform: 'uppercase'
                  }}>
                    {levelName}
                  </div>
                </div>
                {ps.description && (
                  <p style={{ fontSize: '13px', color: 'var(--color-text-muted, #98A0A6)', margin: 0, lineHeight: 1.4 }}>
                    {ps.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
