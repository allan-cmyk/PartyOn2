import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import ChristmasDeadlineBanner from '@/components/ChristmasDeadlineBanner'
import FeaturedKitCard from '@/components/gifts/FeaturedKitCard'
import LuxuryCard from '@/components/LuxuryCard'
import { shopifyFetch } from '@/lib/shopify/client'
import { PRODUCTS_GRID_QUERY } from '@/lib/shopify/queries/products'
import { ShopifyProduct } from '@/lib/shopify/types'

// Force dynamic rendering to ensure environment variables are available
export const dynamic = 'force-dynamic'

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

// Featured kit descriptions for the landing page
const featuredKitDescriptions: Record<string, string> = {
  'austin rita': 'Our bestselling margarita kit! Makes 24 authentic Austin-style margaritas with premium tequila, fresh lime, and all the fixings. Perfect for parties or a great night in.',
  'espresso martini': 'A modern classic, Texas style! Made with local vodka, rich coffee liqueur, and smooth Mexican vanilla espresso. Makes 16 elegant cocktails.',
  'hill country old': 'Light, fun, and featuring a great local cider. This refreshing Old Fashioned variation is the ultimate aperitivo for any occasion.',
  'old-fashioned': 'The timeless cocktail done right. Premium bourbon, aromatic bitters, and a touch of sweetness. A sophisticated gift for whiskey lovers.',
  'apple cider aperol': 'The perfect fall cocktail! Crisp apple cider meets Italian Aperol for a refreshing, bittersweet spritz. Seasonal and sophisticated.',
  'aperol spritz': 'The iconic Italian aperitivo! Bright, bubbly, and perfectly balanced. A crowd-pleasing classic that never goes out of style.',
}

export default async function CocktailKitsGiftPage() {
  // Fetch cocktail kit products from Shopify
  const response = await shopifyFetch<{ products: { edges: Array<{ node: ShopifyProduct }> } }>({
    query: PRODUCTS_GRID_QUERY,
    variables: { first: 50 }
  })

  const allProducts = response.products.edges.map((edge: { node: ShopifyProduct }) => edge.node)

  // Filter for cocktail kits
  const cocktailKits = allProducts.filter((product: ShopifyProduct) =>
    product.productType?.toLowerCase().includes('cocktail') ||
    product.title.toLowerCase().includes('kit') ||
    product.tags?.some(tag => tag.toLowerCase().includes('cocktail'))
  )

  // Find specific featured kits by name patterns
  const findKit = (pattern: string) =>
    cocktailKits.find((p: ShopifyProduct) =>
      p.title.toLowerCase().includes(pattern.toLowerCase())
    )

  // Get 4 specific featured kits
  const austinRitaKit = findKit('austin rita party pitcher')
  const espressoMartiniKit = findKit('espresso martini cocktail kit')
  const oldFashionedKit = findKit('hill country old-fashioned') || findKit('hill country old')
  const aperolSpritzKit = findKit('apple cider aperol spritz')

  // Build array of 4 featured kits
  const featuredKits = [
    austinRitaKit,
    espressoMartiniKit,
    oldFashionedKit,
    aperolSpritzKit
  ].filter(Boolean) as ShopifyProduct[]

  // Get description for a kit
  const getKitDescription = (product: ShopifyProduct): string => {
    const titleLower = product.title.toLowerCase()
    for (const [key, desc] of Object.entries(featuredKitDescriptions)) {
      if (titleLower.includes(key)) return desc
    }
    return product.description?.slice(0, 200) || 'Premium cocktail kit with everything you need.'
  }

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
              {featuredKits[0] && (
                <div className="relative aspect-square rounded-lg overflow-hidden shadow-2xl">
                  <Image
                    src={featuredKits[0].images.edges[0]?.node.url || '/images/products/classic-austin-margarita-kit.webp'}
                    alt={featuredKits[0].title}
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

      {/* Featured Cocktail Kits - Split Layout */}
      <section id="featured-products" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl sm:text-4xl text-neutral-900 mb-4 tracking-wide">
              Top Gift Kits in Austin
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Curated cocktail kits featuring local ingredients and classic recipes. Each makes 16-30 drinks!
            </p>
          </div>

          <div className="space-y-20 lg:space-y-28">
            {featuredKits.map((kit, index) => (
              <FeaturedKitCard
                key={kit.id}
                product={kit}
                imagePosition={index % 2 === 0 ? 'left' : 'right'}
                description={getKitDescription(kit)}
              />
            ))}
          </div>

          <div className="text-center mt-16">
            <Link
              href="/products?filter=cocktail"
              className="inline-block border-2 border-gold-500 text-gold-600 hover:bg-gold-50 px-8 py-4 text-lg font-medium tracking-widest transition-colors duration-200"
            >
              VIEW ALL COCKTAIL KITS
            </Link>
          </div>
        </div>
      </section>

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
            <LuxuryCard>
              <div className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <svg className="w-12 h-12 text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="font-serif text-xl text-neutral-900 mb-2 tracking-wide">
                  Everything in One Box
                </h3>
                <p className="text-neutral-600">
                  No store trips needed. Premium tequila, mixers, and garnishes—all included and perfectly portioned.
                </p>
              </div>
            </LuxuryCard>

            <LuxuryCard>
              <div className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <svg className="w-12 h-12 text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                  </svg>
                </div>
                <h3 className="font-serif text-xl text-neutral-900 mb-2 tracking-wide">
                  Makes 20-30 Drinks
                </h3>
                <p className="text-neutral-600">
                  Way more value than a single bottle. Perfect for parties, gatherings, or enjoying over multiple occasions.
                </p>
              </div>
            </LuxuryCard>

            <LuxuryCard>
              <div className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <svg className="w-12 h-12 text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="font-serif text-xl text-neutral-900 mb-2 tracking-wide">
                  Austin Local Ingredients
                </h3>
                <p className="text-neutral-600">
                  Featuring Texas-made spirits and locally-sourced ingredients. Support Austin businesses with every gift.
                </p>
              </div>
            </LuxuryCard>

            <LuxuryCard>
              <div className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <svg className="w-12 h-12 text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                </div>
                <h3 className="font-serif text-xl text-neutral-900 mb-2 tracking-wide">
                  Gift-Ready Delivery
                </h3>
                <p className="text-neutral-600">
                  Delivered with gift card and bottle bag. Schedule delivery for any date, or send same-day.
                </p>
              </div>
            </LuxuryCard>
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
              Sending a cocktail kit gift is easy. Here&apos;s how:
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
                Enter their address and choose a delivery date. We&apos;ll handle the rest and deliver with care.
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
                Yes! During checkout, you can add a personalized gift card with your message. We&apos;ll include it with the delivery in an elegant presentation.
              </p>
            </details>

            <details className="group border-b border-neutral-200 pb-6">
              <summary className="flex justify-between items-center cursor-pointer text-lg font-semibold text-neutral-900 hover:text-gold-600 transition-colors">
                What if the recipient isn&apos;t home for delivery?
                <svg className="w-5 h-5 text-gold-500 transform group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <p className="mt-4 text-neutral-600 leading-relaxed">
                We&apos;ll contact the recipient to arrange a convenient delivery time. You can also provide special delivery instructions during checkout for safe drop-off locations.
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
