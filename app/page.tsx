'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Activity, ArrowRight, BarChart3, Brain, Shield,
  Zap, Database, ChevronRight, CheckCircle2,
  Users, Globe, Sparkles
} from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'XGBoost ML Engine',
    description: 'Enterprise-grade gradient boosting model trained on your own customer data for ultra-precise CLV predictions.',
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10 border-indigo-500/20',
  },
  {
    icon: BarChart3,
    title: 'Business Intelligence',
    description: 'Interactive dashboards with real-time segmentation, revenue distribution, and trajectory analysis.',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10 border-violet-500/20',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Secure authentication, encrypted data processing, and isolated model environments built for scale.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
  },
  {
    icon: Database,
    title: 'Dynamic Datasets',
    description: 'Instantly ingest CSV pipelines and autonomously extract RFM features with scalable cloud architecture.',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20',
  },
  {
    icon: Zap,
    title: 'Sub-second Inference',
    description: 'Generate millions of AI predictions in milliseconds, seamlessly updating your SaaS frontend.',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
  },
  {
    icon: Globe,
    title: 'API Ready',
    description: 'Headless integration available. Export your machine learning segments into any third-party marketing platform.',
    color: 'text-rose-400',
    bg: 'bg-rose-500/10 border-rose-500/20',
  },
];

const pricing = [
  {
    name: 'Starter',
    price: 'Free',
    desc: 'Perfect for exploring the CLV intelligence engine.',
    features: ['Up to 10k predictions/mo', '1 ML Model', 'Basic BI Dashboard', 'Community Support'],
    href: '/auth/signup',
    cta: 'Start Free',
    popular: false,
  },
  {
    name: 'Pro',
    price: '₹999',
    period: '/mo',
    desc: 'For growing data teams scaling their operations.',
    features: ['Up to 500k predictions/mo', '5 Custom ML Models', 'Advanced segment analytics', 'Priority Email Support', 'API Access'],
    href: '/auth/signup',
    cta: 'Start Pro Trial',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    desc: 'Dedicated clusters and unlimited ML scaling capabilities.',
    features: ['Unlimited predictions', 'Infinite ML Models', 'White-labeling', '24/7 Slack Support', 'Dedicated Success Manager'],
    href: 'mailto:contact@clvpredict.com',
    cta: 'Contact Sales',
    popular: false,
  },
];

