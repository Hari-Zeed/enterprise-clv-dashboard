'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Upload, TrendingUp, BarChart3, Settings,
  ChevronLeft, ChevronRight, Activity, Sparkles, User
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export const navItems = [
  {
    href: '/dashboard',
    label: 'Overview',
    icon: LayoutDashboard,
    badge: null,
    exact: true,
  },
  {
    href: '/dashboard/upload',
    label: 'Upload Data',
    icon: Upload,
    badge: null,
    exact: false,
  },
  {
    href: '/dashboard/predictions',
    label: 'Predictions',
    icon: TrendingUp,
    badge: null,
    exact: false,
  },
  {
    href: '/dashboard/analytics',
    label: 'Analytics',
    icon: BarChart3,
    badge: 'BI',
    exact: false,
  },
  {
    href: '/dashboard/settings',
    label: 'Settings',
    icon: Settings,
    badge: null,
    exact: false,
  },
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  const userInitials = session?.user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 72 : 240 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="relative hidden md:flex flex-shrink-0 flex-col h-screen border-r border-white/[0.06] bg-[oklch(0.105_0.008_264)] z-50"
    >
      {/* Subtle inner glow at top */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Logo */}
      <div className="flex items-center h-[65px] px-4 border-b border-white/[0.06] flex-shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Activity className="w-4 h-4 text-white" />
          </div>
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                key="logo-text"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
              >
                <span className="font-bold text-sm tracking-tight text-white whitespace-nowrap">
                  CLV<span className="text-indigo-400"> Predict</span>
                </span>
                <p className="text-[10px] text-white/30 -mt-0.5 whitespace-nowrap">Intelligence Platform</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-[46px] z-50 w-6 h-6 rounded-full flex items-center justify-center
                   bg-[oklch(0.18_0.008_264)] border border-white/10 text-white/40
                   hover:text-white/80 hover:border-white/20 hover:scale-110 transition-all duration-200 shadow-lg"
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed
          ? <ChevronRight className="w-3 h-3" />
          : <ChevronLeft className="w-3 h-3" />}
      </button>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto no-scrollbar">
        {/* Section label */}
        <AnimatePresence>
          {!isCollapsed && (
            <motion.p
              key="nav-label"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-[10px] font-semibold text-white/20 uppercase tracking-widest px-2 pb-2"
            >
              Menu
            </motion.p>
          )}
        </AnimatePresence>

        <TooltipProvider delayDuration={0}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(item.href + '/');

            const navLink = (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    'relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group cursor-pointer',
                    isActive
                      ? 'bg-white/[0.08] text-white'
                      : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04]',
                    isCollapsed && 'justify-center px-2'
                  )}
                >
                  {/* Active indicator line */}
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-indigo-400"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}

                  <Icon className={cn(
                    'flex-shrink-0 transition-colors duration-200',
                    isCollapsed ? 'w-5 h-5' : 'w-4 h-4',
                    isActive ? 'text-indigo-400' : 'text-current'
                  )} />

                  <AnimatePresence mode="wait">
                    {!isCollapsed && (
                      <motion.span
                        key={`label-${item.href}`}
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.15 }}
                        className="text-sm font-medium whitespace-nowrap flex-1 flex items-center justify-between"
                      >
                        {item.label}
                        {item.badge && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                            {item.badge}
                          </span>
                        )}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </Link>
            );

            if (isCollapsed) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    {navLink}
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={20} className="bg-[oklch(0.14_0.008_264)] border-white/[0.08] text-white text-xs">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return navLink;
          })}
        </TooltipProvider>
      </nav>

      {/* Footer status & User Avatar */}
      <div className="px-3 py-4 border-t border-white/[0.06] flex-shrink-0 flex flex-col gap-4">
        {/* Status */}
        <div className={cn('flex items-center gap-2.5 px-2 transition-all', isCollapsed && 'justify-center')}>
          <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-emerald-400 dot-pulse" />
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-[11px] text-white/30 whitespace-nowrap"
              >
                All systems operational
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* User profile */}
        <Link href="/dashboard/settings" className={cn(
          "flex items-center gap-3 p-2 rounded-xl hover:bg-white/[0.04] transition-colors border border-transparent hover:border-white/[0.06]",
          isCollapsed ? "justify-center" : ""
        )}>
          <Avatar className="h-8 w-8 rounded-lg shrink-0">
            <AvatarFallback className="text-xs font-semibold bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-lg">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex flex-col overflow-hidden whitespace-nowrap">
              <span className="text-xs font-medium text-white/90 truncate">{session?.user?.name || 'User'}</span>
              <span className="text-[10px] text-white/30 truncate">{session?.user?.email}</span>
            </div>
          )}
        </Link>
      </div>
    </motion.aside>
  );
}
