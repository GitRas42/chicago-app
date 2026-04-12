import { supabase, isOnline } from './supabase';
import { determineWinner } from './winLogic';
import { updateCompetitiveStats } from './competitiveStats';

/**
 * Save a completed game session to Supabase and update competitive stats.
 * Falls back gracefully if offline.
 */
export async function saveGameSession({ ownerId, gameType, players, allRounds, startedAt, winnerOverride }) {
  // Build player_data in the expected format
  const playerData = players.map((p) => ({
    userId: p.userId || null,
    displayName: p.displayName,
    finalScore: p.finalScore,
    isRegistered: !!p.userId,
  }));

  // Determine winner
  const winner = winnerOverride || determineWinner(playerData, gameType);

  if (!isOnline() || !ownerId) {
    // Return the winner info even in offline mode
    return { winner, saved: false };
  }

  // Save to game_sessions
  const { data: session, error } = await supabase
    .from('game_sessions')
    .insert({
      owner_id: ownerId,
      game_type: gameType,
      player_data: playerData,
      winner_id: winner.winnerId || null,
      winner_name: winner.winnerName || null,
      is_tie: winner.isTie,
      started_at: startedAt,
      completed_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Save game error:', error);
    return { winner, saved: false, error };
  }

  // Update competitive stats (non-blocking)
  updateCompetitiveStats(gameType, playerData, winner).catch((err) =>
    console.error('Stats update error:', err)
  );

  return { winner, saved: true, session };
}

/**
 * Fetch game history from Supabase.
 */
export async function fetchGameHistory(gameType = null, limit = 50) {
  if (!isOnline()) return [];

  let query = supabase
    .from('game_sessions')
    .select('*')
    .order('completed_at', { ascending: false })
    .limit(limit);

  if (gameType) {
    query = query.eq('game_type', gameType);
  }

  const { data, error } = await query;
  if (error) { console.error('Fetch history error:', error); return []; }
  return data || [];
}

/**
 * Fetch games involving a specific player.
 */
export async function fetchPlayerGames(playerName, gameType = null, limit = 50) {
  if (!isOnline()) return [];

  let query = supabase
    .from('game_sessions')
    .select('*')
    .contains('player_data', [{ displayName: playerName }])
    .order('completed_at', { ascending: false })
    .limit(limit);

  if (gameType) {
    query = query.eq('game_type', gameType);
  }

  const { data, error } = await query;
  if (error) { console.error('Fetch player games error:', error); return []; }
  return data || [];
}
