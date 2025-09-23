import type { Metadata } from 'next';
import './globals.css';
import Providers from '@/components/Providers';

export const metadata: Metadata = {
  title: 'Spotify Web Player',
  description: 'Next.js + NextAuth + Spotify SDK'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="wrap">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