const faqs = [
  { q: 'How does the XGBoost engine work?', a: 'Based on raw transaction data (Recency, Frequency, Monetary Value, Tenure), the engine trains a localized XGBoost regression algorithm isolated for your tenant. It extracts deep nonlinear patterns allowing for highly accurate predictions over an 18-month horizon.' },
  { q: 'Is my customer data secure?', a: 'Absolutely. All database rows are AES-256 encrypted at rest, and models are securely isolated. We strictly comply with GDPR and SOC2 data processing directives.' },
  { q: 'Do I need a data scientist?', a: 'No! CLVPredict autonomously handles feature engineering, hyperparameter tuning, model validation, and deployment pipelines transparently.' },
  { q: 'Can I export the prediction data?', a: 'Yes. You can seamlessly export analytics segment lists directly as standard CSV files formatted for Hubspot, Marketo, Salesforce, and more.' },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[oklch(0.118_0.008_264)] text-white overflow-hidden selection:bg-indigo-500/30">
      {/* Background effects */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)`,
            backgroundSize: '32px 32px',
          }}
        />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full bg-indigo-600/10 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full bg-purple-600/10 blur-[120px]" />
      </div>

      {/* Nav */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-5 md:px-12 border-b border-white/[0.05] bg-[oklch(0.118_0.008_264)]/70 backdrop-blur-xl sticky top-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Activity className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-white tracking-tight">
            CLV<span className="text-indigo-400">Predict</span>
          </span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/60">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/auth/login">
            <button className="hidden sm:inline-flex px-4 py-2 rounded-xl text-white/60 hover:text-white hover:bg-white/[0.06] text-sm font-medium transition-all duration-200">
              Sign In
            </button>
          </Link>
          <Link href="/auth/signup">
            <button className="px-5 py-2.5 rounded-xl bg-white text-black hover:bg-white/90 text-sm font-semibold transition-all duration-200 shadow-xl shadow-white/10">
              Get Started
            </button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center justify-center px-6 pt-32 pb-20 text-center md:pt-40 md:pb-32 min-h-[90vh]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-8 backdrop-blur-md cursor-pointer hover:bg-indigo-500/20 transition-all duration-300"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          CLVPredict 2.0 is now live
          <ArrowRight className="w-3 h-3 ml-1" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-5xl md:text-7xl lg:text-[80px] font-bold tracking-tight text-white mb-6 max-w-5xl text-balance leading-[1.05]"
        >
          <span className="block mb-2">Identify your most</span>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400">
            Valuable Customers.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-lg md:text-xl text-white/45 max-w-2xl mb-10 leading-relaxed font-light"
        >
          Enterprise-grade XGBoost machine learning directly in the browser. Train custom models, run predictions instantly, and access real-time business intelligence boards seamlessly.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 items-center justify-center"
        >
          <Link href="/auth/signup">
            <button className="flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-indigo-500 hover:bg-indigo-400 text-white font-semibold transition-all duration-200 hover:shadow-2xl hover:shadow-indigo-500/25 hover:-translate-y-1 w-full sm:w-auto justify-center text-lg">
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
          <button className="flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-white/[0.04] border border-white/[0.1] text-white/70 hover:text-white hover:bg-white/[0.08] font-semibold transition-all duration-200 w-full sm:w-auto justify-center text-lg">
            View Live Demo
          </button>
        </motion.div>

        {/* Floating social proof */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-20 pt-10 border-t border-white/[0.05] flex flex-col items-center gap-6 w-full max-w-4xl"
        >
          <p className="text-xs uppercase tracking-widest text-white/30 font-semibold">Trusted by data teams everywhere</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-40 grayscale">
            {/* Logos represented by stylized text for the demo */}
            <span className="text-xl font-bold font-serif italic">Acme Corp</span>
            <span className="text-xl font-black uppercase tracking-tighter">GLOBAL</span>
            <span className="text-xl font-bold tracking-widest">NEXUS</span>
            <span className="text-xl font-mono font-bold">tech.io</span>
            <span className="text-xl font-bold tracking-tight">O S I R I S</span>
          </div>
        </motion.div>
      </section>

      {/* Stats bar */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 mb-32">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-3xl overflow-hidden shadow-2xl shadow-black/80 border border-white/[0.08] bg-white/[0.08] backdrop-blur-xl">
          {[
            { value: '95%+', label: 'Model Accuracy' },
            { value: '<50ms', label: 'Inference Speed' },
            { value: '256-bit', label: 'AES Encryption' },
            { value: '99.9%', label: 'Uptime SLA' },
          ].map(({ value, label }) => (
            <div key={label} className="bg-[oklch(0.12_0.008_264)]/90 px-6 py-8 text-center hover:bg-white/[0.02] transition-colors">
              <p className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white to-white/50 mb-2">{value}</p>
              <p className="text-xs text-white/40 uppercase tracking-wider font-semibold">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Outline */}
      <section id="features" className="relative z-10 max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-20">
          <p className="text-indigo-400 font-semibold mb-3 tracking-wide">ENTERPRISE TOOLING</p>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Designed to handle massive data</h2>
          <p className="text-white/40 text-lg max-w-2xl mx-auto">Drop the spreadsheets. Connect your raw data and instantly derive highly targeted cohorts with native integration to BI dashboards.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, description, color, bg }, i) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              key={title}
              className="p-8 rounded-3xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-300 group"
            >
              <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center mb-6 ${bg} transition-transform duration-300 group-hover:scale-110 shadow-lg`}>
                <Icon className={`w-6 h-6 ${color}`} />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
              <p className="text-white/45 leading-relaxed text-sm">{description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Deep Dive UI Section */}
      <section id="how-it-works" className="relative z-10 border-y border-white/[0.05] bg-white/[0.01] py-32 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">Zero configuration pipeline.<br/><span className="text-white/40">From raw CSV to production API.</span></h2>
            <div className="space-y-8 mt-10">
              {[
                { title: 'Secure Data Upload', desc: 'Drag and drop transaction CSVs. We validate schema and parse timestamps natively within the browser.' },
                { title: 'Autonomous Engine', desc: 'XGBoost compiles internally, automatically handling hyperparameter tuning and cross-validation grids.' },
                { title: 'Interactive Analytics', desc: 'Explore the BI platform. Drill down into top segments and filter time series revenue predictions.' },
              ].map((step, i) => (
                <div key={i} className="flex gap-4 group">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm border border-indigo-500/30 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                      {i + 1}
                    </div>
                    {i !== 2 && <div className="w-px h-full bg-white/10 mt-2" />}
                  </div>
                  <div className="pb-8">
                    <h4 className="text-lg font-semibold text-white mb-2">{step.title}</h4>
                    <p className="text-sm text-white/40 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl opacity-20 blur-2xl" />
            <div className="relative rounded-2xl border border-white/10 bg-black/50 p-6 backdrop-blur-sm shadow-2xl flex flex-col gap-4">
              {/* Fake dashboard UI component */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                </div>
                <div className="font-mono text-xs text-white/30">analytics.service.ts</div>
              </div>
              <div className="flex items-end gap-3 h-48 px-4 pb-4 pt-10 border-b border-white/5">
                 {[40, 70, 45, 90, 65, 85, 110].map((h, i) => (
                    <motion.div 
                      key={i}
                      initial={{ height: 0 }}
                      whileInView={{ height: `${h}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: i * 0.1 }}
                      className="flex-1 bg-gradient-to-t from-indigo-500/50 to-purple-500/50 rounded-t-sm"
                    />
                 ))}
                 <div className="absolute inset-x-8 bottom-4 h-px border-t border-dashed border-emerald-400/50" />
                 <span className="absolute right-4 bottom-5 text-[10px] text-emerald-400 font-mono">Prediction Delta</span>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                  <div className="text-[10px] text-white/40 uppercase">Average CLV</div>
                  <div className="text-xl text-white font-bold">₹1,245<span className="text-emerald-400 text-xs ml-2">↑ 21%</span></div>
                </div>
                <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                  <div className="text-[10px] text-white/40 uppercase">Live Model Status</div>
                  <div className="text-sm text-emerald-400 font-semibold flex items-center mt-1"><div className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-2 animate-pulse"/>ONLINE</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Showcase */}
      <section id="pricing" className="relative z-10 max-w-6xl mx-auto px-6 py-32">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Transparent limits.</h2>
          <p className="text-white/40 text-lg max-w-2xl mx-auto">Scale your data architecture seamlessly logic. No hidden inference fees, pay only for capability.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {pricing.map((plan, i) => (
            <motion.div 
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`relative p-8 rounded-3xl border ${plan.popular ? 'border-indigo-500/50 bg-indigo-500/5' : 'border-white/[0.08] bg-white/[0.02]'} flex flex-col h-full hover:bg-white/[0.04] transition-colors`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-8 -translate-y-1/2 px-3 py-1 bg-indigo-500 text-white text-[10px] uppercase tracking-widest font-bold rounded-full">
                  Most Popular
                </div>
              )}
              <h3 className="text-xl font-semibold text-white mb-2">{plan.name}</h3>
              <p className="text-sm text-white/40 mb-6 min-h-10">{plan.desc}</p>
              <div className="mb-8">
                <span className="text-4xl font-bold text-white">{plan.price}</span>
                {plan.period && <span className="text-white/40 ml-1">{plan.period}</span>}
              </div>
              
              <ul className="mb-10 space-y-4 flex-1">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start text-sm text-white/70">
                    <CheckCircle2 className="w-5 h-5 text-indigo-400 mr-3 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              
              <Link href={plan.href} className="mt-auto">
                <button className={`w-full py-4 rounded-xl text-sm font-semibold transition-all ${plan.popular ? 'bg-indigo-500 hover:bg-indigo-400 text-white shadow-xl shadow-indigo-500/20' : 'bg-white/[0.06] hover:bg-white/[0.1] text-white border border-white/5'}`}>
                  {plan.cta}
                </button>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="relative z-10 max-w-3xl mx-auto px-6 py-20 border-t border-white/5">
        <h2 className="text-3xl font-bold text-white mb-10 text-center">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqs.map((faq, i) => (
            <div key={i} className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
              <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2"><div className="w-1.5 h-1.5 bg-indigo-500 rounded-full" /> {faq.q}</h4>
              <p className="text-white/50 text-sm leading-relaxed pl-3.5 border-l-2 border-white/5">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Bottom */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-32 pt-16">
        <div className="text-center p-12 md:p-20 rounded-3xl border border-indigo-500/20 bg-gradient-to-b from-indigo-500/10 to-transparent relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to empower your growth?</h2>
          <p className="text-white/40 text-lg mb-10 max-w-xl mx-auto">Create an account today and run your first 1,000 predictions entirely mapping for free. No credit card required.</p>
          <Link href="/auth/signup">
            <button className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-black hover:bg-white/90 font-bold transition-all duration-200 hover:shadow-2xl hover:shadow-white/20 hover:scale-[1.02]">
              Create Free Account
              <ChevronRight className="w-5 h-5" />
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.05] bg-black/20 pt-16 pb-8 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <Activity className="w-5 h-5 text-indigo-400" />
              <span className="font-bold text-white tracking-tight">CLVPredict</span>
            </div>
            <p className="text-white/40 text-sm max-w-sm leading-relaxed">
              Automated Customer Lifetime Value intelligence and predictive analytics for modern SaaS businesses.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-white/40">
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Integrations</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Changelog</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-white/40">
              <li><a href="#" className="hover:text-indigo-400 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto pt-8 border-t border-white/5 text-center md:text-left flex flex-col md:flex-row items-center justify-between">
          <p className="text-xs text-white/20">
            © {new Date().getFullYear()} CLVPredict Inc. All rights reserved. Built with Next.js 16.
          </p>
          <div className="flex gap-4 mt-4 md:mt-0 text-white/20 text-xs">
            <span>System Status: <span className="text-emerald-400">All Systems Operational</span></span>
          </div>
        </div>
      </footer>
    </main>
  );
}
