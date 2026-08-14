'use client';

import { useState, useEffect } from 'react';

import {
  EXPORT_FALLBACK_CARD_URL,
  EXPORT_FALLBACK_FLAG_URL,
  EXPORT_FALLBACK_PLAYER_URL,
  normalizeExportAssetUrl,
  resolvePlayerFromMap
} from './squad-export-media';
import { UNTRADABLE_CARD_BADGE_URL } from './image-asset-urls';
import Num from './Num';
import { getPlayerCardVariant } from './player-detail-utils';

const QR_IMAGE_URL = 'https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=https%3A%2F%2Fzenithfcm.com';

function formatExportCoins(value) {
  const safeValue = Number(value);
  if (!Number.isFinite(safeValue) || safeValue <= 0) return '0';
  if (safeValue >= 1000000) return `${(safeValue / 1000000).toFixed(2)}M`;
  if (safeValue >= 1000) return `${(safeValue / 1000).toFixed(1)}K`;
  return String(Math.round(safeValue));
}

function getStarterTypeClass(player) {
  return player?.leagueImage ? 'card-type-normal' : 'card-type-hero';
}

function getBenchTypeClass(player) {
  return player?.leagueImage ? 'bench-type-normal' : 'bench-type-hero';
}

function getStarterVariant(player) {
  return getPlayerCardVariant(player);
}

function getPlayerExportMedia(player, exportMediaByPlayer = {}) {
  const playerId = String(player?.playerId || '').trim();
  if (!playerId) return null;
  return exportMediaByPlayer?.[playerId] || null;
}

function resolveCardBackground(player, exportMediaByPlayer) {
  const preferredCardBackground = getPlayerExportMedia(player, exportMediaByPlayer)?.cardBackground;
  return normalizeExportAssetUrl(preferredCardBackground || player?.cardBackground) || EXPORT_FALLBACK_CARD_URL;
}

function resolvePlayerFace(player, exportMediaByPlayer) {
  const preferredPlayerFace = getPlayerExportMedia(player, exportMediaByPlayer)?.playerImage;
  const direct = normalizeExportAssetUrl(preferredPlayerFace || player?.playerImage);
  if (direct) return direct;
  const playerId = String(player?.playerId || '').trim();
  if (playerId) {
    const futbin = normalizeExportAssetUrl(`https://cdn.futbin.com/content/fifa25/img/players/${playerId}.png`);
    if (futbin) return futbin;
  }
  return EXPORT_FALLBACK_PLAYER_URL;
}

function resolveFlag(value) {
  return normalizeExportAssetUrl(value) || EXPORT_FALLBACK_FLAG_URL;
}

function getBadgeContent(badges) {
  const count = Object.values(badges || {}).filter(Boolean).length;
  const clamped = Math.max(0, Math.min(count, 3));
  if (!clamped) return <div className="squad-export-badge">No Stars</div>;
  return <div className="squad-export-stars">{'★'.repeat(clamped)}</div>;
}

const defaultCalib = {
  pitchImgW: 130, pitchImgH: 163, pitchImgX: -2, pitchImgY: -1,
  pitchOvrTop: 16, pitchOvrLeft: 20, pitchOvrSize: 1,
  pitchPosTop: 30, pitchPosLeft: 24, pitchPosSize: 0.7,
  pitchNameBot: 38, pitchNameX: 8, pitchNameSize: 0.7,
  pitchUntradTop: 4, pitchUntradLeft: 30, pitchUntradSize: 15,
  pitchNationLeft: 24, pitchNationBot: 20, pitchNationWidth: 12,
  pitchClubLeft: 82, pitchClubBot: 23, pitchClubWidth: 12,
  pitchLeagueLeft: 53, pitchLeagueBot: 20, pitchLeagueWidth: 12,
  benchImgW: 112, benchImgH: 120, benchImgX: 0, benchImgY: 12,
  benchOvrTop: 13, benchOvrLeft: 16, benchOvrSize: 0.8,
  benchPosTop: 26, benchPosLeft: 15, benchPosSize: 0.6,
  benchNameBot: 26, benchNameX: 6, benchNameSize: 0.65,
  benchUntradRight: 3, benchUntradTop: 5, benchUntradSize: 13,
  benchNationLeft: 19, benchNationBot: 12, benchNationWidth: 10,
  benchClubLeft: 69, benchClubBot: 16, benchClubWidth: 12,
  benchLeagueLeft: 43, benchLeagueBot: 17, benchLeagueWidth: 10
};

