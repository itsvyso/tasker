import React, { useState, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTaskContext } from '../../context/TaskContext'
import { snappySpring, modalBackdropVariants } from '../../utils/motion'
import { Search, CheckCircle, Folder, Plus, CornerDownLeft, X } from 'lucide-react'
import { PriorityBadge } from './Badge'

export const CommandPalette: React.FC = () => {
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    tasks,
    projects,
    setActiveProjectId,
    setSelectedTaskId,
    setIsCreateTaskModalOpen,
    setActiveView,
  } = useTaskContext()

  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleClose = () => {
    setIsCommandPaletteOpen(false)
    setQuery('')
    setSelectedIndex(0)
  }

  useEffect(() => {
    if (isCommandPaletteOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 50)
      return () => clearTimeout(timer)
    }
  }, [isCommandPaletteOpen])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    const taskMatches = tasks
      .filter(
        (t) =>
          !q ||
          t.title.toLowerCase().includes(q) ||
          t.taskCode.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q))
      )
      .slice(0, 5)
      .map((t) => ({
        type: 'task' as const,
        id: t.id,
        title: t.title,
        subtitle: `${t.taskCode} • ${t.status.replace('_', ' ')}`,
        data: t,
      }))

    const projectMatches = projects
      .filter((p) => !q || p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q))
      .slice(0, 3)
      .map((p) => ({
        type: 'project' as const,
        id: p.id,
        title: p.name,
        subtitle: `Project • ${p.code}`,
        data: p,
      }))

    const actions = [
      {
        type: 'action' as const,
        id: 'action-new-task',
        title: 'Create New Task',
        subtitle: 'Press C anywhere or click here',
        action: () => setIsCreateTaskModalOpen(true),
      },
      {
        type: 'action' as const,
        id: 'action-view-kanban',
        title: 'Switch to Kanban Board',
        subtitle: 'View sprint pipeline columns',
        action: () => setActiveView('kanban'),
      },
      {
        type: 'action' as const,
        id: 'action-view-table',
        title: 'Switch to Table View',
        subtitle: 'Dense spreadsheet layout',
        action: () => setActiveView('table'),
      },
      {
        type: 'action' as const,
        id: 'action-view-calendar',
        title: 'Switch to Calendar View',
        subtitle: 'Monthly sprint schedule',
        action: () => setActiveView('calendar'),
      },
      {
        type: 'action' as const,
        id: 'action-view-timeline',
        title: 'Switch to Timeline (Gantt)',
        subtitle: 'Visual task durations',
        action: () => setActiveView('timeline'),
      },
      {
        type: 'action' as const,
        id: 'action-view-routines',
        title: 'Switch to Routines & Insights',
        subtitle: 'Habit tracker, dot matrix schedule, 3D status & pomodoro',
        action: () => setActiveView('routines'),
      },
    ].filter((a) => !q || a.title.toLowerCase().includes(q))

    return [...taskMatches, ...projectMatches, ...actions]
  }, [query, tasks, projects, setIsCreateTaskModalOpen, setActiveView])

  const handleSelect = (item: (typeof results)[0]) => {
    if (!item) return
    handleClose()
    if (item.type === 'task') {
      setActiveProjectId(item.data.projectId)
      setSelectedTaskId(item.data.id)
    } else if (item.type === 'project') {
      setActiveProjectId(item.data.id)
    } else if (item.type === 'action') {
      item.action()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, results.length))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev - 1 + results.length) % Math.max(1, results.length))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (results[selectedIndex]) {
        handleSelect(results[selectedIndex])
      }
    }
  }

  return (
    <AnimatePresence>
      {isCommandPaletteOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[calc(1rem+env(safe-area-inset-top,0px))] sm:pt-20 px-3 sm:px-4 pb-[env(safe-area-inset-bottom,0px)] select-none">
          <motion.div
            key="command-palette-backdrop"
            variants={modalBackdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={handleClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
          />
          <motion.div
            key="command-palette-card"
            initial={{ opacity: 0, scale: 0.94, y: -10 }}
            animate={{ opacity: 1, scale: 1.0, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: -10, transition: { duration: 0.15 } }}
            transition={snappySpring}
            className="w-full max-w-xl max-h-[min(36rem,85dvh)] bg-[#0D0D14] border border-slate-700/60 rounded-xl shadow-2xl shadow-black/80 overflow-hidden flex flex-col relative z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input Bar */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-800 bg-[#101018]">
              <Search className="w-5 h-5 text-purple-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setSelectedIndex(0)
                }}
                onKeyDown={handleKeyDown}
                placeholder="Search tasks, projects, actions... (or navigate with arrows)"
                className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-400 focus:outline-none"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  title="Clear query"
                  aria-label="Clear query"
                  className="p-1.5 min-w-[36px] min-h-[36px] flex items-center justify-center text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800/80 rounded border border-slate-700">
                ESC
              </kbd>
            </div>

            {/* Results List */}
            <div className="max-h-[min(24rem,52dvh)] overflow-y-auto momentum-scroll p-2 divide-y divide-slate-800/30">
              {results.length === 0 ? (
                <div className="py-12 text-center text-sm text-slate-400">
                  No matching tasks, projects, or commands found.
                </div>
              ) : (
                results.map((item, index) => {
                  const isSelected = index === selectedIndex
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                        isSelected ? 'bg-gradient-to-r from-purple-600/20 to-violet-600/15 text-white border border-purple-500/35 shadow-sm' : 'text-slate-300 hover:bg-slate-800/40 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                            item.type === 'task'
                              ? 'bg-indigo-500/15 text-purple-400'
                              : item.type === 'project'
                              ? 'bg-cyan-500/15 text-cyan-400'
                              : 'bg-emerald-500/15 text-emerald-400'
                          }`}
                        >
                          {item.type === 'task' && <CheckCircle className="w-4 h-4" />}
                          {item.type === 'project' && <Folder className="w-4 h-4" />}
                          {item.type === 'action' && <Plus className="w-4 h-4" />}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate">{item.title}</div>
                          <div className="text-xs text-slate-400 truncate">{item.subtitle}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {item.type === 'task' && <PriorityBadge priority={item.data.priority} showIcon={false} />}
                        {isSelected && (
                          <span className="flex items-center gap-1 text-[11px] text-purple-300">
                            <CornerDownLeft className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Footer shortcuts hint */}
            <div className="px-4 py-2 bg-[#090D18] border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-[10px]">↑</kbd>
                  <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-[10px]">↓</kbd>
                  Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-[10px]">↵</kbd>
                  Select
                </span>
              </div>
              <span className="text-slate-400">Taske Quick Jump</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
