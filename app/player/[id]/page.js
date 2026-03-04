import { notFound } from 'next/navigation';
import PlayerPriceWidget from '../../components/PlayerPriceWidget.client';
import { PLAYER_PAGE_REVALIDATE_SECONDS, resolvePlayerSeoContract } from '../../../src/lib/server/player-seo-contract.mjs';
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
    contract = await loadPlayerSeoContract(params.id, rank);
  } catch (error) {
    if (isNotFoundError(error)) {
      notFound();
    }
    throw error;
  }

  const { record, metadata } = contract;
  console.info('[metrics] /player render', {
    playerId: record.playerId,
    rank,
    elapsedMs: Date.now() - startedAt
  });

  return (
    <main style={{ maxWidth: '900px', margin: '0 auto', padding: '28px 16px 40px' }}>
      <h1 style={{ marginBottom: '10px' }}>{record.name}</h1>
      <p style={{ marginTop: 0, marginBottom: '14px' }}>
        OVR {record.ovr} {record.position ? `• ${record.position}` : ''} {record.isUntradable ? '• Untradable' : ''}
      </p>
      {record.image && (
        <img
          src={record.image}
          alt={`${record.name} card image`}
          style={{ width: '220px', maxWidth: '100%', borderRadius: '10px', marginBottom: '18px' }}
        />
      )}
      <p style={{ lineHeight: 1.6, marginBottom: '16px' }}>
        {record.summary || `${record.name} profile and latest market context from Zenith.`}
      </p>
      <PlayerPriceWidget playerId={record.playerId} rank={rank} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(metadata.jsonLd) }} />
    </main>
  );
}
