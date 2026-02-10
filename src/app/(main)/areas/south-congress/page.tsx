import Hero from '@/components/Hero'
import Section from '@/components/Section'
import Link from 'next/link'

export default function SouthCongressPage() {
  return (
    <>
      <Hero
        title="South Congress (SoCo) Delivery"
        subtitle="Keep Austin Weird, Keep Austin Partying"
        description="Fast delivery to Austin's most iconic neighborhood"
        backgroundImage="/images/hero/austin-skyline-golden-hour.webp"
        height="medium"
      />

      <Section>
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 mb-12">
            <div>
              <h2 className="font-heading text-3xl text-gray-900 mb-4">
                The Soul of Austin
              </h2>
              <p className="text-gray-900/70 mb-6">
                From the quirky shops to legendary music venues, South Congress embodies everything 
                that makes Austin special. We deliver that same authentic spirit with every order.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-brand-blue font-bold">🕰️</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">20-30 Minute Delivery</h3>
                    <p className="text-sm text-gray-900/60">Quick service to SoCo and surrounding areas</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-brand-blue font-bold">🎸</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Music Venue Partners</h3>
                    <p className="text-sm text-gray-900/60">Special service for shows and events</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-50 rounded-lg p-8">
              <h3 className="font-heading text-xl text-gray-900 mb-4">SoCo Hotspots We Serve</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Neighborhoods</h4>
                  <ul className="space-y-1 text-sm text-gray-900/70">
                    <li>• South Congress Ave</li>
                    <li>• Travis Heights</li>
                    <li>• Bouldin Creek</li>
                    <li>• Zilker</li>
                    <li>• Barton Hills</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Landmarks</h4>
                  <ul className="space-y-1 text-sm text-gray-900/70">
                    <li>• &quot;I Love You So Much&quot; Wall</li>
                    <li>• Continental Club</li>
                    <li>• South Congress Hotel</li>
                    <li>• Zilker Park</li>
                    <li>• Barton Springs Pool</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Local Favorites */}
          <div className="mb-12">
            <h3 className="font-heading text-2xl text-gray-900 text-center mb-8">SoCo Style Packages</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="text-3xl mb-4">🎶</div>
                <h4 className="font-semibold text-gray-900 mb-2">Live Music Night</h4>
                <p className="text-sm text-gray-900/70 mb-4">
                  Pre-show drinks delivered to your Airbnb or hotel before hitting the Continental Club
                </p>
                <p className="text-brand-blue font-semibold">Popular Choice</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="text-3xl mb-4">🌳</div>
                <h4 className="font-semibold text-gray-900 mb-2">Zilker Park Picnic</h4>
                <p className="text-sm text-gray-900/70 mb-4">
                  Refreshing drinks for your afternoon at Zilker or Barton Springs Pool
                </p>
                <p className="text-brand-blue font-semibold">Summer Favorite</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="text-3xl mb-4">🎉</div>
                <h4 className="font-semibold text-gray-900 mb-2">Boutique Hotel Party</h4>
                <p className="text-sm text-gray-900/70 mb-4">
                  Premium service for guests at Hotel San José, South Congress Hotel, and more
                </p>
                <p className="text-brand-blue font-semibold">VIP Service</p>
              </div>
            </div>
          </div>

          {/* Local Events */}
          <div className="bg-light rounded-lg p-8 mb-12">
            <h3 className="font-heading text-2xl text-gray-900 text-center mb-6">SoCo Event Calendar</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Annual Events We Love</h4>
                <ul className="space-y-2">
                  <li className="flex items-center space-x-2">
                    <span className="text-brand-blue">🎪</span>
                    <span className="text-gray-900/70">First Thursday on South Congress</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-brand-blue">🎵</span>
                    <span className="text-gray-900/70">Continental Club Anniversary</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-brand-blue">🎆</span>
                    <span className="text-gray-900/70">Austin City Limits Festival</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-brand-blue">🎄</span>
                    <span className="text-gray-900/70">SoCo Holiday Stroll</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Weekly Happenings</h4>
                <ul className="space-y-2">
                  <li className="flex items-center space-x-2">
                    <span className="text-brand-blue">🌟</span>
                    <span className="text-gray-900/70">Tuesday: Blues at Continental</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-brand-blue">🌟</span>
                    <span className="text-gray-900/70">Thursday: Gallery Night</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-brand-blue">🌟</span>
                    <span className="text-gray-900/70">Saturday: Farmers Market</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-brand-blue">🌟</span>
                    <span className="text-gray-900/70">Sunday: Vintage Shopping</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Local Vibe */}
          <div className="bg-gradient-to-r from-brand-blue to-brand-blue text-white rounded-lg p-8 text-center">
            <h3 className="font-heading text-2xl mb-4">Keep SoCo Weird</h3>
            <p className="text-white/90 mb-6 max-w-2xl mx-auto">
              We&apos;re proud to serve the neighborhood that defines Austin&apos;s creative spirit. From food 
              trailers to boutique hotels, we deliver the party supplies that keep SoCo celebrations 
              authentically Austin.
            </p>
            <Link href="/book-now" className="btn-primary bg-white text-gray-900 hover:bg-gray-100">
              Order SoCo Delivery
            </Link>
          </div>
        </div>
      </Section>
    </>
  )
}