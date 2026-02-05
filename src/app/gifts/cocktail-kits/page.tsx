import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import ChristmasDeadlineBanner from '@/components/ChristmasDeadlineBanner'
import FeaturedKitCard from '@/components/gifts/FeaturedKitCard'
import LuxuryCard from '@/components/LuxuryCard'
import { prisma } from '@/lib/database/client'
import { transformToProduct } from '@/lib/products/transform'
import { Product } from '@/lib/types'

// Revalidate every 5 minutes
export const revalidate = 300

export const metadata: Metadata = {
  title: 'Christmas Cocktail Kit Gifts | Austin Delivery | Party On Delivery',
  description: 'Perfect Christmas gifts for Austin hosts. Premium cocktail kits make 20-30 drinks. Austin Rita, Skinny Margarita & more. Delivered to their door by December 22.',
  keywords: 'cocktail kit gifts Austin, Christmas alcohol gifts, margarita kit delivery, Austin party gifts, holiday host gifts',
  openGraph: {
    title: 'Perfect Christmas Cocktail Kits for Austin Hosts',
    description: 'Give the gift of 24 premium margaritas. Everything in one box, delivered to their door.',
    images: ['/images/products/branded-delivery-bag.webp'],
  },
}


export default async function CocktailKitsGiftPage() {
  // Fetch cocktail kit products from PostgreSQL
  const products = await prisma.product.findMany({
    where: {
      status: 'ACTIVE',
      productType: { equals: 'Cocktail Kits', mode: 'insensitive' },
    },
    include: {
      images: { orderBy: { position: 'asc' } },
      variants: { include: { image: true }, orderBy: { createdAt: 'asc' } },
      categories: { include: { category: true } },
    },
    orderBy: { title: 'asc' },
    take: 50,
  })

  const cocktailKits = products.map(p => transformToProduct(p))

  // Find specific featured kits by name patterns
  const findKit = (pattern: string) =>
    cocktailKits.find((p: Product) =>
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
  ].filter(Boolean) as Product[]

  // Get IDs of featured kits to exclude from secondary grid
  const featuredKitIds = new Set(featuredKits.map(kit => kit.id))

  // Get other cocktail kits not in featured list (exclude limes and other non-kit items)
  const otherKits = cocktailKits.filter((kit: Product) =>
    !featuredKitIds.has(kit.id) &&
    !kit.title.toLowerCase().includes('lime')
  )

  // Short, punchy subheadlines for each kit
  const kitSubheadlines: Record<string, string> = {
    'austin rita': 'Perfect for a day on the water.',
    'espresso martini': 'The after-dinner crowd-pleaser.',
    'hill country old': 'A refreshing Texas twist on a classic.',
    'apple cider aperol': 'The perfect fall cocktail.',
  }

  // Get short subheadline for a kit
  const getKitSubheadline = (product: Product): string => {
    const titleLower = product.title.toLowerCase()
    for (const [key, subheadline] of Object.entries(kitSubheadlines)) {
      if (titleLower.includes(key)) return subheadline
    }
    return 'Premium cocktail kit with everything you need.'
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Christmas Deadline Banner */}
      <ChristmasDeadlineBanner
        deadline="December 22"
        minOrderAmount={100}
        dismissible={true}
      />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-50 to-gray-100 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text */}
            <div className="text-center lg:text-left">
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-gray-900 mb-6">
                Still Need a Gift? We&apos;ve Got You.
              </h1>
              <p className="text-xl sm:text-2xl text-gray-700 mb-6 tracking-wide">
                Premium local spirits and ingredients delivered in time for Christmas
              </p>
              <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                Send what they really want, a complete party in a box. Includes everything needed to make bar-quality cocktails, delivered with a gift card and bottle bag included.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <a
                  href="#featured-products"
                  className="inline-block bg-yellow-500 hover:bg-brand-yellow text-gray-900 px-8 py-4 text-lg font-medium tracking-widest transition-colors duration-200"
                >
                  SHOP GIFT KITS
                </a>
                <a
                  href="#how-it-works"
                  className="inline-block border-2 border-gray-900 text-gray-900 hover:bg-gray-100 px-8 py-4 text-lg font-medium tracking-widest transition-colors duration-200"
                >
                  HOW IT WORKS
                </a>
              </div>
            </div>

            {/* Right Column - Hero Image */}
            <div className="relative">
              <div className="relative aspect-square rounded-lg overflow-hidden shadow-2xl">
                <Image
                  src={espressoMartiniKit?.images.edges[0]?.node.url || 'https://cdn.shopify.com/s/files/1/0538/1767/1858/files/Gemini_Generated_Image_tk6mbhtk6mbhtk6m.png?v=1764702134'}
                  alt={espressoMartiniKit?.title || 'Espresso Martini Cocktail Kit'}
                  fill
                  className="object-cover"
                  priority
                />
                {/* Badge */}
                <div className="absolute top-4 right-4 bg-yellow-500 text-gray-900 px-4 py-2 text-sm font-bold tracking-wider shadow-lg">
                  PERFECT GIFT
                </div>
              </div>

              {/* Trust Badges */}
              <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-gray-900">24</div>
                  <div className="text-sm text-gray-700">Drinks</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">$89.99</div>
                  <div className="text-sm text-gray-700">Complete Kit</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">72hrs</div>
                  <div className="text-sm text-gray-700">Delivery</div>
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
            <h2 className="font-heading text-3xl sm:text-4xl text-gray-900 mb-4">
              Top Gift Kits in Austin
            </h2>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              Curated cocktail kits featuring local ingredients and classic recipes. Each makes 16-30 drinks!
            </p>
          </div>

          <div className="space-y-20 lg:space-y-28">
            {featuredKits.map((kit, index) => (
              <FeaturedKitCard
                key={kit.id}
                product={kit}
                imagePosition={index % 2 === 0 ? 'left' : 'right'}
                description={getKitSubheadline(kit)}
              />
            ))}
          </div>

          {/* Secondary Grid - More Kits */}
          {otherKits.length > 0 && (
            <div className="mt-20">
              <h3 className="font-heading text-2xl sm:text-3xl text-gray-900 mb-8 text-center">
                More Cocktail Kits
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {otherKits.slice(0, 6).map((kit: Product) => {
                  const kitImage = kit.images.edges[0]?.node.url
                  const kitPrice = kit.priceRange.minVariantPrice
                  const kitVariant = kit.variants.edges[0]?.node
                  const kitComparePrice = kitVariant?.compareAtPrice

                  return (
                    <Link
                      key={kit.id}
                      href={`/products/${kit.handle}`}
                      className="group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300"
                    >
                      <div className="relative aspect-square overflow-hidden">
                        {kitImage ? (
                          <Image
                            src={kitImage}
                            alt={kit.title}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                            <svg className="w-16 h-16 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h4 className="font-heading text-lg text-gray-900 mb-2 group-hover:text-brand-yellow transition-colors font-semibold">
                          {kit.title}
                        </h4>
                        <div className="flex items-baseline gap-2">
                          {kitComparePrice && parseFloat(kitComparePrice.amount) > parseFloat(kitPrice.amount) && (
                            <span className="text-sm text-gray-500 line-through">
                              ${parseFloat(kitComparePrice.amount).toFixed(2)}
                            </span>
                          )}
                          <span className="text-lg font-medium text-gray-900">
                            ${parseFloat(kitPrice.amount).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

          <div className="text-center mt-16">
            <Link
              href="/products?filter=cocktail"
              className="inline-block border-2 border-gray-900 text-gray-900 hover:bg-gray-100 px-8 py-4 text-lg font-medium tracking-widest transition-colors duration-200"
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
            <h2 className="font-heading text-3xl sm:text-4xl text-gray-900 mb-4">
              Why Gift a Cocktail Kit?
            </h2>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              More thoughtful than wine, more fun than a gift card—cocktail kits are the perfect gift for anyone who loves to entertain.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <LuxuryCard>
              <div className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <svg className="w-12 h-12 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="font-heading text-xl text-gray-900 mb-2 font-semibold">
                  Everything in One Box
                </h3>
                <p className="text-gray-700">
                  No store trips needed. Premium tequila, mixers, and garnishes—all included and perfectly portioned.
                </p>
              </div>
            </LuxuryCard>

            <LuxuryCard>
              <div className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <svg className="w-12 h-12 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                  </svg>
                </div>
                <h3 className="font-heading text-xl text-gray-900 mb-2 font-semibold">
                  Makes 20-30 Drinks
                </h3>
                <p className="text-gray-700">
                  Way more value than a single bottle. Perfect for parties, gatherings, or enjoying over multiple occasions.
                </p>
              </div>
            </LuxuryCard>

            <LuxuryCard>
              <div className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <svg className="w-12 h-12 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="font-heading text-xl text-gray-900 mb-2 font-semibold">
                  Austin Local Ingredients
                </h3>
                <p className="text-gray-700">
                  Featuring Texas-made spirits and locally-sourced ingredients. Support Austin businesses with every gift.
                </p>
              </div>
            </LuxuryCard>

            <LuxuryCard>
              <div className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <svg className="w-12 h-12 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                </div>
                <h3 className="font-heading text-xl text-gray-900 mb-2 font-semibold">
                  Gift-Ready Delivery
                </h3>
                <p className="text-gray-700">
                  Delivered with gift card and bottle bag. Schedule delivery for any date, or send same-day.
                </p>
              </div>
            </LuxuryCard>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl sm:text-4xl text-gray-900 mb-4">
              How Cocktail Kit Gifting Works
            </h2>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              Sending a cocktail kit gift is easy. Here&apos;s how:
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-500 text-gray-900 text-2xl font-bold mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 tracking-wide">
                Choose Your Kit
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Browse our selection and pick the perfect cocktail kit. Austin Rita is our bestseller for a reason!
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-500 text-gray-900 text-2xl font-bold mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 tracking-wide">
                Add Gift Options
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Include a personalized gift card and upgrade to our premium gift bottle bag for elegant presentation.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-500 text-gray-900 text-2xl font-bold mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 tracking-wide">
                Schedule Delivery
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Enter their address and choose a delivery date. We&apos;ll handle the rest and deliver with care.
              </p>
            </div>
          </div>

          {/* Gift Options Info */}
          <div className="mt-12 max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
            <h3 className="text-2xl font-heading text-gray-900 mb-4 text-center tracking-wide">
              Gift Options Available
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <svg className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Gift Card</h4>
                  <p className="text-sm text-gray-700">Add a personalized message on a beautiful card included with the delivery.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <svg className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Gift Bottle Bag</h4>
                  <p className="text-sm text-gray-700">Upgrade to elegant gift bag presentation for premium bottles in the kit.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl sm:text-4xl text-gray-900 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              Real reviews from Austin customers who&apos;ve gifted our cocktail kits
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Review 1 */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 mb-4 leading-relaxed">
                &ldquo;Ordered the Austin Rita kit for my sister&apos;s birthday. She loved it! The presentation was beautiful and it made enough margaritas for her whole party. Way better than just bringing a bottle of wine.&rdquo;
              </p>
              <div className="border-t border-gray-200 pt-4">
                <p className="font-medium text-gray-900">Sarah M.</p>
                <p className="text-sm text-gray-500">Austin, TX</p>
              </div>
            </div>

            {/* Review 2 */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 mb-4 leading-relaxed">
                &ldquo;Perfect host gift! I sent the Espresso Martini kit to friends who just moved into their new home. They were so impressed. The delivery was on time and the quality of everything was top-notch.&rdquo;
              </p>
              <div className="border-t border-gray-200 pt-4">
                <p className="font-medium text-gray-900">Mike R.</p>
                <p className="text-sm text-gray-500">Round Rock, TX</p>
              </div>
            </div>

            {/* Review 3 */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 mb-4 leading-relaxed">
                &ldquo;Saved me so much stress during the holidays! Ordered cocktail kits for 3 different people and they all arrived beautifully packaged. Will definitely order again next year.&rdquo;
              </p>
              <div className="border-t border-gray-200 pt-4">
                <p className="font-medium text-gray-900">Jennifer L.</p>
                <p className="text-sm text-gray-500">Westlake, TX</p>
              </div>
            </div>
          </div>

          {/* Google Review Badge */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-3 bg-white border border-gray-200 rounded-full px-6 py-3 shadow-sm">
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-gray-700 font-medium">4.9 Rating on Google</span>
              <span className="text-gray-500">|</span>
              <span className="text-gray-500 text-sm">50+ Reviews</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl sm:text-4xl text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-6">
            <details className="group border-b border-gray-200 pb-6">
              <summary className="flex justify-between items-center cursor-pointer text-lg font-semibold text-gray-900 hover:text-brand-yellow transition-colors">
                When is the last day to order for Christmas delivery?
                <svg className="w-5 h-5 text-yellow-500 transform group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <p className="mt-4 text-gray-700 leading-relaxed">
                Order by <strong>December 22</strong> to guarantee delivery before Christmas. We schedule deliveries with 72-hour advance notice to ensure availability and quality service.
              </p>
            </details>

            <details className="group border-b border-gray-200 pb-6">
              <summary className="flex justify-between items-center cursor-pointer text-lg font-semibold text-gray-900 hover:text-brand-yellow transition-colors">
                Can I add a personalized gift message?
                <svg className="w-5 h-5 text-yellow-500 transform group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <p className="mt-4 text-gray-700 leading-relaxed">
                Yes! During checkout, you can add a personalized gift card with your message. We&apos;ll include it with the delivery in an elegant presentation.
              </p>
            </details>

            <details className="group border-b border-gray-200 pb-6">
              <summary className="flex justify-between items-center cursor-pointer text-lg font-semibold text-gray-900 hover:text-brand-yellow transition-colors">
                What if the recipient isn&apos;t home for delivery?
                <svg className="w-5 h-5 text-yellow-500 transform group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <p className="mt-4 text-gray-700 leading-relaxed">
                We&apos;ll contact the recipient to arrange a convenient delivery time. You can also provide special delivery instructions during checkout for safe drop-off locations.
              </p>
            </details>

            <details className="group border-b border-gray-200 pb-6">
              <summary className="flex justify-between items-center cursor-pointer text-lg font-semibold text-gray-900 hover:text-brand-yellow transition-colors">
                Is everything included in the cocktail kit?
                <svg className="w-5 h-5 text-yellow-500 transform group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <p className="mt-4 text-gray-700 leading-relaxed">
                Yes! Each kit includes premium spirits, mixers, garnishes, and everything needed to make 20-30 cocktails. Recipients just add ice and enjoy. No additional purchases needed.
              </p>
            </details>

            <details className="group border-b border-gray-200 pb-6">
              <summary className="flex justify-between items-center cursor-pointer text-lg font-semibold text-gray-900 hover:text-brand-yellow transition-colors">
                Do you deliver outside Austin?
                <svg className="w-5 h-5 text-yellow-500 transform group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <p className="mt-4 text-gray-700 leading-relaxed">
                We currently deliver throughout the Austin metro area, including downtown, South Congress, Lake Travis, Westlake, Round Rock, and Cedar Park. Contact us for specific delivery zone questions.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-gradient-to-r from-yellow-500 to-brand-yellow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-3xl sm:text-4xl text-gray-900 mb-4">
            Give the Perfect Christmas Gift
          </h2>
          <p className="text-xl mb-2 text-gray-900">
            Order by December 22 for Guaranteed Delivery
          </p>
          <p className="text-lg mb-8 text-gray-700">
            Free Delivery on Orders $100+
          </p>
          <a
            href="#featured-products"
            className="inline-block bg-gray-900 text-white hover:bg-gray-900 px-8 py-4 text-lg font-medium tracking-widest transition-colors duration-200"
          >
            SHOP ALL COCKTAIL KITS
          </a>
        </div>
      </section>
    </div>
  )
}
