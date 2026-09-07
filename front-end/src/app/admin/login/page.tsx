'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Kbd } from '@/components/ui/kbd';
import { adminAuthApi, handleAuthError } from '@/lib/admin-auth-api';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      try {
        await adminAuthApi.logout();
      } catch {}
      await adminAuthApi.login({ email, password });
      router.push('/admin/dashboard');
    } catch (err) {
      setError(handleAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#0c0d0e] flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-md border border-[#27282b] bg-[#141517] p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded border border-[#27282b] bg-[#1c1d20] text-[#ff6363]">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#ededed] font-sans">
              Admin Portal
            </h1>
            <p className="text-xs text-[#8c8d91] font-mono mt-0.5">
              Restricted system management console
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-2 rounded border border-[#ff6363]/40 bg-[#ff6363]/10 p-3 text-xs text-[#ff6363] font-mono">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="admin-email" className="text-xs font-mono text-[#8c8d91]">
              Administrator Email
            </Label>
            <Input
              id="admin-email"
              type="email"
              required
              disabled={isLoading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@classic.et"
              className="min-h-[44px] bg-[#1c1d20] border-[#27282b] text-base sm:text-sm text-[#ededed] focus-visible:ring-1 focus-visible:ring-[#56c2ff]"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="admin-pass" className="text-xs font-mono text-[#8c8d91]">
              Security Keyphrase / Password
            </Label>
            <div className="relative">
              <Input
                id="admin-pass"
                type={showPassword ? 'text' : 'password'}
                required
                disabled={isLoading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="min-h-[44px] pr-10 bg-[#1c1d20] border-[#27282b] text-base sm:text-sm text-[#ededed] focus-visible:ring-1 focus-visible:ring-[#56c2ff]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8c8d91] hover:text-[#ededed] p-1"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full min-h-[44px] bg-[#ff6363] hover:bg-[#ff4d4d] text-white text-xs font-mono font-medium flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <span>Authorize & Sign In</span>
                <Kbd className="bg-black/30 border-white/20 text-white text-[9px]">↵</Kbd>
              </>
            )}
          </Button>
        </form>

        {/* Footer Audit Notice */}
        <div className="pt-2 border-t border-[#27282b] text-center text-[11px] font-mono text-[#8c8d91] space-y-1">
          <p>Authorized personnel only</p>
          <p className="text-[10px] text-[#8c8d91]/70">All access attempts are cryptographically audited</p>
        </div>
      </div>
    </div>
  );
}
