'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Copy, 
  Check, 
  ExternalLink, 
  Globe, 
  Calendar, 
  Edit3, 
  Trash2, 
  Loader2,
  QrCode,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { linksApi, LinkAnalyticsResponse } from '@/lib/api';
import { TimeRangeSelector, TimeRangeValue } from '@/components/analytics/time-range-selector';
import { AnalyticsStatCards } from '@/components/analytics/analytics-stat-cards';
import { AnalyticsChart } from '@/components/analytics/analytics-chart';
import { AnalyticsBreakdownGrid } from '@/components/analytics/analytics-breakdown-grid';

function extractDomain(url: string): string {
  try {
    const formatted = url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
    const parsed = new URL(formatted);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

export default function LinkDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const linkId = params.linkId as string;

  const [data, setData] = useState<LinkAnalyticsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRangeValue>('30');
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Edit form state
  const [editTitle, setEditTitle] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [editActive, setEditActive] = useState(true);
  const [editExpiresAt, setEditExpiresAt] = useState('');

  useEffect(() => {
    fetchLinkAnalytics();
  }, [linkId, timeRange]);

  const fetchLinkAnalytics = async () => {
    setIsLoading(true);
    try {
      const res = await linksApi.getAnalytics(linkId, parseInt(timeRange));
      setData(res);
      if (res.link) {
        setEditTitle(res.link.title || '');
        setEditUrl(res.link.originalUrl || '');
      }
    } catch (error: any) {
      toast({
        title: 'Error loading analytics',
        description: error.message || 'Failed to retrieve per-link metrics',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const link = data?.link;
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8787';
  const fullShortUrl = link ? `${baseUrl}/${link.shortCode}` : '';
  const displayShortUrl = link ? `classic.et/${link.shortCode}` : '';
  const domain = link ? extractDomain(link.originalUrl) : '';
  const faviconUrl = domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=64` : null;

  const handleCopy = async () => {
    if (!fullShortUrl) return;
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
        variant: 'destructive',
      });
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
      await linksApi.update(linkId, {
        title: editTitle.trim() || undefined,
        originalUrl: editUrl.trim(),
        isActive: editActive,
        expiresAt: editExpiresAt ? new Date(editExpiresAt).toISOString() : null,
      });

      if (data && data.link) {
        setData({
          ...data,
          link: {
            ...data.link,
            title: editTitle.trim() || null,
            originalUrl: editUrl.trim(),
          },
        });
      }

      setShowEdit(false);
      toast({
        title: 'Link updated',
        description: 'Changes saved successfully.',
      });
    } catch (err: any) {
      toast({
        title: 'Failed to update link',
        description: err.message || 'Could not update link details',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const qrImageUrl = link
    ? `https://api.qrserver.com/v1/create-qr-code/?size=260x260&format=svg&data=${encodeURIComponent(fullShortUrl)}`
    : '';

  const summary = data?.summary || {
    totalClicks: link?.clickCount || 0,
    uniqueVisitors: 0,
    topCountry: 'None',
    topReferrer: 'Direct',
  };

  const timeseries = data?.timeseries || [];
  const breakdown = data?.breakdown || {
    referrers: [],
    countries: [],
    devices: [],
    browsers: [],
  };

  const formattedCreatedDate = link
    ? new Date(link.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Back navigation */}
      <div>
        <Link
          href="/dashboard/links"
          className="group inline-flex items-center gap-1.5 text-xs font-mono text-[#8c8d91] hover:text-[#ededed] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>Back to links feed</span>
        </Link>
      </div>

      {/* Link Metadata Bar */}
      <div className="rounded-md border border-[#27282b] bg-[#141517] p-4 sm:p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Left: Favicon + Slug + Truncated Target */}
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded border border-[#27282b] bg-[#1c1d20] overflow-hidden">
              {faviconUrl ? (
                <img
                  src={faviconUrl}
                  alt={domain || 'favicon'}
                  className="h-4 w-4 object-contain"
                />
              ) : (
                <Globe className="h-4 w-4 text-[#8c8d91]" />
              )}
            </div>

            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-base font-semibold text-[#ededed]">
                  {displayShortUrl}
                </span>

                <a
                  href={fullShortUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Visit link"
                  className="text-[#8c8d91] hover:text-[#ededed] transition-colors p-0.5"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>

                <Badge variant="outline" className="text-[10px] font-mono px-1.5 py-0 border-[#27282b] text-[#5fc992] bg-[#5fc992]/10">
                  Active
                </Badge>
              </div>

              {/* Destination URL */}
              <p
                className="truncate text-xs text-[#8c8d91] hover:text-[#ededed] transition-colors font-sans"
                title={link?.originalUrl}
              >
                {link?.title ? (
                  <span className="text-[#ededed] font-medium mr-1.5">{link.title} —</span>
                ) : null}
                {link?.originalUrl}
              </p>

              <div className="flex items-center gap-2 text-[11px] font-mono text-[#8c8d91] pt-0.5">
                <span>Created {formattedCreatedDate}</span>
                {domain && (
                  <>
                    <span>•</span>
                    <span className="truncate max-w-[200px]">{domain}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 flex-shrink-0 pt-2 border-t border-[#27282b]/60 md:border-t-0 md:pt-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="min-h-[44px] px-3.5 border-[#27282b] bg-[#1c1d20] hover:bg-[#25262a] text-[#ededed] text-xs font-mono flex items-center gap-1.5"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-[#5fc992]" />
                  <span className="text-[#5fc992]">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-[#8c8d91]" />
                  <span>Copy</span>
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowQR(true)}
              className="min-h-[44px] min-w-[44px] p-0 border-[#27282b] bg-[#1c1d20] hover:bg-[#25262a] text-[#8c8d91] hover:text-[#ededed] text-xs"
              title="Show QR Code"
            >
              <QrCode className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEdit(true)}
              className="min-h-[44px] px-3 border-[#27282b] bg-[#1c1d20] hover:bg-[#25262a] text-[#8c8d91] hover:text-[#ededed] text-xs font-mono flex items-center gap-1.5"
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>Edit</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Top Bar: Analytics Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[#ededed] font-sans">
            Telemetry & Visitor Breakdown
          </h2>
          <p className="text-xs text-[#8c8d91] font-mono mt-0.5">
            Real-time click events filtered for this shortcode
          </p>
        </div>

        <TimeRangeSelector
          value={timeRange}
          onChange={setTimeRange}
          disabled={isLoading}
        />
      </div>

      {/* 4 Stat Cards */}
      <AnalyticsStatCards summary={summary} isLoading={isLoading} />

      {/* Timeseries AreaChart */}
      <AnalyticsChart
        data={timeseries}
        isLoading={isLoading}
        strokeColor="#56c2ff"
        fillGradientId="perLinkClicksGradient"
      />

      {/* Breakdown Grid: Referrers, Countries, Devices/Browsers */}
      <AnalyticsBreakdownGrid breakdown={breakdown} isLoading={isLoading} />

      {/* QR Code Modal */}
      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent className="border border-[#27282b] bg-[#141517] text-[#ededed] max-w-sm p-6 overscroll-contain">
          <DialogHeader className="text-center sm:text-center">
            <DialogTitle className="text-base font-semibold text-[#ededed]">QR Code</DialogTitle>
            <DialogDescription className="font-mono text-xs text-[#8c8d91] truncate">
              {displayShortUrl}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center justify-center py-2">
            <div className="p-3 bg-white rounded-md border border-[#27282b]">
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
              download={`${link?.shortCode || 'link'}-qr.svg`}
              target="_blank"
              rel="noreferrer"
              className="w-full"
            >
              <Button
                variant="outline"
                className="w-full min-h-[44px] border-[#27282b] bg-[#1c1d20] hover:bg-[#25262a] text-[#ededed] text-xs font-mono"
              >
                <Download className="mr-2 h-4 w-4 text-[#8c8d91]" />
                Download SVG
              </Button>
            </a>
            <Button
              variant="outline"
              onClick={handleCopy}
              className="w-full min-h-[44px] border-[#27282b] bg-[#1c1d20] hover:bg-[#25262a] text-[#ededed] text-xs"
            >
              <Copy className="mr-2 h-4 w-4 text-[#8c8d91]" />
              Copy Link
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Link Modal */}
      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent className="border border-[#27282b] bg-[#141517] text-[#ededed] max-w-md p-6 overscroll-contain">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-[#ededed]">Edit Link Details</DialogTitle>
            <DialogDescription className="font-mono text-xs text-[#8c8d91]">
              {displayShortUrl}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveEdit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="edit-dest-url" className="text-xs font-medium text-[#8c8d91]">
                Destination URL
              </Label>
              <Input
                id="edit-dest-url"
                type="url"
                required
                value={editUrl}
                onChange={(e) => setEditUrl(e.target.value)}
                className="min-h-[44px] bg-[#1c1d20] border-[#27282b] text-base sm:text-sm text-[#ededed]"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-dest-title" className="text-xs font-medium text-[#8c8d91]">
                Title (Optional)
              </Label>
              <Input
                id="edit-dest-title"
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="min-h-[44px] bg-[#1c1d20] border-[#27282b] text-base sm:text-sm text-[#ededed]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEdit(false)}
                className="min-h-[44px] border-[#27282b] bg-[#141517] hover:bg-[#1c1d20] text-[#ededed] text-xs px-4"
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
    </div>
  );
}
