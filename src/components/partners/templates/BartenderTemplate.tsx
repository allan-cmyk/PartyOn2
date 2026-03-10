import Image from 'next/image';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import type { CategoryTemplateProps } from './template-types';

const TESTIMONIALS = [
  {
    reviewer: 'Sarah M.',
    text: 'We had our wedding reception drinks delivered the morning of, and our bartender had everything set up before the first guest arrived. Absolute lifesaver.',
  },
  {
    reviewer: 'Rachel K.',
    text: 'Stocked the Airbnb fridge before our bartender showed up for the bachelorette. Everyone was impressed and I didn\'t have to lift a finger.',
  },
  {
    reviewer: 'James T.',
    text: 'Used the group ordering feature for our corporate happy hour. Everyone picked what they wanted, split the bill, and the bartender had a full bar to work with.',
  },
  {
    reviewer: 'Austin Event Host',
    text: 'House party with 40 people -- no hauling cases from the store, no running out of ice. Party On handled it all and our bartender just poured.',
  },
];

const FAQ_ITEMS = [
  {
    q: 'How does this work with my bartender?',
    a: 'It\'s simple -- book your bartender separately, then order your drinks through Party On Delivery. We\'ll deliver everything to your venue or rental before the party starts, so your bartender can get right to work.',
  },
  {
    q: 'Do I need to buy the alcohol separately?',
    a: 'Yes, and that\'s where we come in. Your bartender brings the skills and equipment. You provide the drinks, and we make that part effortless. Order spirits, mixers, seltzers, beer, ice, cups -- whatever you need.',
  },
  {
    q: 'What should I order?',
    a: 'A good starting point: vodka, tequila, mixers (soda, juice, simple syrup), a variety of seltzers or beer, plenty of ice, and cups. Our order dashboard makes it easy to browse by category and get recommendations.',
  },
  {
    q: 'Can you deliver to my Airbnb or venue?',
    a: 'Absolutely. We deliver to any address in Austin -- Airbnbs, VRBOs, hotels, lake houses, downtown condos, event venues, wherever your party is happening.',
  },
  {
    q: 'Can our group split the order?',
    a: 'Yes! Start a group order and share the link with your crew. Everyone adds what they want and pays for their own items. One delivery, zero Venmo math.',
  },
  {
    q: 'What if I order too much?',
    a: 'No worries -- we offer 100% money back on unopened returns (up to 25% of your total order). Order with confidence knowing you won\'t be stuck with extra bottles.',
  },
];

const VALUE_TABLE = [
  { item: 'Free delivery to your rental or venue', value: 'Up to $100' },
  { item: '100% money back on unopened returns (up to 25% of total order)', value: 'Risk-free' },
  { item: 'Group ordering with split payments', value: 'FREE' },
  { item: 'We will try to honor any custom item request, just ask!', value: 'On request' },
  { item: 'Direct coordination with your bartender on delivery timing', value: 'Included' },
  { item: 'Bulk ice delivery -- as much as you need', value: 'Included' },
  { item: 'Same-day delivery available', value: 'Peace of mind' },
];

