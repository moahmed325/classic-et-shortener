'use client';

import { useState } from 'react';
import { StatsOverview } from '@/components/stats-overview';
import { RecentLinks } from '@/components/recent-links';
import { LinkShortener, ShortenedLink } from '@/components/link-shortner';
import { UsageWarning } from '@/components/usage-warning';

export default function DashboardPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleLinkCreated = (newLink: ShortenedLink) => {
    // Increment refresh key to trigger instant re-fetch in stats and recent links
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-text-primary font-sans">
          Command Center
        </h1>
        <p className="text-xs sm:text-sm text-text-muted font-sans mt-0.5">
          Generate short links, monitor real-time traffic, and analyze engagement.
        </p>
      </div>

      {/* Usage Warning (Conditional) */}
      <UsageWarning />

      {/* Command-Bar Link Shortener */}
      <section aria-labelledby="shortener-heading">
        <h2 id="shortener-heading" className="sr-only">Quick Shortener</h2>
        <LinkShortener onLinkCreated={handleLinkCreated} />
      </section>

      {/* Metrics Bar */}
      <section aria-labelledby="metrics-heading">
        <h2 id="metrics-heading" className="sr-only">Metrics Overview</h2>
        <StatsOverview refreshTrigger={refreshKey} />
      </section>

      {/* Recent Links Feed */}
      <section aria-labelledby="recent-links-heading">
        <RecentLinks 
          limit={6} 
          refreshTrigger={refreshKey} 
          onLinkCreatedClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      </section>
    </div>
  );
}
