import { supabase, isOnline } from './supabase';

/**
 * Get names that the current user can claim (unregistered players matching their display name).
 */
export async function getClaimableNames(userId) {
  if (!isOnline()) return [];

  const { data, error } = await supabase.rpc('get_claimable_names', {
    p_user_id: userId,
  });

  if (error) { console.error('Claim lookup error:', error); return []; }
  return data || [];
}

/**
 * Claim a player name — link all historical games to this user account.
 */
export async function claimPlayerName(userId, playerName, gameType = null) {
  if (!isOnline()) return 0;

  const { data, error } = await supabase.rpc('claim_player_name', {
    p_user_id: userId,
    p_player_name: playerName,
    p_game_type: gameType,
  });

  if (error) { console.error('Claim error:', error); throw error; }
  return data || 0;
}

/**
 * Get claim history for a user.
 */
export async function getClaimHistory(userId) {
  if (!isOnline()) return [];

  const { data, error } = await supabase
    .from('player_claims')
    .select('*')
    .eq('user_id', userId)
    .order('claimed_at', { ascending: false });

  if (error) { console.error('Claim history error:', error); return []; }
  return data || [];
}
