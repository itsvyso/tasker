import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useTaskContext } from '../../context/TaskContext'
import type { Status } from '../../types'
import { TaskCard } from '../tasks/TaskCard'
import { getStatusInfo } from '../../utils/formatters'
import { createStaggerContainer, staggerItem } from '../../utils/motion'
import { Plus } from 'lucide-react'

const boardVariants = createStaggerContainer(0.04, 0.02)
const columnCardsVariants = createStaggerContainer(0.03, 0.01)

export const KanbanView: React.FC = () => {
  const { filteredTasks, moveTaskStatus, openCreateTaskModal } = useTaskContext()
  const [dragOverColumn, setDragOverColumn] = useState<Status | null>(null)

  const columns: { status: Status; title: string }[] = [
    { status: 'backlog', title: 'Backlog' },
    { status: 'in_progress', title: 'In Progress' },
    { status: 'in_review', title: 'In Review' },
    { status: 'done', title: 'Done' },
  ]

  const handleDragOver = (e: React.DragEvent, status: Status) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dragOverColumn !== status) {
      setDragOverColumn(status)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverColumn(null)
    }
  }

  const handleDrop = (e: React.DragEvent, status: Status) => {
    e.preventDefault()
    const taskId = e.dataTransfer.getData('text/plain')
    if (taskId) {
      moveTaskStatus(taskId, status)
    }
    setDragOverColumn(null)
  }

  return (
    <motion.div
      variants={boardVariants}
      initial="hidden"
      animate="visible"
      className="h-full flex gap-4 overflow-x-auto pb-6 select-none"
    >
      {columns.map(({ status, title }) => {
        const columnTasks = filteredTasks.filter((t) => t.status === status)
        const statusInfo = getStatusInfo(status)
        const isOver = dragOverColumn === status

        return (
          <motion.div
            key={status}
            variants={staggerItem}
            onDragOver={(e) => handleDragOver(e, status)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, status)}
            className={`w-80 shrink-0 flex flex-col bg-[#0D0D12]/90 border rounded-2xl transition-all duration-200 ${
              isOver
                ? 'border-purple-500/80 bg-purple-950/20 shadow-xl shadow-purple-950/40 ring-1 ring-purple-500/30'
                : 'border-white/[0.08] hover:border-slate-700/80'
            }`}
          >
            {/* Column Header */}
            <div
              className={`p-3.5 border-b border-slate-800/80 flex items-center justify-between border-t-2 rounded-t-2xl ${statusInfo.columnBorder} bg-[#101018]`}
            >
              <div className="flex items-center gap-2.5">
                <span className={`w-2 h-2 rounded-full ${statusInfo.dot}`} />
                <h3 className="text-xs font-bold text-slate-100 tracking-tight">{title}</h3>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-800 text-slate-300 border border-slate-700/60">
                  {columnTasks.length}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => openCreateTaskModal({ status })}
                  title={`Add Task to ${title}`}
                  className="p-1 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Column Cards Container */}
            <motion.div
              variants={columnCardsVariants}
              className="flex-1 p-2.5 space-y-2.5 overflow-y-auto max-h-[calc(100vh-210px)] min-h-[300px]"
            >
              {columnTasks.length === 0 ? (
                <div
                  className={`h-36 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-4 text-center transition-colors ${
                    isOver
                      ? 'border-purple-500/60 bg-purple-500/5 text-purple-300'
                      : 'border-slate-800/60 text-slate-400'
                  }`}
                >
                  <p className="text-xs font-medium">No tasks</p>
                  <p className="text-[10px] mt-0.5">Drag cards here or click +</p>
                </div>
              ) : (
                columnTasks.map((task) => (
                  <motion.div key={task.id} variants={staggerItem}>
                    <TaskCard task={task} />
                  </motion.div>
                ))
              )}
            </motion.div>
          </motion.div>
        )
      })}
    </motion.div>
  )
}