function ExportStarterSlot({ slot, player, adjustedOvr, exportMediaByPlayer, calib }) {
  const p = calib || defaultCalib;
  const variant = getStarterVariant(player);
  const exportMedia = getPlayerExportMedia(player, exportMediaByPlayer);
  const nationFlag = exportMedia?.nationFlag
    ? resolveFlag(exportMedia.nationFlag)
    : player?.nationFlag
      ? resolveFlag(player.nationFlag)
      : '';
  const clubFlag = exportMedia?.clubFlag
    ? resolveFlag(exportMedia.clubFlag)
    : player?.clubFlag
      ? resolveFlag(player.clubFlag)
      : '';
  const leagueFlag = exportMedia?.leagueImage
    ? resolveFlag(exportMedia.leagueImage)
    : player?.leagueImage
      ? resolveFlag(player.leagueImage)
      : '';

  return (
    <div className="squad-slot squad-export-slot" style={{ left: `${slot.x}%`, top: `${slot.y}%` }}>
      <div className="position-dot">
        <span className="position-label">{slot.label}</span>
      </div>
      {!!player && (
        <div className={`player-preview-card squad-export-player-card ${getStarterTypeClass(player)}`} data-player-id={player.playerId}>
          <div className="preview-card-inner" style={{ width: '118px', height: '138px' }}>
            <img src={resolveCardBackground(player, exportMediaByPlayer)} alt="Card" className="preview-card-bg" crossOrigin="anonymous" referrerPolicy="no-referrer" loading="eager" decoding="sync" />
            <img src={resolvePlayerFace(player, exportMediaByPlayer)} alt={player.name} className="preview-card-player-img" crossOrigin="anonymous" referrerPolicy="no-referrer" loading="eager" decoding="sync" style={{ width: `${p.pitchImgW}px`, height: `${p.pitchImgH}px`, objectFit: 'contain', left: '50%', marginLeft: `${p.pitchImgX - (p.pitchImgW / 2)}px`, bottom: `${6 - p.pitchImgY}px`, transform: 'none' }} />
            <div className="preview-card-ovr" style={{ color: player.colorRating || '#FFFFFF', transform: 'none', top: `${p.pitchOvrTop}px`, left: `${p.pitchOvrLeft}px`, fontSize: `${p.pitchOvrSize}rem` }}>
              <Num>{Number(adjustedOvr) > 0 ? Number(adjustedOvr) : 'NA'}</Num>
            </div>
            <div className="preview-card-position" style={{ color: player.colorPosition || '#FFFFFF', transform: 'none', top: `${p.pitchPosTop}px`, left: `${p.pitchPosLeft}px`, fontSize: `${p.pitchPosSize}rem` }}>
              <Num>{player.position || 'NA'}</Num>
            </div>
            <div className="preview-card-name" style={{ color: player.colorName || '#FFFFFF', width: '100%', left: `${p.pitchNameX}px`, display: 'flex', justifyContent: 'center', alignItems: 'center', bottom: `${p.pitchNameBot}px`, fontSize: `${p.pitchNameSize}rem`, transform: 'none' }}>
              <Num>{player.name || 'Unknown'}</Num>
            </div>
            {!!nationFlag && (
              <img
                src={nationFlag}
                alt="Nation"
                className={`card-nation-flag ${variant === 'normal' ? 'normal-nation-flag' : 'hero-icon-nation-flag'}`}
                style={{ left: `${p.pitchNationLeft}px`, bottom: `${p.pitchNationBot}px`, top: 'auto', right: 'auto', width: `${p.pitchNationWidth}px`, height: 'auto', position: 'absolute' }}
                crossOrigin="anonymous"
                referrerPolicy="no-referrer"
                loading="eager"
                decoding="sync"
              />
            )}
            {!!clubFlag && (
              <img
                src={clubFlag}
                alt="Club"
                className={`card-club-flag ${variant === 'normal' ? 'normal-club-flag' : 'hero-icon-club-flag'}`}
                style={{ left: `${p.pitchClubLeft}px`, bottom: `${p.pitchClubBot}px`, top: 'auto', right: 'auto', width: `${p.pitchClubWidth}px`, height: 'auto', position: 'absolute' }}
                crossOrigin="anonymous"
                referrerPolicy="no-referrer"
                loading="eager"
                decoding="sync"
              />
            )}
            {!!leagueFlag && variant === 'normal' && (
              <img src={leagueFlag} alt="League" className="card-league-flag normal-league-flag" crossOrigin="anonymous" referrerPolicy="no-referrer" loading="eager" decoding="sync" style={{ left: `${p.pitchLeagueLeft}px`, bottom: `${p.pitchLeagueBot}px`, top: 'auto', right: 'auto', width: `${p.pitchLeagueWidth}px`, height: 'auto', position: 'absolute' }} />
            )}
            {player.isUntradable && (
              <div className="card-untradable-badge with-remove card-untradable-badge--squad-pitch" style={{ right: 'auto', left: '50%', marginLeft: `${p.pitchUntradLeft - (p.pitchUntradSize / 2)}px`, top: `${p.pitchUntradTop}px`, width: `${p.pitchUntradSize}px`, height: `${p.pitchUntradSize}px`, transform: 'none' }}>
                <img src={UNTRADABLE_CARD_BADGE_URL} alt="Untradable" crossOrigin="anonymous" referrerPolicy="no-referrer" loading="eager" decoding="sync" style={{ width: '100%', height: '100%' }} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ExportBenchCell({ player, index, exportMediaByPlayer, calib }) {
  const p = calib || defaultCalib;
  const variant = getStarterVariant(player);
  const exportMedia = getPlayerExportMedia(player, exportMediaByPlayer);
  const nationFlag = exportMedia?.nationFlag
    ? resolveFlag(exportMedia.nationFlag)
    : player?.nationFlag
      ? resolveFlag(player.nationFlag)
      : '';
  const clubFlag = exportMedia?.clubFlag
    ? resolveFlag(exportMedia.clubFlag)
    : player?.clubFlag
      ? resolveFlag(player.clubFlag)
      : '';
  const leagueFlag = exportMedia?.leagueImage
    ? resolveFlag(exportMedia.leagueImage)
    : player?.leagueImage
      ? resolveFlag(player.leagueImage)
      : '';

  return (
    <div className="bench-cell">
      <div className="bench-empty-slot">
        <span className="bench-slot-label">SUB {index + 1}</span>
      </div>
      {!!player && (
        <div className={`bench-preview-card squad-export-bench-card ${getBenchTypeClass(player)}`} data-player-id={player.playerId}>
          <div className="bench-card-inner" style={{ width: '98px', height: '118px' }}>
            <img src={resolveCardBackground(player, exportMediaByPlayer)} alt="Card" className="bench-card-bg" crossOrigin="anonymous" referrerPolicy="no-referrer" loading="eager" decoding="sync" />
            <img src={resolvePlayerFace(player, exportMediaByPlayer)} alt={player.name} className="bench-card-player-img" crossOrigin="anonymous" referrerPolicy="no-referrer" loading="eager" decoding="sync" style={{ width: `${p.benchImgW}px`, height: `${p.benchImgH}px`, objectFit: 'contain', left: '50%', marginLeft: `${p.benchImgX - (p.benchImgW / 2)}px`, bottom: `${6 - p.benchImgY}px`, transform: 'none' }} />
            <div className="bench-card-ovr" style={{ color: player.colorRating || '#FFFFFF', transform: 'none', top: `${p.benchOvrTop}px`, left: `${p.benchOvrLeft}px`, fontSize: `${p.benchOvrSize}rem` }}>
              <Num>{player.ovr > 0 ? player.ovr : 'NA'}</Num>
            </div>
            <div className="bench-card-position" style={{ color: player.colorPosition || '#FFFFFF', transform: 'none', top: `${p.benchPosTop}px`, left: `${p.benchPosLeft}px`, fontSize: `${p.benchPosSize}rem` }}>
              <Num>{player.position || 'NA'}</Num>
            </div>
            <div className="bench-card-name" style={{ color: player.colorName || '#FFFFFF', width: '100%', left: `${p.benchNameX}px`, display: 'flex', justifyContent: 'center', alignItems: 'center', bottom: `${p.benchNameBot}px`, fontSize: `${p.benchNameSize}rem`, transform: 'none' }}>
              <Num>{player.name || 'Unknown'}</Num>
            </div>
            {!!nationFlag && (
              <img
                src={nationFlag}
                alt="Nation"
                className={`bench-card-flag-nation ${variant === 'normal' ? 'normal-nation-flag' : 'hero-icon-nation-flag'}`}
                style={{ left: `${p.benchNationLeft}px`, bottom: `${p.benchNationBot}px`, top: 'auto', right: 'auto', width: `${p.benchNationWidth}px`, height: 'auto', position: 'absolute' }}
                crossOrigin="anonymous"
                referrerPolicy="no-referrer"
                loading="eager"
                decoding="sync"
              />
            )}
            {!!clubFlag && (
              <img
                src={clubFlag}
                alt="Club"
                className={`bench-card-flag-club ${variant === 'normal' ? 'normal-club-flag' : 'hero-icon-club-flag'}`}
                style={{ left: `${p.benchClubLeft}px`, bottom: `${p.benchClubBot}px`, top: 'auto', right: 'auto', width: `${p.benchClubWidth}px`, height: 'auto', position: 'absolute' }}
                crossOrigin="anonymous"
                referrerPolicy="no-referrer"
                loading="eager"
                decoding="sync"
              />
            )}
            {!!leagueFlag && variant === 'normal' && (
              <img
                src={leagueFlag}
                alt="League"
                className="bench-card-flag-league normal-bench-league-flag"
                style={{ left: `${p.benchLeagueLeft}px`, bottom: `${p.benchLeagueBot}px`, top: 'auto', right: 'auto', width: `${p.benchLeagueWidth}px`, height: 'auto', position: 'absolute' }}
                crossOrigin="anonymous"
                referrerPolicy="no-referrer"
                loading="eager"
                decoding="sync"
              />
            )}
            {player.isUntradable && (
              <div className="card-untradable-badge" style={{ right: `${p.benchUntradRight}px`, top: `${p.benchUntradTop}px`, width: `${p.benchUntradSize}px`, height: `${p.benchUntradSize}px`, pointerEvents: 'none', position: 'absolute' }}>
                <img src={UNTRADABLE_CARD_BADGE_URL} alt="Untradable" crossOrigin="anonymous" referrerPolicy="no-referrer" loading="eager" decoding="sync" style={{ width: '100%', height: '100%' }} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SquadExportCapture({
  exportRootRef,
  squadName,
  squadOvr,
  squadValue,
  formationId,
  badges,
  formationSlots,
  starters,
  bench,
  playersById,
  exportMediaByPlayer,
  exportPlayerFallbacks,
  starterAdjustedOvrBySlot,
  fieldBackground
}) {
  const teamName = String(squadName || 'My Squad').trim() || 'My Squad';

  const [isCalibMode, setIsCalibMode] = useState(false);
  const [calib, setCalib] = useState(defaultCalib);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('zenith_export_calib');
      if (stored) setCalib(JSON.parse(stored));
    } catch(e) {}
    
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'Y') {
        setIsCalibMode(v => !v);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const updateCalib = (key, val) => {
    setCalib(prev => {
      const next = { ...prev, [key]: Number(val) };
      try { localStorage.setItem('zenith_export_calib', JSON.stringify(next)); } catch(e) {}
      return next;
    });
  };

  const renderSlider = (label, k, min, max, step = 1) => (
    <div key={k} style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#ccc' }}>
        <span>{label}</span>
        <span>{calib[k]}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={calib[k]} onChange={e => updateCalib(k, e.target.value)} style={{ width: '100%' }} />
    </div>
  );

  return (
    <>
      {isCalibMode && (
        <div style={{ position: 'fixed', top: 10, right: 10, zIndex: 100000, background: '#1e1e24', color: '#fff', padding: 20, borderRadius: 8, maxHeight: '90vh', overflowY: 'auto', width: 320, boxShadow: '0 8px 24px rgba(0,0,0,0.8)', fontFamily: 'system-ui, sans-serif', border: '1px solid #333' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
            <h3 style={{ margin: 0, fontSize: '16px' }}>🛠 Export Tweaker</h3>
            <button onClick={() => { setCalib(defaultCalib); localStorage.removeItem('zenith_export_calib'); }} style={{ background: '#444', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: 4, cursor: 'pointer', fontSize: '11px' }}>Reset</button>
          </div>
          
          <div style={{ borderBottom: '1px solid #333', paddingBottom: 8, marginBottom: 15 }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#4ade80' }}>PITCH CARDS</h4>
            {renderSlider('Image Width', 'pitchImgW', 50, 200)}
            {renderSlider('Image Height', 'pitchImgH', 50, 200)}
            {renderSlider('Image X Offset', 'pitchImgX', -100, 100)}
            {renderSlider('Image Y Offset', 'pitchImgY', -100, 100)}
            {renderSlider('OVR Top', 'pitchOvrTop', -20, 50)}
            {renderSlider('OVR Left', 'pitchOvrLeft', -20, 50)}
            {renderSlider('OVR Size (rem)', 'pitchOvrSize', 0.5, 2, 0.05)}
            {renderSlider('Position Top', 'pitchPosTop', -20, 50)}
            {renderSlider('Position Left', 'pitchPosLeft', -20, 50)}
            {renderSlider('Position Size (rem)', 'pitchPosSize', 0.4, 1.5, 0.05)}
            {renderSlider('Name Y Offset (Bot)', 'pitchNameBot', -20, 50)}
            {renderSlider('Name X Offset', 'pitchNameX', -50, 50)}
            {renderSlider('Name Size (rem)', 'pitchNameSize', 0.4, 1.5, 0.05)}
            {renderSlider('Untradable Size', 'pitchUntradSize', 10, 50)}
            {renderSlider('Untradable X Offset', 'pitchUntradLeft', -50, 100)}
            {renderSlider('Untradable Y Offset', 'pitchUntradTop', -50, 50)}
            {renderSlider('Nation Flag Left', 'pitchNationLeft', 0, 100)}
            {renderSlider('Nation Flag Bottom', 'pitchNationBot', 0, 100)}
            {renderSlider('Nation Flag Width', 'pitchNationWidth', 5, 40)}
            {renderSlider('Club Flag Left', 'pitchClubLeft', 0, 100)}
            {renderSlider('Club Flag Bottom', 'pitchClubBot', 0, 100)}
            {renderSlider('Club Flag Width', 'pitchClubWidth', 5, 40)}
            {renderSlider('League Flag Left', 'pitchLeagueLeft', 0, 100)}
            {renderSlider('League Flag Bottom', 'pitchLeagueBot', 0, 100)}
            {renderSlider('League Flag Width', 'pitchLeagueWidth', 5, 40)}
          </div>

          <div>
            <h4 style={{ margin: '0 0 10px 0', color: '#60a5fa' }}>BENCH CARDS</h4>
            {renderSlider('Image Width', 'benchImgW', 50, 200)}
            {renderSlider('Image Height', 'benchImgH', 50, 200)}
            {renderSlider('Image X Offset', 'benchImgX', -100, 100)}
            {renderSlider('Image Y Offset', 'benchImgY', -100, 100)}
            {renderSlider('OVR Top', 'benchOvrTop', -20, 50)}
            {renderSlider('OVR Left', 'benchOvrLeft', -20, 50)}
            {renderSlider('OVR Size (rem)', 'benchOvrSize', 0.4, 1.5, 0.05)}
            {renderSlider('Position Top', 'benchPosTop', -20, 50)}
            {renderSlider('Position Left', 'benchPosLeft', -20, 50)}
            {renderSlider('Position Size (rem)', 'benchPosSize', 0.4, 1.5, 0.05)}
            {renderSlider('Name Y Offset (Bot)', 'benchNameBot', -20, 50)}
            {renderSlider('Name X Offset', 'benchNameX', -50, 50)}
            {renderSlider('Name Size (rem)', 'benchNameSize', 0.4, 1.5, 0.05)}
            {renderSlider('Untradable Size', 'benchUntradSize', 10, 50)}
            {renderSlider('Untradable Right', 'benchUntradRight', -20, 50)}
            {renderSlider('Untradable Top', 'benchUntradTop', -50, 50)}
            {renderSlider('Nation Flag Left', 'benchNationLeft', 0, 100)}
            {renderSlider('Nation Flag Bottom', 'benchNationBot', 0, 100)}
            {renderSlider('Nation Flag Width', 'benchNationWidth', 5, 40)}
            {renderSlider('Club Flag Left', 'benchClubLeft', 0, 100)}
            {renderSlider('Club Flag Bottom', 'benchClubBot', 0, 100)}
            {renderSlider('Club Flag Width', 'benchClubWidth', 5, 40)}
            {renderSlider('League Flag Left', 'benchLeagueLeft', 0, 100)}
            {renderSlider('League Flag Bottom', 'benchLeagueBot', 0, 100)}
            {renderSlider('League Flag Width', 'benchLeagueWidth', 5, 40)}
          </div>

          <div style={{ marginTop: 20, fontSize: '11px', color: '#888', textAlign: 'center' }}>
            Ctrl+Shift+Y to hide. Hardcode final values in defaultCalib.
          </div>
        </div>
      )}

      <div 
        id="squad-export-root" 
        ref={exportRootRef} 
        aria-hidden={!isCalibMode} 
        style={isCalibMode ? { position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 99999, visibility: 'visible', pointerEvents: 'auto', boxShadow: '0 0 0 100vw rgba(0,0,0,0.85)' } : {}}
      >
        <div className="squad-export-card">
          <div className="squad-export-header">
            <div className="squad-export-title">ZENITH</div>
            <div className="squad-export-subtitle">Football Squad Builder</div>
          </div>

          <div className="squad-export-meta">
            <div className="squad-export-team">TEAM: {teamName}</div>
            <div className="squad-export-ovr">OVR: {squadOvr || 0}</div>
          </div>

          <div className="squad-export-grid">
            <div className="squad-export-left">
              <div className="squad-export-pitch-card" style={{ background: fieldBackground }}>
                <div className="squad-export-field" />
                <div className="squad-export-slots">
                  {formationSlots.map((slot) => {
                    const playerId = starters?.[slot.id] || '';
                    const normalizedPlayerId = String(playerId || '').trim();
                    const player = normalizedPlayerId
                      ? resolvePlayerFromMap(playersById, normalizedPlayerId) || exportPlayerFallbacks?.[normalizedPlayerId] || null
                      : null;
                    return <ExportStarterSlot key={`export-${formationId}-${slot.id}`} slot={slot} player={player} adjustedOvr={starterAdjustedOvrBySlot?.[slot.id]} exportMediaByPlayer={exportMediaByPlayer} calib={calib} />;
                  })}
                </div>
              </div>

              <div className="squad-export-bench">
                <div className="squad-bench squad-export-bench-grid">
                  {Array.from({ length: 7 }, (_, index) => {
                    const playerId = bench?.[index] || '';
                    const normalizedPlayerId = String(playerId || '').trim();
                    const player = normalizedPlayerId
                      ? resolvePlayerFromMap(playersById, normalizedPlayerId) || exportPlayerFallbacks?.[normalizedPlayerId] || null
                      : null;
                    return <ExportBenchCell key={`export-bench-${index}`} player={player} index={index} exportMediaByPlayer={exportMediaByPlayer} calib={calib} />;
                  })}
                </div>
              </div>
          </div>

          <div className="squad-export-right">
            <div className="squad-export-card-section">
              <div className="squad-export-card-title">Squad Value</div>
              <div className="squad-export-card-value">{formatExportCoins(squadValue)} Coins</div>
            </div>

            <div className="squad-export-card-section">
              <div className="squad-export-card-title">OVR</div>
              <div className="squad-export-card-value">{squadOvr || 0}</div>
            </div>

            <div className="squad-export-card-section">
              <div className="squad-export-card-title">Formation</div>
              <div className="squad-export-card-value">{formationId || 'Formation'}</div>
            </div>

            <div className="squad-export-card-section">
              <div className="squad-export-card-title">Badges</div>
              <div className="squad-export-badges">{getBadgeContent(badges)}</div>
            </div>

            <div className="squad-export-card-section squad-export-qr-card">
              <div className="squad-export-card-title">QR Access</div>
              <img className="squad-export-qr" src={QR_IMAGE_URL} alt="QR code linking to zenithfcm.com" crossOrigin="anonymous" referrerPolicy="no-referrer" loading="eager" decoding="sync" />
              <div className="squad-export-qr-text">CHECK SQUAD</div>
            </div>

            <div className="squad-export-card-section">
              <div className="squad-export-card-title">Zenith Engine</div>
              <div className="squad-export-card-subtitle">Squad Analytics</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
