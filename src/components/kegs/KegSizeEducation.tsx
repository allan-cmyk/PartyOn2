'use client';

import ScrollRevealCSS from '@/components/ui/ScrollRevealCSS';

/**
 * Keg size education component - explains barrel sizes and servings
 * Helps customers choose the right keg size for their party
 */

interface KegSize {
  name: string;
  altName: string;
  gallons: number;
  servings: number;
  guestRange: string;
  popular?: boolean;
}

const KEG_SIZES: KegSize[] = [
  {
    name: '1/2 Barrel',
    altName: 'Full-Size Keg',
    gallons: 15.5,
    servings: 165,
    guestRange: '50-80 guests',
    popular: true,
  },
  {
    name: '1/4 Barrel',
    altName: 'Pony Keg',
    gallons: 7.75,
    servings: 82,
    guestRange: '25-40 guests',
  },
  {
    name: '1/6 Barrel',
    altName: 'Sixtel',
    gallons: 5.16,
    servings: 55,
    guestRange: '15-25 guests',
  },
];

export default function KegSizeEducation() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-6xl mx-auto px-8">
        <ScrollRevealCSS duration={800} y={20} className="text-center mb-16">
          <h2 className="font-serif font-light text-4xl md:text-5xl text-gray-900 mb-4 tracking-[0.1em]">
            Choose Your Keg Size
          </h2>
          <div className="w-16 h-px bg-gold-600 mx-auto mb-6" />
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Not sure how much beer you need? Here&apos;s a quick guide to help you
            pick the right keg size for your party.
          </p>
        </ScrollRevealCSS>

        {/* Keg Size Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {KEG_SIZES.map((keg, index) => (
            <ScrollRevealCSS
              key={keg.name}
              duration={800}
              y={20}
              delay={index * 100}
            >
              <div
                className={`relative bg-white rounded-lg p-8 shadow-lg border-2 transition-all duration-300 hover:shadow-xl ${
                  keg.popular
                    ? 'border-gold-600'
                    : 'border-gray-200 hover:border-gold-300'
                }`}
              >
                {keg.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gold-600 text-gray-900 px-4 py-1 rounded-full text-xs font-medium tracking-[0.1em]">
                      MOST POPULAR
                    </span>
                  </div>
                )}

                {/* Keg Icon */}
                <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-10 h-10 text-gold-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>

                <h3 className="font-serif text-2xl text-gray-900 mb-1 tracking-[0.1em] text-center">
                  {keg.name}
                </h3>
                <p className="text-gray-500 text-sm text-center mb-6">
                  {keg.altName}
                </p>

                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Gallons</span>
                    <span className="font-medium text-gray-900">
                      {keg.gallons}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">12oz Beers</span>
                    <span className="font-medium text-gray-900">
                      ~{keg.servings}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Best For</span>
                    <span className="font-medium text-gold-600">
                      {keg.guestRange}
                    </span>
                  </div>
                </div>
              </div>
            </ScrollRevealCSS>
          ))}
        </div>

        {/* Pro Tip */}
        <ScrollRevealCSS duration={800} y={20} delay={400} className="mt-12">
          <div className="bg-white rounded-lg p-6 border border-gray-200 max-w-2xl mx-auto text-center">
            <p className="text-gray-600">
              <span className="font-medium text-gray-900">Pro Tip:</span> Plan
              for 2 drinks per person in the first hour, then 1 drink per hour
              after. For a 4-hour party with 50 guests, one 1/2 barrel is
              usually perfect.
            </p>
          </div>
        </ScrollRevealCSS>
      </div>
    </section>
  );
}
