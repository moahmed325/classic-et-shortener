'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  Link2, 
  ArrowRight, 
  Copy, 
  Check, 
  ExternalLink, 
  Loader2, 
  SlidersHorizontal, 
  Calendar, 
  Sparkles,
  QrCode
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Kbd } from '@/components/ui/kbd';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { linksApi } from '@/lib/api';

export interface ShortenedLink {
  id: string;
  shortCode: string;
  originalUrl: string;
  title: string | null;
  clickCount: number;
  createdAt: string;
  isActive: boolean;
  expiresAt?: string | null;
}

interface LinkShortenerProps {
  onLinkCreated?: (newLink: ShortenedLink) => void;
}

export function LinkShortener({ onLinkCreated }: LinkShortenerProps) {
  const [url, setUrl] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [title, setTitle] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [useCustomCode, setUseCustomCode] = useState(false);
  const [useExpiration, setUseExpiration] = useState(false);
  const [expirationDate, setExpirationDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [createdLink, setCreatedLink] = useState<ShortenedLink | null>(null);
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const isProOrPremium = user?.tier === 'pro' || user?.tier === 'premium';

  // Auto-focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      toast({
        title: 'URL required',
        description: 'Please paste or type a destination URL',
        variant: 'destructive',
      });
      inputRef.current?.focus();
      return;
    }

    if (useCustomCode && !isProOrPremium) {
      toast({
        title: 'Pro feature',
        description: 'Custom short codes require a Pro or Premium plan',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const payload: {
        originalUrl: string;
        customCode?: string;
        title?: string;
        expiresAt?: string;
      } = {
        originalUrl: trimmedUrl,
        ...(useCustomCode && customCode.trim() ? { customCode: customCode.trim() } : {}),
        ...(title.trim() ? { title: title.trim() } : {}),
        ...(useExpiration && expirationDate ? { expiresAt: new Date(expirationDate).toISOString() } : {}),
      };

      const result = await linksApi.create(payload);
      setCreatedLink(result);
      onLinkCreated?.(result);

      // Reset input fields
      setUrl('');
      setCustomCode('');
      setTitle('');
      setUseCustomCode(false);
      setUseExpiration(false);
      setExpirationDate('');
      setShowOptions(false);

      toast({
        title: 'Link created',
        description: `classic.et/${result.shortCode}`,
      });
    } catch (error: any) {
      toast({
        title: 'Error creating link',
        description: error.message || 'Could not shorten link. Please verify URL format.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8787';
  const getFullShortUrl = (code: string) => `${baseUrl}/${code}`;
  const getDisplayShortUrl = (code: string) => `classic.et/${code}`;

  const handleCopy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(getFullShortUrl(code));
      setCopied(true);
      toast({
        title: 'Copied to clipboard',
        description: getDisplayShortUrl(code),
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: 'Copy failed',
        description: 'Unable to access clipboard',
        variant: 'destructive',
      });
    }
  };

  const qrImageUrl = createdLink 
    ? `https://api.qrserver.com/v1/create-qr-code/?size=260x260&format=svg&data=${encodeURIComponent(getFullShortUrl(createdLink.shortCode))}`
    : '';

  return (
    <div className="space-y-3">
      {/* Command Bar Container */}
      <div className="rounded-md border border-border-subtle bg-surface-1 p-3 sm:p-4 transition-colors">
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Main Command Input Row */}
          <div className="flex flex-col sm:flex-row items-stretch gap-2">
            <div className="relative flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500 dark:text-zinc-400">
                <Link2 className="h-4 w-4" />
              </div>
              <Input
                ref={inputRef}
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste a long destination URL (e.g., https://github.com/owner/repo)..."
                disabled={isLoading}
                className="h-11 sm:h-12 pl-9 pr-3 text-base sm:text-sm bg-surface-1 border border-border-subtle text-zinc-950 dark:text-zinc-50 placeholder:text-zinc-400 focus-visible:ring-1 focus-visible:ring-primary rounded-md"
              />
            </div>

            <div className="flex items-center gap-2">
              {/* Toggle Options Button */}
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowOptions(!showOptions)}
                className={`min-h-[44px] sm:h-12 px-3 border border-border-subtle bg-surface-1 hover:bg-surface-2 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-zinc-50 ${showOptions ? 'border-zinc-900 dark:border-zinc-100 text-zinc-950 dark:text-zinc-50 font-semibold' : ''}`}
                title="Configure custom slug & options"
              >
                <SlidersHorizontal className="h-4 w-4 mr-1.5" />
                <span className="text-xs font-mono">Slug</span>
              </Button>

              {/* Primary CTA Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="min-h-[44px] sm:h-12 px-5 bg-[#ff6363] hover:bg-[#ff4d4d] text-white font-medium text-xs sm:text-sm flex items-center gap-2 transition-transform active:scale-[0.98] rounded-md shadow-sm"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <span>Create Link</span>
                    <Kbd className="bg-black/30 border-white/20 text-white text-[10px] px-1 py-0.5">↵</Kbd>
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Clean Expandable Slug & Custom Options */}
          {showOptions && (
            <div className="pt-3 border-t border-border-subtle grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in-50 duration-150">
              {/* Custom Slug */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="custom-slug" className="text-xs font-mono text-zinc-700 dark:text-zinc-300 font-medium">
                    Custom Slug
                  </Label>
                  {!isProOrPremium && (
                    <span className="text-[10px] font-mono text-amber-700 dark:text-[#f59e0b] bg-amber-50 dark:bg-[#f59e0b]/10 border border-amber-200 dark:border-[#f59e0b]/20 px-1.5 py-0.2 rounded font-medium">
                      Pro / Premium
                    </span>
                  )}
                </div>
                <div className="flex items-center rounded-md border border-border-subtle bg-surface-1 overflow-hidden focus-within:ring-1 focus-within:ring-primary">
                  <span className="px-2.5 py-2 min-h-[44px] sm:min-h-0 flex items-center text-xs font-mono text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 border-r border-border-subtle select-none font-medium">
                    classic.et/
                  </span>
                  <Input
                    id="custom-slug"
                    type="text"
                    value={customCode}
                    onChange={(e) => {
                      setCustomCode(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ''));
                      setUseCustomCode(true);
                    }}
                    placeholder="custom-slug"
                    maxLength={32}
                    disabled={isLoading || !isProOrPremium}
                    className="border-0 bg-transparent text-base sm:text-xs font-mono text-zinc-950 dark:text-zinc-50 placeholder:text-zinc-400 h-11 sm:h-9 min-h-[44px] sm:min-h-0 focus-visible:ring-0 px-2.5"
                  />
                </div>
              </div>

              {/* Title (Optional) */}
              <div className="space-y-1.5">
                <Label htmlFor="link-title" className="text-xs font-mono text-zinc-700 dark:text-zinc-300 font-medium">
                  Title (Optional)
                </Label>
                <Input
                  id="link-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Campaign or referral label"
                  disabled={isLoading}
                  className="bg-surface-1 border border-border-subtle text-base sm:text-xs text-zinc-950 dark:text-zinc-50 placeholder:text-zinc-400 h-11 sm:h-9 min-h-[44px] sm:min-h-0 focus-visible:ring-1 focus-visible:ring-primary"
                />
              </div>

              {/* Expiration Date (Pro/Premium) */}
              <div className="space-y-1.5 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="use-expiration"
                      checked={useExpiration}
                      onCheckedChange={setUseExpiration}
                      disabled={isLoading || !isProOrPremium}
                    />
                    <Label htmlFor="use-expiration" className="text-xs font-mono text-zinc-700 dark:text-zinc-300 cursor-pointer flex items-center gap-1.5 font-medium">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Set link expiration</span>
                    </Label>
                  </div>
                  {!isProOrPremium && (
                    <span className="text-[10px] font-mono text-amber-700 dark:text-[#f59e0b] font-medium">Pro required</span>
                  )}
                </div>

                {useExpiration && isProOrPremium && (
                  <Input
                    type="datetime-local"
                    value={expirationDate}
                    onChange={(e) => setExpirationDate(e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                    disabled={isLoading}
                    className="bg-surface-1 border border-border-subtle text-base sm:text-xs text-zinc-950 dark:text-zinc-50 h-11 sm:h-9 min-h-[44px] sm:min-h-0 focus-visible:ring-1 focus-visible:ring-primary max-w-xs mt-1"
                  />
                )}
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Inline Feedback on Creation (Zero Layout Shift, Instant Feedback) */}
      {createdLink && (
        <div className="rounded-md border border-[#5fc992]/40 bg-surface-1 p-3 sm:p-4 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded bg-[#5fc992]/10 text-[#5fc992]">
                <Check className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-[#5fc992]">Link Ready</span>
                  <span className="text-text-muted">•</span>
                  <span className="font-mono text-xs font-semibold text-text-primary truncate">
                    {getDisplayShortUrl(createdLink.shortCode)}
                  </span>
                </div>
                <p className="text-[11px] text-text-muted truncate font-sans">
                  {createdLink.originalUrl}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy(createdLink.shortCode)}
                className="min-h-[44px] px-3 border-border-subtle bg-surface-2 hover:bg-border-subtle text-text-primary text-xs font-mono flex items-center gap-1.5"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-[#5fc992]" />
                    <span className="text-[#5fc992]">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-text-muted" />
                    <span>Copy</span>
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowQR(true)}
                className="min-h-[44px] px-3 border-border-subtle bg-surface-2 hover:bg-border-subtle text-text-muted hover:text-text-primary text-xs"
                title="View QR Code"
              >
                <QrCode className="h-4 w-4" />
              </Button>

              <a
                href={getFullShortUrl(createdLink.shortCode)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="min-h-[44px] px-3 border-border-subtle bg-surface-2 hover:bg-border-subtle text-text-muted hover:text-text-primary text-xs"
                  title="Open in new tab"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal for newly created link */}
      {createdLink && (
        <Dialog open={showQR} onOpenChange={setShowQR}>
          <DialogContent className="border border-border-subtle bg-surface-1 text-text-primary w-[calc(100vw-2rem)] max-w-sm p-6 overscroll-contain">
            <DialogHeader className="text-center sm:text-center">
              <DialogTitle className="text-base font-semibold text-text-primary">QR Code</DialogTitle>
              <DialogDescription className="font-mono text-xs text-text-muted truncate">
                {getDisplayShortUrl(createdLink.shortCode)}
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col items-center justify-center py-2">
              <div className="p-3 bg-white rounded-md border border-border-subtle">
                <img
                  src={qrImageUrl}
                  alt={`QR code for ${createdLink.shortCode}`}
                  className="h-48 w-48 object-contain"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => handleCopy(createdLink.shortCode)}
                className="w-full min-h-[44px] border-border-subtle bg-surface-2 hover:bg-border-subtle text-text-primary text-xs"
              >
                <Copy className="mr-2 h-4 w-4 text-text-muted" />
                Copy Short URL
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
