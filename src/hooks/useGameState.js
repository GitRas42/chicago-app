import { useMemo } from 'react';
import { mkSteps } from '../games/chicago/config';
import { determineWinner } from '../services/winLogic';
import { saveGameSession } from '../services/gameHistory';

export function useGameState({ active: g, setActive: setA, games, setGames: setG, t, userId }) {
  const steps = useMemo(() => g ? mkSteps(g.exchangeRounds, t) : [], [g?.exchangeRounds, t]);
  const cur = g ? steps[g.currentStep] : undefined;
  const done = g ? g.currentStep >= steps.length : false;
  const sorted = g ? [...g.players].sort((a, b) => g.scores[b] - g.scores[a]) : [];
  const chiActive = g ? !!g.chicagoPlayer : false;

  const snap = (game) => {
    const ss = game.snapshots || [];
    return [...ss, {
      scores: { ...game.scores },
      currentStep: game.currentStep,
      roundEvents: [...game.roundEvents],
      chicagoPlayer: game.chicagoPlayer,
    }];
  };

  const undo = () => {
    const ss = g.snapshots || [];
    if (!ss.length) return;
    const prev = ss[ss.length - 1];
    setA({
      ...g,
      scores: prev.scores,
      currentStep: prev.currentStep,
      roundEvents: prev.roundEvents,
      chicagoPlayer: prev.chicagoPlayer,
      snapshots: ss.slice(0, -1),
    });
    navigator.vibrate?.(10);
  };

  const scorePlayer = (player, points, hand, stepKey) => {
    const ns = { ...g.scores };
    ns[player] = Math.max(0, (ns[player] || 0) + points);
    const ev = { player, hand, points, step: stepKey };
    setA({
      ...g,
      scores: ns,
      roundEvents: [...g.roundEvents, ev],
      currentStep: g.currentStep + 1,
      snapshots: snap(g),
    });
    navigator.vibrate?.(10);
  };

  const skipStep = () => {
    const ev = { player: null, hand: "none", points: 0, step: cur?.key };
    setA({
      ...g,
      roundEvents: [...g.roundEvents, ev],
      currentStep: g.currentStep + 1,
      snapshots: snap(g),
    });
    navigator.vibrate?.(10);
  };

  const declareChicago = (player) => {
    const ss = snap(g);
    const ns = { ...g.scores };
    g.roundEvents.forEach((ev) => {
      if (ev.player && ev.points) {
        ns[ev.player] = Math.max(0, (ns[ev.player] || 0) - ev.points);
      }
    });
    setA({ ...g, scores: ns, chicagoPlayer: player, roundEvents: [], snapshots: ss });
    navigator.vibrate?.(10);
  };

  const resolveChicago = (ok) => {
    const ss = snap(g);
    const pts = ok ? 15 : -15;
    const p = g.chicagoPlayer;
    const ns = { ...g.scores };
    ns[p] = Math.max(0, ns[p] + pts);
    const ev = { player: p, hand: ok ? "chicagoSuccessLabel" : "chicagoFailLabel", points: pts, step: "chi" };
    setA({
      ...g,
      scores: ns,
      roundEvents: [ev],
      currentStep: steps.length,
      chicagoPlayer: null,
      snapshots: ss,
    });
    navigator.vibrate?.(10);
  };

  // Save completed game to both localStorage and Supabase
  const saveCompletedGame = async (finishedGame) => {
    // Always save to localStorage
    setG([...games, finishedGame]);
    setA(null);

    // Also save to Supabase if logged in
    if (userId) {
      const players = finishedGame.players.map((p) => ({
        displayName: p,
        finalScore: typeof finishedGame.finalScores[p] === 'number' ? finishedGame.finalScores[p] : 0,
        userId: finishedGame.playerMeta?.[p]?.userId || null,
      }));

      try {
        await saveGameSession({
          ownerId: userId,
          gameType: finishedGame.gameType,
          players,
          allRounds: finishedGame.allRounds,
          startedAt: finishedGame.startedAt,
        });
      } catch (err) {
        console.error('Failed to save to Supabase:', err);
      }
    }
  };

  const royalWin = (player) => {
    const ev = { player, hand: "royalFlush", points: 0, step: cur?.key, instantWin: true };
    const fin = {
      id: g.id,
      gameType: "chicago",
      players: g.players,
      winner: player,
      finalScores: Object.fromEntries(
        g.players.map((p) => [p, p === player ? `${g.scores[p]} + RSF` : g.scores[p]])
      ),
      allRounds: [...g.allRounds, { roundNumber: g.currentRound, events: [...g.roundEvents, ev] }],
      finishedAt: new Date().toISOString(),
      startedAt: g.startedAt,
      playerMeta: g.playerMeta,
    };
    saveCompletedGame(fin);
    navigator.vibrate?.(10);
    return { winner: player, finalScores: fin.finalScores };
  };

  const finishRound = () => {
    const allR = [...g.allRounds, { roundNumber: g.currentRound, events: g.roundEvents }];
    const o50 = g.players.filter((p) => g.scores[p] >= 50);
    if (o50.length > 0) {
      const mx = Math.max(...o50.map((p) => g.scores[p]));
      const tops = o50.filter((p) => g.scores[p] === mx);
      if (tops.length === 1) {
        const fin = {
          id: g.id,
          gameType: "chicago",
          players: g.players,
          winner: tops[0],
          finalScores: { ...g.scores },
          allRounds: allR,
          finishedAt: new Date().toISOString(),
          startedAt: g.startedAt,
          playerMeta: g.playerMeta,
        };
        saveCompletedGame(fin);
        navigator.vibrate?.(10);
        return { winner: tops[0], finalScores: fin.finalScores };
      }
    }
    setA({
      ...g,
      currentRound: g.currentRound + 1,
      currentStep: 0,
      chicagoPlayer: null,
      roundEvents: [],
      allRounds: allR,
      snapshots: [],
    });
    navigator.vibrate?.(10);
    return null;
  };

  const editScore = (p, v) => {
    setA({ ...g, scores: { ...g.scores, [p]: Math.max(0, v) } });
  };

  const kopReset = (p) => {
    setA({ ...g, scores: { ...g.scores, [p]: 0 } });
    navigator.vibrate?.(10);
  };

  return {
    g, steps, cur, done, sorted, chiActive,
    snap, undo, scorePlayer, skipStep,
    declareChicago, resolveChicago, royalWin, finishRound,
    editScore, kopReset,
  };
}
