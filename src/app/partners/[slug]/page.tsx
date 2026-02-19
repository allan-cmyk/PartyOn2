import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { getAffiliateByCode } from '@/lib/affiliates/affiliate-service';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const affiliate = await getAffiliateByCode(slug.toUpperCase());

  if (!affiliate || affiliate.status !== 'ACTIVE') {
    return { title: 'Partner Not Found' };
  }

  return {
    title: `${affiliate.businessName} x Party On Delivery | Free Delivery`,
    description: `Order through ${affiliate.businessName} and get free delivery on your alcohol order from Party On Delivery in Austin, TX.`,
  };
}

export default async function DynamicPartnerPage({ params }: Props) {
  const { slug } = await params;
  const affiliate = await getAffiliateByCode(slug.toUpperCase());

  if (!affiliate || affiliate.status !== 'ACTIVE') {
    notFound();
  }

  const referralLink = `/order?ref=${affiliate.code}`;

  return (
    <>
      <Navigation />
      <main className="min-h-screen">
        {/* Hero */}
        <section className="relative bg-gray-900 text-white py-24 md:py-32">
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-gray-900" />
          <div className="relative max-w-4xl mx-auto px-6 text-center">
            <p className="text-brand-yellow text-sm tracking-[0.2em] uppercase mb-4">
              Partner Exclusive
            </p>
            <h1 className="font-cormorant text-4xl md:text-6xl tracking-[0.06em] mb-6">
              {affiliate.businessName}
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-4">
              x Party On Delivery
            </p>
            <p className="text-lg text-brand-yellow font-medium">
              Free delivery on your order
            </p>
          </div>
        </section>

        {/* Value Prop */}
        <section className="py-16 md:py-20 bg-white">
          <div className="max-w-5xl mx-auto px-6">
            <h2 className="font-cormorant text-3xl md:text-4xl text-center mb-12">
              How It Works
            </h2>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="w-14 h-14 rounded-full bg-brand-yellow/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-brand-yellow text-2xl font-bold">1</span>
                </div>
                <h3 className="font-medium text-lg mb-2">Browse Our Selection</h3>
                <p className="text-gray-600 text-sm">
                  Beer, wine, spirits, mixers, and party supplies -- everything you need delivered to your door.
                </p>
              </div>
              <div>
                <div className="w-14 h-14 rounded-full bg-brand-yellow/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-brand-yellow text-2xl font-bold">2</span>
                </div>
                <h3 className="font-medium text-lg mb-2">Pick Your Delivery Window</h3>
                <p className="text-gray-600 text-sm">
                  Choose the date and time that works for you. Same-day and next-day delivery available across Austin.
                </p>
              </div>
              <div>
                <div className="w-14 h-14 rounded-full bg-brand-yellow/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-brand-yellow text-2xl font-bold">3</span>
                </div>
                <h3 className="font-medium text-lg mb-2">Free Delivery</h3>
                <p className="text-gray-600 text-sm">
                  As a {affiliate.businessName} customer, your delivery fee is on us. No minimum order required.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-20 bg-gray-50">
          <div className="max-w-2xl mx-auto px-6 text-center">
            <h2 className="font-cormorant text-3xl md:text-4xl mb-4">
              Ready to Order?
            </h2>
            <p className="text-gray-600 mb-8">
              Your free delivery will be applied automatically at checkout.
            </p>
            <Link
              href={referralLink}
              className="inline-block bg-brand-yellow text-gray-900 px-10 py-4 text-lg font-medium tracking-[0.06em] hover:bg-yellow-600 transition-colors"
            >
              START SHOPPING
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
