import { describe, it, expect } from 'vitest'
import {
  mapTaskFromDb,
  mapTaskToDb,
  mapProjectFromDb,
  mapProjectToDb,
  mapRoutineFromDb,
  mapRoutineToDb,
  mapChatMessageFromDb,
  mapChatMessageToDb,
  type DbTaskRow,
  type DbProjectRow,
  type DbRoutineRow,
  type DbChatMessageRow,
} from '../syncMappers'
import type { Task, Project, RoutineItem, ChatMessage } from '../../types'

describe('Supabase Sync Mappers (Bidirectional Transformations)', () => {
  it('correctly maps DB task row to client Task model and handles nulls gracefully', () => {
    const dbRow: DbTaskRow = {
      id: 'task-101',
      project_id: 'proj-1',
      task_code: 'TASK-101',
      title: 'Setup CI/CD Pipeline',
      description: null,
      status: 'in_progress',
      priority: 'high',
      assignee_id: 'usr-1',
      creator_id: 'usr-2',
      tags: ['devops', 'infra'],
      subtasks: [{ id: 'sub-1', title: 'Write workflow', completed: true }],
      comments: [],
      attachments: [],
      due_date: '2026-12-01',
      start_date: null,
      estimated_hours: 8,
      logged_hours: 4,
      created_at: '2026-11-20T10:00:00Z',
      updated_at: '2026-11-22T12:00:00Z',
    }

    const task = mapTaskFromDb(dbRow)
    expect(task.id).toBe('task-101')
    expect(task.projectId).toBe('proj-1')
    expect(task.taskCode).toBe('TASK-101')
    expect(task.description).toBe('')
    expect(task.subtasks).toHaveLength(1)
    expect(task.estimatedHours).toBe(8)
    expect(task.loggedHours).toBe(4)
  })

  it('correctly maps client Task model to DB row with snake_case and workspace_id', () => {
    const task: Task = {
      id: 'task-202',
      projectId: 'proj-2',
      taskCode: 'DEV-202',
      title: 'Implement Dark Mode',
      description: 'Contrast checks',
      status: 'done',
      priority: 'urgent',
      assigneeId: 'usr-3',
      creatorId: 'usr-1',
      tags: ['ui', 'theme'],
      subtasks: [],
      comments: [],
      attachments: [],
      dueDate: '2026-11-25',
      startDate: '2026-11-20',
      estimatedHours: 6,
      loggedHours: 6,
      createdAt: '2026-11-20T08:00:00Z',
      updatedAt: '2026-11-22T09:00:00Z',
    }

    const row = mapTaskToDb(task, 'ws-abc-123')
    expect(row.id).toBe('task-202')
    expect(row.project_id).toBe('proj-2')
    expect(row.task_code).toBe('DEV-202')
    expect(row.workspace_id).toBe('ws-abc-123')
    expect(row.due_date).toBe('2026-11-25')
  })

  it('correctly transforms Project models bidirectionally', () => {
    const project: Project = {
      id: 'proj-99',
      name: 'Mobile App',
      code: 'MOB',
      description: 'iOS & Android PWA',
      color: '#10B981',
      icon: 'Smartphone',
      memberIds: ['usr-1', 'usr-2'],
      category: 'Mobile',
      targetDate: '2026-12-31',
      createdAt: '2026-11-01',
    }

    const dbProj = mapProjectToDb(project, 'ws-mobile')
    expect(dbProj.id).toBe('proj-99')
    expect(dbProj.workspace_id).toBe('ws-mobile')
    expect(dbProj.member_ids).toEqual(['usr-1', 'usr-2'])

    const restored = mapProjectFromDb(dbProj as DbProjectRow)
    expect(restored.id).toBe(project.id)
    expect(restored.name).toBe(project.name)
    expect(restored.memberIds).toEqual(['usr-1', 'usr-2'])
  })

  it('correctly transforms RoutineItem and ChatMessage models bidirectionally', () => {
    const routine: RoutineItem = {
      id: 'rout-1',
      title: 'Morning Standup & Review',
      category: 'Focus',
      targetDurationMinutes: 15,
      streak: 5,
      completedToday: true,
      history: [true, true, true, true, true, false, false],
      color: '#8B5CF6',
    }

    const dbRoutine = mapRoutineToDb(routine, 'ws-1', 'usr-1')
    expect(dbRoutine.target_duration_minutes).toBe(15)
    expect(dbRoutine.streak).toBe(5)
    expect(dbRoutine.completed_today).toBe(true)

    const restoredRoutine = mapRoutineFromDb(dbRoutine as DbRoutineRow)
    expect(restoredRoutine.id).toBe(routine.id)
    expect(restoredRoutine.title).toBe(routine.title)
    expect(restoredRoutine.streak).toBe(5)

    const chatMsg: ChatMessage = {
      id: 'msg-1',
      projectId: 'proj-1',
      senderId: 'usr-1',
      content: 'Database migration applied successfully!',
      timestamp: '14:30',
    }

    const dbChat = mapChatMessageToDb(chatMsg, 'ws-1')
    expect(dbChat.content).toBe('Database migration applied successfully!')
    expect(dbChat.project_id).toBe('proj-1')
    expect(mapChatMessageFromDb(dbChat as DbChatMessageRow).content).toBe(chatMsg.content)

    const dbChatWithoutTime: DbChatMessageRow = {
      id: 'msg-2',
      project_id: 'proj-1',
      sender_id: 'usr-2',
      content: 'Hello team',
      timestamp: '',
      created_at: '2026-11-22T20:30:00Z',
    }
    const restoredChat = mapChatMessageFromDb(dbChatWithoutTime)
    expect(restoredChat.timestamp).toBeTruthy()
    expect(restoredChat.content).toBe('Hello team')
  })
})
