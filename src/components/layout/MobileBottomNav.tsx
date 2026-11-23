import React from 'react'
import { motion } from 'framer-motion'
import { useTaskContext } from '../../context/TaskContext'
import type { ViewMode } from '../../types'
import { snappySpring } from '../../utils/motion'
import {
  LayoutGrid,
  Kanban,
  Table as TableIcon,
  Sparkles,
  Plus,
} from 'lucide-react'

export const MobileBottomNav: React.FC = () => {
  const { activeView, setActiveView, openCreateTaskModal } = useTaskContext()

  const tabs: { id: ViewMode; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Bento', icon: LayoutGrid },
    { id: 'kanban', label: 'Board', icon: Kanban },
    { id: 'table', label: 'Table', icon: TableIcon },
    { id: 'routines', label: 'Routines', icon: Sparkles },
  ]

  const isSecondaryView = !tabs.some((t) => t.id === activeView)
  const secondaryViewLabel = {
    calendar: 'Sprint Calendar',
    timeline: 'Timeline & Gantt',
    team_chat: 'Team Messenger',
  }[activeView as 'calendar' | 'timeline' | 'team_chat']

  return (
    <nav
      data-testid="mobile-bottom-nav"
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-30 md:hidden bg-[#09090E]/95 backdrop-blur-2xl border-t border-white/[0.08] px-3 pt-1.5 pb-[max(0.6rem,env(safe-area-inset-bottom,0px))] shadow-[0_-10px_35px_rgba(0,0,0,0.7)] select-none"
    >
      {/* Active context pill if viewing secondary views */}
      {isSecondaryView && secondaryViewLabel && (
        <div className="flex items-center justify-center gap-1.5 pb-1 text-[10px] font-semibold text-purple-300">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
          <span>Active View: {secondaryViewLabel}</span>
        </div>
      )}

      <div className="max-w-md mx-auto flex items-center justify-around relative">
        {/* First two tabs: Bento & Board */}
        {tabs.slice(0, 2).map((tab) => {
          const Icon = tab.icon
          const isActive = activeView === tab.id

          return (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id)}
              className="relative flex flex-col items-center justify-center min-w-[54px] min-h-[46px] rounded-xl px-2 py-1 transition-colors"
              aria-label={tab.label}
            >
              <div
                className={`relative p-1 rounded-xl transition-all ${
                  isActive
                    ? 'text-purple-300 bg-purple-500/20 shadow-sm shadow-purple-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-5 h-5" />
                {isActive && (
                  <motion.div
                    layoutId="mobileNavActiveDot"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-purple-400 shadow-[0_0_8px_#A855F7]"
                    transition={snappySpring}
                  />
                )}
              </div>
              <span
                className={`text-[10px] font-semibold mt-0.5 tracking-tight transition-colors ${
                  isActive ? 'text-purple-300 font-bold' : 'text-slate-400'
                }`}
              >
                {tab.label}
              </span>
            </button>
          )
        })}

        {/* Center Floating Quick Add Task Button */}
        <div className="relative -top-3">
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            transition={snappySpring}
            onClick={() => openCreateTaskModal()}
            className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-violet-600 to-indigo-600 shadow-lg shadow-purple-600/40 border border-purple-400/40 text-white flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-purple-400/50"
            aria-label="Create New Task"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </motion.button>
        </div>

        {/* Last two tabs: Table & Routines */}
        {tabs.slice(2, 4).map((tab) => {
          const Icon = tab.icon
          const isActive = activeView === tab.id

          return (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id)}
              className="relative flex flex-col items-center justify-center min-w-[54px] min-h-[46px] rounded-xl px-2 py-1 transition-colors"
              aria-label={tab.label}
            >
              <div
                className={`relative p-1 rounded-xl transition-all ${
                  isActive
                    ? 'text-purple-300 bg-purple-500/20 shadow-sm shadow-purple-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-5 h-5" />
                {isActive && (
                  <motion.div
                    layoutId="mobileNavActiveDot"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-purple-400 shadow-[0_0_8px_#A855F7]"
                    transition={snappySpring}
                  />
                )}
              </div>
              <span
                className={`text-[10px] font-semibold mt-0.5 tracking-tight transition-colors ${
                  isActive ? 'text-purple-300 font-bold' : 'text-slate-400'
                }`}
              >
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
export default MobileBottomNav
