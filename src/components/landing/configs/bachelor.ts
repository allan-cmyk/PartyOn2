import type { LandingConfig } from '../types';

const PHONE_DISPLAY = '(737) 371-9700';

export const bachelorConfig: LandingConfig = {
  slug: 'austin-bachelor-party-delivery',
  metaTitle:
    'Austin Bachelor Party Alcohol Delivery | Stocked Cold, On Time | Party On Delivery',
  metaDescription:
    'Beer, liquor, mixers and ice delivered cold to your Airbnb, hotel, party bus or Lake Travis dock. TABC-licensed, 1,000+ Austin bach groups served. Order in 30 seconds.',
  ogImage: '/images/services/bach-parties/bachelor-party-epic.webp',

  theme: {
    primary: '#F2D34F',
    primaryHover: '#FACC15',
    primaryText: '#0A1F33',
    navy: '#0A1F33',
    cream: '#FAF6EE',
    blue: '#0B74B8',
  },
  eventLabel: 'AUSTIN BACHELOR PARTY ALCOHOL DELIVERY',
  audienceTitleCase: 'Bachelor Party',

  heroEyebrow: 'AUSTIN BACHELOR PARTY ALCOHOL DELIVERY',
  heroHeadline: 'Stocked & Ice-Cold',
  heroHeadlineAccent: 'Before The Groom Lands.',
  heroSubhead:
    "Beer, liquor, mixers and ice delivered cold to your Airbnb, hotel, party bus, or Lake Travis dock. Skip the store run. Order in 30 seconds — we'll handle the rest.",
  heroImage: '/images/services/bach-parties/bachelor-party-epic.webp',
  heroTrustBadges: ['✓ TABC-licensed', '✓ 1,000+ Austin bach groups', '★ 5.0 on Google'],

  trustStats: [
    { stat: '1,000+', label: 'Austin bach groups' },
    { stat: '5.0★', label: 'Google rating' },
    { stat: '30 sec', label: 'To order' },
    { stat: 'TABC', label: 'Licensed & insured' },
  ],

  painHeadline: "You didn't fly to Austin to babysit a Costco run.",
  painBody:
    "Splitting up the group on day one. Trying to fit a handle of tequila in a Lyft. Realizing the Airbnb is dry at 11pm. We've seen every bach trip mistake in Austin — and we built the fix.",

  packagesEyebrow: 'CURATED FOR AUSTIN BACH GROUPS',
  packagesHeadline: "Pick a package. We'll do the rest.",
  packagesBlurb:
    'Built around the trips groups actually take in Austin — Lake Travis, Rainey Street, downtown hotels.',
  packages: [
    {
      name: 'Austin Bach Starter',
      price: '$299',
      save: 'Save $50',
      serves: 'Pregame for 6–8',
      blurb: 'Everything you need before hitting 6th Street or Rainey.',
      items: [
        "Tito's Vodka (750ml)",
        'Don Julio Blanco (750ml)',
        'White Claw 6-pack',
        'Cranberry, OJ, lime juice, ice',
        'Cups, napkins, opener',
      ],
      image: '/images/services/bach-parties/late-night-party-supplies.webp',
    },
    {
      name: 'Lake Travis Pack',
      price: '$499',
      save: 'Save $75',
      serves: 'Boat party for 10–12',
      blurb: 'Built for sun, dock, and 8 hours on the water. Cold guaranteed.',
      items: [
        "2× Tito's Vodka (750ml)",
        'Casamigos Blanco (750ml)',
        '12× White Claw + 12× Truly',
        'Full mixer set + ice packs',
        'Waterproof cooler included',
      ],
      image: '/images/gallery/sunset-champagne-pontoon.webp',
      featured: true,
    },
    {
      name: 'Rainey Street Crawler',
      price: '$399',
      save: 'Save $60',
      serves: 'Pre-game for 8–10',
      blurb: 'Pre-game heavy, walk to the bars, stumble back to the Airbnb.',
      items: [
        "Tito's Vodka (750ml)",
        'Espolòn Tequila (750ml)',
        'Jameson Whiskey (750ml)',
        '18× assorted seltzers',
        'Energy drinks + mixers',
      ],
      image: '/images/hero/bach-hero-rainey.webp',
    },
  ],
  customLine: "Need something custom? Call us — we'll build it.",

  stepsHeadline: 'From order to first pour in three steps.',
  steps: [
    {
      n: '1',
      title: 'Pick your package',
      body: 'Three plug-and-play bundles or build your own. No store runs, no rideshare with a trunk full of liquor.',
    },
    {
      n: '2',
      title: 'Tell us when & where',
      body: 'Hotel, Airbnb, boat dock, party bus — give us the address and the arrival window. 48-hour notice is best.',
    },
    {
      n: '3',
      title: 'Pour & party',
      body: "We text you when we're 15 minutes out. Cold delivery, friendly drop-off, ready to drink.",
    },
  ],

  venuesEyebrow: 'EVERYWHERE BACH GROUPS GO',
  venuesHeadline: "Hotel lobby. Boat dock. Party bus. We'll find you.",
  venues: [
    { area: 'Downtown Hotels', detail: 'Hilton, Fairmont, JW Marriott — lobby drop-off' },
    { area: 'Rainey Street Airbnbs', detail: 'Front-door delivery, walking to bars' },
    { area: 'Lake Travis Docks', detail: 'Loaded straight onto your boat or pontoon' },
    { area: 'Party Buses & Limos', detail: 'Coordinate with your driver, we time it perfectly' },
    { area: 'East Austin Breweries', detail: 'Add bottles to your brewery hop' },
    { area: 'Bachelor Houses & Ranches', detail: 'Wimberley, Dripping Springs, Spicewood' },
  ],
  venuesImage: '/images/hero/bach-hero-party-bus.webp',

  reviewsEyebrow: '★★★★★ 5.0 ON GOOGLE',
  reviewsHeadline: 'The crew gets the credit. We just deliver.',
  reviews: [
    {
      quote:
        "Showed up exactly when they said, ice cold, and our group didn't have to babysit a Costco run on day one. Worth every penny.",
      author: 'Marcus T.',
      detail: 'Best Man, Lake Travis bach weekend',
    },
    {
      quote:
        'Booked the Rainey Crawler the day before. They confirmed in 10 minutes and stocked the Airbnb before the bachelor even landed.',
      author: 'Sarah K.',
      detail: 'Maid of Honor, June 2025',
    },
    {
      quote:
        "Driver coordinated with our party bus driver via text. Cold seltzers ready when we boarded. We'll use them again next year.",
      author: 'Derek M.',
      detail: 'Bach trip organizer, Houston',
    },
  ],

  faqHeadline: 'The questions every best man asks.',
  faqs: [
    {
      q: 'How fast can you deliver in Austin?',
      a:
        '48-hour notice is our standard window for guaranteed pricing and cold delivery. Same-day is often possible — call us at ' +
        PHONE_DISPLAY +
        ' to check.',
    },
    {
      q: 'Do you deliver to Lake Travis docks and boats?',
      a: "Yes — Volente, Lakeway, Hurst Harbor, Emerald Point, Rough Hollow, all of them. We'll coordinate with your captain or marina.",
    },
    {
      q: 'What is the order minimum?',
      a: 'Most areas are $100–$150 minimum. Lake Travis and far-out ranches start at $250 to cover the drive.',
    },
    {
      q: 'Are you actually licensed?',
      a: "Yes. We're TABC-licensed, fully insured, and every driver is certified. We card on delivery — non-negotiable.",
    },
    {
      q: 'Can you customize a package?',
      a: "Absolutely. Click 'Build Your Bach Package' or call us. We'll match your group size, taste, and budget.",
    },
    {
      q: 'What if plans change?',
      a: 'We get it — bach plans shift. Reschedule free up to 6 hours before delivery. After that, we work with you.',
    },
  ],

  finalCtaHeadline: 'Lock it in.',
  finalCtaHeadlineAccent: 'Then go enjoy the trip you planned.',
  finalCtaSubhead:
    'Most groups book 1–3 weeks out. Lake Travis weekends fill up fast — get on the calendar now.',
  finalCtaImage: '/images/hero/bach-hero-brewery.webp',

  phoneDisplay: PHONE_DISPLAY,
  phoneTel: 'tel:7373719700',
  primaryCtaHref: '#builder',
  ctaText: 'BUILD YOUR BACH PACKAGE →',

  quoteInbox: 'brian@premierpartycruises.com',

  modal: {
    title: 'Build Your Bach Package',
    ctaPrimary: 'BUILD YOUR BACH PACKAGE →',
    ctaPrimaryShort: 'BUILD MY PACKAGE',
    steps: [
      { key: 'basics', label: 'Trip basics' },
      { key: 'beer', label: 'Beer & seltzers' },
      { key: 'liquor', label: 'Liquor & cocktail kits' },
      { key: 'mixers', label: 'Mixers & supplies' },
      { key: 'review', label: 'Review' },
    ],
    beerStepBlurb:
      'Stock the Airbnb fridge or load the boat cooler. Most groups grab 2–3 packs per 4 people.',
    liquorStepBlurb:
      'Bottles for shots and mixed drinks, plus pitcher kits if you want zero work.',
    mixersStepBlurb:
      "The stuff everyone forgets — mixers, cups, ice, pong gear.",
    basicsHeadline: "Let's set up the trip.",
    basicsBlurb:
      'Both optional. You can edit anytime — your per-person price updates live.',
    groupSizeLabel: 'Group size',
    groupSizeUnit: 'people',
    defaultPeople: 8,
    reviewHeadline: 'Review & lock it in.',
    successQuoteHeadline: 'Quote on the way!',
    successCheckoutHeadline: "We're on it.",
    emailNotice:
      "We'll never spam you. TABC-licensed alcohol retailer — must be 21+ at delivery.",
  },
};
