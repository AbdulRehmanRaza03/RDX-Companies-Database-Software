import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import api from '../lib/api.js'
import { useOrganizationId } from '../hooks/useOrganization.js'
import { Card, PageHeader } from '../components/ui.jsx'
import {
  Building2,
  Users,
  Target,
  KanbanSquare,
  CircleDollarSign,
  ClipboardList,
  TrendingUp,
} from 'lucide-react'

export default function Dashboard() {
  const { data: orgId } = useOrganizationId()

  const { data: summary, isLoading } = useQuery({
    queryKey: ['dashboard', orgId],
    queryFn: async () => {
      const res = await api.get('/dashboard/summary', { params: { organization_id: orgId } })
      return res.data
    },
    enabled: !!orgId,
  })

  const { data: leadsByStatus } = useQuery({
    queryKey: ['leads-status', orgId],
    queryFn: async () => (await api.get('/reports/leads-by-status', { params: { organization_id: orgId } })).data,
    enabled: !!orgId,
  })

  const { data: dealsByStage } = useQuery({
    queryKey: ['deals-stage', orgId],
    queryFn: async () => (await api.get('/reports/deals-by-stage', { params: { organization_id: orgId } })).data,
    enabled: !!orgId,
  })

  const { data: activity } = useQuery({
    queryKey: ['activity', orgId],
    queryFn: async () => (await api.get('/dashboard/activity-feed', { params: { organization_id: orgId } })).data,
    enabled: !!orgId,
  })

  const stats = [
    { label: 'Companies', value: summary?.companies ?? '—', icon: Building2, color: 'text-brand-600 bg-brand-50' },
    { label: 'Contacts', value: summary?.contacts ?? '—', icon: Users, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Qualified Leads', value: summary?.qualified_leads ?? '—', icon: Target, color: 'text-amber-600 bg-amber-50' },
    { label: 'Open Deals', value: summary?.open_deals ?? '—', icon: KanbanSquare, color: 'text-indigo-600 bg-indigo-50' },
    { label: 'Pipeline Value', value: summary?.pipeline_value ? `$${Number(summary.pipeline_value).toLocaleString()}` : '—', icon: TrendingUp, color: 'text-brand-600 bg-brand-50' },
    { label: 'Open Tasks', value: summary?.open_tasks ?? '—', icon: ClipboardList, color: 'text-red-600 bg-red-50' },
  ]

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Welcome back — here's your agency at a glance." />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {stats.map((s) => (
          <Card key={s.label} className="p-4">
            <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg ${s.color}`}>
              <s.icon className="h-5 w-5" />
            </div>
            <div className="text-2xl font-bold text-ink-900">{s.value}</div>
            <div className="text-xs text-ink-500">{s.label}</div>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-ink-900">
            <Target className="h-4 w-4 text-brand-600" /> Leads by Status
          </h2>
          {leadsByStatus?.items?.length ? (
            <div className="space-y-3">
              {leadsByStatus.items.map((row) => (
                <div key={row.status}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-ink-700">{row.status}</span>
                    <span className="font-medium text-ink-900">{row.count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-ink-100">
                    <div
                      className="h-2 rounded-full bg-brand-500"
                      style={{ width: `${Math.min(100, (row.count / Math.max(1, ...leadsByStatus.items.map((x) => x.count))) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-ink-400">No leads yet.</p>
          )}
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-ink-900">
            <KanbanSquare className="h-4 w-4 text-brand-600" /> Deals by Stage
          </h2>
          {dealsByStage?.items?.length ? (
            <div className="space-y-3">
              {dealsByStage.items.map((row) => (
                <div key={row.stage} className="flex items-center justify-between text-sm">
                  <span className="text-ink-700">{row.stage}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-ink-400">{row.count}</span>
                    <span className="w-24 text-right font-medium text-ink-900">
                      ${Number(row.value).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-ink-400">No deals yet.</p>
          )}
        </Card>
      </div>

      <Card className="mt-6 p-5">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-ink-900">
          <CircleDollarSign className="h-4 w-4 text-brand-600" /> Recent Activity
        </h2>
        {activity?.items?.length ? (
          <ul className="divide-y divide-ink-100">
            {activity.items.map((a) => (
              <li key={a.id} className="flex items-center gap-3 py-2.5 text-sm">
                <span className="rounded-md bg-brand-50 px-2 py-1 text-xs font-medium text-brand-700">
                  {a.type}
                </span>
                <span className="text-ink-700">{a.subject || '—'}</span>
                <span className="ml-auto text-xs text-ink-400">
                  {new Date(a.created_at).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-ink-400">No recent activity.</p>
        )}
      </Card>

      <div className="mt-6">
        <Link to="/companies" className="text-sm font-medium text-brand-600 hover:text-brand-700">
          → Manage companies & contacts
        </Link>
      </div>
    </div>
  )
}
