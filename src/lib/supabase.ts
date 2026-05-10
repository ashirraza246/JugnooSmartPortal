import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

let _supabase: SupabaseClient | null = null

function getSupabase(): SupabaseClient {
  if (!_supabase && supabaseUrl && supabaseAnonKey) {
    _supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    })
  }
  return _supabase!
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabase()
    if (!client) return undefined
    return (client as Record<string | symbol, unknown>)[prop]
  }
})

export function isSupabaseConfigured(): boolean {
  return !!(supabaseUrl && supabaseAnonKey)
}

export async function checkTablesExist(): Promise<boolean> {
  try {
    if (!isSupabaseConfigured()) return false
    const client = getSupabase()
    if (!client) return false
    const { error } = await client.from('users').select('id').limit(1)
    return !error
  } catch {
    return false
  }
}
