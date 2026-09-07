import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/auth-context';
import { ThemeProvider } from '@/contexts/theme-context';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://classic.et'),
  title: {
    default: 'classic.et — Developer-Grade URL Shortener & Click Telemetry',
    template: '%s | classic.et',
  },
  description: 'Fast, reliable URL shortening with real-time clickstream telemetry, custom branded slugs, QR code generation, and developer API access.',
  keywords: [
    'url shortener',
    'link shortener',
    'click telemetry',
    'link analytics',
    'custom domains',
    'branded short links',
    'classic.et',
    'qr code generator',
    'developer api',
    'ethiopia url shortener',
  ],
  authors: [{ name: 'classic.et', url: 'https://classic.et' }],
  creator: 'classic.et',
  publisher: 'classic.et',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://classic.et',
    siteName: 'classic.et',
    title: 'classic.et — Developer-Grade URL Shortener & Click Telemetry',
    description: 'Fast, reliable URL shortening with real-time clickstream telemetry, custom branded slugs, QR code generation, and developer API access.',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'classic.et — Developer-Grade URL Shortener & Click Telemetry',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'classic.et — Developer-Grade URL Shortener & Click Telemetry',
    description: 'Fast, reliable URL shortening with real-time clickstream telemetry, custom branded slugs, QR code generation, and developer API access.',
    creator: '@classic_et',
    images: ['/opengraph-image'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-icon', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.webmanifest',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0c0d0e' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='light'){document.documentElement.classList.remove('dark');document.documentElement.classList.add('light')}else{document.documentElement.classList.remove('light');document.documentElement.classList.add('dark')}}catch(e){document.documentElement.classList.add('dark')}})()`,
          }}
        />
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased bg-canvas text-text-primary min-h-[100dvh]`}>
        <ThemeProvider>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
