import Hero from '@/components/Hero'
import Section from '@/components/Section'
import Link from 'next/link'

export default function LakeTravisPage() {
  return (
    <>
      <Hero
        title="Lake Travis Delivery"
        subtitle="Boat Parties Done Right"
        description="Premium spirits delivered to your boat or lakeside venue"
        backgroundImage="/images/hero/lake-travis-yacht-sunset.webp"
        height="medium"
      />

      <Section>
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 mb-12">
            <div>
              <h2 className="font-heading text-3xl text-gray-900 mb-4">
                Austin&apos;s Ultimate Party Destination
              </h2>
              <p className="text-gray-900/70 mb-6">
                From bachelor parties at Devil&apos;s Cove to sunset cruises at The Oasis, we&apos;re Lake Travis&apos;s 
                premier alcohol delivery service. We know every marina, every cove, and every party spot.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-brand-blue font-bold">⛵</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Boat Delivery Specialists</h3>
                    <p className="text-sm text-gray-900/60">Direct to your slip or coordinate with captain</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-brand-blue font-bold">⏰</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">35-45 Minute Delivery</h3>
                    <p className="text-sm text-gray-900/60">Worth the wait for premium service</p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-3">🌟 Lake Travis Pro Tip</h4>
                <p className="text-sm text-gray-900/70">
                  Order before you launch! We can meet you at the marina or deliver to your boat 
                  once you&apos;re anchored. Popular coves get busy - order early on weekends.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-50 rounded-lg p-6">
                <h3 className="font-heading text-xl text-gray-900 mb-4">Marina Partners</h3>
                <div className="grid grid-cols-2 gap-4">
                  <ul className="space-y-2 text-sm text-gray-900/70">
                    <li>✓ Lakeway Marina</li>
                    <li>✓ Volente Beach</li>
                    <li>✓ Sail & Ski Marina</li>
                    <li>✓ Rough Hollow Marina</li>
                  </ul>
                  <ul className="space-y-2 text-sm text-gray-900/70">
                    <li>✓ Hudson Bend</li>
                    <li>✓ Point Venture</li>
                    <li>✓ Lago Vista</li>
                    <li>✓ Marina on Lake Travis</li>
                  </ul>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="font-heading text-xl text-gray-900 mb-4">Popular Party Coves</h3>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-2">
                    <span className="text-brand-blue mt-1">🌊</span>
                    <div>
                      <span className="font-semibold text-gray-900">Devil&apos;s Cove</span>
                      <p className="text-xs text-gray-900/60">The legendary party spot</p>
                    </div>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-brand-blue mt-1">🌊</span>
                    <div>
                      <span className="font-semibold text-gray-900">Hippie Hollow</span>
                      <p className="text-xs text-gray-900/60">Austin&apos;s famous clothing-optional park</p>
                    </div>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-brand-blue mt-1">🌊</span>
                    <div>
                      <span className="font-semibold text-gray-900">Paradise Cove</span>
                      <p className="text-xs text-gray-900/60">Family-friendly party spot</p>
                    </div>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-brand-blue mt-1">🌊</span>
                    <div>
                      <span className="font-semibold text-gray-900">Starnes Island</span>
                      <p className="text-xs text-gray-900/60">Great for large groups</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Boat Party Packages */}
          <div className="mb-12">
            <h3 className="font-heading text-2xl text-gray-900 text-center mb-8">Lake Travis Party Packages</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h4 className="font-semibold text-brand-blue mb-2">Boat Day Essentials</h4>
                <p className="text-2xl font-bold text-gray-900 mb-3">$299</p>
                <ul className="space-y-2 text-sm text-gray-900/70 mb-4">
                  <li>✓ Premium vodka & rum</li>
                  <li>✓ Seltzers & beer selection</li>
                  <li>✓ Mixers & garnishes</li>
                  <li>✓ Ice & cooler</li>
                  <li>✓ Cups & supplies</li>
                </ul>
                <p className="text-xs text-gray-900/60">Perfect for 8-10 people</p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-50 rounded-lg shadow-md p-6">
                <div className="bg-brand-yellow text-gray-900 text-xs font-bold px-2 py-1 rounded inline-block mb-2">
                  MOST POPULAR
                </div>
                <h4 className="font-semibold text-brand-blue mb-2">Bachelor/ette Party</h4>
                <p className="text-2xl font-bold text-gray-900 mb-3">$599</p>
                <ul className="space-y-2 text-sm text-gray-900/70 mb-4">
                  <li>✓ Top-shelf spirits</li>
                  <li>✓ Champagne & prosecco</li>
                  <li>✓ Custom shot selection</li>
                  <li>✓ Full bar setup</li>
                  <li>✓ Party decorations</li>
                  <li>✓ Floating beer pong</li>
                </ul>
                <p className="text-xs text-gray-900/60">Perfect for 15-20 people</p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h4 className="font-semibold text-brand-blue mb-2">Yacht Party Premium</h4>
                <p className="text-2xl font-bold text-gray-900 mb-3">$999+</p>
                <ul className="space-y-2 text-sm text-gray-900/70 mb-4">
                  <li>✓ Ultra-premium spirits</li>
                  <li>✓ Craft cocktail setup</li>
                  <li>✓ Professional bartender</li>
                  <li>✓ Custom menu</li>
                  <li>✓ Full service</li>
                  <li>✓ Cleanup included</li>
                </ul>
                <p className="text-xs text-gray-900/60">Custom quote for your group</p>
              </div>
            </div>
          </div>

          {/* Safety Notice */}
          <div className="bg-dark text-white rounded-lg p-8">
            <h3 className="font-heading text-xl mb-4">Lake Safety is Party Safety</h3>
            <p className="text-white/80 mb-6">
              Have fun but stay safe! We support responsible boating and never deliver to operators 
              who appear intoxicated. Designate a sober captain and party on!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/order" className="btn-primary bg-white text-gray-900 hover:bg-gray-100 text-center">
                Book Lake Delivery
              </Link>
              <a href="tel:7373719700" className="btn-outline border-white text-white hover:bg-white hover:text-gray-900 text-center">
                Call for Boat Delivery
              </a>
            </div>
          </div>
        </div>
      </Section>
    </>
  )
}