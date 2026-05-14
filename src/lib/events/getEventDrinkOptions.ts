import { prisma } from '@/lib/database/client';
import type { EventInvite } from './types';
import type { DrinkOption } from '@/components/events/OrderDrinksModal';

/**
 * Resolve the BYOB drink menu for an event.
 *
 * - 'curated': look up each handle in Postgres and return matching variants
 * - 'full-catalog' / 'package-only': mockup-mode placeholder for now
 *
 * Falls back gracefully — if the DB can't be reached or a handle isn't
 * found, the invite page renders with whatever resolved + a note.
 */
export async function getEventDrinkOptions(event: EventInvite): Promise<DrinkOption[]> {
  if (!event.drinks.enabled) return [];

  if (event.drinks.mode === 'curated' && event.drinks.curatedHandles?.length) {
    try {
      const products = await prisma.product.findMany({
        where: { handle: { in: event.drinks.curatedHandles } },
        include: {
          variants: {
            where: { availableForSale: true },
            orderBy: { price: 'asc' },
            take: 1,
          },
          images: {
            orderBy: { position: 'asc' },
            take: 1,
          },
        },
      });
      const byHandle = new Map(products.map((p) => [p.handle, p]));
      return event.drinks.curatedHandles
        .map((h) => byHandle.get(h))
        .filter((p): p is NonNullable<typeof p> => !!p && p.variants.length > 0)
        .map((p) => {
          const v = p.variants[0];
          const img = p.images[0]?.url;
          return {
            handle: p.handle,
            name: p.title,
            price: Number(v.price),
            image: img,
            unit:
              v.title === 'Default' || v.title === 'Default Title'
                ? v.option1Value ?? undefined
                : v.title,
            category: p.productType ?? undefined,
            description: p.description ?? undefined,
          };
        });
    } catch (err) {
      console.error('[getEventDrinkOptions] DB lookup failed', err);
      return [];
    }
  }

  // Other modes — mockup placeholder.
  return [];
}
