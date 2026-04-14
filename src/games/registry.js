/**
 * Game module registry.
 *
 * Each game is a self-contained module registered here by ID.
 * Components that need to know which games exist import from this file.
 *
 * Usage:
 *   import { registerGame, getGame, listGames } from './registry'
 */

const registry = {}

export function registerGame(id, module) {
  registry[id] = module
}

export function getGame(id) {
  return registry[id] ?? null
}

export function listGames() {
  return Object.values(registry)
}

// ── Registered games ────────────────────────────────────────────────────────

registerGame('chicago', {
  id: 'chicago',
  nameKey: 'chicago',
  descriptionKey: 'rulesIntro',
  minPlayers: 2,
  maxPlayers: 8,
  suit: '♠',
  route: '/game/chicago',
})
