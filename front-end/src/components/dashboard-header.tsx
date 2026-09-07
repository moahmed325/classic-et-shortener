'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Zap,
  BarChart3,
  Link2,
  Settings,
  Crown,
  LogOut,
  Menu,
  ChevronDown,
  User,
  Check,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Kbd } from '@/components/ui/kbd';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/contexts/auth-context';

const navItems = [
  { name: 'Overview', href: '/dashboard', icon: Zap },
  { name: 'Links', href: '/dashboard/links', icon: Link2 },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  { name: 'Subscription', href: '/dashboard/subscription', icon: Crown },
];

export function DashboardHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      router.push('/login');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getUserInitials = (name?: string, email?: string) => {
    if (name) {
      return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return 'U';
  };

  const isCurrent = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#27282b] bg-[#0c0d0e]/95 transition-colors">
      {/* Top Navbar Row */}
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Brand & Workspace Pill */}
        <div className="flex items-center space-x-3">
          <Link href="/dashboard" className="flex items-center space-x-2 text-sm font-semibold tracking-tight text-[#ededed]">
            <div className="h-5 w-5 rounded bg-[#1c1d20] border border-[#27282b] flex items-center justify-center text-[#ff6363]">
              <Zap className="h-3 w-3 fill-current" />
            </div>
            <span className="font-mono font-bold tracking-tight">classic.et</span>
          </Link>

          <span className="text-[#27282b] text-sm">/</span>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 px-2.5 text-xs font-normal border-[#27282b] bg-[#141517] hover:bg-[#1c1d20] text-[#ededed]">
                <span className="truncate max-w-[120px] sm:max-w-[160px]">
                  {user?.name || user?.email?.split('@')[0] || 'Personal'}
                </span>
                <span className="ml-1.5 px-1 py-0.2 rounded text-[10px] font-mono bg-[#1c1d20] border border-[#27282b] text-[#8c8d91]">
                  {user?.tier?.toUpperCase() || 'FREE'}
                </span>
                <ChevronDown className="ml-1 h-3 w-3 text-[#8c8d91]" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 bg-[#141517] border-[#27282b] text-[#ededed]">
              <div className="px-2 py-1.5 text-xs font-semibold text-[#8c8d91]">Active Workspace</div>
              <DropdownMenuItem className="text-xs flex items-center justify-between bg-[#1c1d20] cursor-pointer">
                <span className="truncate">{user?.email}</span>
                <Check className="h-3.5 w-3.5 text-[#5fc992]" />
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[#27282b]" />
              <DropdownMenuItem onClick={() => router.push('/dashboard/subscription')} className="text-xs cursor-pointer">
                <Crown className="mr-2 h-3.5 w-3.5 text-[#f59e0b]" />
                <span>Upgrade Plan</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Right Tools & Profile */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <ThemeToggle />

          {/* User Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="h-8 w-8 rounded-md bg-[#1c1d20] border border-[#27282b] flex items-center justify-center text-xs font-mono font-semibold text-[#ededed] hover:border-[#8c8d91]/50 transition-colors">
                {getUserInitials(user?.name, user?.email)}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-[#141517] border-[#27282b] text-[#ededed]">
              <DropdownMenuLabel className="font-normal p-3">
                <div className="flex flex-col space-y-1">
                  <p className="text-xs font-semibold text-[#ededed] truncate">{user?.name || 'User'}</p>
                  <p className="text-[11px] font-mono text-[#8c8d91] truncate">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-[#27282b]" />
              <DropdownMenuItem onClick={() => router.push('/dashboard/settings')} className="text-xs cursor-pointer hover:bg-[#1c1d20]">
                <Settings className="mr-2 h-3.5 w-3.5 text-[#8c8d91]" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/dashboard/subscription')} className="text-xs cursor-pointer hover:bg-[#1c1d20]">
                <Crown className="mr-2 h-3.5 w-3.5 text-[#8c8d91]" />
                <span>Subscription</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[#27282b]" />
              <DropdownMenuItem
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="text-xs cursor-pointer text-[#ff6363] hover:bg-[#ff6363]/10"
              >
                <LogOut className="mr-2 h-3.5 w-3.5" />
                <span>{isLoggingOut ? 'Signing out...' : 'Sign out'}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Navigation Trigger */}
          <div className="md:hidden">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8 min-h-0 bg-[#141517] border-[#27282b] text-[#ededed]">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-72 bg-[#0c0d0e] border-r border-[#27282b] text-[#ededed] p-0 flex flex-col pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] min-h-[100dvh]"
              >
                <SheetHeader className="p-4 border-b border-[#27282b]">
                  <SheetTitle className="flex items-center space-x-2 text-sm text-[#ededed]">
                    <div className="h-5 w-5 rounded bg-[#1c1d20] border border-[#27282b] flex items-center justify-center text-[#ff6363]">
                      <Zap className="h-3 w-3 fill-current" />
                    </div>
                    <span className="font-mono font-bold">classic.et</span>
                  </SheetTitle>
                </SheetHeader>

                <nav className="flex-1 p-3 space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = isCurrent(item.href);
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center px-3 py-2.5 rounded-md text-xs font-medium min-h-[44px] transition-colors ${
                          active
                            ? 'bg-[#1c1d20] text-[#ededed] border border-[#27282b]'
                            : 'text-[#8c8d91] hover:text-[#ededed] hover:bg-[#141517]'
                        }`}
                      >
                        <Icon className="h-4 w-4 mr-2.5 flex-shrink-0" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </nav>

                <div className="p-4 border-t border-[#27282b] space-y-2">
                  <div className="text-xs font-mono text-[#8c8d91]">
                    Plan: <span className="text-[#ededed] uppercase">{user?.tier || 'FREE'}</span>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="w-full h-10 text-xs text-[#ff6363] bg-[#141517] border-[#27282b] min-h-[44px]"
                  >
                    <LogOut className="mr-2 h-3.5 w-3.5" />
                    <span>Sign Out</span>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Sub-navbar Navigation Tabs (Desktop / Tablet) */}
      <div className="hidden md:block border-t border-[#27282b]/60">
        <div className="max-w-5xl mx-auto px-4 flex items-center space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isCurrent(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`relative py-2.5 px-3 text-xs font-medium transition-colors flex items-center space-x-1.5 ${
                  active ? 'text-[#ededed]' : 'text-[#8c8d91] hover:text-[#ededed]'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{item.name}</span>
                {active && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#ff6363]" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
