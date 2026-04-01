import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 
  import.meta.env.VITE_SUPABASE_URL
const supabaseKey = 
  import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Missing Supabase env variables. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env'
  )
}

const GLOBAL_SUPABASE_KEY = '__billr_supabase_client__'
const existingClient = globalThis[GLOBAL_SUPABASE_KEY]

export const supabase = existingClient || createClient(
  supabaseUrl,
  supabaseKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
)

if (!existingClient) {
  globalThis[GLOBAL_SUPABASE_KEY] = supabase
}