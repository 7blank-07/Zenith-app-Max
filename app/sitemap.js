import { buildPlayerPath } from '../src/lib/player-slug.mjs';
import { fetchPlayersByIds, readTopPlayerIds } from '../src/lib/server/top-players.mjs';
import { getBlogSitemapEntries } from '../src/lib/server/blog/seo.mjs';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://zenithfcm.com';

function toAbsoluteUrl(path) {
  return new URL(path, siteUrl).toString();
}

export default async function sitemap() {
  const lastModified = new Date();
  const [topPlayerIds, blogEntries] = await Promise.all([
    readTopPlayerIds(10000),
    getBlogSitemapEntries()
  ]);
  const players = await fetchPlayersByIds(topPlayerIds, { rank: 0 });

  const staticEntries = [
    {
      url: toAbsoluteUrl('/'),
      lastModified,
      changeFrequency: 'daily',
      priority: 1
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
      priority: 0.9
    }
  ];

  const playerEntries = players.map((player) => ({
    url: toAbsoluteUrl(buildPlayerPath(player)),
    lastModified,
    changeFrequency: 'weekly',
    priority: 0.8
  }));

  return [...staticEntries, ...playerEntries, ...blogEntries];
}
