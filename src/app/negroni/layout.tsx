import LuxuryNavigation from '@/components/LuxuryNavigation';
import { Montserrat, Playfair_Display } from 'next/font/google';

const montserrat = Montserrat({ 
  subsets: ['latin'],
  variable: '--font-montserrat',
  weight: ['300', '400', '500']
});

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-playfair',
});

export default function LuxuryJimmyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${montserrat.variable} ${playfair.variable} font-sans`}>
      <LuxuryNavigation variant="minimal" />
      {children}
    </div>
  );
}