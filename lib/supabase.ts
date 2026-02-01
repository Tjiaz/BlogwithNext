import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Lazy initialization function to avoid throwing errors during build
function createSupabaseClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // During build, return a placeholder that will fail gracefully at runtime
    // This allows the build to complete without env vars, but runtime will fail with clear errors
    throw new Error('❌ Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your Vercel environment variables.');
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false, // We're using next-auth for auth
    },
  });
}

// Create client lazily - only when actually accessed
let _supabase: SupabaseClient | undefined;

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    if (!_supabase) {
      _supabase = createSupabaseClient();
    }
    const value = _supabase[prop as keyof SupabaseClient];
    return typeof value === 'function' ? value.bind(_supabase) : value;
  },
});

// Server-side Supabase client (for admin operations if needed)
let _supabaseAdmin: SupabaseClient | null | undefined;

export const supabaseAdmin = (() => {
  if (_supabaseAdmin !== undefined) {
    return _supabaseAdmin;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    _supabaseAdmin = null;
    return null;
  }

  _supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return _supabaseAdmin;
})();

export default supabase;
