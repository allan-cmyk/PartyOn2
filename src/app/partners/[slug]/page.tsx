import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { getAffiliateByCode } from '@/lib/affiliates/affiliate-service';
import partnersData from '@/data/austin-partners.json';

interface Props {
  params: Promise<{ slug: string }>;
}

function findPartnerLogo(businessName: string): string | null {
  const lower = businessName.toLowerCase();
  const match = partnersData.partners.find(
    (p) => p.name.toLowerCase() === lower
  );
  return match?.logo ?? null;
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
  const partnerLogo = findPartnerLogo(affiliate.businessName);

  return (
    <>
      <Navigation />
      <main className="min-h-screen">
        {/* Hero */}
        <section className="relative h-[70vh] min-h-[500px] flex items-center justify-center overflow-hidden">
          <Image
            src="/images/hero/mobile-bartender-outdoor-event.webp"
            alt={`${affiliate.businessName} x Party On Delivery`}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/80 via-gray-900/60 to-gray-900/80" />

          <div className="hero-fade-in relative text-center text-white z-10 max-w-4xl mx-auto px-6">
            {partnerLogo && (
              <div className="mb-8">
                <Image
                  src={partnerLogo}
                  alt={`${affiliate.businessName} logo`}
                  width={160}
                  height={80}
                  className="mx-auto object-contain brightness-0 invert"
                />
              </div>
            )}

            <h1 className="font-heading font-bold text-4xl md:text-6xl tracking-[0.08em] mb-4">
              FREE DELIVERY FOR ALL
            </h1>
            <p className="text-xl md:text-2xl font-heading font-light tracking-[0.08em] text-gray-200 mb-2">
              {affiliate.businessName} Customers
            </p>
            <p className="text-lg text-gray-300 mb-8">
              Provided by Party On Delivery
            </p>

            <div className="w-20 h-px bg-brand-yellow mx-auto mb-8" />

            <Link
              href={referralLink}
              className="btn-cart text-lg px-10 py-4"
            >
              START SHOPPING
            </Link>
          </div>
        </section>

        {/* How It Works */}
        <section className="section-padding bg-white">
          <div className="container-custom max-w-3xl">
            <h2 className="font-heading font-bold text-2xl md:text-3xl text-center tracking-[0.08em] mb-8">
              HOW IT WORKS
            </h2>
            <div className="grid grid-cols-3 gap-4 md:gap-6">
              <div className="text-center">
                <div className="w-10 h-10 rounded-lg bg-brand-blue/10 flex items-center justify-center mx-auto mb-3">
                  <span className="text-brand-blue text-lg font-bold font-heading">1</span>
                </div>
                <h3 className="font-heading font-semibold text-sm md:text-base mb-1">Browse</h3>
                <p className="text-gray-500 text-xs md:text-sm leading-snug">
                  Beer, wine, spirits, mixers, and party supplies.
                </p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 rounded-lg bg-brand-blue/10 flex items-center justify-center mx-auto mb-3">
                  <span className="text-brand-blue text-lg font-bold font-heading">2</span>
                </div>
                <h3 className="font-heading font-semibold text-sm md:text-base mb-1">Schedule</h3>
                <p className="text-gray-500 text-xs md:text-sm leading-snug">
                  Pick a date and time. Same-day available across Austin.
                </p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 rounded-lg bg-brand-blue/10 flex items-center justify-center mx-auto mb-3">
                  <span className="text-brand-blue text-lg font-bold font-heading">3</span>
                </div>
                <h3 className="font-heading font-semibold text-sm md:text-base mb-1">Enjoy</h3>
                <p className="text-gray-500 text-xs md:text-sm leading-snug">
                  Free delivery to your door. No minimum order.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section-padding bg-gray-50">
          <div className="max-w-xl mx-auto px-6 text-center">
            <h2 className="font-heading font-bold text-2xl md:text-3xl tracking-[0.08em] mb-3">
              READY TO ORDER?
            </h2>
            <p className="text-gray-600 text-sm mb-6">
              Free delivery is applied automatically at checkout.
            </p>
            <Link
              href={referralLink}
              className="btn-cart text-lg px-10 py-4"
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
