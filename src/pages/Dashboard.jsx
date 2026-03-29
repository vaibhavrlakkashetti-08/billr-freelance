import { useState } from 'react'
import { 
  FileText, Users, DollarSign, 
  TrendingUp, Plus, Bell, 
  Settings, LogOut, Eye,
  Download, Send, Clock,
  CheckCircle, AlertCircle,
  BarChart3, ChevronRight,
  Menu, X
} from 'lucide-react'

const user = {
  name: 'Vaibhav',
  email: 'vaibhav@example.com',
  plan: 'Free',
  initials: 'VL'
}

const recentInvoices = [
  {
    id: 'INV-001',
    client: 'Acme Corp',
    amount: 15000,
    status: 'paid',
    date: 'Mar 5, 2026',
    due: 'Mar 12, 2026'
  },
  {
    id: 'INV-002',
    client: 'TechStart India',
    amount: 8500,
    status: 'pending',
    date: 'Mar 6, 2026',
    due: 'Mar 13, 2026'
  },
  {
    id: 'INV-003',
    client: 'Design Studio',
    amount: 22000,
    status: 'overdue',
    date: 'Feb 20, 2026',
    due: 'Feb 27, 2026'
  },
  {
    id: 'INV-004',
    client: 'Startup Hub',
    amount: 5000,
    status: 'draft',
    date: 'Mar 7, 2026',
    due: 'Mar 14, 2026'
  },
]

