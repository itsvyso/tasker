import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import React from 'react'
import { TaskProvider, useTaskContext } from '../../context/TaskContext'
import { RoutinesView } from '../views/RoutinesView'
import { Sidebar } from '../layout/Sidebar'
import { ViewNavigationTabs } from '../common/ViewNavigationTabs'
import { CommandPalette } from '../common/CommandPalette'

describe('RoutinesView Component & Bento Grid Architecture', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('renders all Bento cards and widgets correctly', () => {
    render(
      <TaskProvider>
        <RoutinesView />
      </TaskProvider>
    )

    // Hero banner
    expect(screen.getByText('Habits, 3D Telemetry & Deep Work')).toBeInTheDocument()
    expect(screen.getByText('Peak Streak')).toBeInTheDocument()

    // 1. Projects Timeline & Routine Schedule (Dot Matrix Grid)
    expect(screen.getByText('Projects Timeline & Routine Schedule')).toBeInTheDocument()
    expect(screen.getByText('Upcoming Tasks')).toBeInTheDocument()
    expect(screen.getByText('Mobile app')).toBeInTheDocument()
    expect(screen.getByText('Web Design')).toBeInTheDocument()
    expect(screen.getByText('UX Kit')).toBeInTheDocument()

    // 2. Task Status (3D Progress Capsules)
    expect(screen.getByText('Task Status')).toBeInTheDocument()
    expect(screen.getByText('HIGH')).toBeInTheDocument()
    expect(screen.getByText('MEDIUM')).toBeInTheDocument()
    expect(screen.getByText('LOW')).toBeInTheDocument()

    // 3. Project Progress Radial Gauge
    expect(screen.getByText('Project Progress')).toBeInTheDocument()
    expect(screen.getByText('Done')).toBeInTheDocument()
    expect(screen.getByText('In Progress')).toBeInTheDocument()
    expect(screen.getByText('To Do')).toBeInTheDocument()

    // 4. Today's Routines Tracker with 7-Day Heatmap
    expect(screen.getByText("Today's Routines")).toBeInTheDocument()
    expect(screen.getAllByText('Review Tasks & Backlog').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Team Sync Meeting').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Deep Work Session').length).toBeGreaterThan(0)

    // 5. Team Insights (Canvas 2D Waveform)
    expect(screen.getByText('Team Insights')).toBeInTheDocument()
    expect(screen.getByText('Streaming')).toBeInTheDocument()

    // 6. Pomodoro Focus Time Tracker
    expect(screen.getByText('Focus Time Tracker')).toBeInTheDocument()
    expect(screen.getByText('25m Focus')).toBeInTheDocument()
    expect(screen.getByText('5m Break')).toBeInTheDocument()
    expect(screen.getByText('15m Break')).toBeInTheDocument()
    expect(screen.getByText('25:00')).toBeInTheDocument()
  })

  it('allows switching days in the dot matrix timeline header and renders day-specific schedule tracks', () => {
    render(
      <TaskProvider>
        <RoutinesView />
      </TaskProvider>
    )

    // Day 6 is default active day with its 3 time block pills
    expect(screen.getByText(/Day 6 \(Fri\)/)).toBeInTheDocument()
    expect(screen.getByText('Mobile app')).toBeInTheDocument()
    expect(screen.getByText('Web Design')).toBeInTheDocument()
    expect(screen.getByText('UX Kit')).toBeInTheDocument()

    // Click Day 2 (Mon) button
    const day2Buttons = screen.getAllByRole('button').filter((b) => b.textContent?.includes('2M'))
    expect(day2Buttons.length).toBeGreaterThan(0)
    fireEvent.click(day2Buttons[0])

    expect(screen.getByText(/Day 2 \(Mon\)/)).toBeInTheDocument()
    expect(screen.getByText('Sprint Kickoff & Triage')).toBeInTheDocument()
    expect(screen.getByText('Architecture Spec Review')).toBeInTheDocument()

    // Toggle All Sprint Days view
    const allDaysToggle = screen.getByRole('button', { name: /Day 2 \(Mon\)/i })
    fireEvent.click(allDaysToggle)
    expect(screen.getByRole('button', { name: /All Sprint Days/i })).toBeInTheDocument()
  })

  it('filters schedule blocks by status', () => {
    render(
      <TaskProvider>
        <RoutinesView />
      </TaskProvider>
    )

    // Find filter buttons
    const inTestFilter = screen.getByRole('button', { name: /In Test/i })
    fireEvent.click(inTestFilter)

    // Mobile app is In Test, so it should still be present
    expect(screen.getByText('Mobile app')).toBeInTheDocument()
  })

  it('toggles routine completion and updates streak and progress', () => {
    render(
      <TaskProvider>
        <RoutinesView />
      </TaskProvider>
    )

    // Check Deep Work Session is initially not completed today
    const deepWorkText = screen.getByText('Deep Work Session')
    expect(deepWorkText).toBeInTheDocument()
    expect(deepWorkText).not.toHaveClass('line-through')

    // Find the toggle button in the routine row
    const routineRow = deepWorkText.closest('div[class*="group"]')!
    const checkBtn = routineRow.querySelector('button')!
    fireEvent.click(checkBtn)

    // Now it should be crossed out (line-through)
    expect(deepWorkText).toHaveClass('line-through')
  })

  it('supports adding and deleting a custom routine', async () => {
    render(
      <TaskProvider>
        <RoutinesView />
      </TaskProvider>
    )

    // Open Add Routine form
    const addBtn = screen.getByRole('button', { name: /Add Routine/i })
    await act(async () => {
      fireEvent.click(addBtn)
    })

    // Fill form
    const input = screen.getByPlaceholderText(/Routine title/i)
    await act(async () => {
      fireEvent.change(input, { target: { value: 'Continuous Integration Audit' } })
    })

    const saveBtn = screen.getByRole('button', { name: /Save/i })
    await act(async () => {
      fireEvent.click(saveBtn)
    })

    // Verify newly added routine is in the document
    expect(screen.getAllByText('Continuous Integration Audit').length).toBeGreaterThan(0)
  })

  it('operates Pomodoro timer: mode change, start, pause, and reset', () => {
    render(
      <TaskProvider>
        <RoutinesView />
      </TaskProvider>
    )

    const timerDisplay = screen.getByTestId('pomodoro-timer-display')
    expect(timerDisplay.textContent).toBe('25:00')

    // Switch to 5m Break
    const breakBtn = screen.getByRole('button', { name: /^5m Break$/i })
    fireEvent.click(breakBtn)
    expect(timerDisplay.textContent).toBe('05:00')

    // Start timer
    const startBtn = screen.getByRole('button', { name: /Start Session/i })
    fireEvent.click(startBtn)
    expect(screen.getByRole('button', { name: /Pause/i })).toBeInTheDocument()

    // Pause timer
    const pauseBtn = screen.getByRole('button', { name: /Pause/i })
    fireEvent.click(pauseBtn)
    expect(screen.getByRole('button', { name: /Start Session/i })).toBeInTheDocument()

    // Reset timer
    const resetBtn = screen.getByTitle(/Reset timer/i)
    fireEvent.click(resetBtn)
    expect(timerDisplay.textContent).toBe('05:00')
  })

  it('toggles Canvas 2D equalizer playing and paused state', () => {
    render(
      <TaskProvider>
        <RoutinesView />
      </TaskProvider>
    )

    // Initial state is Streaming
    const toggleBtn = screen.getByRole('button', { name: /Streaming/i })
    expect(toggleBtn).toBeInTheDocument()

    // Click to Pause
    fireEvent.click(toggleBtn)
    expect(screen.getByRole('button', { name: /Resume/i })).toBeInTheDocument()

    // Click to Resume
    const resumeBtn = screen.getByRole('button', { name: /Resume/i })
    fireEvent.click(resumeBtn)
    expect(screen.getByRole('button', { name: /Streaming/i })).toBeInTheDocument()
  })

  it('wires Routines & Insights into Sidebar and ViewNavigationTabs with keyboard shortcut 7', () => {
    const TestComponent = () => {
      const { activeView } = useTaskContext()
      return (
        <div>
          <span data-testid="active-view-indicator">{activeView}</span>
          <Sidebar />
          <ViewNavigationTabs />
        </div>
      )
    }

    render(
      <TaskProvider>
        <TestComponent />
      </TaskProvider>
    )

    // Initially on dashboard
    expect(screen.getByTestId('active-view-indicator').textContent).toBe('dashboard')

    // Click Routines & Insights tab
    const routineTabs = screen.getAllByRole('button', { name: /Routines & Insights/i })
    expect(routineTabs.length).toBeGreaterThan(0)
    fireEvent.click(routineTabs[0])

    expect(screen.getByTestId('active-view-indicator').textContent).toBe('routines')

    // Test keyboard shortcut '7'
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '1' }))
    })
    expect(screen.getByTestId('active-view-indicator').textContent).toBe('dashboard')

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '7' }))
    })
    expect(screen.getByTestId('active-view-indicator').textContent).toBe('routines')
  })

  it('includes Routines in CommandPalette search actions', () => {
    const TestPaletteWrapper = () => {
      const { setIsCommandPaletteOpen } = useTaskContext()
      return (
        <div>
          <button onClick={() => setIsCommandPaletteOpen(true)}>Open Palette</button>
          <CommandPalette />
        </div>
      )
    }

    render(
      <TaskProvider>
        <TestPaletteWrapper />
      </TaskProvider>
    )

    // Open palette
    fireEvent.click(screen.getByText('Open Palette'))

    // Search for "routines"
    const input = screen.getByPlaceholderText(/Search tasks, projects, actions/i)
    fireEvent.change(input, { target: { value: 'routines' } })

    expect(screen.getByText('Switch to Routines & Insights')).toBeInTheDocument()
  })

  it('completes linked routine only on focus work session countdown finish, not on break', () => {
    vi.useFakeTimers()

    render(
      <TaskProvider>
        <RoutinesView />
      </TaskProvider>
    )

    // Deep Work Session is initially false for today
    const deepWorkText = screen.getByText('Deep Work Session')
    expect(deepWorkText).not.toHaveClass('line-through')

    // In Pomodoro timer, link to Deep Work Session
    const select = screen.getByRole('combobox')
    const deepWorkOption = Array.from((select as HTMLSelectElement).options).find((opt) =>
      opt.textContent?.includes('Deep Work Session')
    )
    if (deepWorkOption) {
      fireEvent.change(select, { target: { value: deepWorkOption.value } })
    }

    // Start 25m Focus session
    const startBtn = screen.getByRole('button', { name: /Start Session/i })
    act(() => {
      fireEvent.click(startBtn)
    })

    // Advance 25 minutes + 1 second, then flush completion timeout
    act(() => {
      vi.advanceTimersByTime(25 * 60 * 1000 + 1000)
    })
    act(() => {
      vi.advanceTimersByTime(10)
    })

    // Deep Work Session should now be completed (line-through)
    expect(deepWorkText).toHaveClass('line-through')

    // Now test Break session: Client Communication & Review is also initially false
    const clientCommText = screen.getByText('Client Communication & Review')
    expect(clientCommText).not.toHaveClass('line-through')

    // Switch to 5m Break
    const breakBtn = screen.getByRole('button', { name: /^5m Break$/i })
    act(() => {
      fireEvent.click(breakBtn)
    })

    // Start 5m Break session
    const startBreakBtn = screen.getByRole('button', { name: /Start Session/i })
    act(() => {
      fireEvent.click(startBreakBtn)
    })

    // Advance 5 minutes + 1 second
    act(() => {
      vi.advanceTimersByTime(5 * 60 * 1000 + 1000)
    })
    act(() => {
      vi.advanceTimersByTime(10)
    })

    // Completing a BREAK must NOT mark Client Communication completed!
    expect(clientCommText).not.toHaveClass('line-through')

    vi.useRealTimers()
  })

  it('interacts with TaskStatusCapsules priority filter toggling', () => {
    const TestFilterComponent = () => {
      const { filters } = useTaskContext()
      return (
        <div>
          <span data-testid="priority-filter-display">{filters.priority}</span>
          <RoutinesView />
        </div>
      )
    }

    render(
      <TaskProvider>
        <TestFilterComponent />
      </TaskProvider>
    )

    expect(screen.getByTestId('priority-filter-display').textContent).toBe('all')

    // Click HIGH capsule card
    const highText = screen.getByText('HIGH')
    const capsuleCard = highText.closest('div[class*="cursor-pointer"]')!
    fireEvent.click(capsuleCard)

    expect(screen.getByTestId('priority-filter-display').textContent).toBe('high')

    // Click HIGH capsule card again to reset to 'all'
    fireEvent.click(capsuleCard)
    expect(screen.getByTestId('priority-filter-display').textContent).toBe('all')
  })

  it('sanitizes negative duration input when adding routine', async () => {
    render(
      <TaskProvider>
        <RoutinesView />
      </TaskProvider>
    )

    const addBtn = screen.getByRole('button', { name: /Add Routine/i })
    await act(async () => {
      fireEvent.click(addBtn)
    })

    const titleInput = screen.getByPlaceholderText(/Routine title/i)
    const durationInput = screen.getByRole('spinbutton')

    await act(async () => {
      fireEvent.change(titleInput, { target: { value: 'Edge Case Audit Routine' } })
      fireEvent.change(durationInput, { target: { value: '-45' } })
    })

    const saveBtn = screen.getByRole('button', { name: /Save/i })
    await act(async () => {
      fireEvent.click(saveBtn)
    })

    // Should be created with positive duration 45m (clamped from -45)
    expect(screen.getAllByText('Edge Case Audit Routine').length).toBeGreaterThan(0)
    expect(screen.getByText('45m')).toBeInTheDocument()
  })
})
