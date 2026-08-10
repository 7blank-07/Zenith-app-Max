'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Num from './Num';
import AnimatedRankIcon from './AnimatedRankIcon.client';
import PlayerDetailInteractions from './PlayerDetailInteractions.client';
import PlayerMarketValue from './PlayerMarketValue.client';
import PlayerRefreshTimePanel from './PlayerRefreshTimePanel.client';
import PlayerSkillsAbilitiesSection from './PlayerSkillsAbilitiesSection.client';
import PlayerPlaystylesSection from './PlayerPlaystylesSection.client';
import PlayerStatisticsSection from './PlayerStatisticsSection.client';
import PlayerTrainingLevelPanel from './PlayerTrainingLevelPanel.client';
import AdsenseAd from './AdsenseAd';

import {
  buildProfileOverviewItems,
  formatProfileValue,
  formatWorkRateText,
  getPlayerCardVariant,
  parseRank,
  RANK_COLORS,
  RANK_SPRITES,
  renderStars
} from './player-detail-utils';
import { getPlayerUniqueId } from '../../src/lib/legacy-parity-contract.mjs';
import { buildPlayerSlug } from '../../src/lib/player-slug.mjs';

import { useRouter } from 'next/navigation';

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function readAttributeStat(record, key) {
  const attributes = record?.attributes && typeof record.attributes === 'object' ? record.attributes : {};
  return toNumber(attributes?.[key] ?? record?.[key], 0);
}

function buildRankPath(playerSlug, playerId, rank) {
  const pathSegment = String(playerSlug || playerId || '').trim();
  const encodedPathSegment = encodeURIComponent(pathSegment);
  return rank > 0 ? `/player/${encodedPathSegment}?rank=${rank}` : `/player/${encodedPathSegment}`;
}

async function fetchLocalPlayerRecord(playerId, rank, signal) {
  const response = await fetch(`/api/player-detail?id=${encodeURIComponent(playerId)}&rank=${encodeURIComponent(rank)}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    signal
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Failed to load local player detail (${response.status}): ${details || response.statusText}`);
  }

  return response.json();
}

