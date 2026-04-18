'use client';

import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPICardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  iconColor?: string;   // tailwind text-* class
  glowColor?: 'blue' | 'emerald' | 'violet' | 'amber';
  trend?: {
    value: number;
    label: string;
    isPositive?: boolean;
  };
  isLoading?: boolean;
  index?: number;
}

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

function KPICardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] backdrop-blur-md p-6">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-3 w-28 bg-white/[0.06] shimmer" />
        <Skeleton className="h-8 w-8 rounded-lg bg-white/[0.06] shimmer" />
      </div>
      <Skeleton className="h-8 w-32 mb-2 bg-white/[0.08] shimmer" />
      <Skeleton className="h-3 w-24 bg-white/[0.05] shimmer" />
    </div>
  );
}

export function KPICard({
  title,
  value,
  description,
  icon: Icon,
  glowColor = 'blue',
  trend,
  isLoading = false,
  index = 0,
}: KPICardProps) {
  if (isLoading) return <KPICardSkeleton />;

  const isPositive = trend && trend.value > 0;
  const isNegative = trend && trend.value < 0;
  const isNeutral = !trend || trend.value === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.5, delay: index * 0.08, type: 'spring', stiffness: 200, damping: 22 }}
      whileHover={{ y: -6, transition: { type: 'spring', stiffness: 400, damping: 18 } }}
      className={cn(
        'relative rounded-2xl border border-white/[0.07] bg-white/[0.03] backdrop-blur-md p-6 overflow-hidden group cursor-default',
        'hover:border-white/[0.15] transition-colors duration-300',
        GLOW_MAP[glowColor] ?? ''
      )}
    >
      {/* Ambient glow orb */}
      <div className={cn('absolute -top-10 -right-10 w-28 h-28 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none',
        glowColor === 'blue' ? 'bg-indigo-500/20' : glowColor === 'emerald' ? 'bg-emerald-500/20' : glowColor === 'violet' ? 'bg-violet-500/20' : 'bg-amber-500/20'
      )} />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px] font-semibold text-white/35 uppercase tracking-widest">{title}</span>
          {Icon && (
            <div className={cn('p-2 rounded-xl transition-transform duration-300 group-hover:scale-110', ICON_BG[glowColor] ?? 'bg-white/10 text-white/50')}>
              <Icon className="w-4 h-4" />
            </div>
          )}
        </div>
        
        <div className="text-3xl font-bold tracking-tight text-white mb-1.5">{value}</div>
        
        <div className="flex items-center gap-2 text-xs">
          {trend && !isNeutral && (
            <span className={cn('flex items-center gap-0.5 font-semibold px-1.5 py-0.5 rounded-md', isPositive ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10')}>
              {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {Math.abs(trend.value)}%
            </span>
          )}
          {trend && isNeutral && <span className="text-white/25">—</span>}
          {description && (
            <span className="text-white/30">{description}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
