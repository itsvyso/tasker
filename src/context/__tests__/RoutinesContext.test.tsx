import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import React from 'react'
import { TaskProvider, useTaskContext } from '../TaskContext'

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <TaskProvider>{children}</TaskProvider>
)

describe('TaskContext Routines State Management & Operations', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('initializes with default routines and 7-day history', () => {
    const { result } = renderHook(() => useTaskContext(), { wrapper })

    expect(result.current.routines).toBeDefined()
    expect(result.current.routines.length).toBeGreaterThanOrEqual(5)

    const first = result.current.routines[0]
    expect(first.title).toBe('Review Tasks & Backlog')
    expect(first.targetDurationMinutes).toBe(15)
    expect(first.streak).toBeGreaterThan(0)
    expect(first.history.length).toBe(7)
  })

  it('toggles routine completion for today and updates streak properly', () => {
    const { result } = renderHook(() => useTaskContext(), { wrapper })
    const targetRoutine = result.current.routines.find((r) => !r.completedToday) || result.current.routines[2]
    const initialStreak = targetRoutine.streak

    act(() => {
      result.current.toggleRoutineToday(targetRoutine.id)
    })

    let updated = result.current.routines.find((r) => r.id === targetRoutine.id)!
    expect(updated.completedToday).toBe(true)
    expect(updated.streak).toBe(initialStreak + 1)
    expect(updated.history[6]).toBe(true)

    // Toggle back
    act(() => {
      result.current.toggleRoutineToday(targetRoutine.id)
    })

    updated = result.current.routines.find((r) => r.id === targetRoutine.id)!
    expect(updated.completedToday).toBe(false)
    expect(updated.streak).toBe(initialStreak)
    expect(updated.history[6]).toBe(false)
  })

  it('adds and deletes a new routine', () => {
    const { result } = renderHook(() => useTaskContext(), { wrapper })

    let newRoutine: any
    act(() => {
      newRoutine = result.current.addRoutine({
        title: 'Security Vulnerability Triage',
        targetDurationMinutes: 45,
        category: 'Security',
      })
    })

    expect(newRoutine).toBeDefined()
    expect(newRoutine.title).toBe('Security Vulnerability Triage')
    expect(newRoutine.targetDurationMinutes).toBe(45)
    expect(newRoutine.completedToday).toBe(false)
    expect(newRoutine.history.length).toBe(7)

    const found = result.current.routines.find((r) => r.id === newRoutine.id)
    expect(found).toBeDefined()

    // Delete routine
    act(() => {
      result.current.deleteRoutine(newRoutine.id)
    })

    expect(result.current.routines.find((r) => r.id === newRoutine.id)).toBeUndefined()
  })

  it('resets routines to defaults', () => {
    const { result } = renderHook(() => useTaskContext(), { wrapper })

    act(() => {
      result.current.deleteRoutine(result.current.routines[0].id)
    })

    expect(result.current.routines.length).toBe(4)

    act(() => {
      result.current.resetRoutinesToDefault()
    })

    expect(result.current.routines.length).toBe(5)
  })

  it('resets routines on resetToMockData', () => {
    const { result } = renderHook(() => useTaskContext(), { wrapper })

    act(() => {
      result.current.addRoutine({
        title: 'Temporary Scratch Routine',
        targetDurationMinutes: 10,
      })
    })

    expect(result.current.routines.some((r) => r.title === 'Temporary Scratch Routine')).toBe(true)

    act(() => {
      result.current.resetToMockData()
    })

    expect(result.current.routines.some((r) => r.title === 'Temporary Scratch Routine')).toBe(false)
    expect(result.current.routines.length).toBe(5)
  })

  it('supports switching activeView to routines', () => {
    const { result } = renderHook(() => useTaskContext(), { wrapper })

    act(() => {
      result.current.setActiveView('routines')
    })

    expect(result.current.activeView).toBe('routines')
  })

  it('clamps negative or zero duration and truncates overly long titles in addRoutine', () => {
    const { result } = renderHook(() => useTaskContext(), { wrapper })

    let clampedRoutine: any
    act(() => {
      clampedRoutine = result.current.addRoutine({
        title: 'A'.repeat(120),
        targetDurationMinutes: -99,
        category: 'B'.repeat(80),
      })
    })

    expect(clampedRoutine.targetDurationMinutes).toBe(99) // sanitized to positive within 5-240
    expect(clampedRoutine.title.length).toBe(80) // capped at 80
    expect(clampedRoutine.category.length).toBe(40) // capped at 40

    // Test zero or invalid duration
    let fallbackRoutine: any
    act(() => {
      fallbackRoutine = result.current.addRoutine({
        title: 'Zero test',
        targetDurationMinutes: 0,
      })
    })
    expect(fallbackRoutine.targetDurationMinutes).toBe(25) // fallback to 25
  })

  it('honors empty array stored in localStorage for routines', () => {
    localStorage.setItem('taske_routines_v1', JSON.stringify([]))
    const { result } = renderHook(() => useTaskContext(), { wrapper })
    expect(result.current.routines).toEqual([])
  })
})
