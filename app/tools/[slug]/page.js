import nextDynamic from 'next/dynamic';
import { notFound } from 'next/navigation';
import SiteChrome from '../../components/SiteChrome';
import WatchlistView from '../../components/WatchlistView';
import { PLAYER_PAGE_REVALIDATE_SECONDS } from '../../../src/lib/server/player-seo-contract.mjs';
import { getToolsData } from '../tools-data';

const ToolsInteractions = nextDynamic(() => import('../../components/ToolsInteractions.client'), {
  loading: () => (
    <div className="tool-loading-placeholder">
      <div className="loading-spinner"></div>
      <p>Loading Tool...</p>
    </div>
  ),
  ssr: true
});

export const revalidate = PLAYER_PAGE_REVALIDATE_SECONDS;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://zenithfcm.com';

const TOOL_CONFIG = {
  'squad-builder': {
    id: 'squadbuilder',
    title: 'FC Mobile Squad Builder | ZenithFCM',
    description: 'Build your ultimate FC Mobile squad with OVR optimization, chemistry planning, and team testing tools.',
    canonical: '/tools/squad-builder'
  },
  'player-compare': {
    id: 'compare',
    title: 'FC Mobile Player Compare | ZenithFCM',
    description: 'Compare FC Mobile player stats side-by-side. Analyze pace, shooting, passing, and physical attributes to find the best players for your team.',
    canonical: '/tools/player-compare'
  },
  'watchlist': {
    id: 'watchlist',
    title: 'FC Mobile Watchlist | ZenithFCM',
    description: 'Track your favorite FC Mobile players and monitor their market prices in real-time with the Zenith Watchlist tool.',
    canonical: '/tools/watchlist'
  }
};

export async function generateMetadata({ params }) {
  const { slug } = params;
  const config = TOOL_CONFIG[slug];

  if (!config) return {};

  return {
    title: config.title,
    description: config.description,
    alternates: { canonical: config.canonical },
    openGraph: {
      title: config.title,
      description: config.description,
      url: `${siteUrl}${config.canonical}`,
      siteName: 'ZenithFCM',
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title: config.title,
      description: config.description
    }
  };
}

export async function generateStaticParams() {
  return Object.keys(TOOL_CONFIG).map((slug) => ({ slug }));
}

export default async function ToolSlugPage({ params }) {
  const { slug } = params;
  const config = TOOL_CONFIG[slug];

  if (!config) {
    notFound();
  }

  const initialTool = config.id;
  const isWatchlistTool = initialTool === 'watchlist';
  const { toolPlayers, squadFilterOptions } = await getToolsData(isWatchlistTool);

  const mainContentClassName = `main-content${initialTool === 'squadbuilder' ? ' main-content--squadbuilder' : ''}${
    initialTool === 'compare' ? ' main-content--compare' : ''
  }`;

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Home',
        'item': siteUrl
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': 'Tools',
        'item': `${siteUrl}/tools`
      },
      {
        '@type': 'ListItem',
        'position': 3,
        'name': config.title.split('|')[0].trim(),
        'item': `${siteUrl}${config.canonical}`
      }
    ]
  };

  return (
    <SiteChrome activeView="tools">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <main className={mainContentClassName}>
        {isWatchlistTool ? (
          <WatchlistView />
        ) : (
          <ToolsInteractions players={toolPlayers} initialTool={initialTool} filterOptions={squadFilterOptions} />
        )}
      </main>
    </SiteChrome>
  );
}
