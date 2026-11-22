import React from 'react'
import type { Priority, Status } from '../../types'
import { getPriorityInfo, getStatusInfo, getTagColor } from '../../utils/formatters'
import { AlertCircle, Clock, CheckCircle2, CircleDashed } from 'lucide-react'

interface PriorityBadgeProps {
  priority: Priority
  showIcon?: boolean
  className?: string
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, showIcon = true, className = '' }) => {
  const info = getPriorityInfo(priority)

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border ${info.badge} ${className}`}
    >
      {showIcon && <span className={`w-1.5 h-1.5 rounded-full ${info.dot}`} />}
      {info.label}
    </span>
  )
}

interface StatusBadgeProps {
  status: Status
  showIcon?: boolean
  className?: string
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, showIcon = true, className = '' }) => {
  const info = getStatusInfo(status)

  const renderIcon = () => {
    switch (status) {
      case 'backlog':
        return <CircleDashed className="w-3 h-3 text-slate-400" />
      case 'in_progress':
        return <Clock className="w-3 h-3 text-sky-400" />
      case 'in_review':
        return <AlertCircle className="w-3 h-3 text-purple-400" />
      case 'done':
        return <CheckCircle2 className="w-3 h-3 text-emerald-400" />
    }
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${info.color} ${className}`}
    >
      {showIcon && renderIcon()}
      {info.label}
    </span>
  )
}

interface TagBadgeProps {
  tag: string
  className?: string
  onClick?: (e: React.MouseEvent) => void
}

export const TagBadge: React.FC<TagBadgeProps> = ({ tag, className = '', onClick }) => {
  const colorClass = getTagColor(tag)

  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${colorClass} ${
        onClick ? 'cursor-pointer hover:brightness-125 transition-all' : ''
      } ${className}`}
    >
      #{tag}
    </span>
  )
}
