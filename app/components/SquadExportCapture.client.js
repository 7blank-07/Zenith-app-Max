'use client';

import {
  EXPORT_FALLBACK_CARD_URL,
  EXPORT_FALLBACK_FLAG_URL,
  EXPORT_FALLBACK_PLAYER_URL,
  normalizeExportAssetUrl,
  resolvePlayerFromMap
} from './squad-export-media';
import { UNTRADABLE_CARD_BADGE_URL } from './image-asset-urls';
import Num from './Num';

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
  return player?.leagueImage ? 'normal' : 'hero';
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

function ExportStarterSlot({ slot, player, adjustedOvr, exportMediaByPlayer }) {
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
            <img src={resolvePlayerFace(player, exportMediaByPlayer)} alt={player.name} className="preview-card-player-img" crossOrigin="anonymous" referrerPolicy="no-referrer" loading="eager" decoding="sync" style={{ width: '120px', height: '125px', objectFit: 'contain', transform: 'translateX(-50%)' }} />
            <div className="preview-card-ovr" style={{ color: player.colorRating || '#FFFFFF', transform: 'none', top: '12px', left: '22px', fontSize: '1.125rem' }}>
              <Num>{Number(adjustedOvr) > 0 ? Number(adjustedOvr) : 'NA'}</Num>
            </div>
            <div className="preview-card-position" style={{ color: player.colorPosition || '#FFFFFF', transform: 'none', top: '28px', left: '22.6px', fontSize: '0.74rem' }}>
              <Num>{player.position || 'NA'}</Num>
            </div>
            <div className="preview-card-name" style={{ color: player.colorName || '#FFFFFF', left: '0', width: '100%', transform: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Num>{player.name || 'Unknown'}</Num>
            </div>
            {!!nationFlag && (
              <img
                src={nationFlag}
                alt="Nation"
                className={`card-nation-flag ${variant === 'normal' ? 'normal-nation-flag' : 'hero-icon-nation-flag'}`}
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
                crossOrigin="anonymous"
                referrerPolicy="no-referrer"
                loading="eager"
                decoding="sync"
              />
            )}
            {!!leagueFlag && variant === 'normal' && (
              <img src={leagueFlag} alt="League" className="card-league-flag normal-league-flag" crossOrigin="anonymous" referrerPolicy="no-referrer" loading="eager" decoding="sync" />
            )}
            {player.isUntradable && (
              <div className="card-untradable-badge with-remove card-untradable-badge--squad-pitch">
                <img src={UNTRADABLE_CARD_BADGE_URL} alt="Untradable" crossOrigin="anonymous" referrerPolicy="no-referrer" loading="eager" decoding="sync" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ExportBenchCell({ player, index, exportMediaByPlayer }) {
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
            <img src={resolvePlayerFace(player, exportMediaByPlayer)} alt={player.name} className="bench-card-player-img" crossOrigin="anonymous" referrerPolicy="no-referrer" loading="eager" decoding="sync" style={{ width: '110px', height: '115px', objectFit: 'contain', transform: 'translateX(-50%)' }} />
            <div className="bench-card-ovr" style={{ color: player.colorRating || '#FFFFFF', transform: 'none' }}>
              <Num>{player.ovr > 0 ? player.ovr : 'NA'}</Num>
            </div>
            <div className="bench-card-position" style={{ color: player.colorPosition || '#FFFFFF', transform: 'none' }}>
              <Num>{player.position || 'NA'}</Num>
            </div>
            <div className="bench-card-name" style={{ color: player.colorName || '#FFFFFF', left: '0', width: '100%', transform: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Num>{player.name || 'Unknown'}</Num>
            </div>
            {!!nationFlag && (
              <img
                src={nationFlag}
                alt="Nation"
                className={`bench-card-flag-nation ${variant === 'normal' ? 'normal-nation-flag' : 'hero-icon-nation-flag'}`}
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
                crossOrigin="anonymous"
                referrerPolicy="no-referrer"
                loading="eager"
                decoding="sync"
              />
            )}
            {player.isUntradable && (
              <div className="card-untradable-badge" style={{ right: '18px', pointerEvents: 'none' }}>
                <img src={UNTRADABLE_CARD_BADGE_URL} alt="Untradable" crossOrigin="anonymous" referrerPolicy="no-referrer" loading="eager" decoding="sync" />
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

  return (
    <div id="squad-export-root" ref={exportRootRef} aria-hidden="true">
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
                  return <ExportStarterSlot key={`export-${formationId}-${slot.id}`} slot={slot} player={player} adjustedOvr={starterAdjustedOvrBySlot?.[slot.id]} exportMediaByPlayer={exportMediaByPlayer} />;
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
                  return <ExportBenchCell key={`export-bench-${index}`} player={player} index={index} exportMediaByPlayer={exportMediaByPlayer} />;
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
  );
}
