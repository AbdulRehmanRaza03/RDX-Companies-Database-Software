import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api.js'
import { useOrganizationId } from '../hooks/useOrganization.js'
import { Button, Input, PageHeader } from '../components/ui.jsx'
import { DataTable, SearchInput, StatusBadge } from '../components/data.jsx'
import { Modal } from '../components/modal.jsx'

export default function Companies() {
  const { data: orgId } = useOrganizationId()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [name, setName] = useState('')
  const [website, setWebsite] = useState('')
  const [industry, setIndustry] = useState('')

  const { data, isLoading, error } = useQuery({
    queryKey: ['companies', orgId, search],
    queryFn: async () => {
      const res = await api.get('/companies', {
        params: { organization_id: orgId, search: search || undefined, limit: 100 },
      })
      return res.data
    },
    enabled: !!orgId,
  })

  const createCompany = useMutation({
    mutationFn: async () => {
      await api.post('/companies', { name, website, industry }, { params: { organization_id: orgId } })
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['companies'])
      setModalOpen(false)
      setName(''); setWebsite(''); setIndustry('')
    },
  })

  return (
    <div>
      <PageHeader
        title="Companies"
        subtitle="Prospect accounts and clients."
        actions={<Button onClick={() => setModalOpen(true)}>+ New Company</Button>}
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
        columns={[
          { key: 'name', header: 'Name', render: (r) => <span className="font-medium text-ink-900">{r.name}</span> },
          { key: 'domain', header: 'Domain', render: (r) => r.domain || '—' },
          { key: 'industry', header: 'Industry', render: (r) => r.industry || '—' },
          { key: 'country', header: 'Country', render: (r) => r.country || '—' },
        ]}
      />

      <Modal
        open={modalOpen}
        title="New Company"
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={() => createCompany.mutate()} disabled={!name || createCompany.isPending}>
              {createCompany.isPending ? 'Creating…' : 'Create'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Acme Corp" />
          <Input label="Website" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://acme.com" />
          <Input label="Industry" value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="Software" />
          {createCompany.isError && (
            <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {createCompany.error?.response?.data?.detail || 'Failed to create'}
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}
