import PlayersDatabaseInteractions from '../components/PlayersDatabaseInteractions.client';
import SiteChrome from '../components/SiteChrome';
import '../../assets/css/watchlist-styles.css';
import { buildPlayerPath } from '../../src/lib/player-slug.mjs';
import { PLAYER_PAGE_REVALIDATE_SECONDS } from '../../src/lib/server/player-seo-contract.mjs';
import { getPrerenderRolloutState } from '../../src/lib/server/prerender-rollout.mjs';
import { fetchAllPlayerFilterMetadata } from '../../src/lib/server/top-players.mjs';

export const revalidate = PLAYER_PAGE_REVALIDATE_SECONDS;
export const dynamic = 'force-dynamic';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://zenithfcm.com';

export const metadata = {
  title: 'Player Database | Zenith',
  description: 'Player database with search, filters, stats controls, and watchlist interactions.',
  alternates: { canonical: '/players' },
  openGraph: {
    title: 'Player Database | Zenith',
    description: 'Player database with search, filters, stats controls, and watchlist interactions.',
    url: `${siteUrl}/players`,
    siteName: 'Zenith',
    type: 'website'
  }
};

function readSearchParam(searchParams, key, fallback = '') {
  const rawValue = searchParams?.[key];
  if (Array.isArray(rawValue)) {
    return String(rawValue[0] ?? fallback).trim();
  }
  return String(rawValue ?? fallback).trim();
}

function readBenchIndexParam(searchParams, key) {
  const parsed = Number.parseInt(readSearchParam(searchParams, key), 10);
  if (!Number.isInteger(parsed) || parsed < 0 || parsed >= 7) return null;
  return parsed;
}

function buildPlayersJsonLd(players) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: players.map((player, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${siteUrl}${buildPlayerPath(player)}`,
      name: player.name
    }))
  };
}

export default async function PlayersPage({ searchParams = {} }) {
  const startedAt = Date.now();
  const rollout = getPrerenderRolloutState();
  const players = [];
  const filterMetadata = await fetchAllPlayerFilterMetadata({ rank: 0 });
  const jsonLd = buildPlayersJsonLd(players);

  const positions = filterMetadata.positions;
  const leagues = filterMetadata.leagues;
  const clubs = filterMetadata.clubs;
  const nations = filterMetadata.nations;
  const events = filterMetadata.events;
  const skillMoves = filterMetadata.skillMoves;
  const initialSquadPickContext = {
    enabled: readSearchParam(searchParams, 'squadPick') === '1',
    slotId: readSearchParam(searchParams, 'slotId'),
    benchIndex: readBenchIndexParam(searchParams, 'benchIndex'),
    position: readSearchParam(searchParams, 'position').toUpperCase(),
    formationId: readSearchParam(searchParams, 'formationId'),
    returnTo: readSearchParam(searchParams, 'returnTo', '/tools/squad-builder')
  };

  console.info('[metrics] /players render', {
    elapsedMs: Date.now() - startedAt,
    listedPlayers: players.length,
    prerenderTier: rollout.tier,
    prerenderLimit: rollout.limit
  });

  return (
    <SiteChrome activeView="players">
      <main className="players-main-content players-grid--database">
        <PlayersDatabaseInteractions
          players={players}
          positions={positions}
          leagues={leagues}
          clubs={clubs}
          nations={nations}
          events={events}
          skillMoves={skillMoves}
          initialSquadPickContext={initialSquadPickContext}
        />
      </main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </SiteChrome>
  );
}
