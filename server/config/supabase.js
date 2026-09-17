import { createClient } from '@supabase/supabase-js'

const { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY } =
  process.env

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    '[NEXORA MART] Missing SUPABASE_URL or SUPABASE_ANON_KEY in server/.env'
  )
}

/**
 * Anon client — used to verify user JWTs (respects RLS).
 */
export const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
  // Add global fetch for better Node.js compatibility
  global: { fetch: fetch },
})

/**
 * Service-role client — bypasses RLS. Use ONLY on the server for trusted
 * operations (creating orders, reading all products, etc.).
 */
export const supabaseAdmin = SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
      // Add global fetch for better Node.js compatibility
      global: { fetch: fetch },
    })
  : supabaseAnon

export default supabaseAdmin