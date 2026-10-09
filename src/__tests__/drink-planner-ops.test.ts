import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import path from 'path';
import { ORDER_LOGIC } from '@/lib/agent/order-logic-content';
import {
  buildOpsDrinkPlan,
  parseDrinkPlanArgs,
  pickCatalogProduct,
  type CatalogCandidate,
  type OpsDrinkPlanInput,
} from '@/lib/drinkPlannerOps';

const corporateBeerWine: OpsDrinkPlanInput = {
  eventType: 'corporate',
  guests: 130,
  duration: '3h',
  categories: ['beer', 'wine'],
  keepAutoSeltzers: false,
  includeIce: true,
};

function qtyByName(input: OpsDrinkPlanInput): Record<string, number> {
  return Object.fromEntries(buildOpsDrinkPlan(input).lines.map((l) => [l.name, l.quantity]));
}

describe('buildOpsDrinkPlan', () => {
  it('sizes a 130-guest, 3-hour beer + wine event with the planner engine (guests x (hours + 1))', () => {
    const plan = buildOpsDrinkPlan(corporateBeerWine);
    expect(plan.totalDrinks).toBe(520);
    expect(qtyByName(corporateBeerWine)).toEqual({
      'Miller Lite 24pk': 6,
      'Modelo Especial 24pk': 6,
      'Austin Beerworks Variety 12pk': 6,
      'Dark Horse Pinot Grigio': 16,
      '14 Hands Cabernet Sauvignon': 16,
      'Ice Bags': 13,
    });
    // 360 cans + 32 bottles x 5 glasses
    expect(plan.plannedServings).toBe(520);
    expect(plan.droppedAutoSeltzers).toBe(true);
  });

  it('keeps the auto-added seltzers when asked', () => {
    const names = Object.keys(qtyByName({ ...corporateBeerWine, keepAutoSeltzers: true }));
    expect(names).toEqual(expect.arrayContaining(['High Noon Variety 12pk', 'White Claw Variety 24pk']));
  });

  it('never drops seltzers the operator explicitly selected', () => {
    const plan = buildOpsDrinkPlan({ ...corporateBeerWine, categories: ['beer', 'seltzers'] });
    expect(plan.lines.some((l) => l.category === 'seltzers')).toBe(true);
    expect(plan.droppedAutoSeltzers).toBe(false);
  });

  it('drops ice with includeIce=false', () => {
    const plan = buildOpsDrinkPlan({ ...corporateBeerWine, includeIce: false });
    expect(plan.lines.some((l) => l.category === 'ice')).toBe(false);
  });

  it('uses the flat 2 drinks/person/hour rate on the boat/bach track', () => {
    const plan = buildOpsDrinkPlan({
      ...corporateBeerWine,
      eventType: 'boat-day',
      guests: 20,
      duration: '4h',
      categories: ['beer', 'seltzers', 'cocktail-kits'],
    });
    expect(plan.totalDrinks).toBe(160);
    expect(plan.formula).toContain('× 2');
  });

  it('carries the disambiguating search hints so bottles/cans/sizes resolve correctly', () => {
    const byName = Object.fromEntries(buildOpsDrinkPlan(corporateBeerWine).lines.map((l) => [l.name, l]));
    expect(byName['Modelo Especial 24pk'].variantHint).toBe('24 Pack 12oz Can');
    expect(byName['Dark Horse Pinot Grigio'].variantHint).toBe('750ml');
  });
});

