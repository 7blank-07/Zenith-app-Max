import PlayersDatabaseInteractions from '../components/PlayersDatabaseInteractions.client';
import SiteChrome from '../components/SiteChrome';
import { PLAYER_PAGE_REVALIDATE_SECONDS } from '../../src/lib/server/player-seo-contract.mjs';
import { getPrerenderRolloutState } from '../../src/lib/server/prerender-rollout.mjs';
import { fetchPlayersByIds, readTopPlayerIds } from '../../src/lib/server/top-players.mjs';

export const revalidate = PLAYER_PAGE_REVALIDATE_SECONDS;

const LISTING_LIMIT = 350;
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

function uniqueSorted(values) {
  return [...new Set(values.map((value) => String(value || '').trim()).filter(Boolean))].sort((left, right) =>
    left.localeCompare(right)
  );
}

function readSearchParam(searchParams, key, fallback = '') {
  const rawValue = searchParams?.[key];
  if (Array.isArray(rawValue)) {
    return String(rawValue[0] ?? fallback).trim();
  }
  return String(rawValue ?? fallback).trim();
}

function buildPlayersJsonLd(players) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: players.map((player, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${siteUrl}/player/${encodeURIComponent(player.playerId)}`,
      name: player.name
    }))
  };
}

export default async function PlayersPage({ searchParams = {} }) {
  const startedAt = Date.now();
  const rollout = getPrerenderRolloutState();
  const topIds = await readTopPlayerIds(LISTING_LIMIT);
  const players = await fetchPlayersByIds(topIds, { rank: 0 });
  const jsonLd = buildPlayersJsonLd(players);

  const positions = uniqueSorted(players.map((player) => player.position));
  const leagues = uniqueSorted(players.map((player) => player.league));
  const clubs = uniqueSorted(players.map((player) => player.club));
  const nations = uniqueSorted(players.map((player) => player.nation));
  const skillMoves = uniqueSorted(players.map((player) => player.skillMoves).filter((value) => Number(value) > 0)).sort((a, b) => Number(b) - Number(a));
  const initialSquadPickContext = {
    enabled: readSearchParam(searchParams, 'squadPick') === '1',
    slotId: readSearchParam(searchParams, 'slotId'),
    position: readSearchParam(searchParams, 'position').toUpperCase(),
    formationId: readSearchParam(searchParams, 'formationId'),
    returnTo: readSearchParam(searchParams, 'returnTo', '/tools?tool=squadbuilder')
  };

  console.info('[metrics] /players render', {
    elapsedMs: Date.now() - startedAt,
    listedPlayers: players.length,
    prerenderTier: rollout.tier,
    prerenderLimit: rollout.limit
  });

  return (
    <SiteChrome activeView="players">
      <main className="main-content">
        <PlayersDatabaseInteractions
          players={players}
          positions={positions}
          leagues={leagues}
          clubs={clubs}
          nations={nations}
          skillMoves={skillMoves}
          initialSquadPickContext={initialSquadPickContext}
        />
      </main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </SiteChrome>
  );
}
