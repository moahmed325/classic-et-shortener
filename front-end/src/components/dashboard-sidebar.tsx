'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, LinkIcon, Settings, Zap, LogOut, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/auth-context';

const navigation = [
  { name: 'Overview', href: '/dashboard', icon: Zap },
  { name: 'Links', href: '/dashboard/links', icon: LinkIcon },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  { name: 'Subscription', href: '/dashboard/subscription', icon: Crown },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <aside className="w-64 border-r border-[#27282b] bg-[#0c0d0e] flex flex-col justify-between p-4 min-h-[100dvh]">
      <div className="space-y-4">
        <Link href="/dashboard" className="flex items-center space-x-2 text-sm font-semibold text-[#ededed]">
          <div className="h-6 w-6 rounded bg-[#1c1d20] border border-[#27282b] flex items-center justify-center text-[#ff6363]">
            <Zap className="h-3.5 w-3.5 fill-current" />
          </div>
          <span className="font-mono font-bold tracking-tight">classic.et</span>
        </Link>

        <nav className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = item.href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-2 rounded-md text-xs font-medium min-h-[44px] sm:min-h-0 transition-colors ${
                  active
                    ? 'bg-[#1c1d20] text-[#ededed] border border-[#27282b]'
                    : 'text-[#8c8d91] hover:text-[#ededed] hover:bg-[#141517]'
                }`}
              >
                <Icon className="h-4 w-4 mr-2.5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="pt-4 border-t border-[#27282b] space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[#ededed] truncate max-w-[120px] font-medium">{user?.email}</span>
          <Badge variant="secondary" className="text-[10px] uppercase">{user?.tier || 'FREE'}</Badge>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full text-xs text-[#ff6363] bg-[#141517] border-[#27282b]"
        >
          <LogOut className="h-3.5 w-3.5 mr-1.5" />
          <span>Sign Out</span>
        </Button>
      </div>
    </aside>
  );
}
