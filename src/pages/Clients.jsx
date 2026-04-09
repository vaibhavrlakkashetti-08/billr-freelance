import { useEffect, useState } from 'react'
import {
  ArrowLeft, Plus, Search,
  Mail, Phone, MapPin,
  FileText, DollarSign,
  Edit2, Trash2, X,
  User, Building2, Check
} from 'lucide-react'
import { supabase } from '../supabase'

const EMPTY_CLIENT = {
  name: '', email: '', phone: '',
  address: '', gstin: ''
}

export default function Clients() {
  const [clients, setClients] = useState([])
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editClient, setEditClient] = useState(null)
  const [form, setForm] = useState(EMPTY_CLIENT)
  const [selected, setSelected] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  async function loadClients() {
    const { data: { user } } =
      await supabase.auth.getUser()
    const { data } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at',
        { ascending: false })
    if (data) setClients(data)
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      loadClients()
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  // FILTER
  const filtered = clients.filter(c =>
    (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(search.toLowerCase())
  )

  // STATS
  const totalEarned = clients.reduce(
    (s, c) => s + Number(c.totalPaid || 0), 0)
  const totalPending = clients.reduce(
    (s, c) => s + Number(c.totalPending || 0), 0)

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

  const saveClient = async () => {
    if (!form.name || !form.email) return
    if (editClient) {
      await supabase
        .from('clients')
        .update({
          name: form.name,
          email: form.email,
          phone: form.phone,
          address: form.address,
          gstin: form.gstin
        })
        .eq('id', editClient.id)
    } else {
      const { data: { user } } =
        await supabase.auth.getUser()

      await supabase
        .from('clients')
        .insert({
          user_id: user.id,
          name: form.name,
          email: form.email,
          phone: form.phone,
          address: form.address,
          gstin: form.gstin
        })
    }
    await loadClients()
    setShowModal(false)
  }

  const deleteClient = async (id) => {
    await supabase
      .from('clients')
      .delete()
      .eq('id', id)

    await loadClients()
    setDeleteConfirm(null)
    if (selected?.id === id) setSelected(null)
  }

  const formatINR = (n) =>
    `₹${Number(n).toLocaleString('en-IN')}`

  return (
    <div className="min-h-screen bg-slate-900">

      {/* HEADER */}
      <header className="sticky top-0 bg-slate-900
        border-b border-slate-800 z-10">
        <div className="max-w-7xl mx-auto px-6
          h-16 flex items-center justify-between">

          <div className="flex items-center gap-4">
            <a href="/dashboard"
              className="flex items-center gap-2
                text-slate-400 hover:text-blue-400
                transition-colors group text-sm
                font-medium">
              <ArrowLeft size={18}
                className="group-hover:-translate-x-1
                  transition-transform" />
              Dashboard
            </a>
            <div className="h-4 w-px bg-slate-700" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-blue-600
                rounded-lg flex items-center
                justify-center">
                <User size={14}
                  className="text-white" />
              </div>
              <span className="font-black text-white">
                Clients
              </span>
            </div>
          </div>

          <button onClick={openAdd}
            className="flex items-center gap-2
              bg-blue-600 text-white text-sm
              font-bold px-4 py-2 rounded-xl
              hover:bg-blue-500 transition-all
              shadow-lg shadow-blue-500/25
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
              iconBg: 'bg-blue-500/20',
              iconText: 'text-blue-400'
            },
            {
              label: 'Total Earned',
              value: formatINR(totalEarned),
              icon: DollarSign,
              iconBg: 'bg-green-500/20',
              iconText: 'text-green-400'
            },
            {
              label: 'Total Pending',
              value: formatINR(totalPending),
              icon: FileText,
              iconBg: 'bg-yellow-500/20',
              iconText: 'text-yellow-400'
            },
          ].map(stat => (
            <div key={stat.label}
              className="bg-slate-800 rounded-2xl
                border border-slate-700 p-5">
              <div className="flex items-center
                justify-between mb-3">
                <span className="text-xs font-semibold
                  text-slate-400 uppercase tracking-wide">
                  {stat.label}
                </span>
                <div className={`w-8 h-8 rounded-lg
                  ${stat.iconBg} flex items-center
                  justify-center`}>
                  <stat.icon size={16}
                    className={stat.iconText}
                  />
                </div>
              </div>
              <p className="text-2xl font-black
                text-white">
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
                  bg-slate-800 border-2 border-slate-700
                  rounded-2xl text-sm text-white
                  placeholder:text-slate-500
                  focus:outline-none focus:border-blue-500
                  transition-colors"
              />
            </div>

            {/* LIST */}
            <div className="space-y-3">
              {filtered.length === 0 ? (
                <div className="bg-slate-800 rounded-2xl
                  border border-slate-700 p-12
                  text-center">
                  <User size={40}
                    className="text-slate-600
                      mx-auto mb-4" />
                  <p className="text-slate-400
                    font-semibold">
                    {clients.length === 0
                      ? 'No clients yet'
                      : 'No clients found'}
                  </p>
                  <button onClick={openAdd}
                    className="mt-4 text-blue-400
                      text-sm font-bold hover:underline">
                    {clients.length === 0
                      ? '+ Add Client'
                      : '+ Add your first client'}
                  </button>
                </div>
              ) : (
                filtered.map(client => (
                  <div key={client.id}
                    onClick={() => setSelected(client)}
                    className={`bg-slate-800 rounded-2xl
                      border-2 p-5 cursor-pointer
                      transition-all hover:shadow-md
                      ${selected?.id === client.id
                        ? 'border-blue-500 shadow-md'
                        : 'border-slate-700 hover:border-blue-500/50'
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
                              text-white">
                              {client.name}
                            </h3>
                            {client.status === 'overdue' && (
                              <span className="text-xs
                                bg-red-500/20 text-red-400 border border-red-500/30
                                font-bold px-2 py-0.5
                                rounded-full">
                                Overdue
                              </span>
                            )}
                          </div>
                          <p className="text-sm
                            text-slate-400">
                            {client.email}
                          </p>
                          <p className="text-xs
                            text-slate-500 mt-0.5">
                            {client.totalInvoices || 0} invoices •
                            Last: {client.lastInvoice || '—'}
                          </p>
                        </div>
                      </div>

                      {/* RIGHT */}
                      <div className="flex items-center
                        gap-6">
                        <div className="text-right
                          hidden md:block">
                          <p className="text-sm font-bold
                            text-green-400">
                            {formatINR(client.totalPaid || 0)}
                            <span className="text-xs
                              font-normal text-slate-500
                              ml-1">
                              paid
                            </span>
                          </p>
                          {Number(client.totalPending || 0) > 0 && (
                            <p className="text-sm
                              font-bold text-yellow-400">
                              {formatINR(client.totalPending || 0)}
                              <span className="text-xs
                                font-normal text-slate-500
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
                              hover:text-blue-400
                              hover:bg-blue-500/10 rounded-xl
                              transition-colors">
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() =>
                              setDeleteConfirm(client.id)}
                            className="p-2 text-slate-400
                              hover:text-red-400
                              hover:bg-red-500/10 rounded-xl
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
              <div className="bg-slate-800 rounded-2xl
                border border-slate-700 p-6 sticky top-24">

                {/* CLOSE */}
                <div className="flex items-center
                  justify-between mb-6">
                  <h2 className="font-black text-white">
                    Client Details
                  </h2>
                  <button
                    onClick={() => setSelected(null)}
                    className="p-1.5 text-slate-400
                      hover:text-white
                      hover:bg-slate-700 rounded-lg
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
                  <h3 className="font-black text-white
                    text-lg">
                    {selected.name}
                  </h3>
                  {selected.status === 'overdue' && (
                    <span className="text-xs bg-red-500/20
                      text-red-400 border border-red-500/30 font-bold px-3 py-1
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
                        className="text-slate-500
                          flex-shrink-0" />
                      <span className="text-slate-300
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
                      value: selected.totalInvoices || 0
                    },
                    {
                      label: 'Last Invoice',
                      value: selected.lastInvoice || '—'
                    },
                    {
                      label: 'Total Paid',
                      value: formatINR(selected.totalPaid || 0),
                      green: true
                    },
                    {
                      label: 'Pending',
                      value: formatINR(
                        selected.totalPending || 0),
                      amber: Number(selected.totalPending || 0) > 0
                    },
                  ].map(s => (
                    <div key={s.label}
                      className="bg-slate-700/50 rounded-xl
                        p-3">
                      <p className="text-xs text-slate-400
                        font-medium mb-1">
                        {s.label}
                      </p>
                      <p className={`text-sm font-black
                        ${s.green
                          ? 'text-green-600'
                          : s.amber
                          ? 'text-amber-500'
                          : 'text-white'}`}>
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
                      rounded-xl hover:bg-blue-500
                      transition-colors">
                    <Plus size={16} />
                    Create Invoice
                  </a>
                  <button
                    onClick={() => openEdit(selected)}
                    className="w-full flex items-center
                      justify-center gap-2 border-2
                      border-slate-600 text-slate-300
                      text-sm font-semibold py-3
                      rounded-xl hover:border-blue-500
                      hover:text-blue-400 transition-all">
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
            className="absolute inset-0 bg-black/70
              backdrop-blur-md"
            onClick={() => setShowModal(false)}
          />
          <div className="absolute top-1/2 left-1/2
            -translate-x-1/2 -translate-y-1/2
            bg-slate-800 rounded-3xl shadow-2xl border border-slate-700
            w-full max-w-md p-8">

            {/* MODAL HEADER */}
            <div className="flex items-center
              justify-between mb-6">
              <h2 className="text-xl font-black
                text-white">
                {editClient
                  ? '✏️ Edit Client'
                  : '➕ Add Client'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-slate-400
                  hover:text-white
                  hover:bg-slate-700 rounded-xl
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
                    text-slate-300 mb-1.5 block">
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
                        bg-slate-700 border-2 border-slate-600
                        rounded-xl text-sm text-white
                        placeholder:text-slate-500
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
                className="py-3 border-2 border-slate-600
                  text-slate-300 font-semibold rounded-xl
                  hover:bg-slate-700 transition-colors
                  text-sm">
                Cancel
              </button>
              <button
                onClick={saveClient}
                disabled={!form.name || !form.email}
                className="py-3 bg-blue-600 text-white
                  font-bold rounded-xl hover:bg-blue-500
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
            className="absolute inset-0 bg-black/70
              backdrop-blur-md"
            onClick={() => setDeleteConfirm(null)}
          />
          <div className="absolute top-1/2 left-1/2
            -translate-x-1/2 -translate-y-1/2
            bg-slate-800 rounded-3xl shadow-2xl border border-slate-700
            w-full max-w-sm p-8 text-center">
            <div className="w-16 h-16 bg-red-500/20
              rounded-2xl flex items-center
              justify-center mx-auto mb-4">
              <Trash2 size={28}
                className="text-red-500" />
            </div>
            <h2 className="text-xl font-black
              text-white mb-2">
              Delete Client?
            </h2>
            <p className="text-slate-400 text-sm mb-6">
              This will delete the client and
              cannot be undone!
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="py-3 border-2 border-slate-600
                  text-slate-300 font-semibold rounded-xl
                  hover:bg-slate-700 transition-colors
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