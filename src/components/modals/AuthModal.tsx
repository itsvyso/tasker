import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Cloud,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  Zap,
  LogOut,
  UserCheck,
  Monitor,
  Download,
  RefreshCw,
} from 'lucide-react'
import { useTaskContext } from '../../context/TaskContext'
import { isSupabaseConfigured, checkSupabaseHealth, type HealthCheckResult } from '../../lib/supabase'

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authUser,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    syncStatus,
    syncNow,
    isDesktop,
    desktopUpdateInfo,
    isCheckingUpdate,
    isInstallingUpdate,
    checkForUpdates,
    installUpdate,
  } = useTaskContext()

  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [health, setHealth] = useState<HealthCheckResult | null>(null)

  const isConfigured = isSupabaseConfigured()

  useEffect(() => {
    if (isAuthModalOpen) {
      checkSupabaseHealth().then(setHealth)
    }
  }, [isAuthModalOpen])

  if (!isAuthModalOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)

    if (!email || !password) {
      setErrorMessage('Please fill in both email and password.')
      return
    }

    if (!isConfigured) {
      setErrorMessage(
        'Supabase credentials are not configured in your environment. Provide VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable Cloud Auth.'
      )
      return
    }

    setIsLoading(true)
    try {
      if (mode === 'signin') {
        const { error } = await signInWithEmail(email, password)
        if (error) {
          setErrorMessage(error.message)
        } else {
          setSuccessMessage('Signed in successfully!')
          setTimeout(() => setIsAuthModalOpen(false), 800)
        }
      } else {
        const { error } = await signUpWithEmail(email, password)
        if (error) {
          setErrorMessage(error.message)
        } else {
          setSuccessMessage('Account created! Please check your email to verify.')
        }
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Authentication failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    setIsLoading(true)
    try {
      await signOut()
      setSuccessMessage('Signed out. Local offline mode active.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsAuthModalOpen(false)}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          data-testid="auth-modal"
          className="relative w-full max-w-md bg-[#0F0F17] border border-white/[0.12] rounded-2xl shadow-2xl overflow-hidden z-10"
        >
          {/* Header */}
          <div className="relative p-6 border-b border-white/[0.08] bg-gradient-to-r from-purple-900/20 via-violet-900/10 to-transparent">
            <button
              onClick={() => setIsAuthModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center">
                <Cloud className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  {authUser ? 'Cloud Sync & Team Account' : 'Cloud Team Synchronization'}
                </h3>
                <p className="text-xs text-slate-400">
                  {isConfigured ? 'Supabase Real-Time Backend Active' : 'Offline-First Mode Active'}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-5">
            {/* Connection Status Badge */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-2.5 h-2.5 rounded-full ${
                    syncStatus === 'synced'
                      ? 'bg-emerald-400 ring-4 ring-emerald-500/20'
                      : syncStatus === 'syncing'
                      ? 'bg-amber-400 animate-pulse ring-4 ring-amber-500/20'
                      : isConfigured
                      ? 'bg-indigo-400'
                      : 'bg-slate-400'
                  }`}
                />
                <div>
                  <div className="text-xs font-semibold text-slate-200">
                    Status: <span className="capitalize">{syncStatus}</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {health?.message || (isConfigured ? 'Connected to Supabase' : 'Zero-config local storage')}
                  </div>
                </div>
              </div>

              {isConfigured && (
                <button
                  onClick={() => syncNow()}
                  className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 border border-purple-500/30 transition-colors"
                >
                  Sync Now
                </button>
              )}
            </div>

            {authUser ? (
              /* Signed In Profile View */
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.06] space-y-2">
                  <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                    <UserCheck className="w-4 h-4" />
                    <span>Signed in as</span>
                  </div>
                  <div className="text-sm font-mono text-white truncate">{authUser.email}</div>
                  <div className="text-[11px] text-slate-400">
                    User ID: <span className="font-mono text-slate-300">{authUser.id.slice(0, 12)}...</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleSignOut}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 text-xs font-semibold transition-colors disabled:opacity-50"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out to Offline Mode</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Auth Form */
              <form onSubmit={handleSubmit} className="space-y-4">
                {!isConfigured && (
                  <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-800/40 text-purple-200 text-xs space-y-1.5">
                    <div className="flex items-center gap-1.5 font-semibold text-purple-300">
                      <Zap className="w-4 h-4 text-purple-400" />
                      <span>Instant Offline Demo Mode</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      You are currently using Tasker with full local persistence. To enable multi-user team
                      collaboration, add your free Supabase URL and Anon Key to <code className="text-purple-300">.env</code>.
                    </p>
                  </div>
                )}

                {errorMessage && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
                    {errorMessage}
                  </div>
                )}

                {successMessage && (
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
                    {successMessage}
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        data-testid="auth-email-input"
                        placeholder="team.lead@agency.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="password"
                        data-testid="auth-password-input"
                        placeholder="••••••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    data-testid="auth-submit-btn"
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/30 transition-all disabled:opacity-50"
                  >
                    <span>{isLoading ? 'Processing...' : mode === 'signin' ? 'Sign In to Cloud' : 'Create Free Account'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                    className="text-xs text-slate-400 hover:text-purple-300 text-center py-1 transition-colors"
                  >
                    {mode === 'signin'
                      ? "Don't have an account? Sign up"
                      : 'Already have an account? Sign in'}
                  </button>
                </div>
              </form>
            )}

            {/* Desktop & Auto-Updater Section */}
            <div className="pt-3 border-t border-white/[0.08] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <Monitor className="w-3.5 h-3.5 text-purple-400" />
                  <span className="font-semibold">{isDesktop ? 'Tauri Desktop App' : 'Mobile PWA & Web'}</span>
                </div>
                {isDesktop && (
                  <button
                    type="button"
                    onClick={() => checkForUpdates()}
                    disabled={isCheckingUpdate}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3 h-3 ${isCheckingUpdate ? 'animate-spin' : ''}`} />
                    <span>{isCheckingUpdate ? 'Checking...' : 'Check for Updates'}</span>
                  </button>
                )}
              </div>

              {isDesktop ? (
                desktopUpdateInfo?.available ? (
                  <div className="p-3 rounded-xl bg-purple-900/30 border border-purple-500/30 text-xs space-y-2">
                    <div className="flex items-center justify-between text-purple-200">
                      <span className="font-semibold">Update Available: v{desktopUpdateInfo.newVersion}</span>
                      <span className="text-[10px] text-purple-400">Current: v{desktopUpdateInfo.currentVersion || '1.0.0'}</span>
                    </div>
                    {desktopUpdateInfo.body && (
                      <p className="text-[11px] text-slate-300">{desktopUpdateInfo.body}</p>
                    )}
                    <button
                      type="button"
                      onClick={() => installUpdate()}
                      disabled={isInstallingUpdate}
                      className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md transition-colors disabled:opacity-50"
                    >
                      <Download className={`w-3.5 h-3.5 ${isInstallingUpdate ? 'animate-bounce' : ''}`} />
                      <span>{isInstallingUpdate ? 'Installing & Restarting...' : 'Install Update & Restart'}</span>
                    </button>
                  </div>
                ) : desktopUpdateInfo ? (
                  <p className="text-[11px] text-slate-400">
                    You're running the latest version (v{desktopUpdateInfo.currentVersion || '1.0.0'}).
                  </p>
                ) : null
              ) : (
                <p className="text-[11px] text-slate-400">
                  Native Windows (.exe/.msi) and macOS (.dmg) builds with background auto-updates configured.
                </p>
              )}
            </div>

            {/* Offline-First Guarantee Banner */}
            <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Offline-First local storage
              </span>
              <button
                onClick={() => setIsAuthModalOpen(false)}
                className="text-purple-400 hover:text-purple-300 font-medium"
              >
                Continue Offline
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
