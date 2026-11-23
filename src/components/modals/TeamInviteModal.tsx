import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Users,
  UserPlus,
  Copy,
  Check,
  Shield,
  Crown,
  Share2,
  Mail,
  Zap,
} from 'lucide-react'
import { useTaskContext } from '../../context/TaskContext'
import { Avatar } from '../common/Avatar'

export const TeamInviteModal: React.FC = () => {
  const {
    isTeamModalOpen,
    setIsTeamModalOpen,
    users,
    currentUser,
    activeProject,
  } = useTaskContext()

  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'admin' | 'member'>('member')
  const [copiedLink, setCopiedLink] = useState(false)
  const [invitedSuccess, setInvitedSuccess] = useState<string | null>(null)

  if (!isTeamModalOpen) return null

  const inviteUrl = `${window.location.origin}?workspace=${encodeURIComponent(activeProject.name.toLowerCase().replace(/\s+/g, '-'))}&invite=true`

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(inviteUrl)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail) return
    setInvitedSuccess(`Invitation sent to ${inviteEmail} as ${inviteRole}!`)
    setInviteEmail('')
    setTimeout(() => setInvitedSuccess(null), 3000)
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)]">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsTeamModalOpen(false)}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          data-testid="team-modal"
          className="relative w-full max-w-lg max-h-[min(90vh,90dvh)] overflow-y-auto momentum-scroll bg-[#0F0F17] border border-white/[0.12] rounded-2xl shadow-2xl z-10"
        >
          {/* Header */}
          <div className="relative p-5 sm:p-6 border-b border-white/[0.08] bg-gradient-to-r from-purple-900/20 via-violet-900/10 to-transparent">
            <button
              onClick={() => setIsTeamModalOpen(false)}
              title="Close modal"
              aria-label="Close modal"
              className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Team Members & Collaboration
                </h3>
                <p className="text-xs text-slate-400">
                  Workspace: <span className="text-purple-300 font-semibold">{activeProject.name}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Invite by Email */}
            <form onSubmit={handleSendInvite} className="space-y-3">
              <label className="block text-xs font-semibold text-slate-200">
                Invite team member
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    data-testid="team-invite-email-input"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="teammate@company.com"
                    className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as 'admin' | 'member')}
                  className="px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
                <button
                  type="submit"
                  data-testid="team-invite-submit-btn"
                  className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-purple-600/30 transition-all shrink-0"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Invite</span>
                </button>
              </div>
              {invitedSuccess && (
                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
                  {invitedSuccess}
                </div>
              )}
            </form>

            {/* Shareable Invite Link */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-medium text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Share2 className="w-3.5 h-3.5 text-purple-400" />
                  Direct Workspace Link
                </span>
                <span className="text-[10px] text-slate-400">Instant access</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={inviteUrl}
                  className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-400 truncate focus:outline-none select-all"
                />
                <button
                  onClick={handleCopyLink}
                  data-testid="team-copy-link-btn"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition-colors shrink-0"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Current Members List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Active Team Members ({users.length})
                </span>
                <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                  <Zap className="w-3 h-3" /> Realtime Sync Active
                </span>
              </div>

              <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                {users.map((u, idx) => {
                  const isOwner = idx === 0
                  const isCurrent = u.id === currentUser.id

                  return (
                    <div
                      key={u.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-white/[0.04] hover:border-white/[0.08] transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar user={u} size="sm" showStatus={true} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-200 truncate">
                              {u.name}
                            </span>
                            {isCurrent && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                You
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 truncate block">
                            {u.email}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {isOwner ? (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-semibold">
                            <Crown className="w-3 h-3" /> Owner
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-medium">
                            <Shield className="w-3 h-3 text-slate-400" /> Member
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
