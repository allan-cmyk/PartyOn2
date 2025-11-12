import Image from 'next/image';
import Link from 'next/link';
import Script from 'next/script';
import OldFashionedNavigation from '@/components/OldFashionedNavigation';
import HeroSection from '@/components/homepage/HeroSection';
import ScrollRevealCSS from '@/components/ui/ScrollRevealCSS';
import { generateFAQSchema } from '@/lib/seo/schemas';

export default function HomePage() {
  // Homepage FAQ data for schema markup
  const homepageFAQs = [
    {
      question: "Do you deliver to venues, Airbnbs, offices, or boats?",
      answer: "Yes—coordinated handoff so you're not waiting around."
    },
    {
      question: "How far ahead should I book?",
      answer: "72 hours recommended; peak dates fill fast so book early."
    },
    {
      question: "Can you staff bartenders?",
      answer: "Yes via vetted TABC-certified partners for full-service events."
    },
    {
      question: "Do you bring ice and disposables?",
      answer: "Yes—add cups, napkins, stirrers, and ice to your cart."
    },
    {
      question: "Refunds on unopened items for weddings?",
      answer: "100% refund policy—we want your day perfect, not wasteful."
    },
    {
      question: "Are you licensed and insured?",
      answer: "Yes—TABC certified + $2M insurance. Fully licensed operation."
    }
  ];

  const faqSchema = generateFAQSchema(homepageFAQs);

  return (
    <div className="bg-white">
      {/* FAQ Schema for Homepage */}
      <Script
        id="homepage-faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <OldFashionedNavigation />

      {/* Hero Section - Client Component */}
      <HeroSection />

      {/* Choose Your Path Fork */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-8">
          <ScrollRevealCSS duration={800} y={30}>
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl md:text-4xl text-gray-900 mb-4 tracking-[0.1em]">
                Choose Your Path
              </h2>
              <div className="w-16 h-px bg-gold-600 mx-auto" />
            </div>
          </ScrollRevealCSS>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Delivery Now */}
            <ScrollRevealCSS duration={800} delay={100} y={30}>
              <div className="bg-white rounded-lg p-8 border border-gray-200 hover:shadow-lg transition-shadow">
                <h3 className="font-serif text-2xl text-gray-900 mb-6 tracking-[0.1em]">
                  Delivery Now <span className="text-gold-600">(fastest)</span>
                </h3>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start">
                    <span className="text-gold-600 mr-3 mt-1">•</span>
                    <span className="text-gray-700">Build your cart in minutes—beer, spirits, cocktail kits, ice & disposables</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-gold-600 mr-3 mt-1">•</span>
                    <span className="text-gray-700">Everything arrives cold with coordinated handoff</span>
                  </li>
                </ul>
                <Link href="/products">
                  <button className="w-full px-8 py-4 bg-gold-600 text-gray-900 hover:bg-gold-700 transition-colors tracking-[0.15em] text-sm">
                    SHOP BEST SELLERS
                  </button>
                </Link>
              </div>
            </ScrollRevealCSS>

            {/* Plan an Event */}
            <ScrollRevealCSS duration={800} delay={200} y={30}>
              <div className="bg-white rounded-lg p-8 border border-gray-200 hover:shadow-lg transition-shadow">
                <h3 className="font-serif text-2xl text-gray-900 mb-6 tracking-[0.1em]">
                  Plan an Event <span className="text-gold-600">(concierge)</span>
                </h3>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start">
                    <span className="text-gold-600 mr-3 mt-1">•</span>
                    <span className="text-gray-700">Full wedding, boat party, and corporate bar coordination</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-gold-600 mr-3 mt-1">•</span>
                    <span className="text-gray-700">Optional TABC-certified bartender staffing via vetted partners</span>
                  </li>
                </ul>
                <Link href="/contact">
                  <button className="w-full px-8 py-4 border-2 border-gold-600 text-gray-900 hover:bg-gold-600 hover:text-gray-900 transition-all duration-300 tracking-[0.15em] text-sm">
                    GET HELP
                  </button>
                </Link>
              </div>
            </ScrollRevealCSS>
          </div>

          <div className="text-center mt-8">
            <p className="text-gray-600 text-sm tracking-[0.05em]">
              Austin locals serving Downtown to Lake Travis since 2023
            </p>
          </div>
        </div>
      </section>

      {/*
        TODO: RESTORE THIS SECTION AROUND FEBRUARY 10, 2025 (2 weeks from removal)

        "Top Picks (2-minute order)" section was temporarily removed on January 27, 2025
        This section includes:
        - Party Packs, Premium Spirits, Craft Beer, Wine Selection
        - Cocktail Kits, Ice & Disposables, Coolers & Gear, Party Essentials

        TO RESTORE: git show HEAD~1:src/app/page.tsx and copy lines 85-131
      */}

      {/* Why Austin Books Party On */}
      <section id="experience" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-8 md:px-12">
          <ScrollRevealCSS duration={800} y={30}>
            <div className="text-center mb-16">
              <h2 className="font-serif font-light text-4xl md:text-5xl text-gray-900 mb-4 tracking-[0.1em]">
                Why Austin books Party On
              </h2>
              <div className="w-16 h-px bg-gold-600 mx-auto" />
            </div>
          </ScrollRevealCSS>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: "On-time, cold delivery",
                description: "Ice, cups, mixers handled so you don't stress",
                gradient: "from-blue-50 to-gray-50",
                icon: (
                  <svg className="w-14 h-14 mx-auto text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                )
              },
              {
                title: "Local concierge",
                description: "We know venues, marinas, and event planners personally",
                gradient: "from-amber-50 to-gray-50",
                icon: (
                  <svg className="w-14 h-14 mx-auto text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                )
              },
              {
                title: "Licensed & insured",
                description: "TABC-certified service you can trust completely",
                gradient: "from-emerald-50 to-gray-50",
                icon: (
                  <svg className="w-14 h-14 mx-auto text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                )
              },
              {
                title: "No overbuy anxiety",
                description: "Weddings: 100% refund on unopened",
                gradient: "from-rose-50 to-gray-50",
                icon: (
                  <svg className="w-14 h-14 mx-auto text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )
              }
            ].map((feature, index) => (
              <ScrollRevealCSS key={feature.title} duration={800} delay={index * 100} y={20}>
                <div className={`relative overflow-hidden rounded-lg group cursor-pointer transform hover:-translate-y-1 transition-all duration-300 bg-gradient-to-br ${feature.gradient} border border-gray-200`}>
                  <div className="relative p-8 text-center">
                    <div className="mb-6">{feature.icon}</div>
                    <h3 className="font-serif text-2xl text-gray-900 mb-4 tracking-[0.1em]">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                  {/* Subtle gold shimmer on hover */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-gold-600/0 via-gold-600/5 to-gold-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                </div>
              </ScrollRevealCSS>
            ))}
          </div>
        </div>
      </section>

      {/* Signature Services */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-8 md:px-12">
          <ScrollRevealCSS duration={800} y={30}>
            <div className="text-center mb-16">
              <h2 className="font-serif font-light text-4xl md:text-5xl text-gray-900 mb-4 tracking-[0.1em]">
                For whatever you&apos;re planning, get the perfect drink menu on easy mode
              </h2>
              <div className="w-16 h-px bg-gold-600 mx-auto mb-6" />
            </div>
          </ScrollRevealCSS>

          {/* Service 1: Weddings */}
          <ScrollRevealCSS duration={800} delay={100} y={30}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24">
            <div className="relative h-96 overflow-hidden">
              <Image
                src="/images/services/weddings/outdoor-bar-setup.webp"
                alt="Wedding Bar Service"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                loading="lazy"
                quality={60}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-gray-900/20 to-transparent" />
            </div>
            <div className="lg:pl-12">
              <h3 className="font-serif text-3xl text-gray-900 mb-6 tracking-[0.1em]">
                Weddings
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Make your special day stress-free with coordinated bar service and setup.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/weddings">
                  <button className="px-6 py-3 bg-gold-600 text-gray-900 hover:bg-gold-700 transition-colors tracking-[0.1em] text-sm">
                    EXPLORE PACKAGES
                  </button>
                </Link>
                <Link href="/order">
                  <button className="px-6 py-3 border-2 border-gold-600 text-gray-900 hover:bg-gold-600 hover:text-gray-900 transition-all duration-300 tracking-[0.1em] text-sm">
                    PLAN MY WEDDING
                  </button>
                </Link>
              </div>
            </div>
            </div>
          </ScrollRevealCSS>

          {/* Service 2: Boat Parties */}
          <ScrollRevealCSS duration={800} delay={200} y={30}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24">
            <div className="lg:pr-12 order-2 lg:order-1">
              <h3 className="font-serif text-3xl text-gray-900 mb-6 tracking-[0.1em]">
                Boat Parties
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Lake Travis essentials delivered dockside—drinks, ice, and coolers ready to go.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/boat-parties">
                  <button className="px-6 py-3 bg-gold-600 text-gray-900 hover:bg-gold-700 transition-colors tracking-[0.1em] text-sm">
                    ORDER LAKE DAY ESSENTIALS
                  </button>
                </Link>
                <Link href="/order">
                  <button className="px-6 py-3 border-2 border-gold-600 text-gray-900 hover:bg-gold-600 hover:text-gray-900 transition-all duration-300 tracking-[0.1em] text-sm">
                    PLAN A YACHT BAR
                  </button>
                </Link>
              </div>
            </div>
            <div className="relative h-96 overflow-hidden order-1 lg:order-2">
              <Image
                src="/images/services/boat-parties/luxury-yacht-deck.webp"
                alt="Boat Party Service"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                loading="lazy"
                quality={60}
              />
              <div className="absolute inset-0 bg-gradient-to-l from-gray-900/20 to-transparent" />
            </div>
            </div>
          </ScrollRevealCSS>

          {/* Service 3: Corporate Events */}
          <ScrollRevealCSS duration={800} delay={300} y={30}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative h-96 overflow-hidden">
              <Image
                src="/images/services/corporate/penthouse-suite-setup.webp"
                alt="Corporate Event Service"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                loading="lazy"
                quality={60}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-gray-900/20 to-transparent" />
            </div>
            <div className="lg:pl-12">
              <h3 className="font-serif text-3xl text-gray-900 mb-6 tracking-[0.1em]">
                Corporate
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Professional office bars and team events with invoice billing available.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/corporate">
                  <button className="px-6 py-3 bg-gold-600 text-gray-900 hover:bg-gold-700 transition-colors tracking-[0.1em] text-sm">
                    ORDER OFFICE BAR
                  </button>
                </Link>
                <Link href="/order">
                  <button className="px-6 py-3 border-2 border-gold-600 text-gray-900 hover:bg-gold-600 hover:text-gray-900 transition-all duration-300 tracking-[0.1em] text-sm">
                    BOOK A CORPORATE CONSULT
                  </button>
                </Link>
              </div>
            </div>
            </div>
          </ScrollRevealCSS>
        </div>
      </section>

      {/* Austin Coverage */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-8 md:px-12">
          <ScrollRevealCSS duration={800} y={30}>
            <div className="text-center mb-16">
              <h2 className="font-serif font-light text-4xl md:text-5xl text-gray-900 mb-4 tracking-[0.1em]">
                Serving Austin&apos;s Finest
              </h2>
              <div className="w-16 h-px bg-gold-600 mx-auto mb-6" />
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                From Lake Travis to Downtown, we deliver excellence to every corner of Austin
              </p>
            </div>
          </ScrollRevealCSS>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            <ScrollRevealCSS duration={800} delay={100} y={30}>
              <div>
              <h3 className="font-serif text-2xl text-gray-900 mb-6 tracking-[0.1em]">
                Downtown & Central
              </h3>
              <ul className="space-y-3">
                {['Rainey Street', '6th Street', 'The Domain', 'Hyde Park', 'South Congress', 'East Austin'].map((area) => (
                  <li key={area} className="flex items-center text-gray-700">
                    <svg className="w-4 h-4 text-gold-600 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {area}
                  </li>
                ))}
              </ul>
              </div>
            </ScrollRevealCSS>
            <ScrollRevealCSS duration={800} delay={200} y={30}>
              <div>
              <h3 className="font-serif text-2xl text-gray-900 mb-6 tracking-[0.1em]">
                Lake & Hills
              </h3>
              <ul className="space-y-3">
                {['Lake Travis', 'Westlake Hills', 'Bee Cave', 'Dripping Springs', 'Lakeway', 'Spicewood'].map((area) => (
                  <li key={area} className="flex items-center text-gray-700">
                    <svg className="w-4 h-4 text-gold-600 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {area}
                  </li>
                ))}
              </ul>
              </div>
            </ScrollRevealCSS>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-8 md:px-12">
          <ScrollRevealCSS duration={800} y={30}>
            <div className="text-center mb-16">
              <h2 className="font-serif font-light text-4xl md:text-5xl text-gray-900 mb-4 tracking-[0.1em]">
                Client Testimonials
              </h2>
              <div className="w-16 h-px bg-gold-600 mx-auto" />
            </div>
          </ScrollRevealCSS>

          <div className="max-w-4xl mx-auto space-y-12">
            {[
              {
                text: "Party On saved our wedding weekend. Everything was perfectly chilled and the setup was flawless.",
                author: "Sarah M.",
                role: "Austin Wedding, October"
              },
              {
                text: "Best boat party delivery on Lake Travis. They know exactly where to find us.",
                author: "Mike T.",
                role: "Lake Travis Regular, Summer"
              }
            ].map((testimonial, index) => (
              <ScrollRevealCSS key={index} duration={800} delay={index * 100} y={30}>
                <div className="text-center">
                  <p className="text-xl text-gray-700 italic mb-6 leading-relaxed">
                    &ldquo;{testimonial.text}&rdquo;
                  </p>
                  <p className="text-gray-900 font-light tracking-[0.1em]">
                    {testimonial.author}
                  </p>
                  <p className="text-gold-600 text-sm tracking-[0.1em]">
                    {testimonial.role}
                  </p>
                  {index < 1 && <div className="w-24 h-px bg-gray-300 mx-auto mt-12" />}
                </div>
              </ScrollRevealCSS>
            ))}

            <ScrollRevealCSS duration={800} delay={300} y={30}>
              <div className="text-center pt-8 border-t border-gray-200">
              <p className="text-gray-600 tracking-[0.05em]">
                Open since 2023 • Thousands served • 5.0★ on Google
              </p>
              </div>
            </ScrollRevealCSS>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-8">
          <ScrollRevealCSS duration={800} y={30}>
            <div className="text-center mb-16">
              <h2 className="font-serif text-4xl md:text-5xl text-gray-900 mb-4 tracking-[0.1em]">
                How it works
              </h2>
              <div className="w-16 h-px bg-gold-600 mx-auto" />
            </div>
          </ScrollRevealCSS>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                title: "Tell us date & drop-off window",
                description: "Quick availability check"
              },
              {
                step: "2",
                title: "Choose Delivery Now or Plan an Event",
                description: "Fast order or full coordination"
              },
              {
                step: "3",
                title: "We coordinate logistics",
                description: "Venue/Airbnb/office/boat handoff arranged"
              },
              {
                step: "4",
                title: "Everything arrives cold",
                description: "Celebrate stress-free"
              }
            ].map((item, index) => (
              <ScrollRevealCSS key={item.step} duration={800} delay={index * 100} y={30}>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gold-600 text-gray-900 rounded-full flex items-center justify-center text-xl font-light mx-auto mb-6">
                    {item.step}
                  </div>
                  <h3 className="font-serif text-xl text-gray-900 mb-3 tracking-[0.05em]">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {item.description}
                  </p>
                </div>
              </ScrollRevealCSS>
            ))}
          </div>
        </div>
      </section>

      {/* Service Areas - Logistics Help */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-8">
          <ScrollRevealCSS duration={800} y={30}>
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl md:text-4xl text-gray-900 mb-4 tracking-[0.1em]">
                We Handle the Logistics
              </h2>
              <div className="w-16 h-px bg-gold-600 mx-auto mb-6" />
              <p className="text-gray-600 max-w-2xl mx-auto">
                Austin, Lake Travis, Hill Country coverage with specialized delivery expertise
              </p>
            </div>
          </ScrollRevealCSS>

          <ScrollRevealCSS duration={800} delay={100} y={30}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
              {
                title: "Hotel bell desk handoff",
                description: "No waiting in lobby; we coordinate with staff"
              },
              {
                title: "Airbnb door code coordination",
                description: "Seamless check-in delivery timing"
              },
              {
                title: "Dockside or cove handoff",
                description: "Lake Travis marina and boat delivery expertise"
              },
              {
                title: "Office load-in / invoice billing",
                description: "Corporate-friendly logistics and payment"
              }
            ].map((item) => (
              <div
                key={item.title}
                className="flex items-start space-x-4"
              >
                <div className="w-2 h-2 bg-gold-600 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.description}</p>
                </div>
              </div>
            ))}
            </div>
          </ScrollRevealCSS>
        </div>
      </section>

      {/* Mini-FAQ */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-8">
          <ScrollRevealCSS duration={800} y={30}>
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl md:text-4xl text-gray-900 mb-4 tracking-[0.1em]">
                Quick Questions
              </h2>
              <div className="w-16 h-px bg-gold-600 mx-auto" />
            </div>
          </ScrollRevealCSS>

          <div className="space-y-8">
            {homepageFAQs.map((faq, index) => (
              <ScrollRevealCSS key={index} duration={800} delay={index * 80} y={20}>
                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <h3 className="font-medium text-gray-900 mb-3">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              </ScrollRevealCSS>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gray-900">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <ScrollRevealCSS duration={800} y={30}>
            <div>
              <h2 className="font-serif font-light text-4xl md:text-5xl text-white mb-6 tracking-[0.1em]">
                Ready to stock your party?
              </h2>
              <p className="text-gray-300 text-lg mb-12 tracking-[0.05em]">
                2-minute order • Fast availability check • (737) 371-9700
              </p>
              <div className="flex flex-col md:flex-row gap-6 justify-center">
                <Link href="/products">
                  <button className="px-10 py-4 bg-gold-600 text-gray-900 hover:bg-gold-700 transition-colors tracking-[0.15em] text-sm">
                    ORDER NOW
                  </button>
                </Link>
                <Link href="/order">
                  <button className="px-10 py-4 border-2 border-gold-600 text-white hover:bg-gold-600 hover:text-gray-900 transition-all duration-300 tracking-[0.15em] text-sm">
                    PLAN MY EVENT
                  </button>
                </Link>
              </div>
            </div>
          </ScrollRevealCSS>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-16 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-8 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <img
                src="/images/POD Logo 2025.svg"
                alt="Party On Delivery"
                className="h-16 w-auto mb-4"
                width="64"
                height="64"
              />
              <p className="text-gray-600 text-sm leading-relaxed">
                Austin&apos;s premier alcohol delivery and event service since 2023.
              </p>
            </div>
            <div>
              <h4 className="font-light text-gray-900 mb-4 tracking-[0.1em]">SERVICES</h4>
              <ul className="space-y-2">
                <li><Link href="/weddings" className="text-gray-600 hover:text-gold-600 text-sm transition-colors">Weddings</Link></li>
                <li><Link href="/boat-parties" className="text-gray-600 hover:text-gold-600 text-sm transition-colors">Boat Parties</Link></li>
                <li><Link href="/bach-parties" className="text-gray-600 hover:text-gold-600 text-sm transition-colors">Celebrations</Link></li>
                <li><Link href="/corporate" className="text-gray-600 hover:text-gold-600 text-sm transition-colors">Corporate</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-light text-gray-900 mb-4 tracking-[0.1em]">COMPANY</h4>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-gray-600 hover:text-gold-600 text-sm transition-colors">About</Link></li>
                <li><Link href="/blog" className="text-gray-600 hover:text-gold-600 text-sm transition-colors">Blog</Link></li>
                <li><Link href="/delivery-areas" className="text-gray-600 hover:text-gold-600 text-sm transition-colors">Delivery Areas</Link></li>
                <li><Link href="/faqs" className="text-gray-600 hover:text-gold-600 text-sm transition-colors">FAQs</Link></li>
                <li><Link href="/contact" className="text-gray-600 hover:text-gold-600 text-sm transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-light text-gray-900 mb-4 tracking-[0.1em]">CONTACT</h4>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li>Phone: (737) 371-9700</li>
                <li>Email: info@partyondelivery.com</li>
                <li>Hours: 10AM - 9PM (except Sundays)</li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">© 2025 PartyOn Delivery. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/terms" className="text-gray-500 hover:text-gold-600 text-sm transition-colors">Terms</Link>
              <Link href="/privacy" className="text-gray-500 hover:text-gold-600 text-sm transition-colors">Privacy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}