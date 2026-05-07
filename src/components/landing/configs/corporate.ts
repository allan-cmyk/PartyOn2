import type { LandingConfig } from '../types';

const PHONE_DISPLAY = '(737) 371-9700';

export const corporateConfig: LandingConfig = {
  slug: 'austin-corporate-event-delivery',
  metaTitle:
    'Austin Corporate Event & Offsite Alcohol Delivery | Premium Spirits & Bar Setup | Party On Delivery',
  metaDescription:
    'White-glove premium spirits, wine, and bar setups for Austin corporate offsites, client dinners, and team events. NET-30 invoicing, COI on file, single-point coordinator. TABC-licensed.',
  ogImage: '/images/products/premium-spirits-boutique.webp',

  theme: {
    primary: '#C8A96A',          // champagne gold
    primaryHover: '#B59456',
    primaryText: '#0E0E10',
    navy: '#0E0E10',             // near-black charcoal
    cream: '#F4EFE6',            // warm linen
    blue: '#7A6643',             // muted bronze
  },
  eventLabel: 'AUSTIN CORPORATE EVENT ALCOHOL DELIVERY',
  audienceTitleCase: 'Corporate Event',

  heroEyebrow: 'AUSTIN CORPORATE EVENT ALCOHOL DELIVERY',
  heroHeadline: 'Premium Bar Service.',
  heroHeadlineAccent: 'Delivered To Your Boardroom.',
  heroSubhead:
    "Top-shelf spirits, sommelier-curated wines, and full bar setups for offsites, client dinners, holiday parties, and SXSW activations. Invoiced. Insured. Discreetly delivered.",
  heroImage: '/images/products/premium-spirits-lifestyle.webp',
  heroTrustBadges: ['✓ TABC-licensed', '✓ COI on file', '✓ NET-30 available'],

  trustStats: [
    { stat: '500+', label: 'Corporate clients' },
    { stat: 'NET-30', label: 'Invoicing available' },
    { stat: '$2M', label: 'Liability coverage' },
    { stat: 'TABC', label: 'Licensed & insured' },
  ],

  painHeadline:
    "Your event vendor shouldn't be your office manager's biggest stress.",
  painBody:
    "Surprise corkage fees. Vendors that won't invoice. A junior staffer wheeling in cases of wine through the lobby. We deliver premium product on time, take care of the paperwork, and make whoever planned the event look like a hero.",

  packagesEyebrow: 'CURATED FOR AUSTIN OFFSITES & CORPORATE EVENTS',
  packagesHeadline: 'Curated bar service. White-glove delivery.',
  packagesBlurb:
    'Designed for offsites, client dinners, and holiday parties — three flexible tiers, all premium.',
  packages: [
    {
      name: 'Executive Reception',
      price: '$1,499',
      save: 'Per event',
      serves: 'Cocktail hour for 30–40',
      blurb: "A polished bar for client meetings, board dinners, and team events.",
      items: [
        'Casamigos Blanco + Reposado',
        'Macallan 12 Single Malt',
        'Veuve Clicquot Brut (×3)',
        'Curated red & white wine selection',
        'Premium glassware, mixers, ice',
      ],
      image: '/images/products/premium-spirits-boutique.webp',
    },
    {
      name: 'Offsite Weekend',
      price: '$3,999',
      save: 'Per weekend',
      serves: 'Full offsite for 50–75',
      blurb: 'Two-day stocked bar for executive offsites, ranches, and Lake Travis venues.',
      items: [
        'Welcome reception spirits + champagne',
        'Dinner-pairing wines (white + red)',
        'Tequila & whiskey selection',
        'Daytime hard seltzers + craft beer',
        'On-site re-stock + cooler equipment',
      ],
      image: '/images/products/premium-spirits-wall.webp',
      featured: true,
    },
    {
      name: 'Holiday Party',
      price: '$2,499',
      save: 'Custom-quoted',
      serves: 'Holiday party for 75–100',
      blurb: 'Year-end celebration with the spirits, wine, and bubbly your team will actually drink.',
      items: [
        'Full open bar (vodka/tequila/whiskey/gin)',
        'Wine selection (sparkling, white, red)',
        'Craft beer + premium hard seltzers',
        'Mixers, garnishes, glassware',
        'Branded delivery bags available',
      ],
      image: '/images/products/premium-spirits-lifestyle.webp',
    },
  ],
  customLine:
    "Larger event or recurring need? Let's set up an account — call us.",

  stepsHeadline: 'From PO to pour in three steps.',
  steps: [
    {
      n: '1',
      title: 'Tell us the brief',
      body: 'Headcount, venue, vibe, and any restrictions (corporate cards, NET-30, COI requirements). We respond within 4 business hours.',
    },
    {
      n: '2',
      title: 'Curated proposal',
      body: 'You get an itemized quote with photos. Approve it, sign the W-9 if needed, and we lock the date.',
    },
    {
      n: '3',
      title: 'White-glove delivery',
      body: "We arrive on time, in branded vehicles, with COI on file. Discreet drop-off or full setup — your call.",
    },
  ],

  venuesEyebrow: 'EVERYWHERE AUSTIN COMPANIES MEET',
  venuesHeadline: 'Office. Hotel ballroom. Lake ranch. We handle it.',
  venues: [
    { area: 'Downtown Office Towers', detail: 'Loading dock or front desk — we know the buildings' },
    { area: 'Hotel Conference & Ballrooms', detail: 'Driskill, Fairmont, JW Marriott — coordinated with banquet teams' },
    { area: 'Lake Travis Event Venues', detail: 'Vintage Villas, Lakeway Resort, private estates' },
    { area: 'Wine Country & Hill Country', detail: 'Driftwood, Wimberley, Dripping Springs ranches' },
    { area: 'SXSW & Conference Activations', detail: 'Brand activations, hospitality suites, panel sponsorships' },
    { area: 'Recurring Office Stocking', detail: 'Quarterly happy hours, kitchen restocks, client gifts' },
  ],
  venuesImage: '/images/products/wine-collection-cellar.webp',

  reviewsEyebrow: '★★★★★ 5.0 ON GOOGLE',
  reviewsHeadline: 'The vendor your finance team approves of.',
  reviews: [
    {
      quote:
        "Booked them for a board dinner with 36 hours notice. Premium wine, perfect timing, COI on file the same day. Now our default vendor for client events.",
      author: 'Patricia L.',
      detail: 'Chief of Staff, Austin SaaS company',
    },
    {
      quote:
        'Stocked our SXSW activation across four days. Re-stocked twice on the fly. Invoice came through clean — finance loved it.',
      author: 'Marcus D.',
      detail: 'Head of Brand Marketing',
    },
    {
      quote:
        "Holiday party for 80. They handled everything from the welcome champagne to the post-dinner whiskey flight. The CEO asked who they were.",
      author: 'Andrea K.',
      detail: 'VP People Ops',
    },
  ],

  faqHeadline: 'The questions every event planner asks.',
  faqs: [
    {
      q: 'Do you invoice or accept POs?',
      a: 'Yes. NET-30 available for established clients with credit approval. Same-day invoicing for one-off events. We accept ACH, wire, and corporate cards.',
    },
    {
      q: 'Can you provide a Certificate of Insurance?',
      a: "Yes — $2M general liability + liquor liability. We can add your venue or company as additional insured. Same-day turnaround.",
    },
    {
      q: 'Do you set up bars or just deliver?',
      a: "Both. Drop-off + delivery is included; on-site setup, ice management, and bartending coordination available as add-ons.",
    },
    {
      q: 'Lead time for corporate events?',
      a: '48 hours for standard orders. For events over $5,000 or with custom branded items, plan 1–2 weeks. We move fast.',
    },
    {
      q: 'Branded packaging or gifting?',
      a: "Yes — we offer branded delivery bags, custom welcome kits, and curated client-gift bottles with your logo on the carrier.",
    },
    {
      q: 'Are you actually licensed?',
      a: "TABC-licensed retailer with $2M liquor liability and full corporate insurance. We card on delivery — required by law.",
    },
  ],

  finalCtaHeadline: 'Bring us the brief.',
  finalCtaHeadlineAccent: 'We deliver the rest.',
  finalCtaSubhead:
    "From quarterly happy hours to once-a-year client galas, we make event-day stress disappear. Get a same-day quote.",
  finalCtaImage: '/images/products/premium-spirits-wall.webp',

  phoneDisplay: PHONE_DISPLAY,
  phoneTel: 'tel:7373719700',
  primaryCtaHref: '#builder',
  ctaText: 'REQUEST A CORPORATE QUOTE →',

  quoteInbox: 'brian@premierpartycruises.com',

  modal: {
    title: 'Request Your Corporate Quote',
    ctaPrimary: 'REQUEST A CORPORATE QUOTE →',
    ctaPrimaryShort: 'REQUEST QUOTE',
    steps: [
      { key: 'basics', label: 'Event brief' },
      { key: 'beer', label: 'Beer & seltzers' },
      { key: 'liquor', label: 'Spirits & wine' },
      { key: 'mixers', label: 'Mixers & service' },
      { key: 'review', label: 'Review & submit' },
    ],
    beerStepBlurb:
      'Premium hard seltzers and craft beer for happy hours, breaks, and client receptions.',
    liquorStepBlurb:
      'Top-shelf spirits and curated wines. We can substitute brands to match your office standards.',
    mixersStepBlurb:
      'Mixers, glassware, ice, and equipment. Add bartender coordination if you need full setup.',
    basicsHeadline: 'Tell us about the event.',
    basicsBlurb:
      'A 30-second brief. Our team builds a proposal with your itemized quote within 4 business hours.',
    groupSizeLabel: 'Headcount',
    groupSizeUnit: 'attendees',
    defaultPeople: 30,
    reviewHeadline: 'Review & request quote.',
    successQuoteHeadline: 'Quote request received.',
    successCheckoutHeadline: 'Quote request received.',
    emailNotice:
      "Your information stays internal. NET-30 + COI available on request. TABC-licensed retailer.",
  },
};
