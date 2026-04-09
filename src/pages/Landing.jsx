import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Users, BarChart3, Globe, Shield, Zap, ArrowRight, Check, Star, ChevronLeft, ChevronRight } from 'lucide-react'

/* ─── SCROLL Y ───────────────────────────────────────── */
function useScrollY() {
  const [y, setY] = useState(0)
  useEffect(() => {
    const h = () => setY(window.scrollY)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])
  return y
}

/* ─── INTERSECTION REVEAL ────────────────────────────── */
function useReveal(threshold = 0.12) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [threshold])
  return [ref, visible]
}

/* ─── REVEAL WRAPPER ─────────────────────────────────── */
function Reveal({ children, delay = 0, direction = 'up', className = '' }) {
  const [ref, visible] = useReveal()
  const dirs = { up: 'translateY(40px)', left: 'translateX(-40px)', right: 'translateX(40px)', scale: 'scale(0.92)', none: 'none' }
  return (
    <div ref={ref} className={className} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'none' : dirs[direction],
      transition: `opacity 0.9s cubic-bezier(.16,1,.3,1) ${delay}ms, transform 0.9s cubic-bezier(.16,1,.3,1) ${delay}ms`,
      willChange: 'opacity, transform',
    }}>
      {children}
    </div>
  )
}

/* ─── ANIMATED COUNTER ───────────────────────────────── */
function Counter({ end, prefix = '', suffix = '' }) {
  const [ref, visible] = useReveal(0.5)
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!visible) return
    let cur = 0
    const step = end / 60
    const t = setInterval(() => {
      cur += step
      if (cur >= end) { setCount(end); clearInterval(t) }
      else setCount(Math.floor(cur))
    }, 25)
    return () => clearInterval(t)
  }, [visible, end])
  return <span ref={ref}>{prefix}{count.toLocaleString('en-IN')}{suffix}</span>
}

/* ─── TESTIMONIAL CAROUSEL ───────────────────────────── */
const testimonials = [
  { name: 'Priya Sharma',  role: 'UI/UX Designer · Mumbai',        text: 'BILLR transformed how I bill clients. GST split, PDF download, UPI link — everything in one clean place. My collection rate went from 70% to 98%.', rating: 5 },
  { name: 'Arjun Mehta',   role: 'Full Stack Developer · Bengaluru',text: 'The portfolio page alone landed me two enterprise clients. Invoicing is effortless. I went from chasing payments to clients paying within hours.', rating: 5 },
  { name: 'Neha Patel',    role: 'Content Strategist · Ahmedabad', text: 'Finally a product that understands the Indian freelancer. UPI on invoices means I get paid same day. My revenue doubled in the first quarter.', rating: 5 },
  { name: 'Rohit Das',     role: 'Motion Designer · Kolkata',       text: 'The income analytics revealed my most profitable clients. I restructured my pricing, dropped the low-value work, and tripled my effective hourly rate.', rating: 5 },
  { name: 'Sneha Iyer',    role: 'Brand Consultant · Chennai',      text: 'Professional branded invoices changed how clients perceive me. No more rate negotiations. They see the invoice, they pay. Clean and simple.', rating: 5 },
]

