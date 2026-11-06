import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './lib/auth.jsx'
import { ToastProvider } from './lib/toast.jsx'
import { ThemeProvider } from './lib/theme.jsx'
import Layout from './layout/Layout.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Companies from './pages/Companies.jsx'
import CompanyDetail from './pages/CompanyDetail.jsx'
import Contacts from './pages/Contacts.jsx'
import Deals from './pages/Deals.jsx'
import Tasks from './pages/Tasks.jsx'
import Campaigns from './pages/Campaigns.jsx'
import Finance from './pages/Finance.jsx'
import Reports from './pages/Reports.jsx'
import Team from './pages/Team.jsx'

function Protected({ children }) {
  const { user, loading } = useAuth()
  if (loading) {
    return <div className="flex h-screen items-center justify-center text-ink-400">Loading…</div>
  }
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Protected><Layout><Dashboard /></Layout></Protected>} />
            <Route path="/companies" element={<Protected><Layout><Companies /></Layout></Protected>} />
            <Route path="/companies/:id" element={<Protected><Layout><CompanyDetail /></Layout></Protected>} />
            <Route path="/contacts" element={<Protected><Layout><Contacts /></Layout></Protected>} />
            <Route path="/deals" element={<Protected><Layout><Deals /></Layout></Protected>} />
            <Route path="/tasks" element={<Protected><Layout><Tasks /></Layout></Protected>} />
            <Route path="/campaigns" element={<Protected><Layout><Campaigns /></Layout></Protected>} />
            <Route path="/finance" element={<Protected><Layout><Finance /></Layout></Protected>} />
            <Route path="/reports" element={<Protected><Layout><Reports /></Layout></Protected>} />
            <Route path="/team" element={<Protected><Layout><Team /></Layout></Protected>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
