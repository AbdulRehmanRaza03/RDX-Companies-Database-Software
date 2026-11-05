import { useQuery } from '@tanstack/react-query'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import api from '../lib/api.js'
import { useOrganizationId } from '../hooks/useOrganization.js'
import { Card, PageHeader } from '../components/ui.jsx'

export default function Reports() {
  const { data: orgId } = useOrganizationId()

  const { data: leadsStatus } = useQuery({
    queryKey: ['rep-leads-status', orgId],
    queryFn: async () => (await api.get('/reports/leads-by-status', { params: { organization_id: orgId } })).data,
    enabled: !!orgId,
  })

  const { data: dealsStage } = useQuery({
    queryKey: ['rep-deals-stage', orgId],
    queryFn: async () => (await api.get('/reports/deals-by-stage', { params: { organization_id: orgId } })).data,
    enabled: !!orgId,
  })

  const { data: leadsSource } = useQuery({
    queryKey: ['rep-leads-source', orgId],
    queryFn: async () => (await api.get('/reports/leads-by-source', { params: { organization_id: orgId } })).data,
    enabled: !!orgId,
  })

  const { data: revenue } = useQuery({
    queryKey: ['rep-revenue', orgId],
    queryFn: async () => (await api.get('/reports/revenue-over-time', { params: { organization_id: orgId } })).data,
    enabled: !!orgId,
  })

  return (
    <div>
      <PageHeader title="Reports & Analytics" subtitle="Live performance data across your agency." />

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Leads by Status" data={leadsStatus?.items || []} xKey="status" dataKey="count" color="#2563eb" />
        <ChartCard title="Leads by Source" data={leadsSource?.items || []} xKey="source" dataKey="count" color="#3b82f6" />
        <ChartCard title="Deals by Stage (count)" data={(dealsStage?.items || []).map((d) => ({ ...d, count: d.count }))} xKey="stage" dataKey="count" color="#1d4ed8" />
        <ChartCard title="Revenue over Time" data={(revenue?.items || []).map((d) => ({ ...d, amount: Number(d.amount) }))} xKey="date" dataKey="amount" color="#0891b2" />
      </div>
    </div>
  )
}

function ChartCard({ title, data, xKey, dataKey, color }) {
  return (
    <Card className="p-5">
      <h2 className="mb-4 text-sm font-semibold text-ink-900">{title}</h2>
      {data.length ? (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey={xKey} tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip />
              <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="text-sm text-ink-400">No data yet.</p>
      )}
    </Card>
  )
}
