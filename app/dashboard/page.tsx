'use client';

import { useSession } from 'next-auth/react';
import { motion as _motion, AnimatePresence } from 'framer-motion';
const motion = _motion as any;
import {
  BarChart3, Users, TrendingUp, PieChart,
  Upload, Zap, Database, ArrowRight, Brain,
  Activity, Clock, CheckCircle2, Circle, AlertCircle,
} from 'lucide-react';
import React from 'react';
import { KPICard } from '@/components/dashboard/kpi-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useDashboardKPIs } from '@/hooks/use-dashboard-kpis';
import { usePredictions } from '@/hooks/use-predictions';
import { useActiveModel } from '@/hooks/use-active-model';
import { useAnalyticsTrends } from '@/hooks/use-analytics-trends';
import {
  XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, Area, AreaChart,
} from 'recharts';
import { cn, formatCurrency, formatCompactCurrency } from '@/lib/utils';
import { CustomTooltip } from '@/components/dashboard/chart-tooltip'; // Use shared tooltip if exists or locally define

// ─── Shared Tooltip ──────────────────────────────────────────
const GlassTooltip = React.memo(({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0a0a12]/90 backdrop-blur-2xl shadow-[0_16px_64px_-12px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.05)] px-5 py-3.5 min-w-[170px] animate-in fade-in zoom-in-95 duration-200">
      <p className="text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-2">{String(label ?? '')}</p>
      <div className="space-y-1.5">
        {(payload ?? []).map((entry: any, i: number) => (
          <div key={i} className="flex items-center justify-between gap-5 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full ring-2 ring-white/10" style={{ backgroundColor: entry.stroke || entry.color || entry.fill || '#6366f1' }} />
              <span className="text-white/60 text-xs">{String(entry.name ?? '')}</span>
            </div>
            <span className="font-semibold text-white tabular-nums">
              {typeof entry.value === 'number' ? formatCurrency(entry.value) : String(entry.value ?? '')}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
});
GlassTooltip.displayName = 'GlassTooltip';

// ─── Floating Card ───────────────────────────────────────────
const FloatingCard = React.memo(function FloatingCard({ children, delay = 0, className = '' }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.21, 1.02, 0.73, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.4, ease: "easeOut" } }}
      className={cn(
        'rounded-2xl border border-white/[0.06] bg-white/[0.025] backdrop-blur-sm p-6 relative group transition-colors duration-300 hover:border-white/[0.12] hover:bg-white/[0.04]',
        className
      )}
    >
      {/* Ambient background glow hover state */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none" />
      {children}
    </motion.div>
  );
});

// ─── Segment colours ────────────────────────────────────────
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

// ─── Quick action card ───────────────────────────────────────
const QuickAction = React.memo(function QuickAction({ href, icon: Icon, label, description, color }: any) {
  return (
    <Link href={href} prefetch={true}>
      <div className="flex items-center gap-4 p-4 rounded-xl border border-white/[0.04] bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/10 transition-all duration-300 group cursor-pointer">
        <div className={cn('p-2.5 rounded-xl transition-transform duration-300 group-hover:scale-110', color)}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">{label}</p>
          <p className="text-[11px] text-white/35 mt-0.5">{description}</p>
        </div>
        <div className="w-8 h-8 rounded-full border border-white/[0.04] bg-white/[0.02] flex items-center justify-center group-hover:bg-indigo-500 group-hover:border-indigo-400 group-hover:text-white text-white/20 transition-all duration-300 transform group-hover:translate-x-1">
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </Link>
  );
});

