import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || 'https://rffflhabazajuarvuemj.supabase.co',
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_k91HnZyeQ-DyG17L7aBNAg_jSHTYdwI',
)
