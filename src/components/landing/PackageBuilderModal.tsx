'use client';

// SHARED package builder modal — used by ALL landing pages.
// Accepts a `config` prop (LandingConfig) so styling, copy, and steps
// can be customized per event type without forking the component.

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import type {
  LandingConfig,
  BuilderProduct,
  Selection,
  BuilderCategory,
  Catalog,
} from './types';

type Props = {
  open: boolean;
  onClose: () => void;
  config: LandingConfig;
  catalog: Catalog;
};

const encodeImg = (src?: string) => (src ? encodeURI(src) : undefined);

export default function PackageBuilderModal({ open, onClose, config, catalog }: Props) {
  const T = config.theme;
  const M = config.modal;
  const STEPS = M.steps;
  const { stepOneCategories, stepTwoCategories, stepThreeCategories, productById } = catalog;

  const [stepIndex, setStepIndex] = useState(0);
  const [people, setPeople] = useState(M.defaultPeople);
  const [deliveryDate, setDeliveryDate] = useState<Date | null>(null);
  const [selection, setSelection] = useState<Selection>({});
  const [extraSelection, setExtraSelection] = useState<string[]>([]);

  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [submitMode, setSubmitMode] = useState<'quote' | 'checkout'>('quote');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const setQty = (id: string, qty: number) =>
    setSelection((prev) => {
      const next = { ...prev };
      if (qty <= 0) delete next[id];
      else next[id] = qty;
      return next;
    });
  const incQty = (id: string) => setQty(id, (selection[id] ?? 0) + 1);
  const decQty = (id: string) => setQty(id, Math.max(0, (selection[id] ?? 0) - 1));

  const lineItems = useMemo(
    () =>
      Object.entries(selection)
        .map(([id, qty]) => {
          const p = productById[id];
          if (!p) return null;
          return { product: p, qty, lineTotal: p.price * qty };
        })
        .filter(Boolean) as { product: BuilderProduct; qty: number; lineTotal: number }[],
    [selection],
  );

  const total = lineItems.reduce((s, li) => s + li.lineTotal, 0);
  const perPerson = people > 0 ? total / people : 0;
  const isLastStep = stepIndex === STEPS.length - 1;

  const next = () => setStepIndex((s) => Math.min(STEPS.length - 1, s + 1));
  const prev = () => setStepIndex((s) => Math.max(0, s - 1));

  const formatDate = (d: Date | null) =>
    d
      ? d.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : '';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = `${config.audienceTitleCase} Quote — ${contactName || 'Austin'} — ${people} ${M.groupSizeUnit}${
      deliveryDate ? ` — ${formatDate(deliveryDate)}` : ''
    }`;
    const body = [
      `${config.audienceTitleCase.toUpperCase()} PACKAGE QUOTE`,
      '',
      `Name: ${contactName}`,
      `Email: ${contactEmail}`,
      `Phone: ${contactPhone}`,
      `Delivery date: ${deliveryDate ? formatDate(deliveryDate) : '(not set)'}`,
      `${M.groupSizeLabel}: ${people}`,
      ...(M.extraQuestion && extraSelection.length
        ? [
            `${M.extraQuestion.label} ${extraSelection
              .map((v) => M.extraQuestion!.options.find((o) => o.value === v)?.label)
              .filter(Boolean)
              .join(', ')}`,
          ]
        : []),
      `Mode: ${submitMode === 'checkout' ? 'Wants payment link' : 'Email quote'}`,
      '',
      '— ITEMS —',
      ...lineItems.map(
        (li) =>
          `${li.qty}x ${li.product.name}${li.product.detail ? ` (${li.product.detail})` : ''} — $${li.lineTotal.toFixed(2)}`,
      ),
      '',
      `TOTAL: $${total.toFixed(2)}`,
      `PER ${M.groupSizeUnit.toUpperCase().slice(0, -1)}: $${perPerson.toFixed(2)}`,
    ].join('\n');
    window.location.href = `mailto:${config.quoteInbox}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSubmitted(true);
  };

  const reset = () => {
    setStepIndex(0);
    setSelection({});
    setSubmitted(false);
    setContactName('');
    setContactEmail('');
    setContactPhone('');
    setDeliveryDate(null);
    setPeople(M.defaultPeople);
    setExtraSelection([]);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-3 sm:px-6 py-4 sm:py-8"
      role="dialog"
      aria-modal="true"
      data-builder-version="shared-v1"
    >
      <button
        aria-label="Close package builder"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
        style={{
          background: `${T.navy}DD`,
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
        }}
        tabIndex={-1}
      />

      <div
        className="relative w-full max-w-3xl flex flex-col overflow-hidden rounded-2xl shadow-2xl"
        style={{
          maxHeight: '88vh',
          minHeight: 'min(540px, 88vh)',
          background: T.cream,
          border: `1px solid ${T.primary}33`,
        }}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full flex items-center justify-center text-white text-xl font-bold transition-all hover:scale-105"
          style={{ background: `${T.navy}D9`, boxShadow: '0 4px 12px rgba(0,0,0,0.25)' }}
        >
          ×
        </button>

        <div
          className="px-5 sm:px-7 pt-5 pb-4 flex-shrink-0 text-white"
          style={{ background: T.navy }}
        >
          <div className="flex items-center gap-3 pr-12">
            <div
              className="w-9 h-9 rounded-md flex items-center justify-center font-heading font-bold text-sm flex-shrink-0"
              style={{ background: T.primary, color: T.primaryText }}
            >
              POD
            </div>
            <div className="min-w-0">
              <div className="font-heading font-bold text-lg leading-tight">
                {M.title}
              </div>
              <div className="text-xs opacity-80">
                Step {stepIndex + 1} of {STEPS.length} · {STEPS[stepIndex].label}
              </div>
            </div>
          </div>
          <div className="flex gap-1.5 mt-4">
            {STEPS.map((s, i) => (
              <div
                key={s.key}
                className="flex-1 h-1 rounded-full transition-all duration-300"
                style={{
                  background: i <= stepIndex ? T.primary : 'rgba(255,255,255,0.18)',
                }}
              />
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 sm:px-7 py-5">
          {submitted ? (
            <SuccessPanel
              mode={submitMode}
              phone={config.phoneDisplay}
              theme={T}
              modal={M}
              onReset={reset}
              onClose={onClose}
            />
          ) : (
            <>
              {stepIndex === 0 && (
                <BasicsStep
                  people={people}
                  setPeople={setPeople}
                  deliveryDate={deliveryDate}
                  setDeliveryDate={setDeliveryDate}
                  modal={M}
                  theme={T}
                  extraSelection={extraSelection}
                  setExtraSelection={setExtraSelection}
                />
              )}
              {stepIndex === 1 && (
                <ProductGridStep
                  title={M.steps[1].label}
                  blurb={M.beerStepBlurb}
                  categories={stepOneCategories}
                  selection={selection}
                  onInc={incQty}
                  onDec={decQty}
                  theme={T}
                />
              )}
              {stepIndex === 2 && (
                <ProductGridStep
                  title={M.steps[2].label}
                  blurb={M.liquorStepBlurb}
                  categories={stepTwoCategories}
                  selection={selection}
                  onInc={incQty}
                  onDec={decQty}
                  theme={T}
                  tabbed
                />
              )}
              {stepIndex === 3 && (
                <ProductGridStep
                  title={M.steps[3].label}
                  blurb={M.mixersStepBlurb}
                  categories={stepThreeCategories}
                  selection={selection}
                  onInc={incQty}
                  onDec={decQty}
                  theme={T}
                />
              )}
              {stepIndex === 4 && (
                <ReviewStep
                  name={contactName}
                  email={contactEmail}
                  phone={contactPhone}
                  setName={setContactName}
                  setEmail={setContactEmail}
                  setPhone={setContactPhone}
                  deliveryDate={deliveryDate}
                  formatDate={formatDate}
                  people={people}
                  lineItems={lineItems}
                  total={total}
                  perPerson={perPerson}
                  submitMode={submitMode}
                  setSubmitMode={setSubmitMode}
                  onSubmit={handleSubmit}
                  modal={M}
                  theme={T}
                />
              )}
            </>
          )}
        </div>

        {!submitted && (
          <div
            className="flex-shrink-0 border-t flex items-center justify-between px-5 sm:px-7 py-3 gap-4"
            style={{ background: '#FFFFFF', borderColor: '#E5E7EB' }}
          >
            <div className="flex items-baseline gap-4 text-sm">
              <div>
                <span className="text-gray-500 mr-1.5">Total</span>
                <span className="font-heading text-xl font-bold" style={{ color: T.navy }}>
                  ${total.toFixed(2)}
                </span>
              </div>
              <div className="hidden sm:block">
                <span className="text-gray-500 mr-1.5">
                  Per {M.groupSizeUnit.replace(/s$/, '')} ({people})
                </span>
                <span className="font-heading text-lg font-bold" style={{ color: T.blue }}>
                  ${perPerson.toFixed(2)}
                </span>
              </div>
            </div>
            {lineItems.length > 0 && (
              <div className="hidden sm:block text-xs text-gray-500">
                {lineItems.reduce((s, li) => s + li.qty, 0)} item
                {lineItems.reduce((s, li) => s + li.qty, 0) !== 1 ? 's' : ''} ·{' '}
                {lineItems.length} product{lineItems.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        )}

        {!submitted && (
          <div
            className="flex-shrink-0 px-5 sm:px-7 py-3 flex items-center justify-between gap-3 border-t"
            style={{ background: T.cream, borderColor: '#E5E7EB' }}
          >
            <button
              onClick={prev}
              disabled={stepIndex === 0}
              className="px-3 py-2.5 text-sm font-semibold text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              style={{ color: stepIndex === 0 ? undefined : T.navy }}
            >
              ← Back
            </button>
            <a
              href={`tel:${config.phoneDisplay.replace(/\D/g, '')}`}
              className="hidden sm:block text-xs text-gray-500"
            >
              Need help?{' '}
              <span className="font-bold" style={{ color: T.blue }}>
                {config.phoneDisplay}
              </span>
            </a>
            {!isLastStep ? (
              <button
                onClick={next}
                className="px-6 py-3 font-bold rounded-md tracking-wide transition-all hover:scale-[1.02] shadow-md"
                style={{ background: T.primary, color: T.primaryText }}
              >
                {stepIndex === 0 ? 'Start Building →' : 'Next →'}
              </button>
            ) : (
              <button
                form="quote-form"
                type="submit"
                className="px-6 py-3 font-bold rounded-md tracking-wide transition-all hover:scale-[1.02] shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                style={{ background: T.primary, color: T.primaryText }}
                disabled={lineItems.length === 0 || !contactEmail || !contactName || !contactPhone}
              >
                {submitMode === 'checkout' ? 'Get Payment Link →' : 'Send My Quote →'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- INLINE CALENDAR ----------

function InlineCalendar({
  value,
  onChange,
  theme,
}: {
  value: Date | null;
  onChange: (d: Date | null) => void;
  theme: LandingConfig['theme'];
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const initial = value ?? today;
  const [view, setView] = useState({
    year: initial.getFullYear(),
    month: initial.getMonth(),
  });

  const goPrev = () =>
    setView((v) =>
      v.month === 0 ? { year: v.year - 1, month: 11 } : { year: v.year, month: v.month - 1 },
    );
  const goNext = () =>
    setView((v) =>
      v.month === 11 ? { year: v.year + 1, month: 0 } : { year: v.year, month: v.month + 1 },
    );

  const monthName = new Date(view.year, view.month).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
  const firstDay = new Date(view.year, view.month, 1).getDay();
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const isSameDay = (a: Date, b: Date | null) =>
    !!b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const isPast = (day: number) => {
    const d = new Date(view.year, view.month, day);
    return d < today;
  };

  return (
    <div
      className="rounded-lg border bg-white p-3 sm:p-4 select-none"
      style={{ borderColor: '#E5E7EB' }}
    >
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={goPrev}
          aria-label="Previous month"
          className="w-8 h-8 rounded-md hover:bg-gray-100 text-gray-600 flex items-center justify-center transition-colors"
        >
          ‹
        </button>
        <div className="font-heading font-bold text-base" style={{ color: theme.navy }}>
          {monthName}
        </div>
        <button
          type="button"
          onClick={goNext}
          aria-label="Next month"
          className="w-8 h-8 rounded-md hover:bg-gray-100 text-gray-600 flex items-center justify-center transition-colors"
        >
          ›
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={i}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (d === null) return <div key={i} />;
          const dateObj = new Date(view.year, view.month, d);
          const selected = isSameDay(dateObj, value);
          const past = isPast(d);
          const isToday = isSameDay(dateObj, today);
          return (
            <button
              key={i}
              type="button"
              disabled={past}
              onClick={() => onChange(dateObj)}
              className="aspect-square rounded-md text-sm font-medium transition-all"
              style={
                past
                  ? { color: '#D1D5DB', cursor: 'not-allowed' }
                  : selected
                  ? { background: theme.primary, color: theme.primaryText, fontWeight: 700 }
                  : isToday
                  ? { color: theme.navy, border: `1.5px solid ${theme.blue}` }
                  : { color: theme.navy }
              }
            >
              {d}
            </button>
          );
        })}
      </div>
      {value && (
        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-sm">
          <span className="text-gray-600">
            Selected:{' '}
            <span className="font-bold" style={{ color: theme.navy }}>
              {value.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </span>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-xs text-gray-500 hover:text-red-500"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
}

// ---------- STEP COMPONENTS ----------

function BasicsStep({
  people,
  setPeople,
  deliveryDate,
  setDeliveryDate,
  modal,
  theme,
  extraSelection,
  setExtraSelection,
}: {
  people: number;
  setPeople: (n: number) => void;
  deliveryDate: Date | null;
  setDeliveryDate: (d: Date | null) => void;
  modal: LandingConfig['modal'];
  theme: LandingConfig['theme'];
  extraSelection: string[];
  setExtraSelection: (v: string[]) => void;
}) {
  const toggleExtra = (v: string) =>
    setExtraSelection(
      extraSelection.includes(v)
        ? extraSelection.filter((x) => x !== v)
        : [...extraSelection, v],
    );
  return (
    <div>
      <h2 className="font-heading text-2xl md:text-3xl font-bold mb-2 leading-tight" style={{ color: theme.navy }}>
        {modal.basicsHeadline}
      </h2>
      <p className="text-sm text-gray-600 mb-5">{modal.basicsBlurb}</p>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: theme.navy }}>
            {modal.groupSizeLabel}
          </label>
          <div className="rounded-lg border bg-white p-4" style={{ borderColor: '#E5E7EB' }}>
            <div className="flex items-baseline justify-between mb-3">
              <span className="text-sm text-gray-600">{modal.groupSizeUnit}</span>
              <span className="font-heading text-3xl font-bold" style={{ color: theme.blue }}>
                {people}
              </span>
            </div>
            <input
              type="range"
              min={2}
              max={modal.groupSizeUnit === 'attendees' || modal.groupSizeUnit === 'guests' ? 200 : 30}
              value={people}
              onChange={(e) => setPeople(parseInt(e.target.value, 10))}
              className="w-full"
              style={{ accentColor: theme.blue }}
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-1.5">
              <span>2</span>
              <span>{modal.groupSizeUnit === 'attendees' || modal.groupSizeUnit === 'guests' ? 100 : 15}</span>
              <span>{modal.groupSizeUnit === 'attendees' || modal.groupSizeUnit === 'guests' ? 200 : 30}</span>
            </div>
          </div>

          {modal.extraQuestion && (
            <div className="mt-4">
              <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: theme.navy }}>
                {modal.extraQuestion.label}
              </label>
              <div className="rounded-lg border bg-white p-3 space-y-1.5" style={{ borderColor: '#E5E7EB' }}>
                {modal.extraQuestion.options.map((opt) => {
                  const checked = extraSelection.includes(opt.value);
                  return (
                    <label
                      key={opt.value}
                      className="flex items-center gap-2 cursor-pointer text-sm py-1 px-2 rounded transition-colors"
                      style={{
                        background: checked ? `${theme.primary}22` : 'transparent',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleExtra(opt.value)}
                        className="w-4 h-4 rounded"
                        style={{ accentColor: theme.primary }}
                      />
                      <span style={{ color: theme.navy }}>{opt.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: theme.navy }}>
            Delivery date
          </label>
          <InlineCalendar value={deliveryDate} onChange={setDeliveryDate} theme={theme} />
          <p className="text-xs text-gray-500 mt-2">
            48-hour notice gets you guaranteed pricing &amp; cold delivery.
          </p>
        </div>
      </div>
    </div>
  );
}

function ProductGridStep({
  title,
  blurb,
  categories,
  selection,
  onInc,
  onDec,
  theme,
  tabbed = false,
}: {
  title: string;
  blurb: string;
  categories: BuilderCategory[];
  selection: Selection;
  onInc: (id: string) => void;
  onDec: (id: string) => void;
  theme: LandingConfig['theme'];
  /** When true, render category labels as horizontal subtabs and only show one at a time. */
  tabbed?: boolean;
}) {
  const [activeKey, setActiveKey] = useState<string>(categories[0]?.key ?? '');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggleExpand = (key: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const visibleCats = tabbed
    ? categories.filter((c) => c.key === activeKey)
    : categories;

  return (
    <div>
      <h2 className="font-heading text-xl md:text-2xl font-bold mb-1 leading-tight" style={{ color: theme.navy }}>
        {title}
      </h2>
      <p className="text-xs text-gray-600 mb-3">{blurb}</p>

      {tabbed && (
        <div
          className="sticky top-0 z-20 -mx-1 px-1 py-2 mb-3 flex flex-wrap gap-1.5 overflow-x-auto"
          style={{ background: theme.cream }}
        >
          {categories.map((cat) => {
            const active = cat.key === activeKey;
            const count = cat.products.length + (cat.extras?.length ?? 0);
            return (
              <button
                key={cat.key}
                onClick={() => setActiveKey(cat.key)}
                className="px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all"
                style={{
                  background: active ? theme.primary : '#FFFFFF',
                  color: active ? theme.primaryText : theme.navy,
                  border: `1.5px solid ${active ? theme.primary : '#E5E7EB'}`,
                  boxShadow: active ? `0 2px 6px ${theme.primary}66` : 'none',
                }}
              >
                {cat.label}{' '}
                <span
                  className="ml-1 text-[10px] opacity-70"
                  style={{ color: active ? theme.primaryText : '#9CA3AF' }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <div className={tabbed ? '' : 'space-y-5'}>
        {visibleCats.map((cat) => {
          const isExpanded = expanded.has(cat.key);
          const productsToShow = isExpanded
            ? [...cat.products, ...(cat.extras ?? [])]
            : cat.products;
          const extraCount = cat.extras?.length ?? 0;

          return (
            <div key={cat.key}>
              {!tabbed && (
                <div
                  className="sticky top-0 z-10 -mx-1 px-1 py-1.5 mb-2 flex items-baseline gap-2"
                  style={{ background: theme.cream }}
                >
                  <h3 className="font-heading font-bold text-sm uppercase tracking-widest" style={{ color: theme.navy }}>
                    {cat.label}
                  </h3>
                  <span className="text-[10px] text-gray-400">
                    ({cat.products.length + extraCount})
                  </span>
                </div>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                {productsToShow.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    qty={selection[p.id] ?? 0}
                    onInc={() => onInc(p.id)}
                    onDec={() => onDec(p.id)}
                    theme={theme}
                  />
                ))}
              </div>
              {extraCount > 0 && (
                <div className="flex justify-center mt-3">
                  <button
                    onClick={() => toggleExpand(cat.key)}
                    className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all hover:scale-105"
                    style={{
                      background: '#FFFFFF',
                      color: theme.navy,
                      border: `1.5px solid ${theme.primary}`,
                    }}
                  >
                    {isExpanded ? `Show top picks` : `View all ${extraCount + cat.products.length} ${cat.label.toLowerCase()} →`}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProductCard({
  product,
  qty,
  onInc,
  onDec,
  theme,
}: {
  product: BuilderProduct;
  qty: number;
  onInc: () => void;
  onDec: () => void;
  theme: LandingConfig['theme'];
}) {
  const selected = qty > 0;
  return (
    <div
      className="relative rounded-xl bg-white overflow-hidden flex flex-col transition-all duration-200"
      style={{
        border: selected ? `2px solid ${theme.primary}` : '1px solid #E5E7EB',
        boxShadow: selected ? '0 4px 12px rgba(0,0,0,0.08)' : '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      <div
        className="relative w-full bg-white flex items-center justify-center flex-shrink-0 border-b border-gray-100"
        style={{ height: '110px' }}
      >
        {product.image ? (
          <Image
            src={encodeImg(product.image)!}
            alt={product.name}
            fill
            sizes="(min-width: 768px) 18vw, 50vw"
            className="object-contain p-3"
          />
        ) : (
          <span className="text-4xl opacity-90">{product.emoji}</span>
        )}
        {selected && (
          <div
            className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded-full text-xs font-bold shadow"
            style={{ background: theme.primary, color: theme.primaryText }}
          >
            ×{qty}
          </div>
        )}
      </div>

      <div className="p-2.5 flex flex-col flex-1">
        <div
          className="text-xs font-bold leading-tight mb-1.5 text-center"
          style={{
            color: theme.navy,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: '2.2em',
          }}
        >
          {product.name}
        </div>

        <div className="flex items-center justify-between mb-2 px-0.5">
          <span className="text-[10px] text-gray-500 truncate">
            {product.detail || ' '}
          </span>
          <span className="font-bold text-sm whitespace-nowrap" style={{ color: theme.blue }}>
            ${product.price}
          </span>
        </div>

        <div className="flex items-center justify-center mt-auto pt-1">
          {qty === 0 ? (
            <button
              onClick={onInc}
              className="w-9 h-9 rounded-full flex items-center justify-center text-xl font-bold leading-none transition-all hover:scale-110 active:scale-95 shadow-sm"
              style={{ background: theme.primary, color: theme.primaryText }}
              aria-label={`Add ${product.name}`}
            >
              +
            </button>
          ) : (
            <div
              className="flex items-center gap-2 rounded-full px-1.5 py-1 transition-all"
              style={{ background: theme.primary, boxShadow: `0 2px 6px ${theme.primary}66` }}
            >
              <button
                onClick={onDec}
                className="w-7 h-7 rounded-full bg-white/70 hover:bg-white text-lg font-bold leading-none flex items-center justify-center transition-colors"
                style={{ color: theme.primaryText }}
                aria-label="Decrease"
              >
                −
              </button>
              <span className="font-bold text-sm w-5 text-center" style={{ color: theme.primaryText }}>
                {qty}
              </span>
              <button
                onClick={onInc}
                className="w-7 h-7 rounded-full bg-white/70 hover:bg-white text-lg font-bold leading-none flex items-center justify-center transition-colors"
                style={{ color: theme.primaryText }}
                aria-label="Increase"
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ReviewStep({
  name,
  email,
  phone,
  setName,
  setEmail,
  setPhone,
  deliveryDate,
  formatDate,
  people,
  lineItems,
  total,
  perPerson,
  submitMode,
  setSubmitMode,
  onSubmit,
  modal,
  theme,
}: {
  name: string;
  email: string;
  phone: string;
  setName: (s: string) => void;
  setEmail: (s: string) => void;
  setPhone: (s: string) => void;
  deliveryDate: Date | null;
  formatDate: (d: Date | null) => string;
  people: number;
  lineItems: { product: BuilderProduct; qty: number; lineTotal: number }[];
  total: number;
  perPerson: number;
  submitMode: 'quote' | 'checkout';
  setSubmitMode: (m: 'quote' | 'checkout') => void;
  onSubmit: (e: React.FormEvent) => void;
  modal: LandingConfig['modal'];
  theme: LandingConfig['theme'];
}) {
  return (
    <div>
      <h2 className="font-heading text-2xl md:text-3xl font-bold mb-1 leading-tight" style={{ color: theme.navy }}>
        {modal.reviewHeadline}
      </h2>
      <p className="text-sm text-gray-600 mb-5">
        Double-check it, drop your contact info, and we&apos;ll handle the rest.
      </p>

      <div className="grid sm:grid-cols-2 gap-3 mb-5">
        <div className="rounded-lg p-4 bg-white" style={{ border: '1px solid #E5E7EB' }}>
          <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">
            Event
          </div>
          <div className="space-y-1.5 text-sm text-gray-800">
            <div>
              👥 <strong>{people}</strong> {modal.groupSizeUnit}
            </div>
            <div>
              📅 <strong>{deliveryDate ? formatDate(deliveryDate) : '— date TBD —'}</strong>
            </div>
            <div>
              📦 <strong>{lineItems.reduce((s, li) => s + li.qty, 0)}</strong> items
            </div>
          </div>
        </div>
        <div className="rounded-lg p-4 text-white" style={{ background: theme.navy }}>
          <div className="text-[10px] uppercase tracking-widest font-bold mb-2" style={{ color: theme.primary }}>
            Total
          </div>
          <div className="font-heading text-3xl font-bold" style={{ color: theme.primary }}>
            ${total.toFixed(2)}
          </div>
          <div className="text-sm opacity-80 mt-0.5">
            ${perPerson.toFixed(2)} per {modal.groupSizeUnit.replace(/s$/, '')}
          </div>
        </div>
      </div>

      {lineItems.length > 0 && (
        <details className="mb-5 rounded-lg bg-white" style={{ border: '1px solid #E5E7EB' }}>
          <summary className="cursor-pointer px-4 py-2.5 text-sm font-bold" style={{ color: theme.navy }}>
            View {lineItems.length} item{lineItems.length !== 1 ? 's' : ''} ↓
          </summary>
          <ul className="px-4 pb-3 space-y-1.5 text-sm">
            {lineItems.map((li) => (
              <li key={li.product.id} className="flex justify-between gap-3">
                <span className="text-gray-800">
                  <strong>{li.qty}×</strong> {li.product.name}
                </span>
                <span className="font-bold whitespace-nowrap" style={{ color: theme.navy }}>
                  ${li.lineTotal.toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        </details>
      )}

      <div className="grid grid-cols-2 gap-2 mb-4">
        <button
          type="button"
          onClick={() => setSubmitMode('quote')}
          className="p-3 rounded-lg text-left transition-all"
          style={{
            background: submitMode === 'quote' ? `${theme.primary}22` : '#FFFFFF',
            border: `2px solid ${submitMode === 'quote' ? theme.primary : '#E5E7EB'}`,
          }}
        >
          <div className="font-bold text-sm mb-0.5" style={{ color: theme.navy }}>
            📧 Email me the quote
          </div>
          <div className="text-xs text-gray-600">Review and book later.</div>
        </button>
        <button
          type="button"
          onClick={() => setSubmitMode('checkout')}
          className="p-3 rounded-lg text-left transition-all"
          style={{
            background: submitMode === 'checkout' ? `${theme.primary}22` : '#FFFFFF',
            border: `2px solid ${submitMode === 'checkout' ? theme.primary : '#E5E7EB'}`,
          }}
        >
          <div className="font-bold text-sm mb-0.5" style={{ color: theme.navy }}>
            💳 Send payment link
          </div>
          <div className="text-xs text-gray-600">Lock the date now.</div>
        </button>
      </div>

      <form id="quote-form" onSubmit={onSubmit} className="space-y-2.5">
        <div className="grid sm:grid-cols-2 gap-2.5">
          <FormField label="Your name" required theme={theme}>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white rounded-md px-3 py-2.5 text-sm focus:outline-none transition-colors"
              style={{ border: '1.5px solid #E5E7EB' }}
              onFocus={(e) => (e.target.style.borderColor = theme.blue)}
              onBlur={(e) => (e.target.style.borderColor = '#E5E7EB')}
              placeholder="Name"
            />
          </FormField>
          <FormField label="Phone" required theme={theme}>
            <input
              required
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-white rounded-md px-3 py-2.5 text-sm focus:outline-none transition-colors"
              style={{ border: '1.5px solid #E5E7EB' }}
              onFocus={(e) => (e.target.style.borderColor = theme.blue)}
              onBlur={(e) => (e.target.style.borderColor = '#E5E7EB')}
              placeholder="(555) 555-5555"
            />
          </FormField>
        </div>
        <FormField label="Email" required theme={theme}>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white rounded-md px-3 py-2.5 text-sm focus:outline-none transition-colors"
            style={{ border: '1.5px solid #E5E7EB' }}
            onFocus={(e) => (e.target.style.borderColor = theme.blue)}
            onBlur={(e) => (e.target.style.borderColor = '#E5E7EB')}
            placeholder="you@email.com"
          />
        </FormField>
      </form>

      <p className="text-[11px] text-gray-500 mt-3 leading-snug">{modal.emailNotice}</p>
    </div>
  );
}

function FormField({
  label,
  required,
  children,
  theme,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  theme: LandingConfig['theme'];
}) {
  return (
    <div>
      <label className="block text-[10px] font-bold mb-1 uppercase tracking-wider" style={{ color: theme.navy }}>
        {label} {required && <span style={{ color: '#DC2626' }}>*</span>}
      </label>
      {children}
    </div>
  );
}

function SuccessPanel({
  mode,
  phone,
  theme,
  modal,
  onReset,
  onClose,
}: {
  mode: 'quote' | 'checkout';
  phone: string;
  theme: LandingConfig['theme'];
  modal: LandingConfig['modal'];
  onReset: () => void;
  onClose: () => void;
}) {
  return (
    <div className="max-w-md mx-auto text-center py-6">
      <div className="text-5xl mb-3">🎉</div>
      <h2 className="font-heading text-2xl md:text-3xl font-bold mb-2" style={{ color: theme.navy }}>
        {mode === 'checkout' ? modal.successCheckoutHeadline : modal.successQuoteHeadline}
      </h2>
      <p className="text-gray-700 mb-5 text-sm leading-relaxed">
        {mode === 'checkout'
          ? "We've got your package. We'll text a payment link in 5 minutes — keep your phone handy."
          : "Check your inbox in a minute. Reply to that email if you want to tweak anything."}
      </p>
      <div className="rounded-lg p-4 mb-5 text-left" style={{ background: '#FFFFFF', border: '1px solid #E5E7EB' }}>
        <p className="text-xs text-gray-700 mb-1.5">
          <strong>Need it sooner?</strong> Call — we usually answer within 2 rings.
        </p>
        <a
          href={`tel:${phone.replace(/\D/g, '')}`}
          className="font-heading text-xl font-bold"
          style={{ color: theme.blue }}
        >
          {phone}
        </a>
      </div>
      <div className="flex gap-2 justify-center">
        <button
          onClick={onReset}
          className="px-4 py-2.5 text-sm bg-white font-bold rounded-md transition-colors"
          style={{ border: '2px solid #E5E7EB', color: theme.navy }}
        >
          Build another
        </button>
        <button
          onClick={onClose}
          className="px-5 py-2.5 text-sm font-bold rounded-md transition-all hover:scale-[1.02]"
          style={{ background: theme.primary, color: theme.primaryText }}
        >
          Done
        </button>
      </div>
    </div>
  );
}
