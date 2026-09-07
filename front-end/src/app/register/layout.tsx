import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create an Account',
  description: 'Sign up for classic.et to start shortening URLs with high redirect velocity and real-time analytics.',
  robots: {
    index: true,
    follow: true,
  },
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
