import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import React from 'react'
import { TaskProvider, useTaskContext } from '../TaskContext'
import { isOverdue, formatDate, formatFullDate, getPriorityInfo, getStatusInfo } from '../../utils/formatters'

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <TaskProvider>{children}</TaskProvider>
)

describe('Edge Cases and Boundary Conditions', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('handles regex and special characters in search filter without crashing', () => {
    const { result } = renderHook(() => useTaskContext(), { wrapper })

    act(() => {
      result.current.setFilters({ search: '***[[(\\\\+?$$' })
    })

    // Should return 0 items safely without throwing regex syntax error
    expect(result.current.filteredTasks.length).toBe(0)
  })

  it('handles empty strings and whitespace in task creation gracefully', () => {
    const { result } = renderHook(() => useTaskContext(), { wrapper })

    let created: any
    act(() => {
      created = result.current.createTask({
        title: '   Trimmed Title   ',
        description: '   Trimmed Description   ',
        status: 'backlog',
        priority: 'low',
        assigneeId: result.current.users[0].id,
        tags: [],
        dueDate: '2026-12-31',
        estimatedHours: 0,
      })
    })

    expect(created.title).toBe('Trimmed Title')
    expect(created.description).toBe('Trimmed Description')
    expect(created.estimatedHours).toBe(0)
    expect(created.subtasks).toEqual([])
    expect(created.comments).toEqual([])
  })

  it('handles deleting a non-existent taskId gracefully without side effects', () => {
    const { result } = renderHook(() => useTaskContext(), { wrapper })
    const initialCount = result.current.tasks.length

    act(() => {
      result.current.deleteTask('non-existent-id-999999')
    })

    expect(result.current.tasks.length).toBe(initialCount)
  })

  it('handles updating a non-existent taskId without throwing error', () => {
    const { result } = renderHook(() => useTaskContext(), { wrapper })

    expect(() => {
      act(() => {
        result.current.updateTask('non-existent-id-8888', { title: 'Ghost' })
      })
    }).not.toThrow()
  })

  it('handles switching to an invalid project ID gracefully by keeping a valid activeProject', () => {
    const { result } = renderHook(() => useTaskContext(), { wrapper })

    act(() => {
      result.current.setActiveProjectId('non-existent-proj-xyz')
    })

    expect(result.current.activeProject).toBeDefined()
    expect(result.current.activeProject.id).toBeDefined()
  })

  it('correctly calculates isOverdue boundaries', () => {
    // Empty due date: not overdue
    expect(isOverdue('', 'backlog')).toBe(false)
    expect(isOverdue(undefined, 'backlog')).toBe(false)

    // Past date but status is 'done': never overdue
    expect(isOverdue('2020-01-01', 'done')).toBe(false)

    // Past date and status is 'in_progress': overdue
    expect(isOverdue('2020-01-01', 'in_progress')).toBe(true)

    // Far future date: not overdue
    expect(isOverdue('2099-12-31', 'in_progress')).toBe(false)
  })

  it('handles date formatter edge cases (undefined, invalid string)', () => {
    expect(formatDate(undefined)).toBe('')
    expect(formatDate('')).toBe('')
    expect(formatFullDate(undefined)).toBe('')
    expect(formatFullDate('')).toBe('')
  })

  it('returns valid theme badges for all priorities and statuses', () => {
    const priorities = ['urgent', 'high', 'medium', 'low'] as const
    priorities.forEach((p) => {
      const info = getPriorityInfo(p)
      expect(info.label).toBeDefined()
      expect(info.badge).toBeDefined()
    })

    const statuses = ['backlog', 'in_progress', 'in_review', 'done'] as const
    statuses.forEach((s) => {
      const info = getStatusInfo(s)
      expect(info.label).toBeDefined()
      expect(info.color).toBeDefined()
    })
  })
})
