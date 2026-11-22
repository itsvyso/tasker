import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useTaskContext } from '../../context/TaskContext'
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

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
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
    ].filter((a) => !q || a.title.toLowerCase().includes(q))

    return [...taskMatches, ...projectMatches, ...actions]
  }, [query, tasks, projects, setIsCreateTaskModalOpen, setActiveView])

  const handleSelect = (item: (typeof results)[0]) => {
    if (!item) return
    setIsCommandPaletteOpen(false)
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

  if (!isCommandPaletteOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/70 backdrop-blur-md transition-all animate-fadeIn">
      <div
        className="w-full max-w-xl bg-[#0E1424] border border-slate-700/60 rounded-xl shadow-2xl shadow-black/80 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-800 bg-[#121A2F]">
          <Search className="w-5 h-5 text-indigo-400 shrink-0" />
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
              className="p-1 text-slate-400 hover:text-slate-200 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800/80 rounded border border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-slate-800/30">
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
                    isSelected ? 'bg-indigo-600/20 text-white border border-indigo-500/30' : 'text-slate-300 hover:bg-slate-800/40 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        item.type === 'task'
                          ? 'bg-indigo-500/15 text-indigo-400'
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
                      <span className="flex items-center gap-1 text-[11px] text-indigo-300">
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
      </div>
    </div>
  )
}
