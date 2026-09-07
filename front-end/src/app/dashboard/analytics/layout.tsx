import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Clickstream Analytics',
  description: 'Real-time telemetry, geographic breakdown, referrer origins, and device statistics.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
