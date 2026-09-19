import { createClient } from '@supabase/supabase-js';

// Quasar CLI (app-vite) exposes client-side env vars under the QCLI_ prefix by
// default (not Vite's usual VITE_ prefix) — see quasar.config.ts / .env.example.
// This project's Supabase project uses the newer "publishable key" naming
// (sb_publishable_...) rather than the older "anon key" — same purpose,
// safe to expose client-side, real access is governed by RLS policies.
const supabaseUrl = import.meta.env.QCLI_SUPABASE_URL as string;
const supabasePublishableKey = import.meta.env.QCLI_SUPABASE_PUBLISHABLE_KEY as string;

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error(
    'Missing Supabase env vars: set QCLI_SUPABASE_URL and QCLI_SUPABASE_PUBLISHABLE_KEY in .env (see .env.example).',
  );
}

export const supabase = createClient(supabaseUrl, supabasePublishableKey);
