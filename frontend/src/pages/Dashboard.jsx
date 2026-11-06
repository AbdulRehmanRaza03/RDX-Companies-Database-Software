import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import api from '../lib/api.js'
import { useOrganizationId } from '../hooks/useOrganization.js'
import { useAuth } from '../lib/auth.jsx'
import { Card, Button } from '../components/ui.jsx'
import {
  Building2,
  Users,
  Target,
  KanbanSquare,
  CircleDollarSign,
  ClipboardList,
  TrendingUp,
  ArrowUpRight,
  Clock,
} from 'lucide-react'

const COLORS = ['#2563eb', '#4f8ffc', '#84b4ff', '#0b1f3a', '#0891b2', '#b3d1ff']

export default function Dashboard() {
  const { data: orgId } = useOrganizationId()
  const { user } = useAuth()
  const firstName = user?.first_name || 'there'

  const { data: summary, isLoading } = useQuery({
    queryKey: ['dashboard', orgId],
    queryFn: async () => (await api.get('/dashboard/summary', { params: { organization_id: orgId } })).data,
    enabled: !!orgId,
    refetchInterval: 5000, // real-time refresh every 5s
  })

  const { data: leadsStatus } = useQuery({
    queryKey: ['leads-status', orgId],
    queryFn: async () => (await api.get('/reports/leads-by-status', { params: { organization_id: orgId } })).data,
    enabled: !!orgId,
    refetchInterval: 5000,
  })

  const { data: dealsStage } = useQuery({
    queryKey: ['deals-stage', orgId],
    queryFn: async () => (await api.get('/reports/deals-by-stage', { params: { organization_id: orgId } })).data,
    enabled: !!orgId,
    refetchInterval: 5000,
  })

  const { data: leadsSource } = useQuery({
    queryKey: ['leads-source', orgId],
    queryFn: async () => (await api.get('/reports/leads-by-source', { params: { organization_id: orgId } })).data,
    enabled: !!orgId,
    refetchInterval: 5000,
  })

  const { data: revenue } = useQuery({
    queryKey: ['revenue-time', orgId],
    queryFn: async () => (await api.get('/reports/revenue-over-time', { params: { organization_id: orgId } })).data,
    enabled: !!orgId,
    refetchInterval: 5000,
  })

  const { data: activity } = useQuery({
    queryKey: ['activity', orgId],
    queryFn: async () => (await api.get('/dashboard/activity-feed', { params: { organization_id: orgId } })).data,
    enabled: !!orgId,
    refetchInterval: 5000,
  })

  const { data: meetings } = useQuery({
    queryKey: ['meetings-upcoming', orgId],
    queryFn: async () => (await api.get('/dashboard/upcoming-meetings', { params: { organization_id: orgId } })).data,
    enabled: !!orgId,
    refetchInterval: 5000,
  })

  const { data: workload } = useQuery({
    queryKey: ['team-workload', orgId],
    queryFn: async () => (await api.get('/dashboard/team-workload', { params: { organization_id: orgId } })).data,
    enabled: !!orgId,
    refetchInterval: 5000,
  })

  const fmt = (v) => (v == null ? '—' : `$${Number(v).toLocaleString()}`)

  const stats = [
    { label: 'Companies', value: summary?.companies ?? '—', icon: Building2, color: 'bg-brand-50 text-brand-600', trend: '+12%' },
    { label: 'Contacts', value: summary?.contacts ?? '—', icon: Users, color: 'bg-emerald-50 text-emerald-600', trend: '+8%' },
    { label: 'Qualified Leads', value: summary?.qualified_leads ?? '—', icon: Target, color: 'bg-amber-50 text-amber-600', trend: '+5%' },
    { label: 'Open Deals', value: summary?.open_deals ?? '—', icon: KanbanSquare, color: 'bg-indigo-50 text-indigo-600', trend: '+3%' },
    { label: 'Pipeline Value', value: fmt(summary?.pipeline_value), icon: TrendingUp, color: 'bg-brand-50 text-brand-600', trend: null },
    { label: 'Open Tasks', value: summary?.open_tasks ?? '—', icon: ClipboardList, color: 'bg-red-50 text-red-600', trend: null },
  ]

  const moneySummary = {
    pipeline: summary?.pipeline_value,
    outstanding: summary?.outstanding_invoices,
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink-900 dark:text-ink-100">
            Welcome back, {firstName}
          </h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-500">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            Live · {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })} · updates every 5s
          </p>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {stats.map((s) => (
          <Card key={s.label} className="group p-4 transition-shadow hover:shadow-md">
            <div className="mb-3 flex items-center justify-between">
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${s.color}`}>
                <s.icon className="h-5 w-5" />
              </div>
              {s.trend && (
                <span className="flex items-center gap-0.5 text-xs font-medium text-emerald-600">
                  <ArrowUpRight className="h-3 w-3" /> {s.trend}
                </span>
              )}
            </div>
            <div className="text-2xl font-bold text-ink-900">{s.value}</div>
            <div className="text-xs text-ink-500">{s.label}</div>
          </Card>
        ))}
      </div>

      {/* Revenue / pipeline charts */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-ink-900">
            <CircleDollarSign className="h-4 w-4 text-brand-600" /> Pipeline Value by Stage
          </h2>
          <ChartContainer>
            <BarChart data={(dealsStage?.items || []).map((d) => ({ ...d, value: Number(d.value) }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="stage" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => `$${Number(v).toLocaleString()}`} />
              <Bar dataKey="value" fill="#2563eb" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-ink-900">
            <TrendingUp className="h-4 w-4 text-brand-600" /> Revenue Trend
          </h2>
          <ChartContainer>
            <AreaChart data={(revenue?.items || []).map((d) => ({ ...d, amount: Number(d.amount) }))}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => `$${Number(v).toLocaleString()}`} />
              <Area type="monotone" dataKey="amount" stroke="#2563eb" fill="url(#rev)" strokeWidth={2} />
            </AreaChart>
          </ChartContainer>
        </Card>
      </div>

      {/* Leads + sources */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="p-5">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-ink-900">
            <Target className="h-4 w-4 text-brand-600" /> Leads by Status
          </h2>
          <ChartContainer>
            <BarChart data={leadsStatus?.items || []} layout="vertical" margin={{ left: 10 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="status" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} width={80} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ChartContainer>
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-ink-900">
            <Target className="h-4 w-4 text-brand-600" /> Leads by Source
          </h2>
          <ChartContainer>
            <PieChart>
              <Pie data={leadsSource?.items || []} dataKey="count" nameKey="source" cx="50%" cy="50%" outerRadius={80} label>
                {(leadsSource?.items || []).map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ChartContainer>
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-ink-900">
            <Clock className="h-4 w-4 text-brand-600" /> Upcoming Meetings
          </h2>
          {meetings?.items?.length ? (
            <ul className="space-y-2">
              {meetings.items.map((m) => (
                <li key={m.id} className="flex items-center gap-3 rounded-lg border border-ink-100 p-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-50 text-xs font-medium text-brand-600">
                    {m.scheduled_at ? new Date(m.scheduled_at).getDate() : '—'}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-ink-900">{m.title}</div>
                    <div className="text-xs text-ink-400">
                      {m.scheduled_at ? new Date(m.scheduled_at).toLocaleString() : '—'}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink-400">No upcoming meetings.</p>
          )}
        </Card>
      </div>

      {/* Activity + workload */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-ink-900">
            <ClipboardList className="h-4 w-4 text-brand-600" /> Recent Activity
          </h2>
          {activity?.items?.length ? (
            <ul className="divide-y divide-ink-100">
              {activity.items.map((a) => (
                <li key={a.id} className="flex items-center gap-3 py-2.5 text-sm">
                  <span className="rounded-md bg-brand-50 px-2 py-1 text-xs font-medium text-brand-700">{a.type}</span>
                  <span className="text-ink-700">{a.subject || '—'}</span>
                  <span className="ml-auto text-xs text-ink-400">{new Date(a.created_at).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink-400">No recent activity.</p>
          )}
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-ink-900">
            <Users className="h-4 w-4 text-brand-600" /> Team Workload
          </h2>
          <ChartContainer>
            <BarChart data={workload?.items || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="open_tasks" name="Open Tasks" fill="#1d4ed8" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </Card>
      </div>
    </div>
  )
}

function ChartContainer({ children }) {
  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  )
}
