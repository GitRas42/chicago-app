import { supabase, isOnline } from './supabase';

/**
 * Update player_game_stats and player_matchups after a game completes.
 */
export async function updateCompetitiveStats(gameType, players, winner) {
  if (!isOnline()) return;

  // Update each player's stats
  for (const player of players) {
    const isWinner = !winner.isTie && (
      (winner.winnerId && player.userId === winner.winnerId) ||
      (!winner.winnerId && player.displayName === winner.winnerName)
    );

    // Try to get existing stats
    const lookupKey = player.userId || player.displayName;
    const { data: existing } = await supabase
      .from('player_game_stats')
      .select('*')
      .eq('game_type', gameType)
      .or(
        player.userId
          ? `player_id.eq.${player.userId}`
          : `player_name.eq.${player.displayName},player_id.is.null`
      )
      .maybeSingle();

    if (existing) {
      await supabase
        .from('player_game_stats')
        .update({
          total_wins: existing.total_wins + (isWinner ? 1 : 0),
          total_games: existing.total_games + 1,
          total_points: existing.total_points + (player.finalScore || 0),
          highest_score: Math.max(existing.highest_score || 0, player.finalScore || 0),
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('player_game_stats')
        .insert({
          game_type: gameType,
          player_id: player.userId || null,
          player_name: player.displayName,
          total_wins: isWinner ? 1 : 0,
          total_games: 1,
          total_points: player.finalScore || 0,
          highest_score: player.finalScore || 0,
        });
    }
  }

  // Update matchups for each pair
  for (let i = 0; i < players.length; i++) {
    for (let j = i + 1; j < players.length; j++) {
      const p1 = players[i];
      const p2 = players[j];

      // Consistent ordering: alphabetical by name
      const [first, second] = p1.displayName < p2.displayName ? [p1, p2] : [p2, p1];

      const firstIsWinner = !winner.isTie && (
        (winner.winnerId && first.userId === winner.winnerId) ||
        (!winner.winnerId && first.displayName === winner.winnerName)
      );
      const secondIsWinner = !winner.isTie && (
        (winner.winnerId && second.userId === winner.winnerId) ||
        (!winner.winnerId && second.displayName === winner.winnerName)
      );

      const { data: existing } = await supabase
        .from('player_matchups')
        .select('*')
        .eq('game_type', gameType)
        .eq('player1_name', first.displayName)
        .eq('player2_name', second.displayName)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('player_matchups')
          .update({
            player1_wins: existing.player1_wins + (firstIsWinner ? 1 : 0),
            player2_wins: existing.player2_wins + (secondIsWinner ? 1 : 0),
            total_games: existing.total_games + 1,
            player1_id: first.userId || existing.player1_id,
            player2_id: second.userId || existing.player2_id,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('player_matchups')
          .insert({
            game_type: gameType,
            player1_name: first.displayName,
            player1_id: first.userId || null,
            player2_name: second.displayName,
            player2_id: second.userId || null,
            player1_wins: firstIsWinner ? 1 : 0,
            player2_wins: secondIsWinner ? 1 : 0,
            total_games: 1,
          });
      }
    }
  }
}
