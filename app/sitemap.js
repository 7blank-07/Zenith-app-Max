import { buildPlayerPath } from '../src/lib/player-slug.mjs';
import { fetchPlayersByIds, readTopPlayerIds } from '../src/lib/server/top-players.mjs';
import { getBlogSitemapEntries } from '../src/lib/server/blog/seo.mjs';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://zenithfcm.com';
const STATIC_SITEMAP_ID = 0;
const PLAYER_SITEMAP_START_ID = 1;
const PLAYER_SITEMAP_MAX_URLS = 50000;
const PLAYER_FETCH_BATCH_SIZE = 2000;

let allPlayerIdsPromise = null;
let blogEntriesPromise = null;

function toAbsoluteUrl(path) {
  return new URL(path, siteUrl).toString();
}

function splitIntoChunks(items, size) {
  if (!Array.isArray(items) || !items.length) return [];
  const chunks = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

function getStaticEntries(lastModified) {
  return [
    {
      url: toAbsoluteUrl('/'),
      lastModified,
      changeFrequency: 'daily',
      priority: 1.0
    },
    {
      url: toAbsoluteUrl('/players'),
      lastModified,
      changeFrequency: 'daily',
      priority: 0.95
    },
    {
      url: toAbsoluteUrl('/market'),
      lastModified,
      changeFrequency: 'daily',
      priority: 0.95
    },
    {
      url: toAbsoluteUrl('/blogs'),
      lastModified,
      changeFrequency: 'daily',
      priority: 0.9
    },
    {
      url: toAbsoluteUrl('/fc-mobile-redeem-codes'),
      lastModified,
      changeFrequency: 'daily',
      priority: 0.92
    },
    {
      url: toAbsoluteUrl('/fc-mobile-redeem-codes-today'),
      lastModified,
      changeFrequency: 'daily',
      priority: 0.9
    },
    {
      url: toAbsoluteUrl('/in/fc-mobile-redeem-codes'),
      lastModified,
      changeFrequency: 'daily',
      priority: 0.86
    },
    {
      url: toAbsoluteUrl('/id/kode-redeem-fc-mobile'),
      lastModified,
      changeFrequency: 'daily',
      priority: 0.86
    },
    {
      url: toAbsoluteUrl('/my/fc-mobile-redeem-codes'),
      lastModified,
      changeFrequency: 'daily',
      priority: 0.86
    },
    {
      url: toAbsoluteUrl('/vn/code-fc-mobile'),
      lastModified,
      changeFrequency: 'daily',
      priority: 0.86
    },
    {
      url: toAbsoluteUrl('/th/fc-mobile-code'),
      lastModified,
      changeFrequency: 'daily',
      priority: 0.86
    },
    {
      url: toAbsoluteUrl('/ph/ea-fc-mobile-redeem-codes'),
      lastModified,
      changeFrequency: 'daily',
      priority: 0.86
    },
    {
      url: toAbsoluteUrl('/us/ea-redeem-codes'),
      lastModified,
      changeFrequency: 'daily',
      priority: 0.86
    },
    {
      url: toAbsoluteUrl('/ae/kod-fifa'),
      lastModified,
      changeFrequency: 'daily',
      priority: 0.86
    },
    {
      url: toAbsoluteUrl('/watchlist'),
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.85
    },
    {
      url: toAbsoluteUrl('/squad-builder'),
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.85
    },
    {
      url: toAbsoluteUrl('/compare'),
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.85
    },
    {
      url: toAbsoluteUrl('/tools'),
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8
    },
    {
      url: toAbsoluteUrl('/shard-calculator'),
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8
    }
  ];
}

async function readAllPlayerIds() {
  if (!allPlayerIdsPromise) {
    allPlayerIdsPromise = readTopPlayerIds(100000);
  }
  return allPlayerIdsPromise;
}

async function readBlogEntries() {
  if (!blogEntriesPromise) {
    blogEntriesPromise = getBlogSitemapEntries();
  }
  return blogEntriesPromise;
}

async function getPlayerSitemapChunks() {
  const playerIds = await readAllPlayerIds();
  const normalizedIds = Array.isArray(playerIds)
    ? playerIds.map((id) => String(id)).filter(Boolean)
    : [];
  const chunks = splitIntoChunks(normalizedIds, PLAYER_SITEMAP_MAX_URLS);
  return chunks.length ? chunks : [[]];
}

async function fetchPlayersForSitemap(playerIds) {
  const batches = splitIntoChunks(playerIds, PLAYER_FETCH_BATCH_SIZE);
  const players = [];

  for (const batch of batches) {
    if (!batch.length) continue;
    const batchPlayers = await fetchPlayersByIds(batch, { rank: 0 });
    players.push(...batchPlayers);
  }

  return players;
}

async function resolveSitemapLayout() {
  const playerChunks = await getPlayerSitemapChunks();
  const blogSitemapId = PLAYER_SITEMAP_START_ID + playerChunks.length;
  return {
    playerChunks,
    blogSitemapId
  };
}

export async function generateSitemaps() {
  const { playerChunks, blogSitemapId } = await resolveSitemapLayout();
  const sitemapIds = [{ id: STATIC_SITEMAP_ID }];

  playerChunks.forEach((_, index) => {
    sitemapIds.push({ id: PLAYER_SITEMAP_START_ID + index });
  });

  sitemapIds.push({ id: blogSitemapId });
  return sitemapIds;
}

export default async function sitemap({ id }) {
  const sitemapId = Number(id);
  const lastModified = new Date();

  if (!Number.isInteger(sitemapId) || sitemapId < 0) {
    return [];
  }

  if (sitemapId === STATIC_SITEMAP_ID) {
    return getStaticEntries(lastModified);
  }

  const { playerChunks, blogSitemapId } = await resolveSitemapLayout();

  if (sitemapId >= PLAYER_SITEMAP_START_ID && sitemapId < blogSitemapId) {
    const playerChunk = playerChunks[sitemapId - PLAYER_SITEMAP_START_ID] || [];
    if (!playerChunk.length) return [];
    const players = await fetchPlayersForSitemap(playerChunk);

    return players.map((player) => ({
      url: toAbsoluteUrl(buildPlayerPath(player)),
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.8
    }));
  }

  if (sitemapId === blogSitemapId) {
    const blogEntries = await readBlogEntries();

    return blogEntries
      .filter((entry) => entry?.url)
      .map((entry) => ({
        url: toAbsoluteUrl(entry.url),
        lastModified: entry.lastModified || lastModified,
        changeFrequency: 'weekly',
        priority: 0.85
      }));
  }

  return [];
}
