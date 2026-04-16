-- Enable Row-Level Security on all game tables
-- Migration: enable_rls_security
-- Date: 2026-04-16

-- ============================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_game_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_matchups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.house_rules ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- USERS TABLE POLICIES
-- ============================================================

-- Anyone can view user profiles (for leaderboard)
CREATE POLICY "users_select_public"
  ON public.users
  FOR SELECT
  USING (true);

-- Only the authenticated user can insert their own profile
CREATE POLICY "users_insert_own"
  ON public.users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Only the authenticated user can update their own profile
CREATE POLICY "users_update_own"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Only the authenticated user can delete their own profile
CREATE POLICY "users_delete_own"
  ON public.users
  FOR DELETE
  USING (auth.uid() = id);

-- ============================================================
-- GAME_SESSIONS TABLE POLICIES
-- ============================================================

-- Anyone can view game sessions (for leaderboard / history)
CREATE POLICY "game_sessions_select_public"
  ON public.game_sessions
  FOR SELECT
  USING (true);

-- Authenticated users can create game sessions
CREATE POLICY "game_sessions_insert_authenticated"
  ON public.game_sessions
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Only the session creator can update their session
CREATE POLICY "game_sessions_update_creator"
  ON public.game_sessions
  FOR UPDATE
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Only the session creator can delete their session
CREATE POLICY "game_sessions_delete_creator"
  ON public.game_sessions
  FOR DELETE
  USING (auth.uid() = created_by);

-- ============================================================
-- PLAYER_GAME_STATS TABLE POLICIES
-- ============================================================

-- Anyone can view player stats (for leaderboard)
CREATE POLICY "player_game_stats_select_public"
  ON public.player_game_stats
  FOR SELECT
  USING (true);

-- Only the authenticated user can insert their own stats
CREATE POLICY "player_game_stats_insert_own"
  ON public.player_game_stats
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Only the authenticated user can update their own stats
CREATE POLICY "player_game_stats_update_own"
  ON public.player_game_stats
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Only the authenticated user can delete their own stats
CREATE POLICY "player_game_stats_delete_own"
  ON public.player_game_stats
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- PLAYER_MATCHUPS TABLE POLICIES
-- ============================================================

-- Anyone can view head-to-head matchup records
CREATE POLICY "player_matchups_select_public"
  ON public.player_matchups
  FOR SELECT
  USING (true);

-- Authenticated users can insert matchup records (system-managed via triggers)
CREATE POLICY "player_matchups_insert_authenticated"
  ON public.player_matchups
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Authenticated users can update matchup records (system-managed via triggers)
CREATE POLICY "player_matchups_update_authenticated"
  ON public.player_matchups
  FOR UPDATE
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Authenticated users can delete matchup records (system-managed via triggers)
CREATE POLICY "player_matchups_delete_authenticated"
  ON public.player_matchups
  FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- ============================================================
-- PLAYER_CLAIMS TABLE POLICIES
-- ============================================================

-- Only authenticated users can view claim records
CREATE POLICY "player_claims_select_authenticated"
  ON public.player_claims
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Only the claiming user can insert their own claim
CREATE POLICY "player_claims_insert_own"
  ON public.player_claims
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Only the claiming user can update their own claim
CREATE POLICY "player_claims_update_own"
  ON public.player_claims
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Only the claiming user can delete their own claim
CREATE POLICY "player_claims_delete_own"
  ON public.player_claims
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- HOUSE_RULES TABLE POLICIES
-- ============================================================

-- Anyone can view house rules (needed during game setup)
CREATE POLICY "house_rules_select_public"
  ON public.house_rules
  FOR SELECT
  USING (true);

-- Only the owner can insert their own house rules
CREATE POLICY "house_rules_insert_own"
  ON public.house_rules
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Only the owner can update their own house rules
CREATE POLICY "house_rules_update_own"
  ON public.house_rules
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Only the owner can delete their own house rules
CREATE POLICY "house_rules_delete_own"
  ON public.house_rules
  FOR DELETE
  USING (auth.uid() = user_id);
