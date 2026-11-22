import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

describe('PWA & Desktop Configuration Verification', () => {
  it('validates public/manifest.json standalone full-screen configuration', () => {
    const manifestPath = path.resolve(__dirname, '../../public/manifest.json')
    expect(fs.existsSync(manifestPath)).toBe(true)

    const content = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'))
    expect(content.name).toBe('Tasker Pro')
    expect(content.short_name).toBe('Tasker')
    expect(content.display).toBe('standalone')
    expect(content.theme_color).toBe('#08080B')
    expect(content.background_color).toBe('#08080B')
    expect(content.icons.length).toBeGreaterThanOrEqual(2)
    expect(content.icons.some((i: { sizes: string }) => i.sizes === '192x192')).toBe(true)
    expect(content.icons.some((i: { sizes: string }) => i.sizes === '512x512')).toBe(true)
  })

  it('validates iOS Apple mobile web app tags in index.html', () => {
    const indexPath = path.resolve(__dirname, '../../index.html')
    expect(fs.existsSync(indexPath)).toBe(true)

    const html = fs.readFileSync(indexPath, 'utf-8')
    expect(html).toContain('apple-mobile-web-app-capable')
    expect(html).toContain('apple-mobile-web-app-status-bar-style')
    expect(html).toContain('apple-mobile-web-app-title')
    expect(html).toContain('apple-touch-icon.png')
    expect(html).toContain('manifest.json')
    expect(html).toContain('content="#08080B"')
  })

  it('validates Tauri v2 configuration and updater endpoints in tauri.conf.json', () => {
    const tauriConfPath = path.resolve(__dirname, '../../src-tauri/tauri.conf.json')
    expect(fs.existsSync(tauriConfPath)).toBe(true)

    const tauriConf = JSON.parse(fs.readFileSync(tauriConfPath, 'utf-8'))
    expect(tauriConf.productName).toBe('Tasker')
    expect(tauriConf.identifier).toBe('com.tasker.desktop')
    expect(tauriConf.bundle?.createUpdaterArtifacts).toBe(true)
    expect(tauriConf.app?.windows?.[0]?.label).toBe('main')
    expect(tauriConf.plugins?.updater?.endpoints).toBeDefined()
    expect(tauriConf.plugins.updater.endpoints[0]).toContain('github.com/itsvy/tasker/releases')
    expect(tauriConf.plugins.updater.pubkey).toBeDefined()
  })

  it('validates Tauri v2 capabilities and binary icon signatures', () => {
    const capPath = path.resolve(__dirname, '../../src-tauri/capabilities/default.json')
    expect(fs.existsSync(capPath)).toBe(true)

    const cap = JSON.parse(fs.readFileSync(capPath, 'utf-8'))
    expect(cap.windows).toContain('main')
    expect(cap.permissions).toContain('updater:default')
    expect(cap.permissions).toContain('core:default')

    // Verify Windows .ico binary format (magic bytes 00 00 01 00)
    const icoPath = path.resolve(__dirname, '../../src-tauri/icons/icon.ico')
    const icoBytes = fs.readFileSync(icoPath)
    expect(icoBytes[0]).toBe(0x00)
    expect(icoBytes[1]).toBe(0x00)
    expect(icoBytes[2]).toBe(0x01)
    expect(icoBytes[3]).toBe(0x00)

    // Verify macOS .icns binary format (magic bytes 'icns')
    const icnsPath = path.resolve(__dirname, '../../src-tauri/icons/icon.icns')
    const icnsBytes = fs.readFileSync(icnsPath)
    expect(icnsBytes.toString('ascii', 0, 4)).toBe('icns')
  })

  it('validates GitHub Actions release workflow for automated multi-platform desktop builds', () => {
    const workflowPath = path.resolve(__dirname, '../../.github/workflows/release.yml')
    expect(fs.existsSync(workflowPath)).toBe(true)

    const workflow = fs.readFileSync(workflowPath, 'utf-8')
    expect(workflow).toContain('windows-latest')
    expect(workflow).toContain('macos-latest')
    expect(workflow).toContain('tauri-apps/tauri-action')
    expect(workflow).toContain('TAURI_SIGNING_PRIVATE_KEY')
  })
})
