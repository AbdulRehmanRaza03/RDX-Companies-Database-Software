import { createContext, useContext, useEffect, useState } from 'react'
import api from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const token = localStorage.getItem('rdx_access_token')

  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }
    api
      .get('/auth/me')
      .then((res) => setUser(res.data))
      .catch(() => {
        localStorage.removeItem('rdx_access_token')
        localStorage.removeItem('rdx_refresh_token')
      })
      .finally(() => setLoading(false))
  }, [token])

  async function login(email, password) {
    const res = await api.post('/auth/login', { email, password })
    localStorage.setItem('rdx_access_token', res.data.access_token)
    localStorage.setItem('rdx_refresh_token', res.data.refresh_token)
    const me = await api.get('/auth/me')
    setUser(me.data)
    return me.data
  }

  function logout() {
    localStorage.removeItem('rdx_access_token')
    localStorage.removeItem('rdx_refresh_token')
    setUser(null)
    window.location.href = '/login'
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
