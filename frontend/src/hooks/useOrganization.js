import { useQuery } from '@tanstack/react-query'
import api from '../lib/api'

// Resolve the current user's (first) organization id for the single-org demo app.
export function useOrganizationId() {
  return useQuery({
    queryKey: ['organization'],
    queryFn: async () => {
      const res = await api.get('/organizations')
      const orgs = res.data
      if (orgs && orgs.length > 0) {
        return orgs[0].id
      }
      return null
    },
    staleTime: Infinity,
    retry: false,
  })
}
