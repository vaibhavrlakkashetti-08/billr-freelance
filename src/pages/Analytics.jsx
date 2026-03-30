import { useState } from 'react'
import {
  ArrowLeft, TrendingUp, TrendingDown,
  DollarSign, FileText, Users,
  Calendar, Download, ChevronDown,
  ArrowUpRight, ArrowDownRight,
  IndianRupee
} from 'lucide-react'

const MONTHLY_DATA = [
  { month: 'Oct', earned: 12000, invoices: 3, clients: 2 },
  { month: 'Nov', earned: 18500, invoices: 4, clients: 3 },
  { month: 'Dec', earned: 9000, invoices: 2, clients: 2 },
  { month: 'Jan', earned: 24000, invoices: 6, clients: 4 },
  { month: 'Feb', earned: 31000, invoices: 7, clients: 5 },
  { month: 'Mar', earned: 50500, invoices: 12, clients: 4 },
]

const TOP_CLIENTS = [
  { name: 'Design Studio', amount: 22000, invoices: 4, percent: 43 },
  { name: 'Acme Corp', amount: 15000, invoices: 3, percent: 30 },
  { name: 'TechStart India', amount: 8500, invoices: 2, percent: 17 },
  { name: 'Startup Hub', amount: 5000, invoices: 1, percent: 10 },
]

const INVOICE_STATUS = [
  { label: 'Paid', count: 8, amount: 45000, color: '#10B981', bg: 'bg-green-500' },
  { label: 'Pending', count: 2, amount: 8500, color: '#F59E0B', bg: 'bg-yellow-500' },
  { label: 'Overdue', count: 1, amount: 22000, color: '#EF4444', bg: 'bg-red-500' },
  { label: 'Draft', count: 1, amount: 5000, color: '#94A3B8', bg: 'bg-slate-400' },
]

const RECENT_TRANSACTIONS = [
  { client: 'Acme Corp', invoice: 'INV-001', amount: 15000, date: 'Mar 5', status: 'paid' },
  { client: 'TechStart India', invoice: 'INV-002', amount: 8500, date: 'Mar 6', status: 'pending' },
  { client: 'Design Studio', invoice: 'INV-003', amount: 22000, date: 'Feb 20', status: 'overdue' },
  { client: 'Startup Hub', invoice: 'INV-004', amount: 5000, date: 'Mar 7', status: 'draft' },
]

const statusStyle = {
  paid: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  overdue: 'bg-red-100 text-red-700',
  draft: 'bg-slate-100 text-slate-600',
}

const maxEarned = Math.max(...MONTHLY_DATA.map(d => d.earned))

