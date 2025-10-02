// Centralized SEO configuration for Party On Delivery

export const seoConfig = {
  siteName: 'Party On Delivery',
  siteUrl: 'https://partyondelivery.com',
  defaultTitle: "Party On Delivery - Austin's Premier Alcohol Delivery Service",
  titleTemplate: '%s | Party On Delivery Austin',
  defaultDescription: 'Premium alcohol delivery for weddings, boat parties, and events in Austin. From Lake Travis to downtown, we bring the party to you. Licensed, insured, and ready with 72-hour notice.',

  // Social Media
  social: {
    twitter: '@partyondelivery',
    facebook: 'partyondelivery',
    instagram: 'partyondelivery',
  },

  // Default Open Graph Image
  defaultOgImage: {
    url: '/images/hero/lake-travis-sunset.webp',
    width: 1200,
    height: 630,
    alt: 'Party On Delivery - Premium Alcohol Delivery in Austin',
  },

  // Keywords for different page types
  keywords: {
    default: 'alcohol delivery austin, wedding bar service, lake travis boat party, austin party delivery, premium spirits delivery',
    products: 'buy alcohol online austin, premium spirits, craft beer delivery, wine delivery austin, champagne delivery',
    weddings: 'wedding bar service austin, wedding alcohol delivery, austin wedding bartender, lake travis wedding drinks',
    parties: 'bachelor party austin, bachelorette party drinks, boat party alcohol, lake travis party supplies',
    corporate: 'corporate event bar service, austin business events, company party alcohol, professional bartending service',
  },

  // Page-specific metadata
  pages: {
    home: {
      title: "Austin's Premier Alcohol Delivery Service",
      description: 'Premium alcohol delivery for weddings, boat parties, and events. 72-hour advance booking. Licensed & insured. Serving Austin & Lake Travis.',
      keywords: 'alcohol delivery austin, party delivery service, wedding bar austin, lake travis delivery',
    },
    products: {
      title: 'Premium Spirits, Wine & Beer Collection',
      description: 'Shop our curated selection of premium spirits, fine wines, craft beers, and seltzers. 72-hour advance booking required.',
      keywords: 'buy alcohol online austin, spirits delivery, wine delivery, beer delivery austin',
    },
    weddings: {
      title: 'Wedding Bar Service & Alcohol Delivery',
      description: 'Elegant bar service for Austin weddings. Premium spirits, signature cocktails, and professional service for your special day.',
      keywords: 'wedding bar service austin, wedding alcohol, austin wedding bartender, wedding drinks',
    },
    boatParties: {
      title: 'Lake Travis Boat Party Alcohol Delivery',
      description: 'Premium alcohol delivery to Lake Travis marinas. Perfect for yacht parties, boat celebrations, and waterfront events.',
      keywords: 'lake travis boat party, boat alcohol delivery, yacht party austin, marina delivery',
    },
    bachParties: {
      title: 'Bachelor & Bachelorette Party Packages',
      description: 'Curated alcohol packages for unforgettable bachelor and bachelorette parties in Austin. Group orders and special pricing.',
      keywords: 'bachelor party austin, bachelorette party drinks, austin party packages, group alcohol delivery',
    },
    corporate: {
      title: 'Corporate Event Bar Service',
      description: 'Professional bar service for corporate events, conferences, and business celebrations. Licensed, insured, and reliable.',
      keywords: 'corporate bar service austin, business event alcohol, company party drinks, professional bartending',
    },
    about: {
      title: 'About Us - Licensed Austin Alcohol Delivery',
      description: 'Family-owned Austin business providing premium alcohol delivery since 2020. Licensed, insured, and committed to exceptional service.',
      keywords: 'about party on delivery, austin local business, alcohol delivery company, licensed delivery service',
    },
    contact: {
      title: 'Contact Us - Get Your Party Started',
      description: 'Contact Party On Delivery for premium alcohol delivery in Austin. Call (737) 371-9700 or book online. 72-hour advance notice required.',
      keywords: 'contact party on delivery, austin alcohol delivery contact, book party delivery, alcohol delivery phone',
    },
  },

  // Location-specific pages for local SEO
  locations: {
    downtown: {
      title: 'Downtown Austin Alcohol Delivery',
      description: 'Fast, reliable alcohol delivery to downtown Austin. Perfect for corporate events, rooftop parties, and urban celebrations.',
      keywords: 'downtown austin alcohol delivery, 6th street delivery, rainey street bars, austin downtown drinks',
    },
    lakeTravis: {
      title: 'Lake Travis Alcohol Delivery - Marinas & Resorts',
      description: 'Premium alcohol delivery to Lake Travis marinas, resorts, and waterfront venues. Yacht parties and boat celebrations.',
      keywords: 'lake travis alcohol delivery, marina bar service, lakeway delivery, yacht party drinks',
    },
    westAustin: {
      title: 'West Austin & Westlake Alcohol Delivery',
      description: 'Luxury alcohol delivery to West Austin, Westlake, and surrounding areas. Premium service for upscale events.',
      keywords: 'west austin alcohol delivery, westlake drinks delivery, bee cave party supplies, luxury alcohol service',
    },
    eastAustin: {
      title: 'East Austin Alcohol Delivery Service',
      description: 'Trendy alcohol delivery for East Austin events. Craft cocktails, local beers, and premium spirits delivered.',
      keywords: 'east austin alcohol delivery, east 6th delivery, brewery district drinks, austin east side bars',
    },
  },

  // Rich snippet data
  organization: {
    name: 'Party On Delivery',
    legalName: 'Party On Delivery LLC',
    url: 'https://partyondelivery.com',
    logo: 'https://partyondelivery.com/images/POD Logo 2025.svg',
    contactPoint: {
      telephone: '+1-737-371-9700',
      contactType: 'customer service',
      areaServed: 'US',
      availableLanguage: 'English',
    },
    sameAs: [
      'https://www.facebook.com/partyondelivery',
      'https://www.instagram.com/partyondelivery',
      'https://www.yelp.com/biz/party-on-delivery-austin',
    ],
  },
};

// Helper function to generate meta tags
export function generateMetaTags(page: keyof typeof seoConfig.pages) {
  const pageConfig = seoConfig.pages[page];
  return {
    title: pageConfig.title,
    description: pageConfig.description,
    keywords: pageConfig.keywords,
    openGraph: {
      title: `${pageConfig.title} | ${seoConfig.siteName}`,
      description: pageConfig.description,
      url: `${seoConfig.siteUrl}/${page === 'home' ? '' : page}`,
      siteName: seoConfig.siteName,
      images: [seoConfig.defaultOgImage],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: pageConfig.title,
      description: pageConfig.description,
      images: [seoConfig.defaultOgImage.url],
    },
    alternates: {
      canonical: page === 'home' ? '/' : `/${page}`,
    },
  };
}