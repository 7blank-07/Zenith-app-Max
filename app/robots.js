const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://zenithfcm.com';

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/internal-api/',
          '/legacy/'
        ]
      }
    ],
    sitemap: `${siteUrl}/sitemap.xml`
    // removed host — not a valid Google directive
  };
}
