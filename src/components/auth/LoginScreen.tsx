import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTaskContext } from '../../context/TaskContext'
import {
  Zap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Sparkles,
} from 'lucide-react'

const REMEMBERED_EMAIL_KEY = 'taske_remembered_email'

export const LoginScreen: React.FC = () => {
  const { signInWithEmail } = useTaskContext()

  const [email, setEmail] = useState<string>(() => {
    try {
      return localStorage.getItem(REMEMBERED_EMAIL_KEY) || ''
    } catch {
      return ''
    }
  })
  const [password, setPassword] = useState<string>('')
  const [rememberMe, setRememberMe] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(REMEMBERED_EMAIL_KEY)
      return saved !== null ? Boolean(saved) : true
    } catch {
      return true
    }
  })
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    const cleanEmail = email.trim()
    if (!cleanEmail || !password) {
      setErrorMessage('Please enter both your email and password.')
      return
    }

    setIsLoading(true)
    try {
      if (rememberMe) {
        try {
          localStorage.setItem(REMEMBERED_EMAIL_KEY, cleanEmail)
        } catch {
          // ignore
        }
      } else {
        try {
          localStorage.removeItem(REMEMBERED_EMAIL_KEY)
        } catch {
          // ignore
        }
      }

      const { error } = await signInWithEmail(cleanEmail, password)
      if (error) {
        setErrorMessage(error.message || 'Invalid login credentials. Please verify and try again.')
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Authentication service error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      data-testid="login-screen"
      className="min-h-screen bg-[#08080B] text-slate-100 flex flex-col items-center justify-center p-4 relative selection:bg-purple-500/30 selection:text-purple-200 overflow-hidden font-sans"
    >
      {/* Ambient background glow & grid pattern */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-purple-600/20 via-violet-600/10 to-transparent blur-[140px] rounded-full" />
        <div className="absolute -bottom-20 -left-20 w-[600px] h-[600px] bg-fuchsia-600/10 blur-[150px] rounded-full" />
        <div className="absolute top-1/2 -right-40 w-[500px] h-[500px] bg-indigo-600/10 blur-[140px] rounded-full" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
      </div>

      <div className="relative z-10 w-full max-w-[440px] flex flex-col items-center">
        {/* Animated Brand Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="flex flex-col items-center mb-8 text-center"
        >
          {/* Animated floating logo */}
          <motion.div
            animate={{
              y: [0, -6, 0],
              scale: [1, 1.02, 1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 via-violet-600 to-fuchsia-500 p-0.5 shadow-2xl shadow-purple-600/40 flex items-center justify-center mb-4"
          >
            <div className="w-full h-full bg-[#09090D] rounded-[14px] flex items-center justify-center">
              <Zap className="w-8 h-8 text-purple-400 fill-purple-400/20 animate-pulse" />
            </div>
          </motion.div>

          <div className="flex items-center gap-2 mb-1.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Taske
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold tracking-wider uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
              PRO
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 font-medium flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            High-Performance Workspace
          </p>
        </motion.div>

        {/* Sign In Glassmorphic Panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
          className="w-full bg-[#0E0E14]/90 backdrop-blur-2xl border border-white/[0.09] rounded-2xl shadow-2xl shadow-purple-950/30 p-6 sm:p-8"
        >
          <div className="mb-6">
            <h2 className="text-lg font-bold text-white tracking-tight">
              Sign In to Workspace
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Enter your enterprise credentials to access your projects and tasks.
            </p>
          </div>

          {/* Animated Error Banner */}
          <AnimatePresence>
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -8 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                data-testid="login-error-banner"
                className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-2.5 shadow-sm"
              >
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Login Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Email Input */}
            <div>
              <label
                htmlFor="login-email"
                className="block text-xs font-semibold text-slate-300 mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="login-email"
                  type="email"
                  data-testid="login-email-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="engineer@company.com"
                  autoComplete="email"
                  required
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                />
              </div>
            </div>

            {/* Password Input with Eye Visibility Toggle */}
            <div>
              <label
                htmlFor="login-password"
                className="block text-xs font-semibold text-slate-300 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  data-testid="login-password-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all font-mono"
                />
                <button
                  type="button"
                  data-testid="login-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  data-testid="login-remember-me"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-purple-600 focus:ring-purple-500/30 accent-purple-600 cursor-pointer"
                />
                <span className="text-xs text-slate-300 font-medium">Remember me</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              data-testid="login-submit-btn"
              disabled={isLoading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-purple-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating session...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Invite-Only Administrator Notice */}
          <div
            data-testid="login-notice"
            className="mt-6 pt-5 border-t border-white/[0.08] text-center space-y-1.5"
          >
            <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-purple-300">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              <span>Invite-only access • Contact your workspace administrator for credentials</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              Users are provisioned centrally in the Supabase Dashboard.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
export default LoginScreen
