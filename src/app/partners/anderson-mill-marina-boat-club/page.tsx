'use client';

import { useState, useMemo, useEffect, useRef, Suspense, type ReactElement } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import Navigation from "@/components/Navigation";
import Footer from '@/components/Footer';
import Button from '@/components/Button';
import JoinOrderModal from '@/components/partners/JoinOrderModal';
import DrinkCalculator from '@/components/partners/DrinkCalculator';
import QuickOrderGrid from '@/components/quick-order/QuickOrderGrid';
import QuickOrderSearch from '@/components/quick-order/QuickOrderSearch';
import CartSummaryBar from '@/components/quick-order/CartSummaryBar';
import AndersonMillHero from '@/components/partners/AndersonMillHero';
import PremierHeroStickyCTA from '@/components/partners/PremierHeroStickyCTA';
import DontForgetRow from '@/components/quick-order/DontForgetRow';
import ScrollRevealCSS from '@/components/ui/ScrollRevealCSS';
import { useQuickOrderProducts } from '@/hooks/useQuickOrderProducts';
import { useCollectionCounts } from '@/hooks/useCollectionCounts';
import { PREMIER_BOAT_COLLECTIONS } from '@/lib/products/premier-collections';

/** Boat owner testimonials for marina delivery */
const TESTIMONIALS = [
  {
    reviewer: 'Jake M.',
    tag: 'Ready at my slip',
    text: 'Pulled up to the marina and everything was already at my slip — cooler packed, ice cold, cups stacked. Didn\'t have to stop at the store or lug anything from the parking lot. Total game changer for weekend lake days.',
  },
  {
    reviewer: 'Sarah & Chris T.',
    tag: 'Group order was easy',
    text: 'We had six couples going out on the boat and everyone just added their own drinks through the group link. No collecting Venmo, no coordinating — and it was all waiting for us when we got to the dock.',
  },
  {
    reviewer: 'Danny R.',
    tag: 'Best marina perk ever',
    text: 'I keep my boat at Anderson Mill and this is the best thing to happen to lake weekends. Order the night before, show up in the morning, and everything is iced and ready. No more gas station runs.',
  },
  {
    reviewer: 'Megan L.',
    tag: 'Zero hassle delivery',
    text: 'We ordered for a birthday outing — they delivered right to the slip with ice, cups, and everything organized. The whole crew was impressed. Will absolutely use them every time we take the boat out.',
  },
];

/** Marina-specific FAQ questions */
const MARINA_FAQS = [
  {
    question: 'Where at the marina do you deliver?',
    answer: 'We deliver directly to your boat slip at Anderson Mill Marina. Just provide your slip number and boat name during checkout and we\'ll have everything waiting for you.',
  },
  {
    question: 'What do you need from me?',
    answer: 'Just your slip number, boat name, and preferred delivery time. You can add all of this during checkout.',
  },
  {
    question: "What's the ordering deadline?",
    answer: 'We recommend placing your order at least 24 hours in advance. Same-day orders may be available depending on our delivery schedule.',
  },
  {
    question: 'ID requirements?',
    answer: 'We are TABC licensed and require a valid ID from the person receiving the delivery. All recipients must be 21+.',
  },
  {
    question: 'Do you include ice and cups?',
    answer: 'Yes! Every order includes a cooler stocked with ice and cups at no extra charge.',
  },
  {
    question: 'What if something is out of stock?',
    answer: "We'll text you right away with similar alternatives. You can approve the swap or remove the item — we never substitute without your OK.",
  },
  {
    question: 'Do you deliver on weekends?',
    answer: 'Absolutely — weekends are our busiest time! We deliver seven days a week. Just place your order the day before and we\'ll have it ready.',
  },
  {
    question: 'Can I set up a recurring order?',
    answer: 'Not yet through the website, but text us at 737-371-9700 and we can set up a standing weekend order for your slip. We\'ll confirm with you each week before delivering.',
  },
];

/**
 * Anderson Mill Marina Boat Club - Drink Delivery Service Landing Page
 * Optimized for boat owners / slip leaseholders at Anderson Mill Marina
 */
