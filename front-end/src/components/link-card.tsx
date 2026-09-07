'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Copy, 
  Check, 
  ExternalLink, 
  BarChart2, 
  MoreHorizontal, 
  Edit3, 
  Trash2, 
  QrCode, 
  Globe, 
  Power, 
  Download,
  Calendar,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Kbd } from '@/components/ui/kbd';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { linksApi } from '@/lib/api';

export interface LinkItem {
  id: string;
  shortCode: string;
  originalUrl: string;
  title: string | null;
  clickCount: number;
  createdAt: string;
  isActive: boolean;
  expiresAt: string | null;
}

interface LinkCardProps {
  link: LinkItem;
  onUpdate?: (updated: LinkItem) => void;
  onDelete?: (id: string) => void;
}

function extractDomain(url: string): string {
  try {
    const formatted = url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
    const parsed = new URL(formatted);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

export function LinkCard({ link, onUpdate, onDelete }: LinkCardProps) {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [faviconError, setFaviconError] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Edit form state
  const [editTitle, setEditTitle] = useState(link.title || '');
  const [editUrl, setEditUrl] = useState(link.originalUrl);
  const [editActive, setEditActive] = useState(link.isActive);
  const [editExpiresAt, setEditExpiresAt] = useState(
    link.expiresAt ? new Date(link.expiresAt).toISOString().slice(0, 16) : ''
  );

  const { toast } = useToast();
  const router = useRouter();

  const domain = extractDomain(link.originalUrl);
  const faviconUrl = domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=64` : null;

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8787';
  const fullShortUrl = `${baseUrl}/${link.shortCode}`;
  const displayShortUrl = `classic.et/${link.shortCode}`;

  const isExpired = Boolean(link.expiresAt && new Date(link.expiresAt) < new Date());

  const handleCopy = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      await navigator.clipboard.writeText(fullShortUrl);
      setCopied(true);
      toast({
        title: 'Copied to clipboard',
        description: displayShortUrl,
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

  const handleToggleActive = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsUpdating(true);
    try {
      const nextActive = !link.isActive;
      await linksApi.update(link.id, { isActive: nextActive });
      const updated = { ...link, isActive: nextActive };
      onUpdate?.(updated);
      toast({
        title: nextActive ? 'Link activated' : 'Link deactivated',
        description: `${displayShortUrl} is now ${nextActive ? 'active' : 'inactive'}.`,
      });
    } catch (err: any) {
      toast({
        title: 'Update failed',
        description: err.message || 'Could not update link status',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUrl.trim()) {
      toast({
        title: 'Destination URL required',
        variant: 'destructive',
      });
      return;
    }

    setIsUpdating(true);
    try {
      await linksApi.update(link.id, {
        title: editTitle.trim() || undefined,
        originalUrl: editUrl.trim(),
        isActive: editActive,
        expiresAt: editExpiresAt ? new Date(editExpiresAt).toISOString() : null,
      });

      const updated: LinkItem = {
        ...link,
        title: editTitle.trim() || null,
        originalUrl: editUrl.trim(),
        isActive: editActive,
        expiresAt: editExpiresAt ? new Date(editExpiresAt).toISOString() : null,
      };

      onUpdate?.(updated);
      setShowEdit(false);
      toast({
        title: 'Link updated',
        description: 'Changes saved successfully.',
      });
    } catch (err: any) {
      toast({
        title: 'Failed to save',
        description: err.message || 'Could not update link details',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this short link? This cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      await linksApi.delete(link.id);
      onDelete?.(link.id);
      toast({
        title: 'Link deleted',
        description: displayShortUrl,
      });
    } catch (err: any) {
      toast({
        title: 'Delete failed',
        description: err.message || 'Could not delete link',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&format=svg&data=${encodeURIComponent(fullShortUrl)}`;

  const formattedDate = new Date(link.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <>
      <div className="group relative rounded-md border border-border-subtle bg-surface-1 p-3 sm:p-4 hover:border-border-strong transition-colors">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {/* Left Section: Favicon + Slug + Truncated Destination */}
          <div className="flex items-start gap-3 min-w-0 flex-1">
            {/* Domain Favicon with fallback */}
            <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded border border-border-subtle bg-surface-2 overflow-hidden">
              {faviconUrl && !faviconError ? (
                <img
                  src={faviconUrl}
                  alt={domain || 'domain icon'}
                  className="h-4 w-4 object-contain"
                  onError={() => setFaviconError(true)}
                  loading="lazy"
                />
              ) : (
                <Globe className="h-4 w-4 text-text-muted" />
              )}
            </div>

            {/* Link Details */}
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/dashboard/links/${link.id}`}
                  className="font-mono text-sm font-bold text-zinc-950 dark:text-zinc-50 hover:text-[#ff6363] transition-colors truncate"
                >
                  {displayShortUrl}
                </Link>

                <a
                  href={fullShortUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Visit short URL"
                  className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors p-0.5"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>

                {/* Status Badges */}
                {isExpired ? (
                  <Badge variant="destructive" className="text-[10px] px-1.5 py-0 uppercase tracking-wider font-mono">
                    Expired
                  </Badge>
                ) : !link.isActive ? (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 uppercase tracking-wider font-mono border border-zinc-200 dark:border-zinc-700">
                    Inactive
                  </Badge>
                ) : null}
              </div>

              {/* Destination URL & Title */}
              <div className="min-w-0 flex items-center gap-2">
                <p 
                  className="truncate text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-50 transition-colors font-sans"
                  title={link.originalUrl}
                >
                  {link.title ? (
                    <span className="text-zinc-950 dark:text-zinc-50 font-semibold mr-1.5">{link.title} —</span>
                  ) : null}
                  {link.originalUrl}
                </p>
              </div>

              {/* Meta timestamp */}
              <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400 font-mono pt-0.5">
                <span>Added {formattedDate}</span>
                {domain && (
                  <>
                    <span>•</span>
                    <span className="truncate max-w-[150px]">{domain}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Section: Clicks Badge + Quick Copy + Action Controls */}
          <div className="flex items-center justify-between md:justify-end gap-2 pt-2 border-t border-border-subtle/60 md:border-t-0 md:pt-0">
            {/* Clicks Badge as tactile Kbd */}
            <Link 
              href={`/dashboard/links/${link.id}`}
              title="View detailed analytics"
              className="focus:outline-none"
            >
              <Kbd className="cursor-pointer hover:border-border-strong hover:bg-surface-2 transition-colors px-2.5 py-1 text-xs tabular-nums text-zinc-950 dark:text-zinc-50 font-semibold gap-1.5">
                <BarChart2 className="h-3 w-3 text-[#5fc992]" />
                <span>{link.clickCount.toLocaleString()} {link.clickCount === 1 ? 'click' : 'clicks'}</span>
              </Kbd>
            </Link>

            <div className="flex items-center gap-1.5">
              {/* Quick Copy Button with 44px touch target */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                aria-label="Copy short link"
                className="min-h-[44px] min-w-[44px] p-0 border-border-subtle bg-surface-1 hover:bg-surface-2 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-zinc-50 focus-visible:ring-1 focus-visible:ring-primary"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-[#5fc992] transition-transform scale-110" />
                ) : (
                  <Copy className="h-4 w-4 transition-transform group-hover:scale-105" />
                )}
              </Button>

              {/* QR Code Trigger Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowQR(true)}
                aria-label="Show QR Code"
                className="min-h-[44px] min-w-[44px] p-0 border-border-subtle bg-surface-1 hover:bg-surface-2 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-zinc-50 focus-visible:ring-1 focus-visible:ring-primary"
              >
                <QrCode className="h-4 w-4" />
              </Button>

              {/* Action Dropdown Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    aria-label="Link actions"
                    className="min-h-[44px] min-w-[44px] p-0 border-border-subtle bg-surface-1 hover:bg-surface-2 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-zinc-50 focus-visible:ring-1 focus-visible:ring-primary"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-48 bg-surface-1 border border-border-subtle text-text-primary p-1 shadow-none"
                >
                  <DropdownMenuItem
                    onClick={() => router.push(`/dashboard/links/${link.id}`)}
                    className="min-h-[44px] cursor-pointer hover:bg-surface-2 focus:bg-surface-2 text-xs font-sans px-3"
                  >
                    <BarChart2 className="mr-2 h-4 w-4 text-[#5fc992]" />
                    <span>View Analytics</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => setShowEdit(true)}
                    className="min-h-[44px] cursor-pointer hover:bg-surface-2 focus:bg-surface-2 text-xs font-sans px-3"
                  >
                    <Edit3 className="mr-2 h-4 w-4 text-[#56c2ff]" />
                    <span>Edit Destination</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={handleToggleActive}
                    disabled={isUpdating}
                    className="min-h-[44px] cursor-pointer hover:bg-surface-2 focus:bg-surface-2 text-xs font-sans px-3"
                  >
                    <Power className={`mr-2 h-4 w-4 ${link.isActive ? 'text-[#f59e0b]' : 'text-[#5fc992]'}`} />
                    <span>{link.isActive ? 'Pause Link' : 'Activate Link'}</span>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="bg-border-subtle" />

                  <DropdownMenuItem
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="min-h-[44px] cursor-pointer text-[#ff6363] hover:bg-[#ff6363]/10 focus:bg-[#ff6363]/10 text-xs font-sans px-3"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Delete Link</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Modal with overscroll-contain */}
      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent className="border border-border-subtle bg-surface-1 text-text-primary max-w-sm p-6 overscroll-contain">
          <DialogHeader className="text-center sm:text-center">
            <DialogTitle className="text-base font-semibold text-text-primary">QR Code</DialogTitle>
            <DialogDescription className="font-mono text-xs text-text-muted truncate">
              {displayShortUrl}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center justify-center py-2">
            <div className="p-3 bg-white rounded-md border border-border-subtle">
              <img
                src={qrImageUrl}
                alt={`QR code for ${displayShortUrl}`}
                className="h-48 w-48 object-contain"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <a
              href={qrImageUrl}
              download={`${link.shortCode}-qr.svg`}
              target="_blank"
              rel="noreferrer"
              className="w-full"
            >
              <Button
                variant="outline"
                className="w-full min-h-[44px] border-border-subtle bg-surface-2 hover:bg-border-subtle text-text-primary text-xs font-mono"
              >
                <Download className="mr-2 h-4 w-4 text-text-muted" />
                Download SVG
              </Button>
            </a>
            <Button
              variant="outline"
              onClick={handleCopy}
              className="w-full min-h-[44px] border-border-subtle bg-surface-2 hover:bg-border-subtle text-text-primary text-xs"
            >
              <Copy className="mr-2 h-4 w-4 text-text-muted" />
              Copy Link
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Link Modal with overscroll-contain and 44px touch targets */}
      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent className="border border-border-subtle bg-surface-1 text-text-primary max-w-md p-6 overscroll-contain">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-text-primary">Edit Short Link</DialogTitle>
            <DialogDescription className="font-mono text-xs text-text-muted">
              {displayShortUrl}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveEdit} className="space-y-4 pt-2">
            {/* Destination URL */}
            <div className="space-y-1.5">
              <Label htmlFor={`edit-url-${link.id}`} className="text-xs font-medium text-text-muted">
                Destination URL
              </Label>
              <Input
                id={`edit-url-${link.id}`}
                type="url"
                required
                value={editUrl}
                onChange={(e) => setEditUrl(e.target.value)}
                placeholder="https://example.com/target"
                className="min-h-[44px] bg-surface-2 border-border-subtle text-base sm:text-sm text-text-primary focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>

            {/* Title (Optional) */}
            <div className="space-y-1.5">
              <Label htmlFor={`edit-title-${link.id}`} className="text-xs font-medium text-text-muted">
                Title (Optional)
              </Label>
              <Input
                id={`edit-title-${link.id}`}
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Campaign / Dashboard link title"
                className="min-h-[44px] bg-surface-2 border-border-subtle text-base sm:text-sm text-text-primary focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>

            {/* Expiration Date */}
            <div className="space-y-1.5">
              <Label htmlFor={`edit-exp-${link.id}`} className="text-xs font-medium text-text-muted flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                <span>Expiration Date (Optional)</span>
              </Label>
              <Input
                id={`edit-exp-${link.id}`}
                type="datetime-local"
                value={editExpiresAt}
                onChange={(e) => setEditExpiresAt(e.target.value)}
                className="min-h-[44px] bg-surface-2 border-border-subtle text-base sm:text-sm text-text-primary focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>

            {/* Active Toggle */}
            <div className="flex items-center justify-between rounded-md border border-border-subtle bg-surface-2 p-3">
              <div>
                <Label htmlFor={`edit-active-${link.id}`} className="text-xs font-medium text-text-primary cursor-pointer">
                  Link Status
                </Label>
                <p className="text-[11px] text-text-muted">
                  {editActive ? 'Link is active and redirecting traffic' : 'Link is paused (visitors see 404/expired)'}
                </p>
              </div>
              <Switch
                id={`edit-active-${link.id}`}
                checked={editActive}
                onCheckedChange={setEditActive}
              />
            </div>

            {/* Form CTAs */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEdit(false)}
                className="min-h-[44px] border-border-subtle bg-surface-1 hover:bg-surface-2 text-text-primary text-xs px-4"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isUpdating}
                className="min-h-[44px] bg-[#ff6363] hover:bg-[#ff4d4d] text-white text-xs font-medium px-5"
              >
                {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
                Save Changes
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
