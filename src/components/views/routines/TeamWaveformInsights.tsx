import React, { useState, useEffect, useRef, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useTaskContext } from '../../../context/TaskContext'
import { Avatar } from '../../common/Avatar'
import { snappySpring } from '../../../utils/motion'
import {
  Activity,
  Play,
  Pause,
  Sparkles,
  Radio,
} from 'lucide-react'

// Velocity / rhythm profile for each team member
const TEAM_CADENCE: Record<string, { role: string; tempoBpm: number; focusScore: number; commits: number }> = {
  'user-1': { role: 'Product Architect', tempoBpm: 128, focusScore: 96, commits: 18 },
  'user-2': { role: 'Principal Designer', tempoBpm: 114, focusScore: 92, commits: 14 },
  'user-3': { role: 'Core Systems Lead', tempoBpm: 140, focusScore: 98, commits: 26 },
  'user-4': { role: 'Mobile Lead', tempoBpm: 122, focusScore: 90, commits: 19 },
  'user-5': { role: 'Security & DevOps', tempoBpm: 134, focusScore: 95, commits: 22 },
}

export const TeamWaveformInsights: React.FC = () => {
  const { users } = useTaskContext()
  const [isPlaying, setIsPlaying] = useState<boolean>(true)
  const [selectedUserId, setSelectedUserId] = useState<string>(users[0]?.id || 'user-1')

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animFrameIdRef = useRef<number | null>(null)
  const phaseRef = useRef<number>(0)

  const activeUser = useMemo(() => {
    return users.find((u) => u.id === selectedUserId) || users[0]
  }, [users, selectedUserId])

  const activeCadence = useMemo(() => {
    return (
      TEAM_CADENCE[selectedUserId] || {
        role: activeUser?.role || 'Engineer',
        tempoBpm: 124,
        focusScore: 94,
        commits: 16,
      }
    )
  }, [selectedUserId, activeUser])

  // Canvas 2D Waveform Animation loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let isRunning = true

    const render = () => {
      if (!isRunning) return

      // Handle responsive high-DPI canvas buffer
      const rect = canvas.getBoundingClientRect ? canvas.getBoundingClientRect() : { width: 360, height: 80 }
      const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
      const logicalWidth = rect.width > 0 ? rect.width : 360
      const logicalHeight = rect.height > 0 ? rect.height : 80

      const targetPixelWidth = Math.round(logicalWidth * dpr)
      const targetPixelHeight = Math.round(logicalHeight * dpr)

      if (canvas.width !== targetPixelWidth || canvas.height !== targetPixelHeight) {
        canvas.width = targetPixelWidth
        canvas.height = targetPixelHeight
      }

      ctx.save()
      if (typeof ctx.scale === 'function') {
        ctx.scale(dpr, dpr)
      }
      ctx.clearRect(0, 0, logicalWidth, logicalHeight)

      // Bar settings
      const numBars = 36
      const barSpacing = 4
      const availableWidth = logicalWidth - (numBars - 1) * barSpacing
      const barWidth = Math.max(3, availableWidth / numBars)

      // Speed depends on tempo & playing state
      const speed = isPlaying ? (activeCadence.tempoBpm / 60) * 0.045 : 0.008
      phaseRef.current += speed

      // Setup gradient & glow safely
      const gradient = ctx.createLinearGradient ? ctx.createLinearGradient(0, logicalHeight, 0, 0) : null
      if (gradient && typeof gradient.addColorStop === 'function') {
        gradient.addColorStop(0, '#6366F1') // Indigo
        gradient.addColorStop(0.5, '#A855F7') // Purple
        gradient.addColorStop(1, '#EC4899') // Pink
        ctx.fillStyle = gradient
      } else {
        ctx.fillStyle = '#A855F7'
      }

      ctx.shadowColor = '#A855F7'
      ctx.shadowBlur = isPlaying ? 12 : 4

      for (let i = 0; i < numBars; i++) {
        const x = i * (barWidth + barSpacing)
        const progress = i / numBars

        // Dynamic wave equation mixing sine harmonics
        const freq1 = Math.sin(phaseRef.current + progress * 7)
        const freq2 = Math.cos(phaseRef.current * 0.7 + progress * 11)
        const freq3 = Math.sin(phaseRef.current * 1.3 + progress * 3)

        let amplitude: number
        if (isPlaying) {
          amplitude = Math.abs(freq1 * 0.5 + freq2 * 0.35 + freq3 * 0.25)
          amplitude = Math.max(0.12, Math.min(0.95, amplitude))
        } else {
          // Gentle resting harmonic wave
          amplitude = 0.2 + 0.12 * Math.sin(progress * Math.PI * 2 + phaseRef.current)
        }

        const barHeight = amplitude * (logicalHeight - 12)
        const y = (logicalHeight - barHeight) / 2
        const cornerRadius = Math.max(1, Math.min(3, barHeight / 2, barWidth / 2))

        // Draw rounded bar
        ctx.beginPath()
        if (typeof (ctx as any).roundRect === 'function') {
          ;(ctx as any).roundRect(x, y, barWidth, barHeight, cornerRadius)
        } else {
          ctx.rect(x, y, barWidth, barHeight)
        }
        ctx.fill()
      }

      ctx.restore()

      animFrameIdRef.current = requestAnimationFrame(render)
    }

    render()

    return () => {
      isRunning = false
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current)
      }
    }
  }, [isPlaying, activeCadence])

  return (
    <div
      data-testid="team-waveform-insights-card"
      className="relative rounded-2xl bg-[#0E0E14] border border-white/[0.08] shadow-xl p-5 overflow-hidden flex flex-col justify-between hover:border-purple-500/30 transition-all duration-300"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-10 w-52 h-52 bg-fuchsia-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Card Header */}
      <div className="relative z-10 flex items-center justify-between pb-3.5 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center shadow-md shadow-purple-900/20">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">
                Team Insights
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                2D Equalizer
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Live engineering tempo & collaboration rhythm
            </p>
          </div>
        </div>

        {/* Play / Pause Toggle Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsPlaying(!isPlaying)}
          title={isPlaying ? 'Pause equalizer stream' : 'Resume equalizer stream'}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
            isPlaying
              ? 'bg-purple-600/20 text-purple-200 border-purple-500/40 shadow-sm'
              : 'bg-slate-800 text-slate-300 border-slate-700'
          }`}
        >
          {isPlaying ? (
            <>
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span>Streaming</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Resume</span>
            </>
          )}
        </motion.button>
      </div>

      {/* Team Member Avatars Selector */}
      <div className="relative z-10 py-3 flex items-center justify-between border-b border-white/[0.04]">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Select Member:
        </span>
        <div className="flex items-center gap-2">
          {users.slice(0, 5).map((user) => {
            const isSelected = user.id === selectedUserId
            return (
              <motion.button
                key={user.id}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                transition={snappySpring}
                onClick={() => setSelectedUserId(user.id)}
                title={`${user.name} (${user.role})`}
                className={`relative rounded-full p-0.5 transition-all ${
                  isSelected
                    ? 'ring-2 ring-purple-400 ring-offset-2 ring-offset-[#0E0E14] shadow-md shadow-purple-900/50'
                    : 'opacity-65 hover:opacity-100'
                }`}
              >
                <Avatar user={user} size="sm" showStatus={false} />
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Active Member Focus Cadence Stats */}
      <div className="relative z-10 py-2.5 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-white block">
            {activeUser?.name || 'Team Member'}
          </span>
          <span className="text-[10px] text-purple-300 font-medium">
            {activeCadence.role}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block uppercase">Tempo</span>
            <span className="text-xs font-mono font-bold text-white">
              {activeCadence.tempoBpm} BPM
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block uppercase">Focus</span>
            <span className="text-xs font-mono font-bold text-emerald-400">
              {activeCadence.focusScore}%
            </span>
          </div>
        </div>
      </div>

      {/* Canvas 2D Waveform Equalizer */}
      <div className="relative z-10 py-2 my-1 rounded-xl bg-slate-950/70 border border-white/[0.05] p-3 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={360}
          height={80}
          className="w-full h-20 block"
        />
      </div>

      {/* Card Footer */}
      <div className="relative z-10 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5">
          <Radio className={`w-3.5 h-3.5 ${isPlaying ? 'text-purple-400 animate-pulse' : 'text-slate-400'}`} />
          <span>{isPlaying ? 'Live Waveform Equalizer' : 'Equalizer Paused'}</span>
        </span>
        <span className="text-[10px] text-purple-300 font-mono">
          Canvas 2D Harmonic
        </span>
      </div>
    </div>
  )
}
