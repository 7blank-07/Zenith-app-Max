import './globals.css';
import Script from 'next/script';
import { Inter } from 'next/font/google';
import { Suspense } from 'react';
import ImageCacheServiceWorker from './components/ImageCacheServiceWorker.client';
import RouteProgress from './components/RouteProgress.client';
import WebVitalsReporter from './components/WebVitalsReporter.client';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://zenithfcm.com';

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Zenith - FC Mobile Database',
  description: 'Zenith FC Mobile tools and database',
  alternates: {
    canonical: '/'
  },
  openGraph: {
    title: 'Zenith - FC Mobile Database',
    description: 'Zenith FC Mobile tools and database',
    url: siteUrl,
    siteName: 'Zenith',
    type: 'website'
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-BN8W9Y5DC8"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());

gtag('config', 'G-BN8W9Y5DC8');`
          }}
        />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" href="/assets/css/style.css" />
        <link rel="stylesheet" href="/assets/css/tool-style.css" />
        <link rel="stylesheet" href="/assets/css/watchlist-styles.css" />
        <link rel="icon" type="image/png" href="/assets/images/zenith_logo_main.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/assets/images/zenith_logo_main.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/assets/images/zenith_logo_main.png" />
        <link rel="apple-touch-icon" href="/assets/images/zenith_logo_main.png" />
      </head>
      <body>
        <Suspense fallback={null}>
          <RouteProgress />
        </Suspense>
        {children}
        <ImageCacheServiceWorker />
        <WebVitalsReporter />
        <Script
          id="simple-analytics"
          src="https://scripts.simpleanalyticscdn.com/latest.js"
          strategy="afterInteractive"
          data-collect-dnt="true"
        />
      </body>
    </html>
  );
}