function AndersonMillMarinaPageContent(): ReactElement {
  const searchParams = useSearchParams();
  void searchParams;

  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [activeCollection, setActiveCollection] = useState('boat-best-sellers');
  const [sortBy, setSortBy] = useState<'popular' | 'price-asc'>('popular');

  // Sticky collections state
  const [isCollectionsSticky, setIsCollectionsSticky] = useState(false);
  const collectionsRef = useRef<HTMLElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Load products for active collection
  const { products, loading, error } = useQuickOrderProducts(activeCollection);
  const { counts } = useCollectionCounts(PREMIER_BOAT_COLLECTIONS.map(c => c.handle));

  // Client-side sort
  const sortedProducts = useMemo(() => {
    if (sortBy !== 'price-asc') return products;
    return [...products].sort((a, b) => {
      const priceA = parseFloat(a.variants.edges[0]?.node.price.amount ?? '0');
      const priceB = parseFloat(b.variants.edges[0]?.node.price.amount ?? '0');
      return priceA - priceB;
    });
  }, [products, sortBy]);

  // Intersection Observer for sticky detection
  useEffect(() => {
    if (!sentinelRef.current) return;

    const startObserver = new IntersectionObserver(
      ([entry]) => {
        setIsCollectionsSticky(!entry.isIntersecting);
      },
      {
        rootMargin: '-96px 0px 0px 0px',
        threshold: 0,
      }
    );

    startObserver.observe(sentinelRef.current);
    return () => startObserver.disconnect();
  }, []);

  const scrollToCollections = () => {
    document.getElementById('boat-collections')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCollectionChange = (handle: string) => {
    if (activeCollection === handle) return;
    setActiveCollection(handle);
    setSortBy('popular');
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Navigation - Always hidden on this partner page */}
      <Navigation hidden />

      {/* ============================================ */}
      {/* SECTION 1: HERO                              */}
      {/* ============================================ */}
      <AndersonMillHero />

      {/* ============================================ */}
      {/* SECTION 2: EVERY ORDER INCLUDES (Value Stack)*/}
      {/* ============================================ */}
      <section className="bg-gray-50 py-10 md:py-24">
        <div className="max-w-4xl mx-auto px-6 md:px-8">
          <p className="text-sm font-heading uppercase tracking-[0.08em] text-brand-blue text-center mb-2">
            Boat Day = Handled
          </p>
          <h2 className="font-heading text-3xl md:text-4xl text-gray-900 text-center mb-6 md:mb-10">
            Every Order Includes
          </h2>

          <div className="space-y-4">
            {[
              { item: 'FREE delivery to Anderson Mill Marina', struck: '$50', label: 'FREE' },
              { item: 'Cooler stocked with ice', struck: '$25', label: 'FREE' },
              { item: 'Group ordering with split payments', struck: null, label: 'FREE' },
              { item: 'Delivered right to your boat slip', struck: null, label: 'FREE' },
            ].map((row, idx) => (
              <ScrollRevealCSS key={idx} delay={idx * 80}>
                <div className="flex items-center gap-3 py-3 border-b border-gray-200 last:border-0">
                  <svg className="w-6 h-6 text-brand-blue flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-900 font-semibold flex-1">{row.item}</span>
                  <span className="flex items-center gap-2">
                    {row.struck && (
                      <span className="text-gray-500 line-through text-sm">{row.struck}</span>
                    )}
                    <span className="text-brand-blue font-bold">{row.label}</span>
                  </span>
                </div>
              </ScrollRevealCSS>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-300 flex items-center justify-between">
            <span className="text-gray-700 font-sans">
              Anderson Mill member perks: <strong className="text-gray-900">$75+ value included</strong>
            </span>
          </div>

          <div className="mt-8 text-center">
            <Button variant="cart" size="md" href="/group/create">
              Start a Group Order &rarr;
            </Button>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 3: HOW IT WORKS                      */}
      {/* ============================================ */}
      <section className="bg-white pt-6 pb-4 md:py-24">
        <div className="max-w-5xl mx-auto px-6 md:px-8">
          <h2 className="font-heading text-3xl md:text-4xl text-gray-900 text-center mb-6 md:mb-12">
            How group ordering works
          </h2>

          <div className="grid grid-cols-3 gap-3 md:gap-6">
            {[
              { step: 1, icon: '\u{1F4F1}', title: 'Start the group', desc: 'Get a share link + code' },
              { step: 2, icon: '\u{1F465}', title: 'Friends add what they want', desc: 'Each person checks out separately' },
              { step: 3, icon: '\u{1F9CA}', title: 'We deliver one combined order', desc: 'Iced and ready at your slip' },
            ].map((s, idx) => (
              <ScrollRevealCSS key={s.step} delay={idx * 150}>
                <div className="bg-white border border-gray-200 rounded-lg p-3 md:p-6 shadow-sm text-center hover:-translate-y-1 transition-all duration-200 hover:shadow-lg">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-brand-blue text-white font-heading font-bold flex items-center justify-center mx-auto mb-2 md:mb-4 text-sm md:text-lg">
                    {s.step}
                  </div>
                  <div className="text-2xl md:text-3xl mb-2 md:mb-3">{s.icon}</div>
                  <h3 className="font-heading text-sm md:text-lg text-gray-900 font-bold mb-1 md:mb-2">{s.title}</h3>
                  <p className="font-sans text-gray-600 text-xs md:text-sm">{s.desc}</p>
                </div>
              </ScrollRevealCSS>
            ))}
          </div>

          {/* Callout box */}
          <div className="mt-4 md:mt-8 bg-brand-yellow/10 border-l-4 border-brand-yellow rounded-lg p-4">
            <p className="text-gray-900 font-semibold">
              Hosts love this: everyone pays their portion. No collecting money.
            </p>
          </div>

          {/* Inline join module */}
          <div className="mt-4 md:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <span className="text-gray-700 font-sans text-sm">Have a code?</span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Enter code"
                className="border border-gray-300 rounded-lg px-4 py-2 font-sans text-sm w-36 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const val = (e.target as HTMLInputElement).value.trim().toUpperCase();
                    if (val) window.location.href = `/group/${val}`;
                  }
                }}
                id="how-it-works-join-code"
                name="joinCode"
              />
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  const input = document.getElementById('how-it-works-join-code') as HTMLInputElement;
                  const val = input?.value.trim().toUpperCase();
                  if (val) window.location.href = `/group/${val}`;
                }}
              >
                Join
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 4: DRINK CALCULATOR                  */}
      {/* ============================================ */}
      <section className="bg-gray-100 py-0 md:py-24">
        <div id="drink-calculator" className="scroll-mt-24">
          <DrinkCalculator />
        </div>
        <div className="max-w-4xl mx-auto px-6 md:px-8 text-center mt-2 pb-4 md:pb-0 md:mt-6">
          <p className="text-gray-500 text-sm">You can edit anything before checkout.</p>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 5: SHOP (Collections + Product Grid) */}
      {/* ============================================ */}

      {/* Shop wrapper — sticky header naturally unsticks when this container scrolls out */}
      <div id="boat-collections">
        {/* Sentinel for compact mode detection */}
        <div ref={sentinelRef} className="h-0" aria-hidden="true" />

        {/* Sticky header: categories + search */}
        <div className="sticky top-0 z-40">
          <section
            ref={collectionsRef}
            className={`bg-gray-50 border-b border-gray-200 transition-all duration-200 ${
              isCollectionsSticky ? 'py-2 shadow-md' : 'py-6'
            }`}
          >
            <div className="px-4 md:max-w-7xl md:mx-auto md:px-8">
              {/* CTA Buttons - hide when compact */}
              {!isCollectionsSticky && (
                <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4 mb-6">
                  <h2 className="font-heading text-2xl md:text-3xl text-gray-900">Shop drinks</h2>
                  <div className="flex-1" />
                  <Button variant="cart" size="sm" href="/group/create">
                    Start Group Order
                  </Button>
                </div>
              )}

              {/* Collections Grid/Horizontal Scroll */}
              <div
                className={
                  isCollectionsSticky
                    ? 'flex items-center gap-2'
                    : 'grid grid-cols-2 md:grid-cols-5 gap-2'
                }
              >
                {/* Categories */}
                <div
                  className={
                    isCollectionsSticky
                      ? 'flex overflow-x-auto gap-2 pb-2 -mr-4 pr-4 scrollbar-hide snap-x snap-mandatory flex-1'
                      : 'contents'
                  }
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {PREMIER_BOAT_COLLECTIONS.map((collection) => {
                    const isActive = activeCollection === collection.handle;
                    const count = counts[collection.handle];
                    return (
                      <button
                        key={collection.handle}
                        onClick={() => handleCollectionChange(collection.handle)}
                        className={`
                          text-center border transition-all rounded-lg relative
                          ${isCollectionsSticky ? 'px-3 py-2' : 'px-4 py-3'}
                          ${isActive
                            ? `${collection.colors.bgActive} ${collection.colors.textActive} ${collection.colors.borderActive} shadow-lg ${isCollectionsSticky ? '' : 'scale-105'}`
                            : `${collection.colors.bg} ${collection.colors.text} ${collection.colors.border} hover:scale-102`
                          }
                          text-xs md:text-sm
                          ${isCollectionsSticky ? 'flex-shrink-0 snap-start whitespace-nowrap' : ''}
                          tracking-[0.1em] font-medium
                        `}
                        disabled={loading && activeCollection !== collection.handle}
                      >
                        {collection.label.toUpperCase()}
                        {count != null && count > 0 && (
                          <span className="ml-1 opacity-70">({count})</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* Search Bar — part of sticky header */}
          <div className="bg-white border-b border-gray-200 px-4 py-3">
            <div className="max-w-xl mx-auto">
              <QuickOrderSearch />
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <main className="px-4 py-8">
          <div id="product-grid" className="scroll-mt-24 max-w-7xl mx-auto">
            {error ? (
              <div className="text-center py-12">
                <p className="text-red-500">Failed to load products. Please try again.</p>
                <Button variant="cart" size="sm" onClick={() => window.location.reload()}>
                  Retry
                </Button>
              </div>
            ) : (
              <>
                <DontForgetRow />

                {/* Sort Toggle */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs text-gray-500 uppercase tracking-[0.08em] mr-1">Sort:</span>
                  <button
                    onClick={() => setSortBy('popular')}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                      sortBy === 'popular'
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    Popular
                  </button>
                  <button
                    onClick={() => setSortBy('price-asc')}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                      sortBy === 'price-asc'
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    Price Low&rarr;High
                  </button>
                </div>

                <QuickOrderGrid products={sortedProducts} loading={loading} />
              </>
            )}
          </div>
        </main>

      </div>

      {/* ============================================ */}
      {/* SECTION 6: REVIEWS (Social Proof)            */}
      {/* ============================================ */}
      <section className="bg-gray-50 py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-6 md:px-8">
          <p className="text-sm font-heading uppercase tracking-[0.08em] text-brand-blue text-center mb-2">
            Real Reviews
          </p>
          <h2 className="font-heading text-3xl md:text-4xl text-gray-900 text-center mb-10">
            What boat owners say
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {TESTIMONIALS.map((review, idx) => (
              <ScrollRevealCSS key={idx} delay={idx * 100}>
                <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm hover:-translate-y-1 transition-all duration-200 hover:shadow-lg">
                  {/* Outcome tag */}
                  <span className="inline-block bg-brand-blue/10 text-brand-blue text-xs font-semibold rounded-lg px-2 py-1 mb-3">
                    {review.tag}
                  </span>
                  <div className="flex gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-brand-yellow" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="font-sans text-gray-600 text-sm mb-4 leading-relaxed">&quot;{review.text}&quot;</p>
                  <p className="font-heading text-gray-900 font-bold">&mdash; {review.reviewer}</p>
                </div>
              </ScrollRevealCSS>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Button variant="cart" size="lg" href="/group/create">
              Start a Group Order (split payments)
            </Button>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 7: FAQ (Single Column)               */}
      {/* ============================================ */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-10">
            <h2 className="font-heading text-3xl md:text-4xl text-gray-900 mb-4">
              FAQs
            </h2>
          </div>

          {/* Single-column FAQ */}
          <div className="bg-gray-50 rounded-lg p-6">
            {MARINA_FAQS.map((faq, index) => (
              <div key={index} className="border-b border-gray-200 last:border-b-0">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full py-5 flex items-center justify-between text-left group"
                  aria-expanded={openFaq === index}
                >
                  <span className="font-sans font-medium text-gray-900 group-hover:text-brand-blue transition-colors pr-4">
                    {faq.question}
                  </span>
                  <motion.span
                    animate={{ rotate: openFaq === index ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex-shrink-0 text-gray-400"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {openFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="pb-5 text-gray-600 leading-relaxed">{faq.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 8: MARINA INFORMATION                */}
      {/* ============================================ */}
      <section className="bg-gray-50 py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-6 md:px-8">
          <h2 className="font-heading text-3xl md:text-4xl text-gray-900 text-center mb-10">
            Anderson Mill Marina
          </h2>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Address */}
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-brand-blue flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Address</p>
                  <p className="text-gray-600 text-sm">13993 FM 2769<br />Leander, Texas 78641</p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-brand-blue flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Phone</p>
                  <a href="tel:5125994267" className="text-brand-blue hover:text-brand-blue/80 text-sm">(512) 599-4267</a>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-brand-blue flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Email</p>
                  <a href="mailto:andersonmill@andersonmilllaketravis.com" className="text-brand-blue hover:text-brand-blue/80 text-sm break-all">andersonmill@andersonmilllaketravis.com</a>
                </div>
              </div>

              {/* Hours */}
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-brand-blue flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Hours</p>
                  <p className="text-gray-600 text-sm">9:00 AM &ndash; 5:00 PM</p>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-6 pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center gap-3">
              <a
                href="https://www.google.com/maps/dir/?api=1&destination=13993+FM+2769+Leander+TX+78641"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-brand-blue text-white font-semibold text-sm rounded-lg px-5 py-2.5 hover:bg-brand-blue/90 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                Get Directions
              </a>
              <a
                href="https://andersonmilllaketravis.com/anderson-mill-marina"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-brand-blue hover:text-brand-blue/80 font-semibold text-sm transition-colors"
              >
                Visit Marina Website
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 9: ABOUT / TRUST                     */}
      {/* ============================================ */}
      <section className="bg-gray-900 py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Left: Video */}
            <ScrollRevealCSS className="flex justify-center">
              <div className="relative w-48 md:w-56 lg:w-full lg:max-w-xs rounded-lg overflow-hidden bg-gray-800 shadow-2xl aspect-[9/16] lg:aspect-auto lg:h-full">
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
            </ScrollRevealCSS>

            {/* Right: About */}
            <ScrollRevealCSS delay={200}>
              <h2 className="font-heading text-3xl md:text-4xl text-white mb-6">
                Austin-Born. Fully Licensed. Always On Time.
              </h2>
              <p className="font-sans text-white/80 mb-6 leading-relaxed">
                Howdy! We&apos;re Allan and Brian, owners of Party On Delivery. Austin natives with 15+ years in events and hospitality, we built this business around one thing: taking care of people.
              </p>
              <ul className="space-y-3 mb-6">
                {[
                  'TABC licensed + compliant ID checks',
                  'Local team, fast communication',
                  'Thousands of successful deliveries',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-white">
                    <svg className="w-5 h-5 text-brand-yellow flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <a
                href="sms:7373719700"
                className="text-brand-yellow hover:text-brand-yellow/80 underline font-sans text-sm"
              >
                Text us your details &rarr; we&apos;ll help you build the cart
              </a>
            </ScrollRevealCSS>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 10: FINAL CTA (Strong Close)         */}
      {/* ============================================ */}
      <section className="bg-brand-yellow py-16 md:py-24">
        <ScrollRevealCSS>
          <div className="max-w-3xl mx-auto px-6 md:px-8 text-center">
            <h2 className="font-heading text-3xl md:text-5xl text-gray-900 mb-4">
              Ready for the lake?
            </h2>
            <p className="font-sans text-gray-900/80 mb-8">
              Free marina delivery. Easy group ordering. Zero hassle.
            </p>

            <div className="flex flex-col items-center gap-3 mb-6">
              <Button variant="primary" size="lg" href="/group/create">
                Start a Group Order
              </Button>

              <button
                onClick={scrollToCollections}
                className="text-gray-900/70 hover:text-gray-900 text-sm underline font-sans"
              >
                Start an individual order
              </button>

              <button
                onClick={() => setIsJoinModalOpen(true)}
                className="text-gray-900/70 hover:text-gray-900 text-sm underline font-sans"
              >
                Join with code
              </button>
            </div>

            <p className="text-gray-900/60 text-sm font-sans">
              Questions? Text us:{' '}
              <a href="tel:7373719700" className="font-semibold underline">
                737-371-9700
              </a>
            </p>
          </div>
        </ScrollRevealCSS>
      </section>

      {/* ============================================ */}
      {/* SECTION 11: FOOTER                           */}
      {/* ============================================ */}
      <div className="pb-24 md:pb-20">
        <Footer />
      </div>

      {/* Cart Summary Bar - Fixed Bottom */}
      <CartSummaryBar />

      {/* Mobile Sticky CTA - only visible on mobile */}
      <PremierHeroStickyCTA onJoinCode={() => setIsJoinModalOpen(true)} />

      {/* MODALS */}
      <JoinOrderModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
      />

    </div>
  );
}

/**
 * Page wrapper with Suspense boundary for useSearchParams
 * Required by Next.js 15 for client components using search params
 */
export default function AndersonMillMarinaPage(): ReactElement {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <AndersonMillMarinaPageContent />
    </Suspense>
  );
}
