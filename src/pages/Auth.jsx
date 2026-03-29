import { useState } from 'react'
import { FileText, Mail, Lock, 
  User, Eye, EyeOff, 
  ArrowLeft } from 'lucide-react'

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true)
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '', email: '', password: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => setLoading(false), 2000)
  }

  return (
    <div className="min-h-screen bg-slate-50 
      flex items-center justify-center p-4">

      {/* BACKGROUND DECORATION */}
      <div className="absolute inset-0 overflow-hidden 
        pointer-events-none">
        <div className="absolute -top-40 -right-40 
          w-96 h-96 bg-blue-100 rounded-full 
          opacity-50 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 
          w-96 h-96 bg-indigo-100 rounded-full 
          opacity-50 blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">

        {/* BACK TO HOME */}
        <a href="/" className="inline-flex items-center 
          gap-2 text-slate-500 hover:text-blue-600 
          text-sm mb-8 transition-colors group">
          <ArrowLeft size={16} className="group-hover:
            -translate-x-1 transition-transform" />
          Back to home
        </a>

        {/* CARD */}
        <div className="bg-white rounded-3xl shadow-xl 
          shadow-slate-200 border border-slate-100 p-8">

          {/* LOGO */}
          <div className="flex items-center 
            justify-center gap-2 mb-8">
            <div className="w-10 h-10 bg-blue-600 
              rounded-xl flex items-center justify-center
              shadow-lg shadow-blue-200">
              <FileText size={20} className="text-white"/>
            </div>
            <span className="text-2xl font-black 
              text-slate-800">
              BILLR
            </span>
          </div>

          {/* TOGGLE LOGIN/SIGNUP */}
          <div className="flex bg-slate-100 
            rounded-2xl p-1 mb-8">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2.5 rounded-xl 
                text-sm font-semibold transition-all
                ${isLogin 
                  ? 'bg-white text-slate-800 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
                }`}>
              Log In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2.5 rounded-xl 
                text-sm font-semibold transition-all
                ${!isLogin 
                  ? 'bg-white text-slate-800 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
                }`}>
              Sign Up
            </button>
          </div>

          {/* TITLE */}
          <div className="mb-6">
            <h1 className="text-2xl font-black 
              text-slate-900">
              {isLogin 
                ? 'Welcome back! 👋' 
                : 'Create your account ✨'}
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              {isLogin 
                ? 'Log in to manage your invoices' 
                : 'Start creating GST invoices for free'}
            </p>
          </div>

          {/* GOOGLE BUTTON */}
          <button className="w-full flex items-center 
            justify-center gap-3 border-2 border-slate-200 
            rounded-2xl py-3 px-4 text-sm font-semibold
            text-slate-700 hover:border-blue-300 
            hover:bg-blue-50 transition-all mb-6">
           <img 
  src="https://www.google.com/favicon.ico" 
  alt="Google" 
  className="w-5 h-5" 
