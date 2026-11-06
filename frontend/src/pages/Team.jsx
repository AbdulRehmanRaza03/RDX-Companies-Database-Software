import { useQuery } from '@tanstack/react-query'
import api from '../lib/api.js'
import { useOrganizationId } from '../hooks/useOrganization.js'
import { PageHeader, Card } from '../components/ui.jsx'
import { Users, Mail } from 'lucide-react'

const AVATAR_COLORS = [
  'bg-brand-500', 'bg-emerald-500', 'bg-amber-500', 'bg-indigo-500',
  'bg-rose-500', 'bg-cyan-500', 'bg-violet-500', 'bg-teal-500',
]

export default function Team() {
  const { data: orgId } = useOrganizationId()

  const { data, isLoading } = useQuery({
    queryKey: ['team', orgId],
    queryFn: async () => (await api.get('/team', { params: { organization_id: orgId } })).data,
    enabled: !!orgId,
  })

  const members = data?.items || []
  const active = members.filter((m) => m.status === 'active').length

  return (
    <div>
      <PageHeader
        title="Team"
        subtitle={`${active} active member${active !== 1 ? 's' : ''} in your workspace.`}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <p className="text-ink-400">Loading…</p>
        ) : members.length === 0 ? (
          <p className="text-ink-400">No team members found.</p>
        ) : (
          members.map((m, i) => (
            <Card key={m.id} className="flex items-center gap-4 p-5">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-base font-semibold text-white ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}>
                {m.name
                  .split(' ')
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-ink-900 dark:text-ink-200">{m.name}</div>
                <div className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-ink-400">
                  <Mail className="h-3 w-3" /> {m.email}
                </div>
                <span className="mt-1.5 inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium capitalize text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                  {m.status}
                </span>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