function Carousel() {
  const [active, setActive] = useState(0)
  const startX = useRef(0)
  const [dragging, setDragging] = useState(false)
  const prev = () => setActive(a => (a - 1 + testimonials.length) % testimonials.length)
  const next = () => setActive(a => (a + 1) % testimonials.length)
  useEffect(() => { const t = setInterval(next, 5000); return () => clearInterval(t) }, [])

  return (
    <div className="relative"
      onMouseDown={e => { startX.current = e.clientX; setDragging(true) }}
      onMouseUp={e => { if (!dragging) return; setDragging(false); const dx = e.clientX - startX.current; if (dx < -40) next(); if (dx > 40) prev() }}
      onMouseLeave={() => setDragging(false)}
      style={{ cursor: dragging ? 'grabbing' : 'grab', userSelect: 'none' }}>

      <div style={{ overflow: 'hidden' }}>
        <div style={{ display: 'flex', transform: `translateX(-${active * 100}%)`, transition: 'transform 0.8s cubic-bezier(.16,1,.3,1)' }}>
          {testimonials.map((t, i) => (
            <div key={i} style={{ minWidth: '100%', padding: '0 16px' }}>
              <div style={{
                maxWidth: 680, margin: '0 auto',
                background: 'rgba(255,255,255,0.035)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 28, padding: '48px 52px',
                backdropFilter: 'blur(24px)',
              }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 28 }}>
                  {[...Array(t.rating)].map((_, s) => <Star key={s} size={14} style={{ fill: '#f5f5f7', color: '#f5f5f7' }} />)}
                </div>
                <p style={{ color: '#f5f5f7', fontSize: 20, lineHeight: 1.65, fontWeight: 400, marginBottom: 36, fontFamily: "'DM Serif Display', serif" }}>
                  "{t.text}"
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #a8a8b3, #6e6e73)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14 }}>
                    {t.name[0]}
                  </div>
                  <div>
                    <div style={{ color: '#f5f5f7', fontWeight: 600, fontSize: 14 }}>{t.name}</div>
                    <div style={{ color: '#6e6e73', fontSize: 12, marginTop: 2 }}>{t.role}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 36 }}>
        {testimonials.map((_, i) => (
          <button key={i} onClick={() => setActive(i)} style={{
            height: 6, borderRadius: 3, border: 'none', cursor: 'pointer',
            width: i === active ? 28 : 6,
            background: i === active ? '#f5f5f7' : 'rgba(255,255,255,0.2)',
            transition: 'all 0.4s cubic-bezier(.16,1,.3,1)', padding: 0,
          }} />
        ))}
      </div>

      {[{ Icon: ChevronLeft, fn: prev, side: 'left' }, { Icon: ChevronRight, fn: next, side: 'right' }].map(({ Icon, fn, side }) => (
        <button key={side} onClick={fn} style={{
          position: 'absolute', top: '45%', [side]: 0, transform: 'translateY(-50%)',
          width: 40, height: 40, borderRadius: '50%',
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: 'background 0.2s', backdropFilter: 'blur(12px)',
        }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}>
          <Icon size={18} color="#f5f5f7" />
        </button>
      ))}
    </div>
  )
}

