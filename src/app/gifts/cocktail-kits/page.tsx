import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import ChristmasDeadlineBanner from '@/components/ChristmasDeadlineBanner'
import ProductCard from '@/components/shopify/ProductCard'
import LuxuryCard from '@/components/LuxuryCard'
import { fetchProducts } from '@/lib/shopify/queries/products'
import { Product } from '@/lib/shopify/types'

export const metadata: Metadata = {
  title: 'Christmas Cocktail Kit Gifts | Austin Delivery | Party On Delivery',
  description: 'Perfect Christmas gifts for Austin hosts. Premium cocktail kits make 20-30 drinks. Austin Rita, Skinny Margarita & more. Delivered to their door by December 20.',
  keywords: 'cocktail kit gifts Austin, Christmas alcohol gifts, margarita kit delivery, Austin party gifts, holiday host gifts',
  openGraph: {
    title: 'Perfect Christmas Cocktail Kits for Austin Hosts',
    description: 'Give the gift of 24 premium margaritas. Everything in one box, delivered to their door.',
    images: ['/images/products/classic-austin-margarita-kit.webp'],
  },
}

export default async function CocktailKitsGiftPage() {
  // Fetch cocktail kit products from Shopify
  const allProducts = await fetchProducts({ first: 50 })

  // Filter for cocktail kits
  const cocktailKits = allProducts.filter((product: Product) =>
    product.productType?.toLowerCase().includes('cocktail') ||
    product.title.toLowerCase().includes('kit') ||
    product.tags?.some(tag => tag.toLowerCase().includes('cocktail'))
  )

  // Find Austin Rita as hero product
  const austinRitaKit = cocktailKits.find((p: Product) =>
    p.title.toLowerCase().includes('austin rita')
  )

  // Other kits (excluding Austin Rita)
  const otherKits = cocktailKits.filter((p: Product) =>
    p.id !== austinRitaKit?.id
  ).slice(0, 5)

  return (
    <div className="min-h-screen bg-white">
      {/* Christmas Deadline Banner */}
      <ChristmasDeadlineBanner
        deadline="December 20"
        minOrderAmount={100}
        dismissible={true}
      />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-neutral-50 to-neutral-100 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text */}
            <div className="text-center lg:text-left">
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-neutral-900 mb-6 tracking-wide">
                Perfect Christmas Cocktail Kits for Austin Hosts
              </h1>
              <p className="text-xl sm:text-2xl text-neutral-700 mb-6 tracking-wide">
                Give the Gift of 24 Premium Margaritas
              </p>
              <p className="text-lg text-neutral-600 mb-8 leading-relaxed">
                Skip the crowded liquor store. Send a complete party in a box—everything they need to make authentic Austin-style cocktails. Delivered to their door with gift card and bottle bag included.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <a
                  href="#featured-products"
                  className="inline-block bg-gold-500 hover:bg-gold-600 text-white px-8 py-4 text-lg font-medium tracking-widest transition-colors duration-200"
                >
                  SHOP GIFT KITS
                </a>
                <a
                  href="#how-it-works"
                  className="inline-block border-2 border-gold-500 text-gold-600 hover:bg-gold-50 px-8 py-4 text-lg font-medium tracking-widest transition-colors duration-200"
                >
                  HOW IT WORKS
                </a>
              </div>
            </div>

            {/* Right Column - Hero Image */}
            <div className="relative">
              {austinRitaKit && (
                <div className="relative aspect-square rounded-lg overflow-hidden shadow-2xl">
                  <Image
                    src={austinRitaKit.images[0]?.url || '/images/products/classic-austin-margarita-kit.webp'}
                    alt={austinRitaKit.title}
                    fill
                    className="object-cover"
                    priority
                  />
                  {/* Badge */}
                  <div className="absolute top-4 right-4 bg-gold-500 text-white px-4 py-2 text-sm font-bold tracking-wider shadow-lg">
                    BESTSELLER
                  </div>
                </div>
              )}

              {/* Trust Badges */}
              <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-gold-500">24</div>
                  <div className="text-sm text-neutral-600">Drinks</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gold-500">$89.99</div>
                  <div className="text-sm text-neutral-600">Complete Kit</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gold-500">72hrs</div>
                  <div className="text-sm text-neutral-600">Delivery</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Product: Austin Rita Kit */}
      {austinRitaKit && (
        <section id="featured-products" className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl sm:text-4xl text-neutral-900 mb-4 tracking-wide">
                Featured Gift: Austin Rita Party Pitcher Kit
              </h2>
              <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
                Our bestselling margarita kit—perfect for hosts, party lovers, and anyone who appreciates a great cocktail.
              </p>
            </div>

            <div className="max-w-5xl mx-auto">
              <ProductCard
                product={austinRitaKit}
                featured={true}
              />
            </div>
          </div>
        </section>
      )}

      {/* More Cocktail Kits */}
      {otherKits.length > 0 && (
        <section className="py-16 bg-neutral-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl sm:text-4xl text-neutral-900 mb-4 tracking-wide">
                More Cocktail Kit Gifts
              </h2>
              <p className="text-lg text-neutral-600">
                Explore our full selection of premium cocktail kits
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {otherKits.map((product: Product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <div className="text-center mt-12">
              <Link
                href="/products"
                className="inline-block border-2 border-gold-500 text-gold-600 hover:bg-gold-50 px-8 py-4 text-lg font-medium tracking-widest transition-colors duration-200"
              >
                VIEW ALL PRODUCTS
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Why Gift Cocktail Kits */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl sm:text-4xl text-neutral-900 mb-4 tracking-wide">
              Why Gift a Cocktail Kit?
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              More thoughtful than wine, more fun than a gift card—cocktail kits are the perfect gift for anyone who loves to entertain.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <LuxuryCard
              icon={
                <svg className="w-12 h-12 text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              }
              title="Everything in One Box"
              description="No store trips needed. Premium tequila, mixers, and garnishes—all included and perfectly portioned."
            />

            <LuxuryCard
              icon={
                <svg className="w-12 h-12 text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              }
              title="Makes 20-30 Drinks"
              description="Way more value than a single bottle. Perfect for parties, gatherings, or enjoying over multiple occasions."
            />

            <LuxuryCard
              icon={
                <svg className="w-12 h-12 text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              }
              title="Austin Local Ingredients"
              description="Featuring Texas-made spirits and locally-sourced ingredients. Support Austin businesses with every gift."
            />

            <LuxuryCard
              icon={
                <svg className="w-12 h-12 text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              }
              title="Gift-Ready Delivery"
              description="Delivered with gift card and bottle bag. Schedule delivery for any date, or send same-day."
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 bg-gradient-to-br from-neutral-50 to-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl sm:text-4xl text-neutral-900 mb-4 tracking-wide">
              How Cocktail Kit Gifting Works
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Sending a cocktail kit gift is easy. Here's how:
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gold-500 text-white text-2xl font-bold mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-3 tracking-wide">
                Choose Your Kit
              </h3>
              <p className="text-neutral-600 leading-relaxed">
                Browse our selection and pick the perfect cocktail kit. Austin Rita is our bestseller for a reason!
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gold-500 text-white text-2xl font-bold mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-3 tracking-wide">
                Add Gift Options
              </h3>
              <p className="text-neutral-600 leading-relaxed">
                Include a personalized gift card and upgrade to our premium gift bottle bag for elegant presentation.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gold-500 text-white text-2xl font-bold mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-3 tracking-wide">
                Schedule Delivery
              </h3>
              <p className="text-neutral-600 leading-relaxed">
                Enter their address and choose a delivery date. We'll handle the rest and deliver with care.
              </p>
            </div>
          </div>

          {/* Gift Options Info */}
          <div className="mt-12 max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
            <h3 className="text-2xl font-serif text-neutral-900 mb-4 text-center tracking-wide">
              Gift Options Available
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <svg className="w-6 h-6 text-gold-500 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div>
                  <h4 className="font-semibold text-neutral-900 mb-1">Gift Card</h4>
                  <p className="text-sm text-neutral-600">Add a personalized message on a beautiful card included with the delivery.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <svg className="w-6 h-6 text-gold-500 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <div>
                  <h4 className="font-semibold text-neutral-900 mb-1">Gift Bottle Bag</h4>
                  <p className="text-sm text-neutral-600">Upgrade to elegant gift bag presentation for premium bottles in the kit.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl sm:text-4xl text-neutral-900 mb-4 tracking-wide">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-6">
            <details className="group border-b border-neutral-200 pb-6">
              <summary className="flex justify-between items-center cursor-pointer text-lg font-semibold text-neutral-900 hover:text-gold-600 transition-colors">
                When is the last day to order for Christmas delivery?
                <svg className="w-5 h-5 text-gold-500 transform group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <p className="mt-4 text-neutral-600 leading-relaxed">
                Order by <strong>December 20</strong> to guarantee delivery before Christmas. We schedule deliveries with 72-hour advance notice to ensure availability and quality service.
              </p>
            </details>

            <details className="group border-b border-neutral-200 pb-6">
              <summary className="flex justify-between items-center cursor-pointer text-lg font-semibold text-neutral-900 hover:text-gold-600 transition-colors">
                Can I add a personalized gift message?
                <svg className="w-5 h-5 text-gold-500 transform group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <p className="mt-4 text-neutral-600 leading-relaxed">
                Yes! During checkout, you can add a personalized gift card with your message. We'll include it with the delivery in an elegant presentation.
              </p>
            </details>

            <details className="group border-b border-neutral-200 pb-6">
              <summary className="flex justify-between items-center cursor-pointer text-lg font-semibold text-neutral-900 hover:text-gold-600 transition-colors">
                What if the recipient isn't home for delivery?
                <svg className="w-5 h-5 text-gold-500 transform group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <p className="mt-4 text-neutral-600 leading-relaxed">
                We'll contact the recipient to arrange a convenient delivery time. You can also provide special delivery instructions during checkout for safe drop-off locations.
              </p>
            </details>

            <details className="group border-b border-neutral-200 pb-6">
              <summary className="flex justify-between items-center cursor-pointer text-lg font-semibold text-neutral-900 hover:text-gold-600 transition-colors">
                Is everything included in the cocktail kit?
                <svg className="w-5 h-5 text-gold-500 transform group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <p className="mt-4 text-neutral-600 leading-relaxed">
                Yes! Each kit includes premium spirits, mixers, garnishes, and everything needed to make 20-30 cocktails. Recipients just add ice and enjoy. No additional purchases needed.
              </p>
            </details>

            <details className="group border-b border-neutral-200 pb-6">
              <summary className="flex justify-between items-center cursor-pointer text-lg font-semibold text-neutral-900 hover:text-gold-600 transition-colors">
                Do you deliver outside Austin?
                <svg className="w-5 h-5 text-gold-500 transform group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <p className="mt-4 text-neutral-600 leading-relaxed">
                We currently deliver throughout the Austin metro area, including downtown, South Congress, Lake Travis, Westlake, Round Rock, and Cedar Park. Contact us for specific delivery zone questions.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-gradient-to-r from-gold-500 to-gold-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif text-3xl sm:text-4xl mb-4 tracking-wide">
            Give the Perfect Christmas Gift
          </h2>
          <p className="text-xl mb-2 text-white/90">
            Order by December 20 for Guaranteed Delivery
          </p>
          <p className="text-lg mb-8 text-white/80">
            Free Delivery on Orders $100+
          </p>
          <a
            href="#featured-products"
            className="inline-block bg-white text-gold-600 hover:bg-neutral-100 px-8 py-4 text-lg font-medium tracking-widest transition-colors duration-200"
          >
            SHOP ALL COCKTAIL KITS
          </a>
        </div>
      </section>
    </div>
  )
}
