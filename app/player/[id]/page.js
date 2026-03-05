import { notFound } from 'next/navigation';
import PlayerDetailInteractions from '../../components/PlayerDetailInteractions.client';
import PlayerPriceWidget from '../../components/PlayerPriceWidget.client';
import SiteChrome from '../../components/SiteChrome';
import { getPlayerUniqueId } from '../../../src/lib/legacy-parity-contract.mjs';
import {
  PLAYER_PAGE_REVALIDATE_SECONDS,
  resolvePlayerProfileContract,
  resolvePlayerSeoContract
} from '../../../src/lib/server/player-seo-contract.mjs';
import { getPlayerPrerenderLimit } from '../../../src/lib/server/prerender-rollout.mjs';
import { readTopPlayerIds } from '../../../src/lib/server/top-players.mjs';

export const revalidate = PLAYER_PAGE_REVALIDATE_SECONDS;

function parseRank(rankValue) {
  const parsed = Number.parseInt(String(rankValue ?? '0'), 10);
  if (!Number.isFinite(parsed)) return 0;
  return Math.min(5, Math.max(0, parsed));
}

function isNotFoundError(error) {
  return typeof error?.message === 'string' && error.message.includes('Player fetch failed (404)');
}

async function loadPlayerSeoContract(playerId, rank) {
  return resolvePlayerSeoContract(playerId, {
    rank,
    metadataOptions: {
      siteName: 'Zenith',
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL
    }
  });
}

async function loadPlayerProfileContract(playerId, rank) {
  return resolvePlayerProfileContract(playerId, {
    rank,
    relatedLimit: 8,
    metadataOptions: {
      siteName: 'Zenith',
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL
    }
  });
}

function renderStars(value) {
  const stars = Number.isFinite(Number(value)) ? Math.max(0, Math.min(5, Number(value))) : 0;
  if (!stars) return 'N/A';
  return `${'★'.repeat(stars)}${'☆'.repeat(5 - stars)}`;
}

function getPlayerCardVariant(player) {
  return player?.leagueImage ? 'normal' : 'hero';
}

