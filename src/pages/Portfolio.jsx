import { useState } from 'react'
import {
    Globe, Mail, Phone, MapPin,
    ExternalLink, Star, Award,
    Briefcase, Code, Download,
    MessageCircle, ChevronRight,
    FileText, Check, Link,
    AtSign, Share2
  } from 'lucide-react'

const PORTFOLIO_DATA = {
  name: 'Vaibhav Lakkashetti',
  title: 'Full Stack Developer & UI Designer',
  bio: 'Passionate developer building modern web applications and beautiful user interfaces. I help startups and businesses bring their digital ideas to life.',
  location: 'Belagavi, Karnataka, India',
  email: 'vaibhav@example.com',
  phone: '+91 98765 43210',
  website: 'billr-freelance.vercel.app',
  avatar: 'VL',
  available: true,
  stats: [
    { label: 'Projects Done', value: '24+' },
    { label: 'Happy Clients', value: '12+' },
    { label: 'Years Experience', value: '3+' },
    { label: 'Reviews', value: '4.9★' },
  ],
  skills: [
    { name: 'React', level: 95 },
    { name: 'UI/UX Design', level: 88 },
    { name: 'Node.js', level: 80 },
    { name: 'Tailwind CSS', level: 92 },
    { name: 'Supabase', level: 75 },
    { name: 'Figma', level: 85 },
  ],
  tools: [
    'React', 'Vite', 'Tailwind',
    'Supabase', 'Node.js', 'Figma',
    'GitHub', 'VS Code', 'Cursor',
  ],
  services: [
    {
      icon: Code,
      title: 'Web Development',
      desc: 'Modern React apps with clean code and great performance',
      price: '₹15,000+'
    },
    {
      icon: Globe,
      title: 'Landing Pages',
      desc: 'High converting landing pages that turn visitors to clients',
      price: '₹8,000+'
    },
    {
      icon: Briefcase,
      title: 'SaaS Products',
      desc: 'Full stack SaaS applications from idea to launch',
      price: '₹50,000+'
    },
  ],
  projects: [
    {
      id: 1,
      title: 'BILLR — Invoice App',
      category: 'SaaS',
      desc: 'AI-powered invoicing and portfolio platform for Indian freelancers with GST support.',
      tags: ['React', 'Supabase', 'Tailwind'],
      color: 'blue',
      link: '#'
    },
    {
      id: 2,
      title: 'Second Brain App',
      category: 'Productivity',
      desc: 'AI knowledge management app to capture, organize and recall notes and documents.',
      tags: ['React', 'OpenAI', 'Supabase'],
      color: 'purple',
      link: '#'
    },
    {
      id: 3,
      title: 'E-Commerce Dashboard',
      category: 'Dashboard',
      desc: 'Complete admin dashboard for managing products, orders and analytics.',
      tags: ['React', 'Node.js', 'MongoDB'],
      color: 'green',
      link: '#'
    },
    {
      id: 4,
      title: 'Restaurant Landing Page',
      category: 'Landing Page',
      desc: 'Beautiful restaurant website with online menu and reservation system.',
      tags: ['HTML', 'CSS', 'JavaScript'],
      color: 'orange',
      link: '#'
    },
  ],
  testimonials: [
    {
      name: 'Rahul Sharma',
      role: 'Founder, TechStart India',
      text: 'Vaibhav delivered our project on time and the quality was outstanding. Highly recommended!',
      rating: 5,
      avatar: 'RS'
    },
    {
      name: 'Priya Mehta',
      role: 'CEO, Design Studio',
      text: 'Amazing work on our landing page. Our conversions increased by 40% after launch!',
      rating: 5,
      avatar: 'PM'
    },
    {
      name: 'Amit Kumar',
      role: 'CTO, Startup Hub',
      text: 'Very professional and communicates well. Will definitely hire again for future projects.',
      rating: 5,
      avatar: 'AK'
    },
  ]
}

const colorMap = {
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  purple: 'bg-purple-50 text-purple-700 border-purple-200',
  green: 'bg-green-50 text-green-700 border-green-200',
  orange: 'bg-orange-50 text-orange-700 border-orange-200',
}

const dotMap = {
  blue: 'bg-blue-500',
  purple: 'bg-purple-500',
  green: 'bg-green-500',
  orange: 'bg-orange-500',
}

