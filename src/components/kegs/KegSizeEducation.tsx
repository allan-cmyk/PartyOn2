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
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        <ScrollRevealCSS duration={800} y={20} className="text-center mb-10 md:mb-16">
          <h2 className="font-serif font-light text-3xl md:text-5xl text-gray-900 mb-4 tracking-[0.1em]">
            Choose Your Keg Size
          </h2>
          <div className="w-16 h-px bg-gold-600 mx-auto mb-4 md:mb-6" />
          <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto">
            Not sure how much beer you need? Here&apos;s a quick guide to help you
            pick the right keg size for your party.
          </p>
        </ScrollRevealCSS>

        {/* Keg Size Table */}
        <ScrollRevealCSS duration={800} y={20}>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Table Header */}
            <div className="bg-gray-900 text-white">
              <div className="grid grid-cols-4 text-center">
                <div className="py-4 px-2 md:px-4 text-sm md:text-lg font-semibold">Size</div>
                <div className="py-4 px-2 md:px-4 text-sm md:text-lg font-semibold">Gallons</div>
                <div className="py-4 px-2 md:px-4 text-sm md:text-lg font-semibold">Beers</div>
                <div className="py-4 px-2 md:px-4 text-sm md:text-lg font-semibold">Best For</div>
              </div>
            </div>

            {/* Table Rows */}
            {KEG_SIZES.map((keg, index) => (
              <div
                key={keg.name}
                className={`grid grid-cols-4 text-center items-center border-b border-gray-100 last:border-b-0 ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                } ${keg.popular ? 'ring-2 ring-inset ring-gold-500' : ''}`}
              >
                {/* Size */}
                <div className="py-5 md:py-6 px-2 md:px-4">
                  <div className="text-lg md:text-2xl font-bold text-gray-900">{keg.name}</div>
                  <div className="text-xs md:text-sm text-gray-500">{keg.altName}</div>
                  {keg.popular && (
                    <span className="inline-block mt-1 bg-gold-600 text-gray-900 px-2 py-0.5 rounded text-xs font-medium">
                      POPULAR
                    </span>
                  )}
                </div>

                {/* Gallons */}
                <div className="py-5 md:py-6 px-2 md:px-4">
                  <div className="text-xl md:text-3xl font-bold text-gray-900">{keg.gallons}</div>
                  <div className="text-xs md:text-sm text-gray-500">gal</div>
                </div>

                {/* Servings */}
                <div className="py-5 md:py-6 px-2 md:px-4">
                  <div className="text-xl md:text-3xl font-bold text-gray-900">~{keg.servings}</div>
                  <div className="text-xs md:text-sm text-gray-500">12oz</div>
                </div>

                {/* Guest Range */}
                <div className="py-5 md:py-6 px-2 md:px-4">
                  <div className="text-base md:text-xl font-bold text-gold-600">{keg.guestRange}</div>
                </div>
              </div>
            ))}
          </div>
        </ScrollRevealCSS>

        {/* Pro Tip */}
        <ScrollRevealCSS duration={800} y={20} delay={200} className="mt-8 md:mt-12">
          <div className="bg-white rounded-lg p-5 md:p-6 border border-gray-200 text-center">
            <p className="text-base md:text-lg text-gray-600">
              <span className="font-bold text-gray-900">Pro Tip:</span> Plan
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
