import { createClient } from '@supabase/supabase-js';
import { config } from '../config/env.js';

let supabaseClient = null;

const supabaseKey = config.supabase.serviceRoleKey || config.supabase.anonKey;

if (config.supabase.url && supabaseKey) {
  try {
    supabaseClient = createClient(
      config.supabase.url,
      supabaseKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
    console.log(`[Supabase] Initialized with ${config.supabase.serviceRoleKey ? 'Service Role' : 'Anon'} Client (${config.supabase.url})`);
  } catch (err) {
    console.warn('[Supabase] Failed to initialize client:', err.message);
    supabaseClient = null;
  }
} else {
  console.log('[Supabase] No credentials configured. Using local zero-friction data store.');
}

export const supabase = supabaseClient;
export const isSupabaseConfigured = () => Boolean(supabaseClient);
