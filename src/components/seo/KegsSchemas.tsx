import { generateFAQSchema, generateEventSchema } from '@/lib/seo/schemas';

/**
 * Server-side schemas for kegs page
 * Uses regular script tags (not Next.js Script component) to ensure schemas
 * are in initial HTML for search engine crawlers
 *
 * Targets keywords: "keg delivery austin", "beer keg austin", "keg rental austin"
 */
export default function KegsSchemas() {
  // FAQ Data for Schema - optimized for keg-related search queries
  const faqs = [
    {
      question: "How quickly can I get a keg delivered in Austin?",
      answer: "We require 72 hours advance notice for all keg deliveries to ensure availability and proper temperature. For guaranteed delivery at a specific time, book early. Same-day delivery may be available for in-stock kegs based on capacity."
    },
    {
      question: "What's the difference between 1/2, 1/4, and 1/6 barrel kegs?",
      answer: "A 1/2 barrel (full-size keg) holds 15.5 gallons and serves about 165 beers - perfect for 50-80 guests. A 1/4 barrel (pony keg) holds 7.75 gallons and serves 82 beers for 25-40 guests. A 1/6 barrel (sixtel) holds 5.16 gallons and serves 55 beers for 15-25 guests."
    },
    {
      question: "Do you provide taps and ice tubs with keg delivery?",
      answer: "Yes! We offer equipment rentals separately: standard party taps ($15/day), CO2 dispensing systems ($50/day), ice tubs ($25/day), and jockey boxes ($75/day). Add equipment to your keg order for a complete party setup."
    },
    {
      question: "What areas of Austin do you deliver kegs to?",
      answer: "We deliver kegs throughout Austin including Downtown, Lake Travis, Westlake, The Domain, Bee Cave, Lakeway, South Austin, East Austin, Mueller, and Spicewood. We do not currently deliver to Round Rock, Cedar Park, or Dripping Springs."
    },
    {
      question: "Is there a keg deposit? How do returns work?",
      answer: "Yes, there's a $50 keg deposit that's fully refunded when you return the empty keg within 7 days. We'll coordinate pickup at a time that works for you, or you can drop off at our location on North Lamar Boulevard."
    },
    {
      question: "Can you deliver kegs to Lake Travis boat docks?",
      answer: "Absolutely! We specialize in Lake Travis marina and dock deliveries. We deliver to Lakeway Marina, Point Venture, Volente Beach, Hudson Bend, and other Lake Travis locations. Coordinate with your boat rental for slip number and arrival time."
    },
    {
      question: "How long does a keg stay fresh after tapping?",
      answer: "With a standard party pump, a keg stays fresh for 8-12 hours - perfect for single-day events. With a CO2 system (available for rental), kegs stay fresh for 2-3 weeks when properly refrigerated. For best taste and carbonation, consume the same day when using a pump tap."
    },
    {
      question: "What kegs do you have in stock?",
      answer: "We stock Miller Lite, Corona Extra, and Austin BeerWorks Pearl Snap kegs. For other brands like Bud Light, Modelo, Shiner, Dos Equis, and local Austin craft beers, contact us to request a quote - we can source most brands with advance notice."
    }
  ];

  // Product schema for keg sizes
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Beer Keg Sizes for Delivery',
    description: 'Beer kegs available for delivery in Austin, TX',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        item: {
          '@type': 'Product',
          name: '1/2 Barrel Keg (Full Size)',
          description: '15.5 gallons, serves approximately 165 twelve-ounce beers. Best for parties of 50-80 guests.',
          offers: {
            '@type': 'Offer',
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
            seller: { '@type': 'Organization', name: 'Party On Delivery' }
          }
        }
      },
      {
        '@type': 'ListItem',
        position: 2,
        item: {
          '@type': 'Product',
          name: '1/4 Barrel Keg (Pony Keg)',
          description: '7.75 gallons, serves approximately 82 twelve-ounce beers. Best for parties of 25-40 guests.',
          offers: {
            '@type': 'Offer',
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
            seller: { '@type': 'Organization', name: 'Party On Delivery' }
          }
        }
      },
      {
        '@type': 'ListItem',
        position: 3,
        item: {
          '@type': 'Product',
          name: '1/6 Barrel Keg (Sixtel)',
          description: '5.16 gallons, serves approximately 55 twelve-ounce beers. Best for parties of 15-25 guests.',
          offers: {
            '@type': 'Offer',
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
            seller: { '@type': 'Organization', name: 'Party On Delivery' }
          }
        }
      }
    ]
  };

  // Local business schema with delivery service
  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'DeliveryService'],
    '@id': 'https://partyondelivery.com/kegs#business',
    name: 'Party On Delivery - Austin Keg Delivery',
    description: 'Cold keg delivery for parties, weddings, tailgates, and events in Austin TX. Beer kegs, tap rentals, and equipment.',
    url: 'https://partyondelivery.com/kegs',
    telephone: '(737) 371-9700',
    priceRange: '$$',
    image: 'https://partyondelivery.com/images/pod-logo-2025.svg',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '7600 North Lamar Boulevard #A2',
      addressLocality: 'Austin',
      addressRegion: 'TX',
      postalCode: '78752',
      addressCountry: 'US'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '30.3434',
      longitude: '-97.7221'
    },
    areaServed: [
      { '@type': 'City', name: 'Austin' },
      { '@type': 'Place', name: 'Lake Travis' },
      { '@type': 'Place', name: 'Westlake' },
      { '@type': 'Place', name: 'Bee Cave' },
      { '@type': 'Place', name: 'Lakeway' },
      { '@type': 'Place', name: 'Spicewood' }
    ],
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '10:00',
        closes: '21:00'
      }
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Keg Delivery Services',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Keg Delivery',
            description: 'Cold beer keg delivery to your home, venue, or dock'
          }
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Tap & Equipment Rental',
            description: 'Party taps, CO2 systems, ice tubs, and jockey boxes for rent'
          }
        }
      ]
    }
  };

  const faqSchema = generateFAQSchema(faqs);
  const eventSchema = generateEventSchema('keg');

  return (
    <>
      {/* FAQ Schema - static HTML for crawlers */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Event Schema - static HTML for crawlers */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchema) }}
      />

      {/* Product Schema - keg sizes */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />

      {/* LocalBusiness Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
    </>
  );
}
