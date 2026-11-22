import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import React from 'react'
import { TaskProvider, useTaskContext } from '../TaskContext'

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <TaskProvider>{children}</TaskProvider>
)

describe('TaskContext State and Reducer Operations', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('initializes with default projects, tasks, and users', () => {
    const { result } = renderHook(() => useTaskContext(), { wrapper })

    expect(result.current.projects.length).toBeGreaterThanOrEqual(3)
    expect(result.current.tasks.length).toBeGreaterThan(0)
    expect(result.current.users.length).toBeGreaterThanOrEqual(5)
    expect(result.current.activeProject).toBeDefined()
    expect(result.current.activeView).toBe('dashboard')
  })

  it('creates a new task and appends it to projectTasks', () => {
    const { result } = renderHook(() => useTaskContext(), { wrapper })

    let createdTask: any
    act(() => {
      createdTask = result.current.createTask({
        title: 'New Automated Test Task',
        description: 'Comprehensive test description',
        status: 'backlog',
        priority: 'urgent',
        assigneeId: result.current.users[0].id,
        tags: ['Vitest', 'Testing'],
        dueDate: '2026-12-01',
        estimatedHours: 6,
      })
    })

    expect(createdTask).toBeDefined()
    expect(createdTask.title).toBe('New Automated Test Task')
    expect(createdTask.taskCode).toContain(result.current.activeProject.code)
    expect(createdTask.priority).toBe('urgent')

    const found = result.current.tasks.find((t) => t.id === createdTask.id)
    expect(found).toBeDefined()
    expect(found?.title).toBe('New Automated Test Task')
  })

  it('updates task status when moved across Kanban columns', () => {
    const { result } = renderHook(() => useTaskContext(), { wrapper })
    const sampleTask = result.current.tasks[0]

    act(() => {
      result.current.moveTaskStatus(sampleTask.id, 'done')
    })

    const updated = result.current.tasks.find((t) => t.id === sampleTask.id)
    expect(updated?.status).toBe('done')
  })

  it('toggles, adds, and deletes subtasks properly', () => {
    const { result } = renderHook(() => useTaskContext(), { wrapper })
    const sampleTask = result.current.tasks[0]

    // Add subtask
    act(() => {
      result.current.addSubtask(sampleTask.id, 'Fresh Subtask for Vitest')
    })

    let current = result.current.tasks.find((t) => t.id === sampleTask.id)!
    const addedSub = current.subtasks.find((s) => s.title === 'Fresh Subtask for Vitest')
    expect(addedSub).toBeDefined()
    expect(addedSub?.completed).toBe(false)

    // Toggle subtask
    act(() => {
      result.current.toggleSubtask(sampleTask.id, addedSub!.id)
    })

    current = result.current.tasks.find((t) => t.id === sampleTask.id)!
    const toggledSub = current.subtasks.find((s) => s.id === addedSub!.id)
    expect(toggledSub?.completed).toBe(true)

    // Delete subtask
    act(() => {
      result.current.deleteSubtask(sampleTask.id, addedSub!.id)
    })

    current = result.current.tasks.find((t) => t.id === sampleTask.id)!
    expect(current.subtasks.find((s) => s.id === addedSub!.id)).toBeUndefined()
  })

  it('filters tasks accurately by priority and search text', () => {
    const { result } = renderHook(() => useTaskContext(), { wrapper })

    act(() => {
      result.current.setFilters({ priority: 'urgent' })
    })

    result.current.filteredTasks.forEach((t) => {
      expect(t.priority).toBe('urgent')
    })

    // Search query filter
    act(() => {
      result.current.setFilters({ search: 'Bento' })
    })

    result.current.filteredTasks.forEach((t) => {
      const match =
        t.title.toLowerCase().includes('bento') ||
        t.description.toLowerCase().includes('bento') ||
        t.tags.some((tag) => tag.toLowerCase().includes('bento'))
      expect(match).toBe(true)
    })

    // Reset filters
    act(() => {
      result.current.resetFilters()
    })

    expect(result.current.filters.priority).toBe('all')
    expect(result.current.filters.search).toBe('')
  })

  it('handles edge case: adding empty comments or subtasks does nothing', () => {
    const { result } = renderHook(() => useTaskContext(), { wrapper })
    const sampleTask = result.current.tasks[0]
    const initialCommentsCount = sampleTask.comments.length
    const initialSubtasksCount = sampleTask.subtasks.length

    act(() => {
      result.current.addComment(sampleTask.id, '   ')
      result.current.addSubtask(sampleTask.id, '')
    })

    const afterTask = result.current.tasks.find((t) => t.id === sampleTask.id)!
    expect(afterTask.comments.length).toBe(initialCommentsCount)
    expect(afterTask.subtasks.length).toBe(initialSubtasksCount)
  })

  it('switches projects and filters tasks to the selected project', () => {
    const { result } = renderHook(() => useTaskContext(), { wrapper })
    const secondProject = result.current.projects[1]

    act(() => {
      result.current.setActiveProjectId(secondProject.id)
    })

    expect(result.current.activeProjectId).toBe(secondProject.id)
    expect(result.current.activeProject.id).toBe(secondProject.id)
    result.current.projectTasks.forEach((t) => {
      expect(t.projectId).toBe(secondProject.id)
    })
  })
})
