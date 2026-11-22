import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  isSupabaseConfigured,
  checkSupabaseHealth,
  getSupabaseClient,
  _setSupabaseInstanceForTesting,
} from '../supabase'

describe('Supabase Client & Offline-First Fallback', () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
    _setSupabaseInstanceForTesting(null)
    vi.clearAllMocks()
  })

  it('detects unconfigured environment when env vars are missing or placeholders', () => {
    // In test environment without .env, isSupabaseConfigured should safely return false
    expect(isSupabaseConfigured()).toBe(false)
  })

  it('returns null client when unconfigured to prevent unexpected crashes', () => {
    const client = getSupabaseClient()
    expect(client).toBeNull()
  })

  it('provides safe offline healthcheck result when unconfigured', async () => {
    const health = await checkSupabaseHealth()
    expect(health.ok).toBe(false)
    expect(health.configured).toBe(false)
    expect(health.message).toContain('Offline-First')
  })

  it('fails healthcheck when database returns an error response', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://valid-project.supabase.co')
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'valid-anon-key-123')

    const mockClient = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue({ error: { message: 'Invalid API key' }, data: null }),
      }),
    }
    _setSupabaseInstanceForTesting(mockClient as any)

    const health = await checkSupabaseHealth()
    expect(health.ok).toBe(false)
    expect(health.configured).toBe(true)
    expect(health.message).toContain('Connection failed: Invalid API key')
  })

  it('succeeds healthcheck when database responds without error', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://valid-project.supabase.co')
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'valid-anon-key-123')

    const mockClient = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue({ error: null, data: [] }),
      }),
    }
    _setSupabaseInstanceForTesting(mockClient as any)

    const health = await checkSupabaseHealth()
    expect(health.ok).toBe(true)
    expect(health.configured).toBe(true)
    expect(health.message).toContain('Connected')
  })
})
