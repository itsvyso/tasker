import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useTaskContext } from '../../context/TaskContext'
import type { Status, Priority } from '../../types'
import { Avatar } from '../common/Avatar'
import { formatDate, isOverdue } from '../../utils/formatters'
import { createStaggerContainer, staggerRow, snappySpring } from '../../utils/motion'
import { AnimatedCounter } from '../common/AnimatedCounter'
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  Trash2,
  FolderPlus,
} from 'lucide-react'

const tableBodyVariants = createStaggerContainer(0.035, 0.01)

export const TableView: React.FC = () => {
  const {
    filteredTasks,
    activeProjectId,
    projects,
    setIsCreateProjectModalOpen,
    setSelectedTaskId,
    updateTask,
    deleteTask,
    moveTaskStatus,
    users,
    filters,
    setFilters,
  } = useTaskContext()

  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([])
  const [prevProjectId, setPrevProjectId] = useState(activeProjectId)

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] py-16 px-4 text-center max-w-md mx-auto select-none">
        <div className="w-14 h-14 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center mb-4 text-purple-400">
          <FolderPlus className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">No Projects Yet</h3>
        <p className="text-xs text-slate-400 mb-6">
          Create your first project to organize tasks in dense table view.
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

  // Clear selections when project changes to prevent cross-project batch mutations
  if (prevProjectId !== activeProjectId) {
    setPrevProjectId(activeProjectId)
    setSelectedTaskIds([])
  }

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedTaskIds(filteredTasks.map((t) => t.id))
    } else {
      setSelectedTaskIds([])
    }
  }

  const handleSelectRow = (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation()
    setSelectedTaskIds((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    )
  }

  const handleBatchMarkDone = () => {
    selectedTaskIds.forEach((id) => moveTaskStatus(id, 'done'))
    setSelectedTaskIds([])
  }

  const handleBatchDelete = () => {
    selectedTaskIds.forEach((id) => deleteTask(id))
    setSelectedTaskIds([])
  }

  const handleSort = (column: 'dueDate' | 'priority' | 'title' | 'createdAt') => {
    if (filters.sortBy === column) {
      setFilters({ sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' })
    } else {
      setFilters({ sortBy: column, sortOrder: 'asc' })
    }
  }

  const renderSortIcon = (column: 'dueDate' | 'priority' | 'title' | 'createdAt') => {
    if (filters.sortBy !== column) {
      return <ArrowUpDown className="w-3 h-3 text-slate-500" />
    }
    return filters.sortOrder === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-purple-400 font-bold" />
    ) : (
      <ArrowDown className="w-3 h-3 text-purple-400 font-bold" />
    )
  }

  return (
    <div className="space-y-4 select-none">
      {/* Batch Actions Bar (visible if 1+ selected) */}
      {selectedTaskIds.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={snappySpring}
          className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-950/90 via-violet-950/80 to-purple-950/90 border border-purple-500/40 shadow-xl shadow-purple-950/40 text-xs shadow-lg"
        >
          <span className="font-semibold text-purple-200">
            {selectedTaskIds.length} {selectedTaskIds.length === 1 ? 'task' : 'tasks'} selected
          </span>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleBatchMarkDone}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium flex items-center gap-1.5 transition-colors min-h-[40px]"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Mark Done
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleBatchDelete}
              className="px-3.5 py-2 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white font-medium flex items-center gap-1.5 transition-colors min-h-[40px]"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Selected
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Table Container */}
      <div className="overflow-x-auto momentum-scroll rounded-2xl border border-white/[0.08] bg-[#0E0E14]/90 shadow-xl">
        <table className="w-full text-left text-xs text-slate-300 divide-y divide-slate-800/80">
          <thead className="bg-[#0D0D12] text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            <tr>
              <th className="py-3.5 pl-4 pr-2 w-8">
                <input
                  type="checkbox"
                  checked={
                    filteredTasks.length > 0 &&
                    selectedTaskIds.length === filteredTasks.length
                  }
                  onChange={handleSelectAll}
                  className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-purple-600 focus:ring-0 cursor-pointer"
                />
              </th>
              <th className="py-3.5 px-3 w-28">Code</th>
              <th
                onClick={() => handleSort('title')}
                className="py-3.5 px-3 cursor-pointer hover:text-slate-100"
              >
                <div className="flex items-center gap-1.5">
                  <span className={filters.sortBy === 'title' ? 'text-purple-300 font-bold' : ''}>Task Title</span>
                  {renderSortIcon('title')}
                </div>
              </th>
              <th className="py-3.5 px-3 w-36">Status</th>
              <th
                onClick={() => handleSort('priority')}
                className="py-3.5 px-3 w-28 cursor-pointer hover:text-slate-100"
              >
                <div className="flex items-center gap-1.5">
                  <span className={filters.sortBy === 'priority' ? 'text-purple-300 font-bold' : ''}>Priority</span>
                  {renderSortIcon('priority')}
                </div>
              </th>
              <th className="py-3.5 px-3 w-36">Assignee</th>
              <th
                onClick={() => handleSort('dueDate')}
                className="py-3.5 px-3 w-32 cursor-pointer hover:text-slate-100"
              >
                <div className="flex items-center gap-1.5">
                  <span className={filters.sortBy === 'dueDate' ? 'text-purple-300 font-bold' : ''}>Due Date</span>
                  {renderSortIcon('dueDate')}
                </div>
              </th>
              <th className="py-3.5 px-3 w-24 text-right">Hours</th>
            </tr>
          </thead>
          <motion.tbody
            variants={tableBodyVariants}
            initial="hidden"
            animate="visible"
            className="divide-y divide-slate-800/50"
          >
            {filteredTasks.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-xs text-slate-400">
                  No tasks matching the selected filters.
                </td>
              </tr>
            ) : (
              filteredTasks.map((task) => {
                const isSelected = selectedTaskIds.includes(task.id)
                const assignee = users.find((u) => u.id === task.assigneeId)
                const overdue = isOverdue(task.dueDate, task.status)

                return (
                  <motion.tr
                    key={task.id}
                    variants={staggerRow}
                    onClick={() => setSelectedTaskId(task.id)}
                    className={`hover:bg-slate-800/40 cursor-pointer transition-colors ${
                      isSelected ? 'bg-purple-950/25 border-l-2 border-purple-500' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-3 pl-4 pr-2" onClick={(e) => e.stopPropagation()}>
                      <label className="p-2 -m-2 flex items-center justify-center cursor-pointer min-w-[36px] min-h-[36px]">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleSelectRow(e as any, task.id)}
                          className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-purple-600 focus:ring-0 cursor-pointer"
                        />
                      </label>
                    </td>

                    {/* Code */}
                    <td className="py-3 px-3 font-mono font-medium text-slate-400 text-xs">
                      {task.taskCode}
                    </td>

                    {/* Title & Tags */}
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-100 hover:text-purple-300 transition-colors">
                        {task.title}
                      </div>
                      {task.tags.length > 0 && (
                        <div className="flex items-center gap-1.5 mt-1">
                          {task.tags.map((t) => (
                            <span
                              key={t}
                              className="text-[10px] text-slate-400 bg-slate-800/60 px-1.5 py-0.2 rounded"
                            >
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>

                    {/* Status Select */}
                    <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={task.status}
                        onChange={(e) => moveTaskStatus(task.id, e.target.value as Status)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-purple-500 font-medium min-h-[36px]"
                      >
                        <option value="backlog">Backlog</option>
                        <option value="in_progress">In Progress</option>
                        <option value="in_review">In Review</option>
                        <option value="done">Done</option>
                      </select>
                    </td>

                    {/* Priority Select */}
                    <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={task.priority}
                        onChange={(e) =>
                          updateTask(task.id, { priority: e.target.value as Priority })
                        }
                        className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-purple-500 font-medium min-h-[36px]"
                      >
                        <option value="urgent">Urgent</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </td>

                    {/* Assignee */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <Avatar user={assignee} size="xs" showStatus={true} />
                        <span className="truncate max-w-[100px] text-slate-200 font-medium">
                          {assignee?.name}
                        </span>
                      </div>
                    </td>

                    {/* Due Date */}
                    <td className="py-3 px-3">
                      <span
                        className={`font-medium ${
                          overdue ? 'text-rose-400 font-bold' : 'text-slate-300'
                        }`}
                      >
                        {formatDate(task.dueDate)}
                      </span>
                    </td>

                    {/* Hours */}
                    <td className="py-3 px-3 text-right font-mono text-slate-400">
                      <AnimatedCounter value={task.loggedHours} />/<AnimatedCounter value={task.estimatedHours} suffix="h" />
                    </td>
                  </motion.tr>
                )
              })
            )}
          </motion.tbody>
        </table>
      </div>
    </div>
  )
}
