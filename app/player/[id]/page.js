import { notFound } from 'next/navigation';
import AnimatedRankIcon from '../../components/AnimatedRankIcon.client';
import PlayerMarketValue from '../../components/PlayerMarketValue.client';
import PlayerPriceHistorySection from '../../components/PlayerPriceHistorySection.client';
import PlayerRefreshTimePanel from '../../components/PlayerRefreshTimePanel.client';
import PlayerSkillsAbilitiesSection from '../../components/PlayerSkillsAbilitiesSection.client';
import PlayerStatisticsSection from '../../components/PlayerStatisticsSection.client';
import PlayerTrainingLevelPanel from '../../components/PlayerTrainingLevelPanel.client';
import PlayerDetailInteractions from '../../components/PlayerDetailInteractions.client';
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

function buildProfileOverviewItems(names, images, fallbackPrefix, idPrefix) {
  const normalizedNames = Array.isArray(names) ? names.filter(Boolean) : [];
  const normalizedImages = Array.isArray(images) ? images.filter(Boolean) : [];

  return Array.from({ length: Math.max(normalizedNames.length, normalizedImages.length) }, (_, index) => {
    const rawName = normalizedNames[index] || '';
    const rawImage = normalizedImages[index] || '';
    const icon = looksLikeImageUrl(rawImage) ? rawImage : looksLikeImageUrl(rawName) ? rawName : '';
    return {
      id: `${idPrefix}-${index}`,
      name: deriveDisplayLabel(rawName || rawImage, fallbackPrefix, index),
      icon
    };
  }).filter((entry) => entry.name);
}

function formatWorkRateText(value) {
  const text = String(value || '')
    .trim()
    .replace(/[_-]+/g, ' ');
  if (!text) return 'Unknown';
  return text
    .split(/\s+/)
    .map((part) => `${part[0]?.toUpperCase() || ''}${part.slice(1).toLowerCase()}`)
    .join(' ');
}

function formatProfileValue(value, fallback = 'Unknown') {
  if (value === null || value === undefined) return fallback;
  const text = String(value).trim();
  return text || fallback;
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

  const { record, metadata, attributeSections, relatedPlayers } = contract;
  const cardVariant = getPlayerCardVariant(record);
  const cardBackground = record.cardBackground || record.image || '/assets/images/zenith_logo_svg.svg';
  const cardImage = record.playerImage || record.image || '';
  const profileSummary = record.summary || `${record.name} profile and latest market context from Zenith.`;
  const watchlistUniqueId = getPlayerUniqueId({
    playerId: record.playerId,
    rank,
    is_untradable: record.isUntradable
  });
  const profileTraitItems = buildProfileOverviewItems(record.traits, record.traitImages, 'Trait', 'profile-trait');
  const profileAbilityItems = buildProfileOverviewItems(record.skills, record.skillImages, 'Ability', 'profile-ability');
  const workRateAttackLabel = formatWorkRateText(record.workRateAttack);
  const workRateDefenseLabel = formatWorkRateText(record.workRateDefense);
  const profileOverviewFields = [
    { label: 'Full Name', value: formatProfileValue(record.fullName || record.name) },
    { label: 'Event Name', value: formatProfileValue(record.eventName) },
    { label: 'Nation', value: formatProfileValue(record.nation) },
    { label: 'Height (ft/in)', value: formatProfileValue(record.heightFtIn) },
    { label: 'Height (cm)', value: formatProfileValue(record.heightCm) },
    { label: 'Weight (kg)', value: formatProfileValue(record.weightKg) },
    { label: 'Work Rate Attack', value: workRateAttackLabel },
    { label: 'Work Rate Defense', value: workRateDefenseLabel },
    { label: 'Alternate Position', value: formatProfileValue(record.alternatePosition) },
    { label: 'Date Added', value: formatProfileValue(record.dateAdded) }
  ];
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
                        {workRateAttackLabel} / {workRateDefenseLabel}
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
                      {record.isUntradable ? (
                        'Non-Auctionable'
                      ) : (
                        <>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <circle cx="12" cy="12" r="10" />
                          </svg>
                          <PlayerMarketValue playerId={record.playerId} rank={rank} isUntradable={record.isUntradable} fallbackPrice={record.price} />
                        </>
                      )}
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
                            <AnimatedRankIcon
                              className="rank-selector-icon animated-rank-icon"
                              rank={rankNum}
                              spriteUrl={RANK_SPRITES[rankNum]}
                              size={56}
                              style={{
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

                    <PlayerTrainingLevelPanel playerId={record.playerId} position={record.position} rank={rank} />
                  </div>

                  <PlayerRefreshTimePanel playerId={record.playerId} />
                </div>

                <PlayerSkillsAbilitiesSection playerId={record.playerId} currentRank={rank} />

                <PlayerPriceHistorySection playerId={record.playerId} rank={rank} isAuctionable={isAuctionable} />
              </div>
            </section>
          </div>

          <PlayerStatisticsSection
            player={record}
            playerId={record.playerId}
            profileSectionTitle="Profile Overview"
            profileRows={profileOverviewFields}
            profileCollections={[
              { key: 'traits', title: 'Traits', items: profileTraitItems },
              { key: 'abilities', title: 'Abilities', items: profileAbilityItems }
            ]}
            profileSummary={profileSummary}
          />

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
