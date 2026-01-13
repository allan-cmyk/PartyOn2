import type { Metadata } from 'next';
import { premierPartyCruises } from '@/lib/partners/landing-pages';
import PartnerHero from '@/components/partners/PartnerHero';
import OrderTypeSelector from '@/components/partners/OrderTypeSelector';
import PartnerFAQ from '@/components/partners/PartnerFAQ';
import DrinkCalculator from '@/components/partners/DrinkCalculator';

/**
 * Premier Party Cruises partner landing page
 * Features YouTube video hero, group order creation, FAQ, and drink calculator
 */

export const metadata: Metadata = {
  title: `${premierPartyCruises.name} | PartyOn Delivery`,
  description: premierPartyCruises.description,
  openGraph: {
    title: `${premierPartyCruises.name} - Alcohol Delivery`,
    description: premierPartyCruises.description,
    images: [premierPartyCruises.heroImageUrl || '/images/og-default.jpg'],
  },
};

export default function PremierPartyCruisesPage() {
  return (
    <main>
      {/* Hero Section with YouTube Video Background */}
      <PartnerHero partner={premierPartyCruises} />

      {/* Order Type Selection Section */}
      <OrderTypeSelector
        orderTypes={premierPartyCruises.orderTypes}
        partnerId={premierPartyCruises.slug}
      />

      {/* FAQ Section */}
      <PartnerFAQ faqs={premierPartyCruises.faqs} />

      {/* Drink Calculator Section */}
      <DrinkCalculator />
    </main>
  );
}
