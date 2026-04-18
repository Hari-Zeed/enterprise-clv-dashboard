'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCcw, ArrowLeft } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Global Error]', error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-[oklch(0.118_0.008_264)] text-white flex items-center justify-center p-6">
        <div className="text-center max-w-md mx-auto">
          <div className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-9 h-9 text-red-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">Something went wrong</h1>
          <p className="text-white/40 text-sm leading-relaxed mb-8">
            An unexpected error occurred. Our team has been notified. Please try again or go back.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => reset()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-semibold transition-all duration-200"
            >
              <RefreshCcw className="w-4 h-4" />
              Try Again
            </button>
            <a
              href="/"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.1] text-white/70 hover:text-white text-sm font-medium transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Home
            </a>
          </div>
          {error.digest && (
            <p className="mt-6 text-[10px] text-white/20 font-mono">
              Error ID: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