export default function PlayerDetailContent({ initialRecord, initialRank = 0 }) {
  const router = useRouter();
  const normalizedInitialRank = parseRank(initialRank);
  const [record, setRecord] = useState(initialRecord);
  const [selectedRank, setSelectedRank] = useState(normalizedInitialRank);
  const [isRankLoading, setIsRankLoading] = useState(false);
  const requestControllerRef = useRef(null);
  const requestSequenceRef = useRef(0);
  const cardRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);

    const lastProcessedPlayerId = useRef(String(initialRecord?.playerId || ''));

  useEffect(() => {
    const nextPlayerId = String(initialRecord?.playerId || '');
    const isSamePlayer = lastProcessedPlayerId.current === nextPlayerId;
    lastProcessedPlayerId.current = nextPlayerId;

    if (!isSamePlayer) {
        setRecord(initialRecord);
        setSelectedRank(parseRank(initialRank));
        setIsRankLoading(false);
    }
    
    requestSequenceRef.current += 1;
    if (requestControllerRef.current) {
      requestControllerRef.current.abort();
      requestControllerRef.current = null;
    }
  }, [initialRecord, initialRank]);

  useEffect(
    () => () => {
      if (requestControllerRef.current) {
        requestControllerRef.current.abort();
      }
    },
    []
  );

  const playerId = String(record?.playerId || initialRecord?.playerId || '').trim();
  const recordId = String(record?.recordId || initialRecord?.recordId || '').trim();
  const playerSlug = buildPlayerSlug({
    playerId,
    recordId,
    name: initialRecord?.name || record?.name,
    ovr: initialRecord?.ovr || record?.ovr
  });
  const cardVariant = getPlayerCardVariant(record);
  const rawCardBackground = record?.cardBackground || record?.image || '/assets/images/zenith_logo_main.png';
  const rawCardImage = record?.playerImage || record?.image || '';
  
  const appendVersion = (url) => {
    if (!url) return url;
    // Strip existing version params if any
    url = url.split('?')[0];
    return url.includes('?') ? `${url}&v=3` : `${url}?v=3`;
  };

  // Error handler for image fallback
  const handleImageError = (e) => {
    if (e.target.dataset.failed) return;
    
    e.target.dataset.failed = "true";
    e.target.src = "/assets/images/zenith_logo_main.png";
    e.target.classList.add('fallback-logo-img');
  };

  const cardBackground = appendVersion(rawCardBackground);
  const cardImage = appendVersion(rawCardImage);
  const profileSummary = record?.summary || `${record?.name || 'Player'} profile and latest market context from Zenith.`;
  
  
    
    console.log('[DEBUG] record.workRateAttack:', record?.workRateAttack, typeof record?.workRateAttack);
    const wrMap = { '2': 'High', '1': 'Low', '0': 'Medium', 2: 'High', 1: 'Low', 0: 'Medium' };
    const workRateAttackLabel = wrMap[record?.workRateAttack] || formatWorkRateText(record?.workRateAttack);
    const workRateDefenseLabel = wrMap[record?.workRateDefense] || formatWorkRateText(record?.workRateDefense);
  const watchlistUniqueId = getPlayerUniqueId({
    playerId,
    rank: selectedRank,
    is_untradable: record?.isUntradable
  });
  const isAuctionable = !record?.isUntradable;
  const pacStat = readAttributeStat(record, 'pace');
  const shoStat = readAttributeStat(record, 'shooting');
  const pasStat = readAttributeStat(record, 'passing');
  const driStat = toNumber(record?.attributes?.dribbling_head ?? record?.dribbling_head ?? record?.attributes?.dribbling ?? record?.dribbling, 0);
  const defStat = readAttributeStat(record, 'defending');
  const phyStat = readAttributeStat(record, 'physical');

  const profileTraitItems = useMemo(
    () => buildProfileOverviewItems(record?.traits, record?.traitImages, 'Trait', 'profile-trait'),
    [record]
  );
  const profileAbilityItems = useMemo(
    () => buildProfileOverviewItems(record?.skills, record?.skillImages, 'Ability', 'profile-ability'),
    [record]
  );
  const profileOverviewFields = useMemo(
    () => [
      { label: 'Full Name', value: formatProfileValue(record?.fullName || record?.name) },
      { label: 'Event Name', value: formatProfileValue(record?.eventName) },
      { label: 'Nation', value: formatProfileValue(record?.nation) },
      { label: 'Height (ft/in)', value: formatProfileValue(record?.heightFtIn) },
      { label: 'Height (cm)', value: formatProfileValue(record?.heightCm) },
      { label: 'Weight (kg)', value: formatProfileValue(record?.weightKg) },
      { label: 'Work Rate Attack', value: workRateAttackLabel },
      { label: 'Work Rate Defense', value: workRateDefenseLabel },
      { label: 'Alternate Position', value: formatProfileValue(record?.alternatePosition) },
      { label: 'Date Added', value: formatProfileValue(record?.dateAdded) }
    ],
    [record, workRateAttackLabel, workRateDefenseLabel]
  );

  const updateBrowserPath = useCallback((nextRank) => {
    if (typeof window === "undefined") return;
    const searchParams = new URLSearchParams(window.location.search);
    if (nextRank > 0) {
      searchParams.set('rank', nextRank);
    } else {
      searchParams.delete('rank');
    }
    const nextSearch = searchParams.toString() ? "?" + searchParams.toString() : "";
    
    // Low-level replaceState avoids Next.js router from seeing the path segment changes 
    // and triggering a full page re-mount/reload.
    window.history.replaceState(null, "", window.location.pathname + nextSearch);
  }, []);

  const handleRankChange = useCallback(
    async (nextRankValue) => {
      const nextRank = parseRank(nextRankValue);
      const previousRank = selectedRank;
      if (!playerId || nextRank === previousRank) return;

      if (requestControllerRef.current) {
        requestControllerRef.current.abort();
      }

      const controller = new AbortController();
      requestControllerRef.current = controller;
      requestSequenceRef.current += 1;
      const requestId = requestSequenceRef.current;

      setSelectedRank(nextRank);
      setIsRankLoading(true);
      updateBrowserPath(nextRank);

      try {
        const payload = await fetchLocalPlayerRecord(playerId, nextRank, controller.signal);

        if (requestId !== requestSequenceRef.current) return;

        const nextRecord = payload?.record && typeof payload.record === 'object' ? payload.record : null;
        if (!nextRecord) {
          throw new Error('Rank response did not include a player record');
        }

        setRecord(nextRecord);
        setIsRankLoading(false);
      } catch (error) {
        if (error?.name === 'AbortError') return;
        console.error('[player-detail] Failed to update rank without reload:', error);
        if (requestId !== requestSequenceRef.current) return;
        setSelectedRank(previousRank);
        setIsRankLoading(false);
        updateBrowserPath(previousRank);
      }
    },
    [playerId, selectedRank, updateBrowserPath]
  );

  const handleAddToTeamBuilder = useCallback(() => {
    if (!playerId) return;
    window.sessionStorage.setItem('squad_pending_add', playerId);
    router.push(`/tools/squad-builder`);
  }, [playerId, router]);

  const handleAddToCompare = useCallback(() => {
    if (!playerId) return;
    window.sessionStorage.setItem('compare_pending_add', playerId);
    router.push(`/tools/player-compare`);
  }, [playerId, router]);

  const handleDownloadImage = useCallback(async () => {
    if (!cardRef.current) return;
    try {
      setIsDownloading(true);
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        logging: false
      });
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      const safeName = (record?.name || 'player').replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const ovr = record?.ovr || '0';
      link.download = `${safeName}_${ovr}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Failed to download image:', error);
      alert('Failed to download player card image.');
    } finally {
      setIsDownloading(false);
    }
  }, [record]);

  return (
    <>
      <button
        id="back-to-players-btn"
        data-go-back
        type="button"
        style={{
          background: 'transparent',
          border: '1px solid rgba(255,255,255,0.1)',
          color: 'var(--color-text-muted, #98A0A6)',
          padding: '12px 20px',
          borderRadius: 'var(--radius-base, 8px)',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 600,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '20px'
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back to Players
      </button>

      <section
        className="player-top-section"
        style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '28px', marginBottom: '32px' }}
      >
        <div className="player-summary-column" style={{ display: 'grid', gap: '18px', alignContent: 'start' }}>
          <div
            className="player-summary-panel"
            style={{
              background: 'var(--color-graphite-800, #14181C)',
              border: '1px solid rgba(0,194,168,0.15)',
              borderRadius: 'var(--radius-lg, 12px)',
              padding: '32px',
              boxShadow: 'var(--shadow-lg)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <button
               onClick={handleDownloadImage}
               disabled={isDownloading}
               title="Download Card Image"
               style={{
                 position: 'absolute',
                 top: '16px',
                 right: '16px',
                 background: 'rgba(255,255,255,0.1)',
                 backdropFilter: 'blur(4px)',
                 border: '1px solid rgba(255,255,255,0.25)',
                 borderRadius: '8px',
                 padding: '10px',
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center',
                 cursor: isDownloading ? 'wait' : 'pointer',
                 color: '#FFFFFF',
                 transition: 'all 0.2s ease',
                 zIndex: 10,
                 opacity: isDownloading ? 0.7 : 1,
                 boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
               }}
               onMouseEnter={(e) => { 
                 if(!isDownloading) { 
                   e.currentTarget.style.color = '#00C2A8'; 
                   e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; 
                   e.currentTarget.style.borderColor = 'rgba(0,194,168,0.4)';
                   e.currentTarget.style.transform = 'translateY(-2px)';
                 } 
               }}
               onMouseLeave={(e) => { 
                 if(!isDownloading) { 
                   e.currentTarget.style.color = '#FFFFFF'; 
                   e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; 
                   e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)';
                   e.currentTarget.style.transform = 'translateY(0)';
                 } 
               }}
            >
               {isDownloading ? (
                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="spinner" style={{ animation: 'spin 1s linear infinite' }}>
                   <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
                   <circle cx="12" cy="12" r="10" strokeDasharray="30" strokeDashoffset="10" />
                 </svg>
               ) : (
                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                   <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                   <polyline points="7 10 12 15 17 10" />
                   <line x1="12" y1="15" x2="12" y2="3" />
                 </svg>
               )}
            </button>
            <div
              ref={cardRef}
              className="player-detail-mini-card"
              style={{
                width: '260px',
                height: '260px',
                margin: '0 auto 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <img 
                src={cardBackground} 
                alt="Card Background" 
                className="card-background-img-inside" 
                onError={handleImageError}
              />
              {!!cardImage && (
                <img 
                  src={cardImage} 
                  alt={record?.name} 
                  className="player-image-img-inside" 
                  onError={handleImageError}
                />
              )}
              <div className="card-ovr-inside" style={{ color: record?.colorRating || '#FFFFFF' }}>
                {record?.ovr && record.ovr > 0 ? record.ovr : 'N/A'}
              </div>
              <div className="card-position-inside" style={{ color: record?.colorPosition || '#FFFFFF' }}>
                <Num>{record?.position || 'N/A'}</Num>
              </div>
              <div className="card-player-name-inside" style={{ color: record?.colorName || '#FFFFFF' }}>
                <Num>{record?.name}</Num>
              </div>
              {selectedRank > 0 && RANK_SPRITES[selectedRank] ? (
                <AnimatedRankIcon
                  className="rank-diamond-overlay rank-overlay--player-detail rank-overlay--animated"
                  rank={selectedRank}
                  spriteUrl={RANK_SPRITES[selectedRank]}
                  size={40}
                />
              ) : null}
              {!!record?.nationFlag && (
                <img
                  src={record.nationFlag}
                  alt="Nation"
                  className={`card-nation-flag-inside-detail ${
                    cardVariant === 'normal' ? 'normal-nation-flag-detail' : 'hero-icon-nation-flag-detail'
                  }`}
                />
              )}
              {!!record?.clubFlag && (
                <img
                  src={record.clubFlag}
                  alt="Club"
                  className={`card-club-flag-inside-detail ${
                    cardVariant === 'normal' ? 'normal-club-flag-detail' : 'hero-icon-club-flag-detail'
                  }`}
                />
              )}
              {cardVariant === 'normal' && !!record?.leagueImage && (
                <img src={record.leagueImage} alt="League" className="card-league-flag-inside normal-league-flag" />
              )}
            </div>

            <h1
              style={{
                fontSize: '28px',
                fontWeight: 800,
                color: 'var(--color-text-primary, #E6EEF2)',
                margin: '0 0 12px 0',
                textAlign: 'center',
                lineHeight: 1.2
              }}
            >
              <Num>{record?.name}</Num>
            </h1>

            <p
              style={{
                margin: '0 0 22px 0',
                textAlign: 'center',
                color: 'var(--color-text-muted, #98A0A6)',
                fontWeight: 600
              }}
            >
              OVR {record?.ovr} {record?.position ? <>• <Num>{record.position}</Num></> : ''} {record?.nation ? `• ${record.nation}` : ''}{' '}
              {record?.club ? `• ${record.club}` : ''} {record?.isUntradable ? '• Untradable' : ''}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
              <div
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 'var(--radius-base, 8px)',
                  padding: '14px',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted, #98A0A6)', fontWeight: 600, marginBottom: '8px' }}>
                  Skill Moves
                </div>
                <div style={{ fontSize: '18px', color: '#FFB86B', letterSpacing: '2px' }}>{renderStars(record?.skillMoves)}</div>
              </div>
              <div
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 'var(--radius-base, 8px)',
                  padding: '14px',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted, #98A0A6)', fontWeight: 600, marginBottom: '8px' }}>
                  Weak Foot
                </div>
                <div style={{ fontSize: '18px', color: '#FFB86B', letterSpacing: '2px' }}>{renderStars(record?.weakFoot)}</div>
              </div>
            </div>

            <div
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 'var(--radius-base, 8px)',
                padding: '16px',
                marginBottom: '20px'
              }}
            >

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ color: 'var(--color-text-muted, #98A0A6)', fontWeight: 600 }}>Club</span>
                  <span style={{ color: 'var(--color-text-primary, #E6EEF2)', fontWeight: 700 }}>{record?.club || 'Unknown'}</span>
                </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ color: 'var(--color-text-muted, #98A0A6)', fontWeight: 600 }}>League</span>
                <span style={{ color: 'var(--color-text-primary, #E6EEF2)', fontWeight: 700 }}>{record?.league || 'Unknown'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ color: 'var(--color-text-muted, #98A0A6)', fontWeight: 600 }}>Work Rates</span>
                <span style={{ color: 'var(--color-text-primary, #E6EEF2)', fontWeight: 700 }}>
                  {workRateAttackLabel} / {workRateDefenseLabel}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ color: 'var(--color-text-muted, #98A0A6)', fontWeight: 600 }}>Strong Foot</span>
                <span style={{ color: 'var(--color-text-primary, #E6EEF2)', fontWeight: 700 }}>
                  {record?.strongFootSide === 'Left' ? 'Right' : record?.strongFootSide === 'Right' ? 'Left' : 'Unknown'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ color: 'var(--color-text-muted, #98A0A6)', fontWeight: 600 }}>Weak Foot</span>
                <span style={{ color: 'var(--color-text-primary, #E6EEF2)', fontWeight: 700 }}>
                  {record?.strongFootSide || 'Unknown'} {record?.weakFoot ? `(${renderStars(record.weakFoot)})` : ''}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted, #98A0A6)', fontWeight: 600 }}>Body</span>
                <span style={{ color: 'var(--color-text-primary, #E6EEF2)', fontWeight: 700 }}>
                  {record?.heightCm ? `${record.heightCm}cm` : 'Unknown'} / {record?.weightKg ? `${record.weightKg}kg` : 'Unknown'}
                </span>
              </div>
            </div>

            <div
              style={{
                background: 'rgba(0,194,168,0.08)',
                border: '1px solid rgba(0,194,168,0.25)',
                borderRadius: 'var(--radius-base, 8px)',
                padding: '18px',
                textAlign: 'center'
              }}
            >
              <div
                style={{
                  fontSize: '12px',
                  color: 'var(--color-text-muted, #98A0A6)',
                  fontWeight: 600,
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                Market Value
              </div>
              <div
                style={{
                  fontSize: '22px',
                  fontWeight: 900,
                  color: 'var(--color-teal-500, #00C2A8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px'
                }}
              >
                {record?.isUntradable ? (
                  <PlayerMarketValue isUntradable={true} />
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="12" cy="12" r="10" />
                    </svg>
                    <PlayerMarketValue isUntradable={false} />
                  </>
                )}
              </div>
            </div>
          </div>

          <div
            style={{
              background: 'var(--color-graphite-800, #14181C)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 'var(--radius-lg, 12px)',
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button
                type="button"
                onClick={handleAddToTeamBuilder}
                style={{
                  background: 'rgba(0,194,168,0.1)',
                  border: '1px solid rgba(0,194,168,0.3)',
                  color: '#00C2A8',
                  padding: '14px',
                  borderRadius: 'var(--radius-base, 8px)',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(0,194,168,0.2)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,194,168,0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(0,194,168,0.1)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Squad Builder
              </button>
              
              <button
                type="button"
                onClick={handleAddToCompare}
                style={{
                  background: 'rgba(255,184,107,0.1)',
                  border: '1px solid rgba(255,184,107,0.3)',
                  color: '#FFB86B',
                  padding: '14px',
                  borderRadius: 'var(--radius-base, 8px)',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,184,107,0.2)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(255,184,107,0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,184,107,0.1)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 21l6-6M4 4l5 5" />
                </svg>
                Compare
              </button>
            </div>

            <button
              className="player-watchlist-btn"
              data-watchlist-toggle
              data-unique-id={watchlistUniqueId}
              data-player-id={playerId}
              data-record-id={recordId}
              data-player-name={record?.name}
              data-rank={selectedRank}
              data-untradable={record?.isUntradable ? '1' : '0'}
              data-position={record?.position || ''}
              data-ovr={record?.ovr || 0}
              data-team={record?.club || ''}
              data-club={record?.club || ''}
              data-league={record?.league || ''}
              data-nation={record?.nation || ''}
              data-event={record?.eventName || record?.event || ''}
              data-skill={record?.skillMoves || 0}
              data-price={record?.price || 0}
              data-pac={pacStat}
              data-sho={shoStat}
              data-pas={pasStat}
              data-dri={driStat}
              data-def={defStat}
              data-phy={phyStat}
              data-card-background={cardBackground}
              data-player-image={cardImage}
              data-nation-flag={record?.nationFlag || ''}
              data-club-flag={record?.clubFlag || ''}
              data-league-image={record?.leagueImage || ''}
              data-color-name={record?.colorName || '#FFFFFF'}
              data-color-rating={record?.colorRating || '#FFB86B'}
              data-color-position={record?.colorPosition || '#FFFFFF'}
              data-alternate-position={record?.alternatePosition || ''}
              type="button"
              style={{
                position: 'static',
                top: 'auto',
                right: 'auto',
                zIndex: 'auto',
                width: '100%',
                height: 'auto',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: 'var(--color-text-muted, #98A0A6)',
                padding: '16px 24px',
                borderRadius: 'var(--radius-base, 10px)',
                cursor: 'pointer',
                fontSize: '15px',
                fontWeight: 700,
                transition: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                marginTop: 0,
                boxShadow: 'none'
              }}
              aria-label="Add to watchlist"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              <span data-watchlist-label>Add to Watchlist</span>
            </button>
          </div>
        </div>

        <div className="player-detail-main-flow">
          <div
            className="player-rank-refresh-grid"
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}
          >
            <div
              className="player-rank-panel"
              style={{
                background: 'var(--color-graphite-800)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 'var(--radius-lg)',
                padding: '16px'
              }}
            >
              <div
                style={{
                  fontSize: '16px',
                  fontWeight: 800,
                  color: 'var(--color-text-primary)',
                  margin: '0 0 18px 0',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  flexWrap: 'wrap'
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <span>Select Rank</span>
                <button className="reset-rank-btn" type="button" onClick={() => handleRankChange(0)}>
                  Reset Rank
                </button>
                {isRankLoading ? (
                  <span style={{ fontSize: '12px', color: 'var(--color-text-muted, #98A0A6)', marginLeft: 'auto' }}>Updating...</span>
                ) : null}
              </div>

              <div className="rank-cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '14px', marginBottom: '16px' }}>
                {[1, 2, 3, 4, 5].map((rankNum) => {
                  const isSelected = selectedRank === rankNum;
                  const rankColor = RANK_COLORS[rankNum];

                  return (
                    <button
                      key={`${playerId}-rank-${rankNum}`}
                      className={`rank-card ${isSelected ? 'selected' : ''}`}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => handleRankChange(rankNum)}
                      style={{
                        position: 'relative',
                        background: 'rgba(255,255,255,0.03)',
                        border: `2px solid ${isSelected ? `${rankColor}66` : 'rgba(255,255,255,0.08)'}`,
                        borderRadius: '14px',
                        padding: '16px 12px',
                        cursor: 'pointer',
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        boxShadow: isSelected ? `0 0 20px ${rankColor}50` : 'none',
                        minWidth: '40px',
                        minHeight: '70px'
                      }}
                    >
                      <div style={{ fontSize: '16px', fontWeight: 800, color: rankColor, lineHeight: 1 }}>{rankNum}</div>
                      <AnimatedRankIcon
                        className="rank-selector-icon animated-rank-icon"
                        rank={rankNum}
                        spriteUrl={RANK_SPRITES[rankNum]}
                        size={56}
                        style={{
                          filter: isSelected ? `drop-shadow(0 0 8px ${rankColor})` : 'none'
                        }}
                      />
                      {isSelected ? (
                        <div
                          style={{
                            position: 'absolute',
                            top: '4px',
                            right: '4px',
                            background: rankColor,
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            fontWeight: 900,
                            color: '#0E1114'
                          }}
                        >
                          ✓
                        </div>
                      ) : null}
                    </button>
                  );
                })}
              </div>

              <PlayerTrainingLevelPanel playerId={playerId} position={record?.position} rank={selectedRank} />
            </div>

            {isAuctionable ? (
              <PlayerRefreshTimePanel playerId={playerId} />
            ) : (
              <div className="player-refresh-container player-refresh-container--placeholder" aria-hidden="true" />
            )}
          </div>

          <PlayerSkillsAbilitiesSection playerId={playerId} currentRank={selectedRank} />
          <PlayerPlaystylesSection playerId={playerId} currentRank={selectedRank} />


          <AdsenseAd slot="7867021922" style={{ marginTop: '24px' }} />
        </div>
      </section>

      <PlayerStatisticsSection
        player={record}
        playerId={playerId}
        profileSectionTitle="Profile Overview"
        profileRows={profileOverviewFields}
        profileCollections={[
          { key: 'traits', title: 'Traits', items: profileTraitItems },
          { key: 'abilities', title: 'Abilities', items: profileAbilityItems }
        ]}
        profileSummary={profileSummary}
      />

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px' }}>
        <AdsenseAd slot="8605388527" style={{ margin: '0 0 32px 0' }} />
      </div>

      <PlayerDetailInteractions playerId={playerId} currentRank={selectedRank} baseOvr={record?.ovr} />
    </>
  );
}
