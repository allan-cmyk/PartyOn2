/**
 * Ops-side wrapper around the drink planner engine (`drinkPlannerLogic.ts`).
 *
 * The /ops skill uses this (via `scripts/ops/drink-plan.ts`) to size event and
 * party orders with the SAME math the website's planner, Wayne's chat and the
 * dashboard recommendations use — instead of a hand-rolled per-hour formula.
 *
 * Everything here is pure (no Prisma) so it can be unit-tested; the CLI does
 * the catalog lookup and feeds the candidates to `pickCatalogProduct`.
 *
 * Relative imports only: `scripts/` is outside the `@/` path alias.
 */
import { z } from 'zod';
import { calculateQuizResults, ENGINE_SPEC, SEARCH_OVERRIDES } from './drinkPlannerLogic';
import type { DrinkCategory, Duration, EventType, QuizState } from './drinkPlannerTypes';

const EVENT_TYPES = [
  'bachelor', 'bachelorette', 'house-party', 'corporate',
  'wedding', 'boat-day', 'weekend-trip', 'other',
] as const satisfies readonly EventType[];

const DURATIONS = ['2h', '3h', '4h', '5h', '6h', 'multi-day'] as const satisfies readonly Duration[];

/** Categories the engine can size. 'champagne' is excluded: the engine has no picks for it and drops it silently. */
const PLANNABLE_CATEGORIES = [
  'beer', 'seltzers', 'wine', 'spirits', 'cocktail-kits',
] as const satisfies readonly DrinkCategory[];

const BOAT_BACH_TYPES: readonly EventType[] = ['boat-day', 'bachelor', 'bachelorette', 'weekend-trip'];

const KNOWN_FLAGS = new Set(['guests', 'hours', 'event', 'categories', 'keep-seltzers', 'no-ice', 'json']);

/** Validated input for {@link buildOpsDrinkPlan}. */
export const opsDrinkPlanInputSchema = z.object({
  eventType: z.enum(EVENT_TYPES),
  guests: z.number().int().min(1).max(1000),
  duration: z.enum(DURATIONS),
  categories: z.array(z.enum(PLANNABLE_CATEGORIES)).min(1),
  keepAutoSeltzers: z.boolean().default(false),
  includeIce: z.boolean().default(true),
});

/** Input for {@link buildOpsDrinkPlan} after validation. */
export type OpsDrinkPlanInput = z.infer<typeof opsDrinkPlanInputSchema>;

/** One sized line of the plan, still un-priced (the CLI resolves it to a catalog product). */
export interface OpsDrinkPlanLine {
  /** Engine recommendation name, e.g. "Miller Lite 24pk". */
  name: string;
  quantity: number;
  unit: string;
  category: string;
  /** Servings per unit from the engine (null for ice). */
  servingsPerUnit: number | null;
  /** quantity × servingsPerUnit (null for ice). */
  servings: number | null;
  /** Catalog title search term + optional disambiguating hint (from SEARCH_OVERRIDES). */
  search: string;
  variantHint?: string;
}

/** The ops view of an engine run. */
export interface OpsDrinkPlan {
  /** Drinks the engine sized for (before seltzers were dropped). */
  totalDrinks: number;
  /** Servings actually covered by the returned lines (after whole-pack rounding). */
  plannedServings: number;
  lines: OpsDrinkPlanLine[];
  /** True when the engine's auto-added seltzers were removed. */
  droppedAutoSeltzers: boolean;
  /** Plain-language formula used, for the operator's notes. */
  formula: string;
}

/**
 * Parse CLI arguments (`--guests 130 --hours 3 --event corporate --categories beer,wine
 * [--keep-seltzers] [--no-ice] [--json]`) into a validated plan input.
 * Returns an error string instead of throwing so the CLI can print it.
 */
