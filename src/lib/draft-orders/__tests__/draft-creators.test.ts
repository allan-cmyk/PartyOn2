/**
 * Every file that creates draft orders is classified here (ADR-0010,
 * constraint 4).
 *
 * Paying an invoice skips the 24-hour minimum unless the draft is a
 * self-serve delivery draft (provenance.ts): the operator exemption is the
 * default. That is only safe while each creator is either behind ops auth, or
 * a public flow that checks the minimum itself and stamps a self-serve
 * createdBy. A new creator fails this test until someone decides which it is.
 * (scripts/ run with database credentials, so they are operator-only.)
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  GROUP_ORDER_DRAFT_CREATED_BY,
  isSelfServeDeliveryDraft,
  landingDraftCreatedBy,
} from '../provenance';

type Classification =
  | { kind: 'ops-auth' }
  | { kind: 'self-serve'; stamp: string }
  | { kind: 'event-ticket' };

const CLASSIFIED: Record<string, Classification> = {
  'src/app/api/v1/admin/draft-orders/route.ts': { kind: 'ops-auth' },
  'src/app/api/v1/admin/orders/[id]/amend/route.ts': { kind: 'ops-auth' },
  'src/app/api/v1/agent/approve/route.ts': { kind: 'ops-auth' },
  'src/app/api/v1/landing/quote/route.ts': { kind: 'self-serve', stamp: 'landingDraftCreatedBy(' },
  'src/app/api/group-orders/[code]/create-checkout/route.ts': {
    kind: 'self-serve',
    stamp: 'GROUP_ORDER_DRAFT_CREATED_BY',
  },
  'src/app/api/v1/full-moon/ticket/route.ts': { kind: 'event-ticket' },
};

/** Any import of the draft-order service module: alias, relative, or dynamic. */
const DRAFT_ORDERS_MODULE = /['"`][^'"`]*\/draft-orders(?:\/(?:index|service))?['"`]/;

/** Does this source create draft orders — through the service (however imported) or the table directly? */
function createsDraftOrders(text: string): boolean {
  const usesService = /\bcreateDraftOrder\b/.test(text) && DRAFT_ORDERS_MODULE.test(text);
  const writesTable =
    /\.draftOrder\.(?:create|createMany|upsert)\(/.test(text) || /INSERT\s+INTO\s+"?draft_orders\b/i.test(text);
  return usesService || writesTable;
}

const ROOT = process.cwd();

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return name === '__tests__' ? [] : sourceFiles(path);
    return /\.tsx?$/.test(name) && !/\.test\.tsx?$/.test(name) ? [path] : [];
  });
}

const read = (file: string) => readFileSync(join(ROOT, file), 'utf8');

const creators = sourceFiles(join(ROOT, 'src'))
  .map((path) => relative(ROOT, path).split(sep).join('/'))
  .filter((file) => file !== 'src/lib/draft-orders/service.ts')
  .filter((file) => createsDraftOrders(read(file)))
  .sort();

describe('draft-order creators', () => {
  it('recognizes every way of reaching the service or the table', () => {
    expect(createsDraftOrders("import { createDraftOrder } from '@/lib/draft-orders';")).toBe(true);
    expect(
      createsDraftOrders("import { createDraftOrder as make } from '../../../lib/draft-orders/service';"),
    ).toBe(true);
    expect(createsDraftOrders("const { createDraftOrder } = await import('@/lib/draft-orders');")).toBe(true);
    expect(createsDraftOrders('await tx.draftOrder.create({ data })')).toBe(true);
    expect(createsDraftOrders('INSERT INTO "draft_orders" (id) VALUES ($1)')).toBe(true);
    expect(createsDraftOrders("import { getDraftOrderById } from '@/lib/draft-orders';")).toBe(false);
  });

  it('are all classified — a new one must require ops auth or check the minimum itself', () => {
    expect(creators).toEqual(Object.keys(CLASSIFIED).sort());
  });

  it.each(Object.entries(CLASSIFIED))('%s does what its classification says', (file, classification) => {
    const text = read(file);
    switch (classification.kind) {
      case 'ops-auth':
        expect(text).toMatch(/requireOpsAuth\(/);
        break;
      case 'self-serve':
        expect(text).toMatch(/meetsLeadTime\(/);
        expect(text).toContain(classification.stamp);
        break;
      case 'event-ticket':
        expect(text).toContain('FULL_MOON_TICKET_DRAFT_CREATED_BY');
        expect(text).toMatch(/stripe\.checkout\.sessions\.create\(/);
        break;
    }
  });

  it('treats the self-serve stamps as self-serve', () => {
    expect(isSelfServeDeliveryDraft({ createdBy: landingDraftCreatedBy('bachelor') })).toBe(true);
    expect(isSelfServeDeliveryDraft({ createdBy: GROUP_ORDER_DRAFT_CREATED_BY })).toBe(true);
  });
});
