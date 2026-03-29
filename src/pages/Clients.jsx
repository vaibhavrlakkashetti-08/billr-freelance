import { useState } from 'react'
import {
  ArrowLeft, Plus, Search,
  Mail, Phone, MapPin,
  FileText, DollarSign,
  Edit2, Trash2, X,
  User, Building2, Check
} from 'lucide-react'

const INITIAL_CLIENTS = [
  {
    id: 1,
    name: 'Acme Corp',
    email: 'contact@acmecorp.com',
    phone: '+91 98765 43210',
    address: 'Mumbai, Maharashtra',
    gstin: '27AAPFU0939F1ZV',
    totalInvoices: 3,
    totalPaid: 45000,
    totalPending: 0,
    lastInvoice: 'Mar 5, 2026',
    status: 'active'
  },
  {
    id: 2,
    name: 'TechStart India',
    email: 'billing@techstart.in',
    phone: '+91 87654 32109',
    address: 'Bangalore, Karnataka',
    gstin: '',
    totalInvoices: 2,
    totalPaid: 0,
    totalPending: 8500,
    lastInvoice: 'Mar 6, 2026',
    status: 'active'
  },
  {
    id: 3,
    name: 'Design Studio',
    email: 'hello@designstudio.com',
    phone: '+91 76543 21098',
    address: 'Pune, Maharashtra',
    gstin: '27BOCPS1234F1ZV',
    totalInvoices: 4,
    totalPaid: 22000,
    totalPending: 22000,
    lastInvoice: 'Feb 20, 2026',
    status: 'overdue'
  },
  {
    id: 4,
    name: 'Startup Hub',
    email: 'pay@startuphub.io',
    phone: '+91 65432 10987',
    address: 'Hyderabad, Telangana',
    gstin: '',
    totalInvoices: 1,
    totalPaid: 0,
    totalPending: 5000,
    lastInvoice: 'Mar 7, 2026',
    status: 'active'
  },
]

const EMPTY_CLIENT = {
  name: '', email: '', phone: '',
  address: '', gstin: ''
}