function CheckIcon() {
  return (
    <svg className="w-5 h-5 text-brand-yellow flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

export function BartenderTemplate({ affiliate, partnerLogo, partnerHeroImage }: CategoryTemplateProps) {
  const { businessName } = affiliate;
  const heroImage = partnerHeroImage || '/images/hero/mobile-bartender-outdoor-event.webp';

  return (
    <div className="bg-white min-h-screen">
      <Navigation hidden />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <Image
          src="/images/hero/austin-skyline-night-lake.webp"
          alt={`${businessName} x Party On Delivery - Austin skyline at night`}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-900/70 to-gray-900/50" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-24 md:pt-28 pb-16 md:pb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12 items-center">
            <div className="order-1 text-center">
              {partnerLogo && (
                <div className="mb-6">
                  <Image
                    src={partnerLogo}
                    alt={`${businessName} logo`}
                    width={240}
                    height={240}
                    className="h-40 md:h-48 w-auto object-contain mx-auto rounded-lg"
                  />
                </div>
              )}

              <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl text-white mb-4 tracking-wide leading-tight">
                <span className="text-brand-yellow">Free Drink Delivery</span> for {businessName} Customers
              </h1>
              <p className="text-gray-300 text-lg md:text-xl mb-8">
                Book {businessName}. Get drinks delivered directly to the venue for free.
              </p>

              <div className="mb-8">
                <Link
                  href="/order"
                  className="inline-block h-14 md:h-16 px-10 bg-yellow-500 hover:bg-brand-yellow text-gray-900 font-semibold tracking-wide transition-colors rounded-lg text-lg md:text-xl leading-[3.5rem] md:leading-[4rem]"
                >
                  Start Your Order
                </Link>
              </div>

              <div className="flex flex-col items-center gap-2">
                <span className="text-white/40 text-xs uppercase tracking-[0.12em]">Provided by</span>
                <Image
                  src="/images/pod-logo-2025.png"
                  alt="Party On Delivery"
                  width={360}
                  height={360}
                  className="h-32 md:h-40 w-auto object-contain"
                />
              </div>
            </div>

            <div className="order-2 flex flex-col gap-5">
              <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden shadow-lg border border-white/10">
                <Image
                  src={heroImage}
                  alt={`${businessName} bartending`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>

              <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-white/60">
                <span className="flex items-center gap-1.5">
                  <CheckIcon />
                  Free Delivery
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckIcon />
                  TABC Licensed
                </span>
                <span className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} />
                  ))}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-gray-50 py-10 md:py-16">
        <div className="max-w-4xl mx-auto px-6 md:px-8">
          <div className="text-center mb-10">
            <p className="text-gray-500 tracking-[0.1em] uppercase text-sm mb-2">
              How It Works
            </p>
            <h2 className="font-heading text-2xl md:text-3xl text-gray-900 tracking-wide">
              Your event bar handled in three steps
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: '1',
                title: 'Book Your Bartender',
                desc: `Hire ${businessName} or your favorite bartending service for your event.`,
              },
              {
                step: '2',
                title: 'Order Your Drinks',
                desc: 'Use Party On to order spirits, mixers, seltzers, ice, and cups. We deliver to your door.',
              },
              {
                step: '3',
                title: 'Party On',
                desc: 'Your bartender arrives, your drinks are ready, and all you have to do is enjoy.',
              },
            ].map((s) => (
              <div key={s.step} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 text-center">
                <div className="w-10 h-10 bg-brand-blue text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-4">
                  {s.step}
                </div>
                <h3 className="font-heading text-lg text-gray-900 mb-2">{s.title}</h3>
                <p className="text-gray-600 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/order"
              className="inline-block px-8 py-3 bg-brand-blue text-white font-semibold rounded-lg hover:bg-brand-blue/90 transition-colors"
            >
              Order Your Drinks
            </Link>
            <p className="text-gray-500 text-sm mt-4">
              Questions? Text{' '}
              <a href="tel:7373719700" className="text-brand-blue font-medium">
                737-371-9700
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* VALUE TABLE */}
      <section className="bg-white py-12 px-6 md:px-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-gray-500 tracking-[0.1em] uppercase text-sm mb-2">
              Your Drinks, Handled
            </p>
            <h2 className="font-heading text-2xl md:text-3xl text-gray-900 tracking-wide">
              Every Party On Order Includes
            </h2>
          </div>

          <div className="bg-gray-50 rounded-xl p-8 shadow-lg border border-gray-200">
            <div className="space-y-4">
              {VALUE_TABLE.map((row, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center py-3 border-b border-gray-200 last:border-0"
                >
                  <span className="flex items-center gap-3 text-gray-900 text-base">
                    <svg className="w-6 h-6 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {row.item}
                  </span>
                  <span className="text-gray-900 font-semibold text-base whitespace-nowrap ml-4">{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="relative py-16 px-6 md:px-12 bg-gray-100 overflow-hidden">
        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-gray-500 tracking-[0.1em] uppercase text-sm mb-3">
              Real Reviews
            </p>
            <h2 className="font-heading text-3xl md:text-4xl text-gray-900 tracking-wide">
              What Our Customers Say
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {TESTIMONIALS.map((review, idx) => (
              <div key={idx} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700 mb-4 leading-relaxed">&quot;{review.text}&quot;</p>
                <p className="font-medium text-gray-900">&mdash; {review.reviewer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST SECTION */}
      <section className="py-20 px-6 md:px-12 bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-10 lg:gap-12 items-center justify-center">
            <div className="flex justify-center">
              <div className="relative w-48 md:w-56 rounded-2xl overflow-hidden bg-gray-800 shadow-2xl aspect-[9/16]">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                >
                  <source src="/videos/trust-section.mp4" type="video/mp4" />
                </video>
              </div>
            </div>

            <div className="flex flex-col text-center lg:text-left">
              <div className="flex justify-center lg:justify-start mb-6">
                <Image
                  src="/images/pod-logo-2025.svg"
                  alt="Party On Delivery"
                  width={180}
                  height={180}
                  className="w-32 h-32 md:w-44 md:h-44"
                />
              </div>

              <h2 className="font-heading text-3xl md:text-4xl text-white tracking-wide mb-6">
                Austin-Born. Fully Licensed. Always On Time.
              </h2>

              <p className="text-gray-300 text-lg md:text-xl leading-relaxed">
                Howdy! We&apos;re Allan and Brian, owners of Party On Delivery. Austin natives with 15+ years in events and hospitality, we built this business around one thing: taking care of people. We pride ourselves on clear communication, on-time delivery, and showing people the best of our great city. Our goal is simple - make your weekend easy, safe, and fun.
              </p>
              <p className="text-brand-yellow text-xl md:text-2xl font-heading mt-6 tracking-wide">
                PARTY ON Y&apos;ALL
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-6 md:px-12 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-gray-500 tracking-[0.1em] uppercase text-sm mb-3">
              Got Questions?
            </p>
            <h2 className="font-heading text-3xl md:text-4xl text-gray-900 tracking-wide">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {FAQ_ITEMS.map((faq, idx) => (
              <details key={idx} className="border border-gray-200 rounded-xl overflow-hidden group">
                <summary className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors list-none">
                  <span className="font-semibold text-gray-900 text-base pr-4">{faq.q}</span>
                  <svg
                    className="w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 group-open:rotate-180"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-6 pb-4">
                  <p className="text-gray-600 text-base leading-relaxed">{faq.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-16 px-6 md:px-12 bg-gradient-to-br from-yellow-500 to-brand-yellow">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-heading text-3xl md:text-4xl text-gray-900 mb-4 tracking-wide">
            Ready to Order?
          </h2>
          <p className="text-gray-800 text-lg mb-8 max-w-2xl mx-auto">
            Book your bartender. We handle the drinks.
          </p>

          <div className="mb-6">
            <Link
              href="/order"
              className="inline-block px-10 py-4 bg-gray-900 text-white hover:bg-gray-800 font-semibold tracking-wider transition-colors rounded-lg"
            >
              Start Your Order
            </Link>
          </div>

          <p className="text-gray-700">
            Questions? Call us:{' '}
            <a href="tel:7373719700" className="font-semibold underline">
              737.371.9700
            </a>
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
