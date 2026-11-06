import { Badge, Button, Card, EmptyState, Input, Select, Spinner, TableSkeleton } from './ui.jsx'

function statusVariant(status) {
  const s = (status || '').toLowerCase()
  if (['active', 'won', 'completed', 'paid', 'verified', 'connected'].includes(s)) return 'success'
  if (['paused', 'pending', 'draft', 'sent', 'scheduled'].includes(s)) return 'warning'
  if (['lost', 'failed', 'overdue', 'void', 'cancelled', 'bounced'].includes(s)) return 'danger'
  return 'info'
}

export function DataTable({
  columns,
  data,
  loading,
  error,
  onRowClick,
  emptyTitle,
  emptyDescription,
}) {
  if (loading) {
    return <TableSkeleton rows={6} cols={columns.length || 4} />
  }
  if (error) {
    return (
      <Card className="p-8 text-center text-sm text-red-600">
        Failed to load data. Please try again.
      </Card>
    )
  }
  if (!data?.length) {
    return (
      <Card>
        <EmptyState title={emptyTitle} description={emptyDescription} />
      </Card>
    )
  }
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-ink-200 bg-ink-50 text-xs uppercase tracking-wide text-ink-500">
              {columns.map((c) => (
                <th key={c.key} className={`px-4 py-3 font-medium ${c.className || ''}`}>
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr
                key={row.id ?? i}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={`border-b border-ink-100 last:border-0 hover:bg-brand-50/40 ${
                  onRowClick ? 'cursor-pointer' : ''
                }`}
              >
                {columns.map((c) => (
                  <td key={c.key} className={`px-4 py-3 text-ink-700 ${c.className || ''}`}>
                    {c.render ? c.render(row) : row[c.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

export function StatusBadge({ status }) {
  return <Badge variant={statusVariant(status)}>{status}</Badge>
}

export function SearchInput({ value, onChange, placeholder = 'Search…' }) {
  return (
    <div className="relative">
      <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-ink-300 bg-surface py-2 pl-9 pr-3 text-sm text-ink-900 placeholder-ink-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-400"
      />
    </div>
  )
}

export { Button, Card, EmptyState, Input, Select, Spinner }
