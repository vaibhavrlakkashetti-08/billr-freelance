import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../supabase'
import {
  Globe, Mail, Phone, MapPin,
  ExternalLink, Star, Award,
  Briefcase, Code, Download,
  MessageCircle, ChevronRight,
  FileText, Check, Link as LinkIcon,
  AtSign, Share2, Plus, Save,
  RefreshCw, User, PenLine, X,
  Sparkles, Rocket, IndianRupee, Clock, Send
} from 'lucide-react'

/* ──────────────────────────────────────────────────────────── */
/*  BLANK FORM                                                  */
/* ──────────────────────────────────────────────────────────── */
const BLANK = {
  username: '',
  name: '',
  title: '',
  bio: '',
  location: '',
  email: '',
  phone: '',
  website: '',
  available: true,
  skills: '',       // comma-separated string in form, stored as text[] in DB
  tools: '',
  github_url: '',
  linkedin_url: '',
  twitter_url: '',
}

/* ──────────────────────────────────────────────────────────── */
/*  MAIN COMPONENT                                              */
/* ──────────────────────────────────────────────────────────── */
export default function Portfolio() {
  const { username: routeUsername } = useParams()   // undefined on /portfolio, string on /portfolio/:username
  const isPublicView = !!routeUsername

  const [portfolio, setPortfolio] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  // form states
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ ...BLANK })
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [isOwner, setIsOwner] = useState(false)

  // contact form
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' })
  const [sent, setSent] = useState(false)

  // hire modal
  const [showHireModal, setShowHireModal] = useState(false)
  const [hireForm, setHireForm] = useState({ name: '', email: '', work: '', budget: '', timeline: '' })

  const [activeSection, setActiveSection] = useState('about')

  const updateForm = (k, v) => setForm(p => ({ ...p, [k]: v }))

  /* ── FETCH portfolio ───────────────────────────────────── */
  const fetchPortfolio = useCallback(async () => {
    setLoading(true)
    setNotFound(false)

    if (isPublicView) {
      // Public: fetch by username
      const { data, error } = await supabase
        .from('portfolios')
        .select('*')
        .eq('username', routeUsername)
        .single()

      if (error || !data) { setNotFound(true); setLoading(false); return }
      setPortfolio(data)
      setIsOwner(false)

      // check if current user is the owner
      const { data: { user } } = await supabase.auth.getUser()
      if (user && data.user_id === user.id) setIsOwner(true)
    } else {
      // Protected: fetch by user_id
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      setIsOwner(true)

      const { data, error } = await supabase
        .from('portfolios')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (data) {
        setPortfolio(data)
      } else {
        // No portfolio yet — show create form
        setPortfolio(null)
        setEditing(true)
        // pre-fill email from auth
        setForm(f => ({ ...f, email: user.email || '' }))
      }
    }
    setLoading(false)
  }, [isPublicView, routeUsername])

  useEffect(() => {
    fetchPortfolio()
  }, [fetchPortfolio])

  /* ── SAVE / CREATE portfolio ───────────────────────────── */
  const savePortfolio = async () => {
    if (!form.name.trim()) {
      setSaveMsg('⚠️ Name is required'); setTimeout(() => setSaveMsg(''), 3000); return
    }
    if (!form.username.trim()) {
      setSaveMsg('⚠️ Username is required'); setTimeout(() => setSaveMsg(''), 3000); return
    }
    // only allow a-z, 0-9, hyphens
    if (!/^[a-z0-9-]+$/.test(form.username.trim())) {
      setSaveMsg('⚠️ Username: lowercase letters, numbers, hyphens only'); setTimeout(() => setSaveMsg(''), 3000); return
    }

    setSaving(true)
    setSaveMsg('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }

    const payload = {
      user_id: user.id,
      username: form.username.trim().toLowerCase(),
      name: form.name.trim(),
      title: form.title.trim(),
      bio: form.bio.trim(),
      location: form.location.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      website: form.website.trim(),
      available: form.available,
      skills: form.skills ? form.skills.split(',').map(s => s.trim()).filter(Boolean) : [],
      tools: form.tools ? form.tools.split(',').map(s => s.trim()).filter(Boolean) : [],
      github_url: form.github_url.trim(),
      linkedin_url: form.linkedin_url.trim(),
      twitter_url: form.twitter_url.trim(),
      updated_at: new Date().toISOString(),
    }

    let error
    if (portfolio?.id) {
      ; ({ error } = await supabase.from('portfolios').update(payload).eq('id', portfolio.id))
    } else {
      ; ({ error } = await supabase.from('portfolios').insert(payload))
    }

    if (error) {
      if (error.message?.includes('unique') || error.message?.includes('duplicate')) {
        setSaveMsg('❌ Username already taken, pick another.')
      } else {
        setSaveMsg('❌ ' + (error.message || 'Save failed'))
      }
    } else {
      setSaveMsg('✅ Saved!')
      setEditing(false)
      await fetchPortfolio()
    }
    setSaving(false)
    setTimeout(() => setSaveMsg(''), 3000)
  }

  /* ── START EDITING ─────────────────────────────────────── */
  const startEditing = () => {
    if (!portfolio) return
    setForm({
      username: portfolio.username || '',
      name: portfolio.name || '',
      title: portfolio.title || '',
      bio: portfolio.bio || '',
      location: portfolio.location || '',
      email: portfolio.email || '',
      phone: portfolio.phone || '',
      website: portfolio.website || '',
      available: portfolio.available ?? true,
      skills: Array.isArray(portfolio.skills) ? portfolio.skills.join(', ') : '',
      tools: Array.isArray(portfolio.tools) ? portfolio.tools.join(', ') : '',
      github_url: portfolio.github_url || '',
      linkedin_url: portfolio.linkedin_url || '',
      twitter_url: portfolio.twitter_url || '',
    })
    setEditing(true)
  }

  /* ── CONTACT SEND (demo) ───────────────────────────────── */
  const handleSend = () => {
    if (!contactForm.name || !contactForm.email || !contactForm.message) return
    setSent(true)
    setTimeout(() => setSent(false), 3000)
    setContactForm({ name: '', email: '', message: '' })
  }

  /* ── LOADING STATE ─────────────────────────────────────── */
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  /* ── NOT FOUND (public view) ───────────────────────────── */
  if (notFound) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <User size={36} className="text-slate-600" />
          </div>
          <h1 className="text-2xl font-black text-white mb-2">Portfolio Not Found</h1>
          <p className="text-slate-400 mb-6">No portfolio exists for <span className="text-blue-400 font-mono">/{routeUsername}</span></p>
          <a href="/" className="text-blue-400 font-semibold hover:text-blue-300 transition-colors text-sm">← Back to Home</a>
        </div>
      </div>
    )
  }

  /* ══════════════════════════════════════════════════════════
       CREATE / EDIT FORM
  ══════════════════════════════════════════════════════════ */
  if (editing) {
    const isNew = !portfolio?.id
    return (
      <div className="min-h-screen bg-slate-900">
        <div className="max-w-2xl mx-auto px-6 py-12">

          {/* Header */}
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-blue-500/30">
              {isNew ? <Sparkles size={28} className="text-white" /> : <PenLine size={28} className="text-white" />}
            </div>
            <h1 className="text-3xl font-black text-white mb-2">
              {isNew ? 'Create Your Portfolio' : 'Edit Portfolio'}
            </h1>
            <p className="text-slate-400 text-sm">
              {isNew
                ? 'Set up your public freelancer portfolio. It\u2019ll be live at /portfolio/your-username'
                : 'Update your portfolio details below'}
            </p>
          </div>

          {saveMsg && (
            <div className="mb-6 text-center text-sm font-semibold text-white bg-slate-800 rounded-xl px-4 py-3 border border-slate-700 animate-pulse">
              {saveMsg}
            </div>
          )}

          <div className="space-y-6">

            {/* Identity */}
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
              <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <User size={15} className="text-blue-400" /> Identity
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FieldInput label="Full Name *" placeholder="Your Name" value={form.name} onChange={v => updateForm('name', v)} />
                  <FieldInput label="Username *" placeholder="your-username" value={form.username} onChange={v => updateForm('username', v)}
                    hint="Lowercase, no spaces — your public URL" />
                </div>
                <FieldInput label="Professional Title" placeholder="Full Stack Developer" value={form.title} onChange={v => updateForm('title', v)} />
                <div>
                  <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Bio</label>
                  <textarea value={form.bio} onChange={e => updateForm('bio', e.target.value)}
                    placeholder="Tell clients about yourself…" rows={3}
                    className="w-full border-2 bg-slate-700 border-slate-600 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors resize-none" />
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
              <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <Mail size={15} className="text-blue-400" /> Contact Details
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <FieldInput label="Email" placeholder="you@example.com" value={form.email} onChange={v => updateForm('email', v)} />
                <FieldInput label="Phone" placeholder="+91 98765 43210" value={form.phone} onChange={v => updateForm('phone', v)} />
                <FieldInput label="Location" placeholder="Mumbai, India" value={form.location} onChange={v => updateForm('location', v)} />
                <FieldInput label="Website" placeholder="yoursite.com" value={form.website} onChange={v => updateForm('website', v)} />
              </div>
            </div>

            {/* Skills & Tools */}
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
              <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <Code size={15} className="text-blue-400" /> Skills & Tools
              </h2>
              <div className="space-y-4">
                <FieldInput label="Skills" placeholder="React, Node.js, UI/UX Design" value={form.skills} onChange={v => updateForm('skills', v)}
                  hint="Comma-separated" />
                <FieldInput label="Tools" placeholder="Figma, VS Code, GitHub" value={form.tools} onChange={v => updateForm('tools', v)}
                  hint="Comma-separated" />
              </div>
            </div>

            {/* Social Links */}
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
              <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <Share2 size={15} className="text-blue-400" /> Social Links
              </h2>
              <div className="space-y-4">
                <FieldInput label="GitHub URL" placeholder="https://github.com/yourname" value={form.github_url} onChange={v => updateForm('github_url', v)} />
                <FieldInput label="LinkedIn URL" placeholder="https://linkedin.com/in/yourname" value={form.linkedin_url} onChange={v => updateForm('linkedin_url', v)} />
                <FieldInput label="Twitter URL" placeholder="https://twitter.com/yourname" value={form.twitter_url} onChange={v => updateForm('twitter_url', v)} />
              </div>
            </div>

            {/* Availability */}
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-white mb-1">Available for Work</h2>
                  <p className="text-xs text-slate-400">Show a green badge on your public portfolio</p>
                </div>
                <button onClick={() => updateForm('available', !form.available)}
                  className={`w-12 h-7 rounded-full transition-colors flex items-center px-1 ${form.available ? 'bg-green-500' : 'bg-slate-600'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform shadow ${form.available ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              {!isNew && (
                <button onClick={() => setEditing(false)}
                  className="flex-1 flex items-center justify-center gap-2 border-2 border-slate-600 text-slate-300 font-semibold py-3.5 rounded-2xl hover:border-slate-500 transition-all text-sm">
                  <X size={16} /> Cancel
                </button>
              )}
              <button onClick={savePortfolio} disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-3.5 rounded-2xl hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/25 text-sm disabled:opacity-60">
                {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                {saving ? 'Saving…' : isNew ? 'Create Portfolio' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  /* ══════════════════════════════════════════════════════════
       PORTFOLIO VIEW (public or owner)
  ══════════════════════════════════════════════════════════ */
  const d = portfolio
  const skills = Array.isArray(d.skills) ? d.skills : []
  const tools = Array.isArray(d.tools) ? d.tools : []
  const initials = d.name ? d.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : '?'

  return (
    <div className="min-h-screen bg-slate-900">

      {/* NAVBAR */}
      <nav className="sticky top-0 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-sm">
              {initials}
            </div>
            <span className="font-black text-white">{d.name?.split(' ')[0]}</span>
          </div>

          <div className="hidden md:flex items-center gap-6">
            {['about', 'skills', 'contact'].map(s => (
              <button key={s} onClick={() => setActiveSection(s)}
                className={`text-sm font-semibold capitalize transition-colors
                  ${activeSection === s ? 'text-blue-400' : 'text-slate-400 hover:text-white'}`}>
                {s}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {isOwner && (
              <button onClick={startEditing}
                className="flex items-center gap-1.5 text-sm font-semibold text-slate-300 border border-slate-700 px-3 py-2 rounded-xl hover:border-blue-500 hover:text-blue-400 transition-all">
                <PenLine size={14} /> Edit
              </button>
            )}
            <button onClick={() => setShowHireModal(true)}
              className="flex items-center gap-1.5 bg-blue-600 text-white text-sm font-bold px-4 py-2 rounded-full hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/25 hover:-translate-y-0.5">
              <Briefcase size={14} /> Hire Me
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12">

        {/* ══ HERO ══ */}
        <div className="bg-slate-800 rounded-3xl border border-slate-700 p-8 md:p-12 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full -translate-y-32 translate-x-32 pointer-events-none" />

          <div className="relative flex flex-col md:flex-row items-center md:items-start gap-8">

            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-28 h-28 bg-blue-600 rounded-3xl flex items-center justify-center text-white font-black text-4xl shadow-xl shadow-blue-500/20">
                {initials}
              </div>
              {d.available && (
                <div className="absolute -bottom-2 -right-2 bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                  Available
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-black text-white mb-2">{d.name}</h1>
              {d.title && <p className="text-lg text-blue-400 font-semibold mb-3">{d.title}</p>}
              {d.bio && <p className="text-slate-400 leading-relaxed max-w-xl mb-6">{d.bio}</p>}

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-4 justify-center md:justify-start mb-6">
                {d.location && (
                  <div className="flex items-center gap-1.5 text-sm text-slate-400">
                    <MapPin size={14} className="text-slate-500" /> {d.location}
                  </div>
                )}
                {d.email && (
                  <div className="flex items-center gap-1.5 text-sm text-slate-400">
                    <Mail size={14} className="text-slate-500" /> {d.email}
                  </div>
                )}
                {d.website && (
                  <div className="flex items-center gap-1.5 text-sm text-slate-400">
                    <Globe size={14} className="text-slate-500" /> {d.website}
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                <button onClick={() => setShowHireModal(true)}
                  className="flex items-center gap-2 bg-blue-600 text-white font-bold px-6 py-3 rounded-full hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/25 hover:-translate-y-0.5 text-sm">
                  <Briefcase size={16} /> Hire Me
                </button>
                <button onClick={() => setActiveSection('contact')}
                  className="flex items-center gap-2 border-2 border-slate-600 text-slate-300 font-semibold px-6 py-3 rounded-full hover:border-blue-500 hover:text-blue-400 transition-all text-sm">
                  <MessageCircle size={16} /> Contact
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION TABS */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {['about', 'skills', 'contact'].map(s => (
            <button key={s} onClick={() => setActiveSection(s)}
              className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold capitalize transition-all
                ${activeSection === s
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                  : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600'}`}>
              {s === 'about' ? '👤 About'
                : s === 'skills' ? '🧠 Skills'
                  : '📩 Contact'}
            </button>
          ))}
        </div>

        {/* ══ ABOUT SECTION ══ */}
        {activeSection === 'about' && (
          <div className="space-y-6">
            {d.bio && (
              <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
                <h2 className="text-lg font-black text-white mb-3">About Me</h2>
                <p className="text-slate-400 leading-relaxed">{d.bio}</p>
              </div>
            )}

            {/* Social links */}
            {(d.github_url || d.linkedin_url || d.twitter_url) && (
              <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
                <h3 className="font-black text-white mb-4">Find Me Online</h3>
                <div className="flex gap-3">
                  {[
                    { icon: LinkIcon, label: 'GitHub', url: d.github_url },
                    { icon: AtSign, label: 'LinkedIn', url: d.linkedin_url },
                    { icon: Share2, label: 'Twitter', url: d.twitter_url },
                  ].filter(s => s.url).map(s => (
                    <a key={s.label} href={s.url} target="_blank" rel="noreferrer"
                      className="flex-1 flex flex-col items-center gap-2 p-4 bg-slate-700 rounded-2xl border border-slate-600 hover:border-blue-500 hover:bg-blue-600/10 transition-all group">
                      <s.icon size={22} className="text-slate-400 group-hover:text-blue-400 transition-colors" />
                      <span className="text-xs font-semibold text-slate-400 group-hover:text-blue-400 transition-colors">{s.label}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Availability */}
            {d.available && (
              <div className="bg-green-900/30 rounded-2xl border border-green-700/40 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  <h3 className="font-black text-green-400">Available for Work</h3>
                </div>
                <p className="text-sm text-green-300/80">
                  I'm currently taking new projects. Response time within 24 hours!
                </p>
              </div>
            )}
          </div>
        )}

        {/* ══ SKILLS SECTION ══ */}
        {activeSection === 'skills' && (
          <div className="space-y-6">
            {skills.length > 0 && (
              <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
                <h2 className="text-lg font-black text-white mb-4">Skills</h2>
                <div className="flex flex-wrap gap-3">
                  {skills.map(skill => (
                    <span key={skill}
                      className="bg-blue-600/20 text-blue-300 border border-blue-500/30 font-semibold text-sm px-4 py-2 rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {tools.length > 0 && (
              <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
                <h3 className="font-black text-white mb-4">🛠️ Tools & Technologies</h3>
                <div className="flex flex-wrap gap-3">
                  {tools.map(tool => (
                    <span key={tool}
                      className="bg-slate-700 border border-slate-600 text-slate-300 font-semibold text-sm px-4 py-2 rounded-full">
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {skills.length === 0 && tools.length === 0 && (
              <div className="text-center py-16 text-slate-500">
                <Code size={36} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm font-semibold">No skills added yet</p>
                {isOwner && <p className="text-xs mt-1">Edit your portfolio to add skills</p>}
              </div>
            )}
          </div>
        )}

        {/* ══ CONTACT SECTION ══ */}
        {activeSection === 'contact' && (
          <div className="grid md:grid-cols-2 gap-8">

            {/* Form */}
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8">
              <h3 className="font-black text-white mb-6">Send a Message 📩</h3>

              {sent ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-green-900/40 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check size={32} className="text-green-400" />
                  </div>
                  <h3 className="text-xl font-black text-white mb-2">Message Sent! 🎉</h3>
                  <p className="text-slate-400 text-sm">I'll get back to you within 24 hours</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {[
                    { key: 'name', label: 'Your Name', placeholder: 'John Doe', type: 'text' },
                    { key: 'email', label: 'Email Address', placeholder: 'john@example.com', type: 'email' },
                  ].map(field => (
                    <div key={field.key}>
                      <label className="text-xs font-bold text-slate-400 mb-1.5 block">{field.label}</label>
                      <input type={field.type} value={contactForm[field.key]}
                        onChange={e => setContactForm(p => ({ ...p, [field.key]: e.target.value }))}
                        placeholder={field.placeholder}
                        className="w-full border-2 bg-slate-700 border-slate-600 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors" />
                    </div>
                  ))}
                  <div>
                    <label className="text-xs font-bold text-slate-400 mb-1.5 block">Message</label>
                    <textarea value={contactForm.message}
                      onChange={e => setContactForm(p => ({ ...p, message: e.target.value }))}
                      placeholder="Tell me about your project…" rows={4}
                      className="w-full border-2 bg-slate-700 border-slate-600 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors resize-none" />
                  </div>
                  <button onClick={handleSend}
                    disabled={!contactForm.name || !contactForm.email || !contactForm.message}
                    className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/25 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    <MessageCircle size={16} /> Send Message
                  </button>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="space-y-6">
              <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
                <h3 className="font-black text-white mb-4">Contact Info</h3>
                <div className="space-y-4">
                  {[
                    { icon: Mail, label: 'Email', value: d.email },
                    { icon: Phone, label: 'Phone', value: d.phone },
                    { icon: MapPin, label: 'Location', value: d.location },
                  ].filter(i => i.value).map(item => (
                    <div key={item.label} className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-700 rounded-xl flex items-center justify-center flex-shrink-0">
                        <item.icon size={18} className="text-blue-400" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-medium">{item.label}</p>
                        <p className="text-sm font-bold text-white">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {d.available && (
                <div className="bg-green-900/30 rounded-2xl border border-green-700/40 p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                    <h3 className="font-black text-green-400">Available for Work</h3>
                  </div>
                  <p className="text-sm text-green-300/80">
                    I'm currently taking new projects. Response time within 24 hours!
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <footer className="border-t border-slate-800 mt-12 py-8 bg-slate-900">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">© 2026 {d.name} • Built with BILLR</p>
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-blue-400" />
            <a href="/" className="text-sm text-blue-400 font-semibold hover:underline">
              Create your portfolio with BILLR
            </a>
          </div>
        </div>
      </footer>

      {/* ══════════════════════════════════════════════════════════
           HIRE MODAL
      ══════════════════════════════════════════════════════════ */}
      {showHireModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={() => setShowHireModal(false)}>

          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          {/* Modal */}
          <div className="relative bg-slate-800 border border-slate-700 rounded-3xl w-full max-w-lg p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}>

            {/* Close */}
            <button onClick={() => setShowHireModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white rounded-xl hover:bg-slate-700 transition-colors">
              <X size={18} />
            </button>

            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/25">
                <Briefcase size={24} className="text-white" />
              </div>
              <h2 className="text-2xl font-black text-white mb-1">Hire {d.name?.split(' ')[0]}</h2>
              <p className="text-slate-400 text-sm">Fill in the details and we'll open Gmail with a ready-to-send proposal</p>
            </div>

            {/* Form */}
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Your Name *</label>
                <input type="text" value={hireForm.name} placeholder="Your full name"
                  onChange={e => setHireForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full border-2 bg-slate-700 border-slate-600 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors" />
              </div>

              {/* Email */}
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Your Email *</label>
                <input type="email" value={hireForm.email} placeholder="you@example.com"
                  onChange={e => setHireForm(p => ({ ...p, email: e.target.value }))}
                  className="w-full border-2 bg-slate-700 border-slate-600 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors" />
              </div>

              {/* Work description */}
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1.5 block flex items-center gap-1.5">
                  <FileText size={12} /> Work Description *
                </label>
                <textarea value={hireForm.work} placeholder="Describe the project or task you need help with…" rows={3}
                  onChange={e => setHireForm(p => ({ ...p, work: e.target.value }))}
                  className="w-full border-2 bg-slate-700 border-slate-600 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors resize-none" />
              </div>

              {/* Budget & Timeline row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 mb-1.5 block flex items-center gap-1.5">
                    <IndianRupee size={12} /> Budget (₹) *
                  </label>
                  <input type="text" value={hireForm.budget} placeholder="e.g. ₹25,000"
                    onChange={e => setHireForm(p => ({ ...p, budget: e.target.value }))}
                    className="w-full border-2 bg-slate-700 border-slate-600 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 mb-1.5 block flex items-center gap-1.5">
                    <Clock size={12} /> Timeline *
                  </label>
                  <input type="text" value={hireForm.timeline} placeholder="e.g. 2 weeks"
                    onChange={e => setHireForm(p => ({ ...p, timeline: e.target.value }))}
                    className="w-full border-2 bg-slate-700 border-slate-600 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors" />
                </div>
              </div>

              {/* Submit → Gmail */}
              <button
                disabled={!hireForm.name.trim() || !hireForm.email.trim() || !hireForm.work.trim() || !hireForm.budget.trim() || !hireForm.timeline.trim()}
                onClick={() => {
                  const to = d.email || ''
                  const subject = encodeURIComponent(`Hiring Proposal from ${hireForm.name}`)
                  const body = encodeURIComponent(
`Hi ${d.name},

I'd like to hire you for a project. Here are the details:

——————————————————
PROJECT DETAILS
——————————————————

Work Description:
${hireForm.work}

Budget: ${hireForm.budget}

Timeline: ${hireForm.timeline}

——————————————————

Please let me know if you're interested and available.

Looking forward to hearing from you!

Best regards,
${hireForm.name}
${hireForm.email}`
                  )
                  window.open(`https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(to)}&su=${subject}&body=${body}`, '_blank')
                  setShowHireModal(false)
                  setHireForm({ name: '', email: '', work: '', budget: '', timeline: '' })
                }}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/25 text-sm mt-2 disabled:opacity-40 disabled:cursor-not-allowed">
                <Send size={16} />
                Open Gmail & Send Proposal
              </button>

              <p className="text-xs text-slate-500 text-center">
                This will open Gmail with a pre-filled hiring email
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ──────────────────────────────────────────────────────────── */
/*  FIELD INPUT COMPONENT                                       */
/* ──────────────────────────────────────────────────────────── */
function FieldInput({ label, placeholder, value, onChange, hint, type = 'text' }) {
  return (
    <div>
      <label className="text-xs font-semibold text-slate-400 mb-1.5 block">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full border-2 bg-slate-700 border-slate-600 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors" />
      {hint && <p className="text-xs text-slate-500 mt-1">{hint}</p>}
    </div>
  )
}