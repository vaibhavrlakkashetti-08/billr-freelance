import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../supabase'
import {
  LayoutDashboard, FileText,
  Users, Globe, BarChart3,
  Settings, LogOut, Menu,
  X, Plus, Bell
} from 'lucide-react'

const NAV = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Invoices', icon: FileText, path: '/invoice/new' },
  { label: 'Clients', icon: Users, path: '/clients' },
  { label: 'Portfolio', icon: Globe, path: '/portfolio' },
  { label: 'Analytics', icon: BarChart3, path: '/analytics' },
]

export default function Layout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    supabase.auth.getUser().then(
      ({ data: { user } }) => setUser(user)
    )
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  const name = user?.user_metadata?.full_name
    || user?.email?.split('@')[0]
    || 'User'

  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="min-h-screen 
      bg-slate-900 flex">

      {/* MOBILE OVERLAY */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50
            backdrop-blur-sm z-20 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside className={`
        fixed top-0 left-0 h-full w-64
        bg-slate-900 border-r border-slate-800
        z-30 flex flex-col
        transition-transform duration-300
        lg:translate-x-0
        ${open ? 'translate-x-0' : '-translate-x-full'}
      `}>

        {/* LOGO */}
        <div className="h-16 flex items-center
          justify-between px-6
          border-b border-slate-800">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600
              rounded-lg flex items-center
              justify-center">
              <FileText size={16}
                className="text-white" />
            </div>
            <span className="text-lg font-black
              text-white">
              BILLR
            </span>
          </button>
          <button
            onClick={() => setOpen(false)}
            className="lg:hidden text-slate-400
              hover:text-white p-1">
            <X size={20} />
          </button>
        </div>

        {/* USER */}
        <div className="p-4">
          <div className="flex items-center gap-3
            p-3 bg-slate-800 rounded-2xl
            border border-slate-700">
            <div className="w-9 h-9 bg-blue-600
              rounded-xl flex items-center
              justify-center text-white
              font-bold text-sm flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold
                text-white truncate">
                {name}
              </p>
              <p className="text-xs text-slate-400
                truncate">
                {user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* NAV */}
        <nav className="flex-1 px-3 space-y-1">
          {NAV.map(item => {
            const active =
              location.pathname === item.path
            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path)
                  setOpen(false)
                }}
                className={`w-full flex items-center
                  gap-3 px-4 py-3 rounded-xl
                  text-sm font-semibold
                  transition-all text-left
                  ${active
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}>
                <item.icon size={18} />
                {item.label}
              </button>
            )
          })}
        </nav>

        {/* UPGRADE */}
        <div className="p-4">
          <div className="bg-gradient-to-br
            from-blue-600 to-blue-700
            rounded-2xl p-4 text-white">
            <p className="text-sm font-bold mb-1">
              Upgrade to Pro 🚀
            </p>
            <p className="text-xs text-blue-200 mb-3">
              Unlimited invoices + GST + UPI
            </p>
            <button className="w-full bg-white/10
              text-white text-xs font-bold
              py-2 rounded-xl hover:bg-white/20
              transition-colors">
              Upgrade ₹299/mo
            </button>
          </div>
        </div>

        {/* SIGN OUT */}
        <div className="p-3 border-t border-slate-800">
          <button
            onClick={signOut}
            className="w-full flex items-center
              gap-3 px-4 py-3 rounded-xl text-sm
              font-semibold text-red-400
              hover:bg-red-500/10 transition-colors">
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 lg:ml-64
        flex flex-col min-h-screen">

        {/* TOP BAR */}
        <header className="sticky top-0
          bg-slate-900 border-b border-slate-800
          z-10 h-16 flex items-center
          justify-between px-6">

          <button
            onClick={() => setOpen(true)}
            className="lg:hidden text-slate-400
              hover:text-white p-1">
            <Menu size={22} />
          </button>

          <div className="hidden lg:block">
            <p className="text-base font-black
              text-white">
              {NAV.find(n =>
                n.path === location.pathname
              )?.label || 'BILLR'}
            </p>
          </div>

          <div className="flex items-center
            gap-3 ml-auto">
            <button className="relative p-2
              text-slate-400 hover:bg-slate-800
              rounded-xl transition-colors">
              <Bell size={20} />
            </button>
            <button
              onClick={() =>
                navigate('/invoice/new')}
              className="flex items-center gap-2
                bg-blue-600 text-white text-sm
                font-bold px-4 py-2 rounded-xl
                hover:bg-blue-500 transition-all
                shadow-lg shadow-blue-500/25
                hover:-translate-y-0.5">
              <Plus size={16} />
              <span className="hidden sm:block">
                New Invoice
              </span>
            </button>
          </div>
        </header>

        {/* CONTENT */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