export default function Portfolio() {
  const [activeSection, setActiveSection] = useState('work')
  const [contactForm, setContactForm] = useState({
    name: '', email: '', message: ''
  })
  const [sent, setSent] = useState(false)

  const d = PORTFOLIO_DATA

  const handleSend = () => {
    if (!contactForm.name ||
      !contactForm.email ||
      !contactForm.message) return
    setSent(true)
    setTimeout(() => setSent(false), 3000)
    setContactForm({ name: '', email: '', message: '' })
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* NAVBAR */}
      <nav className="sticky top-0 bg-white/80
        backdrop-blur-md border-b border-slate-100
        z-50">
        <div className="max-w-5xl mx-auto px-6
          h-16 flex items-center justify-between">

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600
              rounded-lg flex items-center justify-center
              text-white font-black text-sm">
              {d.avatar}
            </div>
            <span className="font-black text-slate-800">
              {d.name.split(' ')[0]}
            </span>
          </div>

          <div className="hidden md:flex items-center
            gap-6">
            {['work', 'services', 'skills',
              'reviews', 'contact'].map(s => (
              <button key={s}
                onClick={() => setActiveSection(s)}
                className={`text-sm font-semibold
                  capitalize transition-colors
                  ${activeSection === s
                    ? 'text-blue-600'
                    : 'text-slate-500 hover:text-slate-800'
                  }`}>
                {s}
              </button>
            ))}
          </div>

          <button
            onClick={() => setActiveSection('contact')}
            className="bg-blue-600 text-white text-sm
              font-bold px-4 py-2 rounded-full
              hover:bg-blue-700 transition-all
              shadow-lg shadow-blue-200
              hover:-translate-y-0.5">
            Hire Me
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12">

        {/* HERO SECTION */}
        <div className="bg-white rounded-3xl
          border border-slate-100 p-8 md:p-12
          mb-8 relative overflow-hidden">

          {/* BG DECORATION */}
          <div className="absolute top-0 right-0
            w-64 h-64 bg-blue-50 rounded-full
            -translate-y-32 translate-x-32
            pointer-events-none" />

          <div className="relative flex flex-col
            md:flex-row items-center md:items-start
            gap-8">

            {/* AVATAR */}
            <div className="relative flex-shrink-0">
              <div className="w-28 h-28 bg-blue-600
                rounded-3xl flex items-center
                justify-center text-white font-black
                text-4xl shadow-xl shadow-blue-200">
                {d.avatar}
              </div>
              {d.available && (
                <div className="absolute -bottom-2
                  -right-2 bg-green-500 text-white
                  text-xs font-bold px-2.5 py-1
                  rounded-full flex items-center gap-1
                  shadow-md">
                  <div className="w-1.5 h-1.5
                    bg-white rounded-full
                    animate-pulse" />
                  Available
                </div>
              )}
            </div>

            {/* INFO */}
            <div className="flex-1 text-center
              md:text-left">
              <h1 className="text-3xl md:text-4xl
                font-black text-slate-900 mb-2">
                {d.name}
              </h1>
              <p className="text-lg text-blue-600
                font-semibold mb-3">
                {d.title}
              </p>
              <p className="text-slate-500 leading-relaxed
                max-w-xl mb-6">
                {d.bio}
              </p>

              {/* META */}
              <div className="flex flex-wrap
                items-center gap-4 justify-center
                md:justify-start mb-6">
                {[
                  { icon: MapPin, text: d.location },
                  { icon: Mail, text: d.email },
                  { icon: Globe, text: d.website },
                ].map(item => (
                  <div key={item.text}
                    className="flex items-center gap-1.5
                      text-sm text-slate-500">
                    <item.icon size={14}
                      className="text-slate-400" />
                    {item.text}
                  </div>
                ))}
              </div>

              {/* BUTTONS */}
              <div className="flex flex-wrap gap-3
                justify-center md:justify-start">
                <button
                  onClick={() =>
                    setActiveSection('contact')}
                  className="flex items-center gap-2
                    bg-blue-600 text-white font-bold
                    px-6 py-3 rounded-full
                    hover:bg-blue-700 transition-all
                    shadow-lg shadow-blue-200
                    hover:-translate-y-0.5 text-sm">
                  <MessageCircle size={16} />
                  Get In Touch
                </button>
                <button className="flex items-center
                  gap-2 border-2 border-slate-200
                  text-slate-700 font-semibold px-6
                  py-3 rounded-full hover:border-blue-300
                  hover:text-blue-600 transition-all
                  text-sm">
                  <Download size={16} />
                  Download CV
                </button>
              </div>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-2 gap-3
              flex-shrink-0">
              {d.stats.map(stat => (
                <div key={stat.label}
                  className="bg-slate-50 rounded-2xl
                    p-4 text-center border
                    border-slate-100">
                  <p className="text-2xl font-black
                    text-blue-600">
                    {stat.value}
                  </p>
                  <p className="text-xs text-slate-500
                    font-medium mt-1">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION TABS */}
        <div className="flex gap-2 mb-8
          overflow-x-auto pb-2 scrollbar-hide">
          {['work', 'services', 'skills',
            'reviews', 'contact'].map(s => (
            <button key={s}
              onClick={() => setActiveSection(s)}
              className={`flex-shrink-0 px-5 py-2.5
                rounded-full text-sm font-semibold
                capitalize transition-all
                ${activeSection === s
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300'
                }`}>
              {s === 'work' ? '💼 Work'
                : s === 'services' ? '⚡ Services'
                : s === 'skills' ? '🧠 Skills'
                : s === 'reviews' ? '⭐ Reviews'
                : '📩 Contact'}
            </button>
          ))}
        </div>

        {/* ═══ WORK SECTION ═══ */}
        {activeSection === 'work' && (
          <div>
            <h2 className="text-2xl font-black
              text-slate-800 mb-6">
              Recent Projects
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {d.projects.map(project => (
                <div key={project.id}
                  className="bg-white rounded-2xl
                    border border-slate-100 p-6
                    hover:shadow-lg transition-all
                    hover:-translate-y-1 group">

                  {/* TOP */}
                  <div className="flex items-start
                    justify-between mb-4">
                    <div className={`w-12 h-12
                      rounded-2xl flex items-center
                      justify-center border-2
                      ${colorMap[project.color]}`}>
                      <div className={`w-3 h-3
                        rounded-full
                        ${dotMap[project.color]}`} />
                    </div>
                    <div className="flex items-center
                      gap-2">
                      <span className="text-xs
                        bg-slate-100 text-slate-600
                        font-semibold px-3 py-1
                        rounded-full">
                        {project.category}
                      </span>
                      <a href={project.link}
                        className="p-2 text-slate-400
                          hover:text-blue-600
                          hover:bg-blue-50 rounded-xl
                          transition-colors">
                        <ExternalLink size={16} />
                      </a>
                    </div>
                  </div>

                  <h3 className="text-lg font-black
                    text-slate-800 mb-2">
                    {project.title}
                  </h3>
                  <p className="text-sm text-slate-500
                    leading-relaxed mb-4">
                    {project.desc}
                  </p>

                  {/* TAGS */}
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map(tag => (
                      <span key={tag}
                        className="text-xs bg-slate-100
                          text-slate-600 font-semibold
                          px-3 py-1 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ SERVICES SECTION ═══ */}
        {activeSection === 'services' && (
          <div>
            <h2 className="text-2xl font-black
              text-slate-800 mb-6">
              What I Offer
            </h2>
            <div className="grid md:grid-cols-3 gap-6
              mb-8">
              {d.services.map(service => (
                <div key={service.title}
                  className="bg-white rounded-2xl
                    border border-slate-100 p-6
                    hover:shadow-lg transition-all
                    hover:-translate-y-1">
                  <div className="w-12 h-12 bg-blue-50
                    rounded-2xl flex items-center
                    justify-center mb-4">
                    <service.icon size={24}
                      className="text-blue-600" />
                  </div>
                  <h3 className="text-lg font-black
                    text-slate-800 mb-2">
                    {service.title}
                  </h3>
                  <p className="text-sm text-slate-500
                    leading-relaxed mb-4">
                    {service.desc}
                  </p>
                  <div className="flex items-center
                    justify-between">
                    <span className="text-blue-600
                      font-black">
                      {service.price}
                    </span>
                    <button
                      onClick={() =>
                        setActiveSection('contact')}
                      className="text-sm text-blue-600
                        font-semibold flex items-center
                        gap-1 hover:gap-2 transition-all">
                      Hire me
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* TOOLS */}
            <div className="bg-white rounded-2xl
              border border-slate-100 p-6">
              <h3 className="font-black text-slate-800
                mb-4">
                🛠️ Tools & Technologies
              </h3>
              <div className="flex flex-wrap gap-3">
                {d.tools.map(tool => (
                  <span key={tool}
                    className="bg-slate-50 border
                      border-slate-200 text-slate-700
                      font-semibold text-sm px-4 py-2
                      rounded-full">
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══ SKILLS SECTION ═══ */}
        {activeSection === 'skills' && (
          <div>
            <h2 className="text-2xl font-black
              text-slate-800 mb-6">
              Skills & Expertise
            </h2>
            <div className="bg-white rounded-2xl
              border border-slate-100 p-8">
              <div className="space-y-6">
                {d.skills.map(skill => (
                  <div key={skill.name}>
                    <div className="flex justify-between
                      mb-2">
                      <span className="text-sm
                        font-bold text-slate-800">
                        {skill.name}
                      </span>
                      <span className="text-sm
                        font-bold text-blue-600">
                        {skill.level}%
                      </span>
                    </div>
                    <div className="h-2.5 bg-slate-100
                      rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600
                          rounded-full transition-all
                          duration-1000"
                        style={{ width: `${skill.level}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* ACHIEVEMENTS */}
              <div className="grid grid-cols-3 gap-4
                mt-8 pt-8 border-t border-slate-100">
                {[
                  {
                    icon: Award,
                    label: 'Top Rated',
                    sub: 'On Fiverr'
                  },
                  {
                    icon: Star,
                    label: '4.9/5 Rating',
                    sub: '20+ reviews'
                  },
                  {
                    icon: Check,
                    label: '100% Complete',
                    sub: 'Job success'
                  },
                ].map(a => (
                  <div key={a.label}
                    className="text-center p-4
                      bg-slate-50 rounded-2xl">
                    <a.icon size={24}
                      className="text-blue-600
                        mx-auto mb-2" />
                    <p className="text-sm font-black
                      text-slate-800">
                      {a.label}
                    </p>
                    <p className="text-xs text-slate-500">
                      {a.sub}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══ REVIEWS SECTION ═══ */}
        {activeSection === 'reviews' && (
          <div>
            <div className="flex items-center
              justify-between mb-6">
              <h2 className="text-2xl font-black
                text-slate-800">
                Client Reviews
              </h2>
              <div className="flex items-center gap-2
                bg-yellow-50 border border-yellow-200
                px-4 py-2 rounded-full">
                <Star size={16}
                  className="text-yellow-500
                    fill-yellow-500" />
                <span className="font-black text-yellow-700">
                  4.9
                </span>
                <span className="text-yellow-600 text-sm">
                  (20 reviews)
                </span>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {d.testimonials.map((t, i) => (
                <div key={i}
                  className="bg-white rounded-2xl
                    border border-slate-100 p-6
                    hover:shadow-lg transition-all">

                  {/* STARS */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(t.rating)].map((_, j) => (
                      <Star key={j} size={16}
                        className="text-yellow-400
                          fill-yellow-400" />
                    ))}
                  </div>

                  <p className="text-slate-600 text-sm
                    leading-relaxed mb-6 italic">
                    "{t.text}"
                  </p>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10
                      bg-blue-600 rounded-xl
                      flex items-center justify-center
                      text-white font-bold text-sm">
                      {t.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-bold
                        text-slate-800">
                        {t.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {t.role}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ CONTACT SECTION ═══ */}
        {activeSection === 'contact' && (
          <div>
            <h2 className="text-2xl font-black
              text-slate-800 mb-6">
              Get In Touch
            </h2>

            <div className="grid md:grid-cols-2 gap-8">

              {/* LEFT — FORM */}
              <div className="bg-white rounded-2xl
                border border-slate-100 p-8">
                <h3 className="font-black text-slate-800
                  mb-6">
                  Send a Message 📩
                </h3>

                {sent ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16
                      bg-green-100 rounded-full
                      flex items-center justify-center
                      mx-auto mb-4">
                      <Check size={32}
                        className="text-green-600" />
                    </div>
                    <h3 className="text-xl font-black
                      text-slate-800 mb-2">
                      Message Sent! 🎉
                    </h3>
                    <p className="text-slate-500 text-sm">
                      I'll get back to you within 24 hours
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {[
                      {
                        key: 'name',
                        label: 'Your Name',
                        placeholder: 'John Doe',
                        type: 'text'
                      },
                      {
                        key: 'email',
                        label: 'Email Address',
                        placeholder: 'john@example.com',
                        type: 'email'
                      },
                    ].map(field => (
                      <div key={field.key}>
                        <label className="text-xs
                          font-bold text-slate-600
                          mb-1.5 block">
                          {field.label}
                        </label>
                        <input
                          type={field.type}
                          value={contactForm[field.key]}
                          onChange={e => setContactForm(
                            p => ({
                              ...p,
                              [field.key]: e.target.value
                            }))}
                          placeholder={field.placeholder}
                          className="w-full border-2
                            border-slate-200 rounded-xl
                            px-4 py-3 text-sm
                            text-slate-800
                            placeholder:text-slate-400
                            focus:outline-none
                            focus:border-blue-500
                            transition-colors"
                        />
                      </div>
                    ))}

                    <div>
                      <label className="text-xs font-bold
                        text-slate-600 mb-1.5 block">
                        Message
                      </label>
                      <textarea
                        value={contactForm.message}
                        onChange={e => setContactForm(
                          p => ({
                            ...p,
                            message: e.target.value
                          }))}
                        placeholder="Tell me about your project..."
                        rows={4}
                        className="w-full border-2
                          border-slate-200 rounded-xl
                          px-4 py-3 text-sm
                          text-slate-800
                          placeholder:text-slate-400
                          focus:outline-none
                          focus:border-blue-500
                          transition-colors resize-none"
                      />
                    </div>

                    <button
                      onClick={handleSend}
                      disabled={!contactForm.name ||
                        !contactForm.email ||
                        !contactForm.message}
                      className="w-full bg-blue-600
                        text-white font-bold py-3.5
                        rounded-xl hover:bg-blue-700
                        transition-all shadow-lg
                        shadow-blue-200 text-sm
                        disabled:opacity-50
                        disabled:cursor-not-allowed
                        flex items-center
                        justify-center gap-2">
                      <MessageCircle size={16} />
                      Send Message
                    </button>
                  </div>
                )}
              </div>

              {/* RIGHT — INFO */}
              <div className="space-y-6">

                {/* CONTACT CARDS */}
                <div className="bg-white rounded-2xl
                  border border-slate-100 p-6">
                  <h3 className="font-black text-slate-800
                    mb-4">
                    Contact Info
                  </h3>
                  <div className="space-y-4">
                    {[
                      {
                        icon: Mail,
                        label: 'Email',
                        value: d.email,
                        color: 'blue'
                      },
                      {
                        icon: Phone,
                        label: 'Phone',
                        value: d.phone,
                        color: 'green'
                      },
                      {
                        icon: MapPin,
                        label: 'Location',
                        value: d.location,
                        color: 'purple'
                      },
                    ].map(item => (
                      <div key={item.label}
                        className="flex items-center
                          gap-4">
                        <div className={`w-10 h-10
                          bg-${item.color}-50 rounded-xl
                          flex items-center justify-center
                          flex-shrink-0`}>
                          <item.icon size={18}
                            className={`text-${item.color}-600`}
                          />
                        </div>
                        <div>
                          <p className="text-xs
                            text-slate-500 font-medium">
                            {item.label}
                          </p>
                          <p className="text-sm font-bold
                            text-slate-800">
                            {item.value}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SOCIAL */}
                <div className="bg-white rounded-2xl
                  border border-slate-100 p-6">
                  <h3 className="font-black text-slate-800
                    mb-4">
                    Find Me Online
                  </h3>
                  <div className="flex gap-3">
                  {[
  { icon: Link, label: 'GitHub', color: 'slate' },
  { icon: AtSign, label: 'LinkedIn', color: 'blue' },
  { icon: Share2, label: 'Twitter', color: 'sky' },
                    ].map(s => (
                      <button key={s.label}
                        className="flex-1 flex flex-col
                          items-center gap-2 p-4
                          bg-slate-50 rounded-2xl
                          border border-slate-200
                          hover:border-blue-300
                          hover:bg-blue-50
                          transition-all group">
                        <s.icon size={22}
                          className="text-slate-600
                            group-hover:text-blue-600
                            transition-colors" />
                        <span className="text-xs
                          font-semibold text-slate-600
                          group-hover:text-blue-600
                          transition-colors">
                          {s.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* AVAILABILITY */}
                <div className="bg-green-50 rounded-2xl
                  border border-green-200 p-6">
                  <div className="flex items-center
                    gap-3 mb-2">
                    <div className="w-3 h-3
                      bg-green-500 rounded-full
                      animate-pulse" />
                    <h3 className="font-black
                      text-green-800">
                      Available for Work
                    </h3>
                  </div>
                  <p className="text-sm text-green-700">
                    I'm currently taking new projects.
                    Response time within 24 hours!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <footer className="border-t border-slate-200
        bg-white mt-12 py-8">
        <div className="max-w-5xl mx-auto px-6
          flex flex-col md:flex-row items-center
          justify-between gap-4">
          <p className="text-slate-500 text-sm">
            © 2026 {d.name} • Built with BILLR
          </p>
          <div className="flex items-center gap-2">
            <FileText size={16}
              className="text-blue-600" />
            <a href="/invoice/new"
              className="text-sm text-blue-600
                font-semibold hover:underline">
              Create your portfolio with BILLR
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}