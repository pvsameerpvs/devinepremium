import { createClient } from "@supabase/supabase-js";
import { env } from "../config/env";

export function createSupabaseAuthClient() {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    throw new Error(
      "Supabase auth is not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY.",
    );
  }

  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
