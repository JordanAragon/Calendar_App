import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Request } from 'express'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY')
}

export function getSupabaseForRequest(req: Request): SupabaseClient {
  const authorization = req.header('authorization') ?? ''
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : ''

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    },
    auth: { persistSession: false, autoRefreshToken: false }
  })
}

export async function requireUser(req: Request) {
  const auth = req.header('authorization') ?? ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
  if (!token) throw new Error('UNAUTHENTICATED')

  const supabase = getSupabaseForRequest(req)
  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data.user) throw new Error('UNAUTHENTICATED')
  return { supabase, user: data.user }
}
