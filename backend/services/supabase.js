import { createClient } from "@supabase/supabase-js";

let cachedClient;

function supabaseUrl() {
  return process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
}

function supabaseKey() {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );
}

export function hasSupabaseConfig() {
  return Boolean(supabaseUrl() && supabaseKey());
}

export function getSupabaseClient() {
  if (!hasSupabaseConfig()) return null;
  if (cachedClient) return cachedClient;

  cachedClient = createClient(supabaseUrl(), supabaseKey(), {
    auth: {
      persistSession: false,
    },
  });

  return cachedClient;
}

export function supabaseSource() {
  return hasSupabaseConfig() ? "supabase" : "server-memory-fallback";
}
