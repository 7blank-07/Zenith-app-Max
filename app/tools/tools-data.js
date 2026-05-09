import { fetchAllPlayerFilterMetadata, fetchPlayersByIds, readTopPlayerIds } from '../../src/lib/server/top-players.mjs';

export const TOOLS_PLAYER_POOL_LIMIT = 350;

export function serializeToolPlayer(player) {
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
    price:
      player.price ??
      player.latestPrice ??
      player.latest_price ??
      player.marketPrice ??
      player.market_price ??
      0,
    attributes: player.attributes || {}
  };
}

export async function getToolsData(isWatchlistTool) {
  let toolPlayers = [];
  let squadFilterOptions = {
    positions: [],
    leagues: [],
    clubs: [],
    nations: [],
    skillMoves: []
  };

  if (!isWatchlistTool) {
    const topIds = await readTopPlayerIds(TOOLS_PLAYER_POOL_LIMIT);
    const [players, filterMetadata] = await Promise.all([
      fetchPlayersByIds(topIds, { rank: 0 }),
      fetchAllPlayerFilterMetadata({ rank: 0 })
    ]);
    toolPlayers = players.map(serializeToolPlayer);
    squadFilterOptions = {
      positions: filterMetadata.positions,
      leagues: filterMetadata.leagues,
      clubs: filterMetadata.clubs,
      nations: filterMetadata.nations,
      skillMoves: filterMetadata.skillMoves
    };
  }

  return { toolPlayers, squadFilterOptions };
}
