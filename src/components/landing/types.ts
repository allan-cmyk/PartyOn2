// Shared types for landing pages and the package builder modal.

export type ThemeColors = {
  primary: string;     // hex — used for primary CTA + accents (yellow for bach, gold for wedding…)
  primaryText: string; // text color used on primary button (navy/white)
  navy: string;        // dark surface (modal header bg, dark sections)
  cream: string;       // body bg
  blue: string;        // info / link / per-person price
  primaryHover: string;
};

export type PackageLineItem = {
  name: string;
  qty: number;
  unitPrice: number;
  /** When true, this item is included free (counted toward "save" badge but not added to package price). */
  freebie?: boolean;
};

export type Package = {
  name: string;
  /** Legacy/marketing display strings — kept optional for back-compat. */
  price?: string;
  save?: string;
  serves: string;
  blurb: string;
  /** Legacy flat string list for old hardcoded packages. */
  items?: string[];
  /** New itemized list including alcohol (paid) and freebies (free). */
  lineItems?: PackageLineItem[];
  /** Computed retail of paid alcohol items (= what we charge). */
  packagePrice?: number;
  /** Computed retail value of bundled freebies (= what we display as "savings"). */
  freebiesValue?: number;
  image: string;
  featured?: boolean;
};

export type TrustStat = {
  stat: string;
  label: string;
};

export type Step = {
  n: string;
  title: string;
  body: string;
};

export type Venue = {
  area: string;
  detail: string;
};

export type Review = {
  quote: string;
  author: string;
  detail: string;
};

export type Faq = { q: string; a: string };

export type ModalStep = {
  key: string;
  label: string;
};

export type ExtraQuestion = {
  id: string;
  label: string;
  type: 'multi-checkbox';
  options: { value: string; label: string }[];
};

export type ModalConfig = {
  title: string;            // "Build Your Bach Package"
  ctaPrimary: string;       // "BUILD YOUR BACH PACKAGE →"
  ctaPrimaryShort: string;  // "BUILD MY PACKAGE"
  steps: ModalStep[];       // 5-step flow
  beerStepBlurb: string;
  liquorStepBlurb: string;
  mixersStepBlurb: string;
  basicsHeadline: string;
  basicsBlurb: string;
  groupSizeLabel: string;     // "Group size" / "Headcount" / "Guest count"
  groupSizeUnit: string;      // "people" / "guests" / "attendees"
  defaultPeople: number;
  reviewHeadline: string;
  successQuoteHeadline: string;
  successCheckoutHeadline: string;
  emailNotice: string;
  /** Wedding-only: extra checkboxes for which events to stock */
  extraQuestion?: ExtraQuestion;
};

export type LandingConfig = {
  // Routing & metadata
  slug: string;            // "austin-bachelor-party-delivery"
  metaTitle: string;
  metaDescription: string;
  ogImage: string;

  // Branding/theme
  theme: ThemeColors;
  eventLabel: string;      // "BACHELOR PARTY" / "BACHELORETTE WEEKEND"
  audienceTitleCase: string; // "Bachelor Party" / "Wedding Weekend"

  // Hero
  heroEyebrow: string;
  heroHeadline: string;
  heroHeadlineAccent: string; // 2nd line shown in primary color
  heroSubhead: React.ReactNode | string;
  heroImage: string;
  heroTrustBadges: string[];

  // Trust stats (4 cards strip)
  trustStats: TrustStat[];

  // Pain → solution
  painHeadline: string;     // can include line break via \n
  painBody: string;

  // Packages
  packagesEyebrow: string;
  packagesHeadline: string;
  packagesBlurb: string;
  packages: Package[];
  customLine: string;       // "Need something custom? Call us…"

  // How it works
  stepsHeadline: string;
  steps: Step[];

  // Where we deliver
  venuesEyebrow: string;
  venuesHeadline: string;
  venues: Venue[];
  venuesImage: string;

  // Reviews
  reviewsEyebrow: string;
  reviewsHeadline: string;
  reviews: Review[];

  // FAQ
  faqHeadline: string;
  faqs: Faq[];

  // Final CTA
  finalCtaHeadline: string;
  finalCtaHeadlineAccent: string;
  finalCtaSubhead: string;
  finalCtaImage: string;

  // CTAs / phone / email
  phoneDisplay: string;
  phoneTel: string;
  primaryCtaHref: string;   // where the buttons link to (usually /bach-parties/products)
  ctaText: string;          // "BUILD YOUR BACH PACKAGE →"

  // Modal
  modal: ModalConfig;

  // Quote inbox
  quoteInbox: string;
};

// ---- Catalog (Package Builder Modal) ----

export type BuilderProduct = {
  id: string;
  name: string;
  detail?: string;
  price: number;
  emoji: string;
  accent: string;
  image?: string;
  /** Underlying Postgres product handle, used for checkout linking. */
  sku?: string;
};

export type BuilderCategory = {
  key: string;
  label: string;
  /** Curated top sellers shown by default. */
  products: BuilderProduct[];
  /** Remaining in-stock items, revealed via "View more". */
  extras?: BuilderProduct[];
};

export type Selection = Record<string, number>;

export type Catalog = {
  stepOneCategories: BuilderCategory[];
  stepTwoCategories: BuilderCategory[];
  stepThreeCategories: BuilderCategory[];
  productById: Record<string, BuilderProduct>;
};
