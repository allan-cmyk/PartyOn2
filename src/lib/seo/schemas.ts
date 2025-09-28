// SEO Schema generators for different page types

import { ShopifyProduct } from '../shopify/types';

export function generateProductSchema(product: ShopifyProduct) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    image: product.images?.edges?.[0]?.node?.url,
    sku: product.id,
    brand: {
      '@type': 'Brand',
      name: product.vendor || 'Party On Delivery'
    },
    offers: {
      '@type': 'Offer',
      price: product.priceRange?.minVariantPrice?.amount,
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: 'Party On Delivery'
      },
      deliveryLeadTime: {
        '@type': 'QuantitativeValue',
        value: 72,
        unitCode: 'HUR'
      }
    }
  };
}

export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `https://partyondelivery.com${item.url}`
    }))
  };
}

export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };
}

export function generateEventSchema(eventType: 'wedding' | 'party' | 'corporate') {
  const events = {
    wedding: {
      name: 'Wedding Bar Service',
      description: 'Premium alcohol delivery and bar service for Austin weddings',
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      location: {
        '@type': 'Place',
        name: 'Austin, TX',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Austin',
          addressRegion: 'TX'
        }
      }
    },
    party: {
      name: 'Party Alcohol Delivery',
      description: 'Alcohol delivery for bachelor/bachelorette parties and celebrations',
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      location: {
        '@type': 'Place',
        name: 'Lake Travis & Austin',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Austin',
          addressRegion: 'TX'
        }
      }
    },
    corporate: {
      name: 'Corporate Event Bar Service',
      description: 'Professional bar service for corporate events and meetings',
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      location: {
        '@type': 'Place',
        name: 'Austin Business District',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Austin',
          addressRegion: 'TX'
        }
      }
    }
  };

  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    ...events[eventType],
    organizer: {
      '@type': 'Organization',
      name: 'Party On Delivery',
      url: 'https://partyondelivery.com'
    }
  };
}

export function generateServiceSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: 'Alcohol Delivery Service',
    provider: {
      '@type': 'LocalBusiness',
      name: 'Party On Delivery',
      url: 'https://partyondelivery.com',
      telephone: '(737) 371-9700',
      priceRange: '$$',
      image: 'https://partyondelivery.com/images/party-on-logo.svg'
    },
    areaServed: {
      '@type': 'City',
      name: 'Austin',
      '@id': 'https://en.wikipedia.org/wiki/Austin,_Texas'
    },
    availableChannel: {
      '@type': 'ServiceChannel',
      serviceUrl: 'https://partyondelivery.com/order',
      servicePhone: '(737) 371-9700',
      availableLanguage: {
        '@type': 'Language',
        name: 'English'
      }
    },
    hoursAvailable: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '10:00',
      closes: '23:00'
    },
    offers: {
      '@type': 'Offer',
      price: '100.00',
      priceCurrency: 'USD',
      eligibleRegion: {
        '@type': 'Place',
        name: 'Austin Metropolitan Area'
      }
    }
  };
}