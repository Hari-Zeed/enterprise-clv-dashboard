'use client';

import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SinglePredictionForm } from '@/components/dashboard/single-prediction-form';
import { Skeleton } from '@/components/ui/skeleton';
import { usePredictions } from '@/hooks/use-predictions';
import { Clock, Zap, FileText, RefreshCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

const SEGMENT_STYLE: Record<string, { bg: string; text: string; border: string }> = {
  'High Value':   { bg: 'bg-indigo-500/15', text: 'text-indigo-400',  border: 'border-indigo-500/25' },
  'VIP':          { bg: 'bg-violet-500/15', text: 'text-violet-400',  border: 'border-violet-500/25' },
  'Champions':    { bg: 'bg-emerald-500/15',text: 'text-emerald-400', border: 'border-emerald-500/25' },
  'Medium Value': { bg: 'bg-blue-500/15',   text: 'text-blue-400',    border: 'border-blue-500/25' },
  'Loyal':        { bg: 'bg-teal-500/15',   text: 'text-teal-400',    border: 'border-teal-500/25' },
  'At Risk':      { bg: 'bg-amber-500/15',  text: 'text-amber-400',   border: 'border-amber-500/25' },
  'Low Value':    { bg: 'bg-slate-500/15',  text: 'text-slate-400',   border: 'border-slate-500/25' },
  'Inactive':     { bg: 'bg-red-500/15',    text: 'text-red-400',     border: 'border-red-500/25' },
};

export default function PredictionsPage() {
  const { predictions, isLoading, mutate } = usePredictions(15);

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex items-start justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Predictions</h1>
          <p className="text-sm text-white/35 mt-1">Generate individual CLV predictions via the active ML model</p>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Tabs defaultValue="single" className="w-full">
          <TabsList className="bg-white/[0.04] border border-white/[0.07] rounded-xl p-1 h-auto w-fit">
            <TabsTrigger
              value="single"
              className="rounded-lg px-4 py-2 text-sm text-white/40 data-[state=active]:bg-white/[0.08] data-[state=active]:text-white data-[state=active]:shadow-none flex items-center gap-2"
            >
              <Zap className="w-3.5 h-3.5" />
              Single Prediction
            </TabsTrigger>
            <TabsTrigger
              value="batch"
              className="rounded-lg px-4 py-2 text-sm text-white/40 data-[state=active]:bg-white/[0.08] data-[state=active]:text-white data-[state=active]:shadow-none flex items-center gap-2"
            >
              <FileText className="w-3.5 h-3.5" />
              Batch
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/25">Soon</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="single" className="mt-6">
            <SinglePredictionForm />
          </TabsContent>

          <TabsContent value="batch" className="mt-6">
            <div className="section-card text-center py-16">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">Batch Predictions Coming Soon</h3>
              <p className="text-sm text-white/40 max-w-xs mx-auto">
                Upload a CSV file to score an entire customer cohort at once.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Prediction History */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
        className="section-card"
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-semibold text-white">Prediction History</h3>
            <p className="text-xs text-white/35 mt-0.5">Last {predictions.length} predictions</p>
          </div>
          <button
            onClick={() => mutate()}
            className="flex items-center gap-1.5 text-xs text-white/35 hover:text-white/60 px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] transition-all duration-200"
          >
            <RefreshCcw className="w-3 h-3" />
            Refresh
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-white/[0.04]">
                <div className="space-y-2">
                  <Skeleton className="h-3 w-24 shimmer bg-white/[0.05]" />
                  <Skeleton className="h-2.5 w-16 shimmer bg-white/[0.04]" />
                </div>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-5 w-20 rounded-full shimmer bg-white/[0.05]" />
                  <Skeleton className="h-4 w-16 shimmer bg-white/[0.05]" />
                </div>
              </div>
            ))}
          </div>
        ) : predictions.length > 0 ? (
          <div>
            {/* Header Row */}
            <div className="grid grid-cols-12 gap-4 px-3 pb-2 border-b border-white/[0.06]">
              <span className="col-span-4 text-[10px] font-semibold text-white/30 uppercase tracking-wider">Customer</span>
              <span className="col-span-3 text-[10px] font-semibold text-white/30 uppercase tracking-wider">Date</span>
              <span className="col-span-2 text-[10px] font-semibold text-white/30 uppercase tracking-wider">Segment</span>
              <span className="col-span-2 text-[10px] font-semibold text-white/30 uppercase tracking-wider text-right">CLV</span>
              <span className="col-span-1 text-[10px] font-semibold text-white/30 uppercase tracking-wider text-right">Conf.</span>
            </div>

            <div className="divide-y divide-white/[0.04]">
              {predictions.map((p, i) => {
                let customerId = `CUST-${p.id.slice(-6).toUpperCase()}`;
                try {
                  const input = JSON.parse(p.inputData || '{}');
                  if (input.customer_id) customerId = String(input.customer_id);
                } catch {}
                const style = SEGMENT_STYLE[p.segment ?? ''] ?? SEGMENT_STYLE['Low Value'];

                return (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="grid grid-cols-12 gap-4 px-3 py-3 hover:bg-white/[0.02] transition-colors rounded-lg group"
                  >
                    <div className="col-span-4 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-white/[0.05] border border-white/[0.07] flex items-center justify-center text-[10px] font-bold text-white/40 flex-shrink-0">
                        {customerId.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="text-xs font-medium text-white/75 truncate">{customerId}</span>
                    </div>
                    <div className="col-span-3 flex items-center">
                      <span className="text-xs text-white/35 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(p.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="col-span-2 flex items-center">
                      {p.segment ? (
                        <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded-md border', style.bg, style.text, style.border)}>
                          {p.segment}
                        </span>
                      ) : (
                        <span className="text-xs text-white/20">—</span>
                      )}
                    </div>
                    <div className="col-span-2 flex items-center justify-end">
                      <span className="text-sm font-bold text-white tabular-nums">
                        ${p.predictedValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                    <div className="col-span-1 flex items-center justify-end">
                      <span className={cn('text-xs font-medium tabular-nums', p.confidenceScore > 0.8 ? 'text-emerald-400' : p.confidenceScore > 0.6 ? 'text-amber-400' : 'text-red-400')}>
                        {(p.confidenceScore * 100).toFixed(0)}%
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center mx-auto mb-3">
              <Zap className="w-5 h-5 text-white/20" />
            </div>
            <p className="text-sm text-white/30">No predictions yet — use the form above to get started</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
