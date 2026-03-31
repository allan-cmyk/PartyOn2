/**
 * GET /api/v2/group-orders/[code]/recommendations?guests=30&duration=4h&drinkTypes=beer,seltzers
 * Generate drink recommendations using the drink planner logic, matched to real products.
 * Reads partyType from the GroupOrderV2 record to determine which recommendation track to use.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';
import { calculateQuizResults, SEARCH_OVERRIDES } from '@/lib/drinkPlannerLogic';
import { transformToProduct } from '@/lib/products/transform';
import type { QuizState, DrinkCategory, Duration, EventType } from '@/lib/drinkPlannerTypes';

interface RouteParams {
  params: Promise<{ code: string }>;
}

// Map DB PartyType enum to EventType used by the algorithm
const PARTY_TYPE_TO_EVENT: Record<string, EventType> = {
  BACHELOR: 'bachelor',
  BACHELORETTE: 'bachelorette',
  WEDDING: 'wedding',
  CORPORATE: 'corporate',
  HOUSE_PARTY: 'house-party',
  BOAT: 'boat-day',
  BACH: 'weekend-trip',
  OTHER: 'other',
};

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { code } = await params;

    const searchParams = request.nextUrl.searchParams;
    const guests = parseInt(searchParams.get('guests') || '20');
    const duration = (searchParams.get('duration') || '4h') as Duration;
    const drinkTypesParam = searchParams.get('drinkTypes') || 'beer,seltzers';
    const drinkCategories = drinkTypesParam.split(',').filter(Boolean) as DrinkCategory[];

    // Read partyType from the GroupOrderV2 record
    const groupOrder = await prisma.groupOrderV2.findFirst({
      where: { shareCode: code },
      select: { partyType: true },
    });

    const partyType = groupOrder?.partyType || null;
    const eventType: EventType = (partyType && PARTY_TYPE_TO_EVENT[partyType]) || 'house-party';

    // Build a minimal QuizState to pass to the calculator
    const quizState: QuizState = {
      currentStep: 'results',
      eventType,
      guestCount: guests,
      drinkingVibe: 'social',
      duration,
      drinkCategories,
      selectedCocktails: [],
      extras: [],
      bartender: null,
      eventTiming: null,
      deliveryArea: 'austin',
      skipped: false,
      completed: true,
      packageTier: 'standard',
    };

    const results = calculateQuizResults(quizState);

    // Match recommendations to real products in DB
    const matchedRecs = [];
    for (const rec of results.recommendations) {
      const override = SEARCH_OVERRIDES[rec.name];
      const searchTerm = override ? override.search : (rec.searchQuery || rec.name);
      const variantHint = override?.variantHint;

      // Find matching products -- if we have a variantHint, fetch multiple to pick the right one
      const products = await prisma.product.findMany({
        where: {
          status: 'ACTIVE',
          title: { contains: searchTerm, mode: 'insensitive' },
        },
        include: {
          images: { orderBy: { position: 'asc' }, take: 1 },
          variants: {
            include: { image: true },
            orderBy: { createdAt: 'asc' },
          },
          categories: { include: { category: true } },
        },
        take: 10,
      });

      // Pick the best product match -- prefer one whose title contains the variantHint
      let product = products[0] || null;
      if (variantHint && products.length > 1) {
        const hintMatch = products.find(p =>
          p.title.toLowerCase().includes(variantHint.toLowerCase())
        );
        if (hintMatch) product = hintMatch;
      }

      if (product && product.variants.length > 0) {
        // Pick the best variant -- prefer one matching variantHint
        let variant = product.variants[0];
        if (variantHint && product.variants.length > 1) {
          const vMatch = product.variants.find(v =>
            v.title.toLowerCase().includes(variantHint.toLowerCase())
          );
          if (vMatch) variant = vMatch;
        }

        const fullProduct = {
          ...product,
          bundleComponents: [],
        };
        const transformed = transformToProduct(fullProduct);

        matchedRecs.push({
          name: rec.name,
          searchQuery: rec.searchQuery,
          quantity: rec.quantity,
          unit: rec.unit,
          category: rec.category,
          matchedProduct: {
            id: product.id,
            variantId: variant.id,
            title: product.title,
            variantTitle: variant.title !== 'Default' && variant.title !== 'Default Title'
              ? variant.title
              : null,
            price: Number(variant.price),
            imageUrl: transformed.images.edges[0]?.node.url || null,
          },
        });
      } else {
        matchedRecs.push({
          name: rec.name,
          searchQuery: rec.searchQuery,
          quantity: rec.quantity,
          unit: rec.unit,
          category: rec.category,
          matchedProduct: null,
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        recommendations: matchedRecs,
        totalDrinks: results.totalDrinks,
        estimatedCost: results.estimatedCost,
        summary: results.summary,
      },
    });
  } catch (error) {
    console.error('[Recommendations] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}
