import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import {
  FileText, Users, DollarSign,
  Clock, Send, Plus,
  CheckCircle, AlertCircle,
  ChevronRight, Eye, Download,
  TrendingUp
} from 'lucide-react'

const statusConfig = {
  paid: {
    label: 'Paid',
    color: 'bg-green-500/20 text-green-400 border border-green-500/30',
    icon: CheckCircle
  },
  pending: {
    label: 'Pending',
    color: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
    icon: Clock
  },
  overdue: {
    label: 'Overdue',
    color: 'bg-red-500/20 text-red-400 border border-red-500/30',
    icon: AlertCircle
  },
  draft: {
    label: 'Draft',
    color: 'bg-slate-600/50 text-slate-400 border border-slate-500/30',
    icon: FileText
  },
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [invoices, setInvoices] = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)

  async function loadData() {
    setLoading(true)
    const { data: { user } } =
      await supabase.auth.getUser()
    setUser(user)

    const [invRes, cliRes] = await Promise.all([
      supabase
        .from('invoices')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
    ])

    if (invRes.data) setInvoices(invRes.data)
    if (cliRes.data) setClients(cliRes.data)
    setLoading(false)
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData()
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  const totalEarned = invoices
    .filter(i => i.status === 'paid')
    .reduce((s, i) => s + (i.total || 0), 0)

  const totalPending = invoices
    .filter(i => i.status === 'pending')
    .reduce((s, i) => s + (i.total || 0), 0)

  const formatINR = (n) =>
    `₹${Number(n).toLocaleString('en-IN')}`

  const name = user?.user_metadata?.full_name
    || user?.email?.split('@')[0]
    || 'there'

  if (loading) {
    return (
      <div className="flex items-center
        justify-center h-64">
        <div className="w-10 h-10 border-4
          border-blue-600 border-t-transparent
          rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>

      {/* WELCOME */}
      <div className="mb-8">
        <h1 className="text-2xl font-black
          text-white">
          Welcome back, {name}! 👋
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Here's your business overview
        </p>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-2
        lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: 'Total Earned',
            value: formatINR(totalEarned),
            sub: `${invoices.filter(
              i => i.status === 'paid').length
            } paid invoices`,
            icon: DollarSign,
            color: 'blue'
          },
          {
            label: 'Pending',
            value: formatINR(totalPending),
            sub: `${invoices.filter(
              i => i.status === 'pending').length
            } unpaid invoices`,
            icon: Clock,
            color: 'yellow'
          },
          {
            label: 'Total Clients',
            value: clients.length,
            sub: 'clients added',
            icon: Users,
            color: 'green'
          },
          {
            label: 'Total Invoices',
            value: invoices.length,
            sub: 'invoices created',
            icon: FileText,
            color: 'purple'
          },
        ].map(stat => (
          <div key={stat.label}
            className="bg-slate-800 rounded-2xl
              border border-slate-700 p-5
              hover:shadow-md transition-shadow">
            <div className="flex items-center
              justify-between mb-3">
              <span className="text-xs font-semibold
                text-slate-400 uppercase tracking-wide">
                {stat.label}
              </span>
              <div className={`w-8 h-8 rounded-lg
                bg-${stat.color}-500/20 flex items-center
                justify-center`}>
                <stat.icon size={16}
                  className={`text-${stat.color}-400`}
                />
              </div>
            </div>
            <p className="text-2xl font-black
              text-white mb-1">
              {stat.value}
            </p>
            <p className="text-xs font-medium
              text-slate-500">
              {stat.sub}
            </p>
          </div>
        ))}
      </div>

      {/* QUICK ACTIONS */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          {
            label: 'New Invoice',
            icon: FileText,
            color: 'blue',
            path: '/invoice/new'
          },
          {
            label: 'Add Client',
            icon: Users,
            color: 'green',
            path: '/clients'
          },
          {
            label: 'Analytics',
            icon: TrendingUp,
            color: 'purple',
            path: '/analytics'
          },
        ].map(a => (
          <button
            key={a.label}
            onClick={() => navigate(a.path)}
            className="bg-slate-800 rounded-2xl
              border border-slate-700 p-4
              flex items-center gap-3
              hover:shadow-md hover:border-blue-500/50
              transition-all group text-left">
            <div className={`w-10 h-10 rounded-xl
              bg-${a.color}-500/20 flex items-center
              justify-center group-hover:scale-110
              transition-transform flex-shrink-0`}>
              <a.icon size={18}
                className={`text-${a.color}-400`}
              />
            </div>
            <span className="text-sm font-bold
              text-slate-300">
              {a.label}
            </span>
          </button>
        ))}
      </div>

      {/* RECENT INVOICES */}
      <div className="bg-slate-800 rounded-2xl
        border border-slate-700 overflow-hidden">

        <div className="flex items-center
          justify-between p-6 border-b
          border-slate-700">
          <h2 className="text-base font-black
            text-white">
            Recent Invoices
          </h2>
          <button
            onClick={() => navigate('/invoice/new')}
            className="text-sm text-blue-400
              font-semibold hover:text-blue-400
              flex items-center gap-1">
            Create new
            <ChevronRight size={16} />
          </button>
        </div>

        {invoices.length === 0 ? (
          <div className="text-center py-16">
            <FileText size={48}
              className="text-slate-600
                mx-auto mb-4" />
            <h3 className="text-slate-400
              font-bold mb-2">
              No invoices yet
            </h3>
            <p className="text-slate-500
              text-sm mb-6">
              Create your first invoice
              to get started!
            </p>
            <button
              onClick={() =>
                navigate('/invoice/new')}
              className="bg-blue-600 text-white
                font-bold px-6 py-3 rounded-xl
                hover:bg-blue-500 transition-colors
                flex items-center gap-2 mx-auto">
              <Plus size={16} />
              Create Invoice
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-700/50
                  border-b border-slate-700">
                  {['Invoice', 'Client', 'Amount',
                    'Date', 'Status', 'Actions']
                    .map(h => (
                    <th key={h}
                      className="text-left text-xs
                        font-semibold text-slate-400
                        uppercase tracking-wide
                        px-6 py-3">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y
                divide-slate-700">
                {invoices.map(inv => {
                  const s = statusConfig[
                    inv.status] ||
                    statusConfig.draft
                  const Icon = s.icon
                  return (
                    <tr key={inv.id}
                      className="hover:bg-slate-700/50
                        transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-sm
                          font-bold text-blue-400">
                          {inv.invoice_number
                            || 'Draft'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm
                          font-semibold
                          text-white">
                          {inv.client_name
                            || 'No client'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm
                          font-bold text-white">
                          {formatINR(inv.total || 0)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm
                          text-slate-400">
                          {inv.invoice_date
                            ? new Date(inv.invoice_date)
                              .toLocaleDateString('en-IN')
                            : '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex
                          items-center gap-1.5 text-xs
                          font-semibold px-3 py-1.5
                          rounded-full ${s.color}`}>
                          <Icon size={12} />
                          {s.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex
                          items-center gap-1">
                          <button className="p-1.5
                            text-slate-400
                            hover:text-blue-400
                            hover:bg-blue-600/10
                            rounded-lg
                            transition-colors">
                            <Eye size={15} />
                          </button>
                          <button className="p-1.5
                            text-slate-400
                            hover:text-green-400
                            hover:bg-green-500/10
                            rounded-lg
                            transition-colors">
                            <Download size={15} />
                          </button>
                          <button className="p-1.5
                            text-slate-400
                            hover:text-purple-400
                            hover:bg-purple-500/10
                            rounded-lg
                            transition-colors">
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
        )}
      </div>
    </div>
  )
}