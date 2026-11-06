import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../lib/auth.jsx'
import { useTheme } from '../lib/theme.jsx'
import { Button } from '../components/ui.jsx'
import Logo from '../components/Logo.jsx'
import {
  Sun,
  Moon,
  Mail,
  Lock,
  Eye,
  EyeOff,
  BarChart3,
  Building2,
  Users,
  KanbanSquare,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react'

export default function Login() {
  const { user, login, loading } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [email, setEmail] = useState('owner@rdx.com')
  const [password, setPassword] = useState('password123')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (loading) return null
  if (user) return <Navigate to="/" replace />

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password.')
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-surface">
      {/* Left brand panel (hidden on mobile) */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-linear-to-br from-brand-700 via-brand-800 to-ink-900 p-12 lg:flex">
        {/* Decorative circles */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-brand-400/10 blur-3xl" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 p-2 backdrop-blur">
            <Logo size={28} withText={false} />
          </div>
          <div>
            <div className="text-lg font-semibold text-white">RDX LeadFlow</div>
            <div className="text-xs text-brand-200">Revenue Agency Platform</div>
          </div>
        </div>

        <div className="relative z-10">
          <h1 className="max-w-md text-4xl font-bold leading-tight text-white">
            Close more deals, faster.
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-brand-100/90">
            Your B2B lead generation, sales CRM and agency operations — all in one
            reliable workspace.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-4">
            <Feature icon={<Building2 className="h-5 w-5" />} label="Companies & Leads" sub="Organize prospects" />
            <Feature icon={<KanbanSquare className="h-5 w-5" />} label="Sales Pipeline" sub="Track every deal" />
            <Feature icon={<BarChart3 className="h-5 w-5" />} label="Reports" sub="Live analytics" />
            <Feature icon={<ShieldCheck className="h-5 w-5" />} label="Secure" sub="Role-based access" />
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-6 text-xs text-brand-200">
          <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> Team collaboration</span>
          <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> Enterprise-grade</span>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex w-full items-center justify-center px-4 py-10 lg:w-1/2">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center justify-between lg:hidden">
            <Logo size={32} />
            <button onClick={toggleTheme} className="rounded-lg p-2 text-ink-500 hover:bg-ink-100">
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>
          </div>

          <div className="hidden items-center justify-end lg:flex">
            <button onClick={toggleTheme} className="rounded-lg p-2 text-ink-500 hover:bg-ink-100">
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>
          </div>

          <h2 className="text-2xl font-bold text-ink-900">Welcome back</h2>
          <p className="mt-1.5 text-sm text-ink-500">Sign in to access your workspace.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-700">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@company.com"
                  className="w-full rounded-lg border border-ink-300 bg-surface py-2.5 pl-10 pr-3 text-sm text-ink-900 placeholder-ink-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-400/30"
                />
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="block text-sm font-medium text-ink-700">Password</label>
                <button type="button" className="text-xs font-medium text-brand-600 hover:text-brand-700">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-ink-300 bg-surface py-2.5 pl-10 pr-10 text-sm text-ink-900 placeholder-ink-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-400/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-ink-600">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-400"
              />
              Remember me
            </label>

            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={submitting}>
              {submitting ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Signing in…
                </>
              ) : (
                <>
                  Sign in <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 rounded-lg border border-ink-200 bg-ink-50 px-4 py-3 text-center text-xs text-ink-500">
            <span className="font-medium text-ink-600">Demo credentials:</span> owner@rdx.com / password123
          </div>

          <p className="mt-6 text-center text-xs text-ink-400">
            © {new Date().getFullYear()} RDX Revenue Agency. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}

function Feature({ icon, label, sub }) {
  return (
    <div className="rounded-xl bg-white/5 p-4 backdrop-blur">
      <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500/20 text-brand-100">
        {icon}
      </div>
      <div className="text-sm font-semibold text-white">{label}</div>
      <div className="mt-0.5 text-xs text-brand-200">{sub}</div>
    </div>
  )
}
