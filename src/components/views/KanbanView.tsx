import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { useTaskContext } from '../../context/TaskContext'
import type { Status } from '../../types'
import { TaskCard } from '../tasks/TaskCard'
import { getStatusInfo } from '../../utils/formatters'
import { createStaggerContainer, staggerItem } from '../../utils/motion'
import { Plus, FolderPlus } from 'lucide-react'

const boardVariants = createStaggerContainer(0.04, 0.02)
const columnCardsVariants = createStaggerContainer(0.03, 0.01)

export const KanbanView: React.FC = () => {
  const { filteredTasks, moveTaskStatus, openCreateTaskModal, projects, setIsCreateProjectModalOpen } = useTaskContext()
  const [dragOverColumn, setDragOverColumn] = useState<Status | null>(null)
  const [activeMobileColumn, setActiveMobileColumn] = useState<Status>('in_progress')
  const columnRefs = useRef<Record<string, HTMLDivElement | null>>({})

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] py-16 px-4 text-center max-w-md mx-auto select-none">
        <div className="w-14 h-14 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center mb-4 text-purple-400">
          <FolderPlus className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">No Projects Yet</h3>
        <p className="text-xs text-slate-400 mb-6">
          Create your first project to organize tasks across Kanban workflow stages.
        </p>
        <button
          onClick={() => setIsCreateProjectModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/30 flex items-center gap-2 transition-all cursor-pointer"
        >
          <FolderPlus className="w-4 h-4" />
          <span>Create your first project</span>
        </button>
      </div>
    )
  }

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

  const scrollToColumn = (status: Status) => {
    setActiveMobileColumn(status)
    const el = columnRefs.current[status]
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }
  }

  return (
    <div className="space-y-3">
      {/* Mobile Column Quick-Jump Pills */}
      <div className="flex sm:hidden items-center gap-1.5 overflow-x-auto momentum-scroll no-scrollbar pb-1 select-none">
        {columns.map(({ status, title }) => {
          const count = filteredTasks.filter((t) => t.status === status).length
          const statusInfo = getStatusInfo(status)
          const isCurrent = activeMobileColumn === status
          return (
            <button
              key={`pill-${status}`}
              onClick={() => scrollToColumn(status)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs whitespace-nowrap transition-all min-h-[38px] ${
                isCurrent
                  ? 'bg-purple-600/30 text-purple-200 border border-purple-500/50 shadow-sm shadow-purple-900/30 font-bold'
                  : 'bg-slate-900/90 border border-slate-800 text-slate-400 active:bg-slate-800'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${statusInfo.dot}`} />
              <span>{title} Lane</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                  isCurrent ? 'bg-purple-900/60 text-purple-200' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      <motion.div
        variants={boardVariants}
        initial="hidden"
        animate="visible"
        className="h-full flex gap-3 sm:gap-4 overflow-x-auto pb-6 select-none snap-x snap-mandatory momentum-scroll scroll-smooth px-1"
      >
        {columns.map(({ status, title }) => {
          const columnTasks = filteredTasks.filter((t) => t.status === status)
          const statusInfo = getStatusInfo(status)
          const isOver = dragOverColumn === status

          return (
            <motion.div
              key={status}
              ref={(el) => {
                columnRefs.current[status] = el
              }}
              variants={staggerItem}
              onDragOver={(e) => handleDragOver(e, status)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, status)}
              className={`w-[85vw] max-w-[340px] sm:w-80 shrink-0 snap-center sm:snap-align-none flex flex-col bg-[#0D0D12]/90 border rounded-2xl transition-all duration-200 ${
                isOver
                  ? 'border-purple-500/80 bg-purple-950/20 shadow-xl shadow-purple-950/40 ring-1 ring-purple-500/30'
                  : 'border-white/[0.08] hover:border-slate-700/80'
              }`}
            >
              {/* Column Header */}
              <div
                className={`p-3 sm:p-3.5 border-b border-slate-800/80 flex items-center justify-between border-t-2 rounded-t-2xl ${statusInfo.columnBorder} bg-[#101018]`}
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
                    aria-label={`Add Task to ${title}`}
                    className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-xl transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Column Cards Container */}
              <motion.div
                variants={columnCardsVariants}
                className="flex-1 p-2.5 space-y-2.5 overflow-y-auto momentum-scroll max-h-[calc(100dvh-280px)] sm:max-h-[calc(100vh-220px)] min-h-[260px]"
              >
                {columnTasks.length === 0 ? (
                  <div className="h-40 flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-800/80 rounded-xl">
                    <p className="text-xs text-slate-400 font-medium">No tasks in {title}</p>
                    <button
                      onClick={() => openCreateTaskModal({ status })}
                      className="mt-2 text-[11px] text-purple-400 hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Create one
                    </button>
                  </div>
                ) : (
                  columnTasks.map((task) => <TaskCard key={task.id} task={task} />)
                )}
              </motion.div>
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}
export default KanbanView
