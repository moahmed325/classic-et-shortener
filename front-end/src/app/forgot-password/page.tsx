'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Mail, Loader2, Zap, CheckCircle2, AlertCircle, Lock } from 'lucide-react';
import { authApi } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');
  const [debugInfo, setDebugInfo] = useState<{ resetUrl?: string; emailSent?: boolean } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!email) {
      setError('Please enter your email address');
      setIsLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    try {
      const response = await authApi.forgotPassword({ email: email.trim() });
      setSuccess(true);
      setMessage(response.message);
      if (response.debug) {
        setDebugInfo(response.debug);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
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

          <Card className="rounded-lg border border-[#27282b] bg-[#141517] shadow-none">
            <CardHeader className="p-5 pb-3">
              <div className="h-8 w-8 rounded bg-[#5fc992]/10 border border-[#5fc992]/25 flex items-center justify-center text-[#5fc992] mb-2">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <CardTitle className="text-lg font-semibold text-[#ededed]">Check your email</CardTitle>
              <CardDescription className="text-xs text-[#8c8d91]">
                We sent reset instructions to <span className="text-[#ededed] font-medium">{email}</span>
              </CardDescription>
            </CardHeader>

            <CardContent className="p-5 pt-2 space-y-4">
              <Alert className="bg-[#5fc992]/10 border-[#5fc992]/25 text-[#5fc992] py-2 px-3">
                <Mail className="h-4 w-4 text-[#5fc992]" />
                <AlertDescription className="text-xs">{message}</AlertDescription>
              </Alert>

              {debugInfo?.resetUrl && (
                <div className="p-3 rounded border border-[#27282b] bg-[#1c1d20] space-y-2">
                  <div className="flex items-center text-xs font-semibold text-[#56c2ff]">
                    <Zap className="h-3.5 w-3.5 mr-1.5" />
                    Direct Reset Link (Sandbox Mode)
                  </div>
                  <p className="text-[11px] text-[#8c8d91]">
                    You can proceed directly using the link below:
                  </p>
                  <a
                    href={debugInfo.resetUrl}
                    className="inline-flex items-center justify-center w-full bg-[#141517] hover:bg-[#27282b] text-[#ededed] border border-[#27282b] font-medium py-2 px-3 rounded text-xs transition-colors"
                  >
                    <Lock className="mr-1.5 h-3.5 w-3.5" />
                    Proceed to Reset Password
                  </a>
                </div>
              )}

              <div className="pt-2 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center text-xs text-[#8c8d91] hover:text-[#ededed] transition-colors"
                >
                  <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                  Back to Sign In
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
            <CardTitle className="text-lg font-semibold text-[#ededed]">Reset password</CardTitle>
            <CardDescription className="text-xs text-[#8c8d91]">
              Enter your account email to receive a password reset link.
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

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 bg-[#ff6363] hover:bg-[#f85353] text-white font-medium text-xs sm:text-sm mt-2 flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span>Sending reset link...</span>
                  </>
                ) : (
                  <span>Send Reset Link</span>
                )}
              </Button>
            </form>

            <div className="mt-4 pt-4 border-t border-[#27282b]/60 text-center">
              <Link
                href="/login"
                className="inline-flex items-center text-xs text-[#8c8d91] hover:text-[#ededed] transition-colors"
              >
                <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                Back to Sign In
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
