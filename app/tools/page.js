import ToolsInteractions from '../components/ToolsInteractions.client';
import SiteChrome from '../components/SiteChrome';
import { PLAYER_PAGE_REVALIDATE_SECONDS } from '../../src/lib/server/player-seo-contract.mjs';
import { fetchPlayersByIds, readTopPlayerIds } from '../../src/lib/server/top-players.mjs';

export const revalidate = PLAYER_PAGE_REVALIDATE_SECONDS;

const TOOLS_PLAYER_POOL_LIMIT = 350;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://zenithfcm.com';

export const metadata = {
  title: 'Tools | Zenith',
  description: 'Squad Builder, Compare Players, and Profit Calculator tools for Zenith.',
  alternates: { canonical: '/tools' },
  openGraph: {
    title: 'Tools | Zenith',
    description: 'Squad Builder, Compare Players, and Profit Calculator tools for Zenith.',
    url: `${siteUrl}/tools`,
    siteName: 'Zenith',
    type: 'website'
  }
};

function normalizeToolParam(value) {
  const raw = Array.isArray(value) ? value[0] : value;
  return String(raw || '').toLowerCase().trim();
}

function serializeToolPlayer(player) {
  return {
    playerId: player.playerId,
    name: player.name || 'Unknown',
    ovr: Number(player.ovr) || 0,
    position: player.position || '',
    alternatePosition: player.alternatePosition || '',
    nation: player.nation || '',
    club: player.club || '',
    league: player.league || '',
    cardBackground: player.cardBackground || '',
    playerImage: player.playerImage || player.image || '',
    nationFlag: player.nationFlag || '',
    clubFlag: player.clubFlag || '',
    leagueImage: player.leagueImage || '',
    colorRating: player.colorRating || '#FFB86B',
    colorPosition: player.colorPosition || '#FFFFFF',
    colorName: player.colorName || '#FFFFFF',
    skillMoves: Number(player.skillMoves || player.skill_moves || player.skillmoves || 0) || 0,
    isUntradable: !!player.isUntradable,
    attributes: player.attributes || {}
  };
}

export default async function ToolsPage({ searchParams }) {
  const startedAt = Date.now();
  const topIds = await readTopPlayerIds(TOOLS_PLAYER_POOL_LIMIT);
  const players = await fetchPlayersByIds(topIds, { rank: 0 });
  const initialTool = normalizeToolParam(searchParams?.tool);
  const toolPlayers = players.map(serializeToolPlayer);

  console.info('[metrics] /tools render', {
    elapsedMs: Date.now() - startedAt,
    playerPool: toolPlayers.length,
    initialTool
  });

  return (
    <SiteChrome activeView="tools">
      <main className="main-content">
        <ToolsInteractions players={toolPlayers} initialTool={initialTool} />
      </main>
    </SiteChrome>
  );
}
