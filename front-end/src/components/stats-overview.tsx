'use client';

import { useEffect, useState } from 'react';
import { Link2, MousePointerClick, Activity, ShieldCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/auth-context';
import { linksApi } from '@/lib/api';

interface Stats {
  totalLinks: number;
  totalClicks: number;
  activity30d: number;
}

interface StatsOverviewProps {
  refreshTrigger?: number;
}

export function StatsOverview({ refreshTrigger = 0 }: StatsOverviewProps) {
  const [stats, setStats] = useState<Stats>({
    totalLinks: 0,
    totalClicks: 0,
    activity30d: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchStats();
  }, [refreshTrigger]);

  const fetchStats = async () => {
    try {
      const { links } = await linksApi.getAll({ limit: 1000 });
      const totalClicks = links.reduce((sum, link) => sum + link.clickCount, 0);

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Links created or active in the past 30 days
      const linksLast30d = links.filter(
        (l) => new Date(l.createdAt) >= thirtyDaysAgo
      ).length;

      setStats({
        totalLinks: links.length,
        totalClicks,
        activity30d: linksLast30d,
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const currentTier = user?.tier || 'free';
  const tierDisplay = currentTier.toUpperCase();

  const getTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'premium':
        return 'text-[#ff6363] border-[#ff6363]/30 bg-[#ff6363]/10';
      case 'pro':
        return 'text-[#56c2ff] border-[#56c2ff]/30 bg-[#56c2ff]/10';
      default:
        return 'text-text-muted border-border-subtle bg-surface-2';
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="rounded-md border border-border-subtle bg-surface-1 p-3 sm:p-4 animate-pulse space-y-2"
          >
            <div className="h-3 w-16 bg-surface-2 rounded" />
            <div className="h-6 w-24 bg-surface-2 rounded" />
          </div>
        ))}
      </div>
    );
  }

  const items = [
    {
      label: 'Total Links',
      value: stats.totalLinks.toLocaleString(),
      subtext: 'Shortened URLs',
      icon: Link2,
      accent: 'text-[#56c2ff]',
    },
    {
      label: 'Total Clicks',
      value: stats.totalClicks.toLocaleString(),
      subtext: 'Across all links',
      icon: MousePointerClick,
      accent: 'text-[#5fc992]',
    },
    {
      label: '30d Activity',
      value: `${stats.activity30d} new`,
      subtext: 'Past 30 days',
      icon: Activity,
      accent: 'text-[#f59e0b]',
    },
    {
      label: 'Current Tier',
      value: tierDisplay,
      subtext: currentTier === 'premium' ? 'Unlimited access' : currentTier === 'pro' ? 'Pro limits' : 'Free tier',
      icon: ShieldCheck,
      isTier: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
      {items.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div
            key={idx}
            className="rounded-md border border-border-subtle bg-surface-1 p-3 sm:p-4 transition-colors hover:border-border-strong"
          >
            <div className="flex items-center justify-between text-text-muted mb-1.5">
              <span className="text-xs font-mono tracking-tight">{item.label}</span>
              <Icon className="h-3.5 w-3.5 text-text-muted" />
            </div>

            <div className="flex items-baseline gap-2">
              {item.isTier ? (
                <span className={`text-base sm:text-lg font-mono font-semibold tracking-wide px-2 py-0.5 rounded border ${getTierColor(currentTier)}`}>
                  {item.value}
                </span>
              ) : (
                <div className="text-lg sm:text-2xl font-semibold font-mono tabular-nums text-text-primary">
                  {item.value}
                </div>
              )}
            </div>

            <p className="text-[11px] text-text-muted font-sans mt-1 truncate">
              {item.subtext}
            </p>
          </div>
        );
      })}
    </div>
  );
}
