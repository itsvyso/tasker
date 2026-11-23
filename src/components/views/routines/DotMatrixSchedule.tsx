import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTaskContext } from '../../../context/TaskContext'
import { Avatar } from '../../common/Avatar'
import { AnimatedCounter } from '../../common/AnimatedCounter'
import { snappySpring } from '../../../utils/motion'
import { INITIAL_ROUTINE_SCHEDULE_BLOCKS } from '../../../mock/initialData'
import {
  CalendarDays,
  Clock,
  Filter,
  AlertCircle,
  Sparkles,
} from 'lucide-react'

// Days timeline representation (2M ... 6F ... 13F)
const TIMELINE_DAYS = [
  { dayNumber: 2, dayLetter: 'M', dayLabel: 'Mon' },
  { dayNumber: 3, dayLetter: 'T', dayLabel: 'Tue' },
  { dayNumber: 4, dayLetter: 'W', dayLabel: 'Wed' },
  { dayNumber: 5, dayLetter: 'T', dayLabel: 'Thu' },
  { dayNumber: 6, dayLetter: 'F', dayLabel: 'Fri', isDefault: true },
  { dayNumber: 7, dayLetter: 'S', dayLabel: 'Sat' },
  { dayNumber: 8, dayLetter: 'S', dayLabel: 'Sun' },
  { dayNumber: 9, dayLetter: 'M', dayLabel: 'Mon' },
  { dayNumber: 10, dayLetter: 'T', dayLabel: 'Tue' },
  { dayNumber: 11, dayLetter: 'W', dayLabel: 'Wed' },
  { dayNumber: 12, dayLetter: 'T', dayLabel: 'Thu' },
  { dayNumber: 13, dayLetter: 'F', dayLabel: 'Fri' },
]

const TIME_MARKS = ['09:00', '11:00', '13:00', '15:00', '17:00', '19:00']

type StatusFilter = 'All' | 'In Test' | 'Reviewed' | 'Complete'

