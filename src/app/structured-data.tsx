export const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'Party On Delivery',
  description: "Austin's premier alcohol delivery service for weddings, boat parties, and special events",
  url: 'https://partyondelivery.com',
  telephone: '(737) 371-9700',
  email: 'info@partyondelivery.com',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Austin',
    addressRegion: 'TX',
    addressCountry: 'US',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 30.2672,
    longitude: -97.7431,
  },
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday'
    ],
    opens: '10:00',
    closes: '23:00',
  },
  priceRange: '$$',
  servesCuisine: 'Alcohol Delivery',
  areaServed: [
    {
      '@type': 'City',
      name: 'Austin',
    },
    {
      '@type': 'Place',
      name: 'Lake Travis',
    },
    {
      '@type': 'Place',
      name: 'Westlake',
    },
    {
      '@type': 'Place',
      name: 'Lakeway',
    },
  ],
  sameAs: [
    'https://www.instagram.com/partyondelivery/',
    'https://www.facebook.com/partyondelivery',
  ],
  image: 'https://partyondelivery.com/images/party-on-logo.svg',
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    reviewCount: '200',
  },
}