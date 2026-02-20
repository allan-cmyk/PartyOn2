import type { Metadata } from 'next';
import Button from '@/components/Button';

export const metadata: Metadata = {
  title: 'Design System Reference | Party On',
  robots: 'noindex, nofollow',
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-16">
      <h2 className="font-heading text-3xl md:text-4xl tracking-[0.1em] text-gray-900 mb-2">
        {title}
      </h2>
      <div className="w-16 h-px bg-brand-yellow mb-8" />
      {children}
    </section>
  );
}

function ColorSwatch({ name, hex, className, textClass = 'text-white' }: { name: string; hex: string; className: string; textClass?: string }) {
  return (
    <div className="flex flex-col">
      <div className={`${className} ${textClass} rounded-xl h-24 flex items-end p-4 shadow-sm`}>
        <span className="text-sm font-mono opacity-80">{hex}</span>
      </div>
      <p className="text-sm font-medium text-gray-900 mt-2">{name}</p>
      <p className="text-sm text-gray-500 font-mono">{className.replace('bg-', '')}</p>
    </div>
  );
}

export default function DesignExamplePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gray-900 text-white py-12 mb-12">
        <div className="container-custom">
          <p className="text-sm font-heading uppercase tracking-[0.1em] text-brand-yellow mb-2">
            Internal Reference
          </p>
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl tracking-[0.1em]">
            Design System
          </h1>
          <p className="text-gray-400 mt-3 font-sans text-sm max-w-xl">
            Every UI element on Party On should match these patterns. Use this page as your
            source of truth when building or reviewing components.
          </p>
        </div>
      </div>

      <div className="container-custom pb-20">

        {/* ========== COLORS ========== */}
        <Section title="Brand Colors">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <ColorSwatch name="Brand Blue" hex="#0B74B8" className="bg-brand-blue" />
            <ColorSwatch name="Brand Yellow" hex="#F2D34F" className="bg-brand-yellow" textClass="text-gray-900" />
            <ColorSwatch name="Gold" hex="#D4AF37" className="bg-gold" />
            <ColorSwatch name="Black" hex="#191C1F" className="bg-[#191C1F]" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
            <ColorSwatch name="Gray 50" hex="#F9FAFB" className="bg-gray-50" textClass="text-gray-900" />
            <ColorSwatch name="Gray 100" hex="#F3F4F6" className="bg-gray-100" textClass="text-gray-900" />
            <ColorSwatch name="Gray 200" hex="#E5E7EB" className="bg-gray-200" textClass="text-gray-900" />
            <ColorSwatch name="Gray 500" hex="#6B7280" className="bg-gray-500" />
            <ColorSwatch name="Gray 700" hex="#374151" className="bg-gray-700" />
            <ColorSwatch name="Gray 900" hex="#111827" className="bg-gray-900" />
          </div>

          <div className="bg-gray-50 rounded-xl p-6 space-y-3">
            <h3 className="font-heading text-lg font-bold tracking-[0.08em] text-gray-900">
              Color Contrast Rules
            </h3>
            <ul className="text-sm text-gray-700 space-y-2 font-sans">
              <li><strong>White/light backgrounds:</strong> Text must be text-gray-900/700/600. Never yellow or gold text.</li>
              <li><strong>Yellow backgrounds:</strong> Text must be text-gray-900. Never white text.</li>
              <li><strong>Dark backgrounds:</strong> Text must be text-white or text-brand-yellow. Never dark text.</li>
            </ul>
          </div>
        </Section>

        {/* ========== TYPOGRAPHY ========== */}
        <Section title="Typography">
          <div className="space-y-8">
            <div>
              <p className="text-sm font-mono text-gray-400 mb-1">
                font-heading (Barlow Condensed) -- all headings
              </p>
              <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl tracking-[0.1em] text-gray-900">
                H1 Heading
              </h1>
              <p className="text-sm font-mono text-gray-400 mt-1">
                text-4xl md:text-5xl lg:text-6xl tracking-[0.1em]
              </p>
            </div>

            <div>
              <h2 className="font-heading text-3xl md:text-4xl tracking-[0.1em] text-gray-900">
                H2 Heading
              </h2>
              <p className="text-sm font-mono text-gray-400 mt-1">
                text-3xl md:text-4xl tracking-[0.1em]
              </p>
            </div>

            <div>
              <h3 className="font-heading text-2xl tracking-[0.1em] text-gray-900">
                H3 Heading
              </h3>
              <p className="text-sm font-mono text-gray-400 mt-1">
                text-2xl tracking-[0.1em]
              </p>
            </div>

            <div>
              <h4 className="font-heading text-lg font-bold tracking-[0.08em] text-gray-900">
                H4 Heading -- Used for Section Titles, Card Headers, Dashboard Categories
              </h4>
              <p className="text-sm font-mono text-gray-400 mt-1">
                text-lg font-bold tracking-[0.08em]
              </p>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <p className="text-sm font-mono text-gray-400 mb-1">
                font-sans (Inter) -- all body text
              </p>
              <p className="font-sans text-base text-gray-900 mb-2">
                Body text (text-base / 16px). This is what regular paragraph content looks like across the site.
                Inter is used for all non-heading text.
              </p>
              <p className="font-sans text-sm text-gray-700 mb-2">
                Small body text (text-sm / 14px). Used for descriptions, secondary info, helper text, captions, timestamps.
                This is the minimum size for user-readable content.
              </p>
              <p className="font-sans text-sm text-gray-500 mb-2">
                Extra small text (text-xs / 12px). Reserved for badges and tags ONLY. Do not use for body copy, labels, or helper text.
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-2">
                <p className="text-sm text-red-800 font-medium">
                  Minimum text size: text-sm (14px) for all user-readable content. Only badges/tags may use text-xs (12px).
                  Never use text-[10px] or text-[11px].
                </p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <p className="text-sm font-mono text-gray-400 mb-2">Eyebrow / Label</p>
              <p className="text-sm font-heading uppercase tracking-[0.08em] text-gray-500">
                Eyebrow Label Text
              </p>
              <p className="text-sm font-mono text-gray-400 mt-1">
                text-sm font-heading uppercase tracking-[0.08em]
              </p>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <p className="text-sm font-mono text-gray-400 mb-2">Button text style (applied by Button component)</p>
              <p className="font-sans font-semibold tracking-[0.08em] text-sm text-gray-900">
                Button Text Sample
              </p>
              <p className="text-sm font-mono text-gray-400 mt-1">
                font-sans font-semibold tracking-[0.08em]
              </p>
            </div>
          </div>
        </Section>

        {/* ========== BUTTONS ========== */}
        <Section title="Buttons">
          <p className="text-sm text-gray-600 mb-6 max-w-xl">
            Always use the Button component or .btn CSS classes. Never rounded-full.
            All buttons get font-semibold tracking-[0.08em] automatically.
          </p>

          {/* Variants */}
          <div className="space-y-8">
            <div>
              <h4 className="font-heading text-lg font-bold tracking-[0.08em] text-gray-900 mb-4">
                Variants
              </h4>
              <div className="flex flex-wrap gap-4 items-start">
                <div className="space-y-2">
                  <Button variant="primary">Primary</Button>
                  <p className="text-sm font-mono text-gray-400">variant=&quot;primary&quot;</p>
                  <p className="text-sm text-gray-500">Default actions, secondary CTAs</p>
                </div>
                <div className="space-y-2">
                  <Button variant="cart">Cart / Add</Button>
                  <p className="text-sm font-mono text-gray-400">variant=&quot;cart&quot;</p>
                  <p className="text-sm text-gray-500">Primary CTAs, add to cart, checkout</p>
                </div>
                <div className="space-y-2">
                  <Button variant="secondary">Secondary</Button>
                  <p className="text-sm font-mono text-gray-400">variant=&quot;secondary&quot;</p>
                  <p className="text-sm text-gray-500">Outline/alternative actions</p>
                </div>
                <div className="space-y-2">
                  <Button variant="ghost">Ghost</Button>
                  <p className="text-sm font-mono text-gray-400">variant=&quot;ghost&quot;</p>
                  <p className="text-sm text-gray-500">Tertiary, skip, back</p>
                </div>
              </div>
            </div>

            {/* Sizes */}
            <div>
              <h4 className="font-heading text-lg font-bold tracking-[0.08em] text-gray-900 mb-4">
                Sizes
              </h4>
              <div className="flex flex-wrap gap-4 items-end">
                <div className="space-y-2">
                  <Button variant="primary" size="sm">Small (sm)</Button>
                  <p className="text-sm font-mono text-gray-400">px-4 py-2 text-sm</p>
                </div>
                <div className="space-y-2">
                  <Button variant="primary" size="md">Medium (md)</Button>
                  <p className="text-sm font-mono text-gray-400">px-6 py-3 text-sm md:text-base</p>
                </div>
                <div className="space-y-2">
                  <Button variant="primary" size="lg">Large (lg)</Button>
                  <p className="text-sm font-mono text-gray-400">px-8 py-4 text-base md:text-lg</p>
                </div>
              </div>
            </div>

            {/* Full width */}
            <div>
              <h4 className="font-heading text-lg font-bold tracking-[0.08em] text-gray-900 mb-4">
                Full Width
              </h4>
              <div className="max-w-md space-y-3">
                <Button variant="primary" fullWidth>Full Width Primary</Button>
                <Button variant="cart" fullWidth>Full Width Cart</Button>
                <Button variant="secondary" fullWidth>Full Width Secondary</Button>
              </div>
            </div>

            {/* Disabled */}
            <div>
              <h4 className="font-heading text-lg font-bold tracking-[0.08em] text-gray-900 mb-4">
                Disabled State
              </h4>
              <div className="flex flex-wrap gap-4">
                <Button variant="primary" disabled>Disabled Primary</Button>
                <Button variant="cart" disabled>Disabled Cart</Button>
                <Button variant="secondary" disabled>Disabled Secondary</Button>
              </div>
            </div>

            {/* CSS class equivalents */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h4 className="font-heading text-lg font-bold tracking-[0.08em] text-gray-900 mb-4">
                CSS Class Equivalents
              </h4>
              <p className="text-sm text-gray-500 mb-4">
                When you cannot use the Button component (e.g. inside forms), use these CSS classes:
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="space-y-2">
                  <button className="btn-primary">btn-primary</button>
                  <p className="text-sm font-mono text-gray-400">.btn-primary</p>
                </div>
                <div className="space-y-2">
                  <button className="btn-cart">btn-cart</button>
                  <p className="text-sm font-mono text-gray-400">.btn-cart</p>
                </div>
                <div className="space-y-2">
                  <button className="btn-secondary">btn-secondary</button>
                  <p className="text-sm font-mono text-gray-400">.btn-secondary</p>
                </div>
                <div className="space-y-2">
                  <button className="btn-ghost">btn-ghost</button>
                  <p className="text-sm font-mono text-gray-400">.btn-ghost</p>
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* ========== INPUTS ========== */}
        <Section title="Form Inputs">
          <div className="max-w-md space-y-6">
            <div>
              <label className="block text-base font-medium text-gray-700 mb-2">
                Standard Input (.input-premium)
              </label>
              <input
                type="text"
                placeholder="Enter something..."
                className="input-premium"
              />
              <p className="text-sm text-gray-500 mt-1">
                Helper text goes here -- text-sm text-gray-500
              </p>
              <p className="text-sm font-mono text-gray-400 mt-2">
                text-base, border-2 border-gray-200 focus:border-brand-blue focus:ring-0 rounded-lg px-4 py-3
              </p>
            </div>

            <div>
              <label className="block text-base font-medium text-gray-700 mb-2">
                Select Input
              </label>
              <select className="input-premium">
                <option>Select an option</option>
                <option>Option 1</option>
                <option>Option 2</option>
              </select>
            </div>

            <div>
              <label className="block text-base font-medium text-gray-700 mb-2">
                Textarea
              </label>
              <textarea
                rows={3}
                placeholder="Enter details..."
                className="input-premium"
              />
            </div>

            <div>
              <label className="block text-base font-medium text-gray-700 mb-2">
                Checkbox
              </label>
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="mt-1 rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
                />
                <span className="text-base text-gray-700">
                  Checkbox label with brand-blue color
                </span>
              </label>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <p className="text-sm font-mono text-gray-400">Label pattern:</p>
              <p className="text-sm font-mono text-gray-600">
                text-base font-medium text-gray-700 mb-2
              </p>
              <p className="text-sm font-mono text-gray-400">Helper text pattern:</p>
              <p className="text-sm font-mono text-gray-600">
                text-sm text-gray-500 mt-1
              </p>
              <p className="text-sm font-mono text-gray-400">Checkbox/radio label:</p>
              <p className="text-sm font-mono text-gray-600">
                text-base text-gray-700
              </p>
            </div>
          </div>
        </Section>

        {/* ========== CARDS ========== */}
        <Section title="Cards">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="card">
              <h4 className="font-heading text-lg font-bold tracking-[0.08em] text-gray-900 mb-2">
                Standard Card
              </h4>
              <p className="text-sm text-gray-600 mb-4">
                Uses the .card class: rounded-xl, border, shadow-sm, hover:shadow-md, p-6.
              </p>
              <Button variant="primary" size="sm">Action</Button>
            </div>

            <div className="card">
              <h4 className="font-heading text-lg font-bold tracking-[0.08em] text-gray-900 mb-2">
                Card with Content
              </h4>
              <p className="text-sm text-gray-600 mb-4">
                Hover this card to see the shadow-md transition.
              </p>
              <Button variant="cart" size="sm">Add to Cart</Button>
            </div>

            <div className="card v2-card-hover">
              <h4 className="font-heading text-lg font-bold tracking-[0.08em] text-gray-900 mb-2">
                Card with Lift
              </h4>
              <p className="text-sm text-gray-600 mb-4">
                Adds .v2-card-hover for a translateY(-2px) lift effect on hover.
              </p>
              <Button variant="secondary" size="sm">Details</Button>
            </div>
          </div>
          <p className="text-sm font-mono text-gray-400">
            .card = bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md
          </p>
        </Section>

        {/* ========== PRODUCT CARD (Dashboard style) ========== */}
        <Section title="Product Card (Dashboard)">
          <p className="text-sm text-gray-600 mb-6 max-w-xl">
            Compact product cards for the dashboard grid. Uses rounded-xl, shadow-sm, hover:shadow-md.
            Add button uses cart style (bg-brand-yellow) with uppercase text and tracking.
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 max-w-3xl">
            {/* Example product card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
              <div className="aspect-square bg-gray-100 flex items-center justify-center text-gray-300">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="p-2 flex-1 flex flex-col">
                <h3 className="text-sm font-medium text-gray-900 line-clamp-2 leading-tight">
                  Example Product
                </h3>
                <p className="text-sm font-semibold text-gray-900 mt-1">$12.99</p>
                <div className="mt-auto pt-2">
                  <button className="w-full py-2 bg-brand-yellow text-gray-900 text-sm font-semibold tracking-[0.08em] rounded-lg hover:bg-yellow-400 active:bg-yellow-500 transition-colors">
                    ADD TO CART
                  </button>
                </div>
              </div>
            </div>

            {/* With quantity controls */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
              <div className="aspect-square bg-gray-100 flex items-center justify-center text-gray-300">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="p-2 flex-1 flex flex-col">
                <h3 className="text-sm font-medium text-gray-900 line-clamp-2 leading-tight">
                  In Cart Item
                </h3>
                <p className="text-sm font-semibold text-gray-900 mt-1">$9.99</p>
                <div className="mt-auto pt-2">
                  <div className="flex items-center justify-between bg-gray-100 rounded-lg">
                    <button className="w-8 h-8 flex items-center justify-center text-gray-700 hover:bg-gray-200 rounded-l-lg">
                      <span className="text-lg font-medium">-</span>
                    </button>
                    <span className="text-sm font-semibold text-gray-900">2</span>
                    <button className="w-8 h-8 flex items-center justify-center text-gray-700 hover:bg-gray-200 rounded-r-lg">
                      <span className="text-lg font-medium">+</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Out of stock */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
              <div className="relative aspect-square bg-gray-100 flex items-center justify-center text-gray-300">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-500">Out of stock</span>
                </div>
              </div>
              <div className="p-2 flex-1 flex flex-col">
                <h3 className="text-sm font-medium text-gray-900 line-clamp-2 leading-tight">
                  Sold Out Item
                </h3>
                <p className="text-sm font-semibold text-gray-900 mt-1">$15.99</p>
                <div className="mt-auto pt-2">
                  <button disabled className="w-full py-2 bg-brand-yellow text-gray-900 text-sm font-semibold tracking-[0.08em] rounded-lg opacity-50 cursor-not-allowed">
                    ADD TO CART
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* ========== MODALS ========== */}
        <Section title="Modals">
          <p className="text-sm text-gray-600 mb-6">
            All modals use rounded-2xl, backdrop-blur-sm, and bg-black/50 overlay.
          </p>
          <div className="relative bg-gray-900/10 rounded-2xl p-8 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl max-w-md mx-auto p-6">
              <h2 className="text-lg font-heading font-bold tracking-[0.08em] text-gray-900 mb-1">
                Modal Title
              </h2>
              <p className="text-sm text-gray-500 mb-5">
                Modal description text goes here.
              </p>
              <input
                type="text"
                placeholder="Input inside modal..."
                className="input-premium mb-4"
              />
              <div className="flex gap-3">
                <Button variant="ghost" size="sm">Cancel</Button>
                <Button variant="primary" size="sm">Confirm</Button>
              </div>
            </div>
          </div>
          <div className="mt-4 bg-gray-50 rounded-xl p-4">
            <p className="text-sm font-mono text-gray-400">
              Overlay: fixed inset-0 bg-black/50 backdrop-blur-sm<br />
              Modal: bg-white rounded-2xl shadow-xl max-w-lg p-6<br />
              Title: text-lg font-heading font-bold tracking-[0.08em]
            </p>
          </div>
        </Section>

        {/* ========== SELECTION TILES ========== */}
        <Section title="Selection Tiles">
          <p className="text-sm text-gray-600 mb-6">
            Used in onboarding, quiz steps, and multi-select options.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-md">
            <button className="p-3 rounded-lg border-2 border-yellow-500 bg-yellow-50 text-gray-900 text-sm font-medium transition-all">
              Selected
            </button>
            <button className="p-3 rounded-lg border-2 border-gray-200 hover:border-gray-300 text-gray-700 text-sm font-medium transition-all">
              Unselected
            </button>
            <button className="p-3 rounded-lg border-2 border-gray-200 hover:border-gray-300 text-gray-700 text-sm font-medium transition-all">
              Unselected
            </button>
          </div>
          <div className="mt-4 bg-gray-50 rounded-xl p-4">
            <p className="text-sm font-mono text-gray-400">
              Active: border-yellow-500 bg-yellow-50 text-gray-900<br />
              Inactive: border-gray-200 hover:border-gray-300 text-gray-700
            </p>
          </div>
        </Section>

        {/* ========== CALLOUT BOXES ========== */}
        <Section title="Callout Boxes">
          <div className="max-w-lg space-y-4">
            <div className="bg-brand-yellow/10 border-l-4 border-brand-yellow rounded-lg p-4">
              <p className="text-gray-900 font-semibold text-sm">Yellow callout</p>
              <p className="text-sm text-gray-700 mt-1">Used for tips, highlights, and promotional info.</p>
            </div>
            <div className="bg-blue-50 border-l-4 border-brand-blue rounded-lg p-4">
              <p className="text-gray-900 font-semibold text-sm">Blue callout</p>
              <p className="text-sm text-gray-700 mt-1">Used for informational messages.</p>
            </div>
            <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
              <p className="text-gray-900 font-semibold text-sm">Error callout</p>
              <p className="text-sm text-gray-700 mt-1">Used for error states and warnings.</p>
            </div>
            <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-4">
              <p className="text-gray-900 font-semibold text-sm">Success callout</p>
              <p className="text-sm text-gray-700 mt-1">Used for confirmation messages.</p>
            </div>
          </div>
        </Section>

        {/* ========== BADGES & TAGS ========== */}
        <Section title="Badges and Tags">
          <div className="flex flex-wrap gap-3 items-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-blue bg-blue-50 px-2 py-0.5 rounded">
              Host
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
              You
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-red-600 bg-red-50 px-2 py-0.5 rounded">
              Locked
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-green-700 bg-green-50 px-2 py-0.5 rounded">
              Paid
            </span>
            <span className="inline-block bg-brand-blue/10 text-brand-blue text-xs font-semibold rounded-lg px-2 py-1">
              Outcome Tag
            </span>
            <span className="bg-brand-yellow text-gray-900 text-xs font-bold px-2 py-0.5 rounded">
              2x
            </span>
          </div>
          <p className="text-sm font-mono text-gray-400 mt-3">
            Small badges: text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded<br />
            Outcome tags: bg-brand-blue/10 text-brand-blue text-xs font-semibold rounded-lg px-2 py-1
          </p>
        </Section>

        {/* ========== LAYOUT & SPACING ========== */}
        <Section title="Layout and Spacing">
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-xl p-6">
              <h4 className="font-heading text-lg font-bold tracking-[0.08em] text-gray-900 mb-3">
                Container
              </h4>
              <p className="text-sm font-mono text-gray-600 mb-2">
                .container-custom = max-w-7xl mx-auto px-4 md:px-6 lg:px-8
              </p>
              <div className="bg-brand-blue/10 border-2 border-dashed border-brand-blue/30 rounded-lg p-4 text-center text-sm text-brand-blue">
                max-w-7xl content area
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <h4 className="font-heading text-lg font-bold tracking-[0.08em] text-gray-900 mb-3">
                Section Spacing
              </h4>
              <div className="space-y-2 text-sm font-mono text-gray-600">
                <p>.section-padding = py-8 md:py-12 lg:py-16</p>
                <p>.section-padding-lg = py-12 md:py-16 lg:py-20</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <h4 className="font-heading text-lg font-bold tracking-[0.08em] text-gray-900 mb-3">
                Navigation Height
              </h4>
              <div className="space-y-2 text-sm font-mono text-gray-600">
                <p>Mobile: h-14 (56px)</p>
                <p>Desktop: h-16 (64px)</p>
                <p>Sticky elements: top-14 md:top-16 (NOT top-24)</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <h4 className="font-heading text-lg font-bold tracking-[0.08em] text-gray-900 mb-3">
                Shadows
              </h4>
              <div className="flex flex-wrap gap-6 mt-4">
                <div className="bg-white rounded-xl w-24 h-24 shadow-sm flex items-center justify-center text-sm text-gray-500">
                  shadow-sm
                </div>
                <div className="bg-white rounded-xl w-24 h-24 shadow-md flex items-center justify-center text-sm text-gray-500">
                  shadow-md
                </div>
                <div className="bg-white rounded-xl w-24 h-24 shadow-lg flex items-center justify-center text-sm text-gray-500">
                  shadow-lg
                </div>
                <div className="bg-white rounded-xl w-24 h-24 shadow-xl flex items-center justify-center text-sm text-gray-500">
                  shadow-xl
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* ========== DO / DON'T ========== */}
        <Section title="Rules">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <h4 className="font-heading text-lg font-bold tracking-[0.08em] text-green-800 mb-3">
                Do
              </h4>
              <ul className="text-sm text-green-900 space-y-2">
                <li>Use font-heading (Barlow Condensed) for all headings</li>
                <li>Use font-sans (Inter) for all body text</li>
                <li>Use rounded-lg on buttons</li>
                <li>Use rounded-xl on cards</li>
                <li>Use rounded-2xl on modals</li>
                <li>Use tracking-[0.08em] on all button text</li>
                <li>Use brand-blue for primary actions</li>
                <li>Use brand-yellow for cart/add-to-cart actions</li>
                <li>Add active: states to all buttons</li>
                <li>Max letter spacing: tracking-[0.1em]</li>
                <li>Minimum text-sm (14px) for all user-readable content</li>
                <li>Use text-base (16px) for form labels and input text</li>
              </ul>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <h4 className="font-heading text-lg font-bold tracking-[0.08em] text-red-800 mb-3">
                Don&apos;t
              </h4>
              <ul className="text-sm text-red-900 space-y-2">
                <li>Never use rounded-full on buttons</li>
                <li>Never use yellow/gold text on white backgrounds</li>
                <li>Never use white text on yellow backgrounds</li>
                <li>Never use bg-gray-900 for CTA buttons (use brand-blue or brand-yellow)</li>
                <li>Never use focus:ring-yellow (use focus:border-brand-blue focus:ring-0)</li>
                <li>Never use tracking wider than [0.1em]</li>
                <li>Never use font-medium on CTA buttons (always font-semibold)</li>
                <li>Never hardcode hex colors (use Tailwind tokens)</li>
                <li>Never use text-xs for body copy, labels, or helper text (minimum text-sm)</li>
                <li>Never use text-[10px] or text-[11px] anywhere</li>
                <li>Never use text-sm for form labels (use text-base)</li>
              </ul>
            </div>
          </div>
        </Section>

      </div>
    </div>
  );
}
