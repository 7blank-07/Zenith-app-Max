'use client';

import { useEffect, useState } from 'react';

function formatPlaystyleDescription(desc, level) {
  if (!desc) return '';
  
  // 1. Delete everything before the word "Player" (case-insensitive)
  const playerIndex = desc.toLowerCase().indexOf('player');
  if (playerIndex !== -1) {
    desc = desc.substring(playerIndex);
  }
  
  // Ensure 'Player' is capitalized if it wasn't
  if (desc.toLowerCase().startsWith('player')) {
    desc = 'Player' + desc.substring(6);
  }

  // 2. Extract base text and level texts
  const lvl1Match = desc.match(/Lvl\s*1\s*:/i);
  const lvl2Match = desc.match(/Lvl\s*2\s*:/i);
  
  let baseText = desc;
  let lvl1Text = '';
  let lvl2Text = '';
  
  if (lvl1Match && lvl2Match) {
    const firstIdx = Math.min(lvl1Match.index, lvl2Match.index);
    baseText = desc.substring(0, firstIdx).trim();
    if (lvl1Match.index < lvl2Match.index) {
      lvl1Text = desc.substring(lvl1Match.index, lvl2Match.index).trim();
      lvl2Text = desc.substring(lvl2Match.index).trim();
    } else {
      lvl2Text = desc.substring(lvl2Match.index, lvl1Match.index).trim();
      lvl1Text = desc.substring(lvl1Match.index).trim();
    }
  } else if (lvl1Match) {
    baseText = desc.substring(0, lvl1Match.index).trim();
    lvl1Text = desc.substring(lvl1Match.index).trim();
  } else if (lvl2Match) {
    baseText = desc.substring(0, lvl2Match.index).trim();
    lvl2Text = desc.substring(lvl2Match.index).trim();
  }
  
  // 3. Return the specific level string
  if (level === 2) {
     return `${baseText} ${lvl2Text}`.trim();
  } else {
     return `${baseText} ${lvl1Text}`.trim();
  }
}

export default function PlayerPlaystylesSection({ playerId, currentRank = 0 }) {
  const [playstyles, setPlaystyles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!playerId) return;
    setLoading(true);
    fetch(`/api/players/${encodeURIComponent(playerId)}?rank=${currentRank}&_t=${Date.now()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.playstyles) {
          // Ensure uniqueness by playstyle_name and limit to 2 max
          const uniqueMap = new Map();
          data.playstyles.forEach(ps => {
            if (!uniqueMap.has(ps.playstyle_name)) {
              uniqueMap.set(ps.playstyle_name, ps);
            }
          });
          const deduplicated = Array.from(uniqueMap.values()).slice(0, 2);
          
          // Apply business rule: If exactly 2 playstyles, 1st is always Lvl 2, 2nd is always Lvl 1
          if (deduplicated.length === 2) {
            deduplicated[0].level = 2;
            deduplicated[1].level = 1;
          }
          
          setPlaystyles(deduplicated);
        }
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
        gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
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
              alignItems: 'flex-start',
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
                    {formatPlaystyleDescription(ps.description, ps.level)}
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
