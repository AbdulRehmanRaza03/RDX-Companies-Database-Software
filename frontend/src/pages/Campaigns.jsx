import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api.js'
import { useOrganizationId } from '../hooks/useOrganization.js'
import { useToast } from '../lib/toast.jsx'
import { Button, Input, PageHeader } from '../components/ui.jsx'
import { DataTable, StatusBadge } from '../components/data.jsx'
import { Modal, ConfirmDialog } from '../components/modal.jsx'
import { UserPlus, Trash2 } from 'lucide-react'

export default function Campaigns() {
  const { data: orgId } = useOrganizationId()
  const queryClient = useQueryClient()
  const toast = useToast()
  const [open, setOpen] = useState(false)
  const [enrollOpen, setEnrollOpen] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [name, setName] = useState('')
  const [contactId, setContactId] = useState('')

  const { data, isLoading, error } = useQuery({
    queryKey: ['campaigns', orgId],
    queryFn: async () => (await api.get('/campaigns', { params: { organization_id: orgId, limit: 100 } })).data,
    enabled: !!orgId,
  })

  const { data: contacts } = useQuery({
    queryKey: ['contacts-enroll', orgId],
    queryFn: async () => (await api.get('/contacts', { params: { organization_id: orgId, limit: 100 } })).data,
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
      toast('Campaign created', 'success')
      setOpen(false)
      setName('')
    },
    onError: (e) => toast(e.response?.data?.detail || 'Failed to create', 'error'),
  })

  const enroll = useMutation({
    mutationFn: async () => api.post('/enrollments', { campaign_id: enrollOpen.id, contact_id: contactId }, { params: { organization_id: orgId } }),
    onSuccess: () => {
      queryClient.invalidateQueries(['enrollments'])
      toast('Contact enrolled', 'success')
      setEnrollOpen(null)
      setContactId('')
    },
    onError: (e) => toast(e.response?.data?.detail || 'Failed to enroll', 'error'),
  })

  const remove = useMutation({
    mutationFn: async () => api.delete(`/campaigns/${deleting.id}`, { params: { organization_id: orgId } }),
    onSuccess: () => {
      queryClient.invalidateQueries(['campaigns'])
      setDeleting(null)
      toast('Campaign deleted', 'success')
    },
    onError: (e) => toast(e.response?.data?.detail || 'Failed to delete', 'error'),
  })

  const enrollmentCount = (campaignId) => enrollments?.items?.filter((e) => e.campaign_id === campaignId).length || 0

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
          { key: 'name', header: 'Campaign', render: (r) => <span className="font-medium text-ink-900 dark:text-ink-200">{r.name}</span> },
          { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
          { key: 'enrollments', header: 'Enrolled', render: (r) => enrollmentCount(r.id) },
          { key: 'created_at', header: 'Created', render: (r) => new Date(r.created_at).toLocaleDateString() },
          {
            key: 'actions',
            header: '',
            render: (r) => (
              <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => { setEnrollOpen(r); setContactId('') }} title="Enroll contact" className="rounded-md p-1.5 text-ink-400 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-500/10">
                  <UserPlus className="h-4 w-4" />
                </button>
                <button onClick={() => setDeleting(r)} title="Delete" className="rounded-md p-1.5 text-ink-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ),
          },
        ]}
      />

      {/* Create campaign */}
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

      {/* Enroll contact */}
      <Modal
        open={!!enrollOpen}
        title={`Enroll Contact — ${enrollOpen?.name || ''}`}
        onClose={() => setEnrollOpen(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEnrollOpen(null)}>Cancel</Button>
            <Button onClick={() => enroll.mutate()} disabled={!contactId || enroll.isPending}>
              {enroll.isPending ? 'Enrolling…' : 'Enroll'}
            </Button>
          </>
        }
      >
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-ink-700 dark:text-ink-300">Contact</span>
          <select
            value={contactId}
            onChange={(e) => setContactId(e.target.value)}
            className="w-full rounded-lg border border-ink-300 bg-surface px-3 py-2 text-sm dark:border-ink-200/40"
          >
            <option value="">Select contact…</option>
            {contacts?.items?.map((c) => (
              <option key={c.id} value={c.id}>{c.first_name} {c.last_name} {c.email ? `(${c.email})` : ''}</option>
            ))}
          </select>
        </label>
      </Modal>

      <ConfirmDialog open={!!deleting} title="Delete Campaign" message={`Delete "${deleting?.name}"?`} onConfirm={() => remove.mutate()} onCancel={() => setDeleting(null)} />
    </div>
  )
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-xl border border-ink-200 bg-surface p-4 shadow-sm dark:border-ink-200/40">
      <div className="text-2xl font-bold text-ink-900 dark:text-ink-200">{value}</div>
      <div className="text-xs text-ink-500 dark:text-ink-400">{label}</div>
    </div>
  )
}
