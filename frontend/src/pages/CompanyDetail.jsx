import { useQuery } from '@tanstack/react-query'
import { useParams, Link } from 'react-router-dom'
import api from '../lib/api.js'
import { useOrganizationId } from '../hooks/useOrganization.js'
import { Card, Button, Badge } from '../components/ui.jsx'
import { DataTable } from '../components/data.jsx'
import { ArrowLeft, Building2, Users, KanbanSquare, Mail, Phone } from 'lucide-react'

export default function CompanyDetail() {
  const { id } = useParams()
  const { data: orgId } = useOrganizationId()

  const { data: company, isLoading } = useQuery({
    queryKey: ['company', orgId, id],
    queryFn: async () => (await api.get(`/companies/${id}`, { params: { organization_id: orgId } })).data,
    enabled: !!orgId && !!id,
  })

  const { data: contacts } = useQuery({
    queryKey: ['company-contacts', orgId, id],
    queryFn: async () => (await api.get('/contacts', { params: { organization_id: orgId, company_id: id, limit: 100 } })).data,
    enabled: !!orgId && !!id,
  })

  const { data: deals } = useQuery({
    queryKey: ['company-deals', orgId, id],
    queryFn: async () => (await api.get('/deals', { params: { organization_id: orgId, limit: 100 } })).data.then((d) => ({ items: d.items.filter((x) => x.company_id === id), total: d.items.filter((x) => x.company_id === id).length })),
    enabled: !!orgId && !!id,
  })

  if (isLoading) return <p className="text-ink-400">Loading…</p>
  if (!company) return <p className="text-red-600">Company not found.</p>

  return (
    <div>
      <Link to="/companies" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700">
        <ArrowLeft className="h-4 w-4" /> Back to Companies
      </Link>

      <Card className="mb-6 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <Building2 className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-ink-900">{company.name}</h1>
              <div className="mt-1 flex flex-wrap gap-2 text-sm text-ink-500">
                {company.domain && <span className="inline-flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{company.domain}</span>}
                {company.industry && <Badge variant="info">{company.industry}</Badge>}
                {company.country && <span>{company.country}{company.city ? `, ${company.city}` : ''}</span>}
              </div>
            </div>
          </div>
          {company.website && (
            <a href={company.website} target="_blank" rel="noreferrer">
              <Button variant="secondary" size="sm">Visit Website</Button>
            </a>
          )}
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <SectionTitle icon={<Users className="h-4 w-4" />} title="Contacts" count={contacts?.total} />
          <Card>
            {contacts?.items?.length ? (
              <ul className="divide-y divide-ink-100">
                {contacts.items.map((c) => (
                  <li key={c.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-100 text-sm font-medium text-ink-700">
                      {c.first_name?.[0]}{c.last_name?.[0]}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-ink-900">{c.first_name} {c.last_name}</div>
                      <div className="truncate text-xs text-ink-400">{c.job_title || c.email || '—'}</div>
                    </div>
                    {c.email && <span className="ml-auto text-xs text-ink-400"><Phone className="inline h-3 w-3" /> {c.email}</span>}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-4 py-6 text-sm text-ink-400">No contacts yet.</p>
            )}
          </Card>
        </div>

        <div>
          <SectionTitle icon={<KanbanSquare className="h-4 w-4" />} title="Deals" count={deals?.total} />
          <Card>
            {deals?.items?.length ? (
              <ul className="divide-y divide-ink-100">
                {deals.items.map((d) => (
                  <li key={d.id} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <div className="text-sm font-medium text-ink-900">{d.name}</div>
                      <div className="text-xs text-ink-400">{d.currency}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-ink-900">{d.amount ? `$${Number(d.amount).toLocaleString()}` : '—'}</div>
                      <Badge variant={d.outcome === 'won' ? 'success' : d.outcome === 'lost' ? 'danger' : 'info'}>{d.outcome}</Badge>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-4 py-6 text-sm text-ink-400">No deals yet.</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

function SectionTitle({ icon, title, count }) {
  return (
    <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink-900">
      <span className="text-brand-600">{icon}</span>
      {title}
      {typeof count === 'number' && <span className="rounded-full bg-ink-100 px-2 py-0.5 text-xs text-ink-500">{count}</span>}
    </div>
  )
}
