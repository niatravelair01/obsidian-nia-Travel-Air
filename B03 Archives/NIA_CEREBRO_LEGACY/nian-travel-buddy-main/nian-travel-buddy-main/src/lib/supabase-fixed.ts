import { createClient } from "@supabase/supabase-js";

// Este arquivo ignora qualquer configuração automática do Lovable
// e força a conexão com o projeto CORRETO.
const SUPABASE_URL = "https://mjrigtcagpogjxgyqro.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_t21atWuN6S-iPCSmnz3c3Q_RBMrXGmg";

export const supabaseFixed = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
