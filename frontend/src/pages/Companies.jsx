import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api.js'
import { useOrganizationId } from '../hooks/useOrganization.js'
import { useToast } from '../lib/toast.jsx'
import { Button, Input, PageHeader } from '../components/ui.jsx'
import { DataTable, SearchInput } from '../components/data.jsx'
import { Modal, ConfirmDialog } from '../components/modal.jsx'
import { Pencil, Trash2 } from 'lucide-react'

export default function Companies() {
  const { data: orgId } = useOrganizationId()
  const queryClient = useQueryClient()
  const toast = useToast()
  const navigate = useNavigate()

  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [form, setForm] = useState({ name: '', website: '', industry: '', country: '', city: '' })

  const { data, isLoading, error } = useQuery({
    queryKey: ['companies', orgId, search],
    queryFn: async () => (await api.get('/companies', { params: { organization_id: orgId, search: search || undefined, limit: 100 } })).data,
    enabled: !!orgId,
  })

  function openCreate() {
    setEditing(null)
    setForm({ name: '', website: '', industry: '', country: '', city: '' })
    setModalOpen(true)
  }
  function openEdit(row) {
    setEditing(row)
    setForm({ name: row.name, website: row.website || '', industry: row.industry || '', country: row.country || '', city: row.city || '' })
    setModalOpen(true)
  }

  const save = useMutation({
    mutationFn: async () => {
      if (editing) {
        await api.patch(`/companies/${editing.id}`, form, { params: { organization_id: orgId } })
      } else {
        await api.post('/companies', form, { params: { organization_id: orgId } })
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['companies'])
      toast(editing ? 'Company updated' : 'Company created', 'success')
      setModalOpen(false)
    },
    onError: (e) => toast(e.response?.data?.detail || 'Failed to save', 'error'),
  })

  const remove = useMutation({
    mutationFn: async () => api.delete(`/companies/${deleting.id}`, { params: { organization_id: orgId } }),
    onSuccess: () => {
      queryClient.invalidateQueries(['companies'])
      toast('Company deleted', 'success')
      setDeleting(null)
    },
    onError: (e) => toast(e.response?.data?.detail || 'Failed to delete', 'error'),
  })

  return (
    <div>
      <PageHeader
        title="Companies"
        subtitle="Prospect accounts and clients."
        actions={<Button onClick={openCreate}>+ New Company</Button>}
      />

      <div className="mb-4 max-w-sm">
        <SearchInput value={search} onChange={setSearch} placeholder="Search name, domain…" />
      </div>

      <DataTable
        loading={isLoading}
        error={error}
        data={data?.items}
        emptyTitle="No companies yet"
        emptyDescription="Create your first company to get started."
        onRowClick={(r) => navigate(`/companies/${r.id}`)}
        columns={[
          { key: 'name', header: 'Name', render: (r) => <span className="font-medium text-ink-900">{r.name}</span> },
          { key: 'domain', header: 'Domain', render: (r) => r.domain || '—' },
          { key: 'industry', header: 'Industry', render: (r) => r.industry || '—' },
          { key: 'country', header: 'Country', render: (r) => r.country || '—' },
          {
            key: 'actions',
            header: '',
            render: (r) => (
              <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                <IconBtn onClick={() => openEdit(r)} title="Edit"><Pencil className="h-4 w-4" /></IconBtn>
                <IconBtn onClick={() => setDeleting(r)} title="Delete" danger><Trash2 className="h-4 w-4" /></IconBtn>
              </div>
            ),
          },
        ]}
      />

      <Modal
        open={modalOpen}
        title={editing ? 'Edit Company' : 'New Company'}
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={() => save.mutate()} disabled={!form.name || save.isPending}>
              {save.isPending ? 'Saving…' : editing ? 'Update' : 'Create'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Acme Corp" />
          <Input label="Website" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://acme.com" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Industry" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} placeholder="Software" />
            <Input label="Country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} placeholder="USA" />
          </div>
          <Input label="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="San Francisco" />
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title="Delete Company"
        message={`Are you sure you want to delete "${deleting?.name}"? This will also remove its contacts.`}
        onConfirm={() => remove.mutate()}
        onCancel={() => setDeleting(null)}
        loading={remove.isPending}
      />
    </div>
  )
}

function IconBtn({ children, onClick, title, danger }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`rounded-md p-1.5 transition-colors ${
        danger ? 'text-ink-400 hover:bg-red-50 hover:text-red-600' : 'text-ink-400 hover:bg-ink-100 hover:text-ink-700'
      }`}
    >
      {children}
    </button>
  )
}
