import nextDynamic from 'next/dynamic';
import { permanentRedirect } from 'next/navigation';
import SiteChrome from '../components/SiteChrome';
import { PLAYER_PAGE_REVALIDATE_SECONDS } from '../../src/lib/server/player-seo-contract.mjs';
import { getToolsData } from './tools-data';

const ToolsInteractions = nextDynamic(() => import('../components/ToolsInteractions.client'));

export const revalidate = PLAYER_PAGE_REVALIDATE_SECONDS;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://zenithfcm.com';

export const metadata = {
  title: 'FC Mobile Tools Hub | ZenithFCM',
  description: 'Access the best FC Mobile tools: Squad Builder, Player Comparison tool, and Watchlist. Optimize your team today.',
  alternates: { canonical: '/tools' },
  openGraph: {
    title: 'FC Mobile Tools Hub | ZenithFCM',
    description: 'Access the best FC Mobile tools: Squad Builder, Player Comparison tool, and Watchlist. Optimize your team today.',
    url: `${siteUrl}/tools`,
    siteName: 'ZenithFCM',
    type: 'website'
  }
};

function normalizeToolParam(value) {
  const raw = Array.isArray(value) ? value[0] : value;
  return String(raw || '').toLowerCase().trim();
}

export default async function ToolsHubPage({ searchParams }) {
  const tool = normalizeToolParam(searchParams?.tool);

  if (tool === 'squadbuilder' || tool === 'squad-builder') {
    permanentRedirect('/tools/squad-builder');
  }
  if (tool === 'compare') {
    permanentRedirect('/tools/player-compare');
  }
  if (tool === 'watchlist') {
    permanentRedirect('/tools/watchlist');
  }

  const { toolPlayers, squadFilterOptions } = await getToolsData(false);

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
      }
    ]
  };

  return (
    <SiteChrome activeView="tools">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <main className="main-content">
        <ToolsInteractions players={toolPlayers} initialTool="none" filterOptions={squadFilterOptions} />
      </main>
    </SiteChrome>
  );
}
