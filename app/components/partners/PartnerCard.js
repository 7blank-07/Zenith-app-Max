import styles from './Partners.module.css';

function getPlatformLabel(platform) {
  switch (platform) {
    case 'youtube': return 'YouTube';
    case 'tiktok': return 'TikTok';
    case 'twitter': return 'X / Twitter';
    case 'discord': return 'Discord';
    case 'website': return 'Website';
    default: return platform;
  }
}

export default function PartnerCard({ partner }) {
  const isFeatured = partner.featured;
  const initials = partner.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className={`${styles.card} ${isFeatured ? styles.featuredCard : ''}`.trim()}>
      <div className={styles.cardHeader}>
        <div className={styles.avatarWrapper}>
          {partner.avatarUrl ? (
            <img src={partner.avatarUrl} alt={partner.name} className={styles.avatar} loading="lazy" />
          ) : (
            <div className={styles.fallbackAvatar}>{initials}</div>
          )}
          {partner.verified && (
            <div className={styles.verifiedBadge} title="Verified Partner">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
              </svg>
            </div>
          )}
        </div>
        <div className={styles.info}>
          <div className={styles.nameRow}>
            <h3 className={styles.name}>{partner.name}</h3>
          </div>
          {partner.username && <p className={styles.username}>{partner.username}</p>}
          <div className={styles.platformTag}>
            <span>{getPlatformLabel(partner.platform)}</span>
          </div>
        </div>
      </div>

      {partner.bio && <p className={styles.bio}>{partner.bio}</p>}

      <div className={styles.stats}>
        {partner.followerCount ? (
          <span className={styles.followerCount}>{partner.followerCount}</span>
        ) : (
          <span />
        )}
        <a 
          href={partner.socialUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          className={styles.visitButton}
        >
          Visit
        </a>
      </div>
    </div>
  );
}
