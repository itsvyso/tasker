import type { Task, Project, RoutineItem, ChatMessage } from '../types'

export interface DbTaskRow {
  id: string
  project_id: string
  task_code: string
  title: string
  description?: string | null
  status: Task['status']
  priority: Task['priority']
  assignee_id?: string | null
  creator_id?: string | null
  tags?: string[] | null
  subtasks?: Task['subtasks'] | null
  comments?: Task['comments'] | null
  attachments?: Task['attachments'] | null
  due_date: string
  start_date?: string | null
  estimated_hours?: number | null
  logged_hours?: number | null
  created_at: string
  updated_at: string
  workspace_id?: string | null
}

export interface DbProjectRow {
  id: string
  name: string
  code: string
  description?: string | null
  color?: string | null
  icon?: string | null
  member_ids?: string[] | null
  category?: string | null
  budget?: string | null
  target_date?: string | null
  created_at: string
  workspace_id?: string | null
}

export interface DbRoutineRow {
  id: string
  title: string
  category?: string | null
  target_duration_minutes?: number | null
  streak?: number | null
  completed_today?: boolean | null
  history?: boolean[] | null
  color?: string | null
  workspace_id?: string | null
  user_id?: string | null
}

export interface DbChatMessageRow {
  id: string
  project_id: string
  sender_id: string
  content: string
  timestamp: string
  created_at?: string
  attachments?: string[] | null
  workspace_id?: string | null
}

export const mapTaskFromDb = (row: DbTaskRow): Task => ({
  id: row.id,
  projectId: row.project_id,
  taskCode: row.task_code,
  title: row.title,
  description: row.description || '',
  status: row.status,
  priority: row.priority,
  assigneeId: row.assignee_id || '',
  creatorId: row.creator_id || '',
  tags: Array.isArray(row.tags) ? row.tags : [],
  subtasks: Array.isArray(row.subtasks) ? row.subtasks : [],
  comments: Array.isArray(row.comments) ? row.comments : [],
  attachments: Array.isArray(row.attachments) ? row.attachments : [],
  dueDate: row.due_date,
  startDate: row.start_date || undefined,
  estimatedHours: Number(row.estimated_hours || 0),
  loggedHours: Number(row.logged_hours || 0),
  createdAt: row.created_at,
  updatedAt: row.updated_at,
})

export const mapTaskToDb = (task: Task, workspaceId?: string): DbTaskRow => ({
  id: task.id,
  project_id: task.projectId,
  task_code: task.taskCode,
  title: task.title,
  description: task.description,
  status: task.status,
  priority: task.priority,
  assignee_id: task.assigneeId,
  creator_id: task.creatorId,
  tags: task.tags,
  subtasks: task.subtasks,
  comments: task.comments,
  attachments: task.attachments,
  due_date: task.dueDate,
  start_date: task.startDate || null,
  estimated_hours: task.estimatedHours,
  logged_hours: task.loggedHours,
  created_at: task.createdAt,
  updated_at: task.updatedAt,
  ...(workspaceId ? { workspace_id: workspaceId } : {}),
})

export const mapProjectFromDb = (row: DbProjectRow): Project => ({
  id: row.id,
  name: row.name,
  code: row.code,
  description: row.description || '',
  color: row.color || '#8B5CF6',
  icon: row.icon || 'Folder',
  memberIds: Array.isArray(row.member_ids) ? row.member_ids : [],
  category: row.category || 'Development',
  budget: row.budget || undefined,
  targetDate: row.target_date || '',
  createdAt: row.created_at,
})

export const mapProjectToDb = (proj: Project, workspaceId?: string): DbProjectRow => ({
  id: proj.id,
  name: proj.name,
  code: proj.code,
  description: proj.description,
  color: proj.color,
  icon: proj.icon,
  member_ids: proj.memberIds,
  category: proj.category,
  budget: proj.budget || null,
  target_date: proj.targetDate,
  created_at: proj.createdAt,
  ...(workspaceId ? { workspace_id: workspaceId } : {}),
})

export const mapRoutineFromDb = (row: DbRoutineRow): RoutineItem => ({
  id: row.id,
  title: row.title,
  category: row.category || 'Focus',
  targetDurationMinutes: Number(row.target_duration_minutes || 25),
  streak: Number(row.streak || 0),
  completedToday: Boolean(row.completed_today),
  history: Array.isArray(row.history) ? row.history : [false, false, false, false, false, false, false],
  color: row.color || '#8B5CF6',
})

export const mapRoutineToDb = (routine: RoutineItem, workspaceId?: string, userId?: string): DbRoutineRow => ({
  id: routine.id,
  title: routine.title,
  category: routine.category || 'Focus',
  target_duration_minutes: routine.targetDurationMinutes,
  streak: routine.streak,
  completed_today: routine.completedToday,
  history: routine.history,
  color: routine.color || '#8B5CF6',
  ...(workspaceId ? { workspace_id: workspaceId } : {}),
  ...(userId ? { user_id: userId } : {}),
})

export const mapChatMessageFromDb = (row: DbChatMessageRow): ChatMessage => ({
  id: row.id,
  projectId: row.project_id,
  senderId: row.sender_id,
  content: row.content,
  timestamp: row.timestamp || (row.created_at ? new Date(row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'),
  attachments: Array.isArray(row.attachments) ? row.attachments : undefined,
})

export const mapChatMessageToDb = (msg: ChatMessage, workspaceId?: string): DbChatMessageRow => ({
  id: msg.id,
  project_id: msg.projectId,
  sender_id: msg.senderId,
  content: msg.content,
  timestamp: msg.timestamp,
  attachments: msg.attachments || [],
  ...(workspaceId ? { workspace_id: workspaceId } : {}),
})
