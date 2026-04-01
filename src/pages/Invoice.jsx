import { useState, useEffect, useCallback } from 'react'
import {
  ArrowLeft, Plus, Trash2,
  Download, Send, Eye,
  FileText, Building2, User,
  Calendar, Hash, IndianRupee,
  Save, List, X, ChevronRight,
  CheckCircle2, Clock, AlertCircle,
  PenLine, RefreshCw
} from 'lucide-react'
import { supabase } from '../supabase'

const TAX_RATES = [
  { label: 'No GST (0%)', cgst: 0, sgst: 0 },
  { label: 'GST 5%', cgst: 2.5, sgst: 2.5 },
  { label: 'GST 12%', cgst: 6, sgst: 6 },
  { label: 'GST 18%', cgst: 9, sgst: 9 },
  { label: 'GST 28%', cgst: 14, sgst: 14 },
]

const EMPTY_ITEM = { id: Date.now(), description: '', quantity: 1, rate: 0 }

const BLANK_FORM = {
  invoiceNumber: '',
  invoiceDate: new Date().toISOString().split('T')[0],
  dueDate: '',
  notes: '',
  upiId: '',
  fromName: '',
  fromEmail: '',
  fromPhone: '',
  fromAddress: '',
  fromGST: '',
  toName: '',
  toEmail: '',
  toPhone: '',
  toAddress: '',
  toGST: '',
  status: 'draft',
}

const STATUS_CONFIG = {
  draft:  { label: 'Draft',  icon: PenLine,      color: 'text-slate-400', bg: 'bg-slate-700 text-slate-300'  },
  sent:   { label: 'Sent',   icon: Send,          color: 'text-blue-400',  bg: 'bg-blue-900/50 text-blue-300' },
  paid:   { label: 'Paid',   icon: CheckCircle2,  color: 'text-green-400', bg: 'bg-green-900/50 text-green-300'},
  overdue:{ label: 'Overdue',icon: AlertCircle,   color: 'text-red-400',   bg: 'bg-red-900/50 text-red-300'   },
}

const formatINR = (num) =>
  `₹${Number(num).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`

