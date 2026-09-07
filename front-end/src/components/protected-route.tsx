'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter, usePathname } from 'next/navigation';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user && pathname?.startsWith('/dashboard')) {
      router.replace('/login');
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[100dvh] bg-canvas">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border-subtle border-t-[#ff6363]"></div>
      </div>
    );
  }

  if (!user && pathname?.startsWith('/dashboard')) {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
}
