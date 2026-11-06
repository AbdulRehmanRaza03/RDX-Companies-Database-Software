import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/auth.jsx'
import { useTheme } from '../lib/theme.jsx'
import { useQuery } from '@tanstack/react-query'
import api from '../lib/api.js'
import { useOrganizationId } from '../hooks/useOrganization.js'
import Logo from '../components/Logo.jsx'
import { CommandPalette, useCommandPalette } from '../components/CommandPalette.jsx'
import {
  LayoutDashboard,
  Building2,
  Users,
  Target,
  KanbanSquare,
  ClipboardList,
  CalendarDays,
  Megaphone,
  Mail,
  FileText,
  ScrollText,
  Receipt,
  Wallet,
  BarChart3,
  Settings,
  Menu,
  LogOut,
  Sun,
  Moon,
  Bell,
  BellRing,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Search,
  Plus,
} from 'lucide-react'

const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [{ to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true }],
  },
  {
    label: 'CRM',
    items: [
      { to: '/companies', label: 'Companies', icon: Building2 },
      { to: '/contacts', label: 'Contacts', icon: Users },
      { to: '/deals', label: 'Sales Pipeline', icon: KanbanSquare },
    ],
  },
  {
    label: 'Outreach',
    items: [
      { to: '/campaigns', label: 'Campaigns', icon: Megaphone },
      { to: '/tasks', label: 'Tasks', icon: ClipboardList },
    ],
  },
  {
    label: 'Delivery & Finance',
    items: [
      { to: '/finance', label: 'Finance', icon: Receipt },
      { to: '/team', label: 'Team', icon: Users },
    ],
  },
  {
    label: 'Insights',
    items: [
      { to: '/reports', label: 'Reports', icon: BarChart3 },
    ],
  },
]

