import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api.js'
import { useOrganizationId } from '../hooks/useOrganization.js'
import { Button, Input, PageHeader } from '../components/ui.jsx'
import { DataTable, StatusBadge } from '../components/data.jsx'
import { Modal } from '../components/modal.jsx'

export default function Finance() {
  const { data: orgId } = useOrganizationId()
  const queryClient = useQueryClient()
  const [tab, setTab] = useState('invoices')

  const { data: financials } = useQuery({
    queryKey: ['financials', orgId],
    queryFn: async () => (await api.get('/reports/financials', { params: { organization_id: orgId } })).data,
    enabled: !!orgId,
  })

  return (
    <div>
      <PageHeader title="Finance" subtitle="Invoices, payments, expenses and revenue." />

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Revenue" value={`$${Number(financials?.revenue_total || 0).toLocaleString()}`} />
        <StatCard label="Expenses" value={`$${Number(financials?.expenses_total || 0).toLocaleString()}`} />
        <StatCard label="Outstanding" value="—" />
        <StatCard label="Net" value={`$${(Number(financials?.revenue_total || 0) - Number(financials?.expenses_total || 0)).toLocaleString()}`} />
      </div>

      <div className="mb-4 flex gap-2 border-b border-ink-200">
        {['invoices', 'payments', 'expenses', 'revenue'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium capitalize ${
              tab === t ? 'border-brand-600 text-brand-700' : 'border-transparent text-ink-500 hover:text-ink-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'invoices' && <Invoices orgId={orgId} />}
      {tab === 'payments' && <Payments orgId={orgId} />}
      {tab === 'expenses' && <Expenses orgId={orgId} />}
      {tab === 'revenue' && <Revenue orgId={orgId} />}
    </div>
  )
}

function Invoices({ orgId }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ company_id: '', invoice_number: '', items: [] })
  const queryClient = useQueryClient()

  const { data: companies } = useQuery({
    queryKey: ['companies-inv', orgId],
    queryFn: async () => (await api.get('/companies', { params: { organization_id: orgId, limit: 100 } })).data,
    enabled: !!orgId,
  })

  const { data, isLoading, error } = useQuery({
    queryKey: ['invoices', orgId],
    queryFn: async () => (await api.get('/invoices', { params: { organization_id: orgId, limit: 100 } })).data,
    enabled: !!orgId,
  })

  const create = useMutation({
    mutationFn: async () => {
      await api.post('/invoices', { ...form, items: [{ description: 'Service', quantity: 1, unit_price: '1000' }] }, { params: { organization_id: orgId } })
    },
    onSuccess: () => { queryClient.invalidateQueries(['invoices']); setOpen(false) },
  })

  return (
    <>
      <div className="mb-3 flex justify-end">
        <Button size="sm" onClick={() => setOpen(true)}>+ New Invoice</Button>
      </div>
      <DataTable
        loading={isLoading}
        error={error}
        data={data?.items}
        emptyTitle="No invoices"
        columns={[
          { key: 'invoice_number', header: 'Invoice #', render: (r) => <span className="font-medium text-ink-900">{r.invoice_number}</span> },
          { key: 'total', header: 'Total', render: (r) => (r.total ? `$${Number(r.total).toLocaleString()}` : '—') },
          { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
        ]}
      />
      <Modal open={open} title="New Invoice" onClose={() => setOpen(false)} footer={<><Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => create.mutate()} disabled={!form.company_id || !form.invoice_number}>Create</Button></>}>
        <div className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-ink-700">Company</span>
            <select value={form.company_id} onChange={(e) => setForm({ ...form, company_id: e.target.value })} className="w-full rounded-lg border border-ink-300 bg-white px-3 py-2 text-sm">
              <option value="">Select…</option>
              {companies?.items?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
          <Input label="Invoice Number" value={form.invoice_number} onChange={(e) => setForm({ ...form, invoice_number: e.target.value })} placeholder="INV-002" />
        </div>
      </Modal>
    </>
  )
}

function Payments({ orgId }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['payments', orgId],
    queryFn: async () => (await api.get('/payments', { params: { organization_id: orgId, limit: 100 } })).data,
    enabled: !!orgId,
  })
  return (
    <DataTable
      loading={isLoading}
      error={error}
      data={data?.items}
      emptyTitle="No payments"
      columns={[
        { key: 'amount', header: 'Amount', render: (r) => <span className="font-medium text-ink-900">${Number(r.amount).toLocaleString()}</span> },
        { key: 'method', header: 'Method', render: (r) => r.method.replace('_', ' ') },
        { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
      ]}
    />
  )
}

function Expenses({ orgId }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['expenses', orgId],
    queryFn: async () => (await api.get('/expenses', { params: { organization_id: orgId, limit: 100 } })).data,
    enabled: !!orgId,
  })
  return (
    <DataTable
      loading={isLoading}
      error={error}
      data={data?.items}
      emptyTitle="No expenses"
      columns={[
        { key: 'category', header: 'Category', render: (r) => r.category || '—' },
        { key: 'amount', header: 'Amount', render: (r) => <span className="font-medium text-ink-900">${Number(r.amount).toLocaleString()}</span> },
        { key: 'description', header: 'Description', render: (r) => r.description || '—' },
      ]}
    />
  )
}

function Revenue({ orgId }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['revenue', orgId],
    queryFn: async () => (await api.get('/revenue', { params: { organization_id: orgId, limit: 100 } })).data,
    enabled: !!orgId,
  })
  return (
    <DataTable
      loading={isLoading}
      error={error}
      data={data?.items}
      emptyTitle="No revenue records"
      columns={[
        { key: 'type', header: 'Type', render: (r) => <StatusBadge status={r.type} /> },
        { key: 'amount', header: 'Amount', render: (r) => <span className="font-medium text-ink-900">${Number(r.amount).toLocaleString()}</span> },
      ]}
    />
  )
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-xl border border-ink-200 bg-white p-4 shadow-sm">
      <div className="text-xl font-bold text-ink-900">{value}</div>
      <div className="text-xs text-ink-500">{label}</div>
    </div>
  )
}