// ─── Main Page ────────────────────────────────────────────────
export default function DashboardPage() {
  const { data: session } = useSession();
  const { kpis, isLoading: kpisLoading } = useDashboardKPIs();
  const { predictions, isLoading: predsLoading } = usePredictions(8);
  const { trends, isLoading: trendsLoading } = useAnalyticsTrends(90);
  const { model, isLoading: modelLoading } = useActiveModel();

  const hasData = !kpisLoading && kpis && kpis.totalCustomers > 0;
  const hasTrends = hasData && trends && trends.clvTrends.length > 0;

  const greeting = React.useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  return (
    <div className="space-y-8 pb-10">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20, filter: 'blur(4px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.6, ease: [0.21, 1.02, 0.73, 1] }}
        className="flex items-start justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
             {greeting}, <span className="text-indigo-400">{session?.user?.name?.split(' ')[0] || 'User'}</span>
          </h1>
          <p className="text-sm text-white/40 mt-1.5 flex items-center gap-2">
            {hasData ? (
              <>Your CLV intelligence overview is active and responding.</>
            ) : (
              <>Welcome to the platform. Complete setup to unlock analytics.</>
            )}
          </p>
        </div>

        {hasData && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] uppercase tracking-wider font-bold flex-shrink-0 backdrop-blur-md shadow-[0_0_20px_rgba(16,185,129,0.15)]"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 dot-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            Model Live
          </motion.div>
        )}
      </motion.div>

      {/* Hero Welcome Empty State */}
      {!hasData && !kpisLoading && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/[0.05] to-purple-500/[0.02] backdrop-blur-xl p-10 lg:p-14 text-center overflow-hidden relative group"
        >
          {/* Anti-gravity animated background glow */}
          <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] animate-glow-breathe pointer-events-none" />
          
          <div className="relative z-10 flex flex-col items-center gap-6 max-w-2xl mx-auto">
            <div className="relative animate-antigravity">
              <div className="w-24 h-24 rounded-[2rem] bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shadow-[0_0_40px_rgba(99,102,241,0.2)] backdrop-blur-xl">
                <Database className="w-10 h-10 text-indigo-400" />
              </div>
              <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.8)] border border-indigo-300/50 pulse-dot">
                <Zap className="w-3.5 h-3.5 text-white" />
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-3xl font-bold text-white tracking-tight">Intelligence Workspace Ready</h3>
              <p className="text-white/50 leading-relaxed text-sm max-w-md mx-auto">
                Complete the onboarding sequence to activate the XGBoost pipeline and generate your first Customer Lifetime Value predictions.
              </p>
            </div>

            <div className="w-full max-w-md bg-black/20 border border-white/[0.06] rounded-2xl p-6 text-left space-y-4 backdrop-blur-md">
               <div className="flex items-start gap-4">
                 <div className="mt-0.5"><CheckCircle2 className="w-5 h-5 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" /></div>
                 <div>
                   <p className="text-sm text-white font-medium">Workspace Provisioned</p>
                   <p className="text-[11px] text-white/40 mt-0.5">Secure environment initialized</p>
                 </div>
               </div>
               
               <div className="w-px h-5 bg-white/10 ml-2.5 -my-1" />

               <Link href="/dashboard/upload" className="flex items-start gap-4 group/step cursor-pointer text-left focus:outline-none">
                 <div className="mt-0.5"><Circle className="w-5 h-5 text-indigo-400 group-hover/step:fill-indigo-500/20 transition-all duration-300" /></div>
                 <div>
                   <p className="text-sm text-indigo-300 group-hover/step:text-indigo-200 font-semibold transition-colors">Upload Customer Data</p>
                   <p className="text-[11px] text-white/40 group-hover/step:text-white/60 mt-0.5 transition-colors">Connect CSV with standard RFM features.</p>
                 </div>
               </Link>

               <div className="w-px h-5 bg-white/10 ml-2.5 -my-1" />

               <div className="flex items-start gap-4 opacity-40">
                 <div className="mt-0.5"><Circle className="w-5 h-5 text-white mt-0.5" /></div>
                 <div>
                   <p className="text-sm text-white font-medium">Train ML Predictor</p>
                   <p className="text-[11px] text-white mt-0.5">XGBoost runs automatically post-upload.</p>
                 </div>
               </div>
            </div>

            <Link href="/dashboard/upload" className="mt-2 text-center w-full max-w-md">
              <Button className="w-full h-12 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold shadow-[0_4px_24px_-4px_rgba(99,102,241,0.5)] transition-all duration-300 hover:shadow-[0_8px_32px_-4px_rgba(99,102,241,0.6)] hover:-translate-y-1 gap-2">
                <Upload className="w-4 h-4" /> Begin Data Upload
              </Button>
            </Link>
          </div>
        </motion.div>
      )}

      {/* KPI Cards */}
      {kpisLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
             <Skeleton key={i} className="h-32 rounded-2xl bg-white/[0.03] border border-white/[0.05]" />
          ))}
        </div>
      ) : hasData ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
             title="Portfolio Size" value={kpis!.totalCustomers.toLocaleString()}
             description="registered users" icon={Users} glowColor="blue" index={0}
             trend={{ value: kpis!.totalCustomersTrend, label: 'vs prev period' }}
          />
          <KPICard
            title="Average CLV"
            value={formatCurrency(kpis!.avgClv)}
            description="lifetime val" icon={TrendingUp} glowColor="emerald" index={1}
            trend={{ value: kpis!.avgClvTrend, label: 'vs prev period' }}
          />
          <KPICard
            title="High-Value" value={kpis!.highValueCustomers.toLocaleString()}
            description="elite segment" icon={BarChart3} glowColor="violet" index={2}
            trend={{ value: kpis!.highValueTrend, label: 'vs prev period' }}
          />
          <KPICard
            title="Ecosystem Value"
            value={formatCompactCurrency(kpis!.predictedRevenue)}
            description="predicted revenue" icon={PieChart} glowColor="amber" index={3}
            trend={{ value: kpis!.revenueTrend, label: 'vs prev period' }}
          />
        </div>
      ) : null}

      {/* Charts + Recent Predictions */}
      {(hasTrends || trendsLoading) && hasData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {/* CLV Area Chart */}
          <FloatingCard className="lg:col-span-2 xl:col-span-3" delay={0.2}>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-400" /> Core Trajectory
                </h3>
                <p className="text-xs text-white/35 mt-1">Average lifetime value stabilization (90d)</p>
              </div>
              <Badge variant="outline" className="bg-indigo-500/10 border-indigo-500/20 text-indigo-400 font-medium tracking-wide">
                90-Day Trend
              </Badge>
            </div>
            
            {trendsLoading ? (
               <Skeleton className="w-full h-[220px] rounded-xl bg-white/[0.03] border-white/5" />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={trends!.clvTrends} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="clvArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => formatCompactCurrency(v)} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} />
                  <Tooltip content={<GlassTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '4 4' }} />
                  <Area
                    type="monotone" dataKey="avgClv" stroke="#818cf8" strokeWidth={2.5}
                    fill="url(#clvArea)" dot={{ r: 4, fill: '#312e81', stroke: '#818cf8', strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }} name="Avg CLV"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </FloatingCard>

          {/* Recent Predictions */}
          <FloatingCard className="lg:col-span-1 xl:col-span-2 flex flex-col" delay={0.3}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-semibold text-white flex gap-2"><Clock className="w-4 h-4 text-emerald-400" /> AI Outputs</h3>
                <p className="text-xs text-white/35 mt-1">Live prediction stream</p>
              </div>
              <Link href="/dashboard/predictions" prefetch={true}>
                <Button variant="ghost" size="sm" className="h-8 text-xs bg-white/[0.03] text-white/60 hover:bg-white/[0.08] hover:text-white rounded-lg">
                  View full ledger
                </Button>
              </Link>
            </div>

            {predsLoading ? (
              <Skeleton className="w-full h-full min-h-[220px] rounded-xl bg-white/[0.03] border-white/5" />
            ) : predictions.length > 0 ? (
              <div className="space-y-1.5 flex-1 overflow-auto no-scrollbar pr-1">
                {predictions.slice(0, 6).map((p, i) => {
                  let customerId = `CUST-${String(p?.id ?? Math.random().toString()).slice(-6).toUpperCase()}`;
                  try {
                    const input = JSON.parse(p?.inputData || '{}');
                    if (input.customer_id) customerId = String(input.customer_id);
                  } catch {}
                  const style = SEGMENT_STYLE[p?.segment ?? ''] ?? SEGMENT_STYLE['Low Value'];
                  return (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 + 0.3 }}
                      className="group flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.04] border border-transparent hover:border-white/[0.06] transition-all duration-300"
                    >
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-lg bg-black/40 border border-white/5 flex items-center justify-center text-[10px] font-bold text-white/50 group-hover:bg-indigo-500/20 group-hover:border-indigo-500/30 group-hover:text-indigo-300 transition-colors">
                           {customerId.slice(0,2)}
                         </div>
                         <div>
                           <p className="text-xs font-semibold text-white/90 group-hover:text-white transition-colors">{customerId}</p>
                           <p className="text-[10px] text-white/30 mt-0.5">{new Date(p.createdAt).toLocaleDateString()}</p>
                         </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-sm font-bold text-white tabular-nums drop-shadow-md">
                          {typeof p?.predictedValue === 'number' ? formatCurrency(p.predictedValue) : '₹0'}
                        </span>
                        {p?.segment && (
                          <span className={cn('text-[9px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded border', style.bg, style.text, style.border)}>
                            {p.segment}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-8">
                <div className="w-12 h-12 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-center mb-3">
                  <Activity className="w-5 h-5 text-white/20" />
                </div>
                <p className="text-sm text-white/30">Awaiting inference data</p>
              </div>
            )}
          </FloatingCard>
        </div>
      )}

      {/* Quick Actions + Model Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <FloatingCard delay={0.4}>
          <div className="flex items-center justify-between mb-6">
             <div>
               <h3 className="text-sm font-semibold text-white">Operations</h3>
               <p className="text-xs text-white/35 mt-1">Platform utilities</p>
             </div>
          </div>
          <div className="grid grid-cols-1 gap-3">
            <QuickAction href="/dashboard/upload" icon={Upload} label="Data Pipeline" description="Ingest CSV and queue XGBoost training" color="bg-indigo-500/15 text-indigo-400" />
            <QuickAction href="/dashboard/predictions" icon={Zap} label="Inference Engine" description="Compute individual deterministic values" color="bg-emerald-500/15 text-emerald-400" />
            {hasData && (
              <QuickAction href="/dashboard/analytics" icon={BarChart3} label="BI Analytics Suite" description="Explore advanced visualization mechanics" color="bg-violet-500/15 text-violet-400" />
            )}
          </div>
        </FloatingCard>

        {/* Model Info (Animated Tech Panel style) */}
        <FloatingCard delay={0.5} className="overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-emerald-500/10 transition-colors duration-700" />
          
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Brain className="w-4 h-4 text-emerald-400" /> Core Engine
              </h3>
              <p className="text-xs text-white/35 mt-1">XGBoost Regression Processor</p>
            </div>
            <div className="p-2 backdrop-blur-md rounded-xl bg-white/[0.03] border border-white/[0.05] shadow-inner">
               <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,1)] dot-pulse" />
            </div>
          </div>

          <div className="space-y-4 relative z-10">
            {modelLoading ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-6 w-full rounded-md bg-white/[0.03] border border-white/[0.05]" />
                ))}
              </div>
            ) : model.hasActiveModel ? (
              <div className="grid grid-cols-2 gap-4">
                 <div className="p-4 rounded-xl bg-black/20 border border-white/[0.04]">
                   <p className="text-[10px] text-white/40 uppercase tracking-widest font-semibold mb-1">State</p>
                   <p className="text-sm font-bold text-emerald-400">v{model.modelDetails?.version} Active</p>
                 </div>
                 <div className="p-4 rounded-xl bg-black/20 border border-white/[0.04]">
                   <p className="text-[10px] text-white/40 uppercase tracking-widest font-semibold mb-1">Accuracy (R²)</p>
                   <p className="text-sm font-bold text-white tabular-nums drop-shadow-md">
                     {model.modelDetails?.accuracy ? (model.modelDetails.accuracy * 100).toFixed(1) + '%' : 'N/A'}
                   </p>
                 </div>
                 <div className="p-4 rounded-xl bg-black/20 border border-white/[0.04]">
                   <p className="text-[10px] text-white/40 uppercase tracking-widest font-semibold mb-1">RMSE Error</p>
                   <p className="text-sm font-bold text-white/70 tabular-nums">{model.modelDetails?.rmse?.toFixed(2) ?? 'N/A'}</p>
                 </div>
                 <div className="p-4 rounded-xl bg-black/20 border border-white/[0.04]">
                   <p className="text-[10px] text-white/40 uppercase tracking-widest font-semibold mb-1">Last Configured</p>
                   <p className="text-sm font-bold text-white/70">{new Date(model.modelDetails?.updatedAt || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                 </div>
              </div>
            ) : (
              <div className="p-6 rounded-xl border border-amber-500/20 bg-amber-500/5 text-center">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-3">
                   <AlertCircle className="w-5 h-5" />
                </div>
                <p className="text-sm font-bold text-white mb-1">Offline</p>
                <p className="text-xs text-white/50 mb-4">Feed data to ignite the inference engine.</p>
                <Link href="/dashboard/upload">
                  <Button variant="outline" size="sm" className="bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 text-amber-300 w-full rounded-lg">
                    Initialize Setup
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </FloatingCard>
      </div>
    </div>
  );
}
