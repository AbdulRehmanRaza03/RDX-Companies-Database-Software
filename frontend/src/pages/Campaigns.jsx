import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api.js'
import { useOrganizationId } from '../hooks/useOrganization.js'
import { Button, Input, PageHeader } from '../components/ui.jsx'
import { DataTable, StatusBadge } from '../components/data.jsx'
import { Modal } from '../components/modal.jsx'

export default function Campaigns() {
  const { data: orgId } = useOrganizationId()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')

  const { data, isLoading, error } = useQuery({
    queryKey: ['campaigns', orgId],
    queryFn: async () => (await api.get('/campaigns', { params: { organization_id: orgId, limit: 100 } })).data,
    enabled: !!orgId,
  })

  const { data: enrollments } = useQuery({
    queryKey: ['enrollments', orgId],
    queryFn: async () => (await api.get('/enrollments', { params: { organization_id: orgId, limit: 200 } })).data,
    enabled: !!orgId,
  })

  const createCampaign = useMutation({
    mutationFn: async () => api.post('/campaigns', { name, status: 'draft' }, { params: { organization_id: orgId } }),
    onSuccess: () => {
      queryClient.invalidateQueries(['campaigns'])
      setOpen(false)
      setName('')
    },
  })

  return (
    <div>
      <PageHeader
        title="Campaigns"
        subtitle="Outreach campaigns and enrollment."
        actions={<Button onClick={() => setOpen(true)}>+ New Campaign</Button>}
      />

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3">
        <StatCard label="Total Campaigns" value={data?.total ?? '—'} />
        <StatCard label="Enrollments" value={enrollments?.total ?? '—'} />
        <StatCard label="Active" value={data?.items?.filter((c) => c.status === 'active').length ?? '—'} />
      </div>

      <DataTable
        loading={isLoading}
        error={error}
        data={data?.items}
        emptyTitle="No campaigns"
        emptyDescription="Create a campaign to organize outreach."
        columns={[
          { key: 'name', header: 'Campaign', render: (r) => <span className="font-medium text-ink-900">{r.name}</span> },
          { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
          { key: 'created_at', header: 'Created', render: (r) => new Date(r.created_at).toLocaleDateString() },
        ]}
      />

      <Modal
        open={open}
        title="New Campaign"
        onClose={() => setOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => createCampaign.mutate()} disabled={!name || createCampaign.isPending}>
              {createCampaign.isPending ? 'Creating…' : 'Create'}
            </Button>
          </>
        }
      >
        <Input label="Campaign Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Q4 Outreach" />
      </Modal>
    </div>
  )
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-xl border border-ink-200 bg-white p-4 shadow-sm">
      <div className="text-2xl font-bold text-ink-900">{value}</div>
      <div className="text-xs text-ink-500">{label}</div>
    </div>
  )
}
