import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'
import type {
  Task,
  Project,
  User,
  Activity,
  ChatMessage,
  ViewMode,
  FilterOptions,
  Status,
  Subtask,
  Attachment,
  RoutineItem,
} from '../types'
import {
  INITIAL_TASKS,
  INITIAL_PROJECTS,
  INITIAL_USERS,
  INITIAL_ACTIVITIES,
  INITIAL_CHAT_MESSAGES,
  INITIAL_ROUTINES,
} from '../mock/initialData'
import { triggerConfetti } from '../utils/confetti'
import {
  getSupabaseClient,
  isSupabaseConfigured,
  type SyncStatus,
  type SupabaseAuthUser,
} from '../lib/supabase'
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
} from '../lib/syncMappers'
import {
  isTauriDesktop,
  checkDesktopUpdates,
  installDesktopUpdate,
  type DesktopUpdateInfo,
} from '../lib/desktopUpdater'

interface TaskContextType {
  currentUser: User
  users: User[]
  projects: Project[]
  activeProjectId: string
  activeProject: Project
  tasks: Task[]
  projectTasks: Task[]
  filteredTasks: Task[]
  activeView: ViewMode
  selectedTaskId: string | null
  selectedTask: Task | null
  filters: FilterOptions
  isCreateTaskModalOpen: boolean
  createTaskModalDefaults: { status?: Status; dueDate?: string } | null
  isCreateProjectModalOpen: boolean
  isCommandPaletteOpen: boolean
  isSidebarCollapsed: boolean
  isMobileSidebarOpen: boolean
  setIsMobileSidebarOpen: (open: boolean) => void
  toggleMobileSidebar: () => void
  activities: Activity[]
  chatMessages: ChatMessage[]
  routines: RoutineItem[]

  // Cloud & Auth State
  syncStatus: SyncStatus
  isCloudEnabled: boolean
  authUser: SupabaseAuthUser | null
  isAuthModalOpen: boolean
  setIsAuthModalOpen: (open: boolean) => void
  isTeamModalOpen: boolean
  setIsTeamModalOpen: (open: boolean) => void
  signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>
  signUpWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  syncNow: () => Promise<void>

  // Desktop Auto-Updater
  isDesktop: boolean
  desktopUpdateInfo: DesktopUpdateInfo | null
  isCheckingUpdate: boolean
  isInstallingUpdate: boolean
  checkForUpdates: () => Promise<DesktopUpdateInfo>
  installUpdate: () => Promise<boolean>

  // Actions
  setActiveProjectId: (id: string) => void
  setActiveView: (view: ViewMode) => void
  setSelectedTaskId: (id: string | null) => void
  setFilters: (filters: Partial<FilterOptions>) => void
  resetFilters: () => void
  setIsCreateTaskModalOpen: (open: boolean) => void
  openCreateTaskModal: (defaults?: { status?: Status; dueDate?: string }) => void
  setIsCreateProjectModalOpen: (open: boolean) => void
  setIsCommandPaletteOpen: (open: boolean) => void
  toggleSidebar: () => void
  createTask: (taskData: {
    title: string
    description: string
    status: Status
    priority: Task['priority']
    assigneeId: string
    tags: string[]
    dueDate: string
    startDate?: string
    estimatedHours: number
    projectId?: string
  }) => Task
  updateTask: (taskId: string, updates: Partial<Task>) => void
  deleteTask: (taskId: string) => void
  moveTaskStatus: (taskId: string, newStatus: Status) => void
  toggleSubtask: (taskId: string, subtaskId: string) => void
  addSubtask: (taskId: string, title: string) => void
  deleteSubtask: (taskId: string, subtaskId: string) => void
  addComment: (taskId: string, content: string) => void
  likeComment: (taskId: string, commentId: string) => void
  addAttachment: (taskId: string, file: { name: string; size: string; type: string }) => void
  deleteAttachment: (taskId: string, attachmentId: string) => void
  sendChatMessage: (content: string) => void
  createProject: (project: Omit<Project, 'id' | 'createdAt'>) => Project
  deleteProject: (projectId: string) => void
  toggleRoutineToday: (routineId: string) => void
  addRoutine: (routine: { title: string; targetDurationMinutes: number; category?: string; color?: string }) => RoutineItem
  deleteRoutine: (routineId: string) => void
  resetRoutinesToDefault: () => void
  resetToMockData: () => void
}