function getSectionAverage(section) {
  const values = (section?.rows || [])
    .map((row) => Number(row.value))
    .filter((value) => Number.isFinite(value));
  if (!values.length) return null;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function looksLikeImageUrl(value) {
  return /^https?:\/\//i.test(String(value || '').trim());
}

function deriveDisplayLabel(value, fallbackPrefix, index) {
  const text = String(value || '').trim();
  if (!text) return `${fallbackPrefix} ${index + 1}`;
  if (!looksLikeImageUrl(text)) return text;

  const fileName = text
    .split('/')
    .pop()
    ?.split('?')[0]
    ?.replace(/\.[a-z0-9]+$/i, '');

  if (!fileName) return `${fallbackPrefix} ${index + 1}`;

  const normalized = fileName
    .replace(/^skillmovelogo_[0-9]+_?/i, 'Skill Move ')
    .replace(/^celebrationlogo_[0-9]+_?/i, 'Celebration ')
    .replace(/^skill_[a-z0-9]+_/i, '')
    .replace(/^skill_/i, '')
    .replace(/[_-]+/g, ' ')
    .trim();

  if (!normalized) return `${fallbackPrefix} ${index + 1}`;
  return normalized
    .split(' ')
    .map((part) => (part ? `${part[0].toUpperCase()}${part.slice(1).toLowerCase()}` : part))
    .join(' ');
}

function mapDisplayList(values, fallbackPrefix) {
  return (Array.isArray(values) ? values : [])
    .map((value, index) => deriveDisplayLabel(value, fallbackPrefix, index))
    .filter(Boolean);
}

const RANK_COLORS = Object.freeze({
  0: '#98A0A6',
  1: '#3BD671',
  2: '#6366F1',
  3: '#8B5CF6',
  4: '#FF6B6B',
  5: '#FFB86B'
});

const RANK_SPRITES = Object.freeze({
  1: '/assets/images/ranks/green_rank_enhanced_main.webp',
  2: '/assets/images/ranks/blue_rank_enhanced_main.webp',
  3: '/assets/images/ranks/purple_rank_enhanced_main.webp',
  4: '/assets/images/ranks/red_rank_enhanced_main.webp',
  5: '/assets/images/ranks/gold_rank_enhanced_main.webp'
});

const RANK_SKILL_POINTS = Object.freeze({
  0: 0,
  1: 1,
  2: 2,
  3: 3,
  4: 4,
  5: 5
});

function buildSkillEntries(record) {
  const skillNames = Array.isArray(record?.skills) ? record.skills.filter(Boolean) : [];
  const traitNames = Array.isArray(record?.traits) ? record.traits.filter(Boolean) : [];
  const skillImages = Array.isArray(record?.skillImages) ? record.skillImages.filter(Boolean) : [];
  const traitImages = Array.isArray(record?.traitImages) ? record.traitImages.filter(Boolean) : [];

  const skills = Array.from({ length: Math.max(skillNames.length, skillImages.length) }, (_, index) => {
    const rawName = skillNames[index] || '';
    const rawImage = skillImages[index] || '';
    const icon = looksLikeImageUrl(rawImage) ? rawImage : looksLikeImageUrl(rawName) ? rawName : '';
    return {
      id: `skill-${index}`,
      type: 'Skill',
      name: deriveDisplayLabel(rawName || rawImage, 'Skill', index),
      icon
    };
  }).filter((entry) => entry.name);

  const traits = Array.from({ length: Math.max(traitNames.length, traitImages.length) }, (_, index) => {
    const rawName = traitNames[index] || '';
    const rawImage = traitImages[index] || '';
    const icon = looksLikeImageUrl(rawImage) ? rawImage : looksLikeImageUrl(rawName) ? rawName : '';
    return {
      id: `trait-${index}`,
      type: 'Trait',
      name: deriveDisplayLabel(rawName || rawImage, 'Trait', index),
      icon
    };
  }).filter((entry) => entry.name);

  return [...skills, ...traits].slice(0, 12);
}

export async function generateStaticParams() {
  const prerenderLimit = getPlayerPrerenderLimit();
  const ids = await readTopPlayerIds();
  console.info('[rollout] /player static params', { prerenderLimit, totalIds: ids.length });
  return ids.slice(0, prerenderLimit).map((id) => ({ id }));
}

export async function generateMetadata({ params, searchParams }) {
  const rank = parseRank(searchParams?.rank);

  try {
    const { metadata } = await loadPlayerSeoContract(params.id, rank);
    return {
      title: metadata.title,
      description: metadata.description,
      alternates: { canonical: metadata.canonical },
      openGraph: metadata.openGraph,
      twitter: {
        card: 'summary_large_image',
        title: metadata.title,
        description: metadata.description,
        images: metadata.openGraph.images?.map((image) => image.url).filter(Boolean)
      }
    };
  } catch (error) {
    if (isNotFoundError(error)) {
      return {
        title: 'Player not found | Zenith',
        description: 'This player could not be found in the Zenith database.'
      };
    }
    throw error;
  }
}

export default async function PlayerDetailPage({ params, searchParams }) {
  const startedAt = Date.now();
  const rank = parseRank(searchParams?.rank);

  let contract;
  try {
    contract = await loadPlayerProfileContract(params.id, rank);
  } catch (error) {
    if (isNotFoundError(error)) {
      notFound();
    }
    throw error;
  }

  const { record, metadata, seoParagraphs, attributeSections, relatedPlayers } = contract;
  const cardVariant = getPlayerCardVariant(record);
  const cardBackground = record.cardBackground || record.image || '/assets/images/zenith_logo_svg.svg';
  const cardImage = record.playerImage || record.image || '';
  const profileParagraphs = seoParagraphs.length
    ? seoParagraphs
    : [record.summary || `${record.name} profile and latest market context from Zenith.`];
  const watchlistUniqueId = getPlayerUniqueId({
    playerId: record.playerId,
    rank,
    is_untradable: record.isUntradable
  });
  const skillEntries = buildSkillEntries(record);
  const profileTraitNames = mapDisplayList(record.traits, 'Trait');
  const profileSkillNames = mapDisplayList(record.skills, 'Skill');
  const currentRankColor = RANK_COLORS[rank] || RANK_COLORS[0];
  const isAuctionable = !record.isUntradable;
  console.info('[metrics] /player render', {
    playerId: record.playerId,
    rank,
    attributeSectionCount: attributeSections.length,
    relatedCount: relatedPlayers.length,
    elapsedMs: Date.now() - startedAt
  });

  return (
    <SiteChrome activeView="players">
      <main className="main-content">
      <div id="player-detail-view" className="view active">
        <div
          style={{
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '24px 16px 40px',
            background: 'rgba(20, 24, 28, 0.5)',
            backdropFilter: 'blur(25px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            minHeight: '100vh',
            borderRadius: '16px'
          }}
        >
          <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px 24px 0 24px' }}>
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
              <div>
                <div
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
                  <div
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
                    <img src={cardBackground} alt="Card Background" className="card-background-img-inside" />
                    {!!cardImage && <img src={cardImage} alt={record.name} className="player-image-img-inside" />}
                    <div className="card-ovr-inside" style={{ color: record.colorRating || '#FFFFFF' }}>
                      {record.ovr && record.ovr > 0 ? record.ovr : 'N/A'}
                    </div>
                    <div className="card-position-inside" style={{ color: record.colorPosition || '#FFFFFF' }}>
                      {record.position || 'N/A'}
                    </div>
                    <div className="card-player-name-inside" style={{ color: record.colorName || '#FFFFFF' }}>
                      {record.name}
                    </div>
                    {!!record.nationFlag && (
                      <img
                        src={record.nationFlag}
                        alt="Nation"
                        className={`card-nation-flag-inside-detail ${
                          cardVariant === 'normal' ? 'normal-nation-flag-detail' : 'hero-icon-nation-flag-detail'
                        }`}
                      />
                    )}
                    {!!record.clubFlag && (
                      <img
                        src={record.clubFlag}
                        alt="Club"
                        className={`card-club-flag-inside-detail ${
                          cardVariant === 'normal' ? 'normal-club-flag-detail' : 'hero-icon-club-flag-detail'
                        }`}
                      />
                    )}
                    {cardVariant === 'normal' && !!record.leagueImage && (
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
                    {record.name}
                  </h1>

                  <p
                    style={{
                      margin: '0 0 22px 0',
                      textAlign: 'center',
                      color: 'var(--color-text-muted, #98A0A6)',
                      fontWeight: 600
                    }}
                  >
                    OVR {record.ovr} {record.position ? `• ${record.position}` : ''} {record.nation ? `• ${record.nation}` : ''}{' '}
                    {record.club ? `• ${record.club}` : ''} {record.isUntradable ? '• Untradable' : ''}
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
                      <div style={{ fontSize: '18px', color: '#FFB86B', letterSpacing: '2px' }}>{renderStars(record.skillMoves)}</div>
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
                      <div style={{ fontSize: '18px', color: '#FFB86B', letterSpacing: '2px' }}>{renderStars(record.weakFoot)}</div>
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
                      <span style={{ color: 'var(--color-text-muted, #98A0A6)', fontWeight: 600 }}>League</span>
                      <span style={{ color: 'var(--color-text-primary, #E6EEF2)', fontWeight: 700 }}>{record.league || 'Unknown'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span style={{ color: 'var(--color-text-muted, #98A0A6)', fontWeight: 600 }}>Work Rates</span>
                      <span style={{ color: 'var(--color-text-primary, #E6EEF2)', fontWeight: 700 }}>
                        {record.workRateAttack || 'Unknown'} / {record.workRateDefense || 'Unknown'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span style={{ color: 'var(--color-text-muted, #98A0A6)', fontWeight: 600 }}>Strong Foot</span>
                      <span style={{ color: 'var(--color-text-primary, #E6EEF2)', fontWeight: 700 }}>
                        {record.strongFootSide || 'Unknown'} {record.strongFoot ? `(${renderStars(record.strongFoot)})` : ''}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--color-text-muted, #98A0A6)', fontWeight: 600 }}>Body</span>
                      <span style={{ color: 'var(--color-text-primary, #E6EEF2)', fontWeight: 700 }}>
                        {record.heightCm ? `${record.heightCm}cm` : 'Unknown'} / {record.weightKg ? `${record.weightKg}kg` : 'Unknown'}
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
                      {record.isUntradable ? 'Non-Auctionable' : 'Live price below'}
                    </div>
                  </div>
                </div>

                <button
                  data-watchlist-toggle
                  data-unique-id={watchlistUniqueId}
                  data-player-id={record.playerId}
                  data-player-name={record.name}
                  data-rank={rank}
                  data-untradable={record.isUntradable ? '1' : '0'}
                  data-position={record.position || ''}
                  data-ovr={record.ovr || 0}
                  data-team={record.club || ''}
                  data-club={record.club || ''}
                  data-league={record.league || ''}
                  data-nation={record.nation || ''}
                  data-event={record.eventName || record.event || ''}
                  data-skill={record.skillMoves || 0}
                  data-price={record.price || 0}
                  data-card-background={cardBackground}
                  data-player-image={cardImage}
                  data-nation-flag={record.nationFlag || ''}
                  data-club-flag={record.clubFlag || ''}
                  data-league-image={record.leagueImage || ''}
                  data-color-name={record.colorName || '#FFFFFF'}
                  data-color-rating={record.colorRating || '#FFB86B'}
                  data-color-position={record.colorPosition || '#FFFFFF'}
                  data-alternate-position={record.alternatePosition || ''}
                  type="button"
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: 'var(--color-text-muted, #98A0A6)',
                    padding: '16px 24px',
                    borderRadius: 'var(--radius-base, 8px)',
                    cursor: 'pointer',
                    fontSize: '15px',
                    fontWeight: 700,
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    marginTop: '16px'
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                  <span data-watchlist-label>Add to Watchlist</span>
                </button>
              </div>

              <div>
                <div className="player-rank-refresh-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div
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
                        gap: '10px'
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                      <span>Select Rank</span>
                      <button className="reset-rank-btn" data-reset-rank type="button">
                        Reset Rank
                      </button>
                    </div>

                    <div className="rank-cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '14px', marginBottom: '16px' }}>
                      {[1, 2, 3, 4, 5].map((rankNum) => {
                        const isSelected = rank === rankNum;
                        const rankColor = RANK_COLORS[rankNum];
                        return (
                          <button
                            key={`${record.playerId}-rank-${rankNum}`}
                            className={`rank-card ${isSelected ? 'selected' : ''}`}
                            data-rank-card
                            data-rank={rankNum}
                            type="button"
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
                            <div
                              className="rank-selector-icon"
                              style={{
                                width: '56px',
                                height: '56px',
                                backgroundImage: `url('${RANK_SPRITES[rankNum]}')`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                backgroundRepeat: 'no-repeat',
                                imageRendering: 'pixelated',
                                filter: isSelected ? `drop-shadow(0 0 8px ${rankColor})` : 'none'
                              }}
                            />
                            {isSelected && (
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
                            )}
                          </button>
                        );
                      })}
                    </div>

                    <div
                      style={{
                        background: 'rgba(20,24,28)',
                        border: '1px solid rgba(0,194,168,0.12)',
                        borderRadius: '10px',
                        padding: '16px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)', textTransform: 'uppercase' }}>
                          Training Level
                        </span>
                        <div
                          data-skill-points
                          style={{
                            background: 'rgba(0,194,168,0.15)',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 700,
                            color: 'var(--color-teal-500)'
                          }}
                        >
                          {RANK_SKILL_POINTS[rank] || 0} Points
                        </div>
                      </div>
                      <select
                        id={`training-level-${record.playerId}`}
                        data-training-level
                        defaultValue="0"
                        style={{
                          width: '100%',
                          background: 'var(--color-graphite-800)',
                          border: '2px solid rgba(0,194,168,0.2)',
                          borderRadius: '8px',
                          padding: '12px 16px',
                          fontSize: '14px',
                          fontWeight: 600,
                          color: 'var(--color-text-primary)',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="0">No Training</option>
                        {Array.from({ length: 30 }, (_, index) => index + 1).map((level) => (
                          <option key={`${record.playerId}-training-${level}`} value={level}>
                            Level {level}
                          </option>
                        ))}
                      </select>

                      <div
                        data-training-indicator
                        style={{
                          marginTop: '12px',
                          padding: '10px',
                          background: 'rgba(59,214,113,0.08)',
                          border: '1px solid rgba(59,214,113,0.15)',
                          borderRadius: '6px',
                          display: 'none',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        <span style={{ fontSize: '12px', color: '#3BD671', fontWeight: 600 }}>
                          Training Level <span data-training-level-value>0</span> Active
                        </span>
                      </div>

                      <div style={{ marginTop: '12px', fontSize: '13px', color: 'var(--color-text-muted, #98A0A6)' }}>
                        Projected OVR: <strong style={{ color: currentRankColor }} data-projected-ovr>{record.ovr + rank}</strong>
                      </div>
                    </div>
                  </div>

                  <div
                    className="player-refresh-container"
                    style={{
                      background: 'var(--color-graphite-800)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '20px',
                      marginTop: '20px'
                    }}
                  >
                    <div
                      style={{
                        fontSize: '16px',
                        fontWeight: 800,
                        color: 'var(--color-text-primary)',
                        margin: '0 0 18px 0',
                        textTransform: 'uppercase',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      Market Refresh
                    </div>
                    <div
                      style={{
                        background: 'rgba(0, 194, 168, 0.08)',
                        border: '1px solid rgba(0, 194, 168, 0.25)',
                        borderRadius: '10px',
                        padding: '16px',
                        marginBottom: '12px'
                      }}
                    >
                      <div
                        style={{
                          fontSize: '13px',
                          fontWeight: 700,
                          color: 'var(--color-text-muted)',
                          marginBottom: '8px',
                          textTransform: 'uppercase'
                        }}
                      >
                        Next Refresh
                      </div>
                      <div className="player-refresh-time-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div className="player-refresh-time" style={{ fontSize: '20px', fontWeight: 900, color: 'var(--color-teal-500)' }}>
                          Live
                        </div>
                        <div
                          className="player-refresh-countdown"
                          style={{
                            fontSize: '14px',
                            fontWeight: 700,
                            color: 'var(--color-teal-500)',
                            background: 'rgba(0,194,168,0.15)',
                            padding: '6px 12px',
                            borderRadius: '6px'
                          }}
                        >
                          <span data-market-countdown>00:00</span>
                        </div>
                      </div>
                    </div>
                    <PlayerPriceWidget playerId={record.playerId} rank={rank} compact />
                  </div>
                </div>

                <section className="player-skills-section" style={{ marginTop: '24px' }}>
                  <div className="skills-header">
                    <h3>Skills &amp; Abilities</h3>
                    <button className="reset-skills-btn" id="reset-player-skills" type="button">
                      Reset Skills
                    </button>
                  </div>
                  <div className="points-info">
                    <span className="current-level-badge">Current Rank: {rank}</span>
                    <span className="points-remaining-badge">Skills loaded: {skillEntries.length}</span>
                  </div>
                  <div className="skills-grid" id="player-skills-grid">
                    {skillEntries.map((entry) => (
                      <div
                        key={`${record.playerId}-${entry.id}`}
                        className="skill-card"
                        data-skill-name={entry.name}
                        data-skill-type={entry.type}
                        data-skill-level="0"
                        data-skill-icon={entry.icon || ''}
                      >
                        <div className="skill-card-inner">
                          <div className="skill-icon">
                            <img src={entry.icon || '/assets/images/zenith_logo_svg.svg'} alt={entry.name} />
                          </div>
                          <div className="skill-name">{entry.name}</div>
                          <div className="skill-level">
                            Level: <span className="level-number">0</span>/1
                          </div>
                          <div className="skill-actions">
                            <small style={{ color: '#98A0A6' }}>{entry.type}</small>
                          </div>
                        </div>
                      </div>
                    ))}
                    {!skillEntries.length && <p style={{ color: '#98A0A6', textAlign: 'center' }}>No skills available</p>}
                  </div>

                  <div className="skill-detail-modal" id="skill-detail-modal" style={{ display: 'none' }}>
                    <div className="skill-modal-content" id="skill-modal-content">
                      <button className="modal-close-btn" id="skill-modal-close" type="button">
                        ×
                      </button>
                      <h3 style={{ marginTop: 0, color: '#E6EEF2' }}>Skill Details</h3>
                      <p style={{ color: '#98A0A6' }}>Select a skill card to view details.</p>
                    </div>
                  </div>
                </section>

                <section className="player-skills-section" style={{ marginTop: '20px' }}>
                  <div className="skills-header">
                    <h3>Profile Overview</h3>
                  </div>
                  {profileParagraphs.map((paragraph, index) => (
                    <p key={`${record.playerId}-seo-${index}`} style={{ lineHeight: 1.65, marginTop: 0, marginBottom: '10px' }}>
                      {paragraph}
                    </p>
                  ))}
                  {!!profileTraitNames.length && (
                    <p style={{ marginTop: '12px', marginBottom: '6px' }}>
                      <strong>Traits:</strong> {profileTraitNames.join(', ')}
                    </p>
                  )}
                  {!!profileSkillNames.length && (
                    <p style={{ marginTop: '8px', marginBottom: 0 }}>
                      <strong>Abilities:</strong> {profileSkillNames.join(', ')}
                    </p>
                  )}
                </section>

                <section className="player-price-history-section" data-auctionable={isAuctionable ? 'true' : 'false'} data-range="7D">
                  <div className="price-history-header">
                    <div>
                      <h3>Price History</h3>
                      <span className="price-history-subtitle">Track market movement over time</span>
                    </div>
                    <div className="price-history-ranges" role="tablist" aria-label="Price history ranges">
                      {['1D', '3D', '7D', '15D', '30D', 'Custom'].map((label) => (
                        <button key={`${record.playerId}-range-${label}`} className={`price-range-btn ${label === '7D' ? 'active' : ''}`} data-range={label} type="button">
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="price-history-custom">
                    <div className="price-history-custom-label">
                      Custom range: <span id="price-history-custom-days">7</span> days
                    </div>
                    <input className="price-history-slider" id="price-history-slider" type="range" min="1" max="30" defaultValue="7" />
                  </div>
                  <div className="price-history-body">
                    <div className="price-history-empty" id="price-history-empty" style={{ position: 'static', display: 'block' }}>
                      Interactive chart updates in client mode. Use the range controls to inspect snapshots.
                    </div>
                    <div className="price-history-chart">
                      <canvas id="player-price-history-chart" />
                    </div>
                  </div>
                </section>
              </div>
            </section>
          </div>

          <section className="player-stats-section" style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px 20px 24px' }}>
            <h2
              style={{
                fontSize: '22px',
                fontWeight: 800,
                color: 'var(--color-text-primary, #E6EEF2)',
                margin: '0 0 20px 0',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              Player Statistics
            </h2>
            <div className="stats-grid-container">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                {attributeSections.map((section) => {
                  const sectionAverage = getSectionAverage(section);
                  return (
                    <article
                      key={section.key}
                      style={{
                        background: 'var(--color-graphite-800, #14181C)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderLeft: '4px solid #00C2A8',
                        borderRadius: 'var(--radius-lg, 12px)',
                        padding: '20px'
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '16px',
                          paddingBottom: '12px',
                          borderBottom: '1px solid rgba(255,255,255,0.08)'
                        }}
                      >
                        <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--color-text-primary, #E6EEF2)', textTransform: 'uppercase' }}>
                          {section.title}
                        </h3>
                        <div style={{ fontSize: '30px', fontWeight: 900, color: '#00C2A8', lineHeight: 1 }}>{sectionAverage ?? '-'}</div>
                      </div>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <tbody>
                          {section.rows.map((row) => (
                            <tr key={`${section.key}-${row.key}`}>
                              <th
                                scope="row"
                                style={{
                                  textAlign: 'left',
                                  padding: '7px 0',
                                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                                  color: 'var(--color-text-muted, #98A0A6)',
                                  fontWeight: 600,
                                  width: '72%'
                                }}
                              >
                                {row.label}
                              </th>
                              <td
                                style={{
                                  textAlign: 'right',
                                  padding: '7px 0',
                                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                                  color: 'var(--color-text-primary, #E6EEF2)',
                                  fontWeight: 800
                                }}
                              >
                                {row.value}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>

          <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px 24px 24px' }}>
            <section style={{ marginTop: '20px' }}>
              <h2 style={{ marginBottom: '10px' }}>Related Players</h2>
              {!relatedPlayers.length && <p style={{ marginTop: 0 }}>No related players available.</p>}
              {!!relatedPlayers.length && (
                <div id="latest-players-grid">
                  {relatedPlayers.map((player) => {
                    const relatedVariant = getPlayerCardVariant(player);
                    const relatedCardBackground = player.cardBackground || player.image || '/assets/images/zenith_logo_svg.svg';
                    const relatedCardImage = player.playerImage || player.image || '';

                    return (
                      <article key={player.playerId} style={{ display: 'grid', gap: '8px', justifyItems: 'center' }}>
                        <div className="dashboard-player-card">
                          <a
                            href={`/player/${player.playerId}`}
                            aria-label={`View ${player.name}`}
                            style={{ display: 'block', width: '100%', height: '100%' }}
                          >
                            <div className="card-container">
                              <img src={relatedCardBackground} alt="" className="card-background-img" />
                              {!!relatedCardImage && (
                                <img src={relatedCardImage} alt={`${player.name} card image`} className="player-image-img" />
                              )}
                              <div className="card-ovr" style={{ color: player.colorRating || '#FFFFFF' }}>
                                {player.ovr && player.ovr > 0 ? player.ovr : 'NA'}
                              </div>
                              <div className="card-position" style={{ color: player.colorPosition || '#FFFFFF' }}>
                                {player.position || 'NA'}
                              </div>
                              <div className="card-player-name" style={{ color: player.colorName || '#FFFFFF' }}>
                                {player.name}
                              </div>
                              {!!player.nationFlag && (
                                <img
                                  src={player.nationFlag}
                                  alt="Nation"
                                  className={`card-nation-flag-home ${
                                    relatedVariant === 'normal' ? 'normal-nation-flag-home' : 'hero-icon-nation-flag-home'
                                  }`}
                                />
                              )}
                              {!!player.clubFlag && (
                                <img
                                  src={player.clubFlag}
                                  alt="Club"
                                  className={`card-club-flag-home ${
                                    relatedVariant === 'normal' ? 'normal-club-flag-home' : 'hero-icon-club-flag-home'
                                  }`}
                                />
                              )}
                              {relatedVariant === 'normal' && !!player.leagueImage && (
                                <img src={player.leagueImage} alt="League" className="card-league-flag-home normal-league-flag-home" />
                              )}
                              {player.isUntradable && (
                                <div className="card-untradable-badge">
                                  <img src="/assets/images/untradable_img.png" alt="Untradable" />
                                </div>
                              )}
                            </div>
                          </a>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        </div>

        <PlayerDetailInteractions playerId={record.playerId} currentRank={rank} baseOvr={record.ovr} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(metadata.jsonLd) }} />
      </div>
      </main>
    </SiteChrome>
  );
}
