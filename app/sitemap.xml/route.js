import { generateSitemaps } from '../sitemap-logic';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://zenithfcm.com';

export async function GET() {
  try {
    const sitemaps = await generateSitemaps();

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps.map(({ id }) => `  <sitemap>
    <loc>${siteUrl}/sitemap/${id}.xml</loc>
  </sitemap>`).join('\n')}
</sitemapindex>`;

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600'
      }
    });
  } catch (error) {
    console.error('[sitemap-route] Error generating sitemap index:', error);
    return new Response('Error generating sitemap index', { status: 500 });
  }
}
