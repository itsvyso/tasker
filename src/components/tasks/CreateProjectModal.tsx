import React, { useState } from 'react'
import { useTaskContext } from '../../context/TaskContext'
import { X, FolderPlus, Sparkles } from 'lucide-react'

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

  if (!isCreateProjectModalOpen) return null

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    createProject({
      name: name.trim(),
      code: (code.trim() || 'PRJ').toUpperCase(),
      description: description.trim() || 'Next-generation initiative workspace',
      category,
      color,
      icon: 'Folder',
      budget,
      targetDate,
      memberIds: users.map((u) => u.id),
    })

    // Reset and close
    setName('')
    setCode('')
    setDescription('')
    setIsCreateProjectModalOpen(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn select-none">
      <div
        className="w-full max-w-lg bg-[#0E0E16] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#121A2F]">
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
            onClick={() => setIsCreateProjectModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
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

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsCreateProjectModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium shadow-lg shadow-purple-600/30 border border-purple-400/20 flex items-center gap-1.5 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
