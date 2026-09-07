'use client';

import { useMemo, useEffect, useState } from 'react';
import { useTheme } from '@/contexts/theme-context';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { TimeseriesPoint } from '@/lib/api';

interface AnalyticsChartProps {
  data: TimeseriesPoint[];
  isLoading?: boolean;
  strokeColor?: string;
  fillGradientId?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;

  const clicks = payload[0]?.value ?? 0;
  const formattedDate = label
    ? new Date(label).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      })
    : '';

  return (
    <div className="rounded border border-border-subtle bg-surface-1 px-3 py-2 text-xs shadow-md">
      <p className="font-mono text-text-muted text-[11px]">{formattedDate}</p>
      <div className="mt-1 flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-[#ff6363]" />
        <span className="font-mono font-semibold text-text-primary tabular-nums">
          {clicks.toLocaleString()} {clicks === 1 ? 'click' : 'clicks'}
        </span>
      </div>
    </div>
  );
}

export function AnalyticsChart({
  data,
  isLoading,
  strokeColor = '#ff6363',
  fillGradientId = 'clicksGradient',
}: AnalyticsChartProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? theme === 'dark' : true;
  const gridStroke = isDark ? '#27282b' : '#e5e7eb';
  const tickStroke = isDark ? '#8c8d91' : '#6b7280';

  // Format dates for X-Axis tick labels (e.g. "Sep 5")
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return data.map((d) => ({
      ...d,
      displayDate: new Date(d.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
    }));
  }, [data]);

  const totalPeriodClicks = useMemo(() => {
    return (data || []).reduce((acc, curr) => acc + curr.clicks, 0);
  }, [data]);

  if (isLoading) {
    return (
      <div className="rounded-md border border-border-subtle bg-surface-1 p-4 sm:p-5">
        <div className="h-4 w-32 bg-surface-2 rounded mb-4 animate-pulse" />
        <div className="h-[280px] w-full bg-surface-2/60 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="rounded-md border border-border-subtle bg-surface-1 p-4 sm:p-5 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-text-primary font-sans">
            Clicks Over Time
          </h3>
          <p className="text-xs text-text-muted font-mono mt-0.5">
            {totalPeriodClicks.toLocaleString()} total clicks in this window
          </p>
        </div>
      </div>

      <div className="h-[280px] w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id={fillGradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={strokeColor} stopOpacity={0.2} />
                <stop offset="95%" stopColor={strokeColor} stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              stroke={gridStroke}
              strokeDasharray="3 3"
              vertical={false}
            />

            <XAxis
              dataKey="displayDate"
              stroke={tickStroke}
              fontSize={11}
              fontFamily="var(--font-mono)"
              tickLine={false}
              axisLine={{ stroke: gridStroke }}
              minTickGap={25}
            />

            <YAxis
              stroke={tickStroke}
              fontSize={11}
              fontFamily="var(--font-mono)"
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />

            <Tooltip content={<CustomTooltip />} />

            <Area
              type="monotone"
              dataKey="clicks"
              stroke={strokeColor}
              strokeWidth={2}
              fillOpacity={1}
              fill={`url(#${fillGradientId})`}
              isAnimationActive={true}
              animationDuration={600}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
