import axios from 'axios'

const BASE_URL = '/api/v1'

const api = axios.create({ baseURL: BASE_URL })

// Attach the access token from localStorage on every request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('rdx_access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// On 401, clear tokens and redirect to login (unless already there).
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('rdx_access_token')
      localStorage.removeItem('rdx_refresh_token')
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)

export default api
