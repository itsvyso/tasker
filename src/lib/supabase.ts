import { createClient, type SupabaseClient, type User as SupabaseAuthUser } from '@supabase/supabase-js'

export interface CloudWorkspace {
  id: string
  name: string
  slug: string
  owner_id: string
}

export type SyncStatus = 'offline' | 'connecting' | 'synced' | 'syncing' | 'error'

export const isSupabaseConfigured = (): boolean => {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
  return Boolean(
    url &&
    key &&
    !url.includes('your-project') &&
    !url.includes('placeholder') &&
    url.startsWith('http')
  )
}

let supabaseInstance: SupabaseClient | null = null

export const _setSupabaseInstanceForTesting = (instance: SupabaseClient | null) => {
  supabaseInstance = instance
}

export const getSupabaseClient = (): SupabaseClient | null => {
  if (!isSupabaseConfigured()) {
    return null
  }

  const url = import.meta.env.VITE_SUPABASE_URL as string
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string

  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
        realtime: {
          params: {
            eventsPerSecond: 10,
          },
        },
      })
    } catch (err) {
      console.warn('[Supabase] Failed to initialize client:', err)
      supabaseInstance = null
    }
  }

  return supabaseInstance
}

export interface HealthCheckResult {
  ok: boolean
  configured: boolean
  message: string
  latencyMs?: number
}

export const checkSupabaseHealth = async (): Promise<HealthCheckResult> => {
  if (!isSupabaseConfigured()) {
    return {
      ok: false,
      configured: false,
      message: 'Supabase credentials not configured. Operating in Offline-First mode.',
    }
  }

  const client = getSupabaseClient()
  if (!client) {
    return {
      ok: false,
      configured: true,
      message: 'Client initialization failed.',
    }
  }

  const start = performance.now()
  try {
    // Check connection with a fast low-overhead query
    const { error } = await client.from('projects').select('id', { head: true, count: 'exact' })
    const latency = Math.round(performance.now() - start)

    if (error) {
      return {
        ok: false,
        configured: true,
        message: `Connection failed: ${error.message || 'Database error'}`,
      }
    }

    return {
      ok: true,
      configured: true,
      message: `Connected (${latency}ms)`,
      latencyMs: latency,
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    return {
      ok: false,
      configured: true,
      message: `Connection error: ${errorMsg}`,
    }
  }
}

export type { SupabaseAuthUser }
