import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

export default function Callback() {
  const navigate = useNavigate()

  useEffect(() => {
    const { data: { subscription } } =
      supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session) {
          navigate('/dashboard', { replace: true })
        } else if (event === 'SIGNED_OUT') {
          navigate('/auth', { replace: true })
        }
      })

    // In case session already exists when page loads
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate('/dashboard', { replace: true })
    })

    return () => subscription.unsubscribe()
  }, [navigate])

  return (
    <div className="min-h-screen bg-slate-50
      flex flex-col items-center justify-center gap-4">
      <div className="w-14 h-14 border-4
        border-blue-600 border-t-transparent
        rounded-full animate-spin" />
      <p className="text-slate-600 font-semibold text-lg">
        Signing you in...
      </p>
      <p className="text-slate-400 text-sm">
        Please wait, do not refresh
      </p>
    </div>
  )
}