const defaultFilters: FilterOptions = {
  search: '',
  priority: 'all',
  status: 'all',
  assigneeId: 'all',
  tag: 'all',
  sortBy: 'dueDate',
  sortOrder: 'asc',
}

const TaskContext = createContext<TaskContextType | undefined>(undefined)

const STORAGE_KEYS = {
  TASKS: 'taske_tasks_v1',
  PROJECTS: 'taske_projects_v1',
  ACTIVE_PROJECT: 'taske_active_project_v1',
  ACTIVE_VIEW: 'taske_active_view_v1',
  ACTIVITIES: 'taske_activities_v1',
  CHAT: 'taske_chat_v1',
  ROUTINES: 'taske_routines_v1',
}

const safeSupabaseCall = (fn: () => PromiseLike<unknown>) => {
  Promise.resolve()
    .then(fn)
    .catch((err) => {
      console.warn('[Sync] Background sync call failed:', err)
    })
}

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser] = useState<User>(INITIAL_USERS[0])
  const [users] = useState<User[]>(INITIAL_USERS)

  // Cloud & Auth State
  const isCloudEnabled = isSupabaseConfigured()
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(isCloudEnabled ? 'connecting' : 'offline')
  const [authUser, setAuthUser] = useState<SupabaseAuthUser | null>(null)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false)

  // Desktop Auto-Updater
  const isDesktop = isTauriDesktop()
  const [desktopUpdateInfo, setDesktopUpdateInfo] = useState<DesktopUpdateInfo | null>(null)
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false)
  const [isInstallingUpdate, setIsInstallingUpdate] = useState(false)

  const checkForUpdates = useCallback(async (): Promise<DesktopUpdateInfo> => {
    setIsCheckingUpdate(true)
    try {
      const info = await checkDesktopUpdates()
      setDesktopUpdateInfo(info)
      return info
    } finally {
      setIsCheckingUpdate(false)
    }
  }, [])

  const installUpdate = useCallback(async (): Promise<boolean> => {
    setIsInstallingUpdate(true)
    try {
      const success = await installDesktopUpdate()
      return success
    } finally {
      setIsInstallingUpdate(false)
    }
  }, [])

  // Projects state
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROJECTS)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
      return INITIAL_PROJECTS
    } catch {
      return INITIAL_PROJECTS
    }
  })

  // Active Project ID
  const [activeProjectId, setActiveProjectIdState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_PROJECT)
      if (saved && projects.some((p) => p.id === saved)) return saved
      return projects[0]?.id || 'proj-1'
    } catch {
      return 'proj-1'
    }
  })

  // Tasks state
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TASKS)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
      return INITIAL_TASKS
    } catch {
      return INITIAL_TASKS
    }
  })

  // View Mode
  const [activeView, setActiveViewState] = useState<ViewMode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_VIEW) as ViewMode
      return saved || 'dashboard'
    } catch {
      return 'dashboard'
    }
  })

  // Activities state
  const [activities, setActivities] = useState<Activity[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVITIES)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) return parsed
      }
      return INITIAL_ACTIVITIES
    } catch {
      return INITIAL_ACTIVITIES
    }
  })

  // Chat messages
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CHAT)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) return parsed
      }
      return INITIAL_CHAT_MESSAGES
    } catch {
      return INITIAL_CHAT_MESSAGES
    }
  })

  // Routines state
  const [routines, setRoutines] = useState<RoutineItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ROUTINES)
      if (saved !== null) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) return parsed
      }
      return INITIAL_ROUTINES
    } catch {
      return INITIAL_ROUTINES
    }
  })

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [filters, setFiltersState] = useState<FilterOptions>(defaultFilters)
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false)
  const [createTaskModalDefaults, setCreateTaskModalDefaults] = useState<{ status?: Status; dueDate?: string } | null>(null)
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false)
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  const openCreateTaskModal = useCallback((defaults?: { status?: Status; dueDate?: string }) => {
    setCreateTaskModalDefaults(defaults || null)
    setIsCreateTaskModalOpen(true)
  }, [])

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks))
    } catch (e) {
      console.warn('LocalStorage error:', e)
    }
  }, [tasks])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects))
    } catch (e) {
      console.warn('LocalStorage error:', e)
    }
  }, [projects])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities))
    } catch (e) {
      console.warn('LocalStorage error:', e)
    }
  }, [activities])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CHAT, JSON.stringify(chatMessages))
    } catch (e) {
      console.warn('LocalStorage error:', e)
    }
  }, [chatMessages])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ROUTINES, JSON.stringify(routines))
    } catch (e) {
      console.warn('LocalStorage error:', e)
    }
  }, [routines])

  // Remote Supabase initial sync & real-time subscriptions
  const syncNow = useCallback(async () => {
    const client = getSupabaseClient()
    if (!client) {
      setSyncStatus('offline')
      return
    }

    setSyncStatus('syncing')
    try {
      const [projRes, tasksRes, routinesRes, chatRes] = await Promise.all([
        client.from('projects').select('*'),
        client.from('tasks').select('*'),
        client.from('routines').select('*'),
        client.from('chat_messages').select('*').order('created_at', { ascending: true }),
      ])

      const remoteProjects = (projRes.data || []) as DbProjectRow[]
      const remoteTasks = (tasksRes.data || []) as DbTaskRow[]
      const remoteRoutines = (routinesRes.data || []) as DbRoutineRow[]
      const remoteChat = (chatRes.data || []) as DbChatMessageRow[]

      // If remote project table is empty, seed local projects and tasks to cloud
      if (remoteProjects.length === 0 && projects.length > 0) {
        await client.from('projects').insert(projects.map((p) => mapProjectToDb(p)))
        if (tasks.length > 0) {
          await client.from('tasks').insert(tasks.map((t) => mapTaskToDb(t)))
        }
        if (routines.length > 0) {
          await client.from('routines').insert(routines.map((r) => mapRoutineToDb(r)))
        }
        if (chatMessages.length > 0) {
          await client.from('chat_messages').insert(chatMessages.map((m) => mapChatMessageToDb(m)))
        }
      } else {
        if (remoteProjects.length > 0) {
          const mappedProjects = remoteProjects.map(mapProjectFromDb)
          setProjects(mappedProjects)

          setActiveProjectIdState((curr) => {
            if (!mappedProjects.some((p) => p.id === curr)) {
              const fallback = mappedProjects[0].id
              try {
                localStorage.setItem(STORAGE_KEYS.ACTIVE_PROJECT, fallback)
              } catch {
                // ignore
              }
              return fallback
            }
            return curr
          })
        }

        if (remoteTasks.length > 0) {
          setTasks(remoteTasks.map(mapTaskFromDb))
        }

        if (remoteRoutines.length > 0) {
          setRoutines(remoteRoutines.map(mapRoutineFromDb))
        }

        if (remoteChat.length > 0) {
          setChatMessages(remoteChat.map(mapChatMessageFromDb))
        }
      }

      setSyncStatus('synced')
    } catch (err) {
      console.warn('[Sync] Failed remote pull/seed:', err)
      setSyncStatus('error')
    }
  }, [projects, tasks, routines, chatMessages])

  useEffect(() => {
    const client = getSupabaseClient()
    if (!client) {
      return
    }

    // Check auth session
    client.auth.getSession().then(({ data: { session } }) => {
      setAuthUser(session?.user || null)
    })

    const { data: authListener } = client.auth.onAuthStateChange((_event, session) => {
      setAuthUser(session?.user || null)
    })

    // Pull initial remote state
    const syncTimer = setTimeout(() => {
      void syncNow()
    }, 0)

    // Realtime channel
    const channel = client
      .channel('tasker_realtime_sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newTask = mapTaskFromDb(payload.new as DbTaskRow)
            setTasks((prev) => (prev.some((t) => t.id === newTask.id) ? prev : [newTask, ...prev]))
          } else if (payload.eventType === 'UPDATE') {
            const updated = mapTaskFromDb(payload.new as DbTaskRow)
            setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
          } else if (payload.eventType === 'DELETE') {
            const deletedId = (payload.old as { id?: string })?.id
            if (deletedId) {
              setTasks((prev) => prev.filter((t) => t.id !== deletedId))
            }
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'projects' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newProj = mapProjectFromDb(payload.new as DbProjectRow)
            setProjects((prev) => (prev.some((p) => p.id === newProj.id) ? prev : [...prev, newProj]))
          } else if (payload.eventType === 'UPDATE') {
            const updated = mapProjectFromDb(payload.new as DbProjectRow)
            setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
          } else if (payload.eventType === 'DELETE') {
            const deletedId = (payload.old as { id?: string })?.id
            if (deletedId) {
              setProjects((prev) => prev.filter((p) => p.id !== deletedId))
            }
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'routines' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newRoutine = mapRoutineFromDb(payload.new as DbRoutineRow)
            setRoutines((prev) => (prev.some((r) => r.id === newRoutine.id) ? prev : [newRoutine, ...prev]))
          } else if (payload.eventType === 'UPDATE') {
            const updated = mapRoutineFromDb(payload.new as DbRoutineRow)
            setRoutines((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
          } else if (payload.eventType === 'DELETE') {
            const deletedId = (payload.old as { id?: string })?.id
            if (deletedId) {
              setRoutines((prev) => prev.filter((r) => r.id !== deletedId))
            }
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'chat_messages' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newMsg = mapChatMessageFromDb(payload.new as DbChatMessageRow)
            setChatMessages((prev) => (prev.some((m) => m.id === newMsg.id) ? prev : [...prev, newMsg]))
          } else if (payload.eventType === 'DELETE') {
            const deletedId = (payload.old as { id?: string })?.id
            if (deletedId) {
              setChatMessages((prev) => prev.filter((m) => m.id !== deletedId))
            }
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setSyncStatus('synced')
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setSyncStatus('error')
        }
      })

    return () => {
      clearTimeout(syncTimer)
      authListener.subscription.unsubscribe()
      client.removeChannel(channel)
    }
  }, [syncNow])

  const signInWithEmail = useCallback(async (email: string, pass: string) => {
    const client = getSupabaseClient()
    if (!client) {
      return { error: new Error('Supabase is not configured.') }
    }
    const { error } = await client.auth.signInWithPassword({ email, password: pass })
    if (!error) {
      syncNow()
    }
    return { error: error ? new Error(error.message) : null }
  }, [syncNow])

  const signUpWithEmail = useCallback(async (email: string, pass: string) => {
    const client = getSupabaseClient()
    if (!client) {
      return { error: new Error('Supabase is not configured.') }
    }
    const { error } = await client.auth.signUp({ email, password: pass })
    return { error: error ? new Error(error.message) : null }
  }, [])

  const signOut = useCallback(async () => {
    const client = getSupabaseClient()
    if (client) {
      await client.auth.signOut()
    }
    setAuthUser(null)
    setSyncStatus('offline')
  }, [])

  const setActiveProjectId = useCallback((id: string) => {
    setActiveProjectIdState(id)
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_PROJECT, id)
    } catch {
      // ignore
    }
  }, [])

  const setActiveView = useCallback((view: ViewMode) => {
    setActiveViewState(view)
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_VIEW, view)
    } catch {
      // ignore
    }
  }, [])

  const activeProject = useMemo(() => {
    return projects.find((p) => p.id === activeProjectId) || projects[0] || INITIAL_PROJECTS[0]
  }, [projects, activeProjectId])

  const projectTasks = useMemo(() => {
    return tasks.filter((t) => t.projectId === activeProjectId)
  }, [tasks, activeProjectId])

  const selectedTask = useMemo(() => {
    if (!selectedTaskId) return null
    return tasks.find((t) => t.id === selectedTaskId) || null
  }, [tasks, selectedTaskId])

  const filteredTasks = useMemo(() => {
    return projectTasks
      .filter((task) => {
        // Search query
        if (filters.search) {
          const q = filters.search.toLowerCase()
          const matchTitle = task.title.toLowerCase().includes(q)
          const matchDesc = task.description.toLowerCase().includes(q)
          const matchCode = task.taskCode.toLowerCase().includes(q)
          const matchTag = task.tags.some((t) => t.toLowerCase().includes(q))
          if (!matchTitle && !matchDesc && !matchCode && !matchTag) return false
        }
        // Priority
        if (filters.priority !== 'all' && task.priority !== filters.priority) {
          return false
        }
        // Status
        if (filters.status !== 'all' && task.status !== filters.status) {
          return false
        }
        // Assignee
        if (filters.assigneeId !== 'all' && task.assigneeId !== filters.assigneeId) {
          return false
        }
        // Tag
        if (filters.tag !== 'all' && !task.tags.includes(filters.tag)) {
          return false
        }
        return true
      })
      .sort((a, b) => {
        const factor = filters.sortOrder === 'asc' ? 1 : -1
        switch (filters.sortBy) {
          case 'dueDate':
            return (a.dueDate.localeCompare(b.dueDate)) * factor
          case 'priority': {
            const weights = { urgent: 4, high: 3, medium: 2, low: 1 }
            return (weights[b.priority] - weights[a.priority]) * factor
          }
          case 'title':
            return a.title.localeCompare(b.title) * factor
          case 'createdAt':
            return a.createdAt.localeCompare(b.createdAt) * factor
          default:
            return 0
        }
      })
  }, [projectTasks, filters])

  const setFilters = useCallback((newFilters: Partial<FilterOptions>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }))
  }, [])

  const resetFilters = useCallback(() => {
    setFiltersState(defaultFilters)
  }, [])

  const toggleSidebar = useCallback(() => {
    setIsSidebarCollapsed((prev) => !prev)
  }, [])

  const toggleMobileSidebar = useCallback(() => {
    setIsMobileSidebarOpen((prev) => !prev)
  }, [])

  const logActivity = useCallback((action: string, targetTitle: string, taskId?: string) => {
    const newAct: Activity = {
      id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      projectId: activeProjectId,
      taskId,
      userId: currentUser.id,
      action,
      targetTitle,
      timestamp: 'Just now',
    }
    setActivities((prev) => [newAct, ...prev.slice(0, 30)])
  }, [activeProjectId, currentUser.id])

  const createTask = useCallback((taskData: {
    title: string
    description: string
    status: Status
    priority: Task['priority']
    assigneeId: string
    tags: string[]
    dueDate: string
    startDate?: string
    estimatedHours: number
    projectId?: string
  }): Task => {
    const targetProjId = taskData.projectId || activeProjectId
    const proj = projects.find((p) => p.id === targetProjId) || activeProject
    const codeNum = Math.floor(100 + Math.random() * 900)
    const taskCode = `${proj.code}-${codeNum}`
    const now = new Date().toISOString()

    const newTask: Task = {
      id: `task-${Date.now()}`,
      projectId: targetProjId,
      taskCode,
      title: taskData.title.trim(),
      description: taskData.description.trim(),
      status: taskData.status,
      priority: taskData.priority,
      assigneeId: taskData.assigneeId,
      creatorId: currentUser.id,
      tags: taskData.tags,
      subtasks: [],
      comments: [],
      attachments: [],
      dueDate: taskData.dueDate,
      startDate: taskData.startDate || taskData.dueDate,
      estimatedHours: taskData.estimatedHours || 0,
      loggedHours: 0,
      createdAt: now,
      updatedAt: now,
    }

    setTasks((prev) => [newTask, ...prev])
    logActivity('created task', newTask.title, newTask.id)

    // Remote sync
    const client = getSupabaseClient()
    if (client) {
      safeSupabaseCall(() => client.from('tasks').insert(mapTaskToDb(newTask)))
    }

    return newTask
  }, [activeProjectId, projects, activeProject, currentUser.id, logActivity])

  const updateTask = useCallback((taskId: string, updates: Partial<Task>) => {
    let updatedTask: Task | null = null
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const updated = {
            ...t,
            ...updates,
            updatedAt: new Date().toISOString(),
          }
          updatedTask = updated
          return updated
        }
        return t
      })
    )

    const client = getSupabaseClient()
    if (client && updatedTask) {
      const payload = mapTaskToDb(updatedTask)
      safeSupabaseCall(() => client.from('tasks').update(payload).eq('id', taskId))
    }
  }, [])

  const deleteTask = useCallback((taskId: string) => {
    const task = tasks.find((t) => t.id === taskId)
    setTasks((prev) => prev.filter((t) => t.id !== taskId))
    if (selectedTaskId === taskId) {
      setSelectedTaskId(null)
    }
    if (task) {
      logActivity('deleted task', task.title)
    }

    const client = getSupabaseClient()
    if (client) {
      safeSupabaseCall(() => client.from('tasks').delete().eq('id', taskId))
    }
  }, [tasks, selectedTaskId, logActivity])

  const moveTaskStatus = useCallback((taskId: string, newStatus: Status) => {
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return

    let updatedTask: Task | null = null
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          if (t.status === newStatus) return t
          if (newStatus === 'done' && t.status !== 'done') {
            triggerConfetti()
          }
          const updated = {
            ...t,
            status: newStatus,
            updatedAt: new Date().toISOString(),
          }
          updatedTask = updated
          return updated
        }
        return t
      })
    )

    if (task.status !== newStatus) {
      const statusLabels: Record<Status, string> = {
        backlog: 'Backlog',
        in_progress: 'In Progress',
        in_review: 'In Review',
        done: 'Done',
      }
      logActivity(`moved to ${statusLabels[newStatus]}`, task.title, taskId)
    }

    const client = getSupabaseClient()
    if (client && updatedTask) {
      const payload = mapTaskToDb(updatedTask)
      safeSupabaseCall(() => client.from('tasks').update(payload).eq('id', taskId))
    }
  }, [tasks, logActivity])

  const toggleSubtask = useCallback((taskId: string, subtaskId: string) => {
    let updatedTask: Task | null = null
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const updatedSubtasks = t.subtasks.map((s) => {
            if (s.id === subtaskId) {
              const nextVal = !s.completed
              if (nextVal && t.subtasks.filter((st) => st.id !== subtaskId && !st.completed).length === 0) {
                // If this was the last pending subtask, celebrate!
                triggerConfetti()
              }
              return { ...s, completed: nextVal }
            }
            return s
          })
          const updated = {
            ...t,
            subtasks: updatedSubtasks,
            updatedAt: new Date().toISOString(),
          }
          updatedTask = updated
          return updated
        }
        return t
      })
    )

    const client = getSupabaseClient()
    if (client && updatedTask) {
      const payload = mapTaskToDb(updatedTask)
      safeSupabaseCall(() => client.from('tasks').update(payload).eq('id', taskId))
    }
  }, [])

  const addSubtask = useCallback((taskId: string, title: string) => {
    if (!title.trim()) return
    const newSub: Subtask = {
      id: `sub-${Date.now()}`,
      title: title.trim(),
      completed: false,
    }
    let updatedTask: Task | null = null
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const updated = {
            ...t,
            subtasks: [...t.subtasks, newSub],
            updatedAt: new Date().toISOString(),
          }
          updatedTask = updated
          return updated
        }
        return t
      })
    )

    const client = getSupabaseClient()
    if (client && updatedTask) {
      const payload = mapTaskToDb(updatedTask)
      safeSupabaseCall(() => client.from('tasks').update(payload).eq('id', taskId))
    }
  }, [])

  const deleteSubtask = useCallback((taskId: string, subtaskId: string) => {
    let updatedTask: Task | null = null
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const updated = {
            ...t,
            subtasks: t.subtasks.filter((s) => s.id !== subtaskId),
            updatedAt: new Date().toISOString(),
          }
          updatedTask = updated
          return updated
        }
        return t
      })
    )

    const client = getSupabaseClient()
    if (client && updatedTask) {
      const payload = mapTaskToDb(updatedTask)
      safeSupabaseCall(() => client.from('tasks').update(payload).eq('id', taskId))
    }
  }, [])

  const addComment = useCallback((taskId: string, content: string) => {
    if (!content.trim()) return
    const newComm = {
      id: `comm-${Date.now()}`,
      authorId: currentUser.id,
      content: content.trim(),
      createdAt: new Date().toISOString(),
      likes: 0,
    }
    let updatedTask: Task | null = null
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const updated = {
            ...t,
            comments: [...t.comments, newComm],
            updatedAt: new Date().toISOString(),
          }
          updatedTask = updated
          return updated
        }
        return t
      })
    )
    const task = tasks.find((t) => t.id === taskId)
    if (task) {
      logActivity('commented on', task.title, taskId)
    }

    const client = getSupabaseClient()
    if (client && updatedTask) {
      const payload = mapTaskToDb(updatedTask)
      safeSupabaseCall(() => client.from('tasks').update(payload).eq('id', taskId))
    }
  }, [currentUser.id, tasks, logActivity])

  const likeComment = useCallback((taskId: string, commentId: string) => {
    let updatedTask: Task | null = null
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const updated = {
            ...t,
            comments: t.comments.map((c) =>
              c.id === commentId ? { ...c, likes: c.likes + 1 } : c
            ),
            updatedAt: new Date().toISOString(),
          }
          updatedTask = updated
          return updated
        }
        return t
      })
    )

    const client = getSupabaseClient()
    if (client && updatedTask) {
      const payload = mapTaskToDb(updatedTask)
      safeSupabaseCall(() => client.from('tasks').update(payload).eq('id', taskId))
    }
  }, [])

  const addAttachment = useCallback((taskId: string, file: { name: string; size: string; type: string }) => {
    const newAtt: Attachment = {
      id: `att-${Date.now()}`,
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString().split('T')[0],
    }
    let updatedTask: Task | null = null
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const updated = {
            ...t,
            attachments: [...t.attachments, newAtt],
            updatedAt: new Date().toISOString(),
          }
          updatedTask = updated
          return updated
        }
        return t
      })
    )

    const client = getSupabaseClient()
    if (client && updatedTask) {
      const payload = mapTaskToDb(updatedTask)
      safeSupabaseCall(() => client.from('tasks').update(payload).eq('id', taskId))
    }
  }, [])

  const deleteAttachment = useCallback((taskId: string, attachmentId: string) => {
    let updatedTask: Task | null = null
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const updated = {
            ...t,
            attachments: t.attachments.filter((a) => a.id !== attachmentId),
            updatedAt: new Date().toISOString(),
          }
          updatedTask = updated
          return updated
        }
        return t
      })
    )

    const client = getSupabaseClient()
    if (client && updatedTask) {
      const payload = mapTaskToDb(updatedTask)
      safeSupabaseCall(() => client.from('tasks').update(payload).eq('id', taskId))
    }
  }, [])

  const sendChatMessage = useCallback((content: string) => {
    if (!content.trim()) return
    const newMsg: ChatMessage = {
      id: `chat-${Date.now()}`,
      projectId: activeProjectId,
      senderId: currentUser.id,
      content: content.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
    setChatMessages((prev) => [...prev, newMsg])

    const client = getSupabaseClient()
    if (client) {
      safeSupabaseCall(() => client.from('chat_messages').insert(mapChatMessageToDb(newMsg)))
    }
  }, [activeProjectId, currentUser.id])

  const createProject = useCallback((projectData: Omit<Project, 'id' | 'createdAt'>): Project => {
    const newProj: Project = {
      ...projectData,
      id: `proj-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    }
    setProjects((prev) => [...prev, newProj])
    setActiveProjectIdState(newProj.id)
    logActivity('created project', newProj.name)

    const client = getSupabaseClient()
    if (client) {
      safeSupabaseCall(() => client.from('projects').insert(mapProjectToDb(newProj)))
    }

    return newProj
  }, [logActivity])

  const deleteProject = useCallback((projectId: string) => {
    setProjects((prev) => {
      const remaining = prev.filter((p) => p.id !== projectId)
      if (remaining.length === 0) return INITIAL_PROJECTS
      if (activeProjectId === projectId) {
        setActiveProjectIdState(remaining[0].id)
      }
      return remaining
    })
    setTasks((prev) => prev.filter((t) => t.projectId !== projectId))

    const client = getSupabaseClient()
    if (client) {
      safeSupabaseCall(() => client.from('projects').delete().eq('id', projectId))
    }
  }, [activeProjectId])

  const toggleRoutineToday = useCallback((routineId: string) => {
    let updatedRoutine: RoutineItem | null = null
    setRoutines((prev) =>
      prev.map((r) => {
        if (r.id !== routineId) return r
        const nextCompleted = !r.completedToday
        const updatedHistory =
          Array.isArray(r.history) && r.history.length === 7
            ? [...r.history]
            : [false, false, false, false, false, false, false]
        updatedHistory[6] = nextCompleted
        const nextStreak = nextCompleted ? r.streak + 1 : Math.max(0, r.streak - 1)
        if (nextCompleted) {
          triggerConfetti()
        }
        const updated = {
          ...r,
          completedToday: nextCompleted,
          streak: nextStreak,
          history: updatedHistory,
        }
        updatedRoutine = updated
        return updated
      })
    )

    const client = getSupabaseClient()
    if (client && updatedRoutine) {
      const payload = mapRoutineToDb(updatedRoutine)
      safeSupabaseCall(() => client.from('routines').update(payload).eq('id', routineId))
    }
  }, [])

  const addRoutine = useCallback(
    (routineData: { title: string; targetDurationMinutes: number; category?: string; color?: string }) => {
      const sanitizedDuration = Math.min(
        240,
        Math.max(5, Math.abs(Number(routineData.targetDurationMinutes)) || 25)
      )
      const sanitizedTitle = routineData.title.trim().slice(0, 80)
      const newRoutine: RoutineItem = {
        id: `routine-${Date.now()}`,
        title: sanitizedTitle,
        category: routineData.category?.trim().slice(0, 40) || 'General',
        targetDurationMinutes: sanitizedDuration,
        streak: 0,
        completedToday: false,
        history: [false, false, false, false, false, false, false],
        color: routineData.color || '#A855F7',
      }
      setRoutines((prev) => [newRoutine, ...prev])

      const client = getSupabaseClient()
      if (client) {
        safeSupabaseCall(() => client.from('routines').insert(mapRoutineToDb(newRoutine)))
      }

      return newRoutine
    },
    []
  )

  const deleteRoutine = useCallback((routineId: string) => {
    setRoutines((prev) => prev.filter((r) => r.id !== routineId))

    const client = getSupabaseClient()
    if (client) {
      safeSupabaseCall(() => client.from('routines').delete().eq('id', routineId))
    }
  }, [])

  const resetRoutinesToDefault = useCallback(() => {
    setRoutines(INITIAL_ROUTINES)
  }, [])

  const resetToMockData = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEYS.TASKS)
      localStorage.removeItem(STORAGE_KEYS.PROJECTS)
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_PROJECT)
      localStorage.removeItem(STORAGE_KEYS.ACTIVITIES)
      localStorage.removeItem(STORAGE_KEYS.CHAT)
      localStorage.removeItem(STORAGE_KEYS.ROUTINES)
    } catch {
      // ignore
    }
    setTasks(INITIAL_TASKS)
    setProjects(INITIAL_PROJECTS)
    setActiveProjectIdState(INITIAL_PROJECTS[0].id)
    setActivities(INITIAL_ACTIVITIES)
    setChatMessages(INITIAL_CHAT_MESSAGES)
    setRoutines(INITIAL_ROUTINES)
    setFiltersState(defaultFilters)
    setSelectedTaskId(null)
  }, [])

  // Keyboard shortcut listener: Cmd/Ctrl+K for search, C for create task, 1-7 for view switching
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is actively typing in an input or textarea
      const target = e.target as HTMLElement
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable) {
        return
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setIsCommandPaletteOpen((prev) => !prev)
      } else if (e.key.toLowerCase() === 'c' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault()
        openCreateTaskModal()
      } else if (e.key === '1' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault()
        setActiveView('dashboard')
      } else if (e.key === '2' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault()
        setActiveView('kanban')
      } else if (e.key === '3' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault()
        setActiveView('table')
      } else if (e.key === '4' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault()
        setActiveView('calendar')
      } else if (e.key === '5' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault()
        setActiveView('timeline')
      } else if (e.key === '6' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault()
        setActiveView('team_chat')
      } else if (e.key === '7' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault()
        setActiveView('routines')
      } else if (e.key === 'Escape') {
        setIsCommandPaletteOpen(false)
        setIsCreateTaskModalOpen(false)
        setIsCreateProjectModalOpen(false)
        setSelectedTaskId(null)
        setIsAuthModalOpen(false)
        setIsTeamModalOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [openCreateTaskModal, setActiveView])

  const value = {
    currentUser,
    users,
    projects,
    activeProjectId,
    activeProject,
    tasks,
    projectTasks,
    filteredTasks,
    activeView,
    selectedTaskId,
    selectedTask,
    filters,
    isCreateTaskModalOpen,
    createTaskModalDefaults,
    isCreateProjectModalOpen,
    isCommandPaletteOpen,
    isSidebarCollapsed,
    activities,
    chatMessages,
    routines,

    // Cloud & Auth
    syncStatus,
    isCloudEnabled,
    authUser,
    isAuthModalOpen,
    setIsAuthModalOpen,
    isTeamModalOpen,
    setIsTeamModalOpen,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    syncNow,

    // Desktop Auto-Updater
    isDesktop,
    desktopUpdateInfo,
    isCheckingUpdate,
    isInstallingUpdate,
    checkForUpdates,
    installUpdate,

    // Actions
    setActiveProjectId,
    setActiveView,
    setSelectedTaskId,
    setFilters,
    resetFilters,
    setIsCreateTaskModalOpen,
    openCreateTaskModal,
    setIsCreateProjectModalOpen,
    setIsCommandPaletteOpen,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
    toggleMobileSidebar,
    toggleSidebar,
    createTask,
    updateTask,
    deleteTask,
    moveTaskStatus,
    toggleSubtask,
    addSubtask,
    deleteSubtask,
    addComment,
    likeComment,
    addAttachment,
    deleteAttachment,
    sendChatMessage,
    createProject,
    deleteProject,
    toggleRoutineToday,
    addRoutine,
    deleteRoutine,
    resetRoutinesToDefault,
    resetToMockData,
  }

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>
}

// oxlint-disable-next-line react/only-export-components
export const useTaskContext = () => {
  const context = useContext(TaskContext)
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider')
  }
  return context
}
