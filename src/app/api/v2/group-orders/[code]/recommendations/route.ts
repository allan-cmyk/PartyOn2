/**
 * GET /api/v2/group-orders/[code]/recommendations?guests=30&duration=4h&drinkTypes=beer,seltzers
 * Generate drink recommendations using the drink planner logic, matched to real products.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';
import { calculateQuizResults, SEARCH_OVERRIDES } from '@/lib/drinkPlannerLogic';
import { transformToProduct } from '@/lib/products/transform';
import type { QuizState, DrinkCategory, Duration, EventType } from '@/lib/drinkPlannerTypes';

interface RouteParams {
  params: Promise<{ code: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await params; // consume route params

    const searchParams = request.nextUrl.searchParams;
    const guests = parseInt(searchParams.get('guests') || '20');
    const duration = (searchParams.get('duration') || '4h') as Duration;
    const drinkTypesParam = searchParams.get('drinkTypes') || 'beer,seltzers';
    const drinkCategories = drinkTypesParam.split(',').filter(Boolean) as DrinkCategory[];
    const partyType = searchParams.get('partyType') || null;

    // Map partyType to eventType for the quiz
    const eventTypeMap: Record<string, EventType> = {
      BACHELOR: 'bachelor',
      BACHELORETTE: 'bachelorette',
      WEDDING: 'wedding',
      CORPORATE: 'corporate',
      HOUSE_PARTY: 'house-party',
    };
    const eventType: EventType = (partyType && eventTypeMap[partyType]) || 'house-party';

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
      const searchTerm = SEARCH_OVERRIDES[rec.name] || rec.searchQuery || rec.name;

      // Search for product by title
      const product = await prisma.product.findFirst({
        where: {
          status: 'ACTIVE',
          title: { contains: searchTerm, mode: 'insensitive' },
        },
        include: {
          images: { orderBy: { position: 'asc' }, take: 1 },
          variants: {
            include: { image: true },
            orderBy: { createdAt: 'asc' },
            take: 1,
          },
          categories: { include: { category: true } },
        },
      });

      if (product && product.variants.length > 0) {
        const variant = product.variants[0];
        // Need to pass bundleComponents for transformToProduct
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
        // Include rec without matched product
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
