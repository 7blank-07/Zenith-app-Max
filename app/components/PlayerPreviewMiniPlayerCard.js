import Link from 'next/link';
import Image from 'next/image';
import styles from './PlayerPreviewMiniPlayerCard.module.css';
import { getStatAccentColor } from './player-skill-stats-utils';
import { UNTRADABLE_CARD_BADGE_URL } from './image-asset-urls';
import { buildPlayerPath } from '../../src/lib/player-slug.mjs';
import { getOptimizedZenithUrl } from '../../src/lib/image-optimization.mjs';

const STAT_MAPPING = {
  ST: ['PAC', 'SHO', 'PAS', 'DRI', 'DEF', 'PHY'],
  LW: ['PAC', 'SHO', 'PAS', 'DRI', 'DEF', 'PHY'],
  RW: ['PAC', 'SHO', 'PAS', 'DRI', 'DEF', 'PHY'],
  LM: ['PAC', 'SHO', 'PAS', 'DRI', 'DEF', 'PHY'],
  RM: ['PAC', 'SHO', 'PAS', 'DRI', 'DEF', 'PHY'],
  CAM: ['PAC', 'SHO', 'PAS', 'DRI', 'DEF', 'PHY'],
  CM: ['PAC', 'SHO', 'PAS', 'DRI', 'DEF', 'PHY'],
  CDM: ['PAC', 'SHO', 'PAS', 'DRI', 'DEF', 'PHY'],
  LB: ['PAC', 'SHO', 'PAS', 'DRI', 'DEF', 'PHY'],
  RB: ['PAC', 'SHO', 'PAS', 'DRI', 'DEF', 'PHY'],
  CB: ['PAC', 'SHO', 'PAS', 'DRI', 'DEF', 'PHY'],
  GK: ['DIV', 'HAN', 'KIC', 'REF', 'SPD', 'POS']
};

export default function PlayerPreviewMiniPlayerCard({ player, rank, archetype, isFeatured = false }) {
  if (!player) return null;

  const position = player.position || 'ST';
  const statsToShow = STAT_MAPPING[position] || ['PAC', 'SHO', 'PAS', 'DRI', 'DEF', 'PHY'];
  const cardVariant = player.leagueImage ? 'normal' : 'hero';
  const playerPath = buildPlayerPath(player);
  
  // Extract stats from player object
  const getStatValue = (label) => {
    const key = label.toLowerCase();
    const attr = player.attributes || {};
    
    // Mapping display labels to attribute keys
    const mapping = {
      pac: attr.pace,
      sho: attr.shooting,
      pas: attr.passing,
      dri: attr.dribbling,
      def: attr.defending,
      phy: attr.physical,
      div: attr.diving,
      han: attr.handling,
      kic: attr.kicking,
      ref: attr.reflexes,
      spd: attr.sprintSpeed,
      pos: attr.positioning
    };

    return mapping[key] ?? '??';
  };

  const optimizedBackground = getOptimizedZenithUrl(player.cardBackground || 'https://via.placeholder.com/300x400', 1024);
  const optimizedPlayerImage = getOptimizedZenithUrl(player.playerImage || player.image || 'https://via.placeholder.com/256', 256);

  return (
    <div className={`${styles.card} ${isFeatured ? styles.featured : ''}`}>
      <div className={styles.rankBadge}>#{rank}</div>
      
      <div className={styles.cardContent}>
        <div className={styles.playerSection}>
          <div className="dashboard-player-card" style={{ width: '100%', maxWidth: '130px', margin: '0 auto' }}>
            <div className="card-container">
              <Image
                src={optimizedBackground}
                alt="Card Background"
                className="card-background-img"
                fill
                sizes="130px"
                unoptimized
              />
              <Image
                src={optimizedPlayerImage}
                alt={player.name || 'Player'}
                className="player-image-img"
                width={256}
                height={256}
                unoptimized
              />
              


              {player.nationFlag && (
                <img
                  src={player.nationFlag}
                  alt="Nation"
                  className={`card-nation-flag-home ${
                    cardVariant === 'normal' ? 'normal-nation-flag-home' : 'hero-icon-nation-flag-home'
                  }`}
                  width={18}
                  height={18}
                  loading="lazy"
                />
              )}
              {player.clubFlag && (
                <img
                  src={player.clubFlag}
                  alt="Club"
                  className={`card-club-flag-home ${cardVariant === 'normal' ? 'normal-club-flag-home' : 'hero-icon-club-flag-home'}`}
                  width={18}
                  height={18}
                  loading="lazy"
                />
              )}
              {cardVariant === 'normal' && !!player.leagueImage && (
                <img
                  src={player.leagueImage}
                  alt="League"
                  className="card-league-flag-home normal-league-flag-home"
                  width={18}
                  height={18}
                  loading="lazy"
                />
              )}

              {player.isUntradable && (
                <div className="card-untradable-badge">
                  <img src={UNTRADABLE_CARD_BADGE_URL} alt="Untradable" width={16} height={16} loading="lazy" />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={styles.metaSection}>
          {archetype && <div className={styles.archetype}>{archetype}</div>}
        </div>

        <div className={styles.statsGrid}>
          {statsToShow.map((stat) => {
            const val = getStatValue(stat);
            return (
              <div key={stat} className={styles.statBox}>
                <span className={styles.statVal} style={{ color: getStatAccentColor(val) }}>
                  {val}
                </span>
                <span className={styles.statLabel}>{stat}</span>
              </div>
            );
          })}
        </div>

        <Link href={playerPath} className={styles.cta}>
          View Player
        </Link>
      </div>
    </div>
  );
}
