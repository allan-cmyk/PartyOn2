export const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    // Organization schema for brand identity
    {
      '@type': 'Organization',
      '@id': 'https://partyondelivery.com/#organization',
      name: 'Party On Delivery',
      url: 'https://partyondelivery.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://partyondelivery.com/images/pod-logo-2025.svg',
        width: 600,
        height: 60,
      },
      description: "Austin's premier alcohol delivery service for weddings, boat parties, and special events",
      foundingDate: '2016',
      telephone: '(737) 371-9700',
      email: 'info@partyondelivery.com',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Austin',
        addressRegion: 'TX',
        addressCountry: 'US',
      },
      sameAs: [
        'https://www.instagram.com/partyondelivery/',
        'https://www.facebook.com/partyondelivery',
      ],
    },
    // WebSite schema with search action
    {
      '@type': 'WebSite',
      '@id': 'https://partyondelivery.com/#website',
      url: 'https://partyondelivery.com',
      name: 'Party On Delivery',
      description: "Austin's premier alcohol delivery service for weddings, boat parties, and events",
      publisher: {
        '@id': 'https://partyondelivery.com/#organization',
      },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://partyondelivery.com/search?q={search_term_string}',
        },
        'query-input': 'required name=search_term_string',
      },
    },
    // LocalBusiness schema for local SEO
    {
      '@type': 'LocalBusiness',
      '@id': 'https://partyondelivery.com/#localbusiness',
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
          'Saturday'
        ],
        opens: '10:00',
        closes: '21:00',
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
      image: 'https://partyondelivery.com/images/pod-logo-2025.svg',
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '5.0',
        reviewCount: '200',
      },
    },
  ],
}