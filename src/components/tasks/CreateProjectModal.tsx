import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTaskContext } from '../../context/TaskContext'
import { modalBackdropVariants, modalCardVariants } from '../../utils/motion'
import { X, FolderPlus, Sparkles, Users, Check } from 'lucide-react'
import { Avatar } from '../common/Avatar'

const COLOR_OPTIONS = [
  { name: 'Indigo', hex: '#6366F1' },
  { name: 'Cyan', hex: '#06B6D4' },
  { name: 'Emerald', hex: '#10B981' },
  { name: 'Amber', hex: '#F59E0B' },
  { name: 'Rose', hex: '#F43F5E' },
  { name: 'Violet', hex: '#8B5CF6' },
]

export const CreateProjectModal: React.FC = () => {
  const {
    isCreateProjectModalOpen,
    setIsCreateProjectModalOpen,
    createProject,
    currentUser,
    users,
  } = useTaskContext()

  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('Product Engineering')
  const [color, setColor] = useState(COLOR_OPTIONS[0].hex)
  const [budget, setBudget] = useState('$50,000')
  const [targetDate, setTargetDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 30)
    return d.toISOString().split('T')[0]
  })
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>(() => [currentUser?.id || ''])

  const handleClose = () => {
    setName('')
    setCode('')
    setDescription('')
    setSelectedMemberIds([currentUser?.id || ''])
    setIsCreateProjectModalOpen(false)
  }

  const handleNameChange = (val: string) => {
    setName(val)
    if (!code || code.length <= 4) {
      // Auto generate code from first letters or first 3 letters
      const words = val.trim().split(/\s+/)
      if (words.length > 1) {
        setCode(words.map((w) => w[0]).join('').toUpperCase().slice(0, 4))
      } else {
        setCode(val.slice(0, 3).toUpperCase())
      }
    }
  }

  const toggleMember = (userId: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    const finalMemberIds = currentUser?.id && !selectedMemberIds.includes(currentUser.id)
      ? [currentUser.id, ...selectedMemberIds]
      : selectedMemberIds

    createProject({
      name: name.trim(),
      code: (code.trim() || 'PRJ').toUpperCase(),
      description: description.trim() || 'Next-generation initiative workspace',
      category,
      color,
      icon: 'Folder',
      budget,
      targetDate,
      memberIds: finalMemberIds.length > 0 ? finalMemberIds : (currentUser?.id ? [currentUser.id] : []),
    })

    // Reset and close
    setName('')
    setCode('')
    setDescription('')
    setSelectedMemberIds([currentUser?.id || ''])
    setIsCreateProjectModalOpen(false)
  }

  return (
    <AnimatePresence>
      {isCreateProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 select-none pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)]">
          <motion.div
            key="create-project-backdrop"
            variants={modalBackdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={handleClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />
          <motion.div
            key="create-project-card"
            variants={modalCardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-full max-w-lg max-h-[min(88vh,88dvh)] bg-[#0E0E16] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col relative z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-800 bg-[#121A2F]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                  <FolderPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">Create New Project</h3>
                  <p className="text-[11px] text-slate-400">Initialize a workspace sprint board & channel</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                title="Close modal"
                aria-label="Close modal"
                className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-slate-200 rounded-xl hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 text-xs overflow-y-auto momentum-scroll">
          {/* Row: Name and Code */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Project Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                autoFocus
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Hyperion Cloud Engine"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Code <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={5}
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="HYP"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 font-mono font-bold text-slate-100 text-xs focus:outline-none focus:border-purple-500 uppercase"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-[11px] font-semibold text-slate-300 block mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Primary objectives, milestones, or team focus for this project..."
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Row: Category & Target Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-purple-500"
              >
                <option value="Product Engineering">Product Engineering</option>
                <option value="Design & Core UI">Design & Core UI</option>
                <option value="Machine Learning">Machine Learning</option>
                <option value="Security & DevOps">Security & DevOps</option>
                <option value="Mobile Development">Mobile Development</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Sprint Target Date
              </label>
              <input
                type="date"
                required
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Row: Budget & Theme Color */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">Budget</label>
              <input
                type="text"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="$50,000"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Accent Glow Color
              </label>
              <div className="flex items-center gap-2 pt-1">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setColor(c.hex)}
                    style={{ backgroundColor: c.hex }}
                    className={`w-6 h-6 rounded-full transition-transform ${
                      color === c.hex ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0E1424] scale-110' : 'opacity-70 hover:opacity-100'
                    }`}
                    title={c.name}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Team Members Assignment */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-purple-400" />
                Assign Team Members ({selectedMemberIds.length}/{users.length})
              </label>
              <button
                type="button"
                onClick={() =>
                  setSelectedMemberIds(
                    selectedMemberIds.length === users.length ? [] : users.map((u) => u.id)
                  )
                }
                className="text-[10px] text-purple-400 hover:underline cursor-pointer"
              >
                {selectedMemberIds.length === users.length ? 'Clear all' : 'Select all'}
              </button>
            </div>
            <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto p-1.5 rounded-xl bg-slate-900 border border-slate-700/80">
              {users.map((u) => {
                const isSelected = selectedMemberIds.includes(u.id)
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => toggleMember(u.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-purple-600/30 text-purple-200 border border-purple-500/50 shadow-sm'
                        : 'bg-slate-800/80 text-slate-400 border border-slate-700/50 hover:text-slate-200'
                    }`}
                  >
                    <Avatar user={u} size="xs" showStatus={false} />
                    <span className="truncate max-w-[120px]">{u.name}</span>
                    {isSelected && <Check className="w-3 h-3 text-purple-400 shrink-0" />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors min-h-[44px] font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-purple-600/30 border border-purple-400/20 flex items-center gap-1.5 transition-all min-h-[44px]"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Create Project
            </button>
          </div>
        </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
