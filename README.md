# Chicago

A multiplayer card game platform built around the Swedish card game Chicago.

**Stack:** React 19 + Vite · Tailwind CSS v4 · Supabase (PostgreSQL + Auth) · Deployed on Vercel

---

## Getting started

### 1. Clone and install

```bash
git clone https://github.com/GitRas42/chicago-app.git
cd chicago-app
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in your Supabase project credentials:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Both values are in your Supabase project under **Settings → API**.

### 3. Run locally

```bash
npm run dev
```

---

## Project structure

```
src/
  App.jsx                   # Router + top-level layout
  main.jsx                  # React entry point
  index.css                 # Global styles — imports Tailwind + design system
  styles/
    design-system.css       # Saloon design tokens (@theme)
  services/
    supabase.js             # Supabase client (singleton)
  features/
    auth/                   # AuthContext, Login, Signup, ProtectedRoute
    leaderboard/            # Leaderboard feature (planned)
    players/                # Player management (planned)
    gameSession/            # Active game session (planned)
    houseRules/             # House rules configuration (planned)
  games/
    registry.js             # Game module registry
    chicago/                # Chicago game logic (planned)
  i18n/
    sv.json                 # Swedish translations
    en.json                 # English translations
```

---

## Chicago house rules

| Rule | Behaviour |
|---|---|
| **Köpstopp** | Triggered when any player hits 46 pts mid-round. That player resets to 0; no further buying for the rest of the game. |
| **Exchange rounds** | 3 rounds for 2–3 players · 2 rounds for 4+ players |
| **Chicago declaration** | Floating action — available at any time, not phase-locked |
| **Royal Straight Flush** | Instant win, ends the game immediately |
| **Win condition** | Checked at end of complete round only. Highest score wins. Ties = no winner. |
| **Undo** | Single-step undo for the last score entry |

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |
