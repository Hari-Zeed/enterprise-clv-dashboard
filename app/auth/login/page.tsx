'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { LoginAuthForm } from '@/components/auth/login-auth-form';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, ShieldCheck, Zap, Activity } from 'lucide-react';

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (status === 'authenticated' && session) {
      router.push('/dashboard');
    }
  }, [status, session, router]);

  if (!mounted || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[oklch(0.118_0.008_264)]">
        <div className="w-8 h-8 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[oklch(0.118_0.008_264)] relative overflow-hidden text-white">
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>

      {/* Left side - Form */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full lg:w-1/2 flex flex-col justify-center px-6 py-12 md:px-16 lg:px-24 xl:px-32 relative z-10"
      >
        <div className="w-full max-w-md mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-10 text-center lg:text-left"
          >
            <div className="flex items-center justify-center lg:justify-start gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">CLV<span className="text-indigo-400">Predict</span></span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">
              Welcome Back
            </h1>
            <p className="text-white/40 text-lg">
              Sign in to access your predictive analytics dashboard.
            </p>
          </motion.div>

          {/* Form Wrapper */}
          <div className="bg-white/[0.02] backdrop-blur-md sm:border border-white/[0.08] sm:p-8 rounded-3xl transition-all">
            <LoginAuthForm />
          </div>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center text-white/40 mt-8 text-sm"
          >
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
              Sign up
            </Link>
          </motion.p>
        </div>
      </motion.div>

      {/* Right side - Illustration/Gradient */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="hidden lg:flex w-1/2 relative p-12 items-center justify-center border-l border-white/[0.05] bg-white/[0.01]"
      >
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px_32px]" />
        
        <div className="relative z-10 w-full max-w-lg bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-3xl p-12 flex flex-col gap-8 transition-transform hover:scale-[1.01] duration-500 shadow-2xl">
          <div className="space-y-4">
            <h2 className="text-3xl xl:text-4xl font-bold text-white leading-tight">
              Enterprise Grade <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">CLV Insights</span>
            </h2>
            <p className="text-lg text-white/40">
              Unlock the power of advanced machine learning models to predict and optimize customer lifetime value accurately.
            </p>
          </div>

          <div className="space-y-6 pt-6 border-t border-white/[0.08]">
            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                <Zap className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-lg">Real-time Predictions</h3>
                <p className="text-white/40 text-sm mt-1">Process millions of customer records in seconds natively in browser.</p>
              </div>
            </div>
            
            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-lg">Bank-grade Security</h3>
                <p className="text-white/40 text-sm mt-1">Your data is fully encrypted and never leaves your secure tenancy.</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
