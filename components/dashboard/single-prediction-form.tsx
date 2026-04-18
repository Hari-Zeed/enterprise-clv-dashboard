'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  AlertCircle, CheckCircle, RefreshCcw, Loader2,
  Zap, TrendingUp, Target, Activity, Copy, Check
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';

interface PredictionResult {
  clv: number;
  confidence: number;
  segment: string;
  customer_id: string;
}

const FIELD_CONFIG = [
  {
    key: 'customer_id',
    label: 'Customer ID',
    type: 'text',
    placeholder: 'CUST-001',
    hint: 'Optional identifier',
    required: false,
    icon: '🆔',
  },
  {
    key: 'recency',
    label: 'Recency',
    type: 'number',
    placeholder: '30',
    hint: 'Days since last purchase',
    required: true,
    unit: 'days',
    icon: '📅',
  },
  {
    key: 'frequency',
    label: 'Frequency',
    type: 'number',
    placeholder: '5',
    hint: 'Number of purchases',
    required: true,
    unit: 'orders',
    icon: '🔄',
  },
  {
    key: 'monetary_value',
    label: 'Monetary Value',
    type: 'number',
    placeholder: '1000.00',
    hint: 'Average order value in ₹',
    required: true,
    unit: '₹',
    icon: '💰',
  },
  {
    key: 'tenure',
    label: 'Tenure',
    type: 'number',
    placeholder: '12',
    hint: 'Months as a customer',
    required: true,
    unit: 'months',
    icon: '📆',
  },
] as const;

const SEGMENT_STYLES: Record<string, { gradient: string; badge: string; badgeText: string }> = {
  Champions:    { gradient: 'from-emerald-500/20 to-teal-500/20', badge: 'bg-emerald-500/15 border-emerald-500/25 text-emerald-400', badgeText: 'text-emerald-400' },
  VIP:          { gradient: 'from-violet-500/20 to-purple-500/20', badge: 'bg-violet-500/15 border-violet-500/25 text-violet-400', badgeText: 'text-violet-400' },
  Loyal:        { gradient: 'from-blue-500/20 to-indigo-500/20', badge: 'bg-blue-500/15 border-blue-500/25 text-blue-400', badgeText: 'text-blue-400' },
  'High Value': { gradient: 'from-indigo-500/20 to-blue-500/20', badge: 'bg-indigo-500/15 border-indigo-500/25 text-indigo-400', badgeText: 'text-indigo-400' },
  'At Risk':    { gradient: 'from-amber-500/20 to-orange-500/20', badge: 'bg-amber-500/15 border-amber-500/25 text-amber-400', badgeText: 'text-amber-400' },
  Inactive:     { gradient: 'from-red-500/20 to-rose-500/20', badge: 'bg-red-500/15 border-red-500/25 text-red-400', badgeText: 'text-red-400' },
};
const DEFAULT_STYLE = { gradient: 'from-slate-500/20 to-slate-600/20', badge: 'bg-slate-500/15 border-slate-500/25 text-slate-400', badgeText: 'text-slate-400' };

