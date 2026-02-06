import Navigation from "@/components/Navigation";
import { Montserrat, Lato } from 'next/font/google';

const montserrat = Montserrat({ 
  subsets: ['latin'],
  variable: '--font-montserrat',
  weight: ['300', '400', '500', '600', '700']
});

const lato = Lato({ 
  subsets: ['latin'],
  variable: '--font-lato',
  weight: ['300', '400', '700']
});

export default function ProfessionalV2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${montserrat.variable} ${lato.variable}`}>
      <Navigation />
      <div className="font-lato">
        {children}
      </div>
    </div>
  );
}