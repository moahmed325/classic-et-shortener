'use client';

import type React from 'react';
import { usePathname } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { AdminHeader } from '@/components/admin/admin-header';
import { AdminAuthProvider } from '@/contexts/admin-auth-context';
import { AdminManagementProvider } from '@/contexts/admin-management-context';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';

  if (isLoginPage) {
    return (
      <AdminAuthProvider>
        <div className="min-h-[100dvh] bg-[#0c0d0e]">
          {children}
        </div>
      </AdminAuthProvider>
    );
  }

  return (
    <AdminAuthProvider>
      <AdminManagementProvider>
        <div className="min-h-[100dvh] bg-[#0c0d0e] text-[#ededed]">
          <div className="flex min-h-[100dvh]">
            <AdminSidebar />
            <div className="flex-1 flex flex-col min-w-0">
              <AdminHeader />
              <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">{children}</main>
            </div>
          </div>
        </div>
      </AdminManagementProvider>
    </AdminAuthProvider>
  );
}
