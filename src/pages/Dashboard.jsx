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
import jsPDF from 'jspdf'

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

const STAT_ICON_BG = {
  blue: 'bg-blue-500/20',
  yellow: 'bg-yellow-500/20',
  green: 'bg-green-500/20',
  purple: 'bg-purple-500/20',
}

const STAT_ICON_TEXT = {
  blue: 'text-blue-400',
  yellow: 'text-yellow-400',
  green: 'text-green-400',
  purple: 'text-purple-400',
}

const ACTION_ICON_BG = {
  blue: 'bg-blue-500/20',
  green: 'bg-green-500/20',
  purple: 'bg-purple-500/20',
}

const ACTION_ICON_TEXT = {
  blue: 'text-blue-400',
  green: 'text-green-400',
  purple: 'text-purple-400',
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

  // Download invoice as PDF
  const downloadInvoicePDF = async (inv) => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()

    // Header
    doc.setFillColor(37, 99, 235)
    doc.rect(0, 0, pageWidth, 40, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    doc.text('BILLR', 20, 25)
    doc.setFontSize(10)
    doc.text('INVOICE', pageWidth - 20, 18, { align: 'right' })
    doc.text(`#${inv.invoice_number || 'Draft'}`, pageWidth - 20, 28, { align: 'right' })
    doc.text(`Status: ${(inv.status || 'draft').toUpperCase()}`, pageWidth - 20, 35, { align: 'right' })

    let y = 55
    doc.setTextColor(30, 41, 59)

    // From & To
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(100, 116, 139)
    doc.text('FROM', 20, y)
    doc.text('BILL TO', 110, y)

    y += 8
    doc.setTextColor(30, 41, 59)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text(inv.from_name || 'Your Name', 20, y)
    doc.text(inv.to_name || inv.client_name || 'Client', 110, y)

    y += 7
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100, 116, 139)
    if (inv.from_email) { doc.text(inv.from_email, 20, y); y += 5 }
    if (inv.from_phone) { doc.text(inv.from_phone, 20, y); y += 5 }
    if (inv.from_address) { doc.text(inv.from_address, 20, y); y += 5 }

    let y2 = y - (inv.from_email ? 5 : 0) - (inv.from_phone ? 5 : 0) - (inv.from_address ? 5 : 0)
    if (inv.to_email) { doc.text(inv.to_email, 110, y2); y2 += 5 }
    if (inv.to_phone) { doc.text(inv.to_phone, 110, y2); y2 += 5 }
    if (inv.to_address) { doc.text(inv.to_address, 110, y2); y2 += 5 }

    y = Math.max(y, y2) + 5

    // Dates
    doc.setFontSize(9)
    doc.setTextColor(100, 116, 139)
    doc.text(`Date: ${inv.invoice_date || '—'}`, 20, y)
    doc.text(`Due: ${inv.due_date || '—'}`, 110, y)
    y += 15

    // Items table
    doc.setFillColor(241, 245, 249)
    doc.rect(15, y - 5, pageWidth - 30, 10, 'F')
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(71, 85, 105)
    doc.text('DESCRIPTION', 20, y + 1)
    doc.text('QTY', 120, y + 1, { align: 'right' })
    doc.text('RATE', 150, y + 1, { align: 'right' })
    doc.text('AMOUNT', pageWidth - 20, y + 1, { align: 'right' })
    y += 12

    const items = Array.isArray(inv.items) ? inv.items : []
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(30, 41, 59)
    doc.setFontSize(9)
    items.forEach(item => {
      doc.text(item.description || 'Service', 20, y)
      doc.text(String(item.quantity || 1), 120, y, { align: 'right' })
      doc.text(formatINR(item.rate || 0), 150, y, { align: 'right' })
      doc.text(formatINR((item.quantity || 1) * (item.rate || 0)), pageWidth - 20, y, { align: 'right' })
      y += 8
    })

    y += 5
    doc.setDrawColor(226, 232, 240)
    doc.line(100, y, pageWidth - 15, y)
    y += 10

    // Totals
    doc.setFontSize(9)
    doc.setTextColor(100, 116, 139)
    doc.text('Subtotal', 130, y)
    doc.setTextColor(30, 41, 59)
    doc.setFont('helvetica', 'bold')
    doc.text(formatINR(inv.subtotal || inv.total || 0), pageWidth - 20, y, { align: 'right' })
    y += 7

    if (inv.cgst_amount > 0) {
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(100, 116, 139)
      doc.text(`CGST (${inv.cgst_rate || 0}%)`, 130, y)
      doc.setTextColor(30, 41, 59)
      doc.text(formatINR(inv.cgst_amount), pageWidth - 20, y, { align: 'right' })
      y += 7
      doc.setTextColor(100, 116, 139)
      doc.text(`SGST (${inv.sgst_rate || 0}%)`, 130, y)
      doc.setTextColor(30, 41, 59)
      doc.text(formatINR(inv.sgst_amount), pageWidth - 20, y, { align: 'right' })
      y += 10
    }

    doc.setDrawColor(37, 99, 235)
    doc.setLineWidth(0.5)
    doc.line(100, y, pageWidth - 15, y)
    y += 10
    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(37, 99, 235)
    doc.text('Total', 130, y)
    doc.text(formatINR(inv.total || 0), pageWidth - 20, y, { align: 'right' })

    y += 20
    // UPI
    if (inv.upi_id) {
      doc.setFillColor(236, 253, 245)
      doc.roundedRect(15, y - 4, pageWidth - 30, 18, 3, 3, 'F')
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(21, 128, 61)
      doc.text('Pay via UPI:', 20, y + 4)
      doc.text(inv.upi_id, 60, y + 4)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7)
      doc.text('GPay · PhonePe · Paytm', 20, y + 11)
      y += 25
    }

    // Notes
    if (inv.notes) {
      doc.setFontSize(8)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(100, 116, 139)
      doc.text('Notes:', 20, y)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(71, 85, 105)
      const noteLines = doc.splitTextToSize(inv.notes, pageWidth - 40)
      doc.text(noteLines, 20, y + 6)
      y += 6 + noteLines.length * 4
    }

    // Footer
    const pageHeight = doc.internal.pageSize.getHeight()
    doc.setFontSize(8)
    doc.setTextColor(148, 163, 184)
    doc.text('Generated with BILLR — billr-app.netlify.app', pageWidth / 2, pageHeight - 10, { align: 'center' })

    doc.save(`${inv.invoice_number || 'Invoice'}.pdf`)
  }

  // Share invoice via WhatsApp
  const shareWhatsApp = (inv) => {
    const text = encodeURIComponent(
      `Invoice ${inv.invoice_number || ''} for ${inv.to_name || inv.client_name || 'Client'}\n` +
      `Amount: ${formatINR(inv.total || 0)}\n` +
      `Status: ${(inv.status || 'draft').toUpperCase()}\n` +
      `Date: ${inv.invoice_date || '—'}\n` +
      (inv.upi_id ? `\nPay via UPI: ${inv.upi_id}` : '') +
      `\n\nSent via BILLR`
    )
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

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
                ${STAT_ICON_BG[stat.color]} flex items-center
                justify-center`}>
                <stat.icon size={16}
                  className={STAT_ICON_TEXT[stat.color]}
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
              ${ACTION_ICON_BG[a.color]} flex items-center
              justify-center group-hover:scale-110
              transition-transform flex-shrink-0`}>
              <a.icon size={18}
                className={ACTION_ICON_TEXT[a.color]}
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
              font-semibold hover:text-blue-300
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
                        transition-colors cursor-pointer"
                      onClick={() => navigate('/invoice/new')}>
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
                          {inv.to_name || inv.client_name
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
                          items-center gap-1"
                          onClick={e => e.stopPropagation()}>
                          <button
                            title="Preview Invoice"
                            onClick={() => navigate('/invoice/new')}
                            className="p-1.5
                            text-slate-400
                            hover:text-blue-400
                            hover:bg-blue-600/10
                            rounded-lg
                            transition-colors">
                            <Eye size={15} />
                          </button>
                          <button
                            title="Download PDF"
                            onClick={() => downloadInvoicePDF(inv)}
                            className="p-1.5
                            text-slate-400
                            hover:text-green-400
                            hover:bg-green-500/10
                            rounded-lg
                            transition-colors">
                            <Download size={15} />
                          </button>
                          <button
                            title="Share on WhatsApp"
                            onClick={() => shareWhatsApp(inv)}
                            className="p-1.5
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