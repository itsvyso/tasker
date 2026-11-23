import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import React from 'react'
import { TaskProvider, useTaskContext, EMPTY_PROJECT } from '../TaskContext'

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <TaskProvider>{children}</TaskProvider>
)

describe('Clean Production Data & Team Member Management', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.unstubAllEnvs()
  })

  it('allows adding a new team member and persists them in users roster', () => {
    const { result } = renderHook(() => useTaskContext(), { wrapper })

    const initialCount = result.current.users.length

    let newMember: any
    act(() => {
      newMember = result.current.addTeamMember({
        name: 'Kacper Kowalski',
        email: 'kacper@mindflow.io',
        role: 'Mobile Lead',
      })
    })

    expect(newMember).toBeDefined()
    expect(newMember.name).toBe('Kacper Kowalski')
    expect(newMember.email).toBe('kacper@mindflow.io')
    expect(newMember.role).toBe('Mobile Lead')
    expect(newMember.avatar).toContain('dicebear.com')

    expect(result.current.users.length).toBe(initialCount + 1)
    expect(result.current.users.some((u) => u.email === 'kacper@mindflow.io')).toBe(true)
  })

  it('allows assigning and unassigning a team member to a specific project', () => {
    const { result } = renderHook(() => useTaskContext(), { wrapper })

    // Add a custom team member
    let member: any
    act(() => {
      member = result.current.addTeamMember({
        name: 'Marek Nowak',
        email: 'marek@company.com',
        role: 'Backend Architect',
      })
    })

    const targetProject = result.current.projects[0]
    expect(targetProject).toBeDefined()

    // Assign to project
    act(() => {
      result.current.toggleProjectMember(targetProject.id, member.id)
    })

    const updatedProject = result.current.projects.find((p) => p.id === targetProject.id)!
    expect(updatedProject.memberIds).toContain(member.id)

    // Unassign from project
    act(() => {
      result.current.toggleProjectMember(targetProject.id, member.id)
    })

    const unassignedProject = result.current.projects.find((p) => p.id === targetProject.id)!
    expect(unassignedProject.memberIds).not.toContain(member.id)
  })

  it('batch updates project members with updateProjectMembers', () => {
    const { result } = renderHook(() => useTaskContext(), { wrapper })
    const targetProject = result.current.projects[0]

    const newMemberIds = ['user-custom-1', 'user-custom-2']
    act(() => {
      result.current.updateProjectMembers(targetProject.id, newMemberIds)
    })

    const updated = result.current.projects.find((p) => p.id === targetProject.id)!
    expect(updated.memberIds).toEqual(newMemberIds)
  })

  it('removes a team member from users and cleans up project memberIds', () => {
    const { result } = renderHook(() => useTaskContext(), { wrapper })

    let member: any
    act(() => {
      member = result.current.addTeamMember({
        name: 'Anna Wisniewska',
        email: 'anna@taske.io',
      })
    })

    const targetProject = result.current.projects[0]
    act(() => {
      result.current.toggleProjectMember(targetProject.id, member.id)
    })

    expect(result.current.projects.find((p) => p.id === targetProject.id)!.memberIds).toContain(member.id)

    // Remove member
    act(() => {
      result.current.removeTeamMember(member.id)
    })

    expect(result.current.users.some((u) => u.id === member.id)).toBe(false)
    expect(result.current.projects.find((p) => p.id === targetProject.id)!.memberIds).not.toContain(member.id)
  })

  it('clearAllData wipes all projects, tasks, routines, and chat without reviving mock data', () => {
    const { result } = renderHook(() => useTaskContext(), { wrapper })

    act(() => {
      result.current.clearAllData()
    })

    expect(result.current.projects).toEqual([])
    expect(result.current.tasks).toEqual([])
    expect(result.current.chatMessages).toEqual([])
    expect(result.current.routines).toEqual([])
    expect(result.current.activeProjectId).toBe('')
    expect(result.current.activeProject).toEqual(EMPTY_PROJECT)
    expect(result.current.projectTasks).toEqual([])
  })

  it('activeProjectMembers returns empty array when project has empty memberIds and does not leak all workspace users', () => {
    const { result } = renderHook(() => useTaskContext(), { wrapper })

    let projectWithNoMembers: any
    act(() => {
      projectWithNoMembers = result.current.createProject({
        name: 'Isolated Project',
        code: 'ISO',
        description: 'No external members',
        category: 'Development',
        color: '#6366F1',
        icon: 'Folder',
        memberIds: [],
      })
    })

    act(() => {
      result.current.setActiveProjectId(projectWithNoMembers.id)
      // Explicitly clear memberIds to simulate project with no members
      result.current.updateProjectMembers(projectWithNoMembers.id, [])
    })

    expect(result.current.activeProject.id).toBe(projectWithNoMembers.id)
    expect(result.current.activeProject.memberIds).toEqual([])
    // Must NOT leak all workspace users
    expect(result.current.activeProjectMembers).toEqual([])
  })

  it('createProject automatically includes creator in memberIds', () => {
    const { result } = renderHook(() => useTaskContext(), { wrapper })

    let created: any
    act(() => {
      created = result.current.createProject({
        name: 'New Space',
        code: 'NSP',
        description: 'Test space',
        category: 'Engineering',
        color: '#10B981',
        icon: 'Folder',
        memberIds: [],
      })
    })

    expect(created.memberIds).toContain(result.current.currentUser.id)
  })

  it('addTeamMember reuses existing member when email already exists', () => {
    const { result } = renderHook(() => useTaskContext(), { wrapper })

    let first: any
    let second: any

    act(() => {
      first = result.current.addTeamMember({
        name: 'Piotr K',
        email: 'piotr@mindflow.io',
        role: 'Designer',
      })
    })

    act(() => {
      second = result.current.addTeamMember({
        name: 'Piotr K Duplicate',
        email: 'piotr@mindflow.io',
        role: 'Designer',
      })
    })

    expect(second.id).toBe(first.id)
  })
})
