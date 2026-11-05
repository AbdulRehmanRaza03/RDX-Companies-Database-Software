import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api.js'
import { useOrganizationId } from '../hooks/useOrganization.js'
import { Button, Input, PageHeader } from '../components/ui.jsx'
import { DataTable, SearchInput } from '../components/data.jsx'
import { Modal } from '../components/modal.jsx'

export default function Contacts() {
  const { data: orgId } = useOrganizationId()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ company_id: '', first_name: '', last_name: '', email: '', job_title: '' })

  const { data: companies } = useQuery({
    queryKey: ['companies-opt', orgId],
    queryFn: async () => (await api.get('/companies', { params: { organization_id: orgId, limit: 100 } })).data,
    enabled: !!orgId,
  })

  const { data, isLoading, error } = useQuery({
    queryKey: ['contacts', orgId, search],
    queryFn: async () => {
      const res = await api.get('/contacts', { params: { organization_id: orgId, search: search || undefined, limit: 100 } })
      return res.data
    },
    enabled: !!orgId,
  })

  const createContact = useMutation({
    mutationFn: async () => {
      await api.post('/contacts', form, { params: { organization_id: orgId } })
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['contacts'])
      setOpen(false)
      setForm({ company_id: '', first_name: '', last_name: '', email: '', job_title: '' })
    },
  })

  return (
    <div>
      <PageHeader
        title="Contacts"
        subtitle="Decision-makers and people at your accounts."
        actions={<Button onClick={() => setOpen(true)}>+ New Contact</Button>}
      />

      <div className="mb-4 max-w-sm">
        <SearchInput value={search} onChange={setSearch} placeholder="Search name, email…" />
      </div>

      <DataTable
        loading={isLoading}
        error={error}
        data={data?.items}
        emptyTitle="No contacts yet"
        emptyDescription="Add contacts to companies to track decision-makers."
        columns={[
          { key: 'name', header: 'Name', render: (r) => <span className="font-medium text-ink-900">{r.first_name} {r.last_name}</span> },
          { key: 'email', header: 'Email', render: (r) => r.email || '—' },
          { key: 'job_title', header: 'Title', render: (r) => r.job_title || '—' },
          { key: 'do_not_contact', header: 'DNC', render: (r) => (r.do_not_contact ? 'Yes' : 'No') },
        ]}
      />

      <Modal
        open={open}
        title="New Contact"
        onClose={() => setOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => createContact.mutate()} disabled={!form.company_id || !form.first_name || !form.last_name || createContact.isPending}>
              {createContact.isPending ? 'Creating…' : 'Create'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-ink-700">Company</span>
            <select
              value={form.company_id}
              onChange={(e) => setForm({ ...form, company_id: e.target.value })}
              className="w-full rounded-lg border border-ink-300 bg-white px-3 py-2 text-sm"
            >
              <option value="">Select company…</option>
              {companies?.items?.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
            <Input label="Last Name" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
          </div>
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input label="Job Title" value={form.job_title} onChange={(e) => setForm({ ...form, job_title: e.target.value })} />
          {createContact.isError && (
            <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {createContact.error?.response?.data?.detail || 'Failed to create'}
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}
