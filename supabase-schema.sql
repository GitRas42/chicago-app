-- ============================================================
-- Chicago Competitive Card Game Platform — Full Schema
-- Run this in Supabase SQL Editor (in order)
-- ============================================================

-- 1. USERS (profiles linked to auth.users)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  preferences jsonb DEFAULT '{"language": "sv", "theme": "light"}'::jsonb,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read all profiles" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. GAME_SESSIONS (modified to track winner)
CREATE TABLE IF NOT EXISTS game_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  game_type text NOT NULL,
  player_data jsonb NOT NULL,
  winner_id uuid,
  winner_name text,
  is_tie boolean DEFAULT false,
  house_rules jsonb DEFAULT '{}'::jsonb,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_game_sessions_owner_id ON game_sessions(owner_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_game_type ON game_sessions(game_type);
CREATE INDEX IF NOT EXISTS idx_game_sessions_winner_id ON game_sessions(winner_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_completed_at ON game_sessions(completed_at DESC);

ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read game sessions" ON game_sessions
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert game sessions" ON game_sessions
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their game sessions" ON game_sessions
  FOR UPDATE USING (auth.uid() = owner_id);

-- 3. HOUSE_RULES
CREATE TABLE IF NOT EXISTS house_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  game_type text NOT NULL,
  rules_text text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, game_type)
);

ALTER TABLE house_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read house rules" ON house_rules
  FOR SELECT USING (true);

CREATE POLICY "Users can manage own house rules" ON house_rules
  FOR ALL USING (auth.uid() = user_id);

-- 4. PLAYER_GAME_STATS (per-player aggregated stats)
CREATE TABLE IF NOT EXISTS player_game_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_type text NOT NULL,
  player_id uuid REFERENCES users(id) ON DELETE SET NULL,
  player_name text NOT NULL,
  total_wins int DEFAULT 0,
  total_games int DEFAULT 0,
  total_points int DEFAULT 0,
  highest_score int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Unique constraint: one stats row per player per game type
CREATE UNIQUE INDEX IF NOT EXISTS idx_player_game_stats_unique
  ON player_game_stats(game_type, COALESCE(player_id::text, player_name));

CREATE INDEX IF NOT EXISTS idx_player_game_stats_game_type ON player_game_stats(game_type);
CREATE INDEX IF NOT EXISTS idx_player_game_stats_player_id ON player_game_stats(player_id);
CREATE INDEX IF NOT EXISTS idx_player_game_stats_wins ON player_game_stats(total_wins DESC);

ALTER TABLE player_game_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read player stats" ON player_game_stats
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert stats" ON player_game_stats
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update stats" ON player_game_stats
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- 5. PLAYER_MATCHUPS (head-to-head records)
CREATE TABLE IF NOT EXISTS player_matchups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_type text NOT NULL,
  player1_id uuid,
  player1_name text NOT NULL,
  player2_id uuid,
  player2_name text NOT NULL,
  player1_wins int DEFAULT 0,
  player2_wins int DEFAULT 0,
  total_games int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Ensure consistent ordering to prevent A-vs-B and B-vs-A duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_player_matchups_unique
  ON player_matchups(game_type, LEAST(player1_name, player2_name), GREATEST(player1_name, player2_name));

CREATE INDEX IF NOT EXISTS idx_player_matchups_game_type ON player_matchups(game_type);
CREATE INDEX IF NOT EXISTS idx_player_matchups_players ON player_matchups(player1_name, player2_name);

ALTER TABLE player_matchups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read matchups" ON player_matchups
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert matchups" ON player_matchups
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update matchups" ON player_matchups
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- 6. PLAYER_CLAIMS (audit trail)
CREATE TABLE IF NOT EXISTS player_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  claimed_name text NOT NULL,
  game_count int NOT NULL,
  claimed_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_player_claims_user ON player_claims(user_id);
