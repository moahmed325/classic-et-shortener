'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Shield, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Kbd } from '@/components/ui/kbd';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { adminAuthApi, type AdminUser } from '@/lib/admin-auth-api';

export function AdminHeader() {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchAdminUser();
  }, []);

  const fetchAdminUser = async () => {
    try {
      const response = await adminAuthApi.getMe();
      setAdmin(response.adminUser);
    } catch (error) {
      router.push('/admin/login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await adminAuthApi.logout();
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super_admin':
        return (
          <Kbd className="bg-[#ff6363]/10 border-[#ff6363]/30 text-[#ff6363] text-[10px] uppercase font-mono">
            Super Admin
          </Kbd>
        );
      case 'admin':
        return (
          <Kbd className="bg-[#56c2ff]/10 border-[#56c2ff]/30 text-[#56c2ff] text-[10px] uppercase font-mono">
            Admin
          </Kbd>
        );
      default:
        return (
          <Kbd className="bg-surface-2 border-border-subtle text-text-muted text-[10px] uppercase font-mono">
            {role}
          </Kbd>
        );
    }
  };

  if (isLoading) {
    return (
      <header className="border-b border-border-subtle bg-surface-1 px-4 sm:px-6 py-3 h-14 flex items-center justify-between">
        <div className="h-4 w-32 bg-surface-2 rounded animate-pulse" />
        <div className="h-8 w-8 bg-surface-2 rounded-full animate-pulse" />
      </header>
    );
  }

  return (
    <header className="border-b border-border-subtle bg-surface-1 px-4 sm:px-6 py-3 h-14 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Shield className="h-4 w-4 text-[#ff6363]" />
        <span className="text-xs font-mono text-text-muted">Console v2.4</span>
      </div>

      {admin && (
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="flex items-center gap-2 justify-end">
              <span className="text-xs font-semibold text-text-primary font-mono">
                {admin.name}
              </span>
              {getRoleBadge(admin.role)}
            </div>
            <p className="text-[11px] text-text-muted font-mono">{admin.email}</p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="h-9 w-9 rounded-md p-0 border-border-subtle bg-surface-2 hover:bg-surface-2/80 text-text-primary font-mono text-xs"
              >
                {admin.name.charAt(0).toUpperCase()}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-52 bg-surface-1 border border-border-subtle text-text-primary p-1 shadow-none"
            >
              <div className="px-3 py-2 border-b border-border-subtle sm:hidden">
                <p className="text-xs font-semibold font-mono text-text-primary">{admin.name}</p>
                <p className="text-[10px] text-text-muted font-mono">{admin.email}</p>
                <div className="mt-1">{getRoleBadge(admin.role)}</div>
              </div>

              <DropdownMenuItem
                onClick={handleLogout}
                className="min-h-[44px] cursor-pointer text-[#ff6363] hover:bg-[#ff6363]/10 focus:bg-[#ff6363]/10 text-xs font-mono px-3"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign Out Console</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </header>
  );
}
