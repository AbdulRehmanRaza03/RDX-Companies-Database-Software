import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../lib/auth.jsx'
import {
  LayoutDashboard,
  Building2,
  Users,
  KanbanSquare,
  ClipboardList,
  Megaphone,
  FileText,
  BarChart3,
  Menu,
  LogOut,
  Settings,
} from 'lucide-react'

const nav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/companies', label: 'Companies', icon: Building2 },
  { to: '/contacts', label: 'Contacts', icon: Users },
  { to: '/deals', label: 'Sales Pipeline', icon: KanbanSquare },
  { to: '/tasks', label: 'Tasks', icon: ClipboardList },
  { to: '/campaigns', label: 'Campaigns', icon: Megaphone },
  { to: '/finance', label: 'Finance', icon: FileText },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
]

export default function Layout({ children }) {
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuth()

  const sidebar = (
    <aside className="flex h-full w-64 flex-col border-r border-ink-200 bg-white">
      <div className="flex items-center gap-2 border-b border-ink-200 px-5 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white font-bold">
          R
        </div>
        <div>
          <div className="text-sm font-bold text-ink-900">RDX LeadFlow</div>
          <div className="text-xs text-ink-400">Revenue Agency</div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-ink-600 hover:bg-ink-100'
              }`
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-ink-200 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ink-200 text-xs font-semibold text-ink-700">
            {(user?.first_name?.[0] || user?.email?.[0] || '?').toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium text-ink-900">
              {user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email : '…'}
            </div>
            <div className="truncate text-xs text-ink-400">{user?.email}</div>
          </div>
          <button onClick={logout} title="Logout" className="rounded-md p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  )

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:block">{sidebar}</div>

      {/* Mobile sidebar */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 h-full">{sidebar}</div>
        </div>
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex items-center justify-between border-b border-ink-200 bg-white px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setOpen(true)} className="rounded-md p-1.5 text-ink-500 hover:bg-ink-100 md:hidden">
              <Menu className="h-5 w-5" />
            </button>
            <div className="text-sm font-medium text-ink-500">
              RDX Revenue Agency · Internal CRM
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-ink-500">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-ink-50 p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