CREATE INDEX IF NOT EXISTS idx_player_claims_name ON player_claims(claimed_name);

ALTER TABLE player_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own claims" ON player_claims
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own claims" ON player_claims
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 7. GAME_WIN_DEFINITIONS (configurable win logic)
CREATE TABLE IF NOT EXISTS game_win_definitions (
  game_type text PRIMARY KEY,
  win_logic jsonb NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE game_win_definitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read win definitions" ON game_win_definitions
  FOR SELECT USING (true);

-- Seed Chicago win logic
INSERT INTO game_win_definitions (game_type, win_logic, description) VALUES
  ('chicago', '{"type": "highest_score", "tieHandling": "no_win"}', 'Highest score wins; ties count as no win')
ON CONFLICT (game_type) DO NOTHING;

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Function to handle new user signup (create profile automatically)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO users (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to claim a player name
CREATE OR REPLACE FUNCTION claim_player_name(
  p_user_id uuid,
  p_player_name text,
  p_game_type text DEFAULT NULL
) RETURNS int AS $$
DECLARE
  claimed_count int := 0;
  v_display_name text;
BEGIN
  -- Get the user's display name
  SELECT display_name INTO v_display_name FROM users WHERE id = p_user_id;

  -- Update game_sessions: set userId in player_data for matching names
  UPDATE game_sessions
  SET player_data = (
    SELECT jsonb_agg(
      CASE
        WHEN elem->>'displayName' = p_player_name
             AND (elem->>'userId' IS NULL OR elem->>'userId' = '')
        THEN elem || jsonb_build_object('userId', p_user_id::text, 'isRegistered', true)
        ELSE elem
      END
    )
    FROM jsonb_array_elements(player_data) AS elem
  ),
  -- Also update winner_id if winner_name matches
  winner_id = CASE
    WHEN winner_name = p_player_name THEN p_user_id
    ELSE winner_id
  END,
  updated_at = now()
  WHERE (p_game_type IS NULL OR game_sessions.game_type = p_game_type)
  AND EXISTS (
    SELECT 1 FROM jsonb_array_elements(player_data) AS elem
    WHERE elem->>'displayName' = p_player_name
    AND (elem->>'userId' IS NULL OR elem->>'userId' = '')
  );

  GET DIAGNOSTICS claimed_count = ROW_COUNT;

  -- Update player_game_stats: link to user
  UPDATE player_game_stats
  SET player_id = p_user_id, updated_at = now()
  WHERE player_name = p_player_name
  AND player_id IS NULL
  AND (p_game_type IS NULL OR game_type = p_game_type);

  -- Update player_matchups: link to user
  UPDATE player_matchups
  SET player1_id = CASE WHEN player1_name = p_player_name THEN p_user_id ELSE player1_id END,
      player2_id = CASE WHEN player2_name = p_player_name THEN p_user_id ELSE player2_id END,
      updated_at = now()
  WHERE (player1_name = p_player_name OR player2_name = p_player_name)
  AND (p_game_type IS NULL OR game_type = p_game_type);

  -- Record the claim
  INSERT INTO player_claims (user_id, claimed_name, game_count)
  VALUES (p_user_id, p_player_name, claimed_count);

  RETURN claimed_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Leaderboard view function
CREATE OR REPLACE FUNCTION get_leaderboard(
  p_game_type text,
  p_sort_by text DEFAULT 'total_wins',
  p_min_games int DEFAULT 0,
  p_limit int DEFAULT 50
)
RETURNS TABLE (
  player_name text,
  player_id uuid,
  total_wins int,
  total_games int,
  total_points int,
  highest_score int,
  win_percentage numeric,
  avg_score numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    pgs.player_name,
    pgs.player_id,
    pgs.total_wins,
    pgs.total_games,
    pgs.total_points,
    pgs.highest_score,
    CASE WHEN pgs.total_games > 0
      THEN ROUND(100.0 * pgs.total_wins / pgs.total_games, 1)
      ELSE 0
    END AS win_percentage,
    CASE WHEN pgs.total_games > 0
      THEN ROUND(pgs.total_points::numeric / pgs.total_games, 1)
      ELSE 0
    END AS avg_score
  FROM player_game_stats pgs
  WHERE pgs.game_type = p_game_type
  AND pgs.total_games >= p_min_games
  ORDER BY
    CASE p_sort_by
      WHEN 'total_wins' THEN pgs.total_wins
      WHEN 'total_games' THEN pgs.total_games
      WHEN 'highest_score' THEN pgs.highest_score
      WHEN 'total_points' THEN pgs.total_points
      ELSE pgs.total_wins
    END DESC,
    pgs.total_games DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function for win-percentage sorting (separate because of computed column)
CREATE OR REPLACE FUNCTION get_leaderboard_by_win_pct(
  p_game_type text,
  p_min_games int DEFAULT 3,
  p_limit int DEFAULT 50
)
RETURNS TABLE (
  player_name text,
  player_id uuid,
  total_wins int,
  total_games int,
  total_points int,
  highest_score int,
  win_percentage numeric,
  avg_score numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    pgs.player_name,
    pgs.player_id,
    pgs.total_wins,
    pgs.total_games,
    pgs.total_points,
    pgs.highest_score,
    CASE WHEN pgs.total_games > 0
      THEN ROUND(100.0 * pgs.total_wins / pgs.total_games, 1)
      ELSE 0
    END AS win_percentage,
    CASE WHEN pgs.total_games > 0
      THEN ROUND(pgs.total_points::numeric / pgs.total_games, 1)
      ELSE 0
    END AS avg_score
  FROM player_game_stats pgs
  WHERE pgs.game_type = p_game_type
  AND pgs.total_games >= p_min_games
  ORDER BY
    (pgs.total_wins::numeric / NULLIF(pgs.total_games, 0)) DESC,
    pgs.total_games DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function for avg-score sorting
CREATE OR REPLACE FUNCTION get_leaderboard_by_avg_score(
  p_game_type text,
  p_min_games int DEFAULT 3,
  p_limit int DEFAULT 50
)
RETURNS TABLE (
  player_name text,
  player_id uuid,
  total_wins int,
  total_games int,
  total_points int,
  highest_score int,
  win_percentage numeric,
  avg_score numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    pgs.player_name,
    pgs.player_id,
    pgs.total_wins,
    pgs.total_games,
    pgs.total_points,
    pgs.highest_score,
    CASE WHEN pgs.total_games > 0
      THEN ROUND(100.0 * pgs.total_wins / pgs.total_games, 1)
      ELSE 0
    END AS win_percentage,
    CASE WHEN pgs.total_games > 0
      THEN ROUND(pgs.total_points::numeric / pgs.total_games, 1)
      ELSE 0
    END AS avg_score
  FROM player_game_stats pgs
  WHERE pgs.game_type = p_game_type
  AND pgs.total_games >= p_min_games
  ORDER BY
    (pgs.total_points::numeric / NULLIF(pgs.total_games, 0)) DESC,
    pgs.total_games DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Get unclaimed names for a user
CREATE OR REPLACE FUNCTION get_claimable_names(p_user_id uuid)
RETURNS TABLE (
  player_name text,
  game_count bigint
) AS $$
DECLARE
  v_display_name text;
BEGIN
  SELECT display_name INTO v_display_name FROM users WHERE id = p_user_id;

  RETURN QUERY
  SELECT
    elem->>'displayName' AS player_name,
    COUNT(*) AS game_count
  FROM game_sessions,
       jsonb_array_elements(player_data) AS elem
  WHERE elem->>'displayName' = v_display_name
  AND (elem->>'userId' IS NULL OR elem->>'userId' = '')
  GROUP BY elem->>'displayName';
END;
$$ LANGUAGE plpgsql;
