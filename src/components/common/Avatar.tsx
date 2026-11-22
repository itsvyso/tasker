import React from 'react'
import type { User, UserStatus } from '../../types'

interface AvatarProps {
  user?: User
  name?: string
  avatar?: string
  status?: UserStatus
  size?: 'xs' | 'sm' | 'md' | 'lg'
  showStatus?: boolean
  className?: string
}

export const Avatar: React.FC<AvatarProps> = ({
  user,
  name,
  avatar,
  status,
  size = 'md',
  showStatus = false,
  className = '',
}) => {
  const displayName = user?.name || name || 'User'
  const imageSrc = user?.avatar || avatar
  const userStatus = user?.status || status

  const sizeClasses = {
    xs: 'w-5 h-5 text-[9px]',
    sm: 'w-7 h-7 text-xs',
    md: 'w-8 h-8 text-xs',
    lg: 'w-10 h-10 text-sm font-semibold',
  }

  const statusSizeClasses = {
    xs: 'w-1.5 h-1.5 right-0 bottom-0',
    sm: 'w-2 h-2 right-0 bottom-0',
    md: 'w-2.5 h-2.5 right-0 bottom-0',
    lg: 'w-3 h-3 right-0.5 bottom-0.5',
  }

  const statusColors = {
    online: 'bg-emerald-500 border-[#0B0F19]',
    busy: 'bg-rose-500 border-[#0B0F19]',
    away: 'bg-amber-500 border-[#0B0F19]',
    offline: 'bg-slate-500 border-[#0B0F19]',
  }

  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full shrink-0 ${sizeClasses[size]} ${className}`}
      title={displayName}
    >
      {imageSrc ? (
        <img
          src={imageSrc}
          alt={displayName}
          className="w-full h-full object-cover rounded-full ring-1 ring-white/10"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full rounded-full bg-purple-600/30 text-purple-200 border border-purple-500/30 flex items-center justify-center font-medium">
          {initials}
        </div>
      )}

      {showStatus && userStatus && (
        <span
          className={`absolute rounded-full border-2 ${statusSizeClasses[size]} ${
            statusColors[userStatus] || statusColors.offline
          }`}
        />
      )}
    </div>
  )
}
