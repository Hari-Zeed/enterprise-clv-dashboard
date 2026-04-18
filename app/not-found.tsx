import Link from 'next/link';
import { Search, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[oklch(0.118_0.008_264)] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="relative z-10 text-center max-w-md w-full">
        <h1 className="text-9xl font-bold text-white/5 tracking-tighter select-none">404</h1>
        
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 pt-4">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
            <Search className="w-8 h-8 text-indigo-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Page Not Found</h2>
          <p className="text-sm text-white/40 mb-8 leading-relaxed max-w-sm mx-auto">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
          
          <Link href="/">
            <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-semibold transition-all duration-200 mx-auto hover:shadow-lg hover:shadow-indigo-500/20">
              <ArrowLeft className="w-4 h-4" />
              Return Home
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
