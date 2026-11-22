import React from 'react'
import { motion } from 'framer-motion'

interface ShimmerWaveProps {
  className?: string
  duration?: number
  repeatDelay?: number
}

export const ShimmerWave: React.FC<ShimmerWaveProps> = ({
  className = '',
  duration = 2.2,
  repeatDelay = 3.5,
}) => {
  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden rounded-[inherit] z-10 ${className}`}
    >
      <motion.div
        className="w-1/2 h-full absolute top-0 -left-1/2 bg-gradient-to-r from-transparent via-violet-400/20 to-transparent skew-x-[-20deg] shadow-[0_0_18px_rgba(168,85,247,0.2)]"
        animate={{
          left: ['-50%', '150%'],
        }}
        transition={{
          repeat: Infinity,
          repeatDelay,
          duration,
          ease: 'easeInOut',
        }}
      />
    </div>
  )
}

