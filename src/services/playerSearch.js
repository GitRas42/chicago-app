import { supabase, isOnline } from './supabase';

/**
 * Search for players — both registered users and previously seen unregistered names.
 */
export async function searchAllPlayers(query) {
  if (!isOnline() || !query || query.length < 1) {
    return { registered: [], unregistered: [] };
  }

  const [regResult, unregResult] = await Promise.all([
    supabase
      .from('users')
      .select('id, display_name')
      .ilike('display_name', `%${query}%`)
      .limit(10),
    supabase
      .from('player_game_stats')
      .select('player_name')
      .is('player_id', null)
      .ilike('player_name', `%${query}%`)
      .limit(10),
  ]);

  const registered = (regResult.data || []).map((u) => ({
    id: u.id,
    displayName: u.display_name,
    isRegistered: true,
  }));

  // Deduplicate unregistered names and filter out those who match registered users
  const regNames = new Set(registered.map((r) => r.displayName.toLowerCase()));
  const unregisteredMap = new Map();
  for (const row of (unregResult.data || [])) {
    if (!regNames.has(row.player_name.toLowerCase())) {
      unregisteredMap.set(row.player_name, {
        displayName: row.player_name,
        isRegistered: false,
      });
    }
  }

  return {
    registered,
    unregistered: Array.from(unregisteredMap.values()),
  };
}
