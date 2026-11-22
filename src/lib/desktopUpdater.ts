export interface DesktopUpdateInfo {
  available: boolean
  currentVersion?: string
  newVersion?: string
  body?: string
}

export const isTauriDesktop = (): boolean => {
  return typeof window !== 'undefined' && Boolean((window as unknown as { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__)
}

export const checkDesktopUpdates = async (): Promise<DesktopUpdateInfo> => {
  if (!isTauriDesktop()) {
    return { available: false }
  }

  try {
    const { check } = await import('@tauri-apps/plugin-updater')
    const update = await check()
    if (update?.available) {
      return {
        available: true,
        currentVersion: update.currentVersion,
        newVersion: update.version,
        body: update.body,
      }
    }
    return { available: false, currentVersion: update?.currentVersion }
  } catch (err) {
    console.warn('[DesktopUpdater] Update check failed or unsupported:', err)
    return { available: false }
  }
}

export const installDesktopUpdate = async (): Promise<boolean> => {
  if (!isTauriDesktop()) {
    return false
  }

  try {
    const { check } = await import('@tauri-apps/plugin-updater')
    const update = await check()
    if (update?.available) {
      await update.downloadAndInstall()
      return true
    }
    return false
  } catch (err) {
    console.error('[DesktopUpdater] Failed to install update:', err)
    return false
  }
}
