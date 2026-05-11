'use client';

import { useState, useEffect } from 'react';
import styles from './TopTenAdmin.module.css';
import commonStyles from '../../components/admin/AdminShell.module.css';
import PlayerSearchModal from './PlayerSearchModal.client';

export default function RankingBoard({ position, status, initialRankings }) {
  const [rankings, setRankings] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeRankIndex, setActiveRankIndex] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    // Fill with empty slots if less than 10
    const filled = [...initialRankings];
    for (let i = filled.length; i < 10; i++) {
      filled.push({ rank: i + 1, playerId: null, archetype: '', player: null });
    }
    setRankings(filled.sort((a, b) => a.rank - b.rank));
  }, [initialRankings, position, status]);

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData('index', index);
  };

  const handleDrop = (e, dropIndex) => {
    const dragIndex = e.dataTransfer.getData('index');
    if (dragIndex === undefined || dragIndex === '') return;
    
    const newRankings = [...rankings];
    const draggedItem = newRankings[dragIndex];
    newRankings.splice(dragIndex, 1);
    newRankings.splice(dropIndex, 0, draggedItem);
    
    // Re-assign ranks
    const updated = newRankings.map((item, idx) => ({
      ...item,
      rank: idx + 1
    }));
    
    setRankings(updated);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const openSearch = (index) => {
    setActiveRankIndex(index);
    setIsSearchOpen(true);
  };

  const handlePlayerSelect = (player) => {
    const newRankings = [...rankings];
    const playerId = player.playerId || player.id || player.player_id;
    
    if (!playerId) {
      console.error('Selected player is missing a valid ID:', player);
      alert('Error: Could not determine player ID. Please try another version.');
      return;
    }

    newRankings[activeRankIndex] = {
      ...newRankings[activeRankIndex],
      playerId: String(playerId),
      player: {
        ...player,
        playerId: String(playerId) // Ensure player object also has the normalized field
      }
    };
    setRankings(newRankings);
    setIsSearchOpen(false);
  };


  const handleArchetypeChange = (index, value) => {
    const newRankings = [...rankings];
    newRankings[index] = {
      ...newRankings[index],
      archetype: value
    };
    setRankings(newRankings);
  };

  const removePlayer = (index) => {
    const newRankings = [...rankings];
    newRankings[index] = {
      ...newRankings[index],
      playerId: null,
      player: null,
      archetype: ''
    };
    setRankings(newRankings);
  };

  const saveDraft = async () => {
    setIsSaving(true);
    setMessage(null);
    try {
      const payload = {
        action: 'save',
        position,
        rankings: rankings.filter(r => r.playerId).map(r => ({
          rank: r.rank,
          playerId: r.playerId,
          archetype: r.archetype
        }))
      };
      
      const res = await fetch('/api/admin/top-10', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Draft saved successfully!' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save draft' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
      setIsSaving(false);
    }
  };

  const publishLive = async () => {
    if (!confirm('Are you sure you want to publish these rankings live? This will overwrite the current live rankings.')) {
      return;
    }
    
    setIsPublishing(true);
    setMessage(null);
    try {
      const payload = {
        action: 'publish',
        position
      };
      
      const res = await fetch('/api/admin/top-10', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Rankings published live!' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to publish live' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className={styles.boardContainer}>
      {message && (
        <div className={`${commonStyles.noticeBanner} ${message.type === 'error' ? commonStyles.statusRejected : ''}`} style={{ marginBottom: '20px' }}>
          {message.text}
        </div>
      )}

      <div className={styles.rankingList}>
        {rankings.map((item, index) => (
          <div
            key={index}
            className={styles.rankingItem}
            draggable={status === 'draft'}
            onDragStart={(e) => handleDragStart(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            onDragOver={handleDragOver}
          >
            <div className={styles.rankNum}>#{item.rank}</div>
            
            <div className={styles.playerInfo}>
              <div className={styles.playerAvatar}>
                {item.player?.image ? (
                  <img src={item.player.image} alt={item.player.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: 'rgba(255,255,255,0.05)', display: 'grid', placeItems: 'center' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                )}
              </div>
              
              <div className={styles.playerMain}>
                <div className={styles.playerName}>{item.player?.name || 'Empty Slot'}</div>
                <div className={styles.playerMeta}>
                  {item.player ? `OVR ${item.player.ovr} • ${item.player.club || 'No Club'}` : 'Select a player to fill this rank'}
                </div>
              </div>
            </div>

            {item.player && (
              <input
                type="text"
                className={styles.archetypeInput}
                placeholder="Archetype (e.g. Meta Beast)"
                value={item.archetype || ''}
                onChange={(e) => handleArchetypeChange(index, e.target.value)}
                disabled={status !== 'draft'}
              />
            )}

            {status === 'draft' && (
              <div className={styles.actions}>
                <button
                  className={styles.actionBtn}
                  onClick={() => openSearch(index)}
                  title={item.player ? 'Replace Player' : 'Add Player'}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                </button>
                {item.player && (
                  <button
                    className={styles.actionBtn}
                    onClick={() => removePlayer(index)}
                    title="Remove Player"
                    style={{ color: '#f87171' }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18" />
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    </svg>
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {status === 'draft' && (
        <div className={styles.publishSection}>
          <button
            className={commonStyles.buttonSecondary}
            onClick={saveDraft}
            disabled={isSaving || isPublishing}
          >
            {isSaving ? 'Saving...' : 'Save as Draft'}
          </button>
          <button
            className={commonStyles.button}
            onClick={publishLive}
            disabled={isSaving || isPublishing}
          >
            {isPublishing ? 'Publishing...' : 'Publish Live'}
          </button>
        </div>
      )}

      {isSearchOpen && (
        <PlayerSearchModal
          position={position}
          onSelect={handlePlayerSelect}
          onClose={() => setIsSearchOpen(false)}
        />
      )}
    </div>
  );
}
