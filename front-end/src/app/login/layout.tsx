import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Log in',
  description: 'Sign in to your classic.et dashboard to manage links and inspect clickstream telemetry.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
