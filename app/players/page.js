import Link from 'next/link';
import PlayerPriceWidget from '../components/PlayerPriceWidget.client';
import { PLAYER_PAGE_REVALIDATE_SECONDS } from '../../src/lib/server/player-seo-contract.mjs';
import { getPrerenderRolloutState } from '../../src/lib/server/prerender-rollout.mjs';
import { fetchPlayersByIds, readTopPlayerIds } from '../../src/lib/server/top-players.mjs';

export const revalidate = PLAYER_PAGE_REVALIDATE_SECONDS;

const LISTING_LIMIT = 48;
const LIVE_WIDGET_LIMIT = 8;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://zenithfcm.com';

export const metadata = {
  title: 'Player Database | Zenith',
  description: 'Server-rendered player listing with live client-side market prices.',
  alternates: { canonical: '/players' },
  openGraph: {
    title: 'Player Database | Zenith',
    description: 'Server-rendered player listing with live client-side market prices.',
    url: `${siteUrl}/players`,
    siteName: 'Zenith',
    type: 'website'
  }
};

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

export default async function PlayersPage() {
  const startedAt = Date.now();
  const rollout = getPrerenderRolloutState();
  const topIds = await readTopPlayerIds(LISTING_LIMIT);
  const players = await fetchPlayersByIds(topIds, { rank: 0 });
  const jsonLd = buildPlayersJsonLd(players);
  console.info('[metrics] /players render', {
    elapsedMs: Date.now() - startedAt,
    listedPlayers: players.length,
    prerenderTier: rollout.tier,
    prerenderLimit: rollout.limit
  });

  return (
    <main style={{ maxWidth: '980px', margin: '0 auto', padding: '28px 16px 40px' }}>
      <h1 style={{ marginBottom: '10px' }}>Player Database</h1>
      <p style={{ marginTop: 0, marginBottom: '20px' }}>
        This route is server-rendered for indexability. Live prices hydrate client-side after page load.
      </p>
      <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: '14px' }}>
        {players.map((player, index) => (
          <li key={player.playerId} style={{ border: '1px solid #d5d8dc', borderRadius: '10px', padding: '12px' }}>
            <Link href={`/player/${player.playerId}`} style={{ fontWeight: 600, textDecoration: 'none' }}>
              {index + 1}. {player.name}
            </Link>
            <p style={{ margin: '6px 0 8px' }}>
              OVR {player.ovr} {player.position ? `• ${player.position}` : ''} {player.isUntradable ? '• Untradable' : ''}
            </p>
            {index < LIVE_WIDGET_LIMIT && <PlayerPriceWidget playerId={player.playerId} rank={0} compact />}
          </li>
        ))}
      </ol>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </main>
  );
}
