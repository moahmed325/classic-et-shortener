'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, Loader2, Zap, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { authApi } from '@/lib/api';

function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [token, setToken] = useState('');

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (!tokenParam) {
      setError('Invalid or missing reset token. Please request a new password reset.');
      return;
    }
    setToken(tokenParam);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!password || !confirmPassword) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (!token) {
      setError('Invalid reset token');
      setIsLoading(false);
      return;
    }

    try {
      await authApi.resetPassword({ token, password });
      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="rounded-lg border border-[#27282b] bg-[#141517] shadow-none">
        <CardHeader className="p-5 pb-3">
          <div className="h-8 w-8 rounded bg-[#5fc992]/10 border border-[#5fc992]/25 flex items-center justify-center text-[#5fc992] mb-2">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <CardTitle className="text-lg font-semibold text-[#ededed]">Password updated</CardTitle>
          <CardDescription className="text-xs text-[#8c8d91]">
            Your password has been successfully reset. Redirecting to sign in...
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-2">
          <Link href="/login">
            <Button className="w-full h-10 bg-[#ff6363] hover:bg-[#f85353] text-white text-xs font-medium">
              Continue to Sign In
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-lg border border-[#27282b] bg-[#141517] shadow-none">
      <CardHeader className="p-5 pb-3">
        <CardTitle className="text-lg font-semibold text-[#ededed]">Set new password</CardTitle>
        <CardDescription className="text-xs text-[#8c8d91]">
          Choose a secure password of at least 8 characters.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-5 pt-2">
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {error && (
            <Alert variant="destructive" className="bg-[#ff6363]/10 border-[#ff6363]/25 text-[#ff6363] py-2 px-3">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-medium text-[#8c8d91]">
              New password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Min. 8 characters"
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

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword" className="text-xs font-medium text-[#8c8d91]">
              Confirm new password
            </Label>
            <Input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              placeholder="Repeat new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isLoading}
              className="bg-[#1c1d20] border-[#27282b] text-[#ededed] text-sm h-10 focus-visible:ring-1 focus-visible:ring-[#56c2ff]"
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading || !token}
            className="w-full h-10 bg-[#ff6363] hover:bg-[#f85353] text-white font-medium text-xs sm:text-sm mt-2 flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Updating password...</span>
              </>
            ) : (
              <span>Reset Password</span>
            )}
          </Button>
        </form>

        <div className="mt-4 pt-4 border-t border-[#27282b]/60 text-center">
          <Link href="/login" className="text-xs text-[#8c8d91] hover:text-[#ededed] transition-colors">
            Back to Sign In
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[100dvh] bg-canvas flex flex-col justify-center items-center px-4 py-8 selection:bg-[#ff6363]/20">
      <div className="w-full max-w-sm space-y-4">
        <div className="text-center space-y-1.5">
          <Link href="/" className="inline-flex items-center space-x-2 text-sm font-semibold tracking-tight text-[#ededed]">
            <div className="h-6 w-6 rounded bg-[#1c1d20] border border-[#27282b] flex items-center justify-center text-[#ff6363]">
              <Zap className="h-3.5 w-3.5 fill-current" />
            </div>
            <span className="font-mono font-bold text-base tracking-tight">classic.et</span>
          </Link>
        </div>

        <Suspense
          fallback={
            <div className="p-8 text-center text-xs font-mono text-[#8c8d91]">
              <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2 text-[#56c2ff]" />
              LOADING TOKEN...
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
