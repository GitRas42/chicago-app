/**
 * Win logic system — determines winner per game type.
 * Each game exports a determineWinner function.
 */

const GAME_WIN_LOGIC = {
  chicago: {
    /**
     * Chicago: highest finalScore wins. Tie = no winner.
     * @param {Array<{userId?: string, displayName: string, finalScore: number}>} players
     * @returns {{ winnerId?: string, winnerName?: string, isTie: boolean }}
     */
    determineWinner(players) {
      if (!players || players.length === 0) return { isTie: true };

      const sorted = [...players].sort((a, b) => b.finalScore - a.finalScore);
      const highest = sorted[0].finalScore;
      const tied = sorted.filter((s) => s.finalScore === highest);

      if (tied.length > 1) {
        return { isTie: true };
      }

      return {
        winnerId: sorted[0].userId || null,
        winnerName: sorted[0].displayName,
        isTie: false,
      };
    },
  },
};

/**
 * Determine winner for a game.
 * @param {Array} players - Array of player objects with finalScore
 * @param {string} gameType - e.g. 'chicago'
 */
export function determineWinner(players, gameType) {
  const logic = GAME_WIN_LOGIC[gameType];
  if (!logic) {
    console.warn(`No win logic for game type: ${gameType}`);
    return { isTie: true };
  }
  return logic.determineWinner(players);
}

export function calculateWinPercentage(wins, games) {
  if (games === 0) return 0;
  return Math.round((wins / games) * 1000) / 10;
}

export function formatWinRecord(wins, losses) {
  return `${wins}-${losses}`;
}
