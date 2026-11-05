import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api.js'
import { useOrganizationId } from '../hooks/useOrganization.js'
import { useToast } from '../lib/toast.jsx'
import { Button, Input, PageHeader } from '../components/ui.jsx'
import { DataTable, StatusBadge } from '../components/data.jsx'
import { Modal, ConfirmDialog } from '../components/modal.jsx'
import { CheckCircle2, Trash2, Pencil, Clock, Circle } from 'lucide-react'

export default function Tasks() {
  const { data: orgId } = useOrganizationId()
  const queryClient = useQueryClient()
  const toast = useToast()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [form, setForm] = useState({ title: '', priority: 'medium', due_date: '', description: '' })

  const { data, isLoading, error } = useQuery({
    queryKey: ['tasks', orgId],
    queryFn: async () => (await api.get('/tasks', { params: { organization_id: orgId, limit: 100 } })).data,
    enabled: !!orgId,
    refetchInterval: 5000,
  })

  function openCreate() { setEditing(null); setForm({ title: '', priority: 'medium', due_date: '', description: '' }); setOpen(true) }
  function openEdit(r) { setEditing(r); setForm({ title: r.title, priority: r.priority, due_date: r.due_date || '', description: r.description || '' }); setOpen(true) }

  const save = useMutation({
    mutationFn: async () => {
      if (editing) await api.patch(`/tasks/${editing.id}`, { ...form, due_date: form.due_date || null }, { params: { organization_id: orgId } })
      else await api.post('/tasks', { ...form, due_date: form.due_date || null }, { params: { organization_id: orgId } })
    },
    onSuccess: () => { queryClient.invalidateQueries(['tasks']); toast(editing ? 'Task updated' : 'Task created', 'success'); setOpen(false) },
    onError: (e) => toast(e.response?.data?.detail || 'Failed to save', 'error'),
  })

  const toggle = useMutation({
    mutationFn: async ({ id, status }) => api.patch(`/tasks/${id}`, { status }, { params: { organization_id: orgId } }),
    onSuccess: () => { queryClient.invalidateQueries(['tasks']); toast('Task updated', 'success') },
  })

  const remove = useMutation({
    mutationFn: async () => api.delete(`/tasks/${deleting.id}`, { params: { organization_id: orgId } }),
    onSuccess: () => { queryClient.invalidateQueries(['tasks']); toast('Task deleted', 'success'); setDeleting(null) },
  })

  const openCount = data?.items?.filter((t) => t.status === 'open' || t.status === 'in_progress').length || 0
  const doneCount = data?.items?.filter((t) => t.status === 'completed').length || 0

  return (
    <div>
      <PageHeader title="Tasks" subtitle={`${openCount} open · ${doneCount} completed`} actions={<Button onClick={openCreate}>+ New Task</Button>} />

      <DataTable
        loading={isLoading} error={error} data={data?.items}
        emptyTitle="No tasks" emptyDescription="Create a task to track follow-ups."
        columns={[
          {
            key: 'status_icon', header: '', className: 'w-10',
            render: (r) => (
              <button onClick={() => toggle.mutate({ id: r.id, status: r.status === 'completed' ? 'open' : 'completed' })} className="text-ink-400 hover:text-emerald-600">
                {r.status === 'completed' ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <Circle className="h-5 w-5" />}
              </button>
            ),
          },
          { key: 'title', header: 'Task', render: (r) => <span className={`font-medium ${r.status === 'completed' ? 'text-ink-400 line-through' : 'text-ink-900'}`}>{r.title}</span> },
          { key: 'priority', header: 'Priority', render: (r) => <StatusBadge status={r.priority} /> },
          { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
          { key: 'due_date', header: 'Due', render: (r) => (r.due_date ? <span className="flex items-center gap-1 text-ink-600"><Clock className="h-3.5 w-3.5" />{r.due_date}</span> : '—') },
          { key: 'actions', header: '', render: (r) => (<div className="flex justify-end gap-1"><IconBtn onClick={() => openEdit(r)}><Pencil className="h-4 w-4" /></IconBtn><IconBtn onClick={() => setDeleting(r)} danger><Trash2 className="h-4 w-4" /></IconBtn></div>) },
        ]}
      />

      <Modal open={open} title={editing ? 'Edit Task' : 'New Task'} onClose={() => setOpen(false)} footer={<><Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => save.mutate()} disabled={!form.title || save.isPending}>{save.isPending ? 'Saving…' : editing ? 'Update' : 'Create'}</Button></>}>
        <div className="space-y-4">
          <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-ink-700">Priority</span>
            <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="w-full rounded-lg border border-ink-300 bg-white px-3 py-2 text-sm">
              <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option>
            </select>
          </label>
          <Input label="Due Date" type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
        </div>
      </Modal>

      <ConfirmDialog open={!!deleting} title="Delete Task" message={`Delete "${deleting?.title}"?`} onConfirm={() => remove.mutate()} onCancel={() => setDeleting(null)} loading={remove.isPending} />
    </div>
  )
}

function IconBtn({ children, onClick, title, danger }) {
  return <button onClick={onClick} title={title} className={`rounded-md p-1.5 transition-colors ${danger ? 'text-ink-400 hover:bg-red-50 hover:text-red-600' : 'text-ink-400 hover:bg-ink-100 hover:text-ink-700'}`}>{children}</button>
}
