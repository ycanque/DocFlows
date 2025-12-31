/**
 * Supabase Client for Frontend
 *
 * This client is configured to work with local Supabase Storage
 * running on http://127.0.0.1:54321
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseServiceRoleKey =
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

/**
 * Supabase client instance
 * Uses the anonymous key for client-side operations
 * For server-side operations, use service role key
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // We're using JWT auth via our backend
  },
});

/**
 * Admin Supabase client (bypasses RLS)
 * Use this for development/testing when RLS policies are not set up
 * ⚠️ WARNING: Do not expose service role key in production client code!
 */
export const supabaseAdmin = supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : supabase; // Fallback to regular client if service key not provided
