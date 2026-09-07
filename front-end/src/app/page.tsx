'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Kbd } from '@/components/ui/kbd';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAuth } from '@/contexts/auth-context';
import { linksApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import {
  Link2,
  ArrowRight,
  Copy,
  Check,
  Globe2,
  Zap,
  BarChart3,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  Terminal,
} from 'lucide-react';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [url, setUrl] = useState('');
  const [slug, setSlug] = useState('');
  const [showSlug, setShowSlug] = useState(false);
  const [isShortening, setIsShortening] = useState(false);
  const [shortenedUrl, setShortenedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const handleShorten = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    if (!user) {
      // If unauthenticated, redirect to registration with the intent
      router.push(`/register?url=${encodeURIComponent(url.trim())}`);
      return;
    }

    setIsShortening(true);
    try {
      const res = await linksApi.create({
        originalUrl: url.trim(),
        ...(slug.trim() ? { customCode: slug.trim() } : {}),
      });
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://classic.et';
      setShortenedUrl(`${origin}/${res.shortCode}`);
      toast({
        title: 'Link shortened',
        description: `Created /${res.shortCode}`,
      });
    } catch (err: any) {
      toast({
        title: 'Shortening failed',
        description: err.message || 'Please check your URL and try again',
        variant: 'destructive',
      });
    } finally {
      setIsShortening(false);
    }
  };

  const copyToClipboard = async () => {
    if (!shortenedUrl) return;
    try {
      await navigator.clipboard.writeText(shortenedUrl);
      setCopied(true);
      toast({ title: 'Copied to clipboard' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: 'Failed to copy', variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-canvas flex items-center justify-center">
        <div className="flex items-center space-x-2 text-[#8c8d91] font-mono text-xs">
          <span className="h-2 w-2 rounded-full bg-[#5fc992] animate-ping" />
          <span>INITIALIZING CORE...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-canvas text-[#ededed] flex flex-col selection:bg-[#ff6363]/20 selection:text-white">
      {/* Tactical Top Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-[#27282b] bg-[#0c0d0e]">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2 text-sm font-semibold tracking-tight text-[#ededed]">
              <div className="h-5 w-5 rounded bg-[#1c1d20] border border-[#27282b] flex items-center justify-center text-[#ff6363]">
                <Zap className="h-3 w-3 fill-current" />
              </div>
              <span className="font-mono font-bold tracking-tight">classic.et</span>
            </Link>
            <div className="hidden sm:flex items-center space-x-1.5 pl-2 border-l border-[#27282b]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#5fc992]" />
              <span className="font-mono text-[11px] text-[#8c8d91]">Edge v2.1</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-xs h-9 px-3">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="text-xs h-9 px-3.5 bg-[#ff6363] hover:bg-[#f85353] text-white">
                Get Started
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Command Content */}
      <main className="flex-1 max-w-5xl mx-auto px-4 py-12 sm:py-16 w-full flex flex-col justify-center">
        {/* Command Hero Header */}
        <div className="space-y-4 max-w-2xl mb-8">
          <div className="inline-flex items-center space-x-2 px-2 py-0.5 rounded border border-[#27282b] bg-[#141517] text-xs font-mono text-[#8c8d91]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#5fc992]" />
            <span>CLOUDFLARE D1 + WORKERS ROUTING</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-[#ededed] leading-[1.15]">
            High-density URL shortening with edge telemetry.
          </h1>
          <p className="text-sm sm:text-base text-[#8c8d91] leading-relaxed">
            Instant shortlink redirection, geo/referrer analytics, and branded slug mechanics. Optimized for speed and zero layout bloat.
          </p>
        </div>

        {/* Primary Tactical Command Input */}
        <div className="rounded-lg border border-[#27282b] bg-[#141517] p-3 sm:p-4 mb-8 shadow-none">
          <form onSubmit={handleShorten} className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8c8d91]" />
                <Input
                  type="url"
                  placeholder="Paste long destination URL (e.g., https://github.com/...)"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                  className="pl-9 bg-[#1c1d20] border-[#27282b] text-[#ededed] text-sm h-11 sm:h-10 focus-visible:ring-1 focus-visible:ring-[#56c2ff]"
                />
              </div>
              <Button
                type="submit"
                disabled={isShortening}
                className="h-11 sm:h-10 px-5 bg-[#ff6363] hover:bg-[#f85353] text-white font-medium text-xs sm:text-sm flex items-center justify-center space-x-1.5 flex-shrink-0"
              >
                <span>{user ? (isShortening ? 'Shortening...' : 'Shorten Link') : 'Get Short Link'}</span>
                <Kbd className="hidden sm:inline-flex ml-1 bg-black/20 border-white/20 text-white text-[10px]">↵</Kbd>
              </Button>
            </div>

            {/* Custom Slug Toggle */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setShowSlug(!showSlug)}
                className="text-xs text-[#8c8d91] hover:text-[#ededed] transition-colors flex items-center space-x-1 font-mono select-none"
              >
                <span>{showSlug ? '[-] Hide custom slug' : '[+] Add custom slug'}</span>
              </button>
              <span className="text-[11px] text-[#8c8d91] font-mono">
                Protocol: <span className="text-[#5fc992]">HTTPS</span>
              </span>
            </div>

            {showSlug && (
              <div className="pt-2 flex items-center space-x-2">
                <span className="text-xs font-mono text-[#8c8d91] select-none bg-[#1c1d20] px-2.5 py-2 border border-[#27282b] rounded-md">
                  classic.et/
                </span>
                <Input
                  type="text"
                  placeholder="custom-slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.replace(/[^a-zA-Z0-9-_]/g, ''))}
                  className="bg-[#1c1d20] border-[#27282b] text-[#ededed] text-sm font-mono h-9"
                />
              </div>
            )}
          </form>

          {/* Shortened Result Banner */}
          {shortenedUrl && (
            <div className="mt-4 pt-4 border-t border-[#27282b] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-[#1c1d20]/50 p-3 rounded-md">
              <div className="flex items-center space-x-2 min-w-0">
                <span className="h-2 w-2 rounded-full bg-[#5fc992]" />
                <span className="font-mono text-xs sm:text-sm text-[#ededed] truncate">
                  {shortenedUrl}
                </span>
              </div>
              <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                  className="h-8 px-3 text-xs bg-[#141517] border-[#27282b]"
                >
                  {copied ? <Check className="h-3.5 w-3.5 mr-1 text-[#5fc992]" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </Button>
                <a href={shortenedUrl} target="_blank" rel="noreferrer">
                  <Button variant="ghost" size="sm" className="h-8 px-2.5 text-xs text-[#8c8d91] hover:text-[#ededed]">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* High-Density 1px-Bordered Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-12">
          <div className="rounded-md border border-[#27282b] bg-[#141517] p-4 flex flex-col justify-between hover:bg-[#18191c] transition-colors">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Zap className="h-4 w-4 text-[#ff6363]" />
                <Kbd>&lt;50ms</Kbd>
              </div>
              <h2 className="text-sm font-semibold text-[#ededed]">Edge Redirection</h2>
              <p className="text-xs text-[#8c8d91] leading-relaxed">
                Global Anycast routing with zero cold-starts via Cloudflare Workers.
              </p>
            </div>
            <div className="pt-3 mt-3 border-t border-[#27282b]/60 flex items-center justify-between text-[11px] font-mono text-[#8c8d91]">
              <span>Latency</span>
              <span className="text-[#5fc992]">Optimal</span>
            </div>
          </div>

          <div className="rounded-md border border-[#27282b] bg-[#141517] p-4 flex flex-col justify-between hover:bg-[#18191c] transition-colors">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <BarChart3 className="h-4 w-4 text-[#56c2ff]" />
                <Kbd>Telemetry</Kbd>
              </div>
              <h2 className="text-sm font-semibold text-[#ededed]">Live Clickstream</h2>
              <p className="text-xs text-[#8c8d91] leading-relaxed">
                Detailed breakdowns by referrer, browser, device type, and country.
              </p>
            </div>
            <div className="pt-3 mt-3 border-t border-[#27282b]/60 flex items-center justify-between text-[11px] font-mono text-[#8c8d91]">
              <span>Ingestion</span>
              <span className="text-[#56c2ff]">Realtime</span>
            </div>
          </div>

          <div className="rounded-md border border-[#27282b] bg-[#141517] p-4 flex flex-col justify-between hover:bg-[#18191c] transition-colors">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Globe2 className="h-4 w-4 text-[#5fc992]" />
                <Kbd>Domains</Kbd>
              </div>
              <h2 className="text-sm font-semibold text-[#ededed]">Custom Slugs</h2>
              <p className="text-xs text-[#8c8d91] leading-relaxed">
                Clean, readable keywords and configurable expiration timestamps.
              </p>
            </div>
            <div className="pt-3 mt-3 border-t border-[#27282b]/60 flex items-center justify-between text-[11px] font-mono text-[#8c8d91]">
              <span>Keywords</span>
              <span className="text-[#ededed]">Supported</span>
            </div>
          </div>

          <div className="rounded-md border border-[#27282b] bg-[#141517] p-4 flex flex-col justify-between hover:bg-[#18191c] transition-colors">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Terminal className="h-4 w-4 text-[#f59e0b]" />
                <Kbd>API</Kbd>
              </div>
              <h2 className="text-sm font-semibold text-[#ededed]">REST API</h2>
              <p className="text-xs text-[#8c8d91] leading-relaxed">
                Automate link generation with secure Bearer tokens and JSON outputs.
              </p>
            </div>
            <div className="pt-3 mt-3 border-t border-[#27282b]/60 flex items-center justify-between text-[11px] font-mono text-[#8c8d91]">
              <span>Protocol</span>
              <span className="text-[#f59e0b]">v1 API</span>
            </div>
          </div>
        </div>

        {/* Secondary Command CTA */}
        <div className="rounded-lg border border-[#27282b] bg-[#141517] p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-base font-semibold text-[#ededed]">Deploying links at scale?</h3>
            <p className="text-xs text-[#8c8d91]">Create an account to track visitors, download analytics reports, and customize URLs.</p>
          </div>
          <Link href="/register" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto bg-[#ededed] hover:bg-white text-black font-semibold text-xs h-10 px-5">
              Create Account
              <ChevronRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </main>

      {/* Tactical Minimal Footer */}
      <footer className="w-full border-t border-[#27282b] bg-[#0c0d0e] py-6">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#8c8d91]">
          <div className="flex items-center space-x-2">
            <span className="h-2 w-2 rounded-full bg-[#5fc992]" />
            <span>ALL SYSTEMS NORMAL — CLOUDFLARE EDGE + D1</span>
          </div>

          <div className="flex items-center space-x-4">
            <Link href="/login" className="hover:text-[#ededed] transition-colors">Sign In</Link>
            <Link href="/register" className="hover:text-[#ededed] transition-colors">Register</Link>
            <Link href="/dashboard" className="hover:text-[#ededed] transition-colors">Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
