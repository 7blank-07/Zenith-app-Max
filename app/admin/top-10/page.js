import AdminShell from '../../components/admin/AdminShell';
import { requireBlogSessionUser } from '../../../src/lib/server/blog/auth.mjs';
import { getBlogDashboardCounts } from '../../../src/lib/server/blog/repository.mjs';
import { getRedeemDashboardCounts } from '../../../src/lib/server/redeem-codes/repository.mjs';
import { getTopTenRankings, getTopTenDashboardCounts } from '../../../src/lib/server/top-10/repository.mjs';
import { fetchPlayersByIds } from '../../../src/lib/server/top-players.mjs';
import TopTenAdminDashboard from './TopTenAdminDashboard.client';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Top 10 Rankings | Zenith Admin',
  robots: {
    index: false,
    follow: false
  }
};

const POSITIONS = ['ST', 'LW', 'RW', 'CAM', 'CDM', 'CM', 'CB', 'LB', 'RB', 'GK'];

export default async function AdminTopTenPage({ searchParams = {} }) {
  const user = await requireBlogSessionUser({ nextPath: '/admin/top-10' });
  const position = String(searchParams.pos || 'ST').trim().toUpperCase();
  const status = String(searchParams.status || 'draft').trim().toLowerCase();

  const [blogCounts, redeemCounts, topTenCounts, dbRankings] = await Promise.all([
    getBlogDashboardCounts(),
    getRedeemDashboardCounts(),
    getTopTenDashboardCounts(),
    getTopTenRankings(position, status)
  ]);

  // Fetch player details for the current rankings
  const playerIds = dbRankings.map(r => r.playerId);
  const players = playerIds.length > 0 ? await fetchPlayersByIds(playerIds) : [];

  // Merge player details with ranking data
  const initialRankings = dbRankings.map(r => {
    const player = players.find(p => p.playerId === r.playerId);
    return {
      ...r,
      player: player || { playerId: r.playerId, name: 'Unknown Player', ovr: '??' }
    };
  });

  // Aggregate counts for the sidebar
  const totalTopTen = topTenCounts.filter(c => c.status === 'live').length;
  const counts = {
    ...blogCounts,
    ...redeemCounts,
    topTenTotal: totalTopTen
  };

  return (
    <AdminShell
      title="Top 10 Rankings"
      description="Manage the premium position-based player rankings. Updates here reflect instantly on the public Top 10 page."
      currentPath="/admin/top-10"
      user={user}
      counts={counts}
    >
      <TopTenAdminDashboard 
        positions={POSITIONS}
        initialPosition={position}
        initialStatus={status}
        initialRankings={initialRankings}
        topTenCounts={topTenCounts}
      />
    </AdminShell>
  );
}
