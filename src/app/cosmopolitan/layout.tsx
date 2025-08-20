import LuxuryNavigation from '@/components/LuxuryNavigation';
import { Oswald, Inter } from 'next/font/google';

const oswald = Oswald({ 
  subsets: ['latin'],
  variable: '--font-oswald',
  weight: ['300', '400', '500', '600', '700']
});

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['300', '400', '500', '600', '700']
});

export default function LuxuryPrabalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${oswald.variable} ${inter.variable} font-sans`}>
      <LuxuryNavigation variant="hidden" />
      {children}
    </div>
  );
}