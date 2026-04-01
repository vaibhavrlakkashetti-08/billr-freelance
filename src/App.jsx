import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import Callback from './pages/Callback'
import Dashboard from './pages/Dashboard'
import Invoice from './pages/Invoice'
import Clients from './pages/Clients'
import Analytics from './pages/Analytics'
import Portfolio from './pages/Portfolio'
import Layout from './components/Layout'

function ProtectedRoute({ children }) {
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setStatus(session ? 'ok' : 'none')
    })

    const { data: { subscription } } =
      supabase.auth.onAuthStateChange((_, session) => {
        setStatus(session ? 'ok' : 'none')
      })

    return () => subscription.unsubscribe()
  }, [])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-50
        flex items-center justify-center">
        <div className="w-10 h-10 border-4
          border-blue-600 border-t-transparent
          rounded-full animate-spin" />
      </div>
    )
  }

  if (status === 'none') return <Navigate to="/auth" replace />

  return <Layout>{children}</Layout>
}


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC */}
        <Route path="/"
          element={<Landing />} />
        <Route path="/auth"
          element={<Auth />} />
        <Route path="/auth/login"
          element={<Navigate to="/auth" replace />} />
        <Route path="/auth/signup"
          element={<Navigate to="/auth" replace />} />
        <Route path="/callback"
          element={<Callback />} />
        <Route path="/portfolio/:username"
          element={<Portfolio />} />

        {/* PROTECTED */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/invoice/new" element={
          <ProtectedRoute>
            <Invoice />
          </ProtectedRoute>
        } />
        <Route path="/clients" element={
          <ProtectedRoute>
            <Clients />
          </ProtectedRoute>
        } />
        <Route path="/analytics" element={
          <ProtectedRoute>
            <Analytics />
          </ProtectedRoute>
        } />
        <Route path="/portfolio" element={
          <ProtectedRoute>
            <Portfolio />
          </ProtectedRoute>
        } />

        {/* CATCH ALL */}
        <Route path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  )
}
