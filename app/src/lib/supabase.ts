import { createClient } from '@supabase/supabase-js';

// Quasar CLI (app-vite) exposes client-side env vars under the QCLI_ prefix by
// default (not Vite's usual VITE_ prefix) — see quasar.config.ts / .env.example.
const supabaseUrl = import.meta.env.QCLI_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.QCLI_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase env vars: set QCLI_SUPABASE_URL and QCLI_SUPABASE_ANON_KEY in .env (see .env.example).',
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
