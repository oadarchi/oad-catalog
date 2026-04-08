import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'OAD Rasējumu Katalogs',
  description: 'Interjera un arhitektūras rasējumu bibliotēka',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1a1a1a',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="lv">
      <body>{children}</body>
    </html>
  );
}
