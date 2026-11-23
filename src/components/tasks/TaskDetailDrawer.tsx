import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTaskContext } from '../../context/TaskContext'
import type { Status, Priority } from '../../types'
import { Avatar } from '../common/Avatar'
import { isOverdue } from '../../utils/formatters'
import { AnimatedCounter } from '../common/AnimatedCounter'
import {
  snappySpring,
  drawerBackdropVariants,
  drawerPanelVariants,
  drawerAccordionContainer,
  drawerAccordionItem,
  checkboxPopVariants,
} from '../../utils/motion'
import {
  X,
  Trash2,
  CheckSquare,
  Plus,
  Paperclip,
  MessageSquare,
  Send,
  Heart,
  Upload,
} from 'lucide-react'

export const TaskDetailDrawer: React.FC = () => {
  const {
    selectedTask,
    setSelectedTaskId,
    updateTask,
    deleteTask,
    moveTaskStatus,
    toggleSubtask,
    addSubtask,
    deleteSubtask,
    addComment,
    likeComment,
    addAttachment,
    deleteAttachment,
    users,
    projects,
  } = useTaskContext()

  const [newSubtaskTitle, setNewSubtaskTitle] = useState('')
  const [newCommentText, setNewCommentText] = useState('')
  const [newTagInput, setNewTagInput] = useState('')
  const [activeTab, setActiveTab] = useState<'details' | 'comments' | 'attachments'>('details')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const project = selectedTask ? projects.find((p) => p.id === selectedTask.projectId) : undefined
  const totalSubtasks = selectedTask ? selectedTask.subtasks.length : 0
  const completedSubtasks = selectedTask ? selectedTask.subtasks.filter((s) => s.completed).length : 0
  const overdue = selectedTask ? isOverdue(selectedTask.dueDate, selectedTask.status) : false

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTask || !newSubtaskTitle.trim()) return
    addSubtask(selectedTask.id, newSubtaskTitle)
    setNewSubtaskTitle('')
  }

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTask || !newCommentText.trim()) return
    addComment(selectedTask.id, newCommentText)
    setNewCommentText('')
  }

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (!selectedTask) return
    if (e.key === 'Enter' && newTagInput.trim()) {
      e.preventDefault()
      const tag = newTagInput.trim()
      if (!selectedTask.tags.includes(tag)) {
        updateTask(selectedTask.id, { tags: [...selectedTask.tags, tag] })
      }
      setNewTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    if (!selectedTask) return
    updateTask(selectedTask.id, {
      tags: selectedTask.tags.filter((t) => t !== tagToRemove),
    })
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedTask) return
    const file = e.target.files?.[0]
    if (file) {
      const sizeStr = file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`
      addAttachment(selectedTask.id, {
        name: file.name,
        size: sizeStr,
        type: file.type.split('/')[1] || 'file',
      })
      e.target.value = ''
    }
  }

  const handleSimulatedFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <AnimatePresence>
      {selectedTask && (
        <div className="fixed inset-0 z-50 overflow-hidden select-none">
          {/* Backdrop */}
          <motion.div
            key="drawer-backdrop"
            variants={drawerBackdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={() => setSelectedTaskId(null)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Slide-over Drawer Panel */}
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10 pointer-events-none">
            <motion.div
              key="drawer-panel"
              variants={drawerPanelVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="w-screen max-w-full sm:max-w-2xl bg-[#0C1120] border-l border-slate-800 text-slate-100 flex flex-col shadow-2xl shadow-black/80 pointer-events-auto pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)]"
            >
              {/* iOS Mobile Sheet Handle */}
              <div className="sm:hidden pt-2 pb-1 flex justify-center bg-[#090D17]">
                <div className="w-10 h-1 rounded-full bg-slate-600/60" />
              </div>

              {/* Header Bar */}
              <div className="h-16 px-4 sm:px-6 border-b border-slate-800 flex items-center justify-between bg-[#090D17]">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 shrink-0">
                    {selectedTask.taskCode}
                  </span>
                  <span className="text-xs text-slate-400 truncate max-w-[120px] sm:max-w-[180px]">in {project?.name}</span>
                  <span className="text-[11px] font-mono text-purple-300 bg-purple-950/40 px-2 py-0.5 rounded border border-purple-500/20 shrink-0">
                    <AnimatedCounter value={selectedTask.loggedHours} />h /{' '}
                    <AnimatedCounter value={selectedTask.estimatedHours} suffix="h" />
                  </span>
                </div>

                <div className="flex items-center gap-1 sm:gap-2">
                  <button
                    onClick={() => deleteTask(selectedTask.id)}
                    title="Delete Task"
                    className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setSelectedTaskId(null)}
                    title="Close Drawer"
                    className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex items-center px-4 sm:px-6 border-b border-slate-800 bg-[#0E0E16] gap-3 sm:gap-6 text-xs font-medium overflow-x-auto momentum-scroll no-scrollbar">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`py-3 flex items-center gap-1.5 sm:gap-2 border-b-2 shrink-0 whitespace-nowrap transition-colors ${
                    activeTab === 'details'
                      ? 'border-purple-500 text-purple-300 font-semibold'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>Details & Subtasks ({completedSubtasks}/{totalSubtasks})</span>
                </button>
                <button
                  onClick={() => setActiveTab('comments')}
                  className={`py-3 flex items-center gap-1.5 sm:gap-2 border-b-2 shrink-0 whitespace-nowrap transition-colors ${
                    activeTab === 'comments'
                      ? 'border-purple-500 text-purple-300 font-semibold'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Discussion ({selectedTask.comments.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab('attachments')}
                  className={`py-3 flex items-center gap-1.5 sm:gap-2 border-b-2 shrink-0 whitespace-nowrap transition-colors ${
                    activeTab === 'attachments'
                      ? 'border-purple-500 text-purple-300 font-semibold'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Paperclip className="w-3.5 h-3.5" />
                  <span>Files ({selectedTask.attachments.length})</span>
                </button>
              </div>

              {/* Drawer Body */}
              <motion.div
                key={activeTab}
                variants={drawerAccordionContainer}
                initial="hidden"
                animate="visible"
                className="flex-1 overflow-y-auto momentum-scroll p-4 sm:p-6 pb-[max(1.5rem,env(safe-area-inset-bottom,0px))] space-y-6"
              >
                {activeTab === 'details' && (
                  <>
                    {/* Title (in-place editable) */}
                    <motion.div variants={drawerAccordionItem}>
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1 block">
                        Task Title
                      </label>
                      <input
                        type="text"
                        value={selectedTask.title}
                        onChange={(e) => updateTask(selectedTask.id, { title: e.target.value })}
                        className="w-full text-lg font-bold bg-transparent text-slate-100 hover:bg-slate-800/40 focus:bg-slate-900 px-2 py-1 -ml-2 rounded-lg border border-transparent focus:border-purple-500/50 focus:outline-none transition-all"
                      />
                    </motion.div>

                    {/* Primary Properties Grid */}
                    <motion.div variants={drawerAccordionItem} className="grid grid-cols-2 gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-xl bg-[#0C0C12] border border-slate-800 text-xs">
                      {/* Status Picker */}
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1.5 font-medium">Status</label>
                        <select
                          value={selectedTask.status}
                          onChange={(e) => moveTaskStatus(selectedTask.id, e.target.value as Status)}
                          className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 font-medium focus:outline-none focus:border-purple-500 min-h-[42px]"
                        >
                          <option value="backlog">Backlog</option>
                          <option value="in_progress">In Progress</option>
                          <option value="in_review">In Review</option>
                          <option value="done">Done</option>
                        </select>
                      </div>

                      {/* Priority Picker */}
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1.5 font-medium">Priority</label>
                        <select
                          value={selectedTask.priority}
                          onChange={(e) => updateTask(selectedTask.id, { priority: e.target.value as Priority })}
                          className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 font-medium focus:outline-none focus:border-purple-500 min-h-[42px]"
                        >
                          <option value="urgent">Urgent</option>
                          <option value="high">High</option>
                          <option value="medium">Medium</option>
                          <option value="low">Low</option>
                        </select>
                      </div>

                      {/* Assignee Picker */}
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1.5 font-medium">Assignee</label>
                        <select
                          value={selectedTask.assigneeId}
                          onChange={(e) => updateTask(selectedTask.id, { assigneeId: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 font-medium focus:outline-none focus:border-purple-500 min-h-[42px]"
                        >
                          {users.map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.name} ({u.role})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Due Date Picker */}
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1.5 font-medium">
                          Due Date {overdue && <span className="text-rose-400 font-bold">(Overdue)</span>}
                        </label>
                        <input
                          type="date"
                          value={selectedTask.dueDate}
                          onChange={(e) => updateTask(selectedTask.id, { dueDate: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 font-medium focus:outline-none focus:border-purple-500 min-h-[42px]"
                        />
                      </div>

                      {/* Estimate / Logged hours */}
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1.5 font-medium">Est. Hours</label>
                        <input
                          type="number"
                          min={0}
                          value={selectedTask.estimatedHours}
                          onChange={(e) =>
                            updateTask(selectedTask.id, { estimatedHours: Math.max(0, Number(e.target.value)) })
                          }
                          className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 font-medium focus:outline-none focus:border-purple-500 min-h-[42px]"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1.5 font-medium">Logged Hours</label>
                        <input
                          type="number"
                          min={0}
                          value={selectedTask.loggedHours}
                          onChange={(e) =>
                            updateTask(selectedTask.id, { loggedHours: Math.max(0, Number(e.target.value)) })
                          }
                          className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 font-medium focus:outline-none focus:border-purple-500 min-h-[42px]"
                        />
                      </div>
                    </motion.div>

                    {/* Description */}
                    <motion.div variants={drawerAccordionItem}>
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5 block">
                        Description
                      </label>
                      <textarea
                        rows={4}
                        value={selectedTask.description}
                        onChange={(e) => updateTask(selectedTask.id, { description: e.target.value })}
                        placeholder="Add detailed task specifications, requirements, or acceptance criteria..."
                        className="w-full px-3 py-2.5 rounded-xl bg-[#0C0C12] border border-slate-800 text-slate-200 text-xs leading-relaxed focus:outline-none focus:border-purple-500"
                      />
                    </motion.div>

                    {/* Tags */}
                    <motion.div variants={drawerAccordionItem}>
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5 block">
                        Tags & Labels
                      </label>
                      <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl bg-[#0C0C12] border border-slate-800">
                        {selectedTask.tags.map((t) => (
                          <span
                            key={t}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-purple-500/15 text-purple-300 border border-purple-500/25"
                          >
                            #{t}
                            <button
                              onClick={() => handleRemoveTag(t)}
                              className="hover:text-rose-400 text-slate-400 ml-0.5"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                        <input
                          type="text"
                          value={newTagInput}
                          onChange={(e) => setNewTagInput(e.target.value)}
                          onKeyDown={handleAddTag}
                          placeholder="+ Add tag (Press Enter)"
                          className="text-xs bg-transparent text-slate-200 placeholder-slate-400 focus:outline-none px-1.5 py-0.5"
                        />
                      </div>
                    </motion.div>

                    {/* Subtasks Checklist */}
                    <motion.div variants={drawerAccordionItem}>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                          Checklist & Subtasks ({completedSubtasks}/{totalSubtasks})
                        </label>
                        <span className="text-xs font-mono text-purple-400">
                          <AnimatedCounter
                            value={
                              totalSubtasks > 0
                                ? Math.round((completedSubtasks / totalSubtasks) * 100)
                                : 0
                            }
                            suffix="%"
                          />
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-3">
                        <motion.div
                          initial={false}
                          animate={{
                            width: `${totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0}%`,
                          }}
                          transition={snappySpring}
                          className="h-full bg-gradient-to-r from-purple-500 via-violet-500 to-fuchsia-400"
                        />
                      </div>

                      {/* Subtask items with spring pop on checkbox */}
                      <div className="space-y-2 mb-3">
                        {selectedTask.subtasks.map((sub) => (
                          <motion.div
                            key={sub.id}
                            layout
                            transition={snappySpring}
                            className="group flex items-center justify-between p-2 rounded-lg bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 transition-colors"
                          >
                            <label className="flex items-center gap-2.5 cursor-pointer min-w-0 flex-1">
                              <motion.div
                                variants={checkboxPopVariants}
                                initial={false}
                                animate={sub.completed ? 'checked' : 'unchecked'}
                                className="relative flex items-center justify-center shrink-0"
                              >
                                <input
                                  type="checkbox"
                                  checked={sub.completed}
                                  onChange={() => toggleSubtask(selectedTask.id, sub.id)}
                                  className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0 focus:ring-offset-0 cursor-pointer accent-indigo-600"
                                />
                              </motion.div>
                              <span
                                className={`text-xs ${
                                  sub.completed
                                    ? 'line-through text-slate-400 font-normal'
                                    : 'text-slate-200 font-medium'
                                } truncate`}
                              >
                                {sub.title}
                              </span>
                            </label>
                            <button
                              onClick={() => deleteSubtask(selectedTask.id, sub.id)}
                              title="Delete subtask"
                              aria-label="Delete subtask"
                              className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 text-slate-400 hover:text-rose-400 p-2 min-w-[36px] min-h-[36px] flex items-center justify-center transition-all rounded-lg"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </motion.div>
                        ))}
                      </div>

                      {/* Add Subtask Input */}
                      <form onSubmit={handleAddSubtask} className="flex gap-2">
                        <input
                          type="text"
                          value={newSubtaskTitle}
                          onChange={(e) => setNewSubtaskTitle(e.target.value)}
                          placeholder="Add new subtask item..."
                          className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-purple-500 min-h-[44px]"
                        />
                        <button
                          type="submit"
                          disabled={!newSubtaskTitle.trim()}
                          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1.5 transition-all min-h-[44px]"
                        >
                          <Plus className="w-4 h-4" />
                          Add
                        </button>
                      </form>
                    </motion.div>
                  </>
                )}

                {activeTab === 'comments' && (
                  <motion.div variants={drawerAccordionContainer} initial="hidden" animate="visible" className="space-y-4">
                    <div className="space-y-3">
                      {selectedTask.comments.length === 0 ? (
                        <div className="py-8 text-center text-xs text-slate-400">
                          No comments yet. Start the conversation with your team below.
                        </div>
                      ) : (
                        selectedTask.comments.map((comm) => {
                          const author = users.find((u) => u.id === comm.authorId)
                          return (
                            <motion.div
                              key={comm.id}
                              variants={drawerAccordionItem}
                              className="p-3 rounded-xl bg-[#0C0C12] border border-slate-800 space-y-2 text-xs"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Avatar user={author} size="sm" />
                                  <span className="font-semibold text-slate-200">
                                    {author?.name || 'Team Member'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => likeComment(selectedTask.id, comm.id)}
                                    title="Like this comment"
                                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-rose-400 bg-slate-800/60 hover:bg-rose-500/10 px-2 py-0.5 rounded transition-colors"
                                  >
                                    <Heart className={`w-3 h-3 ${comm.likes > 0 ? 'fill-rose-400 text-rose-400' : ''}`} />
                                    <span>{comm.likes}</span>
                                  </button>
                                  <span className="text-[10px] text-slate-400">
                                    {new Date(comm.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                              <p className="text-slate-300 leading-relaxed pl-8">
                                {comm.content}
                              </p>
                            </motion.div>
                          )
                        })
                      )}
                    </div>

                    {/* Add Comment Input */}
                    <form onSubmit={handleAddComment} className="pt-2 border-t border-slate-800">
                      <div className="relative">
                        <textarea
                          rows={3}
                          value={newCommentText}
                          onChange={(e) => setNewCommentText(e.target.value)}
                          placeholder="Write a comment or mention @team..."
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-purple-500 pr-12"
                        />
                        <button
                          type="submit"
                          disabled={!newCommentText.trim()}
                          className="absolute bottom-3 right-3 p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white transition-all"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}

                {activeTab === 'attachments' && (
                  <motion.div variants={drawerAccordionContainer} initial="hidden" animate="visible" className="space-y-4">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileInputChange}
                      className="hidden"
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400 font-medium">Uploaded Assets</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleSimulatedFileUpload}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-medium transition-colors"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          Upload File
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedTask.attachments.length === 0 ? (
                        <div className="col-span-2 py-8 text-center text-xs text-slate-400">
                          No attachments uploaded for this task.
                        </div>
                      ) : (
                        selectedTask.attachments.map((att) => (
                          <motion.div
                            key={att.id}
                            variants={drawerAccordionItem}
                            className="group flex items-center justify-between p-3 rounded-xl bg-[#0C0C12] border border-slate-800 text-xs hover:border-slate-700 transition-colors"
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-purple-400 flex items-center justify-center shrink-0">
                                <Paperclip className="w-4 h-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="font-medium text-slate-200 truncate">{att.name}</div>
                                <div className="text-[10px] text-slate-400">
                                  {att.size} • {att.uploadedAt}
                                </div>
                              </div>
                            </div>

                            <button
                              onClick={() => deleteAttachment(selectedTask.id, att.id)}
                              title="Delete attachment"
                              aria-label="Delete attachment"
                              className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 p-2 min-w-[36px] min-h-[36px] flex items-center justify-center text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all ml-2"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}