/* ─── MARQUEE ─────────────────────────────────────────── */
function Marquee() {
  const items = ['GPay', 'PhonePe', 'Paytm', 'Razorpay', 'ICICI Bank', 'HDFC Bank', 'Axis Bank', 'SBI', 'Kotak', 'WhatsApp', 'GSTN Portal', 'Income Tax']
  return (
    <div style={{ overflow: 'hidden', maskImage: 'linear-gradient(to right, transparent, black 12%, black 88%, transparent)' }}>
      <div style={{ display: 'flex', gap: 56, animation: 'marquee 24s linear infinite', whiteSpace: 'nowrap' }}>
        {[...items, ...items].map((item, i) => (
          <span key={i} style={{ color: '#6e6e73', fontSize: 13, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#3a3a3c', display: 'inline-block' }} />
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

/* ─── FEATURE CARD ───────────────────────────────────── */
function FeatureCard({ feature, delay }) {
  const cardRef = useRef(null)
  const [hovered, setHovered] = useState(false)
  const onMove = e => {
    const rect = cardRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 12
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -12
    cardRef.current.style.transform = `perspective(800px) rotateX(${y}deg) rotateY(${x}deg)`
  }
  const onLeave = () => { cardRef.current.style.transform = 'perspective(800px) rotateX(0) rotateY(0)'; setHovered(false) }
  return (
    <Reveal delay={delay} direction="up">
      <div ref={cardRef} onMouseMove={onMove} onMouseLeave={onLeave} onMouseEnter={() => setHovered(true)} style={{
        background: hovered ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${hovered ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.07)'}`,
        borderRadius: 24, padding: '36px 32px',
        transition: 'background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
        boxShadow: hovered ? '0 24px 64px rgba(0,0,0,0.4)' : '0 2px 16px rgba(0,0,0,0.2)',
        willChange: 'transform', cursor: 'default',
      }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
          <feature.icon size={22} color="#f5f5f7" strokeWidth={1.5} />
        </div>
        <h3 style={{ color: '#f5f5f7', fontSize: 17, fontWeight: 600, marginBottom: 10, letterSpacing: '-0.01em' }}>{feature.title}</h3>
        <p style={{ color: '#6e6e73', fontSize: 14, lineHeight: 1.7, margin: 0 }}>{feature.desc}</p>
      </div>
    </Reveal>
  )
}

/* ─── MAIN ────────────────────────────────────────────── */
export default function Landing() {
  const navigate = useNavigate()
  const [annual, setAnnual] = useState(false)
  const scrollY = useScrollY()

  const features = [
    { icon: FileText,   title: 'GST Invoices',         desc: 'Fully compliant invoices with automatic CGST & SGST split. Generate, preview, and share PDF in seconds.' },
    { icon: Globe,      title: 'Portfolio Page',        desc: 'A stunning public portfolio with your own URL. Showcase work, skills, testimonials. Let clients come to you.' },
    { icon: Users,      title: 'Client Manager',        desc: 'Complete CRM built for freelancers. Track invoices, payment history, and lifetime revenue per client.' },
    { icon: Zap,        title: 'Instant UPI Payments',  desc: 'Embed your UPI link directly in invoices. Clients pay with GPay, PhonePe, or Paytm in one tap.' },
    { icon: BarChart3,  title: 'Income Analytics',      desc: 'Monthly revenue charts, client breakdowns, and a clean tax summary ready for ITR filing.' },
    { icon: Shield,     title: 'Enterprise Security',   desc: 'AES-256 encryption, SOC 2 compliant infrastructure. Your data and your clients\' data — protected.' },
  ]

  const FF = "'DM Sans', -apple-system, sans-serif"
  const SERIF = "'DM Serif Display', Georgia, serif"

  return (
    <div style={{ background: '#000', minHeight: '100vh', overflowX: 'hidden', fontFamily: FF }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        ::selection { background: rgba(245,245,247,0.15); color: #f5f5f7; }
        button { font-family: inherit; }
        @keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
        @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes breathe { 0%,100%{opacity:0.35;transform:scale(1)} 50%{opacity:0.65;transform:scale(1.04)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: 'fixed', top: 0, width: '100%', zIndex: 100,
        background: scrollY > 40 ? 'rgba(0,0,0,0.82)' : 'transparent',
        backdropFilter: scrollY > 40 ? 'blur(20px) saturate(180%)' : 'none',
        borderBottom: scrollY > 40 ? '1px solid rgba(255,255,255,0.07)' : '1px solid transparent',
        transition: 'background 0.5s ease, border-color 0.5s ease',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 28px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg, #fff 0%, #a8a8b3 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={15} color="#000" strokeWidth={2.5} />
            </div>
            <span style={{ color: '#f5f5f7', fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em' }}>BILLR</span>
          </div>

          <div style={{ display: 'flex', gap: 36 }}>
            {[['Features','#features'], ['Pricing','#pricing'], ['Testimonials','#testimonials'], ['About','#about']].map(([item, href]) => (
              <a key={item} href={href} style={{ color: '#a1a1a6', fontSize: 14, fontWeight: 400, textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#f5f5f7'}
                onMouseLeave={e => e.currentTarget.style.color = '#a1a1a6'}>{item}
              </a>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button onClick={() => navigate('/auth')} style={{ color: '#a1a1a6', background: 'none', border: 'none', fontSize: 14, cursor: 'pointer', transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#f5f5f7'}
              onMouseLeave={e => e.currentTarget.style.color = '#a1a1a6'}>Log In</button>
            <button onClick={() => navigate('/auth')} style={{ background: '#f5f5f7', color: '#000', border: 'none', borderRadius: 980, padding: '8px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all 0.25s ease', letterSpacing: '-0.01em' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.transform = 'scale(1.04)' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#f5f5f7'; e.currentTarget.style.transform = 'scale(1)' }}>Get Started</button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '120px 28px 80px', overflow: 'hidden' }}>

        {/* Atmospheric glow */}
        <div style={{ position: 'absolute', width: 900, height: 900, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.038) 0%, transparent 65%)', top: '50%', left: '50%', marginLeft: -450, marginTop: -450, transform: `translateY(${scrollY * 0.12}px)`, transition: 'transform 0.08s linear', pointerEvents: 'none', animation: 'breathe 8s ease-in-out infinite' }} />

        {/* Grid */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)', backgroundSize: '64px 64px', maskImage: 'radial-gradient(ellipse 80% 60% at 50% 50%, black, transparent)', transform: `translateY(${scrollY * 0.04}px)`, transition: 'transform 0.08s linear' }} />

        {/* Floating orbs */}
        <div style={{ position: 'absolute', width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.025) 0%, transparent 70%)', top: '22%', left: '8%', animation: 'float 7s ease-in-out infinite', transform: `translateY(${scrollY * 0.18}px)`, transition: 'transform 0.08s linear', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.02) 0%, transparent 70%)', top: '28%', right: '7%', animation: 'float 9s ease-in-out infinite 2s', transform: `translateY(${scrollY * -0.1}px)`, transition: 'transform 0.08s linear', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 820, textAlign: 'center', position: 'relative' }}>
          <Reveal delay={0}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: '1px solid rgba(37, 99, 235, 0.2)', borderRadius: 980, padding: '7px 18px', marginBottom: 40, background: 'rgba(37, 99, 235, 0.08)', backdropFilter: 'blur(12px)' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#2563eb', animation: 'pulse 2s ease-in-out infinite' }} />
              <span style={{ color: '#60a5fa', fontSize: 13, fontWeight: 500, letterSpacing: '0.01em' }}>Built for Indian Freelancers <span style={{ fontSize: 10, verticalAlign: 'middle', marginLeft: 2, background: 'rgba(96, 165, 250, 0.2)', padding: '1px 4px', borderRadius: 4 }}>IN</span></span>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <h1 style={{ fontFamily: SERIF, fontSize: 'clamp(54px, 8.5vw, 92px)', fontWeight: 400, lineHeight: 1.03, letterSpacing: '-0.03em', marginBottom: 30, color: '#f5f5f7' }}>
              Invoices &amp; Portfolio
              <br />
              <span style={{ color: '#3b82f6', fontStyle: 'italic', textShadow: '0 0 40px rgba(59, 130, 246, 0.3)' }}>
                That Win Clients
              </span>
            </h1>
          </Reveal>

          <Reveal delay={240}>
            <p style={{ color: '#6e6e73', fontSize: 19, lineHeight: 1.7, maxWidth: 520, margin: '0 auto 48px', fontWeight: 300 }}>
              Create GST-ready invoices, build a stunning portfolio, and get paid faster. Everything a freelancer needs in one place.
            </p>
          </Reveal>

          <Reveal delay={360}>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => navigate('/auth')} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 980, padding: '16px 36px', fontSize: 16, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.3s cubic-bezier(.16,1,.3,1)', letterSpacing: '-0.01em', boxShadow: '0 8px 24px rgba(37, 99, 235, 0.25)' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#3b82f6'; e.currentTarget.style.transform = 'scale(1.04) translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(37, 99, 235, 0.4)' }}
                onMouseLeave={e => { e.currentTarget.style.background = '#2563eb'; e.currentTarget.style.transform = 'scale(1) translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(37, 99, 235, 0.25)' }}>
                Create Free Invoice <ArrowRight size={18} strokeWidth={2.5} />
              </button>
              <button onClick={() => navigate('/portfolio')} style={{ background: 'transparent', color: '#f5f5f7', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 980, padding: '16px 36px', fontSize: 16, fontWeight: 400, cursor: 'pointer', transition: 'all 0.3s ease', backdropFilter: 'blur(12px)', letterSpacing: '-0.01em' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'translateY(0)' }}>
                View Demo Portfolio
              </button>
            </div>
          </Reveal>

          <Reveal delay={460}>
            <p style={{ color: '#3a3a3c', fontSize: 13, marginTop: 24, letterSpacing: '0.02em' }}>Free forever &nbsp;·&nbsp; No credit card &nbsp;·&nbsp; GST compliant</p>
          </Reveal>
        </div>

        {/* Stats */}
        <div style={{ maxWidth: 880, width: '100%', margin: '80px auto 0', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, transform: `translateY(${scrollY * 0.06}px)`, transition: 'transform 0.08s linear', position: 'relative' }}>
          {[
            { end: 15000000, prefix: '', suffix: 'M+', label: 'Indian Freelancers' },
            { end: 0,     prefix: '₹', suffix: '',  label: 'To Get Started' },
            { end: 2,     prefix: '', suffix: ' min', label: 'To Create Invoice' },
          ].map((stat, i) => (
            <Reveal key={i} delay={i * 100 + 500}>
              <div style={{ textAlign: 'center', padding: '36px 16px', background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 28, backdropFilter: 'blur(12px)' }}>
                <div style={{ fontFamily: SERIF, fontSize: 44, color: '#f5f5f7', marginBottom: 8, letterSpacing: '-0.02em' }}>
                  {stat.end === 15000000 ? (stat.prefix + "15" + stat.suffix) : (
                    <Counter end={stat.end} prefix={stat.prefix} suffix={stat.suffix} />
                  )}
                </div>
                <div style={{ color: '#6e6e73', fontSize: 13, fontWeight: 500, letterSpacing: '0.02em' }}>{stat.label}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── MARQUEE STRIP ── */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '20px 0' }}>
        <p style={{ textAlign: 'center', color: '#3a3a3c', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16, fontWeight: 500 }}>Integrates with</p>
        <Marquee />
      </div>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: '120px 28px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: 560, height: 560, border: '1px solid rgba(255,255,255,0.04)', borderRadius: '50%', right: -200, top: '50%', transform: `translateY(calc(-50% + ${scrollY * 0.07}px))`, transition: 'transform 0.08s linear', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: 300, height: 300, border: '1px solid rgba(255,255,255,0.04)', borderRadius: '50%', left: -120, top: 80, transform: `translateY(${scrollY * -0.05}px)`, transition: 'transform 0.08s linear', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 80 }}>
            <Reveal><span style={{ color: '#6e6e73', fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 18 }}>Features</span></Reveal>
            <Reveal delay={100}><h2 style={{ fontFamily: SERIF, fontSize: 'clamp(38px, 5vw, 60px)', color: '#f5f5f7', fontWeight: 400, letterSpacing: '-0.03em', marginBottom: 16 }}>Everything You Need</h2></Reveal>
            <Reveal delay={200}><p style={{ color: '#6e6e73', fontSize: 17, fontWeight: 300 }}>Crafted specifically for Indian freelancers</p></Reveal>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {features.map((f, i) => <FeatureCard key={f.title} feature={f} delay={i * 80} />)}
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF ── */}
      <section style={{ padding: '80px 28px', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 40 }}>
          {[
            { val: '50,000+', label: 'Freelancers onboarded' },
            { val: '₹12 Cr+', label: 'Invoices generated' },
            { val: '4.9 ★',   label: 'Average rating' },
            { val: '98%',     label: 'Payment success rate' },
          ].map((s, i) => (
            <Reveal key={i} delay={i * 80}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: SERIF, fontSize: 44, color: '#f5f5f7', letterSpacing: '-0.02em', marginBottom: 8 }}>{s.val}</div>
                <div style={{ color: '#6e6e73', fontSize: 14 }}>{s.label}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="testimonials" style={{ padding: '120px 28px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(255,255,255,0.02) 0%, transparent 100%)' }} />
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <Reveal><span style={{ color: '#6e6e73', fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 18 }}>Testimonials</span></Reveal>
            <Reveal delay={100}><h2 style={{ fontFamily: SERIF, fontSize: 'clamp(38px, 5vw, 60px)', color: '#f5f5f7', fontWeight: 400, letterSpacing: '-0.03em', marginBottom: 16 }}>Loved by Freelancers</h2></Reveal>
            <Reveal delay={200}><p style={{ color: '#6e6e73', fontSize: 17, fontWeight: 300 }}>Real stories from India's top independent professionals</p></Reveal>
          </div>
          <Reveal delay={100} direction="scale"><Carousel /></Reveal>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" style={{ padding: '120px 28px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.02) 0%, transparent 70%)', bottom: -300, left: '50%', marginLeft: -350, transform: `translateY(${scrollY * -0.04}px)`, transition: 'transform 0.08s linear', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <Reveal><span style={{ color: '#6e6e73', fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 18 }}>Pricing</span></Reveal>
            <Reveal delay={100}><h2 style={{ fontFamily: SERIF, fontSize: 'clamp(38px, 5vw, 60px)', color: '#f5f5f7', fontWeight: 400, letterSpacing: '-0.03em', marginBottom: 16 }}>Simple Pricing</h2></Reveal>
            <Reveal delay={200}><p style={{ color: '#6e6e73', fontSize: 17, fontWeight: 300, marginBottom: 36 }}>Start free, upgrade when you grow</p></Reveal>
            <Reveal delay={280}>
              <div style={{ display: 'inline-flex', background: 'rgba(255,255,255,0.05)', borderRadius: 980, padding: 4, border: '1px solid rgba(255,255,255,0.08)' }}>
                {[{ label: 'Monthly', val: false }, { label: 'Annual · Save 20%', val: true }].map(opt => (
                  <button key={String(opt.val)} onClick={() => setAnnual(opt.val)} style={{ padding: '8px 24px', borderRadius: 980, border: 'none', cursor: 'pointer', background: annual === opt.val ? '#f5f5f7' : 'transparent', color: annual === opt.val ? '#000' : '#6e6e73', fontSize: 14, fontWeight: 500, transition: 'all 0.3s ease' }}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </Reveal>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* FREE */}
            <Reveal delay={100} direction="left">
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 28, padding: '44px 40px', height: '100%', transition: 'border-color 0.3s, box-shadow 0.3s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)'; e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.5)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow = 'none' }}>
                <div style={{ color: '#6e6e73', fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20 }}>Free</div>
                <div style={{ fontFamily: SERIF, fontSize: 56, color: '#f5f5f7', letterSpacing: '-0.03em', marginBottom: 4 }}>₹0</div>
                <div style={{ color: '#6e6e73', fontSize: 14, marginBottom: 36 }}>Forever free</div>
                <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 32 }} />
                {['3 invoices per month', '1 portfolio page', 'PDF download', '3 clients', 'Basic templates', 'GST invoice format'].map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                    <div style={{ width: 18, height: 18, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Check size={11} color="#a1a1a6" strokeWidth={2.5} />
                    </div>
                    <span style={{ color: '#a1a1a6', fontSize: 14 }}>{f}</span>
                  </div>
                ))}
                <button onClick={() => navigate('/auth')} style={{ width: '100%', marginTop: 36, background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 980, padding: '14px 0', color: '#f5f5f7', fontSize: 15, fontWeight: 500, cursor: 'pointer', transition: 'all 0.25s ease' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.28)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)' }}>
                  Get Started Free
                </button>
              </div>
            </Reveal>

            {/* PRO */}
            <Reveal delay={200} direction="right">
              <div style={{ background: '#f5f5f7', borderRadius: 28, padding: '44px 40px', height: '100%', position: 'relative', overflow: 'hidden', boxShadow: '0 4px 40px rgba(255,255,255,0.06)', transition: 'transform 0.3s ease, box-shadow 0.3s ease' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 28px 80px rgba(255,255,255,0.14)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 40px rgba(255,255,255,0.06)' }}>
                <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 100% 0%, rgba(0,0,0,0.04) 0%, transparent 60%)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', top: -1, left: '50%', transform: 'translateX(-50%)', background: '#000', color: '#f5f5f7', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '6px 20px', borderRadius: '0 0 12px 12px' }}>
                  Most Popular
                </div>
                <div style={{ color: '#6e6e73', fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20 }}>Pro</div>
                <div style={{ fontFamily: SERIF, fontSize: 56, color: '#000', letterSpacing: '-0.03em', marginBottom: 4 }}>{annual ? '₹1,999' : '₹299'}</div>
                <div style={{ color: '#6e6e73', fontSize: 14, marginBottom: 36 }}>{annual ? 'per year · save ₹1,589' : 'per month'}</div>
                <div style={{ height: 1, background: 'rgba(0,0,0,0.08)', marginBottom: 32 }} />
                {['Unlimited invoices', 'Custom portfolio domain', '10+ invoice templates', 'Unlimited clients', 'UPI payment link', 'WhatsApp share', 'Income analytics', 'ITR tax summary', 'AI invoice writer', 'Priority support'].map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                    <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Check size={11} color="#fff" strokeWidth={2.5} />
                    </div>
                    <span style={{ color: '#1d1d1f', fontSize: 14 }}>{f}</span>
                  </div>
                ))}
                <button onClick={() => navigate('/auth')} style={{ width: '100%', marginTop: 36, background: '#000', border: 'none', borderRadius: 980, padding: '15px 0', color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer', transition: 'all 0.25s ease' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#1d1d1f'; e.currentTarget.style.transform = 'scale(1.02)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#000'; e.currentTarget.style.transform = 'scale(1)' }}>
                  Start Pro Free Trial
                </button>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section id="about" style={{ padding: '120px 28px', position: 'relative', overflow: 'hidden', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(255,255,255,0.025) 0%, transparent 100%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <Reveal>
            <h2 style={{ fontFamily: SERIF, fontSize: 'clamp(38px, 5.5vw, 68px)', color: '#f5f5f7', fontWeight: 400, letterSpacing: '-0.03em', lineHeight: 1.08, marginBottom: 24 }}>
              Ready to Get<br />
              <span style={{ fontStyle: 'italic', color: '#6e6e73' }}>Paid Faster?</span>
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <p style={{ color: '#6e6e73', fontSize: 18, fontWeight: 300, lineHeight: 1.7, marginBottom: 48 }}>
              Join 50,000+ Indian freelancers who invoice smarter. Your first invoice in under 2 minutes.
            </p>
          </Reveal>
          <Reveal delay={240}>
            <button onClick={() => navigate('/auth')} style={{ background: '#f5f5f7', color: '#000', border: 'none', borderRadius: 980, padding: '18px 44px', fontSize: 17, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 10, transition: 'all 0.3s cubic-bezier(.16,1,.3,1)', letterSpacing: '-0.01em' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.transform = 'scale(1.05) translateY(-3px)'; e.currentTarget.style.boxShadow = '0 16px 48px rgba(255,255,255,0.12)' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#f5f5f7'; e.currentTarget.style.transform = 'scale(1) translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}>
              Create Your Free Account <ArrowRight size={20} strokeWidth={2.5} />
            </button>
          </Reveal>
          <Reveal delay={320}>
            <p style={{ color: '#3a3a3c', fontSize: 13, marginTop: 20, letterSpacing: '0.02em' }}>No credit card required &nbsp;·&nbsp; Free forever plan</p>
          </Reveal>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '44px 28px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: '#f5f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={14} color="#000" strokeWidth={2.5} />
            </div>
            <span style={{ color: '#f5f5f7', fontSize: 16, fontWeight: 700, letterSpacing: '-0.02em' }}>BILLR</span>
          </div>
          <p style={{ color: '#3a3a3c', fontSize: 13 }}>© 2026 BILLR. Built for Indian Freelancers 🇮🇳</p>
          <div style={{ display: 'flex', gap: 28 }}>
            {['Privacy', 'Terms', 'Contact'].map(item => (
              <a key={item} href="#" style={{ color: '#3a3a3c', fontSize: 13, textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#f5f5f7'}
                onMouseLeave={e => e.currentTarget.style.color = '#3a3a3c'}>{item}</a>
            ))}
          </div>
        </div>
      </footer>

    </div>
  )
}