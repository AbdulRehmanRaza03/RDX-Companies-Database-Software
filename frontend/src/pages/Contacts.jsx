import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api.js'
import { useOrganizationId } from '../hooks/useOrganization.js'
import { useToast } from '../lib/toast.jsx'
import { Button, Input, PageHeader } from '../components/ui.jsx'
import { DataTable, SearchInput } from '../components/data.jsx'
import { Modal, ConfirmDialog } from '../components/modal.jsx'
import { Pencil, Trash2 } from 'lucide-react'

export default function Contacts() {
  const { data: orgId } = useOrganizationId()
  const queryClient = useQueryClient()
  const toast = useToast()
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [form, setForm] = useState({ company_id: '', first_name: '', last_name: '', email: '', job_title: '', phone: '' })

  const { data: companies } = useQuery({
    queryKey: ['companies-opt', orgId],
    queryFn: async () => (await api.get('/companies', { params: { organization_id: orgId, limit: 100 } })).data,
    enabled: !!orgId,
  })

  const { data, isLoading, error } = useQuery({
    queryKey: ['contacts', orgId, search],
    queryFn: async () => (await api.get('/contacts', { params: { organization_id: orgId, search: search || undefined, limit: 100 } })).data,
    enabled: !!orgId,
  })

  function openCreate() { setEditing(null); setForm({ company_id: '', first_name: '', last_name: '', email: '', job_title: '', phone: '' }); setOpen(true) }
  function openEdit(r) { setEditing(r); setForm({ company_id: r.company_id, first_name: r.first_name, last_name: r.last_name, email: r.email || '', job_title: r.job_title || '', phone: r.phone || '' }); setOpen(true) }

  const save = useMutation({
    mutationFn: async () => {
      if (editing) await api.patch(`/contacts/${editing.id}`, form, { params: { organization_id: orgId } })
      else await api.post('/contacts', form, { params: { organization_id: orgId } })
    },
    onSuccess: () => { queryClient.invalidateQueries(['contacts']); queryClient.invalidateQueries(['company-contacts']); toast(editing ? 'Contact updated' : 'Contact created', 'success'); setOpen(false) },
    onError: (e) => toast(e.response?.data?.detail || 'Failed to save', 'error'),
  })

  const remove = useMutation({
    mutationFn: async () => api.delete(`/contacts/${deleting.id}`, { params: { organization_id: orgId } }),
    onSuccess: () => { queryClient.invalidateQueries(['contacts']); queryClient.invalidateQueries(['company-contacts']); toast('Contact deleted', 'success'); setDeleting(null) },
    onError: (e) => toast(e.response?.data?.detail || 'Failed to delete', 'error'),
  })

  return (
    <div>
      <PageHeader title="Contacts" subtitle="Decision-makers and people at your accounts." actions={<Button onClick={openCreate}>+ New Contact</Button>} />

      <div className="mb-4 max-w-sm"><SearchInput value={search} onChange={setSearch} placeholder="Search name, email…" /></div>

      <DataTable
        loading={isLoading} error={error} data={data?.items}
        emptyTitle="No contacts yet" emptyDescription="Add contacts to companies to track decision-makers."
        columns={[
          { key: 'name', header: 'Name', render: (r) => <span className="font-medium text-ink-900">{r.first_name} {r.last_name}</span> },
          { key: 'email', header: 'Email', render: (r) => r.email || '—' },
          { key: 'job_title', header: 'Title', render: (r) => r.job_title || '—' },
          { key: 'do_not_contact', header: 'DNC', render: (r) => (r.do_not_contact ? 'Yes' : 'No') },
          { key: 'actions', header: '', render: (r) => (<div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}><IconBtn onClick={() => openEdit(r)}><Pencil className="h-4 w-4" /></IconBtn><IconBtn onClick={() => setDeleting(r)} danger><Trash2 className="h-4 w-4" /></IconBtn></div>) },
        ]}
      />

      <Modal open={open} title={editing ? 'Edit Contact' : 'New Contact'} onClose={() => setOpen(false)} footer={<><Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => save.mutate()} disabled={!form.company_id || !form.first_name || !form.last_name || save.isPending}>{save.isPending ? 'Saving…' : editing ? 'Update' : 'Create'}</Button></>}>
        <div className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-ink-700">Company</span>
            <select value={form.company_id} onChange={(e) => setForm({ ...form, company_id: e.target.value })} className="w-full rounded-lg border border-ink-300 bg-white px-3 py-2 text-sm">
              <option value="">Select company…</option>
              {companies?.items?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
            <Input label="Last Name" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
          </div>
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Job Title" value={form.job_title} onChange={(e) => setForm({ ...form, job_title: e.target.value })} />
            <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleting} title="Delete Contact" message={`Delete "${deleting?.first_name} ${deleting?.last_name}"?`} onConfirm={() => remove.mutate()} onCancel={() => setDeleting(null)} loading={remove.isPending} />
    </div>
  )
}

function IconBtn({ children, onClick, title, danger }) {
  return <button onClick={onClick} title={title} className={`rounded-md p-1.5 transition-colors ${danger ? 'text-ink-400 hover:bg-red-50 hover:text-red-600' : 'text-ink-400 hover:bg-ink-100 hover:text-ink-700'}`}>{children}</button>
}
