export const KEYS = {
  players: 'cg-players-v3',
  games: 'cg-games-v3',
  settings: 'cg-settings-v3',
  active: 'cg-active-v3',
};

export function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
