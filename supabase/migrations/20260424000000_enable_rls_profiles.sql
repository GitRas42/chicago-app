-- Enable RLS on any public-schema tables that are still unprotected.
-- Runs safely: skips tables that don't exist or already have RLS enabled.

DO $$
DECLARE
  tbl TEXT;
BEGIN
  -- Iterate over every table in public schema that still has RLS off
  FOR tbl IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
      AND rowsecurity = false
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl);
    RAISE NOTICE 'Enabled RLS on public.%', tbl;
  END LOOP;
END $$;

-- profiles table: created by the Supabase auth quickstart trigger.
-- Guard with DO so the migration is idempotent if the table doesn't exist.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles'
  ) THEN
    -- Anyone can view profiles (leaderboard / in-game display)
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'profiles_select_public'
    ) THEN
      CREATE POLICY "profiles_select_public"
        ON public.profiles FOR SELECT USING (true);
    END IF;

    -- Only the owner can insert their own profile
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'profiles_insert_own'
    ) THEN
      CREATE POLICY "profiles_insert_own"
        ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
    END IF;

    -- Only the owner can update their own profile
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'profiles_update_own'
    ) THEN
      CREATE POLICY "profiles_update_own"
        ON public.profiles FOR UPDATE
        USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
    END IF;

    -- Only the owner can delete their own profile
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'profiles_delete_own'
    ) THEN
      CREATE POLICY "profiles_delete_own"
        ON public.profiles FOR DELETE USING (auth.uid() = id);
    END IF;
  END IF;
END $$;