/>
Continue with Google
          </button>

          {/* DIVIDER */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400 
              font-medium">
              OR
            </span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} 
            className="space-y-4">

            {/* NAME — Signup only */}
            {!isLogin && (
              <div>
                <label className="text-sm font-semibold 
                  text-slate-700 mb-2 block">
                  Full Name
                </label>
                <div className="relative">
                  <User size={18} 
                    className="absolute left-4 top-1/2 
                    -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Vaibhav Lakkashetti"
                    value={form.name}
                    onChange={e => setForm({
                      ...form, name: e.target.value
                    })}
                    className="w-full pl-11 pr-4 py-3 
                      border-2 border-slate-200 rounded-2xl
                      text-sm text-slate-800
                      placeholder:text-slate-400
                      focus:outline-none 
                      focus:border-blue-500
                      transition-colors"
                  />
                </div>
              </div>
            )}

            {/* EMAIL */}
            <div>
              <label className="text-sm font-semibold 
                text-slate-700 mb-2 block">
                Email Address
              </label>
              <div className="relative">
                <Mail size={18} 
                  className="absolute left-4 top-1/2 
                  -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm({
                    ...form, email: e.target.value
                  })}
                  className="w-full pl-11 pr-4 py-3 
                    border-2 border-slate-200 rounded-2xl
                    text-sm text-slate-800
                    placeholder:text-slate-400
                    focus:outline-none 
                    focus:border-blue-500
                    transition-colors"
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <div className="flex justify-between 
                items-center mb-2">
                <label className="text-sm font-semibold 
                  text-slate-700">
                  Password
                </label>
                {isLogin && (
                  <a href="#" className="text-xs 
                    text-blue-600 hover:text-blue-700
                    font-medium">
                    Forgot password?
                  </a>
                )}
              </div>
              <div className="relative">
                <Lock size={18} 
                  className="absolute left-4 top-1/2 
                  -translate-y-1/2 text-slate-400" />
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder={isLogin 
                    ? 'Enter password' 
                    : 'Min 8 characters'}
                  value={form.password}
                  onChange={e => setForm({
                    ...form, password: e.target.value
                  })}
                  className="w-full pl-11 pr-12 py-3 
                    border-2 border-slate-200 rounded-2xl
                    text-sm text-slate-800
                    placeholder:text-slate-400
                    focus:outline-none 
                    focus:border-blue-500
                    transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 
                    -translate-y-1/2 text-slate-400
                    hover:text-slate-600 transition-colors">
                  {showPass 
                    ? <EyeOff size={18} /> 
                    : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* PASSWORD STRENGTH — Signup only */}
            {!isLogin && form.password.length > 0 && (
              <div className="space-y-1">
                <div className="flex gap-1">
                  {[1,2,3,4].map(i => (
                    <div key={i} 
                      className={`flex-1 h-1.5 rounded-full 
                        transition-all ${
                        form.password.length >= i * 2
                          ? i <= 1 ? 'bg-red-400'
                          : i <= 2 ? 'bg-yellow-400'
                          : i <= 3 ? 'bg-blue-400'
                          : 'bg-green-400'
                          : 'bg-slate-200'
                      }`} />
                  ))}
                </div>
                <p className="text-xs text-slate-400">
                  {form.password.length < 4 
                    ? '🔴 Too weak'
                    : form.password.length < 6 
                    ? '🟡 Getting better'
                    : form.password.length < 8 
                    ? '🔵 Almost there'
                    : '🟢 Strong password!'}
                </p>
              </div>
            )}

            {/* TERMS — Signup only */}
            {!isLogin && (
              <p className="text-xs text-slate-500">
                By signing up you agree to our{' '}
                <a href="#" className="text-blue-600 
                  hover:underline font-medium">
                  Terms of Service
                </a>
                {' '}and{' '}
                <a href="#" className="text-blue-600 
                  hover:underline font-medium">
                  Privacy Policy
                </a>
              </p>
            )}

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white 
                font-bold py-3.5 rounded-2xl text-sm
                hover:bg-blue-700 transition-all
                shadow-lg shadow-blue-200
                hover:shadow-blue-300
                hover:-translate-y-0.5
                disabled:opacity-70
                disabled:cursor-not-allowed
                disabled:transform-none
                flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 
                    border-white/30 border-t-white 
                    rounded-full animate-spin" />
                  {isLogin 
                    ? 'Logging in...' 
                    : 'Creating account...'}
                </>
              ) : (
                isLogin ? 'Log In' : 'Create Free Account'
              )}
            </button>
          </form>

          {/* SWITCH MODE */}
          <p className="text-center text-sm 
            text-slate-500 mt-6">
            {isLogin 
              ? "Don't have an account? " 
              : 'Already have an account? '}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-600 font-semibold 
                hover:text-blue-700 transition-colors">
              {isLogin ? 'Sign up free' : 'Log in'}
            </button>
          </p>
        </div>

        {/* BOTTOM NOTE */}
        <p className="text-center text-xs 
          text-slate-400 mt-6">
          🔒 Secured with bank-grade encryption
        </p>
      </div>
    </div>
  )
}