describe('parseDrinkPlanArgs', () => {
  it('parses a full command line', () => {
    const r = parseDrinkPlanArgs(['--guests', '130', '--hours', '3', '--event', 'corporate', '--categories', 'beer,wine', '--no-ice', '--json']);
    expect(r).toEqual({
      ok: true,
      json: true,
      input: { ...corporateBeerWine, includeIce: false },
    });
  });

  it('defaults categories by track', () => {
    const event = parseDrinkPlanArgs(['--guests', '50', '--hours', '4', '--event', 'wedding']);
    const boat = parseDrinkPlanArgs(['--guests', '20', '--hours', '4', '--event', 'boat-day']);
    expect(event.ok && event.input.categories).toEqual(['beer', 'wine', 'spirits']);
    expect(boat.ok && boat.input.categories).toEqual(['beer', 'seltzers', 'cocktail-kits']);
  });

  it('accepts multi-day', () => {
    const r = parseDrinkPlanArgs(['--guests', '10', '--hours', 'multi-day', '--event', 'bachelorette']);
    expect(r.ok && r.input.duration).toBe('multi-day');
  });

  it.each([
    [['--guests', '130', '--hours', '7']],
    [['--guests', '130', '--hours', '3.5']],
    [['--guests', '--hours', '3']],
    [['--guests', '130', '--hours', '3', '--categories', 'champagne']],
    [['--guests', '130', '--hours', '3', '--event', 'gala']],
    [['130']],
    [['--guests', '130', '--hours', '3', '--categoy', 'beer,wine']],
  ])('rejects bad input %j', (argv) => {
    expect(parseDrinkPlanArgs(argv).ok).toBe(false);
  });
});

function candidate(title: string, variants: Partial<CatalogCandidate['variants'][number]>[] = [{}]): CatalogCandidate {
  return {
    id: title,
    title,
    imageUrl: null,
    variants: variants.map((v, i) => ({ id: `${title}-${i}`, title: 'Default Title', price: 10, availableForSale: true, ...v })),
  };
}

describe('pickCatalogProduct', () => {
  it('prefers the title containing the hint regardless of database row order', () => {
    const rows = [
      candidate('Modelo Especial • 24 Pack 12oz Bottles'),
      candidate('Modelo Especial • 12 Pack 12oz Can'),
      candidate('Modelo Especial • 24 Pack 12oz Can'),
    ];
    for (const order of [rows, [...rows].reverse()]) {
      const pick = pickCatalogProduct(order, '24 Pack 12oz Can');
      expect(pick.status === 'matched' && pick.product.title).toBe('Modelo Especial • 24 Pack 12oz Can');
      expect(pick.status === 'matched' && pick.alternates).toEqual([]);
    }
  });

  it('reports alternates when the match is ambiguous', () => {
    const pick = pickCatalogProduct([
      candidate('Dark Horse Pinot Grigio California'),
      candidate('Dark Horse Pinot Grigio • 750ml Bottle'),
    ]);
    expect(pick.status === 'matched' && pick.alternates.length).toBe(1);
  });

  it('flags a hint that matched nothing', () => {
    const pick = pickCatalogProduct([candidate('Miller Lite • 12 Pack 12oz Can')], '24 Pack');
    expect(pick.status === 'matched' && pick.hintMissed).toBe(true);
  });

  it('skips products with no sellable variant and picks the cheapest sellable variant', () => {
    const pick = pickCatalogProduct([
      candidate('A', [{ availableForSale: false }]),
      candidate('B', [{ price: 20 }, { price: 15 }, { price: 5, availableForSale: false }]),
    ]);
    expect(pick.status === 'matched' && pick.product.title).toBe('B');
    expect(pick.status === 'matched' && pick.variant.price).toBe(15);
  });

  it('returns missing when nothing is sellable', () => {
    expect(pickCatalogProduct([]).status).toBe('missing');
    expect(pickCatalogProduct([candidate('A', [{ availableForSale: false }])]).status).toBe('missing');
  });
});

describe('ops agent knowledge base', () => {
  const section = (text: string) =>
    text.slice(text.indexOf('## Drink Recommendations'), text.indexOf('## Party Type to Product Categories')).trim();

  it('keeps the Drink Recommendations section identical in order-logic.md and the inlined ORDER_LOGIC copy', () => {
    const md = readFileSync(path.resolve(__dirname, '../lib/agent/order-logic.md'), 'utf8');
    expect(section(md)).not.toBe('');
    expect(section(ORDER_LOGIC)).toBe(section(md));
  });

  it('describes the planner formulas, not the retired per-hour rate table', () => {
    const drinks = section(ORDER_LOGIC);
    expect(drinks).toContain('ceil(guests * (hours + 1))');
    expect(drinks).toContain('ceil(guests * hours * 2)');
    expect(drinks).not.toContain('Drinks Per Person Per Hour');
  });
});