const statusConfig = {
  paid: { 
    label: 'Paid', 
    color: 'bg-green-100 text-green-700',
    icon: CheckCircle
  },
  pending: { 
    label: 'Pending', 
    color: 'bg-yellow-100 text-yellow-700',
    icon: Clock
  },
  overdue: { 
    label: 'Overdue', 
    color: 'bg-red-100 text-red-700',
    icon: AlertCircle
  },
  draft: { 
    label: 'Draft', 
    color: 'bg-slate-100 text-slate-600',
    icon: FileText
  },
}

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activePage, setActivePage] = useState('dashboard')

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'invoices', label: 'Invoices', icon: FileText },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'portfolio', label: 'Portfolio', icon: Eye },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-slate-50 flex">

      {/* SIDEBAR OVERLAY MOBILE */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 
            z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside className={`fixed top-0 left-0 h-full 
        w-64 bg-white border-r border-slate-100 
        z-30 flex flex-col transition-transform 
        duration-300 lg:translate-x-0
        ${sidebarOpen 
          ? 'translate-x-0' 
          : '-translate-x-full'}`}>

        {/* SIDEBAR HEADER */}
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center 
            justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 
                rounded-lg flex items-center 
                justify-center">
                <FileText size={16} 
                  className="text-white" />
              </div>
              <span className="text-lg font-black 
                text-slate-800">
                BILLR
              </span>
            </div>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-slate-400 
                hover:text-slate-600">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* USER CARD */}
        <div className="p-4 mx-4 mt-4 bg-slate-50 
          rounded-2xl border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 
              rounded-xl flex items-center 
              justify-center text-white 
              font-bold text-sm">
              {user.initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold 
                text-slate-800 truncate">
                {user.name}
              </p>
              <p className="text-xs text-slate-500 
                truncate">
                {user.email}
              </p>
            </div>
            <span className="text-xs bg-blue-100 
              text-blue-700 font-semibold px-2 
              py-1 rounded-full flex-shrink-0">
              {user.plan}
            </span>
          </div>
        </div>

        {/* NAV ITEMS */}
        <nav className="flex-1 p-4 space-y-1 mt-2">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => {
                setActivePage(item.id)
                setSidebarOpen(false)
              }}
              className={`w-full flex items-center 
                gap-3 px-4 py-3 rounded-xl text-sm 
                font-semibold transition-all
                ${activePage === item.id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                }`}>
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>

        {/* UPGRADE BANNER */}
        {user.plan === 'Free' && (
          <div className="p-4">
            <div className="bg-blue-600 rounded-2xl 
              p-4 text-white">
              <p className="text-sm font-bold mb-1">
                Upgrade to Pro 🚀
              </p>
              <p className="text-xs text-blue-200 mb-3">
                Unlimited invoices + UPI payments
              </p>
              <button className="w-full bg-white 
                text-blue-600 text-xs font-bold 
                py-2 rounded-xl hover:bg-blue-50 
                transition-colors">
                Upgrade ₹299/mo
              </button>
            </div>
          </div>
        )}

        {/* LOGOUT */}
        <div className="p-4 border-t border-slate-100">
          <button className="w-full flex items-center 
            gap-3 px-4 py-3 rounded-xl text-sm 
            font-semibold text-red-500 
            hover:bg-red-50 transition-colors">
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 lg:ml-64 flex flex-col 
        min-h-screen">

        {/* TOP NAVBAR */}
        <header className="sticky top-0 bg-white 
          border-b border-slate-100 z-10">
          <div className="flex items-center 
            justify-between px-6 h-16">

            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-slate-500 
                  hover:text-slate-700">
                <Menu size={22} />
              </button>
              <div>
                <h1 className="text-lg font-black 
                  text-slate-800">
                  Good morning, {user.name}! 👋
                </h1>
                <p className="text-xs text-slate-500">
                  Here's your business overview
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="relative p-2 
                text-slate-500 hover:text-slate-700 
                hover:bg-slate-100 rounded-xl 
                transition-colors">
                <Bell size={20} />
                <span className="absolute top-1.5 
                  right-1.5 w-2 h-2 bg-red-500 
                  rounded-full" />
              </button>
              <button className="flex items-center 
                gap-2 bg-blue-600 text-white text-sm 
                font-bold px-4 py-2 rounded-xl 
                hover:bg-blue-700 transition-all
                shadow-lg shadow-blue-200
                hover:-translate-y-0.5">
                <Plus size={16} />
                New Invoice
              </button>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 p-6">

          {/* STAT CARDS */}
          <div className="grid grid-cols-2 
            lg:grid-cols-4 gap-4 mb-8">
            {[
              {
                label: 'Total Earned',
                value: '₹50,500',
                change: '+12% this month',
                positive: true,
                icon: DollarSign,
                color: 'blue'
              },
              {
                label: 'Pending',
                value: '₹8,500',
                change: '1 invoice pending',
                positive: null,
                icon: Clock,
                color: 'yellow'
              },
              {
                label: 'Total Clients',
                value: '4',
                change: '+1 this month',
                positive: true,
                icon: Users,
                color: 'green'
              },
              {
                label: 'Invoices Sent',
                value: '12',
                change: '3 this week',
                positive: true,
                icon: Send,
                color: 'purple'
              },
            ].map(stat => (
              <div key={stat.label}
                className="bg-white rounded-2xl 
                  border border-slate-100 p-5
                  hover:shadow-md transition-shadow">
                <div className="flex items-center 
                  justify-between mb-3">
                  <span className="text-xs font-semibold 
                    text-slate-500 uppercase 
                    tracking-wide">
                    {stat.label}
                  </span>
                  <div className={`w-8 h-8 rounded-lg
                    bg-${stat.color}-50 flex items-center
                    justify-center`}>
                    <stat.icon size={16}
                      className={`text-${stat.color}-600`}
                    />
                  </div>
                </div>
                <p className="text-2xl font-black 
                  text-slate-800 mb-1">
                  {stat.value}
                </p>
                <p className={`text-xs font-medium
                  ${stat.positive === true 
                    ? 'text-green-600' 
                    : stat.positive === false
                    ? 'text-red-500'
                    : 'text-slate-400'}`}>
                  {stat.change}
                </p>
              </div>
            ))}
          </div>

          {/* RECENT INVOICES */}
          <div className="bg-white rounded-2xl 
            border border-slate-100 overflow-hidden">

            {/* TABLE HEADER */}
            <div className="flex items-center 
              justify-between p-6 border-b 
              border-slate-100">
              <h2 className="text-base font-black 
                text-slate-800">
                Recent Invoices
              </h2>
              <button className="text-sm text-blue-600 
                font-semibold hover:text-blue-700 
                flex items-center gap-1">
                View all
                <ChevronRight size={16} />
              </button>
            </div>

            {/* TABLE */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 
                    border-b border-slate-100">
                    {['Invoice','Client','Amount',
                      'Date','Status','Actions']
                      .map(h => (
                      <th key={h} className="text-left 
                        text-xs font-semibold 
                        text-slate-500 uppercase 
                        tracking-wide px-6 py-3">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y 
                  divide-slate-50">
                  {recentInvoices.map(inv => {
                    const status = statusConfig[inv.status]
                    const StatusIcon = status.icon
                    return (
                      <tr key={inv.id}
                        className="hover:bg-slate-50 
                          transition-colors">
                        <td className="px-6 py-4">
                          <span className="text-sm 
                            font-bold text-blue-600">
                            {inv.id}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm 
                            font-semibold text-slate-800">
                            {inv.client}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm 
                            font-bold text-slate-800">
                            ₹{inv.amount
                              .toLocaleString('en-IN')}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm 
                            text-slate-500">
                            {inv.date}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex 
                            items-center gap-1.5 text-xs 
                            font-semibold px-3 py-1.5 
                            rounded-full ${status.color}`}>
                            <StatusIcon size={12} />
                            {status.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex 
                            items-center gap-2">
                            <button className="p-1.5 
                              text-slate-400 
                              hover:text-blue-600 
                              hover:bg-blue-50 
                              rounded-lg transition-colors">
                              <Eye size={15} />
                            </button>
                            <button className="p-1.5 
                              text-slate-400 
                              hover:text-green-600
                              hover:bg-green-50 
                              rounded-lg transition-colors">
                              <Download size={15} />
                            </button>
                            <button className="p-1.5 
                              text-slate-400 
                              hover:text-purple-600
                              hover:bg-purple-50 
                              rounded-lg transition-colors">
                              <Send size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* FREE PLAN LIMIT */}
            <div className="p-4 bg-amber-50 
              border-t border-amber-100 
              flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle size={16} 
                  className="text-amber-600" />
                <span className="text-sm text-amber-700 
                  font-medium">
                  Free plan: 3/3 invoices used this month
                </span>
              </div>
              <button className="text-sm font-bold 
                text-blue-600 hover:text-blue-700">
                Upgrade →
              </button>
            </div>
          </div>

        </main>
      </div>
    </div>
  )
}