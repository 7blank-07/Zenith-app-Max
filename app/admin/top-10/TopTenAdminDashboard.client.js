'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import styles from './TopTenAdmin.module.css';
import commonStyles from '../../components/admin/AdminShell.module.css';
import RankingBoard from './RankingBoard.client';

export default function TopTenAdminDashboard({
  positions,
  initialPosition,
  initialStatus,
  initialRankings,
  topTenCounts
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [currentPosition, setCurrentPosition] = useState(initialPosition);
  const [currentStatus, setCurrentStatus] = useState(initialStatus);

  const handlePositionChange = (pos) => {
    setCurrentPosition(pos);
    startTransition(() => {
      router.push(`/admin/top-10?pos=${pos}&status=${currentStatus}`);
    });
  };

  const handleStatusChange = (status) => {
    setCurrentStatus(status);
    startTransition(() => {
      router.push(`/admin/top-10?pos=${currentPosition}&status=${status}`);
    });
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.layout}>
        {/* Left Panel: Position Selector */}
        <aside className={styles.posPanel}>
          <div className={commonStyles.tableCard}>
            <h3 className={commonStyles.label} style={{ marginBottom: '16px' }}>Positions</h3>
            <div className={styles.posGrid}>
              {positions.map((pos) => {
                const count = topTenCounts.find(c => c.position === pos && c.status === 'live')?.count || 0;
                const hasDraft = topTenCounts.some(c => c.position === pos && c.status === 'draft');
                
                return (
                  <button
                    key={pos}
                    className={`${styles.posButton} ${currentPosition === pos ? styles.posButtonActive : ''}`}
                    onClick={() => handlePositionChange(pos)}
                    disabled={isPending}
                  >
                    <span className={styles.posName}>{pos}</span>
                    <div className={styles.posMeta}>
                      <span className={styles.posCount}>{count}/10</span>
                      {hasDraft && <span className={styles.draftDot} title="Has unpublished draft" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Main Panel: Ranking Board */}
        <main className={styles.boardPanel}>
          <div className={commonStyles.tableCard}>
            <div className={commonStyles.tableHeader}>
              <div>
                <h2 className={commonStyles.tableTitle}>{currentPosition} Rankings</h2>
                <p className={commonStyles.tableDescription}>
                  Manage the Top 10 {currentPosition}s. Drag to reorder, click to replace.
                </p>
              </div>
              <div className={styles.statusToggle}>
                <button
                  className={`${styles.toggleBtn} ${currentStatus === 'draft' ? styles.toggleBtnActive : ''}`}
                  onClick={() => handleStatusChange('draft')}
                >
                  Draft
                </button>
                <button
                  className={`${styles.toggleBtn} ${currentStatus === 'live' ? styles.toggleBtnActive : ''}`}
                  onClick={() => handleStatusChange('live')}
                >
                  Live
                </button>
              </div>
            </div>

            <RankingBoard
              position={currentPosition}
              status={currentStatus}
              initialRankings={initialRankings}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
