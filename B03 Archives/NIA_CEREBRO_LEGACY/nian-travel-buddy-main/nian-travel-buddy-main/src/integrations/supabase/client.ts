import { createClient } from "@supabase/supabase-js";

// Forçando os valores reais para garantir que o Lovable não use o projeto antigo
const SUPABASE_URL = "https://mjrigtcagpogjxgyqro.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_t21atWuN6S-iPCSmnz3c3Q_RBMrXGmg";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