const formatDate = (d) => {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function Invoice() {
  const [activeTab, setActiveTab]   = useState('edit')
  const [taxRate, setTaxRate]       = useState(TAX_RATES[0])
  const [items, setItems]           = useState([{ ...EMPTY_ITEM }])
  const [form, setForm]             = useState({ ...BLANK_FORM })
  const [currentId, setCurrentId]   = useState(null)   // id of invoice being edited

  // List state
  const [invoices, setInvoices]     = useState([])
  const [listLoading, setListLoading] = useState(true)
  const [showList, setShowList]     = useState(true)

  // Save state
  const [saving, setSaving]         = useState(false)
  const [saveMsg, setSaveMsg]       = useState('')

  // CALCULATIONS
  const subtotal    = items.reduce((s, i) => s + i.quantity * i.rate, 0)
  const cgstAmount  = (subtotal * taxRate.cgst) / 100
  const sgstAmount  = (subtotal * taxRate.sgst) / 100
  const total       = subtotal + cgstAmount + sgstAmount

  const updateForm = (key, value) => setForm(p => ({ ...p, [key]: value }))
  const addItem    = () => setItems(p => [...p, { ...EMPTY_ITEM, id: Date.now() }])
  const removeItem = (id) => setItems(p => p.filter(i => i.id !== id))
  const updateItem = (id, key, value) =>
    setItems(p => p.map(i => i.id === id ? { ...i, [key]: value } : i))

  // ── FETCH invoices from Supabase ──────────────────────────────────────────
  const fetchInvoices = useCallback(async () => {
    setListLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setListLoading(false); return }

    const { data, error } = await supabase
      .from('invoices')
      .select('id, invoice_number, to_name, total, status, invoice_date, due_date, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (!error) setInvoices(data || [])
    setListLoading(false)
  }, [])

  useEffect(() => { fetchInvoices() }, [fetchInvoices])

  // ── LOAD invoice into editor ──────────────────────────────────────────────
  const loadInvoice = async (inv) => {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', inv.id)
      .single()

    if (error || !data) return

    setCurrentId(data.id)
    setForm({
      invoiceNumber : data.invoice_number || '',
      invoiceDate   : data.invoice_date   || '',
      dueDate       : data.due_date       || '',
      notes         : data.notes          || '',
      upiId         : data.upi_id         || '',
      fromName      : data.from_name      || '',
      fromEmail     : data.from_email     || '',
      fromPhone     : data.from_phone     || '',
      fromAddress   : data.from_address   || '',
      fromGST       : data.from_gst       || '',
      toName        : data.to_name        || '',
      toEmail       : data.to_email       || '',
      toPhone       : data.to_phone       || '',
      toAddress     : data.to_address     || '',
      toGST         : data.to_gst         || '',
      status        : data.status         || 'draft',
    })

    // restore tax rate
    const savedTax = TAX_RATES.find(r => r.cgst === (data.cgst_rate || 0)) || TAX_RATES[0]
    setTaxRate(savedTax)

    // restore items
    const savedItems = Array.isArray(data.items) ? data.items : []
    setItems(savedItems.length ? savedItems : [{ ...EMPTY_ITEM, id: Date.now() }])

    setActiveTab('edit')
    if (window.innerWidth < 1024) setShowList(false)
  }

  // ── NEW invoice ───────────────────────────────────────────────────────────
  const newInvoice = () => {
    setCurrentId(null)
    setForm({ ...BLANK_FORM, invoiceDate: new Date().toISOString().split('T')[0] })
    setItems([{ ...EMPTY_ITEM, id: Date.now() }])
    setTaxRate(TAX_RATES[0])
    setActiveTab('edit')
    if (window.innerWidth < 1024) setShowList(false)
  }

  // ── SAVE invoice ──────────────────────────────────────────────────────────
  const saveInvoice = async () => {
    if (!form.fromName.trim() || !form.toName.trim()) {
      setSaveMsg('⚠️ Fill in your name and client name first.')
      setTimeout(() => setSaveMsg(''), 3000)
      return
    }

    setSaving(true)
    setSaveMsg('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }

    const payload = {
      user_id        : user.id,
      invoice_number : form.invoiceNumber,
      invoice_date   : form.invoiceDate   || null,
      due_date       : form.dueDate       || null,
      notes          : form.notes,
      upi_id         : form.upiId,
      from_name      : form.fromName,
      from_email     : form.fromEmail,
      from_phone     : form.fromPhone,
      from_address   : form.fromAddress,
      from_gst       : form.fromGST,
      to_name        : form.toName,
      to_email       : form.toEmail,
      to_phone       : form.toPhone,
      to_address     : form.toAddress,
      to_gst         : form.toGST,
      status         : form.status,
      cgst_rate      : taxRate.cgst,
      sgst_rate      : taxRate.sgst,
      subtotal       : subtotal,
      cgst_amount    : cgstAmount,
      sgst_amount    : sgstAmount,
      total          : total,
      items          : items,
      updated_at     : new Date().toISOString(),
    }

    let error, data
    if (currentId) {
      ;({ error, data } = await supabase
        .from('invoices')
        .update(payload)
        .eq('id', currentId)
        .select('id')
        .single())
    } else {
      ;({ error, data } = await supabase
        .from('invoices')
        .insert({ ...payload, created_at: new Date().toISOString() })
        .select('id')
        .single())
      if (!error && data) setCurrentId(data.id)
    }

    if (error) {
      setSaveMsg('❌ ' + (error.message || 'Save failed.'))
    } else {
      setSaveMsg('✅ Saved!')
      fetchInvoices()
    }
    setSaving(false)
    setTimeout(() => setSaveMsg(''), 3000)
  }

  // ── DELETE invoice ────────────────────────────────────────────────────────
  const deleteInvoice = async (e, id) => {
    e.stopPropagation()
    if (!window.confirm('Delete this invoice?')) return
    await supabase.from('invoices').delete().eq('id', id)
    if (currentId === id) newInvoice()
    fetchInvoices()
  }

  // ── UPDATE status ─────────────────────────────────────────────────────────
  const updateStatus = async (status) => {
    updateForm('status', status)
    if (!currentId) return
    await supabase.from('invoices').update({ status }).eq('id', currentId)
    fetchInvoices()
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">

      {/* ── TOP BAR ── */}
      <header className="sticky top-0 bg-slate-900 border-b border-slate-800 z-10 flex-shrink-0">
        <div className="max-w-[1400px] mx-auto px-4 h-16 flex items-center justify-between gap-4">

          <div className="flex items-center gap-3 min-w-0">
            <a href="/dashboard"
              className="flex items-center gap-1.5 text-slate-400 hover:text-blue-400 transition-colors group flex-shrink-0">
              <ArrowLeft size={17} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium hidden sm:inline">Dashboard</span>
            </a>
            <div className="h-4 w-px bg-slate-700 flex-shrink-0" />
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText size={14} className="text-white" />
              </div>
              <span className="font-black text-white text-sm truncate">
                {currentId ? (form.invoiceNumber || 'Invoice') : 'New Invoice'}
              </span>
            </div>
          </div>

          {/* TABS */}
          <div className="flex bg-slate-800 rounded-xl p-1 gap-1 flex-shrink-0">
            {['edit', 'preview'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all
                  ${activeTab === tab ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}>
                {tab === 'edit' ? '✏️ Edit' : '👁️ Preview'}
              </button>
            ))}
          </div>

          {/* ACTIONS */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {saveMsg && (
              <span className="text-xs font-medium text-slate-300 hidden sm:inline animate-pulse">
                {saveMsg}
              </span>
            )}
            <button onClick={saveInvoice} disabled={saving}
              className="flex items-center gap-1.5 bg-green-600 text-white text-sm font-bold px-3 py-2 rounded-xl hover:bg-green-500 transition-all shadow-lg shadow-green-500/20 disabled:opacity-60">
              {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
              <span className="hidden sm:inline">{saving ? 'Saving…' : 'Save'}</span>
            </button>
            <button onClick={newInvoice}
              className="flex items-center gap-1.5 bg-blue-600 text-white text-sm font-bold px-3 py-2 rounded-xl hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20">
              <Plus size={14} />
              <span className="hidden sm:inline">New</span>
            </button>
            <button onClick={() => setShowList(v => !v)}
              className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-2 rounded-xl transition-all
                ${showList ? 'bg-slate-700 text-white' : 'border border-slate-700 text-slate-400 hover:text-white'}`}>
              <List size={14} />
              <span className="hidden sm:inline">Invoices</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 max-w-[1400px] mx-auto w-full px-4 py-6 gap-6 overflow-hidden">

        {/* ══════════════════════════════════════════════════════════
            LEFT — SAVED INVOICES LIST
        ══════════════════════════════════════════════════════════ */}
        {showList && (
          <aside className="w-72 flex-shrink-0 flex flex-col gap-3">

            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black text-white flex items-center gap-2">
                <List size={15} className="text-blue-400" />
                My Invoices
                <span className="text-xs font-semibold text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
                  {invoices.length}
                </span>
              </h2>
              <button onClick={fetchInvoices}
                className="p-1.5 text-slate-500 hover:text-blue-400 rounded-lg hover:bg-slate-800 transition-colors">
                <RefreshCw size={13} className={listLoading ? 'animate-spin' : ''} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1" style={{ maxHeight: 'calc(100vh - 130px)' }}>
              {listLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : invoices.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <FileText size={36} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-semibold">No invoices yet</p>
                  <p className="text-xs mt-1">Create your first invoice →</p>
                </div>
              ) : (
                invoices.map(inv => {
                  const sc = STATUS_CONFIG[inv.status] || STATUS_CONFIG.draft
                  const isActive = inv.id === currentId
                  return (
                    <div key={inv.id} onClick={() => loadInvoice(inv)}
                      className={`group relative rounded-2xl border p-4 cursor-pointer transition-all
                        ${isActive
                          ? 'bg-blue-600/15 border-blue-500/50 ring-1 ring-blue-500/30'
                          : 'bg-slate-800 border-slate-700 hover:border-slate-600 hover:bg-slate-750'}`}>

                      {/* Status pill */}
                      <div className="flex items-center justify-between mb-2">
                        <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${sc.bg}`}>
                          <sc.icon size={10} />
                          {sc.label}
                        </span>
                        <span className="text-xs text-slate-500 font-mono">{inv.invoice_number || '—'}</span>
                      </div>

                      {/* Client */}
                      <p className="text-sm font-bold text-white truncate mb-1">
                        {inv.to_name || 'No client'}
                      </p>

                      {/* Date + Amount */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">{formatDate(inv.invoice_date)}</span>
                        <span className="text-sm font-black text-blue-400">{formatINR(inv.total || 0)}</span>
                      </div>

                      {/* Delete */}
                      <button onClick={(e) => deleteInvoice(e, inv.id)}
                        className="absolute top-2 right-2 p-1 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-red-500/10">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )
                })
              )}
            </div>
          </aside>
        )}

        {/* ══════════════════════════════════════════════════════════
            RIGHT — EDITOR / PREVIEW
        ══════════════════════════════════════════════════════════ */}
        <div className="flex-1 min-w-0 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 90px)' }}>

          {/* Save message (mobile) */}
          {saveMsg && (
            <div className="sm:hidden mb-4 text-sm font-medium text-slate-300 text-center animate-pulse">{saveMsg}</div>
          )}

          {activeTab === 'edit' ? (

            /* ═══ EDIT MODE ═══ */
            <div className="grid lg:grid-cols-3 gap-6">

              {/* LEFT — FORM */}
              <div className="lg:col-span-2 space-y-6">

                {/* STATUS ROW */}
                <div className="bg-slate-800 rounded-2xl border border-slate-700 p-4 flex items-center gap-3 flex-wrap">
                  <span className="text-xs font-bold text-slate-400">STATUS:</span>
                  {Object.entries(STATUS_CONFIG).map(([key, sc]) => (
                    <button key={key} onClick={() => updateStatus(key)}
                      className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-all
                        ${form.status === key ? sc.bg + ' ring-1 ring-white/20' : 'bg-slate-700 text-slate-400 hover:text-white'}`}>
                      <sc.icon size={11} />
                      {sc.label}
                    </button>
                  ))}
                </div>

                {/* INVOICE DETAILS */}
                <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
                  <h2 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                    <Hash size={16} className="text-blue-500" />
                    Invoice Details
                  </h2>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { key: 'invoiceNumber', label: 'Invoice Number', placeholder: 'INV-001' },
                      { key: 'invoiceDate',   label: 'Invoice Date',   type: 'date' },
                      { key: 'dueDate',       label: 'Due Date',       type: 'date' },
                    ].map(f => (
                      <div key={f.key}>
                        <label className="text-xs font-semibold text-slate-400 mb-1.5 block">{f.label}</label>
                        <input type={f.type || 'text'} value={form[f.key]} placeholder={f.placeholder || ''}
                          onChange={e => updateForm(f.key, e.target.value)}
                          className="w-full border-2 bg-slate-700 border-slate-600 rounded-xl px-3 py-2.5 text-sm font-semibold text-white focus:outline-none focus:border-blue-500 transition-colors" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* FROM & TO */}
                <div className="grid md:grid-cols-2 gap-6">
                  {[
                    { title: 'From (You)', icon: Building2, fields: [
                        { key: 'fromName',    label: 'Name',    placeholder: 'Your Name' },
                        { key: 'fromEmail',   label: 'Email',   placeholder: 'your@email.com' },
                        { key: 'fromPhone',   label: 'Phone',   placeholder: '+91 98765 43210' },
                        { key: 'fromAddress', label: 'Address', placeholder: 'City, State' },
                        { key: 'fromGST',     label: 'GSTIN',   placeholder: 'optional' },
                      ]},
                    { title: 'Bill To (Client)', icon: User, fields: [
                        { key: 'toName',    label: 'Name',    placeholder: 'Client Name' },
                        { key: 'toEmail',   label: 'Email',   placeholder: 'client@email.com' },
                        { key: 'toPhone',   label: 'Phone',   placeholder: '+91 98765 43210' },
                        { key: 'toAddress', label: 'Address', placeholder: 'City, State' },
                        { key: 'toGST',     label: 'GSTIN',   placeholder: 'optional' },
                      ]},
                  ].map(section => (
                    <div key={section.title} className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
                      <h2 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                        <section.icon size={16} className="text-blue-500" />
                        {section.title}
                      </h2>
                      <div className="space-y-3">
                        {section.fields.map(field => (
                          <div key={field.key}>
                            <label className="text-xs font-semibold text-slate-500 mb-1 block">{field.label}</label>
                            <input value={form[field.key]} onChange={e => updateForm(field.key, e.target.value)}
                              placeholder={field.placeholder}
                              className="w-full border-2 bg-slate-700 border-slate-600 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* LINE ITEMS */}
                <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
                  <h2 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                    <IndianRupee size={16} className="text-blue-500" />
                    Services / Items
                  </h2>
                  <div className="grid grid-cols-12 gap-3 mb-3 px-1">
                    {[['Description',6],['Qty',2],['Rate (₹)',2],['Amount',2]].map(([h, span]) => (
                      <div key={h} className={`col-span-${span} text-xs font-semibold text-slate-500 uppercase tracking-wide ${h==='Amount' ? 'text-right' : ''}`}>{h}</div>
                    ))}
                  </div>
                  <div className="space-y-3">
                    {items.map(item => (
                      <div key={item.id} className="grid grid-cols-12 gap-3 items-center">
                        <div className="col-span-6">
                          <input value={item.description} onChange={e => updateItem(item.id, 'description', e.target.value)}
                            placeholder="Service description…"
                            className="w-full border-2 bg-slate-700 border-slate-600 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors" />
                        </div>
                        <div className="col-span-2">
                          <input type="number" value={item.quantity} min="1"
                            onChange={e => updateItem(item.id, 'quantity', Number(e.target.value))}
                            className="w-full border-2 bg-slate-700 border-slate-600 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors" />
                        </div>
                        <div className="col-span-2">
                          <input type="number" value={item.rate} min="0"
                            onChange={e => updateItem(item.id, 'rate', Number(e.target.value))}
                            className="w-full border-2 bg-slate-700 border-slate-600 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors" />
                        </div>
                        <div className="col-span-1 text-right">
                          <span className="text-sm font-bold text-white">{formatINR(item.quantity * item.rate)}</span>
                        </div>
                        <div className="col-span-1 flex justify-center">
                          {items.length > 1 && (
                            <button onClick={() => removeItem(item.id)}
                              className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <button onClick={addItem}
                    className="mt-4 flex items-center gap-2 text-blue-400 text-sm font-semibold hover:text-blue-300 transition-colors">
                    <Plus size={16} /> Add Item
                  </button>
                </div>

                {/* NOTES & UPI */}
                <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
                  <h2 className="text-sm font-bold text-slate-300 mb-4">📝 Notes & Payment Info</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Notes for client</label>
                      <textarea value={form.notes} onChange={e => updateForm('notes', e.target.value)}
                        placeholder="Thank you for your business!" rows={3}
                        className="w-full border-2 bg-slate-700 border-slate-600 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors resize-none" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 mb-1.5 block">UPI ID (for payment)</label>
                      <input value={form.upiId} onChange={e => updateForm('upiId', e.target.value)}
                        placeholder="yourname@upi"
                        className="w-full border-2 bg-slate-700 border-slate-600 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors" />
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT — SUMMARY / GST */}
              <div className="space-y-6">

                {/* GST */}
                <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
                  <h2 className="text-sm font-bold text-slate-300 mb-4">🧾 GST Settings</h2>
                  <div className="space-y-2">
                    {TAX_RATES.map(rate => (
                      <button key={rate.label} onClick={() => setTaxRate(rate)}
                        className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all
                          ${taxRate.label === rate.label ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
                        {rate.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* TOTALS */}
                <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
                  <h2 className="text-sm font-bold text-slate-300 mb-4">💰 Summary</h2>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Subtotal</span>
                      <span className="font-semibold text-white">{formatINR(subtotal)}</span>
                    </div>
                    {taxRate.cgst > 0 && (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">CGST ({taxRate.cgst}%)</span>
                          <span className="font-semibold text-white">{formatINR(cgstAmount)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">SGST ({taxRate.sgst}%)</span>
                          <span className="font-semibold text-white">{formatINR(sgstAmount)}</span>
                        </div>
                      </>
                    )}
                    <div className="border-t border-slate-700 pt-3 flex justify-between">
                      <span className="font-black text-white">Total</span>
                      <span className="font-black text-xl text-blue-400">{formatINR(total)}</span>
                    </div>
                  </div>
                </div>

                {/* QUICK ACTIONS */}
                <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
                  <h2 className="text-sm font-bold text-slate-300 mb-4">⚡ Quick Actions</h2>
                  <div className="space-y-2">
                    <button onClick={saveInvoice} disabled={saving}
                      className="w-full flex items-center gap-3 px-4 py-3 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition-colors disabled:opacity-60">
                      {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                      {saving ? 'Saving…' : 'Save Invoice'}
                    </button>
                    <button onClick={() => setActiveTab('preview')}
                      className="w-full flex items-center gap-3 px-4 py-3 border-2 border-slate-600 text-slate-300 rounded-xl text-sm font-semibold hover:border-blue-500 hover:text-blue-400 transition-all">
                      <Eye size={16} /> Preview
                    </button>
                    <button onClick={newInvoice}
                      className="w-full flex items-center gap-3 px-4 py-3 border-2 border-slate-600 text-slate-300 rounded-xl text-sm font-semibold hover:border-blue-500 hover:text-blue-400 transition-all">
                      <Plus size={16} /> New Invoice
                    </button>
                  </div>
                </div>
              </div>
            </div>

          ) : (

            /* ═══ PREVIEW MODE ═══ */
            <div className="max-w-3xl mx-auto">
              <div className="bg-white rounded-2xl border border-slate-100 p-10 shadow-xl shadow-slate-900/50" id="invoice-preview">

                {/* HEADER */}
                <div className="flex justify-between items-start mb-10">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                        <FileText size={20} className="text-white" />
                      </div>
                      <span className="text-2xl font-black text-slate-800">BILLR</span>
                    </div>
                    <p className="text-sm font-bold text-slate-800">{form.fromName}</p>
                    <p className="text-sm text-slate-500">{form.fromEmail}</p>
                    <p className="text-sm text-slate-500">{form.fromPhone}</p>
                    <p className="text-sm text-slate-500">{form.fromAddress}</p>
                    {form.fromGST && <p className="text-sm text-slate-500">GSTIN: {form.fromGST}</p>}
                  </div>
                  <div className="text-right">
                    <h1 className="text-4xl font-black text-blue-600 mb-2">INVOICE</h1>
                    <p className="text-sm font-bold text-slate-800">#{form.invoiceNumber}</p>
                    <p className="text-sm text-slate-500">Date: {form.invoiceDate}</p>
                    {form.dueDate && <p className="text-sm text-red-500 font-semibold">Due: {form.dueDate}</p>}
                    <span className={`inline-flex items-center gap-1 mt-2 text-xs font-bold px-2 py-1 rounded-full ${(STATUS_CONFIG[form.status] || STATUS_CONFIG.draft).bg}`}>
                      {form.status?.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* BILL TO */}
                <div className="bg-slate-50 rounded-2xl p-6 mb-8">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Bill To</p>
                  <p className="text-base font-bold text-slate-800">{form.toName || 'Client Name'}</p>
                  <p className="text-sm text-slate-500">{form.toEmail}</p>
                  <p className="text-sm text-slate-500">{form.toPhone}</p>
                  <p className="text-sm text-slate-500">{form.toAddress}</p>
                  {form.toGST && <p className="text-sm text-slate-500">GSTIN: {form.toGST}</p>}
                </div>

                {/* ITEMS TABLE */}
                <table className="w-full mb-8">
                  <thead>
                    <tr className="border-b-2 border-slate-200">
                      {['Description','Qty','Rate','Amount'].map((h, i) => (
                        <th key={h} className={`text-xs font-bold text-slate-500 uppercase tracking-wide pb-3 ${i===0 ? 'text-left' : 'text-right'}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(item => (
                      <tr key={item.id} className="border-b border-slate-100">
                        <td className="py-4 text-sm text-slate-800 font-medium">{item.description || 'Service'}</td>
                        <td className="py-4 text-sm text-slate-600 text-right">{item.quantity}</td>
                        <td className="py-4 text-sm text-slate-600 text-right">{formatINR(item.rate)}</td>
                        <td className="py-4 text-sm font-bold text-slate-800 text-right">{formatINR(item.quantity * item.rate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* TOTALS */}
                <div className="flex justify-end mb-8">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Subtotal</span>
                      <span className="font-semibold">{formatINR(subtotal)}</span>
                    </div>
                    {taxRate.cgst > 0 && (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">CGST ({taxRate.cgst}%)</span>
                          <span className="font-semibold">{formatINR(cgstAmount)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">SGST ({taxRate.sgst}%)</span>
                          <span className="font-semibold">{formatINR(sgstAmount)}</span>
                        </div>
                      </>
                    )}
                    <div className="border-t-2 border-slate-200 pt-3 flex justify-between">
                      <span className="font-black text-slate-800">Total</span>
                      <span className="font-black text-xl text-blue-600">{formatINR(total)}</span>
                    </div>
                  </div>
                </div>

                {/* UPI & NOTES */}
                {(form.upiId || form.notes) && (
                  <div className="border-t-2 border-slate-100 pt-6 space-y-4">
                    {form.upiId && (
                      <div className="bg-green-50 rounded-xl p-4">
                        <p className="text-xs font-bold text-green-700 mb-1">💳 Pay via UPI</p>
                        <p className="text-sm font-bold text-green-800">{form.upiId}</p>
                        <p className="text-xs text-green-600 mt-1">GPay · PhonePe · Paytm</p>
                      </div>
                    )}
                    {form.notes && (
                      <div>
                        <p className="text-xs font-bold text-slate-500 mb-1">Notes</p>
                        <p className="text-sm text-slate-600">{form.notes}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* FOOTER */}
                <div className="border-t border-slate-100 mt-8 pt-6 text-center">
                  <p className="text-xs text-slate-400">Generated with BILLR</p>
                </div>
              </div>

              {/* Preview Actions */}
              <div className="flex gap-3 mt-4 justify-center">
                <button onClick={() => setActiveTab('edit')}
                  className="flex items-center gap-2 border-2 border-slate-700 text-slate-300 text-sm font-semibold px-4 py-2 rounded-xl hover:border-blue-500 hover:text-blue-400 transition-all">
                  <ArrowLeft size={15} /> Back to Edit
                </button>
                <button onClick={saveInvoice} disabled={saving}
                  className="flex items-center gap-2 bg-green-600 text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-green-500 transition-all disabled:opacity-60">
                  {saving ? <RefreshCw size={15} className="animate-spin" /> : <Save size={15} />}
                  {saving ? 'Saving…' : 'Save Invoice'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}