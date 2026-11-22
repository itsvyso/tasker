import React, { useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import type { Task } from '../../types'
import { useTaskContext } from '../../context/TaskContext'
import { PriorityBadge, TagBadge } from '../common/Badge'
import { Avatar } from '../common/Avatar'
import { formatDate, isOverdue } from '../../utils/formatters'
import { ShimmerWave } from '../common/ShimmerWave'
import { snappySpring } from '../../utils/motion'
import {
  Calendar,
  CheckSquare,
  MessageSquare,
  Paperclip,
  CheckCircle2,
} from 'lucide-react'

interface TaskCardProps {
  task: Task
  isDragging?: boolean
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, isDragging: propIsDragging }) => {
  const { setSelectedTaskId, users, setFilters, filters } = useTaskContext()
  const [internalDragging, setInternalDragging] = useState(false)

  const isDragging = propIsDragging ?? internalDragging

  const assignee = users.find((u) => u.id === task.assigneeId)
  const completedSubtasks = task.subtasks.filter((s) => s.completed).length
  const totalSubtasks = task.subtasks.length
  const overdue = isOverdue(task.dueDate, task.status)
  const isDone = task.status === 'done'

  // Physics-based 3D tilt
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const mouseXSpring = useSpring(x, { stiffness: 350, damping: 28 })
  const mouseYSpring = useSpring(y, { stiffness: 350, damping: 28 })

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['7deg', '-7deg'])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-7deg', '7deg'])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    x.set(mouseX / rect.width - 0.5)
    y.set(mouseY / rect.height - 0.5)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    setInternalDragging(true)
    x.set(0)
    y.set(0)
    e.dataTransfer.setData('text/plain', task.id)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragEnd = () => {
    setInternalDragging(false)
  }

  return (
    <motion.div
      draggable
      onDragStart={handleDragStart as any}
      onDragEnd={handleDragEnd as any}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => setSelectedTaskId(task.id)}
      whileHover={{
        scale: 1.02,
        boxShadow: '0 0 28px -2px rgba(168, 85, 247, 0.42), 0 12px 22px -4px rgba(0, 0, 0, 0.7)',
        borderColor: 'rgba(168, 85, 247, 0.75)',
      }}
      whileTap={{ scale: 0.98 }}
      animate={
        isDragging
          ? {
              scale: 1.04,
              boxShadow:
                '0 25px 45px -8px rgba(168, 85, 247, 0.45), 0 12px 24px -6px rgba(0, 0, 0, 0.8)',
              borderColor: 'rgba(168, 85, 247, 0.85)',
              opacity: 0.92,
            }
          : {
              scale: 1,
              opacity: 1,
            }
      }
      style={{
        rotateX,
        rotateY,
        transformPerspective: 1000,
        transformStyle: 'preserve-3d',
      }}
      transition={snappySpring}
      className={`group relative bg-[#101016] hover:bg-[#151520] border rounded-xl p-3.5 cursor-pointer select-none transition-colors duration-200 ${
        isDragging
          ? 'shadow-2xl shadow-purple-950/70 border-purple-500 ring-2 ring-purple-500/50'
          : isDone
          ? 'border-emerald-500/25 hover:border-purple-400/60 shadow-md shadow-black/50'
          : 'border-white/[0.08] hover:border-purple-500/60 shadow-md shadow-black/50'
      }`}
    >
      {/* Sleek violet glow shimmer wave across completed cards */}
      {isDone && <ShimmerWave duration={2.4} repeatDelay={3.2} />}

      {/* Top row: Code + Priority */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-mono font-medium text-slate-400 group-hover:text-purple-300 transition-colors">
            {task.taskCode}
          </span>
          {isDone && (
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <PriorityBadge priority={task.priority} />
        </div>
      </div>

      {/* Title */}
      <h4
        className={`text-sm font-semibold leading-snug mb-1.5 line-clamp-2 transition-colors ${
          isDone ? 'text-slate-300 line-through opacity-85 group-hover:text-white' : 'text-slate-100 group-hover:text-white'
        }`}
      >
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
            <motion.div
              initial={false}
              animate={{ width: `${(completedSubtasks / totalSubtasks) * 100}%` }}
              transition={snappySpring}
              className={`h-full ${
                completedSubtasks === totalSubtasks
                  ? 'bg-emerald-400'
                  : 'bg-gradient-to-r from-purple-500 via-violet-500 to-fuchsia-400'
              }`}
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
    </motion.div>
  )
}
