import React, { useState } from 'react'
import { useTaskContext } from '../../context/TaskContext'
import type { Status } from '../../types'
import { TaskCard } from '../tasks/TaskCard'
import { getStatusInfo } from '../../utils/formatters'
import { Plus } from 'lucide-react'

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
    <div className="h-full flex gap-4 overflow-x-auto pb-6 select-none animate-fadeIn">
      {columns.map(({ status, title }) => {
        const columnTasks = filteredTasks.filter((t) => t.status === status)
        const statusInfo = getStatusInfo(status)
        const isOver = dragOverColumn === status

        return (
          <div
            key={status}
            onDragOver={(e) => handleDragOver(e, status)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, status)}
            className={`w-80 shrink-0 flex flex-col bg-[#0B0F1D]/80 rounded-2xl border transition-all duration-200 ${
              isOver
                ? 'border-indigo-500/80 bg-indigo-950/20 shadow-xl shadow-indigo-950/40'
                : 'border-slate-800/80'
            }`}
          >
            {/* Column Header */}
            <div
              className={`p-3.5 border-b border-slate-800/80 flex items-center justify-between border-t-2 rounded-t-2xl ${statusInfo.columnBorder} bg-[#0D1224]`}
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
            <div className="flex-1 p-2.5 space-y-2.5 overflow-y-auto max-h-[calc(100vh-210px)] min-h-[300px]">
              {columnTasks.length === 0 ? (
                <div
                  className={`h-36 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-4 text-center transition-colors ${
                    isOver
                      ? 'border-indigo-500/60 bg-indigo-500/5 text-indigo-300'
                      : 'border-slate-800/60 text-slate-400'
                  }`}
                >
                  <p className="text-xs font-medium">No tasks</p>
                  <p className="text-[10px] mt-0.5">Drag cards here or click +</p>
                </div>
              ) : (
                columnTasks.map((task) => <TaskCard key={task.id} task={task} />)
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
