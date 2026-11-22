import type { Priority, Status } from '../types'

export const getPriorityInfo = (priority: Priority) => {
  switch (priority) {
    case 'urgent':
      return {
        label: 'Urgent',
        color: 'text-rose-400 bg-rose-500/10 border-rose-500/20 shadow-rose-950/30',
        dot: 'bg-rose-500',
        badge: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
      }
    case 'high':
      return {
        label: 'High',
        color: 'text-amber-400 bg-amber-500/10 border-amber-500/20 shadow-amber-950/30',
        dot: 'bg-amber-500',
        badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      }
    case 'medium':
      return {
        label: 'Medium',
        color: 'text-violet-400 bg-violet-500/10 border-violet-500/20 shadow-violet-950/30',
        dot: 'bg-violet-500',
        badge: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
      }
    case 'low':
      return {
        label: 'Low',
        color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-emerald-950/30',
        dot: 'bg-emerald-500',
        badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      }
  }
}

export const getStatusInfo = (status: Status) => {
  switch (status) {
    case 'backlog':
      return {
        label: 'Backlog',
        color: 'text-slate-400 bg-slate-800/60 border-slate-700/50',
        dot: 'bg-slate-500',
        columnBorder: 'border-t-slate-500',
      }
    case 'in_progress':
      return {
        label: 'In Progress',
        color: 'text-purple-400 bg-purple-500/15 border-purple-500/30',
        dot: 'bg-gradient-to-r from-purple-400 to-violet-400 animate-pulse',
        columnBorder: 'border-t-purple-500',
      }
    case 'in_review':
      return {
        label: 'In Review',
        color: 'text-fuchsia-400 bg-fuchsia-500/15 border-fuchsia-500/30',
        dot: 'bg-fuchsia-400',
        columnBorder: 'border-t-fuchsia-500',
      }
    case 'done':
      return {
        label: 'Done',
        color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30',
        dot: 'bg-emerald-400',
        columnBorder: 'border-t-emerald-500',
      }
  }
}

export const formatDate = (dateString?: string): string => {
  if (!dateString) return ''
  try {
    const [year, month, day] = dateString.split('-').map(Number)
    const date = new Date(year, month - 1, day)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  } catch {
    return dateString
  }
}

export const formatFullDate = (dateString?: string): string => {
  if (!dateString) return ''
  try {
    const [year, month, day] = dateString.split('-').map(Number)
    const date = new Date(year, month - 1, day)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return dateString
  }
}

export const isOverdue = (dueDateString?: string, status?: Status): boolean => {
  if (!dueDateString || status === 'done') return false
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const [year, month, day] = dueDateString.split('-').map(Number)
    const due = new Date(year, month - 1, day)
    return due < today
  } catch {
    return false
  }
}

export const getTagColor = (tag: string) => {
  const hash = tag.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const colors = [
    'text-indigo-300 bg-indigo-500/10 border-indigo-500/25',
    'text-cyan-300 bg-cyan-500/10 border-cyan-500/25',
    'text-violet-300 bg-violet-500/10 border-violet-500/25',
    'text-amber-300 bg-amber-500/10 border-amber-500/25',
    'text-emerald-300 bg-emerald-500/10 border-emerald-500/25',
    'text-fuchsia-300 bg-fuchsia-500/10 border-fuchsia-500/25',
  ]
  return colors[hash % colors.length]
}
