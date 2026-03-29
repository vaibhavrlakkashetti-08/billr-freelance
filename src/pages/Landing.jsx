import { useState } from 'react'
import { FileText, Users, BarChart3, 
         Globe, Shield, Zap, 
         ChevronRight, Check } from 'lucide-react'

export default function Landing() {
  const [annual, setAnnual] = useState(false)

  return (
    <div className="min-h-screen bg-white">

      {/* NAVBAR */}
      <nav className="fixed top-0 w-full bg-white/80 
        backdrop-blur-md border-b border-slate-100 z-50">
        <div className="max-w-6xl mx-auto px-6 
          h-16 flex items-center justify-between">
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 
              rounded-lg flex items-center justify-center">
              <FileText size={18} className="text-white" />
            </div>
            <span className="text-xl font-bold text-slate-800">
              BILLR
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {['Features','Pricing','Portfolio','About'].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`}
                className="text-sm text-slate-600 
                  hover:text-blue-600 transition-colors">
                {item}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button className="text-sm text-slate-600 
              hover:text-blue-600 px-4 py-2 
              transition-colors font-medium">
              Log In
            </button>
            <button className="bg-blue-600 text-white 
              text-sm font-semibold px-5 py-2.5 
              rounded-full hover:bg-blue-700 
              transition-all shadow-lg 
              shadow-blue-200 hover:shadow-blue-300
              hover:-translate-y-0.5">
              Get Started Free
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          
          <div className="inline-flex items-center gap-2 
            bg-blue-50 border border-blue-100 
            rounded-full px-4 py-2 mb-8">
            <div className="w-2 h-2 bg-blue-500 
              rounded-full animate-pulse" />
            <span className="text-sm text-blue-700 font-medium">
              Built for Indian Freelancers 🇮🇳
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-black 
            text-slate-900 leading-tight mb-6">
            Invoices &amp; Portfolio
            <span className="block text-blue-600">
              That Win Clients
            </span>
          </h1>

          <p className="text-xl text-slate-500 
            max-w-2xl mx-auto mb-10 leading-relaxed">
            Create GST-ready invoices, build a stunning 
            portfolio, and get paid faster. 
            Everything a freelancer needs in one place.
          </p>

          <div className="flex flex-col sm:flex-row 
            gap-4 justify-center">
            <button className="bg-blue-600 text-white 
              font-bold px-8 py-4 rounded-full 
              text-lg hover:bg-blue-700 transition-all
              shadow-xl shadow-blue-200 
              hover:-translate-y-1 flex items-center 
              justify-center gap-2">
              Create Free Invoice
              <ChevronRight size={20} />
            </button>
            <button className="border-2 border-slate-200 
              text-slate-700 font-semibold px-8 py-4 
              rounded-full text-lg hover:border-blue-300
              hover:text-blue-600 transition-all
              flex items-center justify-center gap-2">
              View Demo Portfolio
            </button>
          </div>

          <p className="text-sm text-slate-400 mt-6">
            Free forever • No credit card • 
            GST compliant
          </p>
        </div>

        {/* HERO STATS */}
        <div className="max-w-3xl mx-auto mt-16 
          grid grid-cols-3 gap-6">
          {[
            { num: '15M+', label: 'Indian Freelancers' },
            { num: '₹0', label: 'To Get Started' },
            { num: '2 min', label: 'To Create Invoice' },
          ].map(stat => (
            <div key={stat.num} 
              className="text-center p-6 bg-slate-50 
                rounded-2xl border border-slate-100">
              <div className="text-3xl font-black 
                text-blue-600 mb-1">{stat.num}</div>
              <div className="text-sm text-slate-500 
                font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" 
        className="py-20 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black 
              text-slate-900 mb-4">
              Everything You Need
            </h2>
            <p className="text-lg text-slate-500">
              Built specifically for Indian freelancers
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: FileText,
                color: 'blue',
                title: 'GST Invoices',
                desc: 'Create professional GST-compliant invoices with CGST, SGST split. Download as PDF instantly.'
              },
              {
                icon: Globe,
                color: 'green',
                title: 'Portfolio Page',
                desc: 'Get your own public portfolio URL. Showcase work, skills and let clients contact you directly.'
              },
              {
                icon: Users,
                color: 'purple',
                title: 'Client Manager',
                desc: 'Track all clients, their invoices, payment history and total revenue in one place.'
              },
              {
                icon: Zap,
                color: 'yellow',
                title: 'UPI Payments',
                desc: 'Add your UPI ID to invoices. Clients pay instantly via GPay, PhonePe or Paytm.'
              },
              {
                icon: BarChart3,
                color: 'red',
                title: 'Income Analytics',
                desc: 'Monthly income charts, top clients, tax summary ready for ITR filing.'
              },
              {
                icon: Shield,
                color: 'indigo',
                title: 'Bank-Grade Security',
                desc: 'Your data encrypted and secure. GDPR compliant. Your clients data is safe.'
              },
            ].map(feature => (
              <div key={feature.title}
                className="bg-white p-8 rounded-2xl 
                  border border-slate-100 hover:border-blue-200
                  hover:shadow-lg transition-all group">
                <div className={`w-12 h-12 rounded-xl 
                  bg-${feature.color}-50 flex items-center 
                  justify-center mb-4 group-hover:scale-110
                  transition-transform`}>
                  <feature.icon size={24} 
                    className={`text-${feature.color}-600`} />
                </div>
                <h3 className="text-lg font-bold 
                  text-slate-800 mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-500 text-sm 
                  leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black 
              text-slate-900 mb-4">
              Simple Pricing
            </h2>
            <p className="text-lg text-slate-500 mb-8">
              Start free, upgrade when you grow
            </p>

            <div className="inline-flex items-center 
              bg-slate-100 rounded-full p-1">
              <button onClick={() => setAnnual(false)}
                className={`px-6 py-2 rounded-full text-sm 
                  font-semibold transition-all ${!annual 
                    ? 'bg-white shadow text-slate-800' 
                    : 'text-slate-500'}`}>
                Monthly
              </button>
              <button onClick={() => setAnnual(true)}
                className={`px-6 py-2 rounded-full text-sm 
                  font-semibold transition-all ${annual 
                    ? 'bg-white shadow text-slate-800' 
                    : 'text-slate-500'}`}>
                Annual 
                <span className="text-green-500 ml-1">
                  -20%
                </span>
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* FREE */}
            <div className="border-2 border-slate-200 
              rounded-3xl p-8">
              <div className="text-sm font-semibold 
                text-slate-500 mb-2">FREE</div>
              <div className="text-5xl font-black 
                text-slate-900 mb-1">₹0</div>
              <div className="text-slate-500 mb-8">
                Forever free
              </div>
              {[
                '3 invoices per month',
                '1 portfolio page',
                'PDF download',
                '3 clients',
                'Basic templates',
                'GST invoice format',
              ].map(f => (
                <div key={f} className="flex items-center 
                  gap-3 mb-3">
                  <Check size={18} 
                    className="text-green-500 flex-shrink-0"/>
                  <span className="text-slate-600 text-sm">
                    {f}
                  </span>
                </div>
              ))}
              <button className="w-full mt-8 border-2 
                border-blue-600 text-blue-600 font-bold 
                py-3 rounded-full hover:bg-blue-50 
                transition-colors">
                Get Started Free
              </button>
            </div>

            {/* PRO */}
            <div className="border-2 border-blue-600 
              rounded-3xl p-8 bg-blue-600 relative">
              <div className="absolute -top-4 left-1/2 
                -translate-x-1/2 bg-yellow-400 
                text-yellow-900 text-xs font-bold 
                px-4 py-1 rounded-full">
                MOST POPULAR
              </div>
              <div className="text-sm font-semibold 
                text-blue-200 mb-2">PRO</div>
              <div className="text-5xl font-black 
               text-white mb-1">
               {annual ? '₹1,999' : '₹299'}
               </div>
               <div className="text-blue-200 mb-8">
               {annual ? 'per year' : 'per month'}
               </div>
              {[
                'Unlimited invoices',
                'Custom portfolio domain',
                '10+ invoice templates',
                'Unlimited clients',
                'UPI payment link',
                'WhatsApp share',
                'Income analytics',
                'ITR tax summary',
                'AI invoice writer',
                'Priority support',
              ].map(f => (
                <div key={f} className="flex items-center 
                  gap-3 mb-3">
                  <Check size={18} 
                    className="text-blue-200 flex-shrink-0"/>
                  <span className="text-white text-sm">
                    {f}
                  </span>
                </div>
              ))}
              <button className="w-full mt-8 bg-white 
                text-blue-600 font-bold py-3 rounded-full 
                hover:bg-blue-50 transition-colors">
                Start Pro Free Trial
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-white 
        py-12 px-6">
        <div className="max-w-6xl mx-auto 
          flex flex-col md:flex-row 
          justify-between items-center gap-6">
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 
              rounded-lg flex items-center justify-center">
              <FileText size={18} className="text-white" />
            </div>
            <span className="text-xl font-bold">BILLR</span>
          </div>

          <p className="text-slate-400 text-sm">
            © 2026 BILLR. Built for Indian Freelancers 🇮🇳
          </p>

          <div className="flex gap-6">
            {['Privacy','Terms','Contact'].map(item => (
              <a key={item} href="#"
                className="text-slate-400 hover:text-white 
                  text-sm transition-colors">
                {item}
              </a>
            ))}
          </div>
        </div>
      </footer>

    </div>
  )
}