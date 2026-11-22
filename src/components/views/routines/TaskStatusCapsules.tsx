import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useTaskContext } from '../../../context/TaskContext'
import { AnimatedCounter } from '../../common/AnimatedCounter'
import { snappySpring } from '../../../utils/motion'
import { BarChart3, Zap, Sparkles } from 'lucide-react'

export const TaskStatusCapsules: React.FC = () => {
  const { projectTasks, setFilters, filters } = useTaskContext()

  // Calculate task counts and completion rates per priority
  const stats = useMemo(() => {
    // High / Urgent priority tasks
    const highTasks = projectTasks.filter(
      (t) => t.priority === 'urgent' || t.priority === 'high'
    )
    const highDone = highTasks.filter((t) => t.status === 'done').length
    const highPercent = highTasks.length > 0 ? Math.round((highDone / highTasks.length) * 100) : 0

    // Medium priority tasks
    const medTasks = projectTasks.filter((t) => t.priority === 'medium')
    const medDone = medTasks.filter((t) => t.status === 'done').length
    const medPercent = medTasks.length > 0 ? Math.round((medDone / medTasks.length) * 100) : 0

    // Low priority tasks
    const lowTasks = projectTasks.filter((t) => t.priority === 'low')
    const lowDone = lowTasks.filter((t) => t.status === 'done').length
    const lowPercent = lowTasks.length > 0 ? Math.round((lowDone / lowTasks.length) * 100) : 0

    // Overall completion
    const total = projectTasks.length
    const totalDone = projectTasks.filter((t) => t.status === 'done').length
    const overallPercent = total > 0 ? Math.round((totalDone / total) * 100) : 0

    return {
      high: { total: highTasks.length, done: highDone, percent: highPercent },
      medium: { total: medTasks.length, done: medDone, percent: medPercent },
      low: { total: lowTasks.length, done: lowDone, percent: lowPercent },
      overall: { total, done: totalDone, percent: overallPercent },
    }
  }, [projectTasks])

  const capsules = [
    {
      id: 'high',
      label: 'High Priority',
      sublabel: 'Urgent & Critical',
      percent: stats.high.percent,
      done: stats.high.done,
      total: stats.high.total,
      gradient: 'from-pink-500 via-rose-500 to-purple-600',
      glowColor: 'rgba(244, 63, 94, 0.45)',
      borderColor: 'border-rose-500/30',
      textColor: 'text-rose-400',
      activeFilter: filters.priority === 'high' || filters.priority === 'urgent',
      onFilter: () => {
        setFilters({
          priority:
            filters.priority === 'high' || filters.priority === 'urgent'
              ? 'all'
              : 'high',
        })
      },
    },
    {
      id: 'medium',
      label: 'Medium Priority',
      sublabel: 'Sprint Milestones',
      percent: stats.medium.percent,
      done: stats.medium.done,
      total: stats.medium.total,
      gradient: 'from-purple-500 via-violet-600 to-cyan-400',
      glowColor: 'rgba(168, 85, 247, 0.45)',
      borderColor: 'border-purple-500/30',
      textColor: 'text-purple-400',
      activeFilter: filters.priority === 'medium',
      onFilter: () => {
        setFilters({ priority: filters.priority === 'medium' ? 'all' : 'medium' })
      },
    },
    {
      id: 'low',
      label: 'Low Priority',
      sublabel: 'Backlog Enhancements',
      percent: stats.low.percent,
      done: stats.low.done,
      total: stats.low.total,
      gradient: 'from-emerald-400 via-teal-500 to-cyan-500',
      glowColor: 'rgba(16, 185, 129, 0.45)',
      borderColor: 'border-emerald-500/30',
      textColor: 'text-emerald-400',
      activeFilter: filters.priority === 'low',
      onFilter: () => {
        setFilters({ priority: filters.priority === 'low' ? 'all' : 'low' })
      },
    },
  ]

  return (
    <div
      data-testid="task-status-capsules-card"
      className="relative rounded-2xl bg-[#0E0E14] border border-white/[0.08] shadow-xl p-5 overflow-hidden flex flex-col justify-between hover:border-purple-500/30 transition-all duration-300"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-56 h-56 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Card Header with Overall Percentage */}
      <div className="relative z-10 flex items-center justify-between pb-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center shadow-md shadow-purple-900/20">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">Task Status</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                3D Capsules
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Priority resolution & throughput rate
            </p>
          </div>
        </div>

        {/* Overall Completion Badge */}
        <div className="flex flex-col items-end">
          <div className="flex items-baseline gap-1">
            <AnimatedCounter
              value={stats.overall.percent}
              suffix="%"
              className="text-2xl font-black text-white font-mono tracking-tight"
            />
          </div>
          <span className="text-[10px] text-purple-300 font-medium">overall done</span>
        </div>
      </div>

      {/* 3D Vertical Cylinders / Capsules Display */}
      <div className="relative z-10 py-5 grid grid-cols-3 gap-3 sm:gap-4 items-end flex-1">
        {capsules.map((cap) => {
          const liquidHeightPercent = cap.percent === 0 ? 0 : Math.max(8, Math.min(100, cap.percent))

          return (
            <motion.div
              key={cap.id}
              whileHover={{ y: -4 }}
              transition={snappySpring}
              onClick={cap.onFilter}
              className={`flex flex-col items-center justify-between p-2.5 rounded-2xl cursor-pointer transition-all ${
                cap.activeFilter
                  ? 'bg-purple-950/40 ring-2 ring-purple-500/40 border border-purple-500/50 shadow-lg shadow-purple-950/40'
                  : 'bg-slate-950/40 hover:bg-slate-900/60 border border-white/[0.04]'
              }`}
            >
              {/* Percentage label above capsule */}
              <div className="text-center mb-2">
                <AnimatedCounter
                  value={cap.percent}
                  suffix="%"
                  className="text-lg font-black text-white font-mono tracking-tight block"
                />
                <span className="text-[10px] font-semibold text-slate-400 font-mono">
                  {cap.done}/{cap.total}
                </span>
              </div>

              {/* 3D Capsule Cylinder Chamber */}
              <div className="relative w-12 sm:w-14 h-36 sm:h-40 rounded-full bg-slate-950/80 border border-white/10 shadow-[inset_0_4px_12px_rgba(0,0,0,0.8),0_4px_12px_rgba(0,0,0,0.5)] p-1 overflow-hidden flex flex-col justify-end">
                {/* Internal tick markers */}
                <div className="absolute inset-y-2 inset-x-0 flex flex-col justify-between pointer-events-none opacity-20 px-1">
                  <div className="border-b border-white w-full" />
                  <div className="border-b border-white w-full" />
                  <div className="border-b border-white w-full" />
                  <div className="border-b border-white w-full" />
                </div>

                {/* 3D Liquid Fill Column */}
                <motion.div
                  initial={false}
                  animate={{ height: `${liquidHeightPercent}%` }}
                  transition={{ type: 'spring', stiffness: 180, damping: 20 }}
                  style={{
                    boxShadow:
                      liquidHeightPercent > 0
                        ? `0 0 20px ${cap.glowColor}, inset 0 2px 4px rgba(255,255,255,0.4)`
                        : 'none',
                  }}
                  className={`relative w-full rounded-full bg-gradient-to-t ${cap.gradient} overflow-hidden`}
                >
                  {/* Specular curved reflection along left side for 3D glass sheen */}
                  <div className="absolute inset-y-0 left-0 w-2.5 bg-gradient-to-r from-white/40 via-white/10 to-transparent rounded-l-full pointer-events-none" />

                  {/* Surface Meniscus (liquid top edge ellipse) */}
                  <div className="absolute top-0 inset-x-0 h-2 bg-white/40 rounded-full blur-[0.5px] pointer-events-none" />

                  {/* Gentle shimmer glow */}
                  <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-black/20 pointer-events-none" />
                </motion.div>
              </div>

              {/* Priority label below capsule */}
              <div className="mt-3 text-center">
                <span
                  className={`text-[11px] font-bold block tracking-tight ${cap.textColor}`}
                >
                  {cap.id.toUpperCase()}
                </span>
                <span className="text-[9px] text-slate-400 block truncate max-w-[80px]">
                  {cap.total} tasks
                </span>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Card Footer Status */}
      <div className="relative z-10 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-purple-400" />
          <span>Interactive 3D Capsules</span>
        </span>
        <span className="text-[10px] text-purple-300 font-mono">
          Click to filter sprint
        </span>
      </div>
    </div>
  )
}
