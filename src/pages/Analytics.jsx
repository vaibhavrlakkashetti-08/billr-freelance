import { useState, useEffect, useCallback } from 'react'
import {
  ArrowLeft, TrendingUp, TrendingDown,
  FileText, Users, Calendar,
  Download, ChevronDown,
  ArrowUpRight, ArrowDownRight,
  IndianRupee, RefreshCw, AlertCircle
} from 'lucide-react'
import { supabase } from '../supabase'

/* ─── helpers ─────────────────────────────────── */
const formatINR = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`

const statusStyle = {
  paid:    'bg-green-500/20 text-green-400 border border-green-500/30',
  sent:    'bg-blue-500/20  text-blue-400  border border-blue-500/30',
  pending: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  overdue: 'bg-red-500/20   text-red-400   border border-red-500/30',
  draft:   'bg-slate-600/50 text-slate-400  border border-slate-500/30',
}

const statusBg = {
  paid:    'bg-green-500',
  sent:    'bg-blue-500',
  pending: 'bg-yellow-500',
  overdue: 'bg-red-500',
  draft:   'bg-slate-400',
}

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

/* ─── compute monthly buckets from invoices ───── */
function buildMonthlyData(invoices, months = 6) {
  const now = new Date()
  const buckets = []
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    buckets.push({ month: MONTH_NAMES[d.getMonth()], year: d.getFullYear(), monthIdx: d.getMonth(), earned: 0, invoiceCount: 0, clients: new Set() })
  }
  invoices.forEach(inv => {
    const d = new Date(inv.invoice_date || inv.created_at)
    const b = buckets.find(b => b.month === MONTH_NAMES[d.getMonth()] && b.year === d.getFullYear())
    if (b) {
      b.earned += Number(inv.total || 0)
      b.invoiceCount++
      if (inv.to_name) b.clients.add(inv.to_name)
    }
  })
  return buckets.map(b => ({ ...b, clients: b.clients.size }))
}

/* ─── top clients ─────────────────────────────── */
function buildTopClients(invoices) {
  const map = {}
  invoices.forEach(inv => {
    const name = inv.to_name || 'Unknown'
    if (!map[name]) map[name] = { name, amount: 0, invoices: 0 }
    map[name].amount += Number(inv.total || 0)
    map[name].invoices++
  })
  const arr = Object.values(map).sort((a, b) => b.amount - a.amount).slice(0, 5)
  const total = arr.reduce((s, c) => s + c.amount, 0)
  return arr.map(c => ({ ...c, percent: total > 0 ? Math.round((c.amount / total) * 100) : 0 }))
}

/* ─── status breakdown ────────────────────────── */
function buildStatusBreakdown(invoices) {
  const statuses = ['paid', 'sent', 'pending', 'overdue', 'draft']
  const map = {}
  statuses.forEach(s => { map[s] = { label: s.charAt(0).toUpperCase() + s.slice(1), count: 0, amount: 0 } })
  invoices.forEach(inv => {
    const s = inv.status || 'draft'
    if (map[s]) { map[s].count++; map[s].amount += Number(inv.total || 0) }
  })
  return statuses.map(s => map[s]).filter(s => s.count > 0)
}

/* ─── export to CSV ────────────────────────────── */
function exportCSV(invoices) {
  const headers = ['Invoice #','Date','Client','Amount','Status']
  const rows = invoices.map(inv => [
    inv.invoice_number || '',
    inv.invoice_date || '',
    inv.to_name || '',
    inv.total || 0,
    inv.status || 'draft',
  ])
  const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `billr-invoices-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

/* ─── download text report ─────────────────────── */
function downloadReport(invoices, stats) {
  const now = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
  const paidInvs  = invoices.filter(i => i.status === 'paid')
  const totalGST  = invoices.reduce((s, i) => s + Number((i.cgst_amount || 0)) + Number((i.sgst_amount || 0)), 0)

  const lines = [
    '======================================',
    '        BILLR — INCOME REPORT          ',
    '======================================',
    `Generated: ${now}`,
    '',
    '── SUMMARY ──────────────────────────',
    `Total Invoices   : ${invoices.length}`,
    `Total Earned     : ${formatINR(stats.totalEarned)}`,
    `Paid Invoices    : ${paidInvs.length}  (${formatINR(paidInvs.reduce((s,i)=>s+Number(i.total||0),0))})`,
    `Total GST        : ${formatINR(totalGST)}`,
    `Net Taxable      : ${formatINR(stats.totalEarned - totalGST)}`,
    '',
    '── INVOICE LIST ─────────────────────',
    ...invoices.map(i =>
      `${String(i.invoice_number || '—').padEnd(12)} | ${String(i.to_name || 'Unknown').padEnd(20)} | ${String(i.status || 'draft').padEnd(8)} | ${formatINR(i.total)}`
    ),
    '',
    '======================================',
    'BILLR — Built for Indian Freelancers  ',
    '======================================',
  ]

  const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `billr-report-${new Date().toISOString().split('T')[0]}.txt`
  a.click()
  URL.revokeObjectURL(url)
}

