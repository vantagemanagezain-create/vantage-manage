import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Moradabad Business Directory | Vantage Manage',
    template: '%s | Vantage Manage',
  },
  description:
    'Find local vendors, shops and businesses in Moradabad, Uttar Pradesh. Connect directly via call or WhatsApp.',
  keywords: [
    'Moradabad',
    'business directory',
    'local vendors',
    'Moradabad shops',
    'Uttar Pradesh business',
    'vendor listing',
  ],
  authors: [{ name: 'Vantage Manage' }],
  openGraph: {
    title: 'Moradabad Business Directory',
    description:
      'Find local vendors and businesses in Moradabad. Connect directly via call or WhatsApp.',
    type: 'website',
    locale: 'en_IN',
    siteName: 'Vantage Manage',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Moradabad Business Directory',
    description: 'Find local vendors and businesses in Moradabad.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
