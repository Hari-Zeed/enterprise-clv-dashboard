'use client';

import { useSession, signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { usePathname } from 'next/navigation';
import { Moon, Sun, LogOut, Settings, Bell, ChevronDown, Search, Menu, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useState, useEffect } from 'react';
import { navItems } from './sidebar';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

// Maps pathname -> breadcrumb label
const PAGE_LABELS: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': { title: 'Overview', subtitle: 'Your CLV intelligence at a glance' },
  '/dashboard/upload': { title: 'Upload Data', subtitle: 'Train the prediction model with your dataset' },
  '/dashboard/predictions': { title: 'Predictions', subtitle: 'Generate and manage CLV predictions' },
  '/dashboard/analytics': { title: 'Business Intelligence', subtitle: 'Advanced analytics and insights' },
  '/dashboard/settings': { title: 'Settings', subtitle: 'Manage your account and preferences' },
};

export function Navbar() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();

  const pageInfo = PAGE_LABELS[pathname] ?? {
    title: 'Dashboard',
    subtitle: 'CLV Intelligence Platform',
  };

  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const userInitials = session?.user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  const userName = session?.user?.name || 'User';
  const userEmail = session?.user?.email || '';

  return (
    <header className="h-[65px] flex-shrink-0 border-b border-white/[0.06] bg-[oklch(0.118_0.008_264)]/80 backdrop-blur-xl sticky top-0 z-40">
      {/* Top shimmer line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />

      <div className="flex items-center justify-between h-full px-4 md:px-6">
        {/* Mobile Sidebar Trigger */}
        <div className="flex md:hidden items-center mr-3">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10 w-9 h-9">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] bg-[oklch(0.105_0.008_264)] border-r border-white/[0.06] p-0">
              <div className="flex flex-col h-full overflow-hidden">
                <div className="flex items-center h-[65px] px-6 border-b border-white/[0.06] flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                      <Activity className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <span className="font-bold text-sm tracking-tight text-white whitespace-nowrap">
                        CLV<span className="text-indigo-400"> Predict</span>
                      </span>
                      <p className="text-[10px] text-white/30 -mt-0.5 whitespace-nowrap">Intelligence Platform</p>
                    </div>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
                  <p className="text-[10px] font-semibold text-white/20 uppercase tracking-widest px-2 pb-2">Menu</p>
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = item.exact
                      ? pathname === item.href
                      : pathname === item.href || pathname.startsWith(item.href + '/');

                    return (
                      <Link key={item.href} href={item.href}>
                        <div
                          className={cn(
                            'relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 cursor-pointer',
                            isActive
                              ? 'bg-white/[0.08] text-white'
                              : 'text-white/40 hover:text-white hover:bg-white/[0.04]'
                          )}
                        >
                          <Icon className={cn('w-5 h-5', isActive ? 'text-indigo-400' : 'text-current')} />
                          <span className="text-sm font-medium">{item.label}</span>
                          {item.badge && (
                            <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                              {item.badge}
                            </span>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Left: Page info */}
        <div className="flex flex-col justify-center">
          <h2 className="text-sm font-semibold text-white leading-none">{pageInfo.title}</h2>
          <p className="text-xs text-white/35 mt-0.5 hidden sm:block">{pageInfo.subtitle}</p>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <button 
            onClick={() => setSearchOpen(true)}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg
                             bg-white/[0.04] border border-white/[0.07] text-white/30
                             hover:text-white/50 hover:bg-white/[0.06] hover:border-white/10
                             transition-all duration-200 text-xs">
            <Search className="w-3.5 h-3.5" />
            <span>Search...</span>
            <kbd className="ml-4 text-[10px] px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/10">⌘K</kbd>
          </button>
          <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
            <CommandInput placeholder="Type a command or search..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup heading="Pages">
                {navItems.map((item) => (
                  <CommandItem
                    key={item.href}
                    onSelect={() => {
                      setSearchOpen(false);
                      window.location.href = item.href;
                    }}
                    className="cursor-pointer"
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    <span>{item.label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </CommandDialog>

          {/* Notifications */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative w-8 h-8 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/[0.06]"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_6px_rgba(99,102,241,0.8)]" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 bg-[#0f0e13] border-white/[0.08] shadow-2xl p-0 rounded-xl overflow-hidden z-50">
              <div className="p-4 border-b border-white/[0.06]">
                <h4 className="text-sm font-semibold text-white">Notifications</h4>
              </div>
              <div className="flex flex-col max-h-[300px] overflow-y-auto w-full">
                <div className="p-4 border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors cursor-pointer">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center shrink-0 hidden sm:flex">
                      <Activity className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white/90">Model Training Complete</p>
                      <p className="text-xs text-white/50 mt-1 leading-snug">XGBoost model achieved 94% R² accuracy on the latest dataset.</p>
                      <p className="text-[10px] text-white/30 mt-2">2 hours ago</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 hover:bg-white/[0.02] transition-colors cursor-pointer">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center shrink-0 hidden sm:flex">
                      <Bell className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white/90">New Segment Detected</p>
                      <p className="text-xs text-white/50 mt-1 leading-snug">Several customers have recently moved to the VIP tier.</p>
                      <p className="text-[10px] text-white/30 mt-2">5 hours ago</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-2 border-t border-white/[0.06] bg-black/20">
                <Button variant="ghost" className="w-full h-8 text-xs text-white/40 hover:text-white/80">
                  Mark all as read
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/[0.06]"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark'
              ? <Sun className="w-4 h-4" />
              : <Moon className="w-4 h-4" />}
          </Button>

          {/* Divider */}
          <div className="w-px h-5 bg-white/10 mx-1" />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl
                                 hover:bg-white/[0.06] transition-all duration-200 group">
                <Avatar className="h-7 w-7 rounded-lg ring-1 ring-white/10 group-hover:ring-indigo-500/30 transition-all">
                  <AvatarFallback className="text-xs font-semibold bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-lg">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-xs font-medium text-white/80 leading-none">{userName}</span>
                  <span className="text-[10px] text-white/30 mt-0.5 max-w-[120px] truncate">{userEmail}</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-white/25 hidden md:block" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-56 bg-[oklch(0.14_0.008_264)] border-white/[0.08] shadow-[0_16px_48px_-12px_rgba(0,0,0,0.8)] rounded-xl p-1"
            >
              <DropdownMenuLabel className="px-2 py-2">
                <div className="flex items-center gap-2.5">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarFallback className="text-xs font-semibold bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-lg">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-white/90">{userName}</p>
                    <p className="text-xs text-white/35 truncate max-w-[140px]">{userEmail}</p>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/[0.06] my-1" />

              <DropdownMenuItem asChild className="rounded-lg px-2 py-2 focus:bg-white/[0.06] cursor-pointer">
                <a href="/dashboard/settings" className="flex items-center gap-2 text-white/60 hover:text-white/90">
                  <Settings className="w-3.5 h-3.5" />
                  <span className="text-sm">Settings</span>
                </a>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-white/[0.06] my-1" />

              <DropdownMenuItem
                onClick={() => signOut({ redirectTo: '/' })}
                className="rounded-lg px-2 py-2 focus:bg-red-500/10 cursor-pointer text-red-400/80 hover:text-red-400"
              >
                <LogOut className="w-3.5 h-3.5 mr-2" />
                <span className="text-sm">Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
