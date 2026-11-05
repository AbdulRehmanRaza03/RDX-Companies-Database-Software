import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api.js'
import { useOrganizationId } from '../hooks/useOrganization.js'
import { Button, Input, PageHeader } from '../components/ui.jsx'
import { DataTable, SearchInput, StatusBadge } from '../components/data.jsx'
import { Modal } from '../components/modal.jsx'

export default function Deals() {
  const { data: orgId } = useOrganizationId()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ company_id: '', pipeline_id: '', stage_id: '', name: '', amount: '' })

  const { data: companies } = useQuery({
    queryKey: ['companies-deal', orgId],
    queryFn: async () => (await api.get('/companies', { params: { organization_id: orgId, limit: 100 } })).data,
    enabled: !!orgId,
  })

  const { data: pipelines } = useQuery({
    queryKey: ['pipelines', orgId],
    queryFn: async () => (await api.get('/pipelines', { params: { organization_id: orgId } })).data,
    enabled: !!orgId,
  })

  const { data, isLoading, error } = useQuery({
    queryKey: ['deals', orgId, search],
    queryFn: async () => (await api.get('/deals', { params: { organization_id: orgId, search: search || undefined, limit: 100 } })).data,
    enabled: !!orgId,
  })

  const createDeal = useMutation({
    mutationFn: async () => {
      await api.post('/deals', { ...form, amount: form.amount || null, probability: 0 }, { params: { organization_id: orgId } })
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['deals'])
      setOpen(false)
      setForm({ company_id: '', pipeline_id: '', stage_id: '', name: '', amount: '' })
    },
  })

  const selectedPipeline = pipelines?.find((p) => p.id === form.pipeline_id)

  return (
    <div>
      <PageHeader
        title="Sales Pipeline"
        subtitle="Track deals from prospecting to close."
        actions={<Button onClick={() => setOpen(true)}>+ New Deal</Button>}
      />

      <div className="mb-4 max-w-sm">
        <SearchInput value={search} onChange={setSearch} placeholder="Search deals…" />
      </div>

      <DataTable
        loading={isLoading}
        error={error}
        data={data?.items}
        emptyTitle="No deals yet"
        emptyDescription="Create a deal to start tracking your pipeline."
        columns={[
          { key: 'name', header: 'Deal', render: (r) => <span className="font-medium text-ink-900">{r.name}</span> },
          { key: 'amount', header: 'Amount', render: (r) => (r.amount ? `$${Number(r.amount).toLocaleString()}` : '—') },
          { key: 'probability', header: 'Probability', render: (r) => `${r.probability}%` },
          { key: 'outcome', header: 'Outcome', render: (r) => <StatusBadge status={r.outcome} /> },
        ]}
      />

      <Modal
        open={open}
        title="New Deal"
        onClose={() => setOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => createDeal.mutate()} disabled={!form.name || !form.company_id || !form.pipeline_id || !form.stage_id || createDeal.isPending}>
              {createDeal.isPending ? 'Creating…' : 'Create'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Deal Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-ink-700">Company</span>
            <select value={form.company_id} onChange={(e) => setForm({ ...form, company_id: e.target.value })} className="w-full rounded-lg border border-ink-300 bg-white px-3 py-2 text-sm">
              <option value="">Select…</option>
              {companies?.items?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-ink-700">Pipeline</span>
            <select value={form.pipeline_id} onChange={(e) => setForm({ ...form, pipeline_id: e.target.value, stage_id: '' })} className="w-full rounded-lg border border-ink-300 bg-white px-3 py-2 text-sm">
              <option value="">Select…</option>
              {pipelines?.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-ink-700">Stage</span>
            <select value={form.stage_id} onChange={(e) => setForm({ ...form, stage_id: e.target.value })} className="w-full rounded-lg border border-ink-300 bg-white px-3 py-2 text-sm">
              <option value="">Select…</option>
              {selectedPipeline?.stages?.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </label>

          <Input label="Amount (USD)" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />

          {createDeal.isError && (
            <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {createDeal.error?.response?.data?.detail || 'Failed to create'}
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}
