'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Loader2, Zap, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!email || !password) {
      setError('Email and password are required');
      setIsLoading(false);
      return;
    }

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      if (err.requiresVerification) {
        localStorage.setItem('pendingVerificationEmail', err.email || email);
        setError('Email verification required. Redirecting...');
        setTimeout(() => {
          router.push(`/verify-email?email=${encodeURIComponent(err.email || email)}`);
        }, 1200);
      } else {
        setError(err.message || 'Authentication failed. Please check credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-canvas flex flex-col justify-center items-center px-4 py-8 selection:bg-[#ff6363]/20">
      <div className="w-full max-w-sm space-y-4">
        {/* Brand Header */}
        <div className="text-center space-y-1.5">
          <Link href="/" className="inline-flex items-center space-x-2 text-sm font-semibold tracking-tight text-[#ededed]">
            <div className="h-6 w-6 rounded bg-[#1c1d20] border border-[#27282b] flex items-center justify-center text-[#ff6363]">
              <Zap className="h-3.5 w-3.5 fill-current" />
            </div>
            <span className="font-mono font-bold text-base tracking-tight">classic.et</span>
          </Link>
        </div>

        {/* Tactical Auth Card */}
        <Card className="rounded-lg border border-[#27282b] bg-[#141517] shadow-none">
          <CardHeader className="p-5 pb-3">
            <CardTitle className="text-lg font-semibold text-[#ededed]">Sign in</CardTitle>
            <CardDescription className="text-xs text-[#8c8d91]">
              Enter credentials to access your link dashboard.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-5 pt-2">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="bg-[#ff6363]/10 border-[#ff6363]/25 text-[#ff6363] py-2 px-3">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs">{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-medium text-[#8c8d91]">
                  Email address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-[#1c1d20] border-[#27282b] text-[#ededed] text-sm h-10 focus-visible:ring-1 focus-visible:ring-[#56c2ff]"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-medium text-[#8c8d91]">
                    Password
                  </Label>
                  <Link href="/forgot-password" className="text-xs text-[#8c8d91] hover:text-[#ededed] transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="bg-[#1c1d20] border-[#27282b] text-[#ededed] text-sm h-10 pr-10 focus-visible:ring-1 focus-visible:ring-[#56c2ff]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8c8d91] hover:text-[#ededed]"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 bg-[#ff6363] hover:bg-[#f85353] text-white font-medium text-xs sm:text-sm mt-2 flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </Button>
            </form>

            <div className="mt-4 pt-4 border-t border-[#27282b]/60 text-center text-xs text-[#8c8d91]">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-[#ededed] hover:underline font-medium">
                Create one
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
