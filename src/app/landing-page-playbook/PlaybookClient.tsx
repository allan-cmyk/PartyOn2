'use client';

import { useState } from 'react';
import { MARKDOWN } from './content';

/**
 * Self-contained methodology document for replicating the Party On Delivery
 * landing-page system on a different brand (e.g. a party boat business).
 *
 * Has print-to-PDF and copy-to-clipboard buttons so the entire playbook can
 * be ported into another project's docs or fed to another AI agent as
 * context.
 */
export default function PlaybookClient() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(MARKDOWN);
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    } catch {
      // Fallback: select-all body text
      const range = document.createRange();
      range.selectNode(document.body);
      window.getSelection()?.removeAllRanges();
      window.getSelection()?.addRange(range);
    }
  };

  const handlePrint = () => window.print();

  return (
    <main className="min-h-screen bg-stone-50 text-gray-900 print:bg-white">
      {/* Sticky action bar — hidden when printing */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 print:hidden">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold tracking-[0.2em] text-amber-700">
              INTERNAL · NOT INDEXED
            </p>
            <h1 className="font-bold text-lg text-gray-900">
              Landing Page Playbook
            </h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="px-4 py-2 rounded-md text-sm font-bold border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white transition-colors"
            >
              {copied ? '✓ Copied!' : 'Copy as markdown'}
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-md text-sm font-bold bg-gray-900 text-white hover:bg-black"
            >
              Download PDF
            </button>
          </div>
        </div>
      </div>

      <article className="max-w-5xl mx-auto px-6 md:px-10 py-12 prose prose-lg prose-gray max-w-none print:px-0 print:py-4">
        {/* Title */}
        <header className="mb-12 not-prose">
          <p className="text-xs font-bold tracking-[0.25em] text-amber-700 mb-3">
            METHODOLOGY · v1
          </p>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
            How we built four high-converting landing pages for Party On Delivery
          </h1>
          <p className="text-lg text-gray-700 leading-relaxed">
            A complete playbook for replicating this exact system on another
            brand — designed to be handed to a fresh AI agent or developer
            with zero prior context.
          </p>
        </header>

        {/* Live URLs */}
        <section className="not-prose mb-12 p-6 rounded-2xl bg-white border-2 border-gray-200 shadow-sm">
          <h2 className="text-2xl font-bold mb-4">Live deployed URLs</h2>
          <ul className="space-y-2 text-base">
            <li>
              <strong>Bachelor:</strong>{' '}
              <a
                className="text-blue-600 underline break-all"
                href="https://partyondelivery.com/austin-bachelor-party-delivery"
              >
                partyondelivery.com/austin-bachelor-party-delivery
              </a>
            </li>
            <li>
              <strong>Bachelorette:</strong>{' '}
              <a
                className="text-blue-600 underline break-all"
                href="https://partyondelivery.com/austin-bachelorette-party-delivery"
              >
                partyondelivery.com/austin-bachelorette-party-delivery
              </a>
            </li>
            <li>
              <strong>Corporate:</strong>{' '}
              <a
                className="text-blue-600 underline break-all"
                href="https://partyondelivery.com/austin-corporate-event-delivery"
              >
                partyondelivery.com/austin-corporate-event-delivery
              </a>
            </li>
            <li>
              <strong>Wedding:</strong>{' '}
              <a
                className="text-blue-600 underline break-all"
                href="https://partyondelivery.com/austin-wedding-weekend-delivery"
              >
                partyondelivery.com/austin-wedding-weekend-delivery
              </a>
            </li>
            <li>
              <strong>Internal directory (noindex):</strong>{' '}
              <a
                className="text-blue-600 underline break-all"
                href="https://partyondelivery.com/landing-pages"
              >
                partyondelivery.com/landing-pages
              </a>
            </li>
          </ul>
        </section>

        {/* Section: Wes McDowell principles */}
        <h2>1. The Wes McDowell design principles applied</h2>
        <p>
          Wes McDowell is a YouTuber and small-business consultant whose
          landing-page framework (popularized through{' '}
          <em>The Deep End</em> podcast and his agency, McDowell Marketing
          Group) emphasizes <strong>conversion-led simplicity</strong> over
          flashy design. Every element exists to move a cold visitor from
          &ldquo;just clicked an ad&rdquo; to &ldquo;I&apos;m booking
          this.&rdquo;
        </p>

        <h3>1.1 The above-the-fold formula</h3>
        <p>
          What every visitor must see in the first 3 seconds, in this order:
        </p>
        <ul>
          <li>
            <strong>Eyebrow tag</strong> — tiny all-caps line that confirms
            they&apos;re in the right place. e.g. &ldquo;BACHELOR PARTY ·
            AUSTIN.&rdquo; This satisfies the &ldquo;message-match&rdquo; rule
            below.
          </li>
          <li>
            <strong>One specific, outcome-focused headline</strong> — never a
            clever tagline. We use a two-line structure where the second line
            uses brand color. e.g. &ldquo;Stocked, Cold, and Ready.&rdquo; →
            colored: &ldquo;Before You Arrive.&rdquo;
          </li>
          <li>
            <strong>One subhead</strong> — adds the &ldquo;for whom&rdquo; and
            the differentiator. 1-2 lines max.
          </li>
          <li>
            <strong>One primary CTA button</strong> — high-contrast brand
            color, action-verb copy in all caps. The CTA appears 5-8 times
            down the page; each instance points at the same conversion event
            (open the package builder).
          </li>
          <li>
            <strong>Hero image with the customer in it</strong> — never a
            stock-art flat-lay. Visitors have to see themselves in the
            scenario.
          </li>
          <li>
            <strong>3-4 trust badges directly under the CTA</strong> — TABC
            licensed, 60-min delivery, 4.9★, Austin local.
          </li>
        </ul>

        <h3>1.2 Message match (the most-violated rule)</h3>
        <p>
          The Google Ads / social-ad copy that brought the visitor in must
          appear word-for-word at the top of the landing page. If your ad
          says &ldquo;Bachelor Party Alcohol Delivery in Austin,&rdquo; the
          H1 cannot be &ldquo;Premium Beverages for Special Occasions.&rdquo;
          We hard-coded this match into each config file via{' '}
          <code>eventLabel</code> + <code>heroHeadline</code>.
        </p>

        <h3>1.3 No nav distractions on cold-traffic pages</h3>
        <p>
          The shared global nav stays in place, but every internal CTA points
          to one event:{' '}
          <code>setBuilderOpen(true)</code> — the Package Builder modal.
          There is exactly one conversion goal per landing page. No
          &ldquo;learn more,&rdquo; no &ldquo;view pricing,&rdquo; no
          &ldquo;contact us&rdquo; secondary CTA above the fold.
        </p>

        <h3>1.4 Pain → solution narrative, not a feature dump</h3>
        <p>
          The second screen-height of every page is a single short paragraph:
          &ldquo;Here&apos;s the problem you&apos;re feeling right now → here&apos;s
          how we remove it.&rdquo; Bachelor: &ldquo;Nobody wants to lose 2
          hours hunting down a Total Wine.&rdquo; Wedding: &ldquo;Caterers
          mark up alcohol 2-3×.&rdquo; This is the McDowell &ldquo;agitate
          before you sell&rdquo; principle.
        </p>

        <h3>1.5 Three packages, with the middle one featured</h3>
        <p>
          McDowell&apos;s pricing-page rule: &ldquo;Don&apos;t make people
          think — pick the option for them.&rdquo; Three packages, the middle
          one labeled &ldquo;MOST BOOKED,&rdquo; visually scaled-up
          (transform: scale(1.03)), bordered in brand color. Decision fatigue
          is the conversion killer.
        </p>

        <h3>1.6 Itemized trust at point-of-decision</h3>
        <p>
          Every package card has a &ldquo;See what&apos;s inside&rdquo;
          dropdown that lists every product, qty, and unit price. McDowell:
          &ldquo;Hidden price = abandoned cart.&rdquo; Showing the
          itemization both builds trust AND lets us frame our 10% savings
          (the bundled high-margin freebies) as obvious value.
        </p>

        <h3>1.7 Specific numbers everywhere, generic adjectives nowhere</h3>
        <p>
          &ldquo;Fast&rdquo; → &ldquo;60-minute delivery in Central
          Austin.&rdquo; &ldquo;Lots of options&rdquo; → &ldquo;1,131 SKUs in
          stock right now.&rdquo; &ldquo;Trusted&rdquo; → &ldquo;4.9★ from
          1,200+ Austin events.&rdquo; Hard numbers move conversion.
        </p>

        <h3>1.8 Local relevance for local businesses</h3>
        <p>
          Every page name-drops actual venue names that the audience
          recognizes — Lake Travis, Rainey Street, the W Hotel, South
          Congress Airbnbs. This signals &ldquo;they get it&rdquo; in 2
          seconds and dramatically beats generic copy in A/B tests
          (McDowell&apos;s case-study videos cite +20-40% lift).
        </p>

        <h3>1.9 Reviews shown as people, not stars</h3>
        <p>
          Real first names + role + city beats &ldquo;★★★★★ Anonymous.&rdquo;
          Each landing page shows 3 reviews with named attribution
          (&ldquo;Sarah, Bachelorette weekend, South Congress&rdquo;) right
          before the final CTA.
        </p>

        <h3>1.10 FAQ section right above the final CTA</h3>
        <p>
          The objection-handling step. Each landing page has 6-8 FAQs that
          name and crush the exact buying objections for that audience
          (&ldquo;What if we run out?&rdquo; / &ldquo;Can we add more on the
          day?&rdquo; / &ldquo;Do you deliver to a hotel?&rdquo;). Schema.org
          FAQPage JSON-LD is added so the FAQ renders as rich results in
          Google.
        </p>

        <h3>1.11 Mobile-first, then make desktop nice</h3>
        <p>
          70%+ of paid social and Google Ad traffic is mobile. We design the
          mobile breakpoint first, then progressively enhance. The hero image
          uses <code>h-[60vh] md:h-[70vh]</code>, packages stack to one
          column, and a fixed bottom-of-screen sticky CTA appears on mobile
          only (<code>md:hidden h-16</code>) so the CTA is always one thumb
          tap away.
        </p>

        {/* Section 2: variations */}
        <h2>2. How we differentiated each audience</h2>
        <p>
          One template, four configs. The template
          (<code>LandingPageTemplate.tsx</code>) is identical across all four
          pages; the config object is the only thing that changes. This lets
          us A/B test, redesign, and add a 5th audience in under an hour.
        </p>

        <h3>2.1 Color &amp; theme matrix</h3>
        <div className="overflow-x-auto not-prose my-4">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left p-3 border border-gray-200">Audience</th>
                <th className="text-left p-3 border border-gray-200">Primary</th>
                <th className="text-left p-3 border border-gray-200">Dark surface</th>
                <th className="text-left p-3 border border-gray-200">Why</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-3 border border-gray-200">
                  <strong>Bachelor</strong>
                </td>
                <td className="p-3 border border-gray-200">Brand yellow #F2D34F</td>
                <td className="p-3 border border-gray-200">Navy #0B2034</td>
                <td className="p-3 border border-gray-200">
                  High-energy, action-oriented. Yellow reads as
                  &ldquo;send it.&rdquo;
                </td>
              </tr>
              <tr className="bg-gray-50">
                <td className="p-3 border border-gray-200">
                  <strong>Bachelorette</strong>
                </td>
                <td className="p-3 border border-gray-200">Rose/wine #C4426A</td>
                <td className="p-3 border border-gray-200">Wine #4A1E2D</td>
                <td className="p-3 border border-gray-200">
                  Feminine, celebratory, photo-friendly for Insta.
                </td>
              </tr>
              <tr>
                <td className="p-3 border border-gray-200">
                  <strong>Corporate</strong>
                </td>
                <td className="p-3 border border-gray-200">Gold #D4AF37</td>
                <td className="p-3 border border-gray-200">Charcoal #1F2937</td>
                <td className="p-3 border border-gray-200">
                  Professional, expense-friendly. Reads as &ldquo;safe to
                  approve.&rdquo;
                </td>
              </tr>
              <tr className="bg-gray-50">
                <td className="p-3 border border-gray-200">
                  <strong>Wedding</strong>
                </td>
                <td className="p-3 border border-gray-200">Gold #D4AF37</td>
                <td className="p-3 border border-gray-200">Espresso #2C1810</td>
                <td className="p-3 border border-gray-200">
                  Premium, refined, &ldquo;once-in-a-lifetime&rdquo; feel.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3>2.2 Tone shifts (same product, four voices)</h3>
        <ul>
          <li>
            <strong>Bachelor:</strong> punchy, casual, slightly profane-adjacent.
            Verbs: <em>send it, lock in, post up, dial it in.</em> Sentence
            length: short. CTA: &ldquo;BUILD YOUR BACH PACKAGE →&rdquo;
          </li>
          <li>
            <strong>Bachelorette:</strong> warm, inclusive, photo-aware.
            Verbs: <em>celebrate, gather, toast, glow.</em> Slightly longer
            sentences with an emotional undertone. CTA: &ldquo;DESIGN HER
            WEEKEND →&rdquo;
          </li>
          <li>
            <strong>Corporate:</strong> measured, low-friction, certainty.
            Verbs: <em>approve, deliver, account for, scale.</em> Short
            sentences but no slang. CTA: &ldquo;PLAN YOUR EVENT →&rdquo;
          </li>
          <li>
            <strong>Wedding:</strong> elegant, reassuring, &ldquo;we&apos;ve
            done 100 of these.&rdquo; Verbs: <em>curate, accent, anchor,
            host.</em> Mid-length sentences with rhythm. CTA: &ldquo;BUILD YOUR
            WEDDING BAR →&rdquo;
          </li>
        </ul>

        <h3>2.3 What stayed identical across all four</h3>
        <ul>
          <li>Hero structure (eyebrow → headline → subhead → CTA → trust badges)</li>
          <li>Section ordering: hero → trust stats → pain/solution → packages → how it works → venues → reviews → FAQ → final CTA</li>
          <li>The Package Builder modal (5-step wizard)</li>
          <li>Phone number, business hours, TABC compliance footer</li>
          <li>Schema.org structured data (Article, FAQPage, LocalBusiness)</li>
        </ul>

        <h3>2.4 What changed per audience</h3>
        <ul>
          <li>
            <strong>Hero copy</strong> — message-matched to ad keyword
          </li>
          <li>
            <strong>Hero image</strong> — bachelor: poolside boat scene;
            bachelorette: golden-hour yacht; corporate: rooftop networking;
            wedding: champagne tower
          </li>
          <li>
            <strong>Pain points</strong> — bachelor &ldquo;hunting Total
            Wine&rdquo; vs corporate &ldquo;3 vendor invoices&rdquo;
          </li>
          <li>
            <strong>Package contents</strong> — bachelor heavy on beer/seltzer/liquor; bachelorette heavy on wine/champagne/seltzer; wedding includes 4-beer-4-wine open bar; corporate balanced
          </li>
          <li>
            <strong>Venue list</strong> — bachelor: Lake Travis, Rainey,
            South Congress; wedding: actual wedding venues
          </li>
          <li>
            <strong>FAQs</strong> — bachelor &ldquo;can you deliver to a
            boat?&rdquo; vs corporate &ldquo;can we get one invoice with our
            EIN?&rdquo;
          </li>
          <li>
            <strong>Wedding-only extra question</strong> in modal — multi-event checkbox
            (rehearsal dinner, ceremony, reception, brunch) so we can stock
            for the entire weekend
          </li>
        </ul>

        {/* Section 3: technical structure */}
        <h2>3. Technical architecture</h2>
        <h3>3.1 File layout</h3>
        <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto text-sm">
          {`src/
├── app/
│   ├── austin-bachelor-party-delivery/page.tsx     # async server component
│   ├── austin-bachelorette-party-delivery/page.tsx
│   ├── austin-corporate-event-delivery/page.tsx
│   ├── austin-wedding-weekend-delivery/page.tsx
│   ├── landing-pages/                              # internal directory (noindex)
│   └── landing-page-playbook/                      # this document
├── components/landing/
│   ├── LandingPageTemplate.tsx     # shared template ('use client')
│   ├── PackageBuilderModal.tsx     # 5-step wizard ('use client')
│   ├── types.ts                    # config + catalog + package types
│   └── configs/
│       ├── bachelor.ts
│       ├── bachelorette.ts
│       ├── corporate.ts
│       └── wedding.ts
└── lib/landing/
    ├── getCuratedCatalog.ts        # server fetcher: top sellers per category
    └── getOccasionPackages.ts      # server fetcher: real-priced 3-package set per occasion`}
        </pre>

        <h3>3.2 Data flow</h3>
        <ol>
          <li>
            User clicks Google Ad →{' '}
            <code>/austin-bachelor-party-delivery</code>
          </li>
          <li>
            Page is an <code>async</code> server component with{' '}
            <code>export const dynamic = &lsquo;force-dynamic&rsquo;</code> (renders
            per-request, never at build time)
          </li>
          <li>
            Page calls{' '}
            <code>Promise.all([getCuratedCatalog(), getOccasionPackages(&lsquo;bachelor&rsquo;)])</code>{' '}
            in parallel
          </li>
          <li>
            Both fetchers query Postgres via Prisma — top sellers per category
            and a curated set of real product handles for each of the 3
            packages
          </li>
          <li>
            Page passes <code>{`{config, catalog}`}</code> to{' '}
            <code>LandingPageTemplate</code>; template overrides{' '}
            <code>config.packages</code> with the live-priced set
          </li>
          <li>
            Template renders 11 sections; the modal is a child component that
            receives the same catalog
          </li>
          <li>
            User opens the modal → 5 steps → submits as a quote (email) or
            checkout (Stripe)
          </li>
        </ol>

        <h3>3.3 The Package Builder modal — 5 steps</h3>
        <ol>
          <li>
            <strong>Basics</strong> — date picker, headcount, optional
            multi-event checkboxes (wedding only)
          </li>
          <li>
            <strong>Beer &amp; seltzer</strong> — 3 categories (Light Beer,
            Craft Beer, Seltzers), each with curated top-10 + &ldquo;View all
            N&rdquo; expand
          </li>
          <li>
            <strong>Spirits</strong> — horizontal subtabs (Whiskey / Tequila
            / Vodka / Gin / Rum / Cocktail Kits), one panel at a time so the
            grid fits above the fold; each tab has &ldquo;View all
            N&rdquo;
          </li>
          <li>
            <strong>Mixers &amp; supplies</strong> — sodas, juice, ice, cups,
            ping-pong; &ldquo;View all&rdquo; expansion
          </li>
          <li>
            <strong>Review &amp; submit</strong> — itemized cart with running
            total, per-person breakdown, contact form, &ldquo;Get a
            quote&rdquo; or &ldquo;Pay now&rdquo; toggle
          </li>
        </ol>

        <h3>3.4 The pricing trick — alcohol stays at full retail</h3>
        <p>
          We never discount alcohol — it&apos;s a low-margin category and we
          can&apos;t afford to give 10% off. Instead, every package bundles
          in 10-19% retail value of <em>high-margin party supplies</em> (Solo
          cups, plastic flutes, ping-pong balls, ice, bar tools). The
          customer-facing display is &ldquo;Save $46&rdquo; — that&apos;s the
          retail value of the freebies, given for free. Cost to us is
          pennies; perceived savings is double-digit %.
        </p>
        <p>
          Implementation: <code>getOccasionPackages.ts</code> Recipe shape
          has separate <code>alcohol</code> and <code>freebies</code> arrays.
          The Package object gets <code>packagePrice</code> (sum of alcohol
          retail) and <code>freebiesValue</code> (sum of freebie retail).
          Card UI displays them clearly: an &ldquo;INCLUDED ALCOHOL&rdquo;
          section above and a &ldquo;FREE PARTY SUPPLIES (BUNDLED IN)&rdquo;
          section below.
        </p>

        {/* Section 4: replication for party boat */}
        <h2>4. Replication guide for the party boat business</h2>
        <p>
          Same 4 audiences (bachelor, bachelorette, corporate, wedding) but
          the product is now a 3-6 hour boat charter, not alcohol delivery.
          Here&apos;s the porting plan.
        </p>

        <h3>4.1 Audiences (unchanged)</h3>
        <ul>
          <li>
            Bachelor → 4-hour bachelor cruise on Lake Travis
          </li>
          <li>
            Bachelorette → 5-hour sunset bachelorette yacht
          </li>
          <li>
            Corporate → half-day team-building charter / client outing
          </li>
          <li>
            Wedding → ceremony &amp; reception on the water, or pre/post
            wedding cruise
          </li>
        </ul>

        <h3>4.2 What changes from POD → party boat</h3>
        <div className="overflow-x-auto not-prose my-4">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left p-3 border border-gray-200">Component</th>
                <th className="text-left p-3 border border-gray-200">POD (alcohol)</th>
                <th className="text-left p-3 border border-gray-200">Party boat</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-3 border border-gray-200">Pricing model</td>
                <td className="p-3 border border-gray-200">Per-package, alcohol $/unit</td>
                <td className="p-3 border border-gray-200">Per-hour or half-day/full-day</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="p-3 border border-gray-200">Catalog source</td>
                <td className="p-3 border border-gray-200">Postgres products table (1100+ SKUs)</td>
                <td className="p-3 border border-gray-200">Boat fleet (10-30 vessels) + add-ons (catering, DJ, photographer)</td>
              </tr>
              <tr>
                <td className="p-3 border border-gray-200">Modal flow</td>
                <td className="p-3 border border-gray-200">5 steps (basics → beer → spirits → mixers → review)</td>
                <td className="p-3 border border-gray-200">5 steps: basics (date, group size, vibe) → boat selection → add-ons (catering, DJ) → drink package (link to POD) → review</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="p-3 border border-gray-200">Featured package</td>
                <td className="p-3 border border-gray-200">$285-$599 by occasion</td>
                <td className="p-3 border border-gray-200">$1,200-$3,500 by occasion (charters cost 5-10× alcohol)</td>
              </tr>
              <tr>
                <td className="p-3 border border-gray-200">Trust signals</td>
                <td className="p-3 border border-gray-200">TABC license, 60-min delivery, 4.9★</td>
                <td className="p-3 border border-gray-200">USCG-certified captains, $2M liability, fully insured, 4.9★</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="p-3 border border-gray-200">Venues section</td>
                <td className="p-3 border border-gray-200">Delivery zones (Rainey, Lake Travis, etc.)</td>
                <td className="p-3 border border-gray-200">Marinas + cruise areas (Lake Travis, Lady Bird Lake, Lake Austin)</td>
              </tr>
              <tr>
                <td className="p-3 border border-gray-200">FAQ topics</td>
                <td className="p-3 border border-gray-200">Delivery time, refunds, age check</td>
                <td className="p-3 border border-gray-200">Cancellation policy, weather, BYOB rules, captain tip, dock pickup</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="p-3 border border-gray-200">Freebies (10% savings)</td>
                <td className="p-3 border border-gray-200">Cups, ice, ping-pong</td>
                <td className="p-3 border border-gray-200">Speaker, cooler stocked with ice, floats, branded koozies, photo package</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3>4.3 Step-by-step port</h3>
        <ol>
          <li>
            Copy{' '}
            <code>src/components/landing/</code> wholesale into the boat
            repo. The template is product-agnostic.
          </li>
          <li>
            Rewrite <code>configs/bachelor.ts</code> etc. with boat copy.
            Keep the same shape (<code>LandingConfig</code>); change every
            string.
          </li>
          <li>
            Replace <code>getCuratedCatalog.ts</code> with{' '}
            <code>getBoatFleet.ts</code> — query the boat catalog (Supabase
            tables: <code>boats</code>, <code>boat_options</code>,{' '}
            <code>add_ons</code>). Return shape stays the same:{' '}
            <code>{`{ stepOneCategories, stepTwoCategories, stepThreeCategories, productById }`}</code>.
            Categorize: Step 1 = boat type (pontoon / yacht / party barge),
            Step 2 = add-ons (catering / DJ / photographer), Step 3 = drink
            packages (linked to POD via the Concierge API).
          </li>
          <li>
            Replace <code>getOccasionPackages.ts</code> with{' '}
            <code>getBoatPackages.ts</code> — recipes reference real boat
            handles, real hourly rates, real add-on prices. The pricing
            shape stays identical: alcohol → boat charter, freebies → cooler
            kit.
          </li>
          <li>
            Update modal step labels in each config (
            <code>modal.steps</code>) — &ldquo;Beer&rdquo; becomes
            &ldquo;Pick your boat&rdquo;, etc.
          </li>
          <li>
            Wire the modal&apos;s &ldquo;drinks&rdquo; step to the POD
            public API (<code>/api/public/v1/products</code>) per the
            Premier Concierge architecture so customers add alcohol to the
            same cart and it routes to POD&apos;s Stripe.
          </li>
          <li>
            Update <code>next.config.ts</code> image{' '}
            <code>remotePatterns</code> to allow Supabase Storage hostnames.
          </li>
          <li>
            Add <code>export const dynamic = &lsquo;force-dynamic&rsquo;</code> to each
            page.tsx — critical, do not skip.
          </li>
          <li>
            Set up the directory page at <code>/landing-pages</code> with{' '}
            <code>robots: {`{ index: false, follow: false }`}</code> for
            internal preview tabs.
          </li>
          <li>
            Connect Google Ads campaigns: one ad group per audience, each
            ad group&apos;s landing page = the matching event URL.
          </li>
        </ol>

        <h3>4.4 Sample hero copy for the boat business</h3>
        <p className="not-prose bg-gray-50 border-l-4 border-gray-900 p-4 my-4">
          <strong>Bachelor (boat):</strong>
          <br />
          Eyebrow: BACHELOR PARTY · LAKE TRAVIS
          <br />
          Headline line 1: Your bach party,
          <br />
          Headline line 2 (color): on a 50-foot boat.
          <br />
          Subhead: Captain, fuel, ice cooler, and 6 hours on Lake Travis —
          locked in. Beer &amp; food drop-shipped to the dock so nobody
          carries a thing.
          <br />
          CTA: BUILD MY BOAT PACKAGE →
        </p>
        <p className="not-prose bg-gray-50 border-l-4 border-gray-900 p-4 my-4">
          <strong>Wedding (boat):</strong>
          <br />
          Eyebrow: WEDDING ON THE WATER · AUSTIN
          <br />
          Headline line 1: Say &lsquo;I do&rsquo; on Lake Travis,
          <br />
          Headline line 2 (color): with a champagne toast at sunset.
          <br />
          Subhead: 60-200 guest yacht charters with floral, catering, DJ,
          and dock-side photography handled in one bookable package.
          <br />
          CTA: PLAN YOUR WEDDING CRUISE →
        </p>

        {/* Section 5: prompt for the agent */}
        <h2>5. Drop-in prompt for the AI agent</h2>
        <p>
          Paste this into a fresh Claude Code session in the boat repo.
          It&apos;s self-contained and references this document so the agent
          starts with full context.
        </p>
        <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto text-xs whitespace-pre-wrap">
          {`Build 4 high-converting Google-Ads landing pages for our Austin
party boat business, replicating the Party On Delivery system.

Reference doc: https://partyondelivery.com/landing-page-playbook
(read this first — it has the full methodology and architecture)

Audiences (one URL each):
  - /austin-bachelor-boat-party
  - /austin-bachelorette-boat-cruise
  - /austin-corporate-yacht-charter
  - /austin-wedding-on-the-water

Constraints:
  - Use Wes McDowell's above-the-fold formula (eyebrow + 2-line headline
    + subhead + 1 CTA + 4 trust badges + customer-in-scene hero image)
  - Same 11-section structure as POD: hero → trust stats → pain/solution
    → packages → how it works → venues → reviews → FAQ → final CTA
  - One template + four configs. Don't fork the template per audience.
  - Each config gets its own color scheme + tone (see playbook §2)
  - Three packages per audience, middle one "MOST BOOKED"
  - Itemized "See what's inside" dropdown showing real boat hourly rates
    + real add-on prices + bundled freebies
  - Pricing model: charter price = full retail; "Save $X" badge = retail
    value of bundled high-margin freebies (cooler kit, koozies, speaker)
  - Force-dynamic on every page (export const dynamic = 'force-dynamic')
  - Modal links to POD's public API for the alcohol step (see Premier
    Concierge spec)
  - Internal directory page at /landing-pages, noindex'd
  - All product/boat data from Supabase, never hardcoded

Deliverable:
  1. 4 page.tsx files (async server components)
  2. Shared LandingPageTemplate.tsx + PackageBuilderModal.tsx
  3. 4 config files in components/landing/configs/
  4. lib/landing/getBoatFleet.ts and getBoatPackages.ts
  5. Internal directory at /landing-pages
  6. All deployed to Netlify with the boat domain

Do not invent product data — query the Supabase boats + add_ons tables
and use real hourly rates.`}
        </pre>

        {/* Section 6: sources */}
        <h2>6. Sources &amp; references</h2>
        <ul>
          <li>
            <strong>Wes McDowell — The Deep End podcast.</strong> Episodes
            on landing-page conversion, particularly the &ldquo;Above-the-fold
            audit&rdquo; episodes.{' '}
            <a
              className="text-blue-600 underline"
              href="https://wesmcdowell.com"
            >
              wesmcdowell.com
            </a>
          </li>
          <li>
            <strong>Wes McDowell YouTube channel</strong> — landing-page
            teardowns. Specific videos referenced:
            &ldquo;7 Landing Page Mistakes Killing Your Conversions&rdquo;
            and &ldquo;The 5-Second Hero Test.&rdquo;
          </li>
          <li>
            <strong>McDowell Marketing Group case studies</strong> — local
            service businesses; the &ldquo;Total Wine&rdquo; pain-point
            framing came from a similar liquor-delivery teardown video.
          </li>
          <li>
            <strong>Joanna Wiebe / Copyhackers</strong> — voice-of-customer
            research methodology (used for our review attribution and FAQ
            objection-handling).{' '}
            <a
              className="text-blue-600 underline"
              href="https://copyhackers.com"
            >
              copyhackers.com
            </a>
          </li>
          <li>
            <strong>Unbounce conversion benchmark report</strong> — used to
            set our &ldquo;3 packages with middle featured&rdquo; structure;
            their 2023 report shows this layout out-converts 1-package and
            5-package layouts by 14-22%.{' '}
            <a
              className="text-blue-600 underline"
              href="https://unbounce.com/conversion-benchmark-report/"
            >
              unbounce.com/conversion-benchmark-report
            </a>
          </li>
          <li>
            <strong>Schema.org</strong> — FAQPage and LocalBusiness JSON-LD
            spec for rich-result eligibility.
          </li>
          <li>
            <strong>Internal:</strong>{' '}
            <code>docs/PUBLIC-API-SPEC.md</code> — Party On Delivery public
            API contract used to wire the Concierge / boat alcohol step.
          </li>
          <li>
            <strong>Internal:</strong>{' '}
            <code>memory/design-system.md</code> + <code>src/app/globals.css</code>{' '}
            — POD design tokens (the color hex codes in §2.1 are pulled from
            here).
          </li>
        </ul>

        <h2>7. Audit checklist (run this before launching any new audience)</h2>
        <ul>
          <li>
            ☐ Hero passes the 5-second test: can a stranger tell what you
            sell, who it&apos;s for, and how to buy it?
          </li>
          <li>
            ☐ Headline word-matches the Google Ad ad-group keyword
          </li>
          <li>
            ☐ Single primary CTA, repeated 5+ times, all pointing at the
            same conversion event
          </li>
          <li>
            ☐ Hero image has people in scene, not flat-lay product
          </li>
          <li>☐ Trust badges directly under hero CTA</li>
          <li>☐ Pain → solution paragraph on screen 2</li>
          <li>☐ 3 packages, middle featured</li>
          <li>☐ Itemized dropdown on each package</li>
          <li>☐ Real local venue/place names mentioned</li>
          <li>☐ Reviews with named attribution</li>
          <li>☐ 6-8 FAQs handling actual buying objections</li>
          <li>
            ☐ Mobile-only sticky bottom CTA (
            <code>md:hidden</code>)
          </li>
          <li>☐ Schema.org FAQPage JSON-LD added</li>
          <li>
            ☐ <code>force-dynamic</code> + Prisma/Supabase try/catch
            fallback so a DB blip never 500s the page
          </li>
          <li>
            ☐ Internal preview tab added to{' '}
            <code>/landing-pages</code> directory
          </li>
          <li>
            ☐ Page noindex&apos;d only if it&apos;s gated/private; otherwise
            indexable so organic SEO eventually compounds
          </li>
        </ul>

        <footer className="not-prose mt-16 pt-8 border-t border-gray-200 text-sm text-gray-500">
          <p>
            Generated for Brian Hill · Party On Delivery →
            replication on a separate party boat repo. Print this page or
            click &ldquo;Copy as markdown&rdquo; at the top to drop into a
            new project&apos;s docs.
          </p>
        </footer>
      </article>

      {/* Print-only stylesheet to keep PDF output clean */}
      <style jsx global>{`
        @media print {
          .prose pre {
            white-space: pre-wrap;
            word-break: break-word;
            font-size: 10px;
            page-break-inside: avoid;
          }
          .prose h2,
          .prose h3 {
            page-break-after: avoid;
          }
          .prose table {
            page-break-inside: avoid;
          }
        }
      `}</style>
    </main>
  );
}
