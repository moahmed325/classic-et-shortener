'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Loader2, Zap, AlertCircle, CheckCircle2, Mail, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { authApi } from '@/lib/api';

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[100dvh] bg-canvas flex items-center justify-center p-4">
          <span className="text-xs font-mono text-text-muted">LOADING VERIFICATION...</span>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { checkAuth } = useAuth();

  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const emailFromParams = searchParams.get('email');
    const codeFromParams = searchParams.get('code');
    const emailFromStorage = localStorage.getItem('pendingVerificationEmail');

    const targetEmail = emailFromParams || emailFromStorage || '';
    setEmail(targetEmail);

    if (codeFromParams && codeFromParams.length === 6) {
      setCode(codeFromParams);
      if (targetEmail) {
        handleVerification(targetEmail, codeFromParams);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [searchParams]);

  useEffect(() => {
    if (code.length === 6 && email && !isVerifying) {
      handleVerification(email, code);
    }
  }, [code, email, isVerifying]);

  const handleVerification = async (emailAddress: string, verificationCode: string) => {
    if (isVerifying) return;

    setIsVerifying(true);
    setError('');
    setSuccess('');

    try {
      const response = await authApi.verifyEmail({
        email: emailAddress,
        code: verificationCode,
      });

      if (response.success && response.user) {
        setSuccess('Email verified successfully! Redirecting to dashboard...');
        localStorage.removeItem('pendingVerificationEmail');
        await checkAuth();
        setTimeout(() => {
          router.push('/dashboard');
        }, 1200);
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please check the code.');
      setCode('');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (!email || isResending || resendCooldown > 0) return;

    setIsResending(true);
    setError('');
    setSuccess('');

    try {
      const response = await authApi.resendVerification({ email });
      if (response.success) {
        setSuccess('Verification code resent! Please check your inbox.');
        setResendCooldown(60);
        intervalRef.current = setInterval(() => {
          setResendCooldown((prev) => {
            if (prev <= 1) {
              if (intervalRef.current) clearInterval(intervalRef.current);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification code.');
    } finally {
      setIsResending(false);
    }
  };

  if (!email) {
    return (
      <div className="min-h-[100dvh] bg-canvas flex flex-col justify-center items-center px-4 py-8 selection:bg-[#ff6363]/20">
        <div className="w-full max-w-sm space-y-4">
          <div className="text-center space-y-1.5">
            <Link href="/" className="inline-flex items-center space-x-2 text-sm font-semibold tracking-tight text-text-primary">
              <div className="h-6 w-6 rounded bg-surface-2 border border-border-subtle flex items-center justify-center text-[#ff6363]">
                <Zap className="h-3.5 w-3.5 fill-current" />
              </div>
              <span className="font-mono font-bold text-base tracking-tight">classic.et</span>
            </Link>
          </div>

          <Card className="rounded-lg border border-border-subtle bg-surface-1 shadow-none">
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-lg font-semibold text-text-primary">Email required</CardTitle>
              <CardDescription className="text-xs text-text-muted">
                Please sign up or specify an email address to verify.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-2">
              <Link href="/register">
                <Button className="w-full h-10 bg-[#ff6363] hover:bg-[#f85353] text-white text-xs font-medium">
                  Go to Registration
                </Button>
              </Link>
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
          <Link href="/" className="inline-flex items-center space-x-2 text-sm font-semibold tracking-tight text-text-primary">
            <div className="h-6 w-6 rounded bg-surface-2 border border-border-subtle flex items-center justify-center text-[#ff6363]">
              <Zap className="h-3.5 w-3.5 fill-current" />
            </div>
            <span className="font-mono font-bold text-base tracking-tight">classic.et</span>
          </Link>
        </div>

        {/* Tactical Auth Card */}
        <Card className="rounded-lg border border-border-subtle bg-surface-1 shadow-none">
          <CardHeader className="p-5 pb-3 text-center">
            <div className="mx-auto h-9 w-9 rounded bg-[#56c2ff]/10 border border-[#56c2ff]/25 flex items-center justify-center text-[#56c2ff] mb-2">
              <Mail className="h-4 w-4" />
            </div>
            <CardTitle className="text-lg font-semibold text-text-primary">Verify email</CardTitle>
            <CardDescription className="text-xs text-text-muted">
              Enter the 6-digit code sent to <span className="text-text-primary font-medium">{email}</span>
            </CardDescription>
          </CardHeader>

          <CardContent className="p-5 pt-2 space-y-4">
            {error && (
              <Alert variant="destructive" className="bg-[#ff6363]/10 border-[#ff6363]/25 text-[#ff6363] py-2 px-3">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="bg-[#5fc992]/10 border-[#5fc992]/25 text-[#5fc992] py-2 px-3">
                <CheckCircle2 className="h-4 w-4 text-[#5fc992]" />
                <AlertDescription className="text-xs">{success}</AlertDescription>
              </Alert>
            )}

            {/* Centered OTP Input */}
            <div className="flex justify-center py-2">
              <InputOTP
                maxLength={6}
                value={code}
                onChange={setCode}
                disabled={isVerifying}
              >
                <InputOTPGroup className="gap-1.5">
                  <InputOTPSlot index={0} className="h-11 w-10 sm:h-12 sm:w-11 bg-surface-2 border-border-subtle text-base font-mono text-text-primary rounded-md" />
                  <InputOTPSlot index={1} className="h-11 w-10 sm:h-12 sm:w-11 bg-surface-2 border-border-subtle text-base font-mono text-text-primary rounded-md" />
                  <InputOTPSlot index={2} className="h-11 w-10 sm:h-12 sm:w-11 bg-surface-2 border-border-subtle text-base font-mono text-text-primary rounded-md" />
                  <InputOTPSlot index={3} className="h-11 w-10 sm:h-12 sm:w-11 bg-surface-2 border-border-subtle text-base font-mono text-text-primary rounded-md" />
                  <InputOTPSlot index={4} className="h-11 w-10 sm:h-12 sm:w-11 bg-surface-2 border-border-subtle text-base font-mono text-text-primary rounded-md" />
                  <InputOTPSlot index={5} className="h-11 w-10 sm:h-12 sm:w-11 bg-surface-2 border-border-subtle text-base font-mono text-text-primary rounded-md" />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <Button
              onClick={() => handleVerification(email, code)}
              disabled={isVerifying || code.length !== 6}
              className="w-full h-10 bg-[#ff6363] hover:bg-[#f85353] text-white font-medium text-xs sm:text-sm flex items-center justify-center"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <span>Confirm Code</span>
              )}
            </Button>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={handleResendCode}
                disabled={isResending || resendCooldown > 0}
                className="text-xs text-text-muted hover:text-text-primary disabled:opacity-50 transition-colors font-mono"
              >
                {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend verification code'}
              </button>
            </div>

            <div className="mt-4 pt-3 border-t border-border-subtle text-center">
              <Link href="/login" className="text-xs text-text-muted hover:text-text-primary transition-colors">
                Back to Sign In
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
