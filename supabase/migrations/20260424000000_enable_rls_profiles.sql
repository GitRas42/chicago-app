-- Enable Row-Level Security on the profiles table
-- Migration: enable_rls_profiles
-- Date: 2026-04-24

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Anyone can view profiles (leaderboard / in-game display)
CREATE POLICY "profiles_select_public"
  ON public.profiles
  FOR SELECT
  USING (true);

-- Only the authenticated user can insert their own profile
CREATE POLICY "profiles_insert_own"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Only the authenticated user can update their own profile
CREATE POLICY "profiles_update_own"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Only the authenticated user can delete their own profile
CREATE POLICY "profiles_delete_own"
  ON public.profiles
  FOR DELETE
  USING (auth.uid() = id);
