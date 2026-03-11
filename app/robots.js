const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://zenithfcm.com';

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/admin/*']
      }
    ],
    sitemap: `${siteUrl.replace(/\/+$/g, '')}/sitemap.xml`,
    host: siteUrl
  };
}
