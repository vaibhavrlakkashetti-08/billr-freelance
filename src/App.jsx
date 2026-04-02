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
import LogsDashboard from './pages/LogsDashboard'
import Layout from './components/Layout'

const adminEmails = import.meta.env.VITE_ADMIN_EMAILS ? import.meta.env.VITE_ADMIN_EMAILS.split(',').map(e => e.trim()) : [];

function AdminRoute({ children }) {
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
          if (adminEmails.length > 0 && !adminEmails.includes(session.user.email)) {
              setStatus('forbidden');
          } else {
              setStatus('ok');
          }
      } else {
          setStatus('none');
      }
    })

    const { data: { subscription } } =
      supabase.auth.onAuthStateChange((_, session) => {
        if (session) {
          if (adminEmails.length > 0 && !adminEmails.includes(session.user.email)) {
              setStatus('forbidden');
          } else {
              setStatus('ok');
          }
        } else {
            setStatus('none');
        }
      })

    return () => subscription.unsubscribe()
  }, [])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (status === 'none') return <Navigate to="/auth" replace />
  if (status === 'forbidden') {
    return (
      <Layout>
        <div className="min-h-[80vh] flex flex-col items-center justify-center text-center">
          <div className="p-4 bg-red-100 text-red-600 rounded-full mb-4 inline-flex">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Access Denied</h2>
          <p className="text-slate-600 max-w-sm">
            You do not have administrative privileges to view this page.
          </p>
        </div>
      </Layout>
    )
  }

  return <Layout>{children}</Layout>
}

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
        <Route path="/admin/logs" element={
          <AdminRoute>
            <LogsDashboard />
          </AdminRoute>
        } />

        {/* CATCH ALL */}
        <Route path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  )
}
