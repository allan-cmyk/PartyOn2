/**
 * Brian's Stuff → Documentation tab.
 *
 * Static markdown-style doc explaining how IP-based enrichment works on
 * sites like RB2B, Common Room, Clearbit, IPinfo, etc. — and what we'd
 * need to wire up to do the same for Party On Delivery.
 *
 * No DB queries here. Pure reference material so Brian (and the team)
 * have a single place to look when deciding which enrichment vendor to
 * sign up for.
 */
export default function EnrichmentDocsView() {
  return (
    <div className="max-w-3xl space-y-6">
      <Section title="How IP-based visitor enrichment works">
        <p>
          Every visitor to partyondelivery.com hits our servers from a
          specific IP address. That IP can be matched against three
          different datasets to learn surprisingly detailed information
          about the visitor — even if they never fill out a form:
        </p>
        <ol className="list-decimal pl-6 space-y-1">
          <li>
            <strong>Geo data</strong> — city, region, country, postal code, ISP.
            Free or cheap (~$0.0001/lookup).
          </li>
          <li>
            <strong>Company / firmographic data</strong> — what company the
            IP belongs to, industry, employee count, revenue band. Mid-tier
            ($99–$500/mo).
          </li>
          <li>
            <strong>Person-level data</strong> — name, email, LinkedIn for
            the actual human visiting (US B2B only — privacy regulation
            limits this in EU). Premium ($500–$5,000/mo).
          </li>
        </ol>
      </Section>

      <Section title="What's already wired up on this site">
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>Visitor cookie</strong>: <code>pod_vsid</code> set on
            first page view, 1-year expiry. Every page view + form
            interaction is tied to this cookie.
          </li>
          <li>
            <strong>IP capture</strong>: the visitor&apos;s IP is recorded on
            <code> visitor_sessions.ip_address</code> on the first beacon.
            Vercel exposes this via <code>x-forwarded-for</code>.
          </li>
          <li>
            <strong>User-agent</strong> captured so we can split
            desktop/mobile/bot traffic.
          </li>
          <li>
            <strong>UTM tracking</strong> — utm_source/medium/campaign/
            content/term captured on the first page view of each session.
          </li>
          <li>
            <strong>Lead linking</strong>: when a visitor types into any
            form (Quick-Buy, Build-My-Package, etc.), a Lead row is
            created and the session is linked to it. All future events on
            that browser get attributed to the Lead automatically.
          </li>
        </ul>
        <p className="text-sm text-gray-600 italic">
          Translation: we already have the raw plumbing. We just need an
          enrichment vendor on the back end to fill in the geo / company
          columns.
        </p>
      </Section>

      <Section title="Vendors to evaluate">
        <Vendor
          name="IPinfo"
          price="Free for low volume, $99–$249/mo for production"
          gives="City, region, country, postal, ISP, ASN, company name + domain (paid plan), simple async detection"
          fit="Best entry-level option. Cheap, fast, no contracts. Good first integration."
          link="https://ipinfo.io"
        />
        <Vendor
          name="Clearbit Reveal (HubSpot)"
          price="Bundled with HubSpot Enterprise (~$1,200/mo)"
          gives="Full company firmographics (name, industry, size, revenue, tech stack), category tags, contact suggestions"
          fit="If we already pay for HubSpot, this turns on with a switch. Best company-level data."
          link="https://www.hubspot.com/products/breeze-intelligence"
        />
        <Vendor
          name="RB2B"
          price="Free up to 500 person matches / mo, $99+/mo paid plans"
          gives="LinkedIn profile of the actual human visiting (US only), routed to Slack in real-time"
          fit="THIS is what most 'we know who's on your site' tools are using. Highest signal for B2B sales (corporate landing page)."
          link="https://www.rb2b.com"
        />
        <Vendor
          name="Common Room"
          price="$0–$5,000/mo depending on usage"
          gives="Cross-channel identity graph (web + LinkedIn + community + email). Stitches anonymous visits to known leads."
          fit="Strong fit when we have multiple channels (Slack community, etc.). Overkill for site-only enrichment."
          link="https://www.commonroom.io"
        />
        <Vendor
          name="6sense / Demandbase"
          price="Enterprise ($30k+/yr)"
          gives="Full intent data, account-based marketing, predictive scoring"
          fit="Only worth it for an enterprise sales motion (Premier Concierge B2B). Skip for now."
          link="https://6sense.com"
        />
      </Section>

      <Section title="Recommended phased rollout">
        <ol className="list-decimal pl-6 space-y-1">
          <li>
            <strong>Phase 1 (now)</strong>: capture every visitor + every
            form submission with the schema we just shipped. Validate
            that data is flowing.
          </li>
          <li>
            <strong>Phase 2 (week 2)</strong>: wire up IPinfo on the
            <code> visitor-pixel</code> endpoint — populates
            <code> ip → city, region, country</code> within ~50ms of the
            beacon firing.
          </li>
          <li>
            <strong>Phase 3 (week 3)</strong>: add a Clearbit or RB2B
            integration for company-level enrichment. Bonus: trigger a
            Slack ping in <code>#sales-alerts</code> any time a known
            corporate domain visits the corporate landing page.
          </li>
          <li>
            <strong>Phase 4 (week 4+)</strong>: turn on the returning-
            visitor AI chat bubble (already scaffolded — see
            <code> ReturningVisitorBubble</code>). When a known lead
            returns with an unfinished cart, the bubble says &quot;Welcome
            back — finish your order?&quot; and offers to resume.
          </li>
        </ol>
      </Section>

      <Section title="Privacy / compliance notes">
        <ul className="list-disc pl-6 space-y-1">
          <li>
            IP-based geo lookup is legal everywhere — we don&apos;t need
            consent because the IP is already in our server logs.
          </li>
          <li>
            Company-level firmographics (Clearbit, IPinfo company plan)
            are also legal — we&apos;re matching public business data, not
            PII.
          </li>
          <li>
            Person-level enrichment (RB2B, Clearbit person) is
            <strong> US-only</strong> for now. EU/UK visitors get
            scrubbed of personal info by the vendor before it reaches us.
          </li>
          <li>
            All captured PII (name, email, phone) needs to be deletable
            on request. We&apos;ll add a <code>/api/v1/leads/delete</code>
            endpoint when we launch the AI chat.
          </li>
        </ul>
      </Section>

      <Section title="DB schema reference (already shipped)">
        <pre className="bg-gray-900 text-gray-100 text-xs rounded-md p-4 overflow-x-auto">
{`-- visitor_sessions (one per browser cookie)
id, cookie_id (unique), first_seen_at, last_seen_at,
page_view_count, event_count,
landing_page, referrer, utm_*,
ip_address, city, region, country, postal_code,
enriched_company, enriched_industry, enriched_role, enriched_size,
user_agent, device_type, metadata, lead_id

-- leads (one per identified human)
id, email, phone, first_name, last_name,
status (ANONYMOUS|PARTIAL|SUBMITTED|CONVERTED|ARCHIVED),
source_page, source_widget,
last_page, utm_*,
resume_cart (JSON snapshot for AI chat resume),
draft_order_id, order_id,
metadata, notes,
created_at, updated_at

-- lead_events (one per interaction)
id, lead_id, session_id,
type (PAGE_VIEW|FIELD_BLUR|STEP_COMPLETE|FORM_SUBMIT|...),
page, widget, field_name, field_value,
metadata, occurred_at`}
        </pre>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white border border-gray-200 rounded-md p-5 space-y-3">
      <h2 className="text-lg font-bold tracking-wide text-gray-900">{title}</h2>
      <div className="text-sm text-gray-700 leading-relaxed space-y-3">{children}</div>
    </section>
  );
}

function Vendor({
  name,
  price,
  gives,
  fit,
  link,
}: {
  name: string;
  price: string;
  gives: string;
  fit: string;
  link: string;
}) {
  return (
    <div className="border-l-4 border-purple-500 pl-3 py-1">
      <div className="flex items-baseline gap-2 flex-wrap">
        <a
          href={link}
          target="_blank"
          rel="noreferrer"
          className="font-bold text-purple-700 hover:underline text-base"
        >
          {name}
        </a>
        <span className="text-xs text-gray-500">{price}</span>
      </div>
      <div className="text-xs text-gray-700 mt-1">
        <strong>What you get:</strong> {gives}
      </div>
      <div className="text-xs text-gray-600 mt-0.5 italic">{fit}</div>
    </div>
  );
}
