import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { Providers } from './providers';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

const _geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' });
const _geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' });

export const metadata: Metadata = {
  title: {
    default: 'CLVPredict — Customer Lifetime Value Intelligence Platform',
    template: '%s | CLVPredict',
  },
  description:
    'Enterprise-grade Customer Lifetime Value prediction powered by XGBoost ML. Upload your data, train a custom model, and generate real-time CLV predictions.',
  keywords: [
    'customer lifetime value',
    'CLV prediction',
    'machine learning',
    'XGBoost',
    'customer analytics',
    'SaaS analytics',
    'revenue prediction',
  ],
  authors: [{ name: 'CLVPredict' }],
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://clvpredict.com',
    siteName: 'CLVPredict',
    title: 'CLVPredict — Customer Lifetime Value Intelligence Platform',
    description:
      'Enterprise-grade CLV prediction powered by XGBoost ML. Train custom models on your own data.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'CLVPredict Dashboard',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CLVPredict — Customer Lifetime Value Intelligence',
    description: 'Enterprise-grade CLV prediction powered by XGBoost ML.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <Providers>
          {children}
        </Providers>
        <Toaster richColors closeButton position="top-right" />
        <Analytics />
      </body>
    </html>
  );
}
