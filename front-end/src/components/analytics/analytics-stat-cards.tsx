'use client';

import { MousePointerClick, Users, Compass, Globe } from 'lucide-react';
import { AnalyticsSummary } from '@/lib/api';

interface AnalyticsStatCardsProps {
  summary: AnalyticsSummary;
  isLoading?: boolean;
}

export function AnalyticsStatCards({ summary, isLoading }: AnalyticsStatCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="rounded-md border border-[#27282b] bg-[#141517] p-3 sm:p-4 animate-pulse space-y-2"
          >
            <div className="h-3 w-16 bg-[#1c1d20] rounded" />
            <div className="h-6 w-24 bg-[#1c1d20] rounded" />
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: 'Total Clicks',
      value: (summary?.totalClicks ?? 0).toLocaleString(),
      subtext: 'Clicks in selected period',
      icon: MousePointerClick,
      color: 'text-[#ff6363]',
    },
    {
      label: 'Unique Visitors',
      value: (summary?.uniqueVisitors ?? 0).toLocaleString(),
      subtext: 'Distinct IP clients',
      icon: Users,
      color: 'text-[#5fc992]',
    },
    {
      label: 'Top Referrer',
      value: summary?.topReferrer || 'Direct',
      subtext: 'Primary traffic origin',
      icon: Compass,
      color: 'text-[#56c2ff]',
      isString: true,
    },
    {
      label: 'Top Country',
      value: summary?.topCountry || 'Direct / N/A',
      subtext: 'Dominant geolocation',
      icon: Globe,
      color: 'text-[#f59e0b]',
      isString: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="rounded-md border border-[#27282b] bg-[#141517] p-3 sm:p-4 hover:border-[#383a3f] transition-colors"
          >
            <div className="flex items-center justify-between text-[#8c8d91] mb-1.5">
              <span className="text-xs font-mono tracking-tight">{card.label}</span>
              <Icon className="h-3.5 w-3.5 text-[#8c8d91]" />
            </div>

            <div className="flex items-baseline">
              <span
                className={`font-mono font-semibold tracking-tight text-[#ededed] truncate ${
                  card.isString ? 'text-sm sm:text-base' : 'text-lg sm:text-2xl tabular-nums'
                }`}
                title={card.isString ? card.value : undefined}
              >
                {card.value}
              </span>
            </div>

            <p className="text-[11px] text-[#8c8d91] font-sans mt-1 truncate">
              {card.subtext}
            </p>
          </div>
        );
      })}
    </div>
  );
}
