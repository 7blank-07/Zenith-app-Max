'use client';

import { useRouter } from 'next/navigation';
import styles from './BlogLayout.module.css';

function extractPlayerId(input) {
  if (!input) return null;
  // If it's already the expected format (e.g. 3054323_0_0)
  if (input.includes('_')) return input;
  
  // If it's a slug like lizarazu-119-3054323
  const parts = input.split('-');
  const lastPart = parts[parts.length - 1];
  
  // Check if the last part is a number (base ID)
  if (/^\d+$/.test(lastPart)) {
    return `${lastPart}_0_0`;
  }
  
  // Fallback
  return `${input}_0_0`;
}

export default function LinkedPlayerActions({ linkedPlayerId }) {
  const router = useRouter();
  if (!linkedPlayerId) return null;

  const normalizedId = extractPlayerId(linkedPlayerId);

  const handleAddToTeamBuilder = () => {
    window.sessionStorage.setItem('squad_pending_add', normalizedId);
    router.push(`/tools/squad-builder`);
  };

  const handleAddToCompare = () => {
    window.sessionStorage.setItem('compare_pending_add', normalizedId);
    router.push(`/tools/player-compare`);
  };

  return (
    <div className={styles.linkedPlayerBanner}>
      <div className={styles.linkedPlayerBannerInfo}>
        <div className={styles.linkedPlayerBannerIcon}>
          <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        </div>
        <div className={styles.linkedPlayerBannerText}>
          <h3 className={styles.linkedPlayerBannerTitle}>Want to use this player?</h3>
          <p className={styles.linkedPlayerBannerDesc}>Add them straight to your squad or compare their stats.</p>
        </div>
      </div>
      <div className={styles.linkedPlayerBannerActions}>
        <button 
          type="button" 
          onClick={handleAddToTeamBuilder}
          className={styles.linkedPlayerBtn}
        >
          <span className={styles.icon}>+</span> Squad Builder
        </button>
        <button 
          type="button" 
          onClick={handleAddToCompare}
          className={styles.linkedPlayerBtnAlt}
        >
          <span className={styles.icon}>⇄</span> Compare
        </button>
      </div>
    </div>
  );
}
