'use client';

import { useState, useMemo } from 'react';
import { motion as _motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  LineChart, Line, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, Area, AreaChart,
} from 'recharts';
import {
  Users, TrendingUp, PieChart, Filter, Database,
  Search, ArrowUpRight, ArrowDownRight, RefreshCcw, Download,
  Sparkles, Crown, Target, Activity, BarChart3,
} from 'lucide-react';
import { useAnalyticsBI, type DateRangeOption } from '@/hooks/use-analytics-bi';
import { SEGMENT_COLORS } from '@/services/analytics.service';
import { toast } from 'sonner';

import React from 'react';
import { cn, formatCurrency, formatCompactCurrency } from '@/lib/utils';

// Cast motion to any to avoid React 19 / framer-motion v10 type conflicts
const motion = _motion as any;

// ─────────────────────────────────────────────────────────────
// Stagger animation presets
// ─────────────────────────────────────────────────────────────

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 24, filter: 'blur(6px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { type: 'spring', stiffness: 200, damping: 22 } },
};
const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  show: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 260, damping: 20 } },
};

// ─────────────────────────────────────────────────────────────
// Custom Recharts Tooltip — anti‑gravity glass style
// ─────────────────────────────────────────────────────────────

const GlassTooltip = React.memo(({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0a0a12]/90 backdrop-blur-2xl shadow-[0_16px_64px_-12px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.05)] px-5 py-3.5 min-w-[170px]">
      <p className="text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-2">{String(label ?? '')}</p>
      <div className="space-y-1.5">
        {(payload ?? []).map((entry: any, i: number) => (
          <div key={i} className="flex items-center justify-between gap-5 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full ring-2 ring-white/10" style={{ backgroundColor: entry.stroke || entry.color || entry.fill || '#6366f1' }} />
              <span className="text-white/60 text-xs">{String(entry.name ?? '')}</span>
            </div>
            <span className="font-semibold text-white tabular-nums">
              {String(entry.name ?? '').includes('Revenue') || String(entry.name ?? '').includes('CLV') || String(entry.name ?? '').includes('Value') || String(entry.name ?? '').includes('Avg')
                ? typeof entry.value === 'number' ? formatCurrency(entry.value) : entry.value
                : typeof entry.value === 'number' ? entry.value.toLocaleString() : String(entry.value ?? '')}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
});
GlassTooltip.displayName = 'GlassTooltip';

// ─────────────────────────────────────────────────────────────
// KPI Card — floating anti‑gravity style
// ─────────────────────────────────────────────────────────────

const GLOW_MAP: Record<string, string> = {
  blue:    'shadow-[0_0_60px_-15px_rgba(99,102,241,0.4)]',
  emerald: 'shadow-[0_0_60px_-15px_rgba(16,185,129,0.4)]',
  violet:  'shadow-[0_0_60px_-15px_rgba(139,92,246,0.4)]',
  amber:   'shadow-[0_0_60px_-15px_rgba(245,158,11,0.4)]',
};
const ICON_BG: Record<string, string> = {
  blue:    'bg-indigo-500/15 text-indigo-400',
  emerald: 'bg-emerald-500/15 text-emerald-400',
  violet:  'bg-violet-500/15 text-violet-400',
  amber:   'bg-amber-500/15 text-amber-400',
};

const KPICard = React.memo(function KPICard({ title, value, sub, trend, icon: Icon, glow }: any) {
  const isPositive = trend > 0;
  const isNeutral = trend === 0;
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -6, transition: { type: 'spring', stiffness: 400, damping: 18 } }}
      className={cn(
        'relative rounded-2xl border border-white/[0.07] bg-white/[0.03] backdrop-blur-md p-6 overflow-hidden group cursor-default',
        'hover:border-white/[0.15] transition-colors duration-300',
        GLOW_MAP[glow] ?? '',
      )}
    >
      {/* Ambient glow orb */}
      <div className={cn('absolute -top-10 -right-10 w-28 h-28 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700',
        glow === 'blue' ? 'bg-indigo-500/20' : glow === 'emerald' ? 'bg-emerald-500/20' : glow === 'violet' ? 'bg-violet-500/20' : 'bg-amber-500/20'
      )} />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px] font-semibold text-white/35 uppercase tracking-widest">{title}</span>
          <div className={cn('p-2 rounded-xl', ICON_BG[glow] ?? 'bg-white/10 text-white/50')}>
            <Icon className="w-4 h-4" />
          </div>
        </div>
        <div className="text-3xl font-bold tracking-tight text-white mb-1.5">{value}</div>
        <div className="flex items-center gap-2 text-xs">
          {!isNeutral && (
            <span className={cn('flex items-center gap-0.5 font-semibold px-1.5 py-0.5 rounded-md', isPositive ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10')}>
              {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {Math.abs(trend)}%
            </span>
          )}
          {isNeutral && <span className="text-white/25">—</span>}
          <span className="text-white/30">{sub}</span>
        </div>
      </div>
    </motion.div>
  );
});

// ─────────────────────────────────────────────────────────────
// Empty State
// ─────────────────────────────────────────────────────────────

const EmptyState = React.memo(function EmptyState({ onRetry }: { onRetry: () => void }) {
  return (
    <motion.div variants={scaleIn} initial="hidden" animate="show" className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-16 text-center mt-6">
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500/15 to-purple-500/15 border border-indigo-500/20 flex items-center justify-center mx-auto mb-5">
        <Database className="w-9 h-9 text-indigo-400" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">No analytics data yet</h3>
      <p className="text-sm text-white/40 mb-6 max-w-md mx-auto leading-relaxed">
        Generate predictions from your customer data to unlock the full Business Intelligence suite.
      </p>
      <Button onClick={onRetry} variant="outline" className="gap-2 rounded-xl border-white/10 hover:bg-white/[0.06]">
        <RefreshCcw className="w-4 h-4" /> Reset Filters
      </Button>
    </motion.div>
  );
});

// ─────────────────────────────────────────────────────────────
// Segment legend pill
// ─────────────────────────────────────────────────────────────
const SegmentPill = React.memo(function SegmentPill({ name, fill, percentage, revenue }: any) {
  return (
    <div className="flex items-center gap-3 py-2 px-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-colors">
      <div className="w-3 h-3 rounded-full ring-2 ring-white/10 shrink-0" style={{ backgroundColor: fill }} />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-white/80 truncate">{String(name ?? '')}</p>
        <p className="text-[10px] text-white/30">{typeof revenue === 'number' ? formatCompactCurrency(revenue) : '0'} revenue</p>
      </div>
      <span className="text-xs font-bold text-white/60 tabular-nums">{percentage ?? 0}%</span>
    </div>
  );
});

// ─────────────────────────────────────────────────────────────
// Section wrapper for floating cards
// ─────────────────────────────────────────────────────────────
const FloatingCard = React.memo(function FloatingCard({ children, delay = 0, className = '' }: any) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -4, transition: { type: 'spring', stiffness: 400, damping: 20 } }}
      className={cn(
        'rounded-2xl border border-white/[0.06] bg-white/[0.025] backdrop-blur-sm p-6 relative overflow-hidden group transition-colors duration-300 hover:border-white/[0.12]',
        className
      )}
    >
      {/* Orb that orbits naturally in the background on hover */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000 animate-orbit pointer-events-none" />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
});

