import { describe, it, expect, vi, beforeEach } from 'vitest'
import { isTauriDesktop, checkDesktopUpdates, installDesktopUpdate } from '../desktopUpdater'

describe('Desktop Tauri v2 Updater Integration', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    delete (window as unknown as { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__
  })

  it('correctly identifies non-desktop web/browser environment', () => {
    expect(isTauriDesktop()).toBe(false)
  })

  it('safely returns unavailable when running in browser environment', async () => {
    const update = await checkDesktopUpdates()
    expect(update.available).toBe(false)
  })

  it('gracefully handles install update when not in desktop environment', async () => {
    const installed = await installDesktopUpdate()
    expect(installed).toBe(false)
  })

  it('identifies Tauri desktop when window.__TAURI_INTERNALS__ is present', () => {
    ;(window as unknown as { __TAURI_INTERNALS__: Record<string, unknown> }).__TAURI_INTERNALS__ = {}
    expect(isTauriDesktop()).toBe(true)
  })
})