export function SinglePredictionForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    customer_id: '', recency: '', frequency: '', monetary_value: '', tenure: '',
  });
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    if (!result) return;
    const confidencePct = (result.confidence * 100).toFixed(1);
    const text = `Predicted CLV: ${formatCurrency(result.clv)}\nConfidence: ${confidencePct}%\nSegment: ${result.segment}${result.customer_id && result.customer_id !== 'single_prediction' ? `\nCustomer ID: ${result.customer_id}` : ''}`;
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    toast.success('Result copied to clipboard');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const recency = parseFloat(formData.recency);
      const frequency = parseFloat(formData.frequency);
      const monetary = parseFloat(formData.monetary_value);
      const tenure = parseFloat(formData.tenure);

      if (isNaN(recency) || isNaN(frequency) || isNaN(monetary) || isNaN(tenure)) {
        throw new Error('All metric fields must be valid numbers');
      }
      if (recency < 0 || frequency < 0 || tenure < 0) {
        throw new Error('Metrics cannot be negative');
      }

      const response = await fetch('/api/ml/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: [{
            customer_id: formData.customer_id || 'single_prediction',
            recency, frequency, monetary_value: monetary, tenure,
          }],
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Prediction failed');
      }

      const outcome = await response.json();
      if (outcome.success && outcome.data?.predictions?.length > 0) {
        setResult(outcome.data.predictions[0]);
        toast.success('Prediction generated successfully', { description: `CLV: ${formatCurrency(outcome.data.predictions[0].clv)}` });
      } else {
        throw new Error(outcome.error || 'Invalid response from server');
      }
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message, {
        action: { label: 'Retry', onClick: () => handleSubmit() },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const style = result ? (SEGMENT_STYLES[result.segment] ?? DEFAULT_STYLE) : DEFAULT_STYLE;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Form Panel */}
      <div className="lg:col-span-3 section-card">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Customer Metrics</h3>
            <p className="text-xs text-white/35 mt-0.5">Enter RFM data for CLV inference</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FIELD_CONFIG.map((field) => (
              <div key={field.key} className="space-y-1.5">
                <label htmlFor={field.key} className="flex items-center gap-1.5 text-xs font-medium text-white/50">
                  <span>{field.icon}</span>
                  {field.label}
                  {field.required && <span className="text-indigo-400">*</span>}
                </label>
                <div className="relative">
                  <Input
                    id={field.key}
                    name={field.key}
                    type={field.type}
                    placeholder={field.placeholder}
                    value={formData[field.key]}
                    onChange={handleInputChange}
                    required={field.required}
                    min={field.type === 'number' ? 0 : undefined}
                    step={field.key === 'monetary_value' ? '0.01' : undefined}
                    disabled={isLoading}
                    className="input-premium bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/25 focus-visible:ring-indigo-500/30 focus-visible:border-indigo-500/40 h-10"
                  />
                  {'unit' in field && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/25 pointer-events-none">
                      {field.unit}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-white/25">{field.hint}</p>
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/20"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Running Inference...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Generate CLV Prediction
              </>
            )}
          </button>
        </form>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              className="mt-4 flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20"
            >
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-red-400">Inference Error</p>
                <p className="text-xs text-red-400/70 mt-0.5">{error}</p>
              </div>
              <button
                onClick={() => handleSubmit()}
                className="flex items-center gap-1.5 text-xs text-red-400/70 hover:text-red-400 px-2.5 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 transition-all flex-shrink-0"
              >
                <RefreshCcw className="w-3 h-3" /> Retry
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Result Panel */}
      <div className="lg:col-span-2">
        <AnimatePresence mode="wait">
          {!result && !isLoading && (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="section-card h-full flex flex-col items-center justify-center text-center py-16"
            >
              <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center mb-4">
                <Target className="w-7 h-7 text-white/15" />
              </div>
              <p className="text-sm font-medium text-white/30">No result yet</p>
              <p className="text-xs text-white/20 mt-1">Fill in the metrics and run inference</p>
            </motion.div>
          )}

          {isLoading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="section-card h-[400px] flex flex-col items-center justify-center gap-4 border border-indigo-500/20 bg-indigo-500/5"
            >
              <div className="relative w-20 h-20 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-[3px] border-indigo-500/10" />
                <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-indigo-400 border-r-indigo-400 animate-spin" />
                <Zap className="w-8 h-8 text-indigo-400 animate-pulse" />
              </div>
              <div className="text-center">
                <p className="text-base font-semibold text-white/90">Running Pipeline</p>
                <p className="text-sm text-white/40 mt-1.5 flex items-center gap-1.5"><Activity className="w-3.5 h-3.5"/> Processing input features...</p>
              </div>
            </motion.div>
          )}

          {result && !isLoading && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.97, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 280, damping: 24 }}
              className={cn(
                'section-card relative overflow-hidden',
                `bg-gradient-to-br ${style.gradient}`
              )}
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

              <div className="flex items-center justify-between mb-5 relative z-10">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-semibold text-emerald-400">Prediction Complete</span>
                </div>
                <button 
                  onClick={handleCopy} 
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.05] text-white/50 hover:text-white transition-all duration-200"
                  title="Copy result"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span className="text-[10px] uppercase tracking-wider font-semibold">{isCopied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              {/* CLV Value */}
              <div className="mb-6">
                <p className="text-xs text-white/40 mb-1">Predicted Lifetime Value</p>
                <p className="text-5xl font-bold text-white tracking-tight tabular-nums">
                  {formatCurrency(result.clv)}
                </p>
                <p className="text-xs text-white/30 mt-1">estimated 12-month return</p>
              </div>

              {/* Confidence bar — result.confidence is 0.0–1.0 */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs text-white/50">
                    <Activity className="w-3 h-3" />
                    Confidence Score
                  </div>
                  <span className="text-sm font-bold text-white tabular-nums">{(result.confidence * 100).toFixed(1)}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${result.confidence * 100}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                    className={cn(
                      'h-full rounded-full',
                      result.confidence > 0.8 ? 'bg-gradient-to-r from-emerald-400 to-teal-400'
                        : result.confidence > 0.6 ? 'bg-gradient-to-r from-amber-400 to-yellow-400'
                        : 'bg-gradient-to-r from-red-400 to-orange-400'
                    )}
                  />
                </div>
              </div>

              {/* Segment */}
              <div className="mb-5">
                <p className="text-xs text-white/40 mb-2">Customer Segment</p>
                <span className={cn('inline-flex items-center px-3 py-1.5 rounded-xl text-sm font-semibold border', style.badge)}>
                  <TrendingUp className="w-3.5 h-3.5 mr-1.5" />
                  {result.segment}
                </span>
              </div>

              {/* Customer ID */}
              {result.customer_id && result.customer_id !== 'single_prediction' && (
                <div className="pt-4 border-t border-white/[0.07]">
                  <p className="text-xs text-white/30">Customer ID</p>
                  <p className="text-sm font-mono font-medium text-white/70 mt-0.5">{result.customer_id}</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