export default function Analytics() {
  const [period, setPeriod] = useState('6 Months')

  const totalEarned = MONTHLY_DATA.reduce(
    (s, d) => s + d.earned, 0)
  const totalInvoices = MONTHLY_DATA.reduce(
    (s, d) => s + d.invoices, 0)
  const avgPerMonth = Math.round(
    totalEarned / MONTHLY_DATA.length)

  const thisMonth = MONTHLY_DATA[MONTHLY_DATA.length - 1]
  const lastMonth = MONTHLY_DATA[MONTHLY_DATA.length - 2]
  const growth = Math.round(
    ((thisMonth.earned - lastMonth.earned) /
      lastMonth.earned) * 100)

  const formatINR = (n) =>
    `₹${Number(n).toLocaleString('en-IN')}`

  return (
    <div className="min-h-screen bg-slate-50">

      {/* HEADER */}
      <header className="sticky top-0 bg-white
        border-b border-slate-100 z-10">
        <div className="max-w-7xl mx-auto px-6
          h-16 flex items-center justify-between">

          <div className="flex items-center gap-4">
            <a href="/dashboard"
              className="flex items-center gap-2
                text-slate-500 hover:text-blue-600
                transition-colors group text-sm
                font-medium">
              <ArrowLeft size={18}
                className="group-hover:-translate-x-1
                  transition-transform" />
              Dashboard
            </a>
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-blue-600
                rounded-lg flex items-center
                justify-center">
                <TrendingUp size={14}
                  className="text-white" />
              </div>
              <span className="font-black text-slate-800">
                Analytics
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* PERIOD SELECTOR */}
            <div className="relative">
              <select
                value={period}
                onChange={e => setPeriod(e.target.value)}
                className="appearance-none bg-white
                  border-2 border-slate-200 rounded-xl
                  px-4 py-2 pr-8 text-sm font-semibold
                  text-slate-700 focus:outline-none
                  focus:border-blue-500 cursor-pointer">
                {['This Month', '3 Months',
                  '6 Months', 'This Year'].map(p => (
                  <option key={p}>{p}</option>
                ))}
              </select>
              <ChevronDown size={14}
                className="absolute right-3 top-1/2
                  -translate-y-1/2 text-slate-400
                  pointer-events-none" />
            </div>

            <button className="flex items-center gap-2
              border-2 border-slate-200 text-slate-700
              text-sm font-semibold px-4 py-2
              rounded-xl hover:border-blue-300
              hover:text-blue-600 transition-all">
              <Download size={16} />
              Export
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* TOP STAT CARDS */}
        <div className="grid grid-cols-2
          lg:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: 'Total Earned',
              value: formatINR(totalEarned),
              change: `+${growth}% vs last month`,
              up: true,
              icon: IndianRupee,
              color: 'blue'
            },
            {
              label: 'This Month',
              value: formatINR(thisMonth.earned),
              change: `${formatINR(lastMonth.earned)} last month`,
              up: thisMonth.earned > lastMonth.earned,
              icon: TrendingUp,
              color: 'green'
            },
            {
              label: 'Total Invoices',
              value: totalInvoices,
              change: `${thisMonth.invoices} this month`,
              up: true,
              icon: FileText,
              color: 'purple'
            },
            {
              label: 'Avg Per Month',
              value: formatINR(avgPerMonth),
              change: 'Based on 6 months',
              up: null,
              icon: Calendar,
              color: 'orange'
            },
          ].map(stat => (
            <div key={stat.label}
              className="bg-white rounded-2xl
                border border-slate-100 p-5
                hover:shadow-md transition-shadow">
              <div className="flex items-center
                justify-between mb-3">
                <span className="text-xs font-semibold
                  text-slate-500 uppercase tracking-wide">
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
              <div className="flex items-center gap-1">
                {stat.up === true && (
                  <ArrowUpRight size={14}
                    className="text-green-500" />
                )}
                {stat.up === false && (
                  <ArrowDownRight size={14}
                    className="text-red-500" />
                )}
                <p className={`text-xs font-medium
                  ${stat.up === true
                    ? 'text-green-600'
                    : stat.up === false
                    ? 'text-red-500'
                    : 'text-slate-400'}`}>
                  {stat.change}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* MAIN GRID */}
        <div className="grid lg:grid-cols-3 gap-6 mb-6">

          {/* INCOME CHART */}
          <div className="lg:col-span-2 bg-white
            rounded-2xl border border-slate-100 p-6">
            <div className="flex items-center
              justify-between mb-6">
              <div>
                <h2 className="text-base font-black
                  text-slate-800">
                  Monthly Income
                </h2>
                <p className="text-sm text-slate-500">
                  Last 6 months overview
                </p>
              </div>
              <div className="flex items-center gap-2
                bg-green-50 border border-green-200
                px-3 py-1.5 rounded-full">
                <TrendingUp size={14}
                  className="text-green-600" />
                <span className="text-sm font-bold
                  text-green-700">
                  +{growth}% growth
                </span>
              </div>
            </div>

            {/* BAR CHART */}
            <div className="flex items-end gap-3
  h-56 px-2">
              {MONTHLY_DATA.map((data, i) => {
                const height = Math.round(
                  (data.earned / maxEarned) * 100)
                const isLast =
                  i === MONTHLY_DATA.length - 1
                return (
                  <div key={data.month}
                    className="flex-1 flex flex-col
                      items-center gap-2 group">
                    <div className="relative w-full
                      flex flex-col items-center">
                      {/* TOOLTIP */}
                      <div className="absolute -top-10
                        bg-slate-800 text-white text-xs
                        font-bold px-2 py-1 rounded-lg
                        opacity-0 group-hover:opacity-100
                        transition-opacity whitespace-nowrap
                        pointer-events-none">
                        {formatINR(data.earned)}
                      </div>
                      {/* BAR */}
                      <div
                        className={`w-full rounded-t-xl
                          transition-all duration-500
                          ${isLast
                            ? 'bg-blue-600'
                            : 'bg-blue-200 group-hover:bg-blue-400'
                          }`}
                          style={{ height: `${height}%`,
                          minHeight: '20px' }}
                      />
                    </div>
                    <span className={`text-xs font-bold
                      ${isLast
                        ? 'text-blue-600'
                        : 'text-slate-500'}`}>
                      {data.month}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* CHART LEGEND */}
            <div className="flex items-center gap-6
              mt-4 pt-4 border-t border-slate-100">
              {[
                { color: 'bg-blue-600', label: 'Current month' },
                { color: 'bg-blue-200', label: 'Previous months' },
              ].map(l => (
                <div key={l.label}
                  className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-sm
                    ${l.color}`} />
                  <span className="text-xs text-slate-500
                    font-medium">
                    {l.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* INVOICE STATUS */}
          <div className="bg-white rounded-2xl
            border border-slate-100 p-6">
            <h2 className="text-base font-black
              text-slate-800 mb-6">
              Invoice Status
            </h2>

            {/* DONUT VISUAL */}
            <div className="space-y-4 mb-6">
              {INVOICE_STATUS.map(s => {
                const total = INVOICE_STATUS.reduce(
                  (sum, i) => sum + i.count, 0)
                const pct = Math.round(
                  (s.count / total) * 100)
                return (
                  <div key={s.label}>
                    <div className="flex justify-between
                      mb-1.5">
                      <div className="flex items-center
                        gap-2">
                        <div className={`w-3 h-3
                          rounded-full ${s.bg}`} />
                        <span className="text-sm
                          font-semibold text-slate-700">
                          {s.label}
                        </span>
                      </div>
                      <div className="flex items-center
                        gap-2">
                        <span className="text-xs
                          text-slate-500">
                          {s.count} inv
                        </span>
                        <span className="text-sm
                          font-bold text-slate-800">
                          {formatINR(s.amount)}
                        </span>
                      </div>
                    </div>
                    <div className="h-2 bg-slate-100
                      rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full
                          ${s.bg}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            {/* SUMMARY */}
            <div className="bg-slate-50 rounded-2xl p-4">
              <div className="flex justify-between
                items-center mb-2">
                <span className="text-sm text-slate-500
                  font-medium">
                  Collection Rate
                </span>
                <span className="text-sm font-black
                  text-green-600">
                  56%
                </span>
              </div>
              <div className="h-2 bg-slate-200
                rounded-full overflow-hidden">
                <div className="h-full w-[56%]
                  bg-green-500 rounded-full" />
              </div>
              <p className="text-xs text-slate-500
                mt-2">
                ₹45,000 collected of ₹80,500 total
              </p>
            </div>
          </div>
        </div>

        {/* BOTTOM GRID */}
        <div className="grid lg:grid-cols-2 gap-6">

          {/* TOP CLIENTS */}
          <div className="bg-white rounded-2xl
            border border-slate-100 p-6">
            <h2 className="text-base font-black
              text-slate-800 mb-6">
              Top Clients by Revenue
            </h2>
            <div className="space-y-4">
              {TOP_CLIENTS.map((client, i) => (
                <div key={client.name}>
                  <div className="flex items-center
                    justify-between mb-2">
                    <div className="flex items-center
                      gap-3">
                      <div className="w-8 h-8
                        bg-blue-600 rounded-xl
                        flex items-center justify-center
                        text-white font-black text-sm">
                        {client.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold
                          text-slate-800">
                          {client.name}
                        </p>
                        <p className="text-xs
                          text-slate-500">
                          {client.invoices} invoices
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black
                        text-slate-800">
                        {formatINR(client.amount)}
                      </p>
                      <p className="text-xs
                        text-slate-500">
                        {client.percent}%
                      </p>
                    </div>
                  </div>
                  <div className="h-1.5 bg-slate-100
                    rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600
                        rounded-full"
                      style={{
                        width: `${client.percent}%`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RECENT TRANSACTIONS */}
          <div className="bg-white rounded-2xl
            border border-slate-100 p-6">
            <div className="flex items-center
              justify-between mb-6">
              <h2 className="text-base font-black
                text-slate-800">
                Recent Transactions
              </h2>
              <a href="/dashboard"
                className="text-sm text-blue-600
                  font-semibold hover:text-blue-700">
                View all →
              </a>
            </div>
            <div className="space-y-3">
              {RECENT_TRANSACTIONS.map(tx => (
                <div key={tx.invoice}
                  className="flex items-center
                    justify-between p-3 bg-slate-50
                    rounded-xl hover:bg-slate-100
                    transition-colors">
                  <div className="flex items-center
                    gap-3">
                    <div className="w-9 h-9 bg-blue-100
                      rounded-xl flex items-center
                      justify-center text-blue-700
                      font-black text-sm">
                      {tx.client.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold
                        text-slate-800">
                        {tx.client}
                      </p>
                      <p className="text-xs
                        text-slate-500">
                        {tx.invoice} • {tx.date}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black
                      text-slate-800">
                      {formatINR(tx.amount)}
                    </p>
                    <span className={`text-xs font-bold
                      px-2 py-0.5 rounded-full
                      ${statusStyle[tx.status]}`}>
                      {tx.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* TAX SUMMARY */}
        <div className="mt-6 bg-gradient-to-r
          from-blue-600 to-blue-700 rounded-2xl p-6
          text-white">
          <div className="flex items-center
            justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-lg font-black mb-1">
                🧾 ITR Tax Summary
              </h2>
              <p className="text-blue-200 text-sm">
                FY 2025-26 • Ready for filing
              </p>
            </div>
            <div className="flex gap-8">
              {[
                { label: 'Gross Income', value: formatINR(totalEarned) },
                { label: 'GST Collected', value: '₹9,090' },
                { label: 'Net Taxable', value: formatINR(totalEarned - 9090) },
              ].map(item => (
                <div key={item.label}
                  className="text-center">
                  <p className="text-blue-200 text-xs
                    font-medium mb-1">
                    {item.label}
                  </p>
                  <p className="text-white font-black
                    text-lg">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
            <button className="flex items-center gap-2
              bg-white text-blue-600 font-bold
              px-5 py-2.5 rounded-xl
              hover:bg-blue-50 transition-colors
              text-sm">
              <Download size={16} />
              Download Report
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}