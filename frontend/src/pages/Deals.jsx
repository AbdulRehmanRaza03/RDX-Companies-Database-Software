import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api.js'
import { useOrganizationId } from '../hooks/useOrganization.js'
import { useToast } from '../lib/toast.jsx'
import { Button, Input, PageHeader } from '../components/ui.jsx'
import { Modal, ConfirmDialog } from '../components/modal.jsx'
import { Pencil, Trash2, LayoutGrid, List } from 'lucide-react'

export default function Deals() {
  const { data: orgId } = useOrganizationId()
  const queryClient = useQueryClient()
  const toast = useToast()
  const [view, setView] = useState('board')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
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
    queryKey: ['deals', orgId],
    queryFn: async () => (await api.get('/deals', { params: { organization_id: orgId, limit: 100 } })).data,
    enabled: !!orgId,
  })

  const createDeal = useMutation({
    mutationFn: async () => {
      if (editing) {
        await api.patch(`/deals/${editing.id}`, { name: form.name, amount: form.amount || null }, { params: { organization_id: orgId } })
      } else {
        await api.post('/deals', { ...form, amount: form.amount || null, probability: 0 }, { params: { organization_id: orgId } })
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['deals'])
      queryClient.invalidateQueries(['company-deals'])
      toast(editing ? 'Deal updated' : 'Deal created', 'success')
      setOpen(false)
      reset()
    },
    onError: (e) => toast(e.response?.data?.detail || 'Failed to save', 'error'),
  })

  const moveStage = useMutation({
    mutationFn: async ({ id, stageId }) => {
      await api.patch(`/deals/${id}`, { stage_id: stageId }, { params: { organization_id: orgId } })
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['deals'])
      toast('Deal moved', 'success')
    },
  })

  const remove = useMutation({
    mutationFn: async () => api.delete(`/deals/${deleting.id}`, { params: { organization_id: orgId } }),
    onSuccess: () => {
      queryClient.invalidateQueries(['deals'])
      toast('Deal deleted', 'success')
      setDeleting(null)
    },
  })

  function reset() {
    setEditing(null)
    setForm({ company_id: '', pipeline_id: '', stage_id: '', name: '', amount: '' })
  }

  function openCreate() { reset(); setOpen(true) }
  function openEdit(r) { setEditing(r); setForm({ ...form, name: r.name, amount: r.amount || '' }); setOpen(true) }

  const selectedPipeline = pipelines?.find((p) => p.id === form.pipeline_id)

  const columns = pipelines?.[0]?.stages || []
  const totalValue = data?.items?.reduce((s, d) => s + Number(d.amount || 0), 0) || 0

  return (
    <div>
      <PageHeader
        title="Sales Pipeline"
        subtitle={view === 'board' ? `${data?.total || 0} deals · $${totalValue.toLocaleString()} total value` : 'Track deals from prospecting to close.'}
        actions={
          <>
            <div className="flex rounded-lg border border-ink-300 bg-white p-0.5">
              <button onClick={() => setView('board')} className={`flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium ${view === 'board' ? 'bg-brand-50 text-brand-700' : 'text-ink-500'}`}>
                <LayoutGrid className="h-3.5 w-3.5" /> Board
              </button>
              <button onClick={() => setView('list')} className={`flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium ${view === 'list' ? 'bg-brand-50 text-brand-700' : 'text-ink-500'}`}>
                <List className="h-3.5 w-3.5" /> List
              </button>
            </div>
            <Button onClick={openCreate}>+ New Deal</Button>
          </>
        }
      />

      {view === 'board' ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map((stage) => {
            const stageDeals = (data?.items || []).filter((d) => d.stage_id === stage.id)
            const stageValue = stageDeals.reduce((s, d) => s + Number(d.amount || 0), 0)
            return (
              <div key={stage.id} className="w-64 shrink-0">
                <div className="mb-2 flex items-center justify-between rounded-lg bg-ink-100 px-3 py-2">
                  <span className="text-sm font-medium text-ink-700">{stage.name}</span>
                  <span className="text-xs text-ink-400">{stageDeals.length}</span>
                </div>
                <div className="space-y-2">
                  {stageDeals.map((d) => (
                    <div key={d.id} className="group rounded-lg border border-ink-200 bg-white p-3 shadow-sm hover:shadow-md">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium text-ink-900">{d.name}</div>
                          <div className="mt-1 text-sm font-semibold text-brand-600">
                            {d.amount ? `$${Number(d.amount).toLocaleString()}` : '—'}
                          </div>
                        </div>
                        <div className="flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                          <IconBtn onClick={() => openEdit(d)}><Pencil className="h-3.5 w-3.5" /></IconBtn>
                          <IconBtn onClick={() => setDeleting(d)} danger><Trash2 className="h-3.5 w-3.5" /></IconBtn>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="h-1.5 flex-1 rounded-full bg-ink-100">
                          <div className="h-1.5 rounded-full bg-brand-500" style={{ width: `${d.probability}%` }} />
                        </div>
                        <span className="ml-2 text-xs text-ink-400">{d.probability}%</span>
                      </div>
                      <select
                        value={d.stage_id}
                        onChange={(e) => moveStage.mutate({ id: d.id, stageId: e.target.value })}
                        className="mt-2 w-full rounded border border-ink-200 bg-ink-50 px-1.5 py-1 text-xs text-ink-600"
                      >
                        {columns.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                  ))}
                  {!stageDeals.length && <div className="rounded-lg border border-dashed border-ink-200 py-6 text-center text-xs text-ink-400">Empty</div>}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <ListView data={data?.items || []} loading={isLoading} error={error} onEdit={openEdit} onDelete={setDeleting} />
      )}

      <Modal
        open={open}
        title={editing ? 'Edit Deal' : 'New Deal'}
        onClose={() => setOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => createDeal.mutate()} disabled={!form.name || (!editing && (!form.company_id || !form.pipeline_id || !form.stage_id)) || createDeal.isPending}>
              {createDeal.isPending ? 'Saving…' : editing ? 'Update' : 'Create'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Deal Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          {!editing && (
            <>
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
            </>
          )}
          <Input label="Amount (USD)" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title="Delete Deal"
        message={`Delete "${deleting?.name}"? This action cannot be undone.`}
        onConfirm={() => remove.mutate()}
        onCancel={() => setDeleting(null)}
        loading={remove.isPending}
      />
    </div>
  )
}

function ListView({ data, loading, error, onEdit, onDelete }) {
  return (
    <div className="overflow-hidden rounded-xl border border-ink-200 bg-white shadow-sm">
      {loading ? (
        <div className="py-16 text-center text-ink-400">Loading…</div>
      ) : error ? (
        <div className="py-16 text-center text-red-600">Failed to load.</div>
      ) : !data.length ? (
        <div className="py-16 text-center text-ink-400">No deals yet.</div>
      ) : (
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-ink-200 bg-ink-50 text-xs uppercase tracking-wide text-ink-500">
              <th className="px-4 py-3">Deal</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Probability</th>
              <th className="px-4 py-3">Outcome</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.id} className="border-b border-ink-100 last:border-0">
                <td className="px-4 py-3 font-medium text-ink-900">{d.name}</td>
                <td className="px-4 py-3 text-ink-700">{d.amount ? `$${Number(d.amount).toLocaleString()}` : '—'}</td>
                <td className="px-4 py-3 text-ink-700">{d.probability}%</td>
                <td className="px-4 py-3 text-ink-700">{d.outcome}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <IconBtn onClick={() => onEdit(d)}><Pencil className="h-4 w-4" /></IconBtn>
                    <IconBtn onClick={() => onDelete(d)} danger><Trash2 className="h-4 w-4" /></IconBtn>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

function IconBtn({ children, onClick, title, danger }) {
  return (
    <button onClick={onClick} title={title} className={`rounded-md p-1.5 transition-colors ${danger ? 'text-ink-400 hover:bg-red-50 hover:text-red-600' : 'text-ink-400 hover:bg-ink-100 hover:text-ink-700'}`}>
      {children}
    </button>
  )
}
