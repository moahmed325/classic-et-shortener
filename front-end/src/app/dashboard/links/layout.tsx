import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Links',
  description: 'Manage and configure your short URLs, custom slugs, and QR codes.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function LinksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
