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

function uniqueSorted(values) {
  return [...new Set(values.map((value) => String(value || '').trim()).filter(Boolean))].sort((left, right) =>
    left.localeCompare(right)
  );
}

function inferSquadFilterOptions(players) {
  const positions = [];
  const skillMoves = new Set();

  players.forEach((player) => {
    if (player.position) positions.push(String(player.position).toUpperCase());
    String(player.alternatePosition || '')
      .split(/[|,/]/)
      .map((position) => position.trim().toUpperCase())
      .filter((position) => position && position !== '0')
      .forEach((position) => positions.push(position));

    const skillMoveValue = Number(player.skillMoves);
    if (Number.isFinite(skillMoveValue) && skillMoveValue > 0) skillMoves.add(skillMoveValue);
  });

  return {
    positions: uniqueSorted(positions),
    leagues: uniqueSorted(players.map((player) => player.league)),
    clubs: uniqueSorted(players.map((player) => player.club)),
    nations: uniqueSorted(players.map((player) => player.nation)),
    skillMoves: [...skillMoves].sort((left, right) => right - left)
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
    const [playersResult, filterMetadataResult] = await Promise.allSettled([
      fetchPlayersByIds(topIds, { rank: 0 }),
      fetchAllPlayerFilterMetadata({ rank: 0 })
    ]);

    if (playersResult.status === 'fulfilled') {
      toolPlayers = playersResult.value.map(serializeToolPlayer);
    } else {
      console.warn('[tools-data] Failed to fetch initial tool players:', playersResult.reason);
    }

    if (filterMetadataResult.status === 'fulfilled') {
      const filterMetadata = filterMetadataResult.value;
      squadFilterOptions = {
        positions: filterMetadata.positions,
        leagues: filterMetadata.leagues,
        clubs: filterMetadata.clubs,
        nations: filterMetadata.nations,
        skillMoves: filterMetadata.skillMoves
      };
    } else {
      console.warn('[tools-data] Failed to fetch full filter metadata; using player pool fallback:', filterMetadataResult.reason);
      squadFilterOptions = inferSquadFilterOptions(toolPlayers);
    }
  }

  return { toolPlayers, squadFilterOptions };
}