export default function Layout({ children }) {
  const [open, setOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { data: orgId } = useOrganizationId()
  const location = useLocation()
  const [paletteOpen, setPaletteOpen] = useCommandPalette()

  const { data: notifs } = useQuery({
    queryKey: ['notifications', orgId],
    queryFn: async () => (await api.get('/notifications', { params: { organization_id: orgId } })).data,
    enabled: !!orgId,
    refetchInterval: 15000,
  })

  const unread = notifs?.items?.filter((n) => !n.is_read).length || 0

  const sidebar = (
    <aside
      className={`flex h-full flex-col border-r border-ink-200 bg-surface transition-all duration-200 dark:border-ink-200/40 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand */}
      <div className={`flex items-center border-b border-ink-200 px-4 py-4 dark:border-ink-200/40 ${collapsed ? 'justify-center' : ''}`}>
        <Logo size={32} withText={!collapsed} />
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-4">
            {!collapsed && (
              <div className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-wider text-ink-400">{group.label}</div>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    title={collapsed ? item.label : undefined}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        collapsed ? 'justify-center' : ''
                      } ${
                        isActive
                          ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300'
                          : 'text-ink-600 hover:bg-ink-100 dark:text-ink-400 dark:hover:bg-ink-100/10'
                      }`
                    }
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                    {!collapsed && active && <span className="ml-auto h-5 w-1 rounded-full bg-brand-500" />}
                  </NavLink>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="flex items-center justify-center border-t border-ink-200 py-2 text-ink-400 hover:text-ink-700 dark:border-ink-200/40 dark:hover:text-ink-300"
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>

      {/* User */}
      <div className={`border-t border-ink-200 px-3 py-3 dark:border-ink-200/40 ${collapsed ? 'flex justify-center' : ''}`}>
        {collapsed ? (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500 text-xs font-semibold text-white">
            {(user?.first_name?.[0] || user?.email?.[0] || '?').toUpperCase()}
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-500 text-xs font-semibold text-white">
              {(user?.first_name?.[0] || user?.email?.[0] || '?').toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-ink-900 dark:text-ink-200">
                {user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email : '…'}
              </div>
              <div className="truncate text-xs text-ink-400">{user?.email}</div>
            </div>
            <button onClick={logout} title="Logout" className="rounded-md p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700 dark:hover:bg-ink-100/10 dark:hover:text-ink-300">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  )

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="hidden md:block">{sidebar}</div>

      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 h-full">{sidebar}</div>
        </div>
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between border-b border-ink-200 bg-surface px-4 py-3 md:px-6 dark:border-ink-200/40">
          <div className="flex items-center gap-3">
            <button onClick={() => setOpen(true)} className="rounded-md p-1.5 text-ink-500 hover:bg-ink-100 md:hidden dark:hover:bg-ink-100/10">
              <Menu className="h-5 w-5" />
            </button>
            {/* Search (opens command palette) */}
            <button
              onClick={() => setPaletteOpen(true)}
              className="relative hidden w-64 items-center gap-2 rounded-lg border border-ink-300 bg-ink-50 px-3 py-1.5 text-sm text-ink-400 hover:border-brand-400 sm:flex dark:border-ink-200/40 dark:bg-ink-100/5"
            >
              <Search className="h-4 w-4" />
              <span className="flex-1 text-left">Search…</span>
              <kbd className="rounded border border-ink-200 px-1.5 py-0.5 text-[10px] text-ink-400 dark:border-ink-200/40">Ctrl K</kbd>
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Quick action */}
            <button className="flex items-center gap-1.5 rounded-lg bg-brand-500 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-600">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Quick Add</span>
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen((o) => !o)}
                className="relative rounded-md p-2 text-ink-500 hover:bg-ink-100 hover:text-ink-700 dark:hover:bg-ink-100/10 dark:hover:text-ink-300"
                title="Notifications"
              >
                {unread > 0 ? <BellRing className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
                {unread > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
                    {unread}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-ink-200 bg-surface shadow-xl dark:border-ink-200/40">
                  <div className="flex items-center justify-between border-b border-ink-200 px-4 py-2.5 dark:border-ink-200/40">
                    <span className="text-sm font-semibold text-ink-900 dark:text-ink-200">Notifications</span>
                    {unread > 0 && <span className="text-xs font-medium text-brand-600">{unread} unread</span>}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifs?.items?.length ? (
                      notifs.items.map((n) => (
                        <div key={n.id} className={`border-b border-ink-100 px-4 py-3 text-sm dark:border-ink-200/40 ${n.is_read ? '' : 'bg-brand-50/40 dark:bg-brand-500/5'}`}>
                          <div className="text-ink-700 dark:text-ink-300">{n.message}</div>
                          <div className="mt-1 text-xs text-ink-400">{n.created_at ? new Date(n.created_at).toLocaleString() : ''}</div>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-8 text-center text-sm text-ink-400">No notifications yet.</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Theme toggle */}
            <button onClick={toggleTheme} title="Toggle theme" className="rounded-md p-2 text-ink-500 hover:bg-ink-100 hover:text-ink-700 dark:hover:bg-ink-100/10 dark:hover:text-ink-300">
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>

            {/* Profile menu */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen((o) => !o)}
                className="flex items-center gap-2 rounded-lg px-1 py-1 hover:bg-ink-100 dark:hover:bg-ink-100/10"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500 text-xs font-semibold text-white">
                  {(user?.first_name?.[0] || user?.email?.[0] || '?').toUpperCase()}
                </div>
                <ChevronDown className="hidden h-4 w-4 text-ink-400 sm:block" />
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-ink-200 bg-surface py-1 shadow-xl dark:border-ink-200/40">
                  <div className="border-b border-ink-200 px-4 py-2.5 dark:border-ink-200/40">
                    <div className="text-sm font-medium text-ink-900 dark:text-ink-200">
                      {user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email : ''}
                    </div>
                    <div className="truncate text-xs text-ink-400">{user?.email}</div>
                  </div>
                  <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-ink-700 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-100/10">
                    <Settings className="h-4 w-4" /> Settings
                  </button>
                  <button onClick={logout} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10">
                    <LogOut className="h-4 w-4" /> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-ink-50 p-4 dark:bg-ink-50/60 md:p-6">{children}</main>
      </div>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  )
}
