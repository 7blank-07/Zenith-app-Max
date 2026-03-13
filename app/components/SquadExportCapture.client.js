'use client';

const EXPORT_CORS_SAFE_HOST = 'images.zenithfcm.com';
const EXPORT_REWRITEABLE_RENDERZ_PATH = /^(flags_|club_|league_|bg_23_|player_)/i;
const QR_IMAGE_URL = 'https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=https%3A%2F%2Fzenithfcm.com';
const EXPORT_FALLBACK_CARD_URL = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#1E293B"/><stop offset="100%" stop-color="#334155"/></linearGradient></defs><rect width="300" height="400" rx="26" fill="url(#g)"/><rect x="18" y="18" width="264" height="364" rx="20" fill="none" stroke="#64748B" stroke-opacity="0.45" stroke-width="3"/><text x="150" y="208" text-anchor="middle" fill="#CBD5E1" font-size="24" font-family="Segoe UI, Arial">ZENITH</text></svg>'
)}`;
const EXPORT_FALLBACK_PLAYER_URL = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="300"><defs><linearGradient id="p" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#A5B4FC"/><stop offset="100%" stop-color="#60A5FA"/></linearGradient></defs><rect width="200" height="300" fill="none"/><circle cx="100" cy="88" r="42" fill="url(#p)" opacity="0.92"/><rect x="48" y="136" width="104" height="122" rx="52" fill="url(#p)" opacity="0.92"/></svg>'
)}`;
const EXPORT_FALLBACK_FLAG_URL = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="16"><rect width="24" height="16" rx="2" fill="#0F172A"/><rect x="1" y="1" width="22" height="14" rx="1.5" fill="#1E293B"/><rect x="1" y="1" width="7.3" height="14" fill="#1D4ED8"/><rect x="8.3" y="1" width="7.3" height="14" fill="#E2E8F0"/><rect x="15.6" y="1" width="7.4" height="14" fill="#DC2626"/></svg>'
)}`;

function normalizeExportAssetUrl(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (raw.startsWith('data:') || raw.startsWith('blob:')) return raw;
  try {
    const baseUrl = typeof window !== 'undefined' ? window.location.href : 'https://zenithfcm.com';
    const parsed = new URL(raw, baseUrl);
    if (/renderz\.app$/i.test(parsed.hostname)) {
      const assetPath = parsed.pathname.replace(/^\/+/, '');
      if (!assetPath || !EXPORT_REWRITEABLE_RENDERZ_PATH.test(assetPath)) {
        return '';
      }
      return `https://${EXPORT_CORS_SAFE_HOST}/${assetPath}${parsed.search || ''}`;
    }
    return parsed.href;
  } catch (_) {
    return raw;
  }
}

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

function resolveCardBackground(player) {
  return normalizeExportAssetUrl(player?.cardBackground) || EXPORT_FALLBACK_CARD_URL;
}

