import Link from 'next/link';
import styles from './PlayerPreviewMiniPlayerCard.module.css';

const STAT_MAPPING = {
  ST: ['PAC', 'SHO', 'PHY'],
  LW: ['PAC', 'DRI', 'SHO'],
  RW: ['PAC', 'DRI', 'SHO'],
  CAM: ['PAS', 'DRI', 'SHO'],
  CM: ['PAS', 'DEF', 'PHY'],
  CDM: ['PAS', 'DEF', 'PHY'],
  LB: ['PAC', 'DEF', 'PAS'],
  RB: ['PAC', 'DEF', 'PAS'],
  CB: ['DEF', 'PHY', 'PAC'],
  GK: ['DIV', 'REF', 'HAN']
};

export default function PlayerPreviewMiniPlayerCard({ player, rank, archetype, isFeatured = false }) {
  if (!player) return null;

  const position = player.position || 'ST';
  const statsToShow = STAT_MAPPING[position] || ['PAC', 'SHO', 'DRI'];
  
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
      ref: attr.reflexes,
      han: attr.handling,
      pos: attr.positioning,
      kic: attr.kicking
    };

    return mapping[key] ?? '??';
  };

  return (
    <div className={`${styles.card} ${isFeatured ? styles.featured : ''}`}>
      <div className={styles.rankBadge}>#{rank}</div>
      
      <div className={styles.cardContent}>
        <div className={styles.playerSection}>
          <div className={styles.playerImageContainer}>
            {player.cardBackground && (
              <img src={player.cardBackground} alt="" className={styles.cardBg} />
            )}
            {player.playerImage && (
              <img src={player.playerImage} alt={player.name} className={styles.playerImg} />
            )}
          </div>
          
          <div className={styles.mainInfo}>
            <div className={styles.ovrPos}>
              <span className={styles.ovr} style={{ color: player.colorRating }}>{player.ovr}</span>
              <span className={styles.pos} style={{ color: player.colorPosition }}>{player.position}</span>
            </div>
            <div className={styles.playerName} style={{ color: player.colorName }}>{player.name}</div>
          </div>
        </div>

        <div className={styles.metaSection}>
          <div className={styles.flags}>
            {player.nationFlag && <img src={player.nationFlag} alt="" className={styles.flag} title={player.nation} />}
            {player.clubFlag && <img src={player.clubFlag} alt="" className={styles.flag} title={player.club} />}
          </div>
          {archetype && <div className={styles.archetype}>{archetype}</div>}
        </div>

        <div className={styles.statsGrid}>
          {statsToShow.map((stat) => (
            <div key={stat} className={styles.statBox}>
              <span className={styles.statVal}>{getStatValue(stat)}</span>
              <span className={styles.statLabel}>{stat}</span>
            </div>
          ))}
        </div>

        <Link href={`/player/${player.playerId || player.id}`} className={styles.cta}>
          View Player
        </Link>
      </div>
    </div>
  );
}
