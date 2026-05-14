'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './TopTenAdmin.module.css';
import commonStyles from '../../components/admin/AdminShell.module.css';

export default function PlayerSearchModal({ position, onSelect, onClose }) {
  const [query, setQuery] = useState('');
  const [minOvr, setMinOvr] = useState('80');
  const [maxOvr, setMaxOvr] = useState('120');
  const [auctionableOnly, setAuctionableOnly] = useState(false);
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);

  const performSearch = useCallback(async () => {
    setIsSearching(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        q: query,
        position: position,
        min_ovr: minOvr,
        max_ovr: maxOvr,
        rank: '0', // Always search for base cards (Rank 0) to avoid 120 OVR "fake" versions
        limit: '20'
      });

      if (auctionableOnly) {
        params.set('is_untradable', '0');
      }
      
      console.log(`[PlayerSearchModal] Searching for: ${query} (${position}) OVR: ${minOvr}-${maxOvr} Auctionable: ${auctionableOnly}`);
      const res = await fetch(`/internal-api/players/search?${params.toString()}`);
      
      if (!res.ok) {
        throw new Error(`Search failed with status: ${res.status}`);
      }

      const data = await res.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      // The API returns a list of players
      let players = [];
      if (Array.isArray(data)) {
        players = data;
      } else if (data.players && Array.isArray(data.players)) {
        players = data.players;
      }

      setResults(players);
    } catch (err) {
      console.error('Search failed:', err);
      setError(err.message);
    } finally {
      setIsSearching(false);
    }
  }, [query, position, minOvr, maxOvr, auctionableOnly]);


  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch();
    }, 400);
    return () => clearTimeout(timer);
  }, [performSearch]);

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={commonStyles.tableTitle}>Find Player ({position})</h3>
          <button className={styles.closeBtn} onClick={onClose}>&times;</button>
        </div>

        <div className={styles.searchFilters}>
          <div className={commonStyles.field}>
            <label className={commonStyles.label}>Name</label>
            <input
              type="text"
              className={commonStyles.input}
              placeholder="Search by name..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
          </div>
          <div className={styles.ovrFilterRow}>
            <div className={commonStyles.field}>
              <label className={commonStyles.label}>Min OVR</label>
              <input
                type="number"
                className={commonStyles.input}
                value={minOvr}
                onChange={(e) => setMinOvr(e.target.value)}
              />
            </div>
            <div className={commonStyles.field}>
              <label className={commonStyles.label}>Max OVR</label>
              <input
                type="number"
                className={commonStyles.input}
                value={maxOvr}
                onChange={(e) => setMaxOvr(e.target.value)}
              />
            </div>
          </div>
          <div className={commonStyles.field} style={{ marginTop: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className={commonStyles.label}>Auctionable Only</label>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={auctionableOnly}
                  onChange={(e) => setAuctionableOnly(e.target.checked)}
                />
                <span className="toggle-slider" />
              </label>
            </div>
            <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px', marginBottom: 0 }}>
              <span>{auctionableOnly ? 'Only With Prices' : 'All Players'}</span>
            </p>
          </div>
        </div>

        <div className={styles.resultsList}>
          {isSearching ? (
            <div className={styles.loading}>Searching players...</div>
          ) : error ? (
            <div className={styles.error}>
              <p><strong>Search Error:</strong> {error}</p>
              <p className={styles.errorHint}>Please check the backend API status or your network connection.</p>
            </div>
          ) : results.length > 0 ? (
            results.map((player) => (
              <button
                key={player.playerId || player.id}
                className={styles.resultItem}
                onClick={() => onSelect(player)}
              >
                <div className={styles.resultAvatar}>
                  {player.image && <img src={player.image} alt={player.name} />}
                </div>
                <div className={styles.resultInfo}>
                  <div className={styles.resultName}>{player.name}</div>
                  <div className={styles.resultMeta}>
                    <span className={styles.resultOvr}>OVR {player.ovr}</span>
                    <span className={styles.resultSub}>{player.club} • {player.nation}</span>
                  </div>
                </div>
                <div className={styles.selectHint}>Select</div>
              </button>
            ))
          ) : (
            <div className={styles.noResults}>No players found matching your criteria.</div>
          )}
        </div>
      </div>
    </div>
  );
}
