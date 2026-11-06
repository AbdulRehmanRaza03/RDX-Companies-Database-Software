import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Building2,
  Users,
  KanbanSquare,
  ClipboardList,
  Megaphone,
  Receipt,
  BarChart3,
  Search,
  Plus,
} from 'lucide-react'

const COMMANDS = [
  { type: 'nav', label: 'Dashboard', to: '/', icon: LayoutDashboard, group: 'Navigate' },
  { type: 'nav', label: 'Companies', to: '/companies', icon: Building2, group: 'Navigate' },
  { type: 'nav', label: 'Contacts', to: '/contacts', icon: Users, group: 'Navigate' },
  { type: 'nav', label: 'Sales Pipeline', to: '/deals', icon: KanbanSquare, group: 'Navigate' },
  { type: 'nav', label: 'Tasks', to: '/tasks', icon: ClipboardList, group: 'Navigate' },
  { type: 'nav', label: 'Campaigns', to: '/campaigns', icon: Megaphone, group: 'Navigate' },
  { type: 'nav', label: 'Finance', to: '/finance', icon: Receipt, group: 'Navigate' },
  { type: 'nav', label: 'Reports', to: '/reports', icon: BarChart3, group: 'Navigate' },
  { type: 'action', label: 'New Company', to: '/companies', icon: Plus, group: 'Quick Actions', action: 'create-company' },
  { type: 'action', label: 'New Deal', to: '/deals', icon: Plus, group: 'Quick Actions', action: 'create-deal' },
  { type: 'action', label: 'New Task', to: '/tasks', icon: Plus, group: 'Quick Actions', action: 'create-task' },
]

export function CommandPalette({ open, onClose }) {
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const navigate = useNavigate()
  const inputRef = useRef(null)

  const results = useMemo(() => {
    if (!query.trim()) return COMMANDS
    const q = query.toLowerCase()
    return COMMANDS.filter((c) => c.label.toLowerCase().includes(q) || c.group.toLowerCase().includes(q))
  }, [query])

  useEffect(() => {
    if (open) {
      setQuery('')
      setActiveIndex(0)
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }, [open])

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        open ? onClose() : document.dispatchEvent(new CustomEvent('open-command-palette'))
      }
      if (e.key === 'Escape' && open) onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  useEffect(() => {
    setActiveIndex(0)
  }, [query])

  if (!open) return null

  function handleSelect(cmd) {
    onClose()
    if (cmd.type === 'nav') {
      navigate(cmd.to)
    } else if (cmd.action === 'create-company') {
      navigate('/companies')
    } else {
      navigate(cmd.to)
    }
  }

  function onKeyDown(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => (i + 1) % results.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => (i - 1 + results.length) % results.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (results[activeIndex]) handleSelect(results[activeIndex])
    }
  }

  const grouped = results.reduce((acc, c) => {
    ;(acc[c.group] ||= []).push(c)
    return acc
  }, {})

  let flatIndex = 0

  return (
    <div className="fixed inset-0 z-200 flex items-start justify-center bg-black/40 p-4 pt-[15vh]" onClick={onClose}>
      <div
        className="w-full max-w-lg overflow-hidden rounded-xl border border-ink-200 bg-surface shadow-2xl dark:border-ink-200/40"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-ink-200 px-4 py-3 dark:border-ink-200/40">
          <Search className="h-4 w-4 text-ink-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search pages and actions…"
            className="flex-1 bg-transparent text-sm text-ink-900 outline-none placeholder-ink-400 dark:text-ink-200"
          />
          <kbd className="rounded border border-ink-200 px-1.5 py-0.5 text-[10px] text-ink-400 dark:border-ink-200/40">ESC</kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {Object.entries(grouped).map(([group, cmds]) => (
            <div key={group} className="mb-1">
              <div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-400">{group}</div>
              {cmds.map((cmd) => {
                const idx = flatIndex++
                return (
                  <button
                    key={cmd.label}
                    onClick={() => handleSelect(cmd)}
                    onMouseEnter={() => setActiveIndex(idx)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                      idx === activeIndex
                        ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300'
                        : 'text-ink-700 dark:text-ink-300'
                    }`}
                  >
                    <cmd.icon className="h-4 w-4 shrink-0 text-ink-400" />
                    <span className="flex-1">{cmd.label}</span>
                    {idx === activeIndex && <kbd className="text-[10px] text-ink-400">↵</kbd>}
                  </button>
                )
              })}
            </div>
          ))}
          {results.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-ink-400">No results found.</div>
          )}
        </div>
      </div>
    </div>
  )
}

export function useCommandPalette() {
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])
  return [open, setOpen]
}