// ─────────────────────────────────────────────────────────────
// Page Component
// ─────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [showFilters, setShowFilters] = useState(false);
  const bi = useAnalyticsBI();

  // Memoize chart gradient IDs to avoid SSR mismatch
  const gradients = useMemo(() => ({
    clv: 'clv-area-grad',
    bar: 'bar-grad',
  }), []);

  const handleExport = () => {
    if (!bi.hasData || !bi.data) {
      toast.error('No data available to export');
      return;
    }
    const { topCustomers } = bi.data;
    if (!topCustomers || topCustomers.length === 0) {
      toast.error('No customers to export');
      return;
    }
    const headers = ['Customer ID', 'Segment', 'Percentile', 'Predicted CLV'];
    const rows = topCustomers.map(c => [
      String(c.customerId ?? ''),
      String(c.segment ?? ''),
      `${100 - (c.percentile ?? 0)}%`,
      String(c.clv ?? 0)
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `clv_analytics_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Analytics exported successfully');
  };

  return (
    <div className="space-y-7 pb-20">
      {/* ── Header ────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.21, 1.02, 0.73, 1] }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20">
              <Sparkles className="w-5 h-5 text-indigo-400" />
            </div>
            Business Intelligence
          </h1>
          <p className="text-sm text-white/35 mt-1.5 ml-[52px]">Actionable insights driving customer lifetime value optimization</p>
        </div>
        <div className="flex gap-2.5 items-center">
          <AnimatePresence>
            {bi.isLoading && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium overflow-hidden whitespace-nowrap"
              >
                <RefreshCcw className="w-3.5 h-3.5 animate-spin" /> Recomputing...
              </motion.div>
            )}
          </AnimatePresence>
          <Button variant="outline" className="gap-2 rounded-xl border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] text-white/60 hover:text-white/90" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="w-4 h-4" />
            Filters {bi.activeFilterCount > 0 && <Badge variant="secondary" className="ml-0.5 h-5 bg-indigo-500/20 text-indigo-400 border-indigo-500/25">{bi.activeFilterCount}</Badge>}
          </Button>
          <Button className="gap-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg shadow-indigo-500/20" onClick={handleExport} disabled={bi.isLoading || !bi.hasData}>
            <Download className="w-4 h-4" /> Export
          </Button>
        </div>
      </motion.div>

      {/* ── Expandable Filters ────────────────────────────────── */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.21, 1.02, 0.73, 1] }}
            className="overflow-hidden"
          >
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] backdrop-blur-sm p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
              <div className="space-y-2">
                <label className="text-[10px] font-semibold text-white/30 uppercase tracking-widest">Date Horizon</label>
                <Select value={bi.dateRange} onValueChange={(v) => bi.setDateRange(v as DateRangeOption)}>
                  <SelectTrigger className="bg-white/[0.04] border-white/[0.08] rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">Trailing 30 Days</SelectItem>
                    <SelectItem value="90">Trailing 90 Days</SelectItem>
                    <SelectItem value="180">Trailing 6 Months</SelectItem>
                    <SelectItem value="365">Year to Date</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-semibold text-white/30 uppercase tracking-widest">Customer Segment</label>
                <Select value={bi.segment} onValueChange={bi.setSegment}>
                  <SelectTrigger className="bg-white/[0.04] border-white/[0.08] rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Segments</SelectItem>
                    <SelectItem value="High Value">High Value</SelectItem>
                    <SelectItem value="Medium Value">Medium Value</SelectItem>
                    <SelectItem value="Low Value">Low Value</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-semibold text-white/30 uppercase tracking-widest flex justify-between">
                  <span>Min CLV Threshold</span>
                  <span className="text-indigo-400 font-bold">{formatCurrency(bi.minRevenue)}</span>
                </label>
                <Slider
                  value={[bi.minRevenue]} min={0} max={bi.data?.maxClv || 10000} step={100}
                  onValueChange={(v) => bi.setMinRevenue(v[0])}
                  className="pt-2"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-semibold text-white/30 uppercase tracking-widest">Customer Lookup</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                  <Input
                    placeholder="Search by ID..."
                    value={bi.searchId}
                    onChange={(e) => bi.setSearchId(e.target.value)}
                    className="pl-10 bg-white/[0.04] border-white/[0.08] rounded-xl placeholder:text-white/20"
                  />
                </div>
              </div>
            </div>
            {bi.activeFilterCount > 0 && (
              <div className="flex justify-end mt-3">
                <Button variant="ghost" size="sm" onClick={bi.resetFilters} className="text-xs text-white/35 hover:text-white/70 gap-1.5">
                  <RefreshCcw className="w-3 h-3" /> Clear all filters
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Content ───────────────────────────────────────────── */}
      {bi.isLoading ? (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-7">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <motion.div key={i} variants={fadeUp}>
                <Skeleton className="h-[140px] rounded-2xl bg-white/[0.03] border border-white/[0.05]" />
              </motion.div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-[400px] rounded-2xl bg-white/[0.03] border border-white/[0.05]" />
            <Skeleton className="h-[400px] rounded-2xl bg-white/[0.03] border border-white/[0.05]" />
          </div>
        </motion.div>
      ) : bi.isError ? (
        <EmptyState onRetry={bi.mutate} />
      ) : !bi.hasData ? (
        <EmptyState onRetry={bi.resetFilters} />
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-7">

          {/* ── KPI Row ──────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard title="Portfolio Size" value={bi.data!.kpis.totalCustomers.toLocaleString()} sub="total customers" trend={bi.data!.kpis.totalCustomersTrend} icon={Users} glow="blue" />
            <KPICard title="Average CLV" value={formatCurrency(bi.data!.kpis.avgClv)} sub="lifetime value" trend={bi.data!.kpis.avgClvTrend} icon={TrendingUp} glow="emerald" />
            <KPICard title="High-Value" value={bi.data!.kpis.highValueCustomers.toLocaleString()} sub="top segment" trend={bi.data!.kpis.highValueTrend} icon={Crown} glow="violet" />
            <KPICard title="Predicted Revenue" value={formatCompactCurrency(bi.data!.kpis.predictedRevenue)} sub="ecosystem value" trend={bi.data!.kpis.revenueTrend} icon={Target} glow="amber" />
          </div>

          {/* ── Charts Row 1 ─────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* CLV Distribution Bar Chart */}
            <FloatingCard className="lg:col-span-3">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-indigo-400" /> Value Distribution
                  </h3>
                  <p className="text-xs text-white/30 mt-0.5">Customer count across CLV cohorts</p>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-white/25 bg-white/[0.03] px-2.5 py-1 rounded-lg border border-white/[0.05]">
                  <Activity className="w-3 h-3" /> Live
                </div>
              </div>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={bi.data!.clvBuckets} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id={gradients.bar} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#818cf8" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity={0.4} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 11 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 11 }} />
                    <RechartsTooltip content={<GlassTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                    <Bar dataKey="count" name="Customers" radius={[8, 8, 0, 0]}>
                      {(bi.data!.clvBuckets ?? []).map((entry: any, index: number) => (
                        <Cell key={`bar-${index}`} fill={SEGMENT_COLORS[String(entry?.segment ?? '')] || `url(#${gradients.bar})`} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </FloatingCard>

            {/* Revenue Donut + Legend */}
            <FloatingCard className="lg:col-span-2">
              <div className="mb-5">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-violet-400" /> Revenue Share
                </h3>
                <p className="text-xs text-white/30 mt-0.5">Portfolio distribution by segment</p>
              </div>
              <div className="h-[180px] mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={bi.data!.revenueDistribution} cx="50%" cy="50%"
                      innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="revenue"
                      nameKey="segment"
                      stroke="transparent"
                    >
                      {(bi.data!.revenueDistribution ?? []).map((entry: any, index: number) => (
                        <Cell key={`pie-${index}`} fill={String(entry?.fill ?? '#6366f1')} />
                      ))}
                    </Pie>
                    <RechartsTooltip content={<GlassTooltip />} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1.5">
                {(bi.data!.revenueDistribution ?? []).map((entry: any, i: number) => (
                  <SegmentPill key={i} name={entry?.segment} fill={entry?.fill} percentage={entry?.percentage} revenue={entry?.revenue} />
                ))}
              </div>
            </FloatingCard>
          </div>

          {/* ── Charts Row 2 ─────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* CLV Trajectory */}
            <FloatingCard>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" /> Trajectory Analysis
                  </h3>
                  <p className="text-xs text-white/30 mt-0.5">Average vs Top Quartile CLV over time</p>
                </div>
              </div>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={bi.data!.clvTrends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id={gradients.clv} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 11 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tickFormatter={(v: number) => formatCompactCurrency(v)} tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 11 }} />
                    <RechartsTooltip content={<GlassTooltip />} />
                    <Legend verticalAlign="top" height={36} iconType="circle" />
                    <Area type="monotone" dataKey="avgClv" name="Average CLV" stroke="#6366f1" strokeWidth={2.5} fill={`url(#${gradients.clv})`} dot={{ r: 3, fill: '#6366f1', strokeWidth: 0 }} activeDot={{ r: 6, fill: '#818cf8', strokeWidth: 0 }} />
                    <Line type="monotone" dataKey="q75Clv" name="Top Quartile" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="6 3" dot={{ r: 3, fill: '#8b5cf6', strokeWidth: 0 }} activeDot={{ r: 5, fill: '#a78bfa', strokeWidth: 0 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </FloatingCard>

            {/* Elite Customers Table */}
            <FloatingCard>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Crown className="w-4 h-4 text-amber-400" /> Elite Customers
                  </h3>
                  <p className="text-xs text-white/30 mt-0.5">Top ranked by predicted lifetime value</p>
                </div>
                <Badge variant="outline" className="text-[10px] border-amber-500/20 text-amber-400/80 bg-amber-500/5">
                  Top {(bi.data!.topCustomers ?? []).length}
                </Badge>
              </div>
              <div className="overflow-auto rounded-xl border border-white/[0.05] bg-black/20 max-h-[320px]">
                <Table>
                  <TableHeader className="bg-white/[0.02] sticky top-0">
                    <TableRow className="border-white/[0.04] hover:bg-transparent">
                      <TableHead className="text-[10px] font-semibold text-white/30 uppercase tracking-wider">Customer</TableHead>
                      <TableHead className="text-[10px] font-semibold text-white/30 uppercase tracking-wider">Segment</TableHead>
                      <TableHead className="text-[10px] font-semibold text-white/30 uppercase tracking-wider">Rank</TableHead>
                      <TableHead className="text-[10px] font-semibold text-white/30 uppercase tracking-wider text-right">CLV</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(bi.data!.topCustomers ?? []).map((customer: any) => {
                      const seg = String(customer?.segment ?? 'Unknown');
                      return (
                        <TableRow key={String(customer?.id ?? Math.random())} className="border-white/[0.03] transition-colors hover:bg-white/[0.03] group">
                          <TableCell className="font-medium text-white/80 text-xs">{String(customer?.customerId ?? '')}</TableCell>
                          <TableCell>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md text-white/90" style={{ backgroundColor: (SEGMENT_COLORS[seg] || '#475569') + '33' }}>
                              {seg}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-xs text-white/30">Top </span>
                            <span className="text-xs font-bold text-emerald-400">{100 - (customer?.percentile ?? 0)}%</span>
                          </TableCell>
                          <TableCell className="text-right font-bold text-white tabular-nums text-sm">
                            {typeof customer?.clv === 'number' ? formatCurrency(customer.clv) : '0'}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {(bi.data!.topCustomers ?? []).length === 0 && (
                      <TableRow><TableCell colSpan={4} className="h-24 text-center text-white/25 text-sm">No matching customers found.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </FloatingCard>
          </div>

        </motion.div>
      )}
    </div>
  );
}
