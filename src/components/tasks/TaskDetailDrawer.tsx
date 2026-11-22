import React, { useState } from 'react'
import { useTaskContext } from '../../context/TaskContext'
import type { Status, Priority } from '../../types'
import { Avatar } from '../common/Avatar'
import { isOverdue } from '../../utils/formatters'
import {
  X,
  Trash2,
  CheckSquare,
  Plus,
  Paperclip,
  MessageSquare,
  Send,
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
    addAttachment,
    users,
    projects,
  } = useTaskContext()

  const [newSubtaskTitle, setNewSubtaskTitle] = useState('')
  const [newCommentText, setNewCommentText] = useState('')
  const [newTagInput, setNewTagInput] = useState('')
  const [activeTab, setActiveTab] = useState<'details' | 'comments' | 'attachments'>('details')

  if (!selectedTask) return null

  const project = projects.find((p) => p.id === selectedTask.projectId)
  const totalSubtasks = selectedTask.subtasks.length
  const completedSubtasks = selectedTask.subtasks.filter((s) => s.completed).length
  const overdue = isOverdue(selectedTask.dueDate, selectedTask.status)

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSubtaskTitle.trim()) return
    addSubtask(selectedTask.id, newSubtaskTitle)
    setNewSubtaskTitle('')
  }

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCommentText.trim()) return
    addComment(selectedTask.id, newCommentText)
    setNewCommentText('')
  }

  const handleAddTag = (e: React.KeyboardEvent) => {
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
    updateTask(selectedTask.id, {
      tags: selectedTask.tags.filter((t) => t !== tagToRemove),
    })
  }

  const handleSimulatedFileUpload = () => {
    const mockFiles = [
      { name: 'technical_architecture_v2.png', size: '1.4 MB', type: 'image' },
      { name: 'api_endpoints_schema.json', size: '64 KB', type: 'json' },
      { name: 'wireframe_handoff.pdf', size: '3.8 MB', type: 'pdf' },
    ]
    const randomFile = mockFiles[Math.floor(Math.random() * mockFiles.length)]
    addAttachment(selectedTask.id, randomFile)
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none">
      {/* Backdrop */}
      <div
        onClick={() => setSelectedTaskId(null)}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      {/* Slide-over Drawer Panel */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-2xl bg-[#0C1120] border-l border-slate-800 text-slate-100 flex flex-col shadow-2xl shadow-black/80 animate-slideLeft">
          {/* Header Bar */}
          <div className="h-16 px-6 border-b border-slate-800 flex items-center justify-between bg-[#090D17]">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                {selectedTask.taskCode}
              </span>
              <span className="text-xs text-slate-400">in {project?.name}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => deleteTask(selectedTask.id)}
                title="Delete Task"
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setSelectedTaskId(null)}
                title="Close Drawer"
                className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center px-6 border-b border-slate-800 bg-[#0A0F1E] gap-6 text-xs font-medium">
            <button
              onClick={() => setActiveTab('details')}
              className={`py-3 flex items-center gap-2 border-b-2 transition-colors ${
                activeTab === 'details'
                  ? 'border-indigo-500 text-indigo-300 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Details & Subtasks ({completedSubtasks}/{totalSubtasks})</span>
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`py-3 flex items-center gap-2 border-b-2 transition-colors ${
                activeTab === 'comments'
                  ? 'border-indigo-500 text-indigo-300 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Discussion ({selectedTask.comments.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('attachments')}
              className={`py-3 flex items-center gap-2 border-b-2 transition-colors ${
                activeTab === 'attachments'
                  ? 'border-indigo-500 text-indigo-300 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Paperclip className="w-3.5 h-3.5" />
              <span>Files ({selectedTask.attachments.length})</span>
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {activeTab === 'details' && (
              <>
                {/* Title (in-place editable) */}
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1 block">
                    Task Title
                  </label>
                  <input
                    type="text"
                    value={selectedTask.title}
                    onChange={(e) => updateTask(selectedTask.id, { title: e.target.value })}
                    className="w-full text-lg font-bold bg-transparent text-slate-100 hover:bg-slate-800/40 focus:bg-slate-900 px-2 py-1 -ml-2 rounded-lg border border-transparent focus:border-indigo-500/50 focus:outline-none transition-all"
                  />
                </div>

                {/* Primary Properties Grid */}
                <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-[#090D18] border border-slate-800 text-xs">
                  {/* Status Picker */}
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1.5">Status</label>
                    <select
                      value={selectedTask.status}
                      onChange={(e) => moveTaskStatus(selectedTask.id, e.target.value as Status)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 font-medium focus:outline-none focus:border-indigo-500"
                    >
                      <option value="backlog">Backlog</option>
                      <option value="in_progress">In Progress</option>
                      <option value="in_review">In Review</option>
                      <option value="done">Done</option>
                    </select>
                  </div>

                  {/* Priority Picker */}
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1.5">Priority</label>
                    <select
                      value={selectedTask.priority}
                      onChange={(e) => updateTask(selectedTask.id, { priority: e.target.value as Priority })}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 font-medium focus:outline-none focus:border-indigo-500"
                    >
                      <option value="urgent">Urgent</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>

                  {/* Assignee Picker */}
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1.5">Assignee</label>
                    <select
                      value={selectedTask.assigneeId}
                      onChange={(e) => updateTask(selectedTask.id, { assigneeId: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 font-medium focus:outline-none focus:border-indigo-500"
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
                    <label className="text-[11px] text-slate-400 block mb-1.5">
                      Due Date {overdue && <span className="text-rose-400 font-bold">(Overdue)</span>}
                    </label>
                    <input
                      type="date"
                      value={selectedTask.dueDate}
                      onChange={(e) => updateTask(selectedTask.id, { dueDate: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 font-medium focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Estimate / Logged hours */}
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1.5">Est. Hours</label>
                    <input
                      type="number"
                      value={selectedTask.estimatedHours}
                      onChange={(e) =>
                        updateTask(selectedTask.id, { estimatedHours: Number(e.target.value) })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 font-medium focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1.5">Logged Hours</label>
                    <input
                      type="number"
                      value={selectedTask.loggedHours}
                      onChange={(e) =>
                        updateTask(selectedTask.id, { loggedHours: Number(e.target.value) })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 font-medium focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5 block">
                    Description
                  </label>
                  <textarea
                    rows={4}
                    value={selectedTask.description}
                    onChange={(e) => updateTask(selectedTask.id, { description: e.target.value })}
                    placeholder="Add detailed task specifications, requirements, or acceptance criteria..."
                    className="w-full px-3 py-2.5 rounded-xl bg-[#090D18] border border-slate-800 text-slate-200 text-xs leading-relaxed focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5 block">
                    Tags & Labels
                  </label>
                  <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl bg-[#090D18] border border-slate-800">
                    {selectedTask.tags.map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-indigo-500/10 text-indigo-300 border border-indigo-500/25"
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
                </div>

                {/* Subtasks Checklist */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Checklist & Subtasks ({completedSubtasks}/{totalSubtasks})
                    </label>
                    <span className="text-xs font-mono text-indigo-400">
                      {totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0}%
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-3">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-300"
                      style={{
                        width: `${totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0}%`,
                      }}
                    />
                  </div>

                  {/* Subtask items */}
                  <div className="space-y-2 mb-3">
                    {selectedTask.subtasks.map((sub) => (
                      <div
                        key={sub.id}
                        className="group flex items-center justify-between p-2 rounded-lg bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 transition-colors"
                      >
                        <label className="flex items-center gap-2.5 cursor-pointer min-w-0 flex-1">
                          <input
                            type="checkbox"
                            checked={sub.completed}
                            onChange={() => toggleSubtask(selectedTask.id, sub.id)}
                            className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                          />
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
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-400 p-1 transition-opacity"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add Subtask Input */}
                  <form onSubmit={handleAddSubtask} className="flex gap-2">
                    <input
                      type="text"
                      value={newSubtaskTitle}
                      onChange={(e) => setNewSubtaskTitle(e.target.value)}
                      placeholder="Add new subtask item..."
                      className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="submit"
                      disabled={!newSubtaskTitle.trim()}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-medium flex items-center gap-1 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add
                    </button>
                  </form>
                </div>
              </>
            )}

            {activeTab === 'comments' && (
              <div className="space-y-4">
                <div className="space-y-3">
                  {selectedTask.comments.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400">
                      No comments yet. Start the conversation with your team below.
                    </div>
                  ) : (
                    selectedTask.comments.map((comm) => {
                      const author = users.find((u) => u.id === comm.authorId)
                      return (
                        <div
                          key={comm.id}
                          className="p-3 rounded-xl bg-[#090D18] border border-slate-800 space-y-2 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Avatar user={author} size="sm" />
                              <span className="font-semibold text-slate-200">
                                {author?.name || 'Team Member'}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400">
                              {new Date(comm.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-slate-300 leading-relaxed pl-8">
                            {comm.content}
                          </p>
                        </div>
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
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 pr-12"
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
              </div>
            )}

            {activeTab === 'attachments' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">Uploaded Assets</span>
                  <button
                    onClick={handleSimulatedFileUpload}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-medium transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Attach File
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedTask.attachments.map((att) => (
                    <div
                      key={att.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-[#090D18] border border-slate-800 text-xs hover:border-slate-700 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
                        <Paperclip className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-slate-200 truncate">{att.name}</div>
                        <div className="text-[10px] text-slate-400">
                          {att.size} • {att.uploadedAt}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
