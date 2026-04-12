import { supabase, isOnline } from './supabase';

/**
 * Fetch leaderboard sorted by a given stat.
 */
export async function getLeaderboard(gameType, sortBy = 'total_wins', minGames = 0, limit = 50) {
  if (!isOnline()) return [];

  if (sortBy === 'win_percentage') {
    const { data, error } = await supabase.rpc('get_leaderboard_by_win_pct', {
      p_game_type: gameType,
      p_min_games: Math.max(minGames, 3),
      p_limit: limit,
    });
    if (error) { if (error.code !== '42883') console.warn('Leaderboard error:', error.message); return []; }
    return data || [];
  }

  if (sortBy === 'avg_score') {
    const { data, error } = await supabase.rpc('get_leaderboard_by_avg_score', {
      p_game_type: gameType,
      p_min_games: Math.max(minGames, 3),
      p_limit: limit,
    });
    if (error) { if (error.code !== '42883') console.warn('Leaderboard error:', error.message); return []; }
    return data || [];
  }

  const { data, error } = await supabase.rpc('get_leaderboard', {
    p_game_type: gameType,
    p_sort_by: sortBy,
    p_min_games: minGames,
    p_limit: limit,
  });
  if (error) { if (error.code !== '42883') console.warn('Leaderboard error:', error.message); return []; }
  return data || [];
}

/**
 * Fetch head-to-head record between two players.
 */
export async function getHeadToHead(gameType, player1Name, player2Name) {
  if (!isOnline()) return null;

  const [first, second] = player1Name < player2Name
    ? [player1Name, player2Name]
    : [player2Name, player1Name];

  const { data, error } = await supabase
    .from('player_matchups')
    .select('*')
    .eq('game_type', gameType)
    .eq('player1_name', first)
    .eq('player2_name', second)
    .maybeSingle();

  if (error) { console.error('H2H error:', error); return null; }
  if (!data) return null;

  // Normalize: return wins from perspective of player1Name (the one passed in first)
  if (player1Name === data.player1_name) {
    return {
      ...data,
      myWins: data.player1_wins,
      theirWins: data.player2_wins,
    };
  } else {
    return {
      ...data,
      myWins: data.player2_wins,
      theirWins: data.player1_wins,
    };
  }
}

/**
 * Get all matchups for a given player.
 */
export async function getPlayerMatchups(gameType, playerName) {
  if (!isOnline()) return [];

  const { data, error } = await supabase
    .from('player_matchups')
    .select('*')
    .eq('game_type', gameType)
    .or(`player1_name.eq.${playerName},player2_name.eq.${playerName}`)
    .order('total_games', { ascending: false });

  if (error) { console.error('Matchups error:', error); return []; }

  return (data || []).map((m) => {
    if (m.player1_name === playerName) {
      return {
        opponent: m.player2_name,
        myWins: m.player1_wins,
        theirWins: m.player2_wins,
        totalGames: m.total_games,
      };
    } else {
      return {
        opponent: m.player1_name,
        myWins: m.player2_wins,
        theirWins: m.player1_wins,
        totalGames: m.total_games,
      };
    }
  });
}