export const DotMatrixSchedule: React.FC = () => {
  const { users, projectTasks, setSelectedTaskId } = useTaskContext()
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(4) // Day 6 F default
  const [showAllDays, setShowAllDays] = useState<boolean>(false)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All')
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)

  // Map users for fast avatar lookup
  const userMap = useMemo(() => {
    return new Map(users.map((u) => [u.id, u]))
  }, [users])

  // Count scheduled blocks per day for timeline dot indicators
  const blocksPerDay = useMemo(() => {
    const counts = new Map<number, number>()
    INITIAL_ROUTINE_SCHEDULE_BLOCKS.forEach((b) => {
      counts.set(b.dayIndex, (counts.get(b.dayIndex) || 0) + 1)
    })
    return counts
  }, [])

  // Upcoming tasks count from context (defensive: accurately count tasks not in 'done' status)
  const upcomingCount = useMemo(() => {
    return projectTasks.filter((t) => t.status !== 'done').length
  }, [projectTasks])

  // Scoped blocks: either filtered by selected day or all days
  const scopedBlocks = useMemo(() => {
    if (showAllDays) {
      return INITIAL_ROUTINE_SCHEDULE_BLOCKS
    }
    return INITIAL_ROUTINE_SCHEDULE_BLOCKS.filter((b) => b.dayIndex === selectedDayIndex)
  }, [selectedDayIndex, showAllDays])

  // Count by status filter for the current scoped view
  const filterCounts = useMemo(() => {
    return {
      All: scopedBlocks.length,
      'In Test': scopedBlocks.filter((b) => b.status === 'In Test').length,
      Reviewed: scopedBlocks.filter((b) => b.status === 'Reviewed').length,
      Complete: scopedBlocks.filter((b) => b.status === 'Complete').length,
    }
  }, [scopedBlocks])

  // Visible filtered blocks
  const visibleBlocks = useMemo(() => {
    return scopedBlocks.filter((block) => {
      if (statusFilter !== 'All' && block.status !== statusFilter) {
        return false
      }
      return true
    })
  }, [scopedBlocks, statusFilter])

  // Active day info
  const activeDay = TIMELINE_DAYS[selectedDayIndex] || TIMELINE_DAYS[4]

  return (
    <div
      data-testid="dot-matrix-schedule-card"
      className="relative rounded-2xl bg-[#0E0E14] border border-white/[0.08] shadow-xl p-5 overflow-hidden flex flex-col justify-between hover:border-purple-500/30 transition-all duration-300"
    >
      {/* Subtle Dot Matrix Grid Canvas/CSS Background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(168, 85, 247, 0.22) 1.25px, transparent 1.25px)',
          backgroundSize: '18px 18px',
          backgroundPosition: '0 0',
        }}
      />

      {/* Ambient gradient lighting */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Card Header */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center shadow-md shadow-purple-900/20">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">
                Projects Timeline & Routine Schedule
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                Live Grid
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Interactive timeline tracks & time-block allocations on dot matrix canvas
            </p>
          </div>
        </div>

        {/* Selected Day / All Days View Mode Toggle Pill */}
        <div className="flex items-center gap-2 self-start sm:self-auto bg-slate-900/80 px-3 py-1.5 rounded-xl border border-white/[0.08]">
          <span className="text-xs text-slate-400 font-medium">Timeline View:</span>
          <button
            onClick={() => setShowAllDays(!showAllDays)}
            className={`px-2 py-0.5 rounded-md font-mono text-xs font-bold transition-all ${
              showAllDays
                ? 'bg-indigo-600/40 text-indigo-200 border border-indigo-400/50 shadow-xs'
                : 'bg-purple-600/30 text-purple-200 border border-purple-400/40'
            }`}
          >
            {showAllDays ? 'All Sprint Days' : `Day ${activeDay.dayNumber} (${activeDay.dayLabel})`}
          </button>
        </div>
      </div>

      {/* Days Timeline Header (2M ... 6F ... 13F) */}
      <div className="relative z-10 py-3.5 border-b border-white/[0.06] overflow-x-auto momentum-scroll no-scrollbar">
        <div className="flex items-center gap-2 min-w-max pb-1">
          {TIMELINE_DAYS.map((day, idx) => {
            const isSelected = !showAllDays && selectedDayIndex === idx
            const dayBlockCount = blocksPerDay.get(idx) || 0
            return (
              <motion.button
                key={`${day.dayNumber}-${day.dayLetter}-${idx}`}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={snappySpring}
                onClick={() => {
                  setSelectedDayIndex(idx)
                  setShowAllDays(false)
                }}
                className={`relative flex flex-col items-center justify-center w-11 h-13 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-gradient-to-b from-purple-600 to-indigo-700 text-white shadow-lg shadow-purple-600/35 border border-purple-400/40 ring-2 ring-purple-500/20'
                    : 'bg-slate-900/60 hover:bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-white/[0.06]'
                }`}
              >
                <span className="text-[13px] font-bold font-mono tracking-tight leading-tight">
                  {day.dayNumber}
                </span>
                <span
                  className={`text-[10px] font-semibold uppercase ${
                    isSelected ? 'text-purple-200' : 'text-slate-400'
                  }`}
                >
                  {day.dayLetter}
                </span>
                {/* Dot indicator for scheduled blocks */}
                {dayBlockCount > 0 && !isSelected && (
                  <span className="w-1 h-1 rounded-full bg-purple-400/80 mt-0.5" />
                )}
                {isSelected && (
                  <motion.div
                    layoutId="activeDayIndicator"
                    className="absolute -bottom-1 w-2 h-1 rounded-full bg-purple-300"
                    transition={snappySpring}
                  />
                )}
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Main Grid Content: Side-Strip + Timeline Lanes */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-4 pt-4 flex-1">
        {/* Left Side-Strip: Upcoming Counter & Status Filters */}
        <div className="md:col-span-3 flex flex-col justify-between gap-3 p-3.5 rounded-xl bg-slate-950/60 border border-white/[0.06]">
          {/* Upcoming Tasks Counter */}
          <div className="p-3 rounded-lg bg-gradient-to-br from-purple-950/40 via-slate-900/60 to-indigo-950/30 border border-purple-500/20">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Upcoming Tasks
            </span>
            <div className="flex items-baseline gap-2 mt-1.5">
              <AnimatedCounter
                value={upcomingCount}
                className="text-2xl font-black text-white font-mono tracking-tight"
              />
              <span className="text-[11px] text-purple-300 font-medium">in queue</span>
            </div>
          </div>

          {/* Quick Status Filter Buttons */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-1 flex items-center gap-1.5">
              <Filter className="w-3 h-3 text-slate-400" />
              Status Filter
            </span>
            {(['All', 'In Test', 'Reviewed', 'Complete'] as StatusFilter[]).map((st) => {
              const isActive = statusFilter === st
              const count = filterCounts[st]
              return (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-purple-600/25 text-purple-200 border border-purple-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        st === 'Complete'
                          ? 'bg-emerald-400'
                          : st === 'In Test'
                          ? 'bg-amber-400'
                          : st === 'Reviewed'
                          ? 'bg-cyan-400'
                          : 'bg-purple-400'
                      }`}
                    />
                    <span>{st}</span>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                      isActive ? 'bg-purple-800/50 text-purple-200' : 'bg-slate-800/70 text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Quick tips */}
          <div className="pt-2 border-t border-white/[0.04] text-[10px] text-slate-400 leading-relaxed">
            Click any block pill to inspect assignee, duration & velocity progress.
          </div>
        </div>

        {/* Right Timeline Canvas: Time Grid with Block Pills */}
        <div className="md:col-span-9 flex flex-col justify-between rounded-xl bg-slate-950/40 border border-white/[0.06] p-3.5 relative overflow-hidden">
          {/* Time axis header */}
          <div className="grid grid-cols-6 gap-2 pb-2.5 border-b border-white/[0.06] text-center">
            {TIME_MARKS.map((time) => (
              <span key={time} className="text-[10px] font-mono font-medium text-slate-400">
                {time}
              </span>
            ))}
          </div>

          {/* Schedule Tracks */}
          <div className="space-y-2.5 py-3 flex-1 min-h-[170px] relative">
            {/* Vertical grid lines */}
            <div className="absolute inset-0 grid grid-cols-6 gap-2 pointer-events-none opacity-20">
              {TIME_MARKS.map((time) => (
                <div key={time} className="border-r border-dashed border-purple-400/30 h-full" />
              ))}
            </div>

            {/* Render interactive time-block pills */}
            <AnimatePresence mode="popLayout">
              {visibleBlocks.map((block) => {
                const assignee = userMap.get(block.assigneeId)
                const isSelected = selectedBlockId === block.id

                // Status styling
                const statusStyles = {
                  'In Test': {
                    pillBorder: 'border-amber-500/30',
                    pillBg: 'from-amber-950/30 to-slate-900/60',
                    badge: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
                    ringColor: '#F59E0B',
                  },
                  Reviewed: {
                    pillBorder: 'border-cyan-500/30',
                    pillBg: 'from-cyan-950/30 to-slate-900/60',
                    badge: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
                    ringColor: '#06B6D4',
                  },
                  Complete: {
                    pillBorder: 'border-emerald-500/30',
                    pillBg: 'from-emerald-950/30 to-slate-900/60',
                    badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
                    ringColor: '#10B981',
                  },
                }[block.status]

                // Circular progress ring calculation
                const radius = 10
                const circumference = 2 * Math.PI * radius
                const strokeDashoffset = circumference - (block.progress / 100) * circumference

                return (
                  <motion.div
                    key={block.id}
                    layout
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.94 }}
                    whileHover={{ scale: 1.015, y: -2 }}
                    whileTap={{ scale: 0.985 }}
                    transition={snappySpring}
                    onClick={() => {
                      setSelectedBlockId(block.id)
                      // Optionally select corresponding project task
                      const matchingTask = projectTasks.find((t) =>
                        t.title.toLowerCase().includes(block.title.toLowerCase())
                      )
                      if (matchingTask) {
                        setSelectedTaskId(matchingTask.id)
                      }
                    }}
                    className={`relative z-10 flex items-center justify-between p-2.5 rounded-xl cursor-pointer bg-gradient-to-r ${
                      statusStyles.pillBg
                    } border ${
                      isSelected
                        ? 'border-purple-400 ring-2 ring-purple-500/30 shadow-lg shadow-purple-950/50'
                        : `${statusStyles.pillBorder} hover:border-purple-400/50`
                    } shadow-md transition-all select-none`}
                  >
                    {/* Left: Avatar + Title + Duration */}
                    <div className="flex items-center gap-3 min-w-0">
                      {assignee ? (
                        <Avatar user={assignee} size="sm" showStatus={false} />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-purple-600/30 flex items-center justify-center text-[10px] font-bold text-purple-200">
                          {block.title.charAt(0)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white tracking-tight truncate">
                            {block.title}
                          </span>
                          <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-slate-800 text-purple-300 border border-slate-700/60">
                            {block.duration}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                          <Clock className="w-2.5 h-2.5" />
                          <span>{block.startTime}</span>
                          <span>•</span>
                          <span>{block.category}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Progress Ring + Status Badge */}
                    <div className="flex items-center gap-3 shrink-0">
                      {/* Mini SVG Progress Ring */}
                      <div className="relative flex items-center justify-center w-7 h-7">
                        <svg className="w-7 h-7 -rotate-90">
                          <circle
                            cx="14"
                            cy="14"
                            r={radius}
                            stroke="#1E1E2E"
                            strokeWidth="2.5"
                            fill="transparent"
                          />
                          <motion.circle
                            cx="14"
                            cy="14"
                            r={radius}
                            stroke={statusStyles.ringColor}
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            fill="transparent"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            transition={snappySpring}
                          />
                        </svg>
                        <span className="absolute text-[8px] font-bold font-mono text-slate-200">
                          {block.progress}%
                        </span>
                      </div>

                      {/* Status Tag */}
                      <span
                        className={`hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusStyles.badge}`}
                      >
                        {block.status}
                      </span>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>

            {visibleBlocks.length === 0 && (
              <div className="h-36 flex flex-col items-center justify-center text-slate-400 text-xs text-center p-4">
                <AlertCircle className="w-5 h-5 mb-1.5 text-purple-400" />
                <span className="font-semibold text-slate-300">
                  No schedule blocks found {statusFilter !== 'All' ? `with status "${statusFilter}"` : `for Day ${activeDay.dayNumber}`}
                </span>
                <span className="text-[11px] text-slate-500 mt-1 max-w-xs">
                  Switch back to active Day 6 (Fri) or clear status filters to view tracks.
                </span>
                <button
                  onClick={() => {
                    setSelectedDayIndex(4)
                    setShowAllDays(false)
                    setStatusFilter('All')
                  }}
                  className="mt-2.5 px-3 py-1 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 text-[11px] font-semibold transition-all"
                >
                  View Showcase Day 6 (Fri)
                </button>
              </div>
            )}
          </div>

          {/* Bottom Grid Status Bar */}
          <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Dot Matrix Schedule Active
            </span>
            <span className="font-mono">
              {visibleBlocks.length} blocks allocated
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
