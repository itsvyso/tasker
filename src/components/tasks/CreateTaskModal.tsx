import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTaskContext } from '../../context/TaskContext'
import type { Priority, Status } from '../../types'
import { modalBackdropVariants, modalCardVariants } from '../../utils/motion'
import { X, Plus, Sparkles } from 'lucide-react'

export const CreateTaskModal: React.FC = () => {
  const {
    isCreateTaskModalOpen,
    setIsCreateTaskModalOpen,
    createTaskModalDefaults,
    createTask,
    users,
    activeProjectId,
  } = useTaskContext()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')
  const [status, setStatus] = useState<Status>('backlog')
  const [assigneeId, setAssigneeId] = useState(users[0]?.id || '')
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 5)
    return d.toISOString().split('T')[0]
  })
  const [estimatedHours, setEstimatedHours] = useState(8)
  const [tagsInput, setTagsInput] = useState('Frontend, UI/UX')

  const [prevDefaults, setPrevDefaults] = useState(createTaskModalDefaults)
  if (prevDefaults !== createTaskModalDefaults) {
    setPrevDefaults(createTaskModalDefaults)
    if (createTaskModalDefaults?.status) {
      setStatus(createTaskModalDefaults.status)
    } else {
      setStatus('backlog')
    }
    if (createTaskModalDefaults?.dueDate) {
      setDueDate(createTaskModalDefaults.dueDate)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0)

    createTask({
      title: title.trim(),
      description: description.trim(),
      priority,
      status,
      assigneeId,
      dueDate,
      tags,
      estimatedHours,
      projectId: activeProjectId,
    })

    // Reset fields & close
    setTitle('')
    setDescription('')
    setPriority('medium')
    setStatus('backlog')
    setIsCreateTaskModalOpen(false)
  }

  return (
    <AnimatePresence>
      {isCreateTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 select-none pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)]">
          <motion.div
            key="create-task-backdrop"
            variants={modalBackdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={() => setIsCreateTaskModalOpen(false)}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />
          <motion.div
            key="create-task-card"
            variants={modalCardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-full max-w-lg max-h-[min(88vh,88dvh)] bg-[#0E0E16] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col relative z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-800 bg-[#121A2F]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">Create New Task</h3>
                  <p className="text-[11px] text-slate-400">Add an issue to the current sprint backlog</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateTaskModalOpen(false)}
                title="Close modal"
                aria-label="Close modal"
                className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-slate-200 rounded-xl hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 text-xs overflow-y-auto momentum-scroll">
              {/* Title */}
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Implement WebGL particle shader for hero section"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief context, technical guidelines, or acceptance steps..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Row: Priority & Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-purple-500"
                  >
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as Status)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-purple-500"
                  >
                    <option value="backlog">Backlog</option>
                    <option value="in_progress">In Progress</option>
                    <option value="in_review">In Review</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              </div>

              {/* Row: Assignee & Due Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Assignee</label>
                  <select
                    value={assigneeId}
                    onChange={(e) => setAssigneeId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-purple-500"
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Row: Tags & Estimate */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="Design, Security, API"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Est. Hours</label>
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={estimatedHours}
                    onChange={(e) => setEstimatedHours(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateTaskModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors min-h-[44px] font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-purple-600/30 border border-purple-400/20 flex items-center gap-1.5 transition-all min-h-[44px]"
                >
                  <Plus className="w-4 h-4" />
                  Create Task
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

