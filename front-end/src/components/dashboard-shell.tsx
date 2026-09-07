'use client';

import { DashboardHeader } from '@/components/dashboard-header';
import { ProtectedRoute } from '@/components/protected-route';

export function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-[100dvh] bg-canvas text-text-primary flex flex-col selection:bg-[#ff6363]/20">
        <DashboardHeader />
        <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-6 sm:py-8">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
