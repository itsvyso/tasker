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
} from '../types'
import {
  INITIAL_TASKS,
  INITIAL_PROJECTS,
  INITIAL_USERS,
  INITIAL_ACTIVITIES,
  INITIAL_CHAT_MESSAGES,
} from '../mock/initialData'
import { triggerConfetti } from '../utils/confetti'

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
  isCommandPaletteOpen: boolean
  isSidebarCollapsed: boolean
  activities: Activity[]
  chatMessages: ChatMessage[]
  
  // Actions
  setActiveProjectId: (id: string) => void
  setActiveView: (view: ViewMode) => void
  setSelectedTaskId: (id: string | null) => void
  setFilters: (filters: Partial<FilterOptions>) => void
  resetFilters: () => void
  setIsCreateTaskModalOpen: (open: boolean) => void
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
  addAttachment: (taskId: string, file: { name: string; size: string; type: string }) => void
  sendChatMessage: (content: string) => void
  createProject: (project: Omit<Project, 'id' | 'createdAt'>) => Project
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
}

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser] = useState<User>(INITIAL_USERS[0])
  const [users] = useState<User[]>(INITIAL_USERS)

  // Projects state
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROJECTS)
      return saved ? JSON.parse(saved) : INITIAL_PROJECTS
    } catch {
      return INITIAL_PROJECTS
    }
  })

  // Active Project ID
  const [activeProjectId, setActiveProjectIdState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_PROJECT)
      if (saved && projects.some(p => p.id === saved)) return saved
      return projects[0]?.id || 'proj-1'
    } catch {
      return 'proj-1'
    }
  })

  // Tasks state
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TASKS)
      return saved ? JSON.parse(saved) : INITIAL_TASKS
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
      return saved ? JSON.parse(saved) : INITIAL_ACTIVITIES
    } catch {
      return INITIAL_ACTIVITIES
    }
  })

  // Chat messages
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CHAT)
      return saved ? JSON.parse(saved) : INITIAL_CHAT_MESSAGES
    } catch {
      return INITIAL_CHAT_MESSAGES
    }
  })

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [filters, setFiltersState] = useState<FilterOptions>(defaultFilters)
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false)
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

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
    return newTask
  }, [activeProjectId, projects, activeProject, currentUser.id, logActivity])

  const updateTask = useCallback((taskId: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const updated = {
            ...t,
            ...updates,
            updatedAt: new Date().toISOString(),
          }
          return updated
        }
        return t
      })
    )
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
  }, [tasks, selectedTaskId, logActivity])

  const moveTaskStatus = useCallback((taskId: string, newStatus: Status) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          if (t.status === newStatus) return t
          if (newStatus === 'done' && t.status !== 'done') {
            triggerConfetti()
          }
          return {
            ...t,
            status: newStatus,
            updatedAt: new Date().toISOString(),
          }
        }
        return t
      })
    )
    const task = tasks.find((t) => t.id === taskId)
    if (task) {
      const statusLabels: Record<Status, string> = {
        backlog: 'Backlog',
        in_progress: 'In Progress',
        in_review: 'In Review',
        done: 'Done',
      }
      logActivity(`moved to ${statusLabels[newStatus]}`, task.title, taskId)
    }
  }, [tasks, logActivity])

  const toggleSubtask = useCallback((taskId: string, subtaskId: string) => {
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
          return {
            ...t,
            subtasks: updatedSubtasks,
            updatedAt: new Date().toISOString(),
          }
        }
        return t
      })
    )
  }, [])

  const addSubtask = useCallback((taskId: string, title: string) => {
    if (!title.trim()) return
    const newSub: Subtask = {
      id: `sub-${Date.now()}`,
      title: title.trim(),
      completed: false,
    }
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            subtasks: [...t.subtasks, newSub],
            updatedAt: new Date().toISOString(),
          }
        }
        return t
      })
    )
  }, [])

  const deleteSubtask = useCallback((taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            subtasks: t.subtasks.filter((s) => s.id !== subtaskId),
            updatedAt: new Date().toISOString(),
          }
        }
        return t
      })
    )
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
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            comments: [...t.comments, newComm],
            updatedAt: new Date().toISOString(),
          }
        }
        return t
      })
    )
    const task = tasks.find((t) => t.id === taskId)
    if (task) {
      logActivity('commented on', task.title, taskId)
    }
  }, [currentUser.id, tasks, logActivity])

  const addAttachment = useCallback((taskId: string, file: { name: string; size: string; type: string }) => {
    const newAtt: Attachment = {
      id: `att-${Date.now()}`,
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString().split('T')[0],
    }
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            attachments: [...t.attachments, newAtt],
            updatedAt: new Date().toISOString(),
          }
        }
        return t
      })
    )
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
  }, [activeProjectId, currentUser.id])

  const createProject = useCallback((projectData: Omit<Project, 'id' | 'createdAt'>): Project => {
    const newProj: Project = {
      ...projectData,
      id: `proj-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    }
    setProjects((prev) => [...prev, newProj])
    setActiveProjectIdState(newProj.id)
    return newProj
  }, [])

  const resetToMockData = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEYS.TASKS)
      localStorage.removeItem(STORAGE_KEYS.PROJECTS)
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_PROJECT)
      localStorage.removeItem(STORAGE_KEYS.ACTIVITIES)
      localStorage.removeItem(STORAGE_KEYS.CHAT)
    } catch {
      // ignore
    }
    setTasks(INITIAL_TASKS)
    setProjects(INITIAL_PROJECTS)
    setActiveProjectIdState(INITIAL_PROJECTS[0].id)
    setActivities(INITIAL_ACTIVITIES)
    setChatMessages(INITIAL_CHAT_MESSAGES)
    setFiltersState(defaultFilters)
    setSelectedTaskId(null)
  }, [])

  // Keyboard shortcut listener: Cmd/Ctrl+K for search, C for create task
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
        setIsCreateTaskModalOpen(true)
      } else if (e.key === 'Escape') {
        setIsCommandPaletteOpen(false)
        setIsCreateTaskModalOpen(false)
        setSelectedTaskId(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

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
    isCommandPaletteOpen,
    isSidebarCollapsed,
    activities,
    chatMessages,

    setActiveProjectId,
    setActiveView,
    setSelectedTaskId,
    setFilters,
    resetFilters,
    setIsCreateTaskModalOpen,
    setIsCommandPaletteOpen,
    toggleSidebar,
    createTask,
    updateTask,
    deleteTask,
    moveTaskStatus,
    toggleSubtask,
    addSubtask,
    deleteSubtask,
    addComment,
    addAttachment,
    sendChatMessage,
    createProject,
    resetToMockData,
  }

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>
}

export const useTaskContext = () => {
  const context = useContext(TaskContext)
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider')
  }
  return context
}
