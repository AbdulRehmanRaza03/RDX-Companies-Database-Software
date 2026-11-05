import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

async function fetchHealth() {
  const { data } = await axios.get('/api/v1/health')
  return data
}

export default function App() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['health'],
    queryFn: fetchHealth,
    refetchOnWindowFocus: false,
  })

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">RDX LeadFlow</h1>
        <p className="mt-1 text-sm text-slate-500">
          Foundation health check
        </p>

        <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
          {isLoading && <p className="text-slate-500">Checking backend…</p>}
          {isError && (
            <p className="text-red-600">
              Backend unreachable: {error?.message}
            </p>
          )}
          {data && (
            <p className="font-medium text-emerald-600">
              Status: {data.status}
            </p>
          )}
        </div>
      </div>
    </main>
  )
}
