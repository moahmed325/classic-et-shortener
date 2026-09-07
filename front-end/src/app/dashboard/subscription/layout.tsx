import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Subscription Plans',
  description: 'Quota-based tiers and pricing plans for creators, developers, and growing teams.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function SubscriptionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