/* ══════════════════════════════════════════════ */
export default function Analytics() {
  const [period, setPeriod] = useState('6 Months')
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState('')

  const monthCount = { 'This Month': 1, '3 Months': 3, '6 Months': 6, 'This Year': 12 }[period] || 6

  /* fetch ─────────────────────────────────────── */
  const fetchData = useCallback(async () => {
    setLoading(true); setError('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    // date filter
    const cutoff = new Date()
    cutoff.setMonth(cutoff.getMonth() - monthCount)

    const { data, error: err } = await supabase
      .from('invoices')
      .select('*')
      .eq('user_id', user.id)
      .gte('invoice_date', cutoff.toISOString().split('T')[0])
      .order('invoice_date', { ascending: false })

    if (err) { setError(err.message); setLoading(false); return }
    setInvoices(data || [])
    setLoading(false)
  }, [monthCount])

  useEffect(() => { fetchData() }, [fetchData])

  /* derived ───────────────────────────────────── */
  const monthly     = buildMonthlyData(invoices, monthCount)
  const topClients  = buildTopClients(invoices)
  const statusBreak = buildStatusBreakdown(invoices)
  const maxEarned   = Math.max(...monthly.map(m => m.earned), 1)

  const totalEarned   = invoices.reduce((s, i) => s + Number(i.total || 0), 0)
  const totalInvoices = invoices.length
  const avgPerMonth   = monthCount > 0 ? Math.round(totalEarned / monthCount) : 0

  const thisM = monthly[monthly.length - 1] || { earned: 0, invoiceCount: 0 }
  const lastM = monthly[monthly.length - 2] || { earned: 0 }
  const growth = lastM.earned > 0
    ? Math.round(((thisM.earned - lastM.earned) / lastM.earned) * 100)
    : thisM.earned > 0 ? 100 : 0
  const growthUp = growth >= 0

  const paidTotal  = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + Number(i.total || 0), 0)
  const collRate   = totalEarned > 0 ? Math.round((paidTotal / totalEarned) * 100) : 0
  const totalGST   = invoices.reduce((s, i) => s + Number(i.cgst_amount || 0) + Number(i.sgst_amount || 0), 0)
  const recentTx   = [...invoices].slice(0, 8)

  const stats = { totalEarned, totalInvoices, avgPerMonth }

  /* ─── loading ────────────────────────────────── */
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  /* ─── render ─────────────────────────────────── */
  return (
    <div className="min-h-screen bg-slate-900">

      {/* HEADER */}
      <header className="sticky top-0 bg-slate-900/95 backdrop-blur border-b border-slate-800 z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

          <div className="flex items-center gap-4">
            <a href="/dashboard"
              className="flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-colors group text-sm font-medium">
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              Dashboard
            </a>
            <div className="h-4 w-px bg-slate-700" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
                <TrendingUp size={14} className="text-white" />
              </div>
              <span className="font-black text-white">Analytics</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Period selector */}
            <div className="relative">
              <select value={period} onChange={e => setPeriod(e.target.value)}
                className="appearance-none bg-slate-800 border-2 border-slate-700 rounded-xl px-4 py-2 pr-8 text-sm font-semibold text-slate-300 focus:outline-none focus:border-blue-400 cursor-pointer">
                {['This Month','3 Months','6 Months','This Year'].map(p => (
                  <option key={p}>{p}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            <button onClick={fetchData}
              className="p-2 text-slate-400 hover:text-blue-400 border border-slate-700 rounded-xl hover:border-blue-500 transition-all">
              <RefreshCw size={15} />
            </button>

            {/* Export CSV */}
            <button onClick={() => exportCSV(invoices)}
              disabled={invoices.length === 0}
              className="flex items-center gap-2 border-2 border-slate-700 text-slate-300 text-sm font-semibold px-4 py-2 rounded-xl hover:border-blue-500 hover:text-blue-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
              <Download size={16} />
              Export CSV
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-center gap-3 bg-red-900/30 border border-red-700/40 text-red-300 rounded-2xl px-5 py-4 text-sm font-medium">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        {/* Empty state */}
        {!loading && invoices.length === 0 && (
          <div className="text-center py-24">
            <FileText size={48} className="mx-auto mb-4 text-slate-600" />
            <h2 className="text-xl font-black text-white mb-2">No invoices yet</h2>
            <p className="text-slate-500 text-sm mb-6">Create and save invoices to see analytics here.</p>
            <a href="/invoice/new"
              className="inline-flex items-center gap-2 bg-blue-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-500 transition-colors text-sm">
              Create Invoice
            </a>
          </div>
        )}

        {invoices.length > 0 && (
          <>
            {/* ── STAT CARDS ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                {
                  label: 'Total Earned',
                  value: formatINR(totalEarned),
                  change: `${growthUp ? '+' : ''}${growth}% vs previous month`,
                  up: growthUp,
                  icon: IndianRupee,
                  color: 'blue',
                },
                {
                  label: 'This Month',
                  value: formatINR(thisM.earned),
                  change: `${formatINR(lastM.earned)} previous`,
                  up: thisM.earned >= lastM.earned,
                  icon: TrendingUp,
                  color: 'green',
                },
                {
                  label: 'Total Invoices',
                  value: totalInvoices,
                  change: `${thisM.invoiceCount} this month`,
                  up: true,
                  icon: FileText,
                  color: 'purple',
                },
                {
                  label: 'Avg / Month',
                  value: formatINR(avgPerMonth),
                  change: `Based on ${monthCount} month${monthCount > 1 ? 's' : ''}`,
                  up: null,
                  icon: Calendar,
                  color: 'orange',
                },
              ].map(stat => (
                <div key={stat.label} className="bg-slate-800 border border-slate-700 rounded-2xl p-5 hover:border-slate-600 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{stat.label}</span>
                    <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center">
                      <stat.icon size={16} className="text-blue-400" />
                    </div>
                  </div>
                  <p className="text-2xl font-black text-white mb-1">{stat.value}</p>
                  <div className="flex items-center gap-1">
                    {stat.up === true  && <ArrowUpRight   size={14} className="text-green-400" />}
                    {stat.up === false && <ArrowDownRight  size={14} className="text-red-400" />}
                    <p className={`text-xs font-medium ${stat.up === true ? 'text-green-400' : stat.up === false ? 'text-red-400' : 'text-slate-500'}`}>
                      {stat.change}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* ── MAIN GRID ── */}
            <div className="grid lg:grid-cols-3 gap-6 mb-6">

              {/* BAR CHART */}
              <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-base font-black text-white">Monthly Income</h2>
                    <p className="text-sm text-slate-500">Last {monthCount} month{monthCount > 1 ? 's' : ''}</p>
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-bold
                    ${growthUp
                      ? 'bg-green-900/30 border-green-700/40 text-green-400'
                      : 'bg-red-900/30 border-red-700/40 text-red-400'}`}>
                    {growthUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    {growthUp ? '+' : ''}{growth}%
                  </div>
                </div>

                <div className="flex items-end gap-3 h-48 px-2">
                  {monthly.map((data, i) => {
                    const height = Math.round((data.earned / maxEarned) * 100)
                    const isLast = i === monthly.length - 1
                    return (
                      <div key={`${data.month}-${i}`} className="flex-1 flex flex-col items-center gap-2 group">
                        <div className="relative w-full flex flex-col items-center">
                          <div className="absolute -top-10 bg-slate-900 border border-slate-700 text-white text-xs font-bold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                            {formatINR(data.earned)}
                          </div>
                          <div
                            className={`w-full rounded-t-xl transition-all duration-700
                              ${isLast ? 'bg-blue-500' : 'bg-slate-600 group-hover:bg-blue-400'}`}
                            style={{ height: `${Math.max(height, 4)}%`, minHeight: '8px' }}
                          />
                        </div>
                        <span className={`text-xs font-bold ${isLast ? 'text-blue-400' : 'text-slate-500'}`}>
                          {data.month}
                        </span>
                      </div>
                    )
                  })}
                </div>

                <div className="flex items-center gap-6 mt-4 pt-4 border-t border-slate-700">
                  {[
                    { color: 'bg-blue-500',   label: 'Current month' },
                    { color: 'bg-slate-600',  label: 'Previous months' },
                  ].map(l => (
                    <div key={l.label} className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-sm ${l.color}`} />
                      <span className="text-xs text-slate-500 font-medium">{l.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* INVOICE STATUS */}
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                <h2 className="text-base font-black text-white mb-6">Invoice Status</h2>
                {statusBreak.length === 0 ? (
                  <p className="text-slate-500 text-sm text-center py-8">No data</p>
                ) : (
                  <>
                    <div className="space-y-4 mb-6">
                      {statusBreak.map(s => {
                        const totalCount = statusBreak.reduce((sum, x) => sum + x.count, 0)
                        const pct = Math.round((s.count / totalCount) * 100)
                        return (
                          <div key={s.label}>
                            <div className="flex justify-between mb-1.5">
                              <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${statusBg[s.label.toLowerCase()] || 'bg-slate-500'}`} />
                                <span className="text-sm font-semibold text-slate-300">{s.label}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-500">{s.count} inv</span>
                                <span className="text-sm font-bold text-white">{formatINR(s.amount)}</span>
                              </div>
                            </div>
                            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${statusBg[s.label.toLowerCase()] || 'bg-slate-500'}`}
                                style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    <div className="bg-slate-700/50 rounded-2xl p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-slate-400 font-medium">Collection Rate</span>
                        <span className="text-sm font-black text-green-400">{collRate}%</span>
                      </div>
                      <div className="h-2 bg-slate-600 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full transition-all duration-700" style={{ width: `${collRate}%` }} />
                      </div>
                      <p className="text-xs text-slate-500 mt-2">
                        {formatINR(paidTotal)} collected of {formatINR(totalEarned)} total
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* ── BOTTOM GRID ── */}
            <div className="grid lg:grid-cols-2 gap-6">

              {/* TOP CLIENTS */}
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                <h2 className="text-base font-black text-white mb-6">Top Clients by Revenue</h2>
                {topClients.length === 0 ? (
                  <p className="text-slate-500 text-sm text-center py-8">No client data</p>
                ) : (
                  <div className="space-y-5">
                    {topClients.map(client => (
                      <div key={client.name}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-sm">
                              {client.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white">{client.name}</p>
                              <p className="text-xs text-slate-500">{client.invoices} invoice{client.invoices !== 1 ? 's' : ''}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-black text-white">{formatINR(client.amount)}</p>
                            <p className="text-xs text-slate-500">{client.percent}%</p>
                          </div>
                        </div>
                        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full transition-all duration-700"
                            style={{ width: `${client.percent}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* RECENT TRANSACTIONS */}
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-base font-black text-white">Recent Transactions</h2>
                  <a href="/invoice/new" className="text-sm text-blue-400 font-semibold hover:text-blue-300">
                    New →
                  </a>
                </div>
                {recentTx.length === 0 ? (
                  <p className="text-slate-500 text-sm text-center py-8">No transactions</p>
                ) : (
                  <div className="space-y-3">
                    {recentTx.map(tx => (
                      <div key={tx.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-xl hover:bg-slate-700 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-blue-600/20 rounded-xl flex items-center justify-center text-blue-400 font-black text-sm border border-blue-500/20">
                            {(tx.to_name || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">{tx.to_name || 'Unknown'}</p>
                            <p className="text-xs text-slate-500">
                              {tx.invoice_number || '—'} • {tx.invoice_date ? new Date(tx.invoice_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-white">{formatINR(tx.total)}</p>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusStyle[tx.status] || statusStyle.draft}`}>
                            {tx.status || 'draft'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ── TAX SUMMARY ── */}
            <div className="mt-6 bg-gradient-to-r from-blue-700 to-blue-800 rounded-2xl p-6 text-white border border-blue-600/30">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-lg font-black mb-1">🧾 ITR Tax Summary</h2>
                  <p className="text-blue-200 text-sm">FY {new Date().getFullYear() - 1}–{String(new Date().getFullYear()).slice(2)} • Based on your invoices</p>
                </div>
                <div className="flex gap-8 flex-wrap">
                  {[
                    { label: 'Gross Income',  value: formatINR(totalEarned) },
                    { label: 'GST Collected', value: formatINR(totalGST) },
                    { label: 'Net Taxable',   value: formatINR(totalEarned - totalGST) },
                  ].map(item => (
                    <div key={item.label} className="text-center">
                      <p className="text-blue-200 text-xs font-medium mb-1">{item.label}</p>
                      <p className="text-white font-black text-lg">{item.value}</p>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => downloadReport(invoices, stats)}
                  className="flex items-center gap-2 bg-white text-blue-700 font-bold px-5 py-2.5 rounded-xl hover:bg-blue-50 transition-colors text-sm shadow-lg">
                  <Download size={16} />
                  Download Report
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}