import './globals.css';
import Script from 'next/script';
import { Inter } from 'next/font/google';
import { Suspense } from 'react';
import ImageCacheServiceWorker from './components/ImageCacheServiceWorker.client';
import HtmlLanguageController from './components/HtmlLanguageController.client';
import RouteProgress from './components/RouteProgress.client';
import WebVitalsReporter from './components/WebVitalsReporter.client';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://zenithfcm.com';
const colorSchemeBootstrapScript = `(function(){try{var key='zenith-color-scheme';var saved=window.localStorage.getItem(key);var theme=saved==='light'?'light':'dark';var root=document.documentElement;root.dataset.colorScheme=theme;root.style.colorScheme=theme;}catch(error){document.documentElement.dataset.colorScheme='dark';document.documentElement.style.colorScheme='dark';}})();`;

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
    <html lang="en" className={inter.variable} data-color-scheme="dark" style={{ colorScheme: 'dark' }} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: colorSchemeBootstrapScript
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var p=window.location.pathname||'';var isArabic=(p==='/ae/kod-fifa'||p.indexOf('/ae/kod-fifa/')===0);if(isArabic){var root=document.documentElement;root.lang='ar';root.dir='rtl';}})();`
          }}
        />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="preconnect" href="https://images.zenithfcm.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://pagead2.googlesyndication.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href="/assets/css/style.css" />
        <link rel="icon" type="image/png" href="/assets/images/zenith_logo_main.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/assets/images/zenith_logo_main.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/assets/images/zenith_logo_main.png" />
        <link rel="apple-touch-icon" href="/assets/images/zenith_logo_main.png" />
      </head>
      <body>
        <Suspense fallback={null}>
          <RouteProgress />
        </Suspense>
        <HtmlLanguageController />
        {children}
        <ImageCacheServiceWorker />
        <WebVitalsReporter />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-BN8W9Y5DC8"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-BN8W9Y5DC8');
          `}
        </Script>
        <Script
          id="adsbygoogle"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4474200951186936"
          strategy="lazyOnload"
          crossOrigin="anonymous"
        />
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
