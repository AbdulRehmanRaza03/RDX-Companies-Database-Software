import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api.js'
import { useOrganizationId } from '../hooks/useOrganization.js'
import { Button, Input, PageHeader } from '../components/ui.jsx'
import { DataTable, StatusBadge } from '../components/data.jsx'
import { Modal } from '../components/modal.jsx'

export default function Tasks() {
  const { data: orgId } = useOrganizationId()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ title: '', priority: 'medium', due_date: '' })

  const { data, isLoading, error } = useQuery({
    queryKey: ['tasks', orgId],
    queryFn: async () => (await api.get('/tasks', { params: { organization_id: orgId, limit: 100 } })).data,
    enabled: !!orgId,
  })

  const createTask = useMutation({
    mutationFn: async () => {
      await api.post('/tasks', { ...form, due_date: form.due_date || null }, { params: { organization_id: orgId } })
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks'])
      setOpen(false)
      setForm({ title: '', priority: 'medium', due_date: '' })
    },
  })

  const toggle = useMutation({
    mutationFn: async ({ id, status }) => {
      await api.patch(`/tasks/${id}`, { status }, { params: { organization_id: orgId } })
    },
    onSuccess: () => queryClient.invalidateQueries(['tasks']),
  })

  return (
    <div>
      <PageHeader
        title="Tasks"
        subtitle="Assigned work and follow-ups."
        actions={<Button onClick={() => setOpen(true)}>+ New Task</Button>}
      />

      <DataTable
        loading={isLoading}
        error={error}
        data={data?.items}
        emptyTitle="No tasks"
        emptyDescription="Create a task to track follow-ups."
        columns={[
          { key: 'title', header: 'Task', render: (r) => <span className="font-medium text-ink-900">{r.title}</span> },
          { key: 'priority', header: 'Priority', render: (r) => <StatusBadge status={r.priority} /> },
          { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
          { key: 'due_date', header: 'Due', render: (r) => r.due_date || '—' },
          {
            key: 'actions',
            header: '',
            render: (r) =>
              r.status !== 'completed' ? (
                <Button size="sm" variant="secondary" onClick={() => toggle.mutate({ id: r.id, status: 'completed' })}>
                  Complete
                </Button>
              ) : null,
          },
        ]}
      />

      <Modal
        open={open}
        title="New Task"
        onClose={() => setOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => createTask.mutate()} disabled={!form.title || createTask.isPending}>
              {createTask.isPending ? 'Creating…' : 'Create'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-ink-700">Priority</span>
            <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="w-full rounded-lg border border-ink-300 bg-white px-3 py-2 text-sm">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </label>
          <Input label="Due Date" type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
        </div>
      </Modal>
    </div>
  )
}
