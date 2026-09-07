'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Link2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { globalAnalyticsApi, GlobalAnalyticsResponse } from '@/lib/api';
import { TimeRangeSelector, TimeRangeValue } from '@/components/analytics/time-range-selector';
import { AnalyticsStatCards } from '@/components/analytics/analytics-stat-cards';
import { AnalyticsChart } from '@/components/analytics/analytics-chart';
import { AnalyticsBreakdownGrid } from '@/components/analytics/analytics-breakdown-grid';

export default function AnalyticsPage() {
  const router = useRouter();
  const [data, setData] = useState<GlobalAnalyticsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRangeValue>('30');
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    const token = typeof window !== 'undefined'
      ? localStorage.getItem('token') || localStorage.getItem('auth_token') || localStorage.getItem('accessToken')
      : null;
    const endpoint = `/api/analytics/global?days=${timeRange}`;
    console.log("Fetching analytics from:", endpoint, "with token:", !!token);

    try {
      setError(null);
      const res = await globalAnalyticsApi.getGlobalAnalytics(parseInt(timeRange));
      const safeData: GlobalAnalyticsResponse = {
        links: Array.isArray(res?.links) ? res.links : [],
        summary: res?.summary || {
          totalClicks: 0,
          uniqueVisitors: 0,
          topCountry: 'Direct / N/A',
          topReferrer: 'Direct',
        },
        timeseries: Array.isArray(res?.timeseries) ? res.timeseries : [],
        breakdown: res?.breakdown || {
          referrers: [],
          countries: [],
          devices: [],
          browsers: [],
        },
        hourly: Array.isArray(res?.hourly) ? res.hourly : [],
        clicksByDate: res?.clicksByDate || {},
        clicksByCountry: res?.clicksByCountry || {},
        clicksByDevice: res?.clicksByDevice || {},
        clicksByBrowser: res?.clicksByBrowser || {},
        clicksByReferrer: res?.clicksByReferrer || {},
        totalClicks: res?.totalClicks ?? res?.summary?.totalClicks ?? 0,
        restrictions: res?.restrictions || {
          canSeeFullAnalytics: true,
          canSeeAdvancedCharts: true,
          topCountriesHidden: 0,
          browsersHidden: false,
          devicesHidden: false,
        },
        usage: res?.usage || {
          visitorCap: { current: 0, limit: 500, percentage: 0 },
          newVisitorsSinceLastVisit: 0,
        },
      };
      setData(safeData);
    } catch (err: any) {
      console.error("Analytics fetch error:", err);
      if (err?.status === 401) {
        toast({
          title: 'Authentication required',
          description: 'Session expired or not found. Redirecting to login...',
          variant: 'destructive',
        });
        router.replace('/login');
        return;
      }

      if (err?.status >= 400) {
        setError("Failed to load analytics data");
        toast({
          title: 'Error loading analytics',
          description: err.message || 'Could not retrieve telemetry data',
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const summary = data?.summary || {
    totalClicks: 0,
    uniqueVisitors: 0,
    topCountry: 'Direct / N/A',
    topReferrer: 'Direct',
  };

  const timeseries = Array.isArray(data?.timeseries) ? data.timeseries : [];
  const breakdown = data?.breakdown || {
    referrers: [],
    countries: [],
    devices: [],
    browsers: [],
  };

  const topLinks = (data?.links || [])
    .slice()
    .sort((a, b) => (b.clicksInPeriod ?? b.clickCount) - (a.clicksInPeriod ?? a.clickCount))
    .slice(0, 5);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Top Bar: Title & Time-Range Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-text-primary font-sans">
            Analytics Overview
          </h1>
          <p className="text-xs sm:text-sm text-text-muted font-sans mt-0.5">
            Aggregated visitor telemetry, conversion velocity, and referrer attribution.
          </p>
        </div>

        <TimeRangeSelector
          value={timeRange}
          onChange={setTimeRange}
          disabled={isLoading}
        />
      </div>

      {error && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 p-4 text-xs font-mono text-red-500 flex items-center justify-between">
          <span>{error}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAnalytics}
            className="h-7 px-2.5 border-red-500/30 text-red-500 hover:bg-red-500/20 text-xs"
          >
            Retry
          </Button>
        </div>
      )}

      {/* 4 Stat Cards */}
      <AnalyticsStatCards summary={summary} isLoading={isLoading} />

      {/* Timeseries Chart */}
      <AnalyticsChart
        data={timeseries}
        isLoading={isLoading}
        strokeColor="#ff6363"
        fillGradientId="globalClicksGradient"
      />

      {/* Breakdown Grid: Referrers, Countries, Devices */}
      <AnalyticsBreakdownGrid breakdown={breakdown} isLoading={isLoading} />

      {/* Top Performing Links Table/Card */}
      <div className="rounded-md border border-border-subtle bg-surface-1 p-4 sm:p-5">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-border-subtle">
          <div>
            <h3 className="text-sm font-semibold text-text-primary font-sans">
              Top Performing Links
            </h3>
            <p className="text-xs text-text-muted font-mono mt-0.5">
              Ranked by click volume in selected period
            </p>
          </div>

          <Link
            href="/dashboard/links"
            className="group inline-flex items-center gap-1 text-xs font-mono text-text-muted hover:text-text-primary transition-colors"
          >
            <span>All links</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {topLinks.length === 0 ? (
          <div className="py-8 text-center text-xs text-text-muted font-mono">
            No short link clicks recorded in this period
          </div>
        ) : (
          <div className="space-y-2">
            {topLinks.map((link, idx) => (
              <div
                key={link.id}
                className="flex items-center justify-between p-2.5 rounded border border-border-subtle bg-surface-2/60 hover:bg-surface-2 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0 pr-3">
                  <span className="font-mono text-xs font-semibold text-text-muted w-4 text-center">
                    {idx + 1}
                  </span>
                  <div className="min-w-0">
                    <Link
                      href={`/dashboard/links/${link.id}`}
                      className="font-mono text-xs font-medium text-text-primary hover:text-[#ff6363] transition-colors truncate block"
                    >
                      classic.et/{link.shortCode}
                    </Link>
                    {link.title && (
                      <p className="text-[11px] text-text-muted truncate font-sans">
                        {link.title}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right font-mono">
                    <span className="text-xs font-semibold text-text-primary tabular-nums">
                      {(link.clicksInPeriod ?? link.clickCount).toLocaleString()}
                    </span>
                    <span className="text-[10px] text-text-muted ml-1">clicks</span>
                  </div>

                  <Link href={`/dashboard/links/${link.id}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-2.5 border-border-subtle bg-surface-1 hover:bg-surface-2 text-text-muted hover:text-text-primary text-xs font-mono"
                    >
                      Details
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