export default function Clients() {
  const [clients, setClients] = useState(INITIAL_CLIENTS)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editClient, setEditClient] = useState(null)
  const [form, setForm] = useState(EMPTY_CLIENT)
  const [selected, setSelected] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  // FILTER
  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  )

  // STATS
  const totalEarned = clients.reduce(
    (s, c) => s + c.totalPaid, 0)
  const totalPending = clients.reduce(
    (s, c) => s + c.totalPending, 0)

  const openAdd = () => {
    setEditClient(null)
    setForm(EMPTY_CLIENT)
    setShowModal(true)
  }

  const openEdit = (client) => {
    setEditClient(client)
    setForm({
      name: client.name,
      email: client.email,
      phone: client.phone,
      address: client.address,
      gstin: client.gstin
    })
    setShowModal(true)
  }

  const saveClient = () => {
    if (!form.name || !form.email) return
    if (editClient) {
      setClients(prev => prev.map(c =>
        c.id === editClient.id
          ? { ...c, ...form }
          : c
      ))
    } else {
      setClients(prev => [...prev, {
        id: Date.now(),
        ...form,
        totalInvoices: 0,
        totalPaid: 0,
        totalPending: 0,
        lastInvoice: '—',
        status: 'active'
      }])
    }
    setShowModal(false)
  }

  const deleteClient = (id) => {
    setClients(prev =>
      prev.filter(c => c.id !== id))
    setDeleteConfirm(null)
    if (selected?.id === id) setSelected(null)
  }

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
                <User size={14}
                  className="text-white" />
              </div>
              <span className="font-black text-slate-800">
                Clients
              </span>
            </div>
          </div>

          <button onClick={openAdd}
            className="flex items-center gap-2
              bg-blue-600 text-white text-sm
              font-bold px-4 py-2 rounded-xl
              hover:bg-blue-700 transition-all
              shadow-lg shadow-blue-200
              hover:-translate-y-0.5">
            <Plus size={16} />
            Add Client
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* STATS */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            {
              label: 'Total Clients',
              value: clients.length,
              icon: User,
              color: 'blue'
            },
            {
              label: 'Total Earned',
              value: formatINR(totalEarned),
              icon: DollarSign,
              color: 'green'
            },
            {
              label: 'Total Pending',
              value: formatINR(totalPending),
              icon: FileText,
              color: 'yellow'
            },
          ].map(stat => (
            <div key={stat.label}
              className="bg-white rounded-2xl
                border border-slate-100 p-5">
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
                text-slate-800">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        <div className="flex gap-6">

          {/* CLIENT LIST */}
          <div className="flex-1">

            {/* SEARCH */}
            <div className="relative mb-4">
              <Search size={18}
                className="absolute left-4 top-1/2
                  -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search clients..."
                className="w-full pl-11 pr-4 py-3
                  bg-white border-2 border-slate-200
                  rounded-2xl text-sm text-slate-800
                  placeholder:text-slate-400
                  focus:outline-none focus:border-blue-500
                  transition-colors"
              />
            </div>

            {/* LIST */}
            <div className="space-y-3">
              {filtered.length === 0 ? (
                <div className="bg-white rounded-2xl
                  border border-slate-100 p-12
                  text-center">
                  <User size={40}
                    className="text-slate-300
                      mx-auto mb-4" />
                  <p className="text-slate-500
                    font-semibold">
                    No clients found
                  </p>
                  <button onClick={openAdd}
                    className="mt-4 text-blue-600
                      text-sm font-bold hover:underline">
                    + Add your first client
                  </button>
                </div>
              ) : (
                filtered.map(client => (
                  <div key={client.id}
                    onClick={() => setSelected(client)}
                    className={`bg-white rounded-2xl
                      border-2 p-5 cursor-pointer
                      transition-all hover:shadow-md
                      ${selected?.id === client.id
                        ? 'border-blue-500 shadow-md'
                        : 'border-slate-100 hover:border-blue-200'
                      }`}>
                    <div className="flex items-center
                      justify-between">

                      {/* LEFT */}
                      <div className="flex items-center
                        gap-4">
                        <div className="w-12 h-12
                          bg-blue-600 rounded-2xl
                          flex items-center justify-center
                          text-white font-black text-lg
                          flex-shrink-0">
                          {client.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center
                            gap-2">
                            <h3 className="font-bold
                              text-slate-800">
                              {client.name}
                            </h3>
                            {client.status === 'overdue' && (
                              <span className="text-xs
                                bg-red-100 text-red-600
                                font-bold px-2 py-0.5
                                rounded-full">
                                Overdue
                              </span>
                            )}
                          </div>
                          <p className="text-sm
                            text-slate-500">
                            {client.email}
                          </p>
                          <p className="text-xs
                            text-slate-400 mt-0.5">
                            {client.totalInvoices} invoices •
                            Last: {client.lastInvoice}
                          </p>
                        </div>
                      </div>

                      {/* RIGHT */}
                      <div className="flex items-center
                        gap-6">
                        <div className="text-right
                          hidden md:block">
                          <p className="text-sm font-bold
                            text-green-600">
                            {formatINR(client.totalPaid)}
                            <span className="text-xs
                              font-normal text-slate-400
                              ml-1">
                              paid
                            </span>
                          </p>
                          {client.totalPending > 0 && (
                            <p className="text-sm
                              font-bold text-amber-500">
                              {formatINR(client.totalPending)}
                              <span className="text-xs
                                font-normal text-slate-400
                                ml-1">
                                pending
                              </span>
                            </p>
                          )}
                        </div>

                        {/* ACTIONS */}
                        <div className="flex gap-1"
                          onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => openEdit(client)}
                            className="p-2 text-slate-400
                              hover:text-blue-600
                              hover:bg-blue-50 rounded-xl
                              transition-colors">
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() =>
                              setDeleteConfirm(client.id)}
                            className="p-2 text-slate-400
                              hover:text-red-500
                              hover:bg-red-50 rounded-xl
                              transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* CLIENT DETAIL PANEL */}
          {selected && (
            <div className="w-80 flex-shrink-0">
              <div className="bg-white rounded-2xl
                border border-slate-100 p-6 sticky top-24">

                {/* CLOSE */}
                <div className="flex items-center
                  justify-between mb-6">
                  <h2 className="font-black text-slate-800">
                    Client Details
                  </h2>
                  <button
                    onClick={() => setSelected(null)}
                    className="p-1.5 text-slate-400
                      hover:text-slate-600
                      hover:bg-slate-100 rounded-lg
                      transition-colors">
                    <X size={16} />
                  </button>
                </div>

                {/* AVATAR */}
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-blue-600
                    rounded-2xl flex items-center
                    justify-center text-white font-black
                    text-2xl mx-auto mb-3">
                    {selected.name.charAt(0)}
                  </div>
                  <h3 className="font-black text-slate-800
                    text-lg">
                    {selected.name}
                  </h3>
                  {selected.status === 'overdue' && (
                    <span className="text-xs bg-red-100
                      text-red-600 font-bold px-3 py-1
                      rounded-full">
                      Has Overdue Invoice
                    </span>
                  )}
                </div>

                {/* INFO */}
                <div className="space-y-3 mb-6">
                  {[
                    {
                      icon: Mail,
                      value: selected.email
                    },
                    {
                      icon: Phone,
                      value: selected.phone
                    },
                    {
                      icon: MapPin,
                      value: selected.address
                    },
                    ...(selected.gstin ? [{
                      icon: Building2,
                      value: `GSTIN: ${selected.gstin}`
                    }] : [])
                  ].map((item, i) => (
                    <div key={i}
                      className="flex items-center
                        gap-3 text-sm">
                      <item.icon size={16}
                        className="text-slate-400
                          flex-shrink-0" />
                      <span className="text-slate-600
                        break-all">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* STATS */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {[
                    {
                      label: 'Invoices',
                      value: selected.totalInvoices
                    },
                    {
                      label: 'Last Invoice',
                      value: selected.lastInvoice
                    },
                    {
                      label: 'Total Paid',
                      value: formatINR(selected.totalPaid),
                      green: true
                    },
                    {
                      label: 'Pending',
                      value: formatINR(
                        selected.totalPending),
                      amber: selected.totalPending > 0
                    },
                  ].map(s => (
                    <div key={s.label}
                      className="bg-slate-50 rounded-xl
                        p-3">
                      <p className="text-xs text-slate-500
                        font-medium mb-1">
                        {s.label}
                      </p>
                      <p className={`text-sm font-black
                        ${s.green
                          ? 'text-green-600'
                          : s.amber
                          ? 'text-amber-500'
                          : 'text-slate-800'}`}>
                        {s.value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* ACTIONS */}
                <div className="space-y-2">
                  <a href="/invoice/new"
                    className="w-full flex items-center
                      justify-center gap-2 bg-blue-600
                      text-white text-sm font-bold py-3
                      rounded-xl hover:bg-blue-700
                      transition-colors">
                    <Plus size={16} />
                    Create Invoice
                  </a>
                  <button
                    onClick={() => openEdit(selected)}
                    className="w-full flex items-center
                      justify-center gap-2 border-2
                      border-slate-200 text-slate-700
                      text-sm font-semibold py-3
                      rounded-xl hover:border-blue-300
                      hover:text-blue-600 transition-all">
                    <Edit2 size={16} />
                    Edit Client
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ADD/EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50
              backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <div className="absolute top-1/2 left-1/2
            -translate-x-1/2 -translate-y-1/2
            bg-white rounded-3xl shadow-2xl
            w-full max-w-md p-8">

            {/* MODAL HEADER */}
            <div className="flex items-center
              justify-between mb-6">
              <h2 className="text-xl font-black
                text-slate-800">
                {editClient
                  ? '✏️ Edit Client'
                  : '➕ Add Client'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-slate-400
                  hover:text-slate-600
                  hover:bg-slate-100 rounded-xl
                  transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* FORM */}
            <div className="space-y-4">
              {[
                {
                  key: 'name',
                  label: 'Client Name *',
                  placeholder: 'Acme Corp',
                  icon: User
                },
                {
                  key: 'email',
                  label: 'Email Address *',
                  placeholder: 'client@email.com',
                  icon: Mail
                },
                {
                  key: 'phone',
                  label: 'Phone Number',
                  placeholder: '+91 98765 43210',
                  icon: Phone
                },
                {
                  key: 'address',
                  label: 'Address',
                  placeholder: 'City, State, India',
                  icon: MapPin
                },
                {
                  key: 'gstin',
                  label: 'GSTIN (optional)',
                  placeholder: '27AAPFU0939F1ZV',
                  icon: Building2
                },
              ].map(field => (
                <div key={field.key}>
                  <label className="text-xs font-bold
                    text-slate-600 mb-1.5 block">
                    {field.label}
                  </label>
                  <div className="relative">
                    <field.icon size={16}
                      className="absolute left-3.5
                        top-1/2 -translate-y-1/2
                        text-slate-400" />
                    <input
                      value={form[field.key]}
                      onChange={e => setForm(p => ({
                        ...p,
                        [field.key]: e.target.value
                      }))}
                      placeholder={field.placeholder}
                      className="w-full pl-10 pr-4 py-3
                        border-2 border-slate-200
                        rounded-xl text-sm text-slate-800
                        placeholder:text-slate-400
                        focus:outline-none
                        focus:border-blue-500
                        transition-colors"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* BUTTONS */}
            <div className="grid grid-cols-2 gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="py-3 border-2 border-slate-200
                  text-slate-700 font-semibold rounded-xl
                  hover:bg-slate-50 transition-colors
                  text-sm">
                Cancel
              </button>
              <button
                onClick={saveClient}
                disabled={!form.name || !form.email}
                className="py-3 bg-blue-600 text-white
                  font-bold rounded-xl hover:bg-blue-700
                  transition-colors text-sm
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                  flex items-center justify-center gap-2">
                <Check size={16} />
                {editClient ? 'Save Changes' : 'Add Client'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50
              backdrop-blur-sm"
            onClick={() => setDeleteConfirm(null)}
          />
          <div className="absolute top-1/2 left-1/2
            -translate-x-1/2 -translate-y-1/2
            bg-white rounded-3xl shadow-2xl
            w-full max-w-sm p-8 text-center">
            <div className="w-16 h-16 bg-red-100
              rounded-2xl flex items-center
              justify-center mx-auto mb-4">
              <Trash2 size={28}
                className="text-red-500" />
            </div>
            <h2 className="text-xl font-black
              text-slate-800 mb-2">
              Delete Client?
            </h2>
            <p className="text-slate-500 text-sm mb-6">
              This will delete the client and
              cannot be undone!
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="py-3 border-2 border-slate-200
                  text-slate-700 font-semibold rounded-xl
                  hover:bg-slate-50 transition-colors
                  text-sm">
                Cancel
              </button>
              <button
                onClick={() =>
                  deleteClient(deleteConfirm)}
                className="py-3 bg-red-500 text-white
                  font-bold rounded-xl
                  hover:bg-red-600 transition-colors
                  text-sm">
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}