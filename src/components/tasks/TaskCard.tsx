import React from 'react'
import type { Task } from '../../types'
import { useTaskContext } from '../../context/TaskContext'
import { PriorityBadge, TagBadge } from '../common/Badge'
import { Avatar } from '../common/Avatar'
import { formatDate, isOverdue } from '../../utils/formatters'
import {
  Calendar,
  CheckSquare,
  MessageSquare,
  Paperclip,
} from 'lucide-react'

interface TaskCardProps {
  task: Task
  isDragging?: boolean
}

export const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const { setSelectedTaskId, users, setFilters, filters } = useTaskContext()

  const assignee = users.find((u) => u.id === task.assigneeId)
  const completedSubtasks = task.subtasks.filter((s) => s.completed).length
  const totalSubtasks = task.subtasks.length
  const overdue = isOverdue(task.dueDate, task.status)

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', task.id)
    e.dataTransfer.effectAllowed = 'move'
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={() => setSelectedTaskId(task.id)}
      className="group relative bg-[#0E1424]/90 hover:bg-[#131B30] border border-slate-800/80 hover:border-indigo-500/40 rounded-xl p-3.5 shadow-md shadow-black/40 hover:shadow-indigo-950/20 transition-all duration-200 cursor-pointer select-none"
    >
      {/* Top row: Code + Priority */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-mono font-medium text-slate-400 group-hover:text-indigo-300 transition-colors">
          {task.taskCode}
        </span>
        <div className="flex items-center gap-1.5">
          <PriorityBadge priority={task.priority} />
        </div>
      </div>

      {/* Title */}
      <h4 className="text-sm font-semibold text-slate-100 group-hover:text-white leading-snug mb-1.5 line-clamp-2">
        {task.title}
      </h4>

      {/* Description Snippet */}
      {task.description && (
        <p className="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Tags */}
      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {task.tags.slice(0, 3).map((tag) => (
            <TagBadge
              key={tag}
              tag={tag}
              onClick={(e) => {
                e.stopPropagation()
                setFilters({ tag: filters.tag === tag ? 'all' : tag })
              }}
            />
          ))}
          {task.tags.length > 3 && (
            <span className="text-[10px] text-slate-400 self-center">
              +{task.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Subtasks Progress Bar (if any) */}
      {totalSubtasks > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span className="flex items-center gap-1">
              <CheckSquare className="w-3 h-3 text-slate-400" />
              <span>Subtasks</span>
            </span>
            <span className="font-mono text-[10px]">
              {completedSubtasks}/{totalSubtasks}
            </span>
          </div>
          <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                completedSubtasks === totalSubtasks
                  ? 'bg-emerald-400'
                  : 'bg-gradient-to-r from-indigo-500 to-cyan-400'
              }`}
              style={{ width: `${(completedSubtasks / totalSubtasks) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Card Footer: Due Date, Meta Indicators, Assignee */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 mt-1">
        <div className="flex items-center gap-2.5 text-slate-400">
          {/* Due date */}
          <div
            className={`flex items-center gap-1 text-[11px] font-medium ${
              overdue ? 'text-rose-400 font-semibold' : 'text-slate-400'
            }`}
            title={overdue ? 'Task is overdue!' : `Due ${task.dueDate}`}
          >
            <Calendar className="w-3 h-3" />
            <span>{formatDate(task.dueDate)}</span>
          </div>

          {/* Comments count */}
          {task.comments.length > 0 && (
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <MessageSquare className="w-3 h-3" />
              <span>{task.comments.length}</span>
            </div>
          )}

          {/* Attachments count */}
          {task.attachments.length > 0 && (
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <Paperclip className="w-3 h-3" />
              <span>{task.attachments.length}</span>
            </div>
          )}
        </div>

        {/* Assignee Avatar */}
        <Avatar user={assignee} size="sm" showStatus={true} />
      </div>
    </div>
  )
}
