// Premium reusable UI primitives — enterprise SaaS design system.

export function Button({ variant = 'primary', size = 'md', className = '', children, icon, ...props }) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-brand-400/40 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]'
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-sm',
  }
  const variants = {
    primary: 'bg-brand-500 text-white hover:bg-brand-600 shadow-sm shadow-brand-500/20',
    secondary: 'bg-surface text-ink-700 border border-ink-300 hover:bg-ink-100 dark:hover:bg-ink-100/10 dark:text-ink-300',
    ghost: 'bg-transparent text-ink-700 hover:bg-ink-100 dark:hover:bg-ink-100/10 dark:text-ink-300',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    navy: 'bg-navy text-white hover:bg-brand-900',
  }
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
      {icon}
      {children}
    </button>
  )
}

export function Card({ className = '', children, hover = false, ...props }) {
  return (
    <div
      className={`rounded-xl border border-ink-200 bg-surface shadow-sm dark:border-ink-200/40 ${
        hover ? 'transition-all duration-200 hover:shadow-md hover:-translate-y-0.5' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export function Input({ label, error, hint, className = '', icon, ...props }) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-ink-300">{label}</span>}
      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400">{icon}</span>}
        <input
          className={`w-full rounded-lg border border-ink-300 bg-surface px-3 py-2 text-sm text-ink-900 placeholder-ink-400 transition-colors focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-400/40 dark:border-ink-200/40 dark:text-ink-200 dark:placeholder-ink-400 ${
            icon ? 'pl-9' : ''
          } ${error ? 'border-red-400' : ''} ${className}`}
          {...props}
        />
      </div>
      {error ? (
        <span className="mt-1 block text-xs text-red-600">{error}</span>
      ) : hint ? (
        <span className="mt-1 block text-xs text-ink-400">{hint}</span>
      ) : null}
    </label>
  )
}

export function Select({ label, error, className = '', children, ...props }) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-ink-300">{label}</span>}
      <select
        className={`w-full rounded-lg border border-ink-300 bg-surface px-3 py-2 text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-400/40 dark:border-ink-200/40 dark:text-ink-200 ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  )
}

export function Badge({ variant = 'default', children, dot = false }) {
  const variants = {
    default: 'bg-ink-100 text-ink-700 dark:bg-ink-100/10 dark:text-ink-300',
    success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
    warning: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
    danger: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400',
    info: 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300',
    navy: 'bg-navy text-white',
  }
  const dotColors = {
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-red-500',
    info: 'bg-brand-500',
    default: 'bg-ink-400',
    navy: 'bg-white',
  }
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[variant]}`}>
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${dotColors[variant]}`} />}
      {children}
    </span>
  )
}

export function Spinner({ className = '' }) {
  return (
    <svg className={`h-5 w-5 animate-spin text-brand-500 ${className}`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  )
}

export function EmptyState({ title = 'Nothing here', description, action, icon }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-500 dark:bg-brand-500/10 dark:text-brand-300">
        {icon || (
          <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        )}
      </div>
      <h3 className="text-sm font-semibold text-ink-900 dark:text-ink-200">{title}</h3>
      {description && <p className="mt-1 max-w-xs text-sm text-ink-500">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function PageHeader({ title, subtitle, actions, breadcrumb }) {
  return (
    <div className="mb-6">
      {breadcrumb && <div className="mb-2 text-xs text-ink-400">{breadcrumb}</div>}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink-900 dark:text-ink-100">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-ink-500">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  )
}

// Simple tooltip wrapper using a title attribute + styled cursor.
export function Tooltip({ label, children }) {
  return (
    <span className="group relative inline-flex">
      {children}
      <span className="pointer-events-none absolute left-1/2 top-full z-50 mt-1.5 -translate-x-1/2 whitespace-nowrap rounded-md bg-navy px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:bg-ink-200 dark:text-ink-900">
        {label}
      </span>
    </span>
  )
}

// Shimmer skeleton for premium loading states.
export function Skeleton({ className = '', lines = 3 }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 animate-pulse rounded bg-ink-100 dark:bg-ink-100/10"
          style={{ width: `${100 - (i % 3) * 15}%` }}
        />
      ))}
    </div>
  )
}

export function TableSkeleton({ rows = 6, cols = 4 }) {
  return (
    <Card className="overflow-hidden">
      <div className="space-y-0 divide-y divide-ink-100 dark:divide-ink-200/40">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex gap-4 px-4 py-3.5">
            {Array.from({ length: cols }).map((_, c) => (
              <div
                key={c}
                className="h-4 animate-pulse rounded bg-ink-100 dark:bg-ink-100/10"
                style={{ width: `${(c + 1) % 3 === 0 ? 20 : 14 + (c % 3) * 8}%` }}
              />
            ))}
          </div>
        ))}
      </div>
    </Card>
  )
}
