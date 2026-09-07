'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Link2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { globalAnalyticsApi, GlobalAnalyticsResponse } from '@/lib/api';
import { TimeRangeSelector, TimeRangeValue } from '@/components/analytics/time-range-selector';
import { AnalyticsStatCards } from '@/components/analytics/analytics-stat-cards';
import { AnalyticsChart } from '@/components/analytics/analytics-chart';
import { AnalyticsBreakdownGrid } from '@/components/analytics/analytics-breakdown-grid';

export default function AnalyticsPage() {
  const [data, setData] = useState<GlobalAnalyticsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRangeValue>('30');
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const res = await globalAnalyticsApi.getGlobalAnalytics(parseInt(timeRange));
      setData(res);
    } catch (error: any) {
      toast({
        title: 'Error loading analytics',
        description: error.message || 'Could not retrieve telemetry data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const summary = data?.summary || {
    totalClicks: 0,
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

  const topLinks = (data?.links || [])
    .slice()
    .sort((a, b) => (b.clicksInPeriod ?? b.clickCount) - (a.clicksInPeriod ?? a.clickCount))
    .slice(0, 5);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Top Bar: Title & Time-Range Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#ededed] font-sans">
            Analytics Overview
          </h1>
          <p className="text-xs sm:text-sm text-[#8c8d91] font-sans mt-0.5">
            Aggregated visitor telemetry, conversion velocity, and referrer attribution.
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
      <div className="rounded-md border border-[#27282b] bg-[#141517] p-4 sm:p-5">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#27282b]">
          <div>
            <h3 className="text-sm font-semibold text-[#ededed] font-sans">
              Top Performing Links
            </h3>
            <p className="text-xs text-[#8c8d91] font-mono mt-0.5">
              Ranked by click volume in selected period
            </p>
          </div>

          <Link
            href="/dashboard/links"
            className="group inline-flex items-center gap-1 text-xs font-mono text-[#8c8d91] hover:text-[#ededed] transition-colors"
          >
            <span>All links</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {topLinks.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#8c8d91] font-mono">
            No short link clicks recorded in this period
          </div>
        ) : (
          <div className="space-y-2">
            {topLinks.map((link, idx) => (
              <div
                key={link.id}
                className="flex items-center justify-between p-2.5 rounded border border-[#27282b] bg-[#1c1d20]/50 hover:bg-[#1c1d20] transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0 pr-3">
                  <span className="font-mono text-xs font-semibold text-[#8c8d91] w-4 text-center">
                    {idx + 1}
                  </span>
                  <div className="min-w-0">
                    <Link
                      href={`/dashboard/links/${link.id}`}
                      className="font-mono text-xs font-medium text-[#ededed] hover:text-[#ff6363] transition-colors truncate block"
                    >
                      classic.et/{link.shortCode}
                    </Link>
                    {link.title && (
                      <p className="text-[11px] text-[#8c8d91] truncate font-sans">
                        {link.title}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right font-mono">
                    <span className="text-xs font-semibold text-[#ededed] tabular-nums">
                      {(link.clicksInPeriod ?? link.clickCount).toLocaleString()}
                    </span>
                    <span className="text-[10px] text-[#8c8d91] ml-1">clicks</span>
                  </div>

                  <Link href={`/dashboard/links/${link.id}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-2.5 border-[#27282b] bg-[#141517] hover:bg-[#25262a] text-[#8c8d91] hover:text-[#ededed] text-xs font-mono"
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
