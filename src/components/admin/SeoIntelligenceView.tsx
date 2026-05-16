import Link from 'next/link';

/**
 * Brian's Stuff → SEO Intelligence Module tab.
 *
 * Handoff documentation for the POD Claude agent. Reads the system prompt
 * + bootstrap instructions inline so any engineer can stand the module up
 * without hunting through external docs.
 *
 * The actual SEO module lives in a separate GitHub repo (link below). This
 * tab is the in-app authoritative source for the handoff process.
 */
const REPO_URL =
  'https://github.com/premieratx/CruiseConcierge/tree/seo-fixes-only/seo-intelligence-module';
const README_URL = `${REPO_URL}/README.md`;
const BRIEF_URL = `${REPO_URL}/AGENT_BRIEF.md`;

export default function SeoIntelligenceView() {
  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="rounded-md border border-emerald-300 bg-emerald-50 p-5">
        <h2 className="text-xl font-bold text-emerald-900 tracking-wide">
          🔭 SEO Intelligence Module — Handoff
        </h2>
        <p className="text-sm text-emerald-900 mt-2 leading-relaxed">
          Multi-tenant SEO intelligence system that scrapes positions,
          synthesizes strategy, and pushes <code>6–12 strategic projects</code>{' '}
          into the <code>seo_projects</code> table within 30 minutes of the
          first run. Lives in the Cruise Concierge repo and is wired into
          Party On Delivery as a tenant.
        </p>
        <p className="text-xs text-emerald-800 mt-2 italic">
          This tab is the canonical handoff doc. Paste the brief into the POD
          Claude agent&apos;s system prompt + drop the repo link, and it can take
          it from there.
        </p>
      </div>

      {/* Quick links */}
      <div className="grid sm:grid-cols-3 gap-3">
        <ResourceLink
          label="GitHub directory"
          href={REPO_URL}
          sub="seo-intelligence-module/"
        />
        <ResourceLink label="README.md" href={README_URL} sub="Read this first" />
        <ResourceLink label="AGENT_BRIEF.md" href={BRIEF_URL} sub="System prompt" />
      </div>

      {/* Verbatim handoff */}
      <Section title="Handoff message — copy/paste to the POD Claude agent">
        <div className="rounded-md bg-gray-900 text-gray-100 p-5 text-sm leading-relaxed">
          <p className="mb-3">
            <span className="font-bold text-emerald-300">Tell them:</span>{' '}
            &quot;Read <code className="text-amber-300">seo-intelligence-module/README.md</code>,
            then <code className="text-amber-300">AGENT_BRIEF.md</code>. Fill out{' '}
            <code className="text-amber-300">tenants/party-on-delivery.json</code> from
            the template, then run{' '}
            <code className="text-amber-300">scripts/bootstrap-tenant.sh</code>.
            Within 30 minutes of the first scrape you&apos;ll have 6–12 strategic
            projects ready in <code className="text-amber-300">seo_projects</code>.&quot;
          </p>
          <p className="text-xs text-gray-400 mt-4 leading-relaxed">
            For their context window, paste <code className="text-amber-300">AGENT_BRIEF.md</code>{' '}
            verbatim into their system prompt + drop a link to the GitHub directory.
            Everything else can be read on-demand:
          </p>
          <p className="mt-2">
            <Link
              href={REPO_URL}
              target="_blank"
              rel="noreferrer"
              className="text-emerald-300 underline break-all"
            >
              {REPO_URL}
            </Link>
          </p>
        </div>
      </Section>

      {/* Walkthrough */}
      <Section title="What the agent will do (in order)">
        <ol className="list-decimal pl-6 space-y-2 text-sm text-gray-800">
          <Step n="1" title="Read the docs">
            Opens <code>README.md</code> for architecture overview, then{' '}
            <code>AGENT_BRIEF.md</code> for tenant-onboarding contract.
          </Step>
          <Step n="2" title="Fill tenant config">
            Copies the template, populates{' '}
            <code>tenants/party-on-delivery.json</code> with brand keywords,
            competitor domains, geo focus (Austin), priority pages
            (landing pages, /flyer, blog), and Search Console / SEMrush API
            tokens.
          </Step>
          <Step n="3" title="Bootstrap">
            Runs <code>scripts/bootstrap-tenant.sh</code>. Provisions the
            scraper, scheduling, and downstream synthesis pipeline.
          </Step>
          <Step n="4" title="First scrape ≤ 30 min">
            Pulls rankings, keyword gaps, backlink deltas, technical-audit
            findings. Writes raw data + a synthesized strategy doc.
          </Step>
          <Step n="5" title="Strategic projects ready">
            Inserts 6–12 prioritized <code>seo_projects</code> rows (each
            with hypothesis, target keywords, page targets, expected lift,
            and a one-week execution plan).
          </Step>
        </ol>
      </Section>

      {/* What lives where */}
      <Section title="File map">
        <pre className="bg-gray-900 text-gray-100 text-xs rounded-md p-4 overflow-x-auto">
{`seo-intelligence-module/
├── README.md                   ← start here
├── AGENT_BRIEF.md              ← paste verbatim into system prompt
├── tenants/
│   └── party-on-delivery.json  ← fill this in (template provided)
├── scripts/
│   ├── bootstrap-tenant.sh     ← one-time setup per tenant
│   ├── scrape.sh               ← scheduled position/SERP scrape
│   └── synthesize.sh           ← turns raw scrape into seo_projects
├── lib/                        ← shared TS modules
└── workers/                    ← background workers (Vercel cron)`}
        </pre>
      </Section>

      {/* Where POD plugs in */}
      <Section title="How this connects to Party On Delivery">
        <ul className="list-disc pl-6 space-y-2 text-sm text-gray-800">
          <li>
            <strong>Output table</strong>: <code>seo_projects</code> rows can be
            mirrored into POD&apos;s Postgres (Neon) via a sync worker so they
            show up next to Brian&apos;s Stuff → Operations later.
          </li>
          <li>
            <strong>Inputs</strong>: scraper pulls from Google Search Console
            (already wired in <code>src/lib/analytics/</code>) + SEMrush
            (Cowork skill at <code>seo-semrush-snapshot</code>).
          </li>
          <li>
            <strong>Cadence</strong>: weekly synthesis pass, daily delta
            scrapes. Schedule managed by the module&apos;s own cron — not POD&apos;s
            <code>vercel.json</code>.
          </li>
          <li>
            <strong>Owner</strong>: SEO Director sub-agent
            (<code>.claude/agents/seo-director.md</code> in this repo)
            consumes the synthesized projects + decides which to action.
          </li>
        </ul>
      </Section>

      {/* Already-have context for the POD agent */}
      <Section title="Context the POD agent already has on hand">
        <p className="text-sm text-gray-700 mb-2">
          When you brief the agent, remind it these are already available
          locally — no need to re-collect:
        </p>
        <ul className="list-disc pl-6 space-y-1 text-sm text-gray-800">
          <li>
            <code>docs/WEBSITE-ANALYTICS.md</code> — nightly snapshot of GA4,
            Search Console, Vercel, GBP, orders, margins
          </li>
          <li>
            <code>data/seo/semrush/&lt;YYYY-MM-DD&gt;/</code> — weekly SEMrush
            captures (Position, Organic, Backlinks, Site Audit, Keyword
            Magic)
          </li>
          <li>
            <code>scripts/topics.json</code> — 107 published blog topics, used
            for content-gap analysis
          </li>
          <li>
            <code>src/lib/analytics/</code> — GA4 + Search Console admin
            endpoints behind <code>requireOpsAuth</code>
          </li>
          <li>
            <code>prisma/schema.prisma</code> — <code>BlogPost</code>,{' '}
            <code>Product</code>, <code>Order</code>, and the new{' '}
            <code>Lead</code>/<code>VisitorSession</code> tables for
            attribution
          </li>
        </ul>
      </Section>

      {/* TL;DR for sharing */}
      <Section title="One-paragraph TL;DR (for forwarding)">
        <div className="rounded-md p-4 bg-amber-50 border border-amber-200 text-sm text-amber-900 leading-relaxed">
          <strong>SEO Intelligence Module</strong> is a multi-tenant scraper +
          synthesizer that turns Search Console / SEMrush / SERP data into 6–12
          ready-to-execute SEO projects per tenant. To onboard POD: paste{' '}
          <code>AGENT_BRIEF.md</code> from{' '}
          <Link
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            className="underline font-semibold"
          >
            this repo
          </Link>{' '}
          into the POD Claude agent&apos;s system prompt, point it at the GitHub
          directory, and tell it to fill in{' '}
          <code>tenants/party-on-delivery.json</code> and run{' '}
          <code>scripts/bootstrap-tenant.sh</code>. First strategic-projects
          batch lands in <code>seo_projects</code> within 30 minutes.
        </div>
      </Section>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white border border-gray-200 rounded-md p-5">
      <h2 className="text-lg font-bold tracking-wide text-gray-900 mb-3">
        {title}
      </h2>
      <div className="text-sm text-gray-700 leading-relaxed space-y-2">
        {children}
      </div>
    </section>
  );
}

function ResourceLink({
  label,
  href,
  sub,
}: {
  label: string;
  href: string;
  sub: string;
}) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noreferrer"
      className="rounded-md border border-gray-200 bg-white p-4 hover:border-emerald-400 hover:bg-emerald-50 transition-colors block"
    >
      <div className="text-[10px] font-bold tracking-widest text-emerald-700">
        OPEN →
      </div>
      <div className="font-bold text-sm text-gray-900 mt-1 break-words">
        {label}
      </div>
      <div className="text-xs text-gray-500 mt-0.5">{sub}</div>
    </Link>
  );
}

function Step({
  n,
  title,
  children,
}: {
  n: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li className="leading-relaxed">
      <span className="font-bold text-emerald-700">#{n} {title}.</span>{' '}
      <span className="text-gray-700">{children}</span>
    </li>
  );
}
