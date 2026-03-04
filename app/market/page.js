import Link from 'next/link';
import PlayerPriceWidget from '../components/PlayerPriceWidget.client';
import { PLAYER_PAGE_REVALIDATE_SECONDS } from '../../src/lib/server/player-seo-contract.mjs';
import { getPrerenderRolloutState } from '../../src/lib/server/prerender-rollout.mjs';
import { fetchPlayersByIds, readTopPlayerIds } from '../../src/lib/server/top-players.mjs';

export const revalidate = PLAYER_PAGE_REVALIDATE_SECONDS;

const MARKET_FEATURED_LIMIT = 18;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://zenithfcm.com';

export const metadata = {
  title: 'Market Tracker | Zenith',
  description: 'Server-rendered market overview with live client-side price refresh widgets.',
  alternates: { canonical: '/market' },
  openGraph: {
    title: 'Market Tracker | Zenith',
    description: 'Server-rendered market overview with live client-side price refresh widgets.',
    url: `${siteUrl}/market`,
    siteName: 'Zenith',
    type: 'website'
  }
};

function buildMarketJsonLd(players) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: players.map((player, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: `${player.name} market snapshot`,
      url: `${siteUrl}/player/${encodeURIComponent(player.playerId)}`
    }))
  };
}

export default async function MarketPage() {
  const startedAt = Date.now();
  const rollout = getPrerenderRolloutState();
  const featuredIds = await readTopPlayerIds(MARKET_FEATURED_LIMIT);
  const featuredPlayers = await fetchPlayersByIds(featuredIds, { rank: 0 });
  const jsonLd = buildMarketJsonLd(featuredPlayers);
  console.info('[metrics] /market render', {
    elapsedMs: Date.now() - startedAt,
    featuredPlayers: featuredPlayers.length,
    prerenderTier: rollout.tier,
    prerenderLimit: rollout.limit
  });

  return (
    <main style={{ maxWidth: '980px', margin: '0 auto', padding: '28px 16px 40px' }}>
      <h1 style={{ marginBottom: '10px' }}>Market Tracker</h1>
      <p style={{ marginTop: 0, marginBottom: '20px' }}>
        Stable market cards are server-rendered here; each card requests the latest live snapshot in the browser.
      </p>
      <div style={{ display: 'grid', gap: '14px', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
        {featuredPlayers.map((player) => (
          <article key={player.playerId} style={{ border: '1px solid #d5d8dc', borderRadius: '10px', padding: '12px' }}>
            <h2 style={{ margin: '0 0 6px', fontSize: '18px' }}>
              <Link href={`/player/${player.playerId}`} style={{ textDecoration: 'none' }}>
                {player.name}
              </Link>
            </h2>
            <p style={{ margin: '0 0 8px' }}>
              OVR {player.ovr} {player.position ? `• ${player.position}` : ''} {player.isUntradable ? '• Untradable' : ''}
            </p>
            <PlayerPriceWidget playerId={player.playerId} rank={0} />
          </article>
        ))}
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </main>
  );
}
