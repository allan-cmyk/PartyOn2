import LuxuryNavigation from '@/components/LuxuryNavigation';
import { Crimson_Text, Inter } from 'next/font/google';

const crimson = Crimson_Text({ 
  subsets: ['latin'],
  variable: '--font-crimson',
  weight: ['400', '600', '700']
});

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['300', '400', '500']
});

export default function LuxuryGoyardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${crimson.variable} ${inter.variable} font-serif`}>
      <LuxuryNavigation variant="centered" />
      {children}
    </div>
  );
}