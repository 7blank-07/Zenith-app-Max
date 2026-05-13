import { UNTRADABLE_CARD_BADGE_URL } from './image-asset-urls';

function getInitials(name) {
  const words = String(name ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!words.length) return '?';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

export default function PlayerRowCard({ player }) {
  const playerType = player.leagueImage ? 'normal' : 'hero';
  const hasPlayerImage = !!player.playerImage;
  return (
    <div className="player-row-card players-db-row-card">
      <div className="player-card-image-placeholder">
        {player.cardBackground ? (
          <img
            src={player.cardBackground}
            alt="Card Background"
            className="player-row-card-bg"
            width={120}
            height={160}
            loading="lazy"
          />
        ) : null}
        {hasPlayerImage ? (
          <>
            <img
              src={player.playerImage}
              alt={player.name}
              className="player-row-main-img"
              width={160}
              height={160}
              loading="lazy"
            />
            <span className="player-initials player-initials-hidden">{getInitials(player.name)}</span>
          </>
        ) : (
          <span className="player-initials">{getInitials(player.name)}</span>
        )}

        <div className="player-row-name" style={{ color: player.colorName }}>
          {player.name}
        </div>
        <div className="player-row-ovr" style={{ color: player.colorRating }}>
          {player.ovr || '?'}
        </div>
        <div className="player-row-position" style={{ color: player.colorPosition }}>
          {player.position || '?'}
        </div>

        {player.nationFlag ? (
          <img
            src={player.nationFlag}
            alt="Nation"
            className={`player-card-nation-flag ${playerType === 'normal' ? 'normal-nation-flag' : 'hero-icon-nation-flag'}`}
            width={14}
            height={14}
            loading="lazy"
          />
        ) : null}
        {player.clubFlag ? (
          <img
            src={player.clubFlag}
            alt="Club"
            className={`player-card-club-flag ${playerType === 'normal' ? 'normal-club-flag' : 'hero-icon-club-flag'}`}
            width={14}
            height={14}
            loading="lazy"
          />
        ) : null}
        {playerType === 'normal' && player.leagueImage ? (
          <img
            src={player.leagueImage}
            alt="League"
            className="player-card-league-watchlist-flag normal-league-watchlist-flag"
            width={14}
            height={14}
            loading="lazy"
          />
        ) : null}

        {player.isUntradable && (
          <div className="card-untradable-badge card-untradable-badge--players" style={{ pointerEvents: 'none' }}>
            <img src={UNTRADABLE_CARD_BADGE_URL} alt="Untradable" width={12} height={12} loading="lazy" />
          </div>
        )}
      </div>
    </div>
  );
}
