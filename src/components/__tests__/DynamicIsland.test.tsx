import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'
import { TaskProvider, useTaskContext } from '../../context/TaskContext'
import { DynamicIsland } from '../layout/DynamicIsland'

const DynamicIslandTestWrapper: React.FC<{ initialView?: string }> = () => {
  const { activeView } = useTaskContext()
  return (
    <div>
      <span data-testid="current-view-indicator">{activeView}</span>
      <div data-testid="outside-area">Outside Canvas Area</div>
      <DynamicIsland />
    </div>
  )
}

describe('DynamicIsland Component', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('renders compact island by default with ambient status', () => {
    render(
      <TaskProvider>
        <DynamicIsland />
      </TaskProvider>
    )

    expect(screen.getByTestId('dynamic-island')).toBeInTheDocument()
    expect(screen.getByTestId('dynamic-island-compact')).toBeInTheDocument()
    expect(screen.queryByTestId('dynamic-island-expanded')).not.toBeInTheDocument()
    expect(screen.getByText(/Taske Ambient|Supabase Sync/i)).toBeInTheDocument()
  })

  it('expands on click into interactive mini-island widget', async () => {
    render(
      <TaskProvider>
        <DynamicIsland />
      </TaskProvider>
    )

    const compactPill = screen.getByTestId('dynamic-island-compact')
    fireEvent.click(compactPill)

    await waitFor(() => {
      expect(screen.getByTestId('dynamic-island-expanded')).toBeInTheDocument()
    })

    expect(screen.getByText(/⚡ Supabase Synced/i)).toBeInTheDocument()
    expect(screen.getByTestId('island-mode-work')).toBeInTheDocument()
    expect(screen.getByTestId('island-mode-break')).toBeInTheDocument()
    expect(screen.getByTestId('island-mode-long')).toBeInTheDocument()
    expect(screen.getByTestId('island-play-pause-btn')).toBeInTheDocument()
    expect(screen.getByTestId('island-reset-btn')).toBeInTheDocument()
  })

  it('operates timer controls: mode change, start, pause, and reset', async () => {
    render(
      <TaskProvider>
        <DynamicIsland />
      </TaskProvider>
    )

    // Expand
    fireEvent.click(screen.getByTestId('dynamic-island-compact'))
    await waitFor(() => {
      expect(screen.getByTestId('dynamic-island-expanded')).toBeInTheDocument()
    })

    // Default is 25:00
    expect(screen.getByText('25:00')).toBeInTheDocument()

    // Switch to 5m Break
    fireEvent.click(screen.getByTestId('island-mode-break'))
    expect(screen.getByText('05:00')).toBeInTheDocument()

    // Start timer
    const playPauseBtn = screen.getByTestId('island-play-pause-btn')
    expect(playPauseBtn.textContent).toContain('Start')
    fireEvent.click(playPauseBtn)
    expect(playPauseBtn.textContent).toContain('Pause')

    // Pause timer
    fireEvent.click(playPauseBtn)
    expect(playPauseBtn.textContent).toContain('Start')

    // Switch to 15m Long
    fireEvent.click(screen.getByTestId('island-mode-long'))
    expect(screen.getByText('15:00')).toBeInTheDocument()

    // Reset timer
    fireEvent.click(screen.getByTestId('island-reset-btn'))
    expect(screen.getByText('15:00')).toBeInTheDocument()
  })

  it('navigates to Routines Bento Hub via shortcut button', async () => {
    render(
      <TaskProvider>
        <DynamicIslandTestWrapper />
      </TaskProvider>
    )

    expect(screen.getByTestId('current-view-indicator').textContent).toBe('dashboard')

    // Expand island
    fireEvent.click(screen.getByTestId('dynamic-island-compact'))
    await waitFor(() => {
      expect(screen.getByTestId('dynamic-island-expanded')).toBeInTheDocument()
    })

    // Click Bento Hub shortcut
    const bentoBtn = screen.getByTestId('island-routines-btn')
    fireEvent.click(bentoBtn)

    await waitFor(() => {
      expect(screen.getByTestId('current-view-indicator').textContent).toBe('routines')
    })
  })

  it('collapses on outside click', async () => {
    render(
      <TaskProvider>
        <DynamicIslandTestWrapper />
      </TaskProvider>
    )

    // Expand island
    fireEvent.click(screen.getByTestId('dynamic-island-compact'))
    await waitFor(() => {
      expect(screen.getByTestId('dynamic-island-expanded')).toBeInTheDocument()
    })

    // Click outside
    fireEvent.mouseDown(screen.getByTestId('outside-area'))

    await waitFor(() => {
      expect(screen.queryByTestId('dynamic-island-expanded')).not.toBeInTheDocument()
      expect(screen.getByTestId('dynamic-island-compact')).toBeInTheDocument()
    })
  })

  it('collapses on Escape key press', async () => {
    render(
      <TaskProvider>
        <DynamicIsland />
      </TaskProvider>
    )

    // Expand island
    fireEvent.click(screen.getByTestId('dynamic-island-compact'))
    await waitFor(() => {
      expect(screen.getByTestId('dynamic-island-expanded')).toBeInTheDocument()
    })

    // Press Escape
    fireEvent.keyDown(document, { key: 'Escape' })

    await waitFor(() => {
      expect(screen.queryByTestId('dynamic-island-expanded')).not.toBeInTheDocument()
      expect(screen.getByTestId('dynamic-island-compact')).toBeInTheDocument()
    })
  })

  it('collapses when minimize chevron is clicked', async () => {
    render(
      <TaskProvider>
        <DynamicIsland />
      </TaskProvider>
    )

    // Expand island
    fireEvent.click(screen.getByTestId('dynamic-island-compact'))
    await waitFor(() => {
      expect(screen.getByTestId('dynamic-island-expanded')).toBeInTheDocument()
    })

    // Click minimize button
    const minimizeBtn = screen.getByLabelText('Minimize')
    fireEvent.click(minimizeBtn)

    await waitFor(() => {
      expect(screen.queryByTestId('dynamic-island-expanded')).not.toBeInTheDocument()
      expect(screen.getByTestId('dynamic-island-compact')).toBeInTheDocument()
    })
  })
})
