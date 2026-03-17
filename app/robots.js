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
    sitemap: [
      `${siteUrl}/sitemap/0.xml`,
      `${siteUrl}/sitemap/1.xml`,
      `${siteUrl}/sitemap/2.xml`
    ]
    // removed host — not a valid Google directive
  };
}