export function parseDrinkPlanArgs(
  argv: string[],
): { ok: true; input: OpsDrinkPlanInput; json: boolean } | { ok: false; error: string } {
  const flags = new Map<string, string | true>();
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith('--')) return { ok: false, error: `Unexpected argument "${arg}"` };
    // A typo like --categoy must fail loudly, not silently fall back to the default categories.
    if (!KNOWN_FLAGS.has(arg.slice(2))) return { ok: false, error: `Unknown flag "${arg}"` };
    const next = argv[i + 1];
    if (next !== undefined && !next.startsWith('--')) {
      flags.set(arg.slice(2), next);
      i++;
    } else {
      flags.set(arg.slice(2), true);
    }
  }

  // Value flags must carry a value: `--guests --hours 3` must not read as guests=1.
  const value = (key: string): string | undefined => {
    const v = flags.get(key);
    return typeof v === 'string' ? v : undefined;
  };
  const hoursRaw = value('hours');
  const duration = hoursRaw === 'multi-day' ? 'multi-day' : `${hoursRaw}h`;
  const eventType = value('event') ?? 'other';
  const defaultCategories = BOAT_BACH_TYPES.includes(eventType as EventType)
    ? 'beer,seltzers,cocktail-kits'
    : 'beer,wine,spirits';
  const categoriesRaw = value('categories') ?? defaultCategories;

  const parsed = opsDrinkPlanInputSchema.safeParse({
    eventType,
    guests: Number(value('guests')),
    duration,
    categories: categoriesRaw.split(',').map((c) => c.trim()).filter(Boolean),
    keepAutoSeltzers: flags.get('keep-seltzers') === true,
    includeIce: flags.get('no-ice') !== true,
  });
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join('.') || 'input'}: ${i.message}`);
    return {
      ok: false,
      error: `${issues.join('; ')}\nhours must be 2-6 or multi-day; categories from ${PLANNABLE_CATEGORIES.join(', ')}`,
    };
  }
  return { ok: true, input: parsed.data, json: flags.get('json') === true };
}

/**
 * Run the drink planner engine for an ops quote and return sized lines.
 *
 * Seltzers the engine auto-adds on the event track (5% share) are dropped unless
 * the operator asked for seltzers or passed keepAutoSeltzers — a "beer and wine
 * only" request should not come back with High Noon on it.
 */
export function buildOpsDrinkPlan(input: OpsDrinkPlanInput): OpsDrinkPlan {
  const state: QuizState = {
    currentStep: 'results',
    eventType: input.eventType,
    guestCount: input.guests,
    drinkingVibe: 'social',
    duration: input.duration,
    drinkCategories: input.categories,
    selectedCocktails: [],
    extras: [],
    bartender: null,
    eventTiming: null,
    deliveryArea: 'austin',
    skipped: false,
    completed: true,
    packageTier: 'standard',
  };
  const results = calculateQuizResults(state);

  const dropSeltzers = !input.keepAutoSeltzers && !input.categories.includes('seltzers');
  const recs = results.recommendations.filter((r) => {
    if (dropSeltzers && r.category === 'seltzers') return false;
    if (!input.includeIce && r.category === 'ice') return false;
    return true;
  });

  const lines: OpsDrinkPlanLine[] = recs.map((r) => {
    const servingsPerUnit = ENGINE_SPEC.servingsPerUnit[r.name] ?? null;
    const override = SEARCH_OVERRIDES[r.name];
    return {
      name: r.name,
      quantity: r.quantity,
      unit: r.unit,
      category: r.category,
      servingsPerUnit,
      servings: servingsPerUnit === null ? null : servingsPerUnit * r.quantity,
      search: override?.search ?? r.searchQuery,
      ...(override?.variantHint ? { variantHint: override.variantHint } : {}),
    };
  });

  const boatBach = BOAT_BACH_TYPES.includes(input.eventType);
  return {
    totalDrinks: results.totalDrinks,
    plannedServings: lines.reduce((sum, l) => sum + (l.servings ?? 0), 0),
    lines,
    droppedAutoSeltzers: dropSeltzers && results.recommendations.some((r) => r.category === 'seltzers'),
    formula: boatBach ? ENGINE_SPEC.formulas.boatBach : ENGINE_SPEC.formulas.everythingElse,
  };
}

/** A catalog product as the CLI loads it (ACTIVE products whose title contains the search term). */
export interface CatalogCandidate {
  id: string;
  title: string;
  imageUrl: string | null;
  variants: { id: string; title: string; price: number; availableForSale: boolean }[];
}

/** Result of matching one plan line to the catalog. */
export type CatalogPick =
  | {
      status: 'matched';
      product: CatalogCandidate;
      variant: CatalogCandidate['variants'][number];
      /** Other equally-good titles — non-empty means the match is ambiguous and needs a human look. */
      alternates: string[];
      /** True when a variant hint was given but no product title contained it (size may be wrong). */
      hintMissed: boolean;
    }
  | { status: 'missing'; reason: string };

/**
 * Deterministically pick the catalog product for a plan line.
 *
 * Prefers products whose title contains the variant hint (e.g. "24 Pack 12oz Can"),
 * then sorts by title so the same catalog always gives the same answer. Within the
 * product, prefers a variant whose title contains the hint, else the cheapest
 * variant that is available for sale.
 */
export function pickCatalogProduct(candidates: CatalogCandidate[], variantHint?: string): CatalogPick {
  const sellable = candidates.filter((c) => c.variants.some((v) => v.availableForSale));
  if (sellable.length === 0) {
    return { status: 'missing', reason: candidates.length ? 'no variant available for sale' : 'no ACTIVE product matched' };
  }

  const hint = variantHint?.toLowerCase();
  const hinted = hint ? sellable.filter((c) => c.title.toLowerCase().includes(hint)) : [];
  const pool = [...(hinted.length ? hinted : sellable)].sort((a, b) => a.title.localeCompare(b.title));
  const product = pool[0];

  const variants = product.variants
    .filter((v) => v.availableForSale)
    .sort((a, b) => a.price - b.price);
  const variant = (hint && variants.find((v) => v.title.toLowerCase().includes(hint))) || variants[0];

  return {
    status: 'matched',
    product,
    variant,
    alternates: pool.slice(1).map((p) => p.title),
    hintMissed: Boolean(hint) && hinted.length === 0,
  };
}
