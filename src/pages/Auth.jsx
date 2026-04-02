import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import {
  FileText, Mail, Lock,
  User, Eye, EyeOff, ArrowLeft
} from 'lucide-react'

export default function Auth() {
  const navigate = useNavigate()
  const [isLogin, setIsLogin] = useState(true)
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [gLoading, setGLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [isError, setIsError] = useState(false)
  const [form, setForm] = useState({
    name: '', email: '', password: ''
  })

  useEffect(() => {
    // If already logged in go to dashboard
    supabase.auth.getSession().then(
      ({ data: { session } }) => {
        if (session) {
          navigate('/dashboard', 
            { replace: true })
        }
      }
    )

    // Listen for auth state changes
    const { data: { subscription } } =
      supabase.auth.onAuthStateChange(
        (event, session) => {
          if (session?.user) {
            navigate('/dashboard',
              { replace: true })
          }
        }
      )

    return () => subscription.unsubscribe()
  }, [navigate])

  const showMsg = (text, error = false) => {
    setMsg(text)
    setIsError(error)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMsg('')
    setLoading(true)

    try {
      if (isLogin) {
        const { data, error } = await
          supabase.auth.signInWithPassword({
            email: form.email.trim(),
            password: form.password,
          })
        if (error) throw error
        if (data.session) {
          navigate('/dashboard',
            { replace: true })
        } else {
          showMsg(
            'Login did not complete. Please try again.',
            true
          )
        }
      } else {
        if (form.password.length < 6) {
          throw new Error(
            'Password needs 6+ characters')
        }
        const { data, error } = await
          supabase.auth.signUp({
            email: form.email.trim(),
            password: form.password,
            options: {
              data: {
                full_name: form.name
              }
            }
          })
        if (error) throw error
        if (data.session) {
          navigate('/dashboard', { replace: true })
        } else {
          showMsg(
            'Account created. Check your email to verify, then log in.'
          )
          setIsLogin(true)
          setForm(p => ({
            ...p, password: '', name: ''
          }))
        }
      }
    } catch (err) {
      const message = err?.message || 'Something went wrong'
      if (message.toLowerCase().includes('email not confirmed')) {
        showMsg(
          'Please verify your email first, then log in.',
          true
        )
      } else {
        showMsg(message, true)
      }
    } finally {
      setLoading(false)
    }
  }
  const handleGoogle = async () => {
    setMsg('')
    setGLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      })
      if (error) throw error
      // Don't reset gLoading — browser will redirect to Google
    } catch (err) {
      showMsg(err.message, true)
      setGLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen bg-slate-900
      flex items-center justify-center p-4">

      <div className="absolute inset-0
        overflow-hidden pointer-events-none">
        <div className="absolute -top-40
          -right-40 w-96 h-96 bg-blue-600/10
          rounded-full opacity-60 blur-3xl" />
        <div className="absolute -bottom-40
          -left-40 w-96 h-96 bg-slate-700/30
          rounded-full opacity-60 blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">

        <a href="/"
          className="inline-flex items-center
            gap-2 text-slate-400
            hover:text-blue-400 text-sm mb-8
            transition-colors group">
          <ArrowLeft size={16}
            className="group-hover:-translate-x-1
              transition-transform" />
          Back to home
        </a>

        <div className="bg-slate-800 rounded-3xl
          border border-slate-700 p-8">

          {/* LOGO */}
          <div className="flex items-center
            justify-center gap-2 mb-8">
            <div className="w-10 h-10 bg-blue-600
              rounded-xl flex items-center
              justify-center shadow-lg
              shadow-blue-200">
              <FileText size={20}
                className="text-white" />
            </div>
            <span className="text-2xl font-black
              text-white">
              BILLR
            </span>
          </div>

          {/* TOGGLE */}
          <div className="flex bg-slate-700
            rounded-2xl p-1 mb-8">
            {['Log In', 'Sign Up'].map((t, i) => (
              <button key={t}
                onClick={() => {
                  setIsLogin(i === 0)
                  setMsg('')
                }}
                className={`flex-1 py-2.5
                  rounded-xl text-sm font-semibold
                  transition-all
                  ${(i === 0) === isLogin
                    ? 'bg-slate-700 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                  }`}>
                {t}
              </button>
            ))}
          </div>

          {/* TITLE */}
          <div className="mb-6">
            <h1 className="text-2xl font-black
              text-white">
              {isLogin
                ? 'Welcome back! 👋'
                : 'Create account ✨'}
            </h1>
            <p className="text-slate-400 text-sm
              mt-1">
              {isLogin
                ? 'Log in to manage invoices'
                : 'Start free — no credit card'}
            </p>
          </div>

          {/* MESSAGE */}
          {msg && (
            <div className={`p-3 rounded-xl
              text-sm font-medium mb-4
              ${isError
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'bg-green-500/20 text-green-400 border border-green-500/30'
              }`}>
              {msg}
            </div>
          )}

          {/* GOOGLE */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={gLoading}
            className="w-full flex items-center
              justify-center gap-3 border-2 bg-slate-700
              border-slate-600 rounded-2xl
              py-3 px-4 text-sm font-semibold
              text-slate-300 hover:border-blue-400
              hover:bg-slate-600 transition-all mb-6
              disabled:opacity-70
              disabled:cursor-not-allowed">
            {gLoading ? (
              <div className="w-5 h-5 border-2
                border-slate-400 border-t-blue-600
                rounded-full animate-spin" />
            ) : (
              <img
                src="https://www.google.com/favicon.ico"
                alt="G"
                className="w-5 h-5"
              />
            )}
            {gLoading
              ? 'Opening Google...'
              : 'Continue with Google'}
          </button>

          {/* DIVIDER */}
          <div className="flex items-center
            gap-4 mb-6">
            <div className="flex-1 h-px
              bg-slate-700" />
            <span className="text-xs
              text-slate-500 font-medium">
              OR
            </span>
            <div className="flex-1 h-px
              bg-slate-700" />
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit}
            className="space-y-4">

            {!isLogin && (
              <div>
                <label className="text-sm
                  font-semibold text-slate-300
                  mb-2 block">
                  Full Name
                </label>
                <div className="relative">
                  <User size={18}
                    className="absolute left-4
                      top-1/2 -translate-y-1/2
                      text-slate-400" />
                  <input
                    type="text"
                    placeholder="Your full name"
                    value={form.name}
                    onChange={e => setForm(
                      p => ({
                        ...p,
                        name: e.target.value
                      }))}
                    className="w-full pl-11 pr-4 bg-slate-700
                      py-3 border-2 border-slate-600
                      rounded-2xl text-sm
                      text-white
                      placeholder:text-slate-500
                      focus:outline-none
                      focus:border-blue-400
                      transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-sm
                font-semibold text-slate-300
                mb-2 block">
                Email Address
              </label>
              <div className="relative">
                <Mail size={18}
                  className="absolute left-4
                    top-1/2 -translate-y-1/2
                    text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm(
                    p => ({
                      ...p,
                      email: e.target.value
                    }))}
                  className="w-full pl-11 pr-4 bg-slate-700
                    py-3 border-2 border-slate-600
                    rounded-2xl text-sm
                    text-white
                    placeholder:text-slate-500
                    focus:outline-none
                    focus:border-blue-400
                    transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between
                items-center mb-2">
                <label className="text-sm
                  font-semibold text-slate-300">
                  Password
                </label>
                {isLogin && (
                  <button type="button"
                    className="text-xs
                      text-blue-400
                      hover:text-blue-400
                      font-medium">
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock size={18}
                  className="absolute left-4
                    top-1/2 -translate-y-1/2
                    text-slate-400" />
                <input
                  type={showPass
                    ? 'text' : 'password'}
                  required
                  placeholder={isLogin
                    ? 'Your password'
                    : 'Min 6 characters'}
                  value={form.password}
                  onChange={e => setForm(
                    p => ({
                      ...p,
                      password: e.target.value
                    }))}
                  className="w-full pl-11 pr-12 bg-slate-700
                    py-3 border-2 border-slate-600
                    rounded-2xl text-sm
                    text-white
                    placeholder:text-slate-500
                    focus:outline-none
                    focus:border-blue-400
                    transition-colors"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPass(!showPass)}
                  className="absolute right-4
                    top-1/2 -translate-y-1/2
                    text-slate-400
                    hover:text-slate-600">
                  {showPass
                    ? <EyeOff size={18} />
                    : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600
                text-white font-bold py-3.5
                rounded-2xl text-sm
                hover:bg-blue-500 transition-all
                shadow-lg shadow-blue-500/25
                hover:-translate-y-0.5
                disabled:opacity-70
                disabled:cursor-not-allowed
                disabled:transform-none
                flex items-center
                justify-center gap-2">
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2
                    border-white/30 border-t-white
                    rounded-full animate-spin" />
                  Please wait...
                </>
              ) : (
                isLogin
                  ? 'Log In'
                  : 'Create Free Account'
              )}
            </button>
          </form>

          <p className="text-center text-sm
            text-slate-400 mt-6">
            {isLogin
              ? "Don't have an account? "
              : 'Already have an account? '}
            <button
              onClick={() => {
                setIsLogin(!isLogin)
                setMsg('')
              }}
              className="text-blue-400
                font-semibold
                hover:text-blue-400">
              {isLogin ? 'Sign up free' : 'Log in'}
            </button>
          </p>
        </div>

        <p className="text-center text-xs
          text-slate-500 mt-6">
          🔒 Bank-grade encryption
        </p>
      </div>
    </div>
  )
}