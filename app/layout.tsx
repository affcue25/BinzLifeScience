import type { Metadata } from 'next';
import { DM_Sans, Fraunces, Manrope } from 'next/font/google';
import { Suspense } from 'react';
import RouteProgress from '@/components/RouteProgress';
import { getSite } from '@/lib/content';
import './globals.css';

export const dynamic = 'force-dynamic';

const manrope = Manrope({ subsets: ['latin'], variable: '--font-manrope', display: 'swap' });
const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-fraunces', display: 'swap' });
const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dmsans', display: 'swap' });

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  return {
    title: {
      default: site.tagline ? `${site.name} | ${site.tagline}` : site.name,
      template: `%s | ${site.name}`,
    },
    description: site.tagline || site.name,
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const site = await getSite();
  return (
    <html
      lang="en"
      data-theme={site.theme}
      className={`${manrope.variable} ${fraunces.variable} ${dmSans.variable}`}
    >
      <body>
        <Suspense fallback={null}>
          <RouteProgress />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
