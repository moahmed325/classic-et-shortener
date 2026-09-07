'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Link2,
  BarChart3,
  CreditCard,
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield,
  Activity,
  Database,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdminAuth } from '@/contexts/admin-auth-context';

interface AdminSidebarProps {
  className?: string;
}

const navigation = [
  {
    name: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Users',
    href: '/admin/users',
    icon: Users,
  },
  {
    name: 'Admins',
    href: '/admin/admins',
    icon: Shield,
  },
  {
    name: 'Links',
    href: '/admin/links',
    icon: Link2,
  },
  {
    name: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
  },
  {
    name: 'Subscriptions',
    href: '/admin/subscriptions',
    icon: CreditCard,
  },
  {
    name: 'Payments',
    href: '/admin/payments',
    icon: Database,
  },
  {
    name: 'Activity Logs',
    href: '/admin/activity-logs',
    icon: Activity,
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: Settings,
  },
];

export function AdminSidebar({ className }: AdminSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={`flex flex-col bg-surface-1 border-r border-border-subtle transition-all duration-200 z-30 ${
        collapsed ? 'w-16' : 'w-60'
      } ${className || ''}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3.5 border-b border-border-subtle h-14">
        {!collapsed && (
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold tracking-tight text-text-primary">
              classic<span className="text-[#ff6363]">.admin</span>
            </span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8 p-0 text-text-muted hover:text-text-primary hover:bg-surface-2"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto overscroll-contain">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.name : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md min-h-[44px] text-xs font-mono transition-colors ${
                isActive
                  ? 'bg-surface-2 text-text-primary border border-border-subtle'
                  : 'text-text-muted hover:text-text-primary hover:bg-surface-2/50 border border-transparent'
              }`}
            >
              <Icon className={`h-4 w-4 flex-shrink-0 ${isActive ? 'text-[#ff6363]' : 'text-text-muted'}`} />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer Return Link */}
      <div className="p-3 border-t border-border-subtle">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-2 py-2 text-xs font-mono text-text-muted hover:text-text-primary transition-colors"
        >
          {!collapsed && <span>← App Dashboard</span>}
        </Link>
      </div>
    </aside>
  );
}