function resolvePlayerFace(player) {
  const direct = normalizeExportAssetUrl(player?.playerImage);
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

function ExportStarterSlot({ slot, player, adjustedOvr }) {
  return (
    <div className="squad-slot squad-export-slot" style={{ left: `${slot.x}%`, top: `${slot.y}%` }}>
      <div className="position-dot">
        <span className="position-label">{slot.label}</span>
      </div>
      {!!player && (
        <div className={`player-preview-card squad-export-player-card ${getStarterTypeClass(player)}`} data-player-id={player.playerId}>
          <div className="preview-card-inner">
            <img src={resolveCardBackground(player)} alt="Card" className="preview-card-bg" crossOrigin="anonymous" referrerPolicy="no-referrer" />
            <img src={resolvePlayerFace(player)} alt={player.name} className="preview-card-player-img" crossOrigin="anonymous" referrerPolicy="no-referrer" />
            <div className="preview-card-ovr" style={{ color: player.colorRating || '#FFFFFF' }}>
              {Number(adjustedOvr) > 0 ? Number(adjustedOvr) : 'NA'}
            </div>
            <div className="preview-card-position" style={{ color: player.colorPosition || '#FFFFFF' }}>
              {player.position || 'NA'}
            </div>
            <div className="preview-card-name" style={{ color: player.colorName || '#FFFFFF' }}>
              {player.name || 'Unknown'}
            </div>
            {!!player.nationFlag && (
              <img
                src={resolveFlag(player.nationFlag)}
                alt="Nation"
                className={`card-nation-flag ${getStarterVariant(player) === 'normal' ? 'normal-nation-flag' : 'hero-icon-nation-flag'}`}
                crossOrigin="anonymous"
                referrerPolicy="no-referrer"
              />
            )}
            {!!player.clubFlag && (
              <img
                src={resolveFlag(player.clubFlag)}
                alt="Club"
                className={`card-club-flag ${getStarterVariant(player) === 'normal' ? 'normal-club-flag' : 'hero-icon-club-flag'}`}
                crossOrigin="anonymous"
                referrerPolicy="no-referrer"
              />
            )}
            {!!player.leagueImage && (
              <img src={resolveFlag(player.leagueImage)} alt="League" className="card-league-flag normal-league-flag" crossOrigin="anonymous" referrerPolicy="no-referrer" />
            )}
            {player.isUntradable && (
              <div className="card-untradable-badge with-remove card-untradable-badge--squad-pitch">
                <img src="/assets/images/untradable_img.png" alt="Untradable" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ExportBenchCell({ player, index }) {
  const variant = getStarterVariant(player);
  return (
    <div className="bench-cell">
      <div className="bench-empty-slot">
        <span className="bench-slot-label">SUB {index + 1}</span>
      </div>
      {!!player && (
        <div className={`bench-preview-card squad-export-bench-card ${getBenchTypeClass(player)}`} data-player-id={player.playerId}>
          <div className="bench-card-inner">
            <img src={resolveCardBackground(player)} alt="Card" className="bench-card-bg" crossOrigin="anonymous" referrerPolicy="no-referrer" />
            <img src={resolvePlayerFace(player)} alt={player.name} className="bench-card-player-img" crossOrigin="anonymous" referrerPolicy="no-referrer" />
            <div className="bench-card-ovr" style={{ color: player.colorRating || '#FFFFFF' }}>
              {player.ovr > 0 ? player.ovr : 'NA'}
            </div>
            <div className="bench-card-position" style={{ color: player.colorPosition || '#FFFFFF' }}>
              {player.position || 'NA'}
            </div>
            <div className="bench-card-name" style={{ color: player.colorName || '#FFFFFF' }}>
              {player.name || 'Unknown'}
            </div>
            {!!player.nationFlag && (
              <img
                src={resolveFlag(player.nationFlag)}
                alt="Nation"
                className={`bench-card-flag-nation ${variant === 'normal' ? 'normal-nation-flag' : 'hero-icon-nation-flag'}`}
                crossOrigin="anonymous"
                referrerPolicy="no-referrer"
              />
            )}
            {!!player.clubFlag && (
              <img
                src={resolveFlag(player.clubFlag)}
                alt="Club"
                className={`bench-card-flag-club ${variant === 'normal' ? 'normal-club-flag' : 'hero-icon-club-flag'}`}
                crossOrigin="anonymous"
                referrerPolicy="no-referrer"
              />
            )}
            {player.isUntradable && (
              <div className="card-untradable-badge" style={{ right: '18px', pointerEvents: 'none' }}>
                <img src="/assets/images/untradable_img.png" alt="Untradable" />
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
                  const player = playerId ? playersById.get(playerId) : null;
                  return <ExportStarterSlot key={`export-${formationId}-${slot.id}`} slot={slot} player={player} adjustedOvr={starterAdjustedOvrBySlot?.[slot.id]} />;
                })}
              </div>
            </div>

            <div className="squad-export-bench">
              <div className="squad-bench squad-export-bench-grid">
                {Array.from({ length: 7 }, (_, index) => {
                  const playerId = bench?.[index] || '';
                  const player = playerId ? playersById.get(playerId) : null;
                  return <ExportBenchCell key={`export-bench-${index}`} player={player} index={index} />;
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
              <img className="squad-export-qr" src={QR_IMAGE_URL} alt="QR code linking to zenithfcm.com" crossOrigin="anonymous" referrerPolicy="no-referrer" />
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
