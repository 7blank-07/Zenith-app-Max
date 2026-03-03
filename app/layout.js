import './globals.css';
import Script from 'next/script';

export const metadata = {
  title: 'Zenith - FC Mobile Database',
  description: 'Zenith FC Mobile tools and database'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" href="/assets/css/style.css" />
        <link rel="stylesheet" href="/assets/css/tool-style.css" />
        <link rel="stylesheet" href="/assets/css/watchlist-styles.css" />
        <link rel="icon" type="image/x-icon" href="/assets/images/favicon.ico" />
        <link rel="icon" type="image/svg+xml" href="/assets/images/zenith_logo_svg.svg" />
        <link rel="icon" type="image/png" sizes="16x16" href="/assets/images/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/assets/images/favicon-32x32.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/assets/images/apple-touch-icon.png" />
      </head>
      <body>
        {children}
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
