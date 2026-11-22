export type Priority = 'urgent' | 'high' | 'medium' | 'low'

export type Status = 'backlog' | 'in_progress' | 'in_review' | 'done'

export type UserStatus = 'online' | 'busy' | 'away' | 'offline'

export interface User {
  id: string
  name: string
  email: string
  avatar: string
  role: string
  status: UserStatus
}

export interface Subtask {
  id: string
  title: string
  completed: boolean
}

export interface Attachment {
  id: string
  name: string
  size: string
  type: string
  uploadedAt: string
}

export interface Comment {
  id: string
  authorId: string
  content: string
  createdAt: string
  likes: number
}

export interface Task {
  id: string
  projectId: string
  taskCode: string
  title: string
  description: string
  status: Status
  priority: Priority
  assigneeId: string
  creatorId: string
  tags: string[]
  subtasks: Subtask[]
  comments: Comment[]
  attachments: Attachment[]
  dueDate: string // YYYY-MM-DD
  startDate?: string // YYYY-MM-DD
  estimatedHours: number
  loggedHours: number
  createdAt: string
  updatedAt: string
}

export interface Project {
  id: string
  name: string
  code: string
  description: string
  color: string
  icon: string
  memberIds: string[]
  category: string
  budget?: string
  targetDate: string
  createdAt: string
}

export interface Activity {
  id: string
  projectId: string
  taskId?: string
  userId: string
  action: string
  targetTitle: string
  timestamp: string
}

export interface ChatMessage {
  id: string
  projectId: string
  senderId: string
  content: string
  timestamp: string
  attachments?: string[]
}

export type ViewMode = 'dashboard' | 'kanban' | 'table' | 'calendar' | 'timeline' | 'team_chat' | 'routines'

export interface RoutineItem {
  id: string
  title: string
  category?: string
  targetDurationMinutes: number
  streak: number
  completedToday: boolean
  history: boolean[] // 7-day completion history (Mon-Sun)
  color?: string
}

export interface RoutineScheduleBlock {
  id: string
  title: string
  duration: string
  hours: number
  progress: number // 0 to 100
  status: 'In Test' | 'Reviewed' | 'Complete'
  assigneeId: string
  startTime: string
  dayIndex: number
  category: string
}

export interface FilterOptions {
  search: string
  priority: Priority | 'all'
  status: Status | 'all'
  assigneeId: string | 'all'
  tag: string | 'all'
  sortBy: 'dueDate' | 'priority' | 'title' | 'createdAt'
  sortOrder: 'asc' | 'desc'
}
