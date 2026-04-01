import { useState } from 'react'
import {
  ArrowLeft, Plus, Trash2,
  Download, Send, Eye,
  FileText, Building2, User,
  Calendar, Hash, IndianRupee
} from 'lucide-react'

const TAX_RATES = [
  { label: 'No GST (0%)', cgst: 0, sgst: 0 },
  { label: 'GST 5%', cgst: 2.5, sgst: 2.5 },
  { label: 'GST 12%', cgst: 6, sgst: 6 },
  { label: 'GST 18%', cgst: 9, sgst: 9 },
  { label: 'GST 28%', cgst: 14, sgst: 14 },
]

const EMPTY_ITEM = {
  id: Date.now(),
  description: '',
  quantity: 1,
  rate: 0,
}

export default function Invoice() {
  const [activeTab, setActiveTab] = useState('edit')
  const [taxRate, setTaxRate] = useState(TAX_RATES[0])
  const [items, setItems] = useState([{ ...EMPTY_ITEM }])
  const [form, setForm] = useState({
    // Invoice details
    invoiceNumber: 'INV-005',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    notes: '',
    upiId: '',
    // From (your details)
    fromName: 'Vaibhav Lakkashetti',
    fromEmail: 'vaibhav@example.com',
    fromPhone: '+91 9876543210',
    fromAddress: 'Belagavi, Karnataka, India',
    fromGST: '',
    // To (client details)
    toName: '',
    toEmail: '',
    toPhone: '',
    toAddress: '',
    toGST: '',
  })

  // CALCULATIONS
  const subtotal = items.reduce((sum, item) =>
    sum + (item.quantity * item.rate), 0)
  const cgstAmount = (subtotal * taxRate.cgst) / 100
  const sgstAmount = (subtotal * taxRate.sgst) / 100
  const total = subtotal + cgstAmount + sgstAmount

  const updateForm = (key, value) =>
    setForm(prev => ({ ...prev, [key]: value }))

  const addItem = () =>
    setItems(prev => [...prev, {
      ...EMPTY_ITEM, id: Date.now()
    }])

  const removeItem = (id) =>
    setItems(prev => prev.filter(i => i.id !== id))

  const updateItem = (id, key, value) =>
    setItems(prev => prev.map(i =>
      i.id === id ? { ...i, [key]: value } : i
    ))

  const formatINR = (num) =>
    `₹${Number(num).toLocaleString('en-IN', {
      minimumFractionDigits: 2
    })}`

  return (
    <div className="min-h-screen bg-slate-900">

      {/* TOP BAR */}
      <header className="sticky top-0 bg-slate-900
        border-b border-slate-800 z-10">
        <div className="max-w-7xl mx-auto px-6
          h-16 flex items-center justify-between">

          <div className="flex items-center gap-4">
            <a href="/dashboard"
              className="flex items-center gap-2
                text-slate-400 hover:text-blue-400
                transition-colors group">
              <ArrowLeft size={18}
                className="group-hover:-translate-x-1
                  transition-transform" />
              <span className="text-sm font-medium">
                Dashboard
              </span>
            </a>
            <div className="h-4 w-px bg-slate-700" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-blue-600
                rounded-lg flex items-center
                justify-center">
                <FileText size={14}
                  className="text-white" />
              </div>
              <span className="font-black text-white">
                Create Invoice
              </span>
            </div>
          </div>

          {/* TABS */}
          <div className="flex bg-slate-700
            rounded-xl p-1 gap-1">
            {['edit', 'preview'].map(tab => (
              <button key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-lg
                  text-sm font-semibold capitalize
                  transition-all
                  ${activeTab === tab
                    ? 'bg-slate-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                  }`}>
                {tab === 'edit' ? '✏️ Edit' : '👁️ Preview'}
              </button>
            ))}
          </div>

          {/* ACTIONS */}
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2
              border-2 border-slate-600 text-slate-300
              text-sm font-semibold px-4 py-2
              rounded-xl hover:border-blue-500
              hover:text-blue-400 transition-all">
              <Download size={16} />
              PDF
            </button>
            <button className="flex items-center gap-2
              bg-blue-600 text-white text-sm
              font-bold px-4 py-2 rounded-xl
              hover:bg-blue-500 transition-all
              shadow-lg shadow-blue-500/25">
              <Send size={16} />
              Send Invoice
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {activeTab === 'edit' ? (

          /* ═══ EDIT MODE ═══ */
          <div className="grid lg:grid-cols-3 gap-6">

            {/* LEFT — FORM */}
            <div className="lg:col-span-2 space-y-6">

              {/* INVOICE DETAILS */}
              <div className="bg-slate-800 rounded-2xl
                border border-slate-700 p-6">
                <h2 className="text-sm font-bold
                  text-slate-300 mb-4 flex items-center
                  gap-2">
                  <Hash size={16}
                    className="text-blue-600" />
                  Invoice Details
                </h2>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-semibold
                      text-slate-400 mb-1.5 block">
                      Invoice Number
                    </label>
                    <input
                      value={form.invoiceNumber}
                      onChange={e => updateForm(
                        'invoiceNumber', e.target.value)}
                      className="w-full border-2
                        bg-slate-700 border-slate-600 rounded-xl px-3
                        py-2.5 text-sm font-semibold
                        text-white focus:outline-none
                        focus:border-blue-500
                        transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold
                      text-slate-500 mb-1.5 block">
                      Invoice Date
                    </label>
                    <input type="date"
                      value={form.invoiceDate}
                      onChange={e => updateForm(
                        'invoiceDate', e.target.value)}
                      className="w-full border-2
                        border-slate-200 rounded-xl px-3
                        py-2.5 text-sm text-slate-800
                        focus:outline-none
                        focus:border-blue-500
                        transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold
                      text-slate-500 mb-1.5 block">
                      Due Date
                    </label>
                    <input type="date"
                      value={form.dueDate}
                      onChange={e => updateForm(
                        'dueDate', e.target.value)}
                      className="w-full border-2
                        border-slate-200 rounded-xl px-3
                        py-2.5 text-sm text-slate-800
                        focus:outline-none
                        focus:border-blue-500
                        transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* FROM & TO */}
              <div className="grid md:grid-cols-2 gap-6">

                {/* FROM */}
                <div className="bg-slate-800 rounded-2xl
                  border border-slate-700 p-6">
                  <h2 className="text-sm font-bold
                    text-slate-300 mb-4 flex items-center
                    gap-2">
                    <Building2 size={16}
                      className="text-blue-600" />
                    From (You)
                  </h2>
                  <div className="space-y-3">
                    {[
                      { key: 'fromName', placeholder: 'Your Name', label: 'Name' },
                      { key: 'fromEmail', placeholder: 'your@email.com', label: 'Email' },
                      { key: 'fromPhone', placeholder: '+91 98765 43210', label: 'Phone' },
                      { key: 'fromAddress', placeholder: 'City, State, India', label: 'Address' },
                      { key: 'fromGST', placeholder: 'GSTIN (optional)', label: 'GSTIN' },
                    ].map(field => (
                      <div key={field.key}>
                        <label className="text-xs
                          font-semibold text-slate-500
                          mb-1 block">
                          {field.label}
                        </label>
                        <input
                          value={form[field.key]}
                          onChange={e => updateForm(
                            field.key, e.target.value)}
                          placeholder={field.placeholder}
                          className="w-full border-2
                            bg-slate-700 border-slate-600 rounded-xl
                            px-3 py-2 text-sm
                            text-white
                            placeholder:text-slate-500
                            focus:outline-none
                            focus:border-blue-500
                            transition-colors"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* TO */}
                <div className="bg-slate-800 rounded-2xl
                  border border-slate-700 p-6">
                  <h2 className="text-sm font-bold
                    text-slate-300 mb-4 flex items-center
                    gap-2">
                    <User size={16}
                      className="text-blue-600" />
                    Bill To (Client)
                  </h2>
                  <div className="space-y-3">
                    {[
                      { key: 'toName', placeholder: 'Client Name / Company', label: 'Name' },
                      { key: 'toEmail', placeholder: 'client@email.com', label: 'Email' },
                      { key: 'toPhone', placeholder: '+91 98765 43210', label: 'Phone' },
                      { key: 'toAddress', placeholder: 'City, State, India', label: 'Address' },
                      { key: 'toGST', placeholder: 'Client GSTIN (optional)', label: 'GSTIN' },
                    ].map(field => (
                      <div key={field.key}>
                        <label className="text-xs
                          font-semibold text-slate-500
                          mb-1 block">
                          {field.label}
                        </label>
                        <input
                          value={form[field.key]}
                          onChange={e => updateForm(
                            field.key, e.target.value)}
                          placeholder={field.placeholder}
                          className="w-full border-2
                            bg-slate-700 border-slate-600 rounded-xl
                            px-3 py-2 text-sm
                            text-white
                            placeholder:text-slate-500
                            focus:outline-none
                            focus:border-blue-500
                            transition-colors"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* LINE ITEMS */}
              <div className="bg-white rounded-2xl
                border border-slate-100 p-6">
                <h2 className="text-sm font-bold
                  text-slate-800 mb-4 flex items-center
                  gap-2">
                  <IndianRupee size={16}
                    className="text-blue-600" />
                  Services / Items
                </h2>

                {/* HEADER ROW */}
                <div className="grid grid-cols-12
                  gap-3 mb-3 px-1">
                  {['Description','Qty','Rate (₹)','Amount']
                    .map((h, i) => (
                    <div key={h}
                      className={`text-xs font-semibold
                        text-slate-500 uppercase
                        tracking-wide
                        ${i === 0 ? 'col-span-6'
                          : i === 3 ? 'col-span-2 text-right'
                          : 'col-span-2'}`}>
                      {h}
                    </div>
                  ))}
                </div>

                {/* ITEMS */}
                <div className="space-y-3">
                  {items.map(item => (
                    <div key={item.id}
                      className="grid grid-cols-12
                        gap-3 items-center">

                      {/* DESCRIPTION */}
                      <div className="col-span-6">
                        <input
                          value={item.description}
                          onChange={e => updateItem(
                            item.id, 'description',
                            e.target.value)}
                          placeholder="Service description..."
                          className="w-full border-2
                            border-slate-200 rounded-xl
                            px-3 py-2.5 text-sm
                            text-slate-800
                            placeholder:text-slate-400
                            focus:outline-none
                            focus:border-blue-500
                            transition-colors"
                        />
                      </div>

                      {/* QTY */}
                      <div className="col-span-2">
                        <input type="number"
                          value={item.quantity}
                          min="1"
                          onChange={e => updateItem(
                            item.id, 'quantity',
                            Number(e.target.value))}
                          className="w-full border-2
                            border-slate-200 rounded-xl
                            px-3 py-2.5 text-sm
                            text-slate-800
                            focus:outline-none
                            focus:border-blue-500
                            transition-colors"
                        />
                      </div>

                      {/* RATE */}
                      <div className="col-span-2">
                        <input type="number"
                          value={item.rate}
                          min="0"
                          onChange={e => updateItem(
                            item.id, 'rate',
                            Number(e.target.value))}
                          className="w-full border-2
                            border-slate-200 rounded-xl
                            px-3 py-2.5 text-sm
                            text-slate-800
                            focus:outline-none
                            focus:border-blue-500
                            transition-colors"
                        />
                      </div>

                      {/* AMOUNT */}
                      <div className="col-span-1
                        text-right">
                        <span className="text-sm
                          font-bold text-slate-800">
                          {formatINR(
                            item.quantity * item.rate)}
                        </span>
                      </div>

                      {/* DELETE */}
                      <div className="col-span-1
                        flex justify-center">
                        {items.length > 1 && (
                          <button
                            onClick={() =>
                              removeItem(item.id)}
                            className="p-1.5 text-slate-400
                              hover:text-red-500
                              hover:bg-red-50 rounded-lg
                              transition-colors">
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* ADD ITEM */}
                <button onClick={addItem}
                  className="mt-4 flex items-center
                    gap-2 text-blue-600 text-sm
                    font-semibold hover:text-blue-700
                    transition-colors">
                  <Plus size={16} />
                  Add Item
                </button>
              </div>

              {/* NOTES */}
              <div className="bg-white rounded-2xl
                border border-slate-100 p-6">
                <h2 className="text-sm font-bold
                  text-slate-800 mb-4">
                  📝 Notes & Payment Info
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold
                      text-slate-500 mb-1.5 block">
                      Notes for client
                    </label>
                    <textarea
                      value={form.notes}
                      onChange={e => updateForm(
                        'notes', e.target.value)}
                      placeholder="Thank you for your business!"
                      rows={3}
                      className="w-full border-2
                        border-slate-200 rounded-xl
                        px-3 py-2.5 text-sm
                        text-slate-800
                        placeholder:text-slate-400
                        focus:outline-none
                        focus:border-blue-500
                        transition-colors resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold
                      text-slate-500 mb-1.5 block">
                      UPI ID (for payment)
                    </label>
                    <input
                      value={form.upiId}
                      onChange={e => updateForm(
                        'upiId', e.target.value)}
                      placeholder="yourname@upi"
                      className="w-full border-2
                        border-slate-200 rounded-xl
                        px-3 py-2.5 text-sm
                        text-slate-800
                        placeholder:text-slate-400
                        focus:outline-none
                        focus:border-blue-500
                        transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT — SUMMARY */}
            <div className="space-y-6">

              {/* GST SELECTOR */}
              <div className="bg-white rounded-2xl
                border border-slate-100 p-6">
                <h2 className="text-sm font-bold
                  text-slate-800 mb-4">
                  🧾 GST Settings
                </h2>
                <div className="space-y-2">
                  {TAX_RATES.map(rate => (
                    <button key={rate.label}
                      onClick={() => setTaxRate(rate)}
                      className={`w-full text-left px-4
                        py-3 rounded-xl text-sm
                        font-semibold transition-all
                        ${taxRate.label === rate.label
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                        }`}>
                      {rate.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* TOTALS */}
              <div className="bg-white rounded-2xl
                border border-slate-100 p-6">
                <h2 className="text-sm font-bold
                  text-slate-800 mb-4">
                  💰 Summary
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between
                    text-sm">
                    <span className="text-slate-500">
                      Subtotal
                    </span>
                    <span className="font-semibold
                      text-slate-800">
                      {formatINR(subtotal)}
                    </span>
                  </div>
                  {taxRate.cgst > 0 && (
                    <>
                      <div className="flex justify-between
                        text-sm">
                        <span className="text-slate-500">
                          CGST ({taxRate.cgst}%)
                        </span>
                        <span className="font-semibold
                          text-slate-800">
                          {formatINR(cgstAmount)}
                        </span>
                      </div>
                      <div className="flex justify-between
                        text-sm">
                        <span className="text-slate-500">
                          SGST ({taxRate.sgst}%)
                        </span>
                        <span className="font-semibold
                          text-slate-800">
                          {formatINR(sgstAmount)}
                        </span>
                      </div>
                    </>
                  )}
                  <div className="border-t border-slate-100
                    pt-3 flex justify-between">
                    <span className="font-black
                      text-slate-800">
                      Total
                    </span>
                    <span className="font-black text-xl
                      text-blue-600">
                      {formatINR(total)}
                    </span>
                  </div>
                </div>
              </div>

              {/* QUICK ACTIONS */}
              <div className="bg-white rounded-2xl
                border border-slate-100 p-6">
                <h2 className="text-sm font-bold
                  text-slate-800 mb-4">
                  ⚡ Quick Actions
                </h2>
                <div className="space-y-2">
                  <button className="w-full flex
                    items-center gap-3 px-4 py-3
                    bg-blue-600 text-white rounded-xl
                    text-sm font-bold hover:bg-blue-700
                    transition-colors">
                    <Send size={16} />
                    Send to Client
                  </button>
                  <button className="w-full flex
                    items-center gap-3 px-4 py-3
                    border-2 border-slate-200
                    text-slate-700 rounded-xl text-sm
                    font-semibold hover:border-blue-300
                    hover:text-blue-600 transition-all">
                    <Download size={16} />
                    Download PDF
                  </button>
                  <button className="w-full flex
                    items-center gap-3 px-4 py-3
                    border-2 border-slate-200
                    text-slate-700 rounded-xl text-sm
                    font-semibold hover:border-blue-300
                    hover:text-blue-600 transition-all">
                    <Eye size={16} />
                    Preview Invoice
                  </button>
                </div>
              </div>
            </div>
          </div>

        ) : (

          /* ═══ PREVIEW MODE ═══ */
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl
              border border-slate-100 p-10
              shadow-xl shadow-slate-100"
              id="invoice-preview">

              {/* INVOICE HEADER */}
              <div className="flex justify-between
                items-start mb-10">
                <div>
                  <div className="flex items-center
                    gap-2 mb-4">
                    <div className="w-10 h-10
                      bg-blue-600 rounded-xl
                      flex items-center justify-center">
                      <FileText size={20}
                        className="text-white" />
                    </div>
                    <span className="text-2xl font-black
                      text-slate-800">
                      BILLR
                    </span>
                  </div>
                  <p className="text-sm font-bold
                    text-slate-800">
                    {form.fromName}
                  </p>
                  <p className="text-sm text-slate-500">
                    {form.fromEmail}
                  </p>
                  <p className="text-sm text-slate-500">
                    {form.fromPhone}
                  </p>
                  <p className="text-sm text-slate-500">
                    {form.fromAddress}
                  </p>
                  {form.fromGST && (
                    <p className="text-sm text-slate-500">
                      GSTIN: {form.fromGST}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <h1 className="text-4xl font-black
                    text-blue-600 mb-2">
                    INVOICE
                  </h1>
                  <p className="text-sm font-bold
                    text-slate-800">
                    #{form.invoiceNumber}
                  </p>
                  <p className="text-sm text-slate-500">
                    Date: {form.invoiceDate}
                  </p>
                  {form.dueDate && (
                    <p className="text-sm text-red-500
                      font-semibold">
                      Due: {form.dueDate}
                    </p>
                  )}
                </div>
              </div>

              {/* BILL TO */}
              <div className="bg-slate-50 rounded-2xl
                p-6 mb-8">
                <p className="text-xs font-bold
                  text-slate-500 uppercase tracking-wide
                  mb-3">
                  Bill To
                </p>
                <p className="text-base font-bold
                  text-slate-800">
                  {form.toName || 'Client Name'}
                </p>
                <p className="text-sm text-slate-500">
                  {form.toEmail}
                </p>
                <p className="text-sm text-slate-500">
                  {form.toPhone}
                </p>
                <p className="text-sm text-slate-500">
                  {form.toAddress}
                </p>
                {form.toGST && (
                  <p className="text-sm text-slate-500">
                    GSTIN: {form.toGST}
                  </p>
                )}
              </div>

              {/* ITEMS TABLE */}
              <table className="w-full mb-8">
                <thead>
                  <tr className="border-b-2
                    border-slate-200">
                    {['Description','Qty','Rate','Amount']
                      .map((h, i) => (
                      <th key={h}
                        className={`text-xs font-bold
                          text-slate-500 uppercase
                          tracking-wide pb-3
                          ${i === 0
                            ? 'text-left'
                            : 'text-right'}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item.id}
                      className="border-b border-slate-100">
                      <td className="py-4 text-sm
                        text-slate-800 font-medium">
                        {item.description ||
                          'Service description'}
                      </td>
                      <td className="py-4 text-sm
                        text-slate-600 text-right">
                        {item.quantity}
                      </td>
                      <td className="py-4 text-sm
                        text-slate-600 text-right">
                        {formatINR(item.rate)}
                      </td>
                      <td className="py-4 text-sm
                        font-bold text-slate-800
                        text-right">
                        {formatINR(
                          item.quantity * item.rate)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* TOTALS */}
              <div className="flex justify-end mb-8">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between
                    text-sm">
                    <span className="text-slate-500">
                      Subtotal
                    </span>
                    <span className="font-semibold">
                      {formatINR(subtotal)}
                    </span>
                  </div>
                  {taxRate.cgst > 0 && (
                    <>
                      <div className="flex justify-between
                        text-sm">
                        <span className="text-slate-500">
                          CGST ({taxRate.cgst}%)
                        </span>
                        <span className="font-semibold">
                          {formatINR(cgstAmount)}
                        </span>
                      </div>
                      <div className="flex justify-between
                        text-sm">
                        <span className="text-slate-500">
                          SGST ({taxRate.sgst}%)
                        </span>
                        <span className="font-semibold">
                          {formatINR(sgstAmount)}
                        </span>
                      </div>
                    </>
                  )}
                  <div className="border-t-2
                    border-slate-200 pt-3
                    flex justify-between">
                    <span className="font-black
                      text-slate-800">
                      Total
                    </span>
                    <span className="font-black text-xl
                      text-blue-600">
                      {formatINR(total)}
                    </span>
                  </div>
                </div>
              </div>

              {/* UPI & NOTES */}
              {(form.upiId || form.notes) && (
                <div className="border-t-2
                  border-slate-100 pt-6 space-y-4">
                  {form.upiId && (
                    <div className="bg-green-50
                      rounded-xl p-4">
                      <p className="text-xs font-bold
                        text-green-700 mb-1">
                        💳 Pay via UPI
                      </p>
                      <p className="text-sm font-bold
                        text-green-800">
                        {form.upiId}
                      </p>
                      <p className="text-xs
                        text-green-600 mt-1">
                        Send payment to this UPI ID
                        via GPay, PhonePe or Paytm
                      </p>
                    </div>
                  )}
                  {form.notes && (
                    <div>
                      <p className="text-xs font-bold
                        text-slate-500 mb-1">
                        Notes
                      </p>
                      <p className="text-sm
                        text-slate-600">
                        {form.notes}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* FOOTER */}
              <div className="border-t border-slate-100
                mt-8 pt-6 text-center">
                <p className="text-xs text-slate-400">
                  Generated with BILLR •
                  billr-freelance.vercel.app
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}