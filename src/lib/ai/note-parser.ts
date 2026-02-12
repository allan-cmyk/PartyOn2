/**
 * AI-powered inventory note parser
 * Uses Claude via OpenRouter to extract structured adjustments from free-text notes
 */

import { callOpenRouter, extractJSON, AI_MODELS } from './inventory-client';

export interface KnownProduct {
  id: string;
  title: string;
  variants: { id: string; title: string; sku: string | null }[];
}

export interface ParsedAdjustment {
  productName: string;
  productId: string | null;
  variantId: string | null;
  quantity: number;
  action: 'add' | 'remove' | 'set';
  confidence: number;
}

/**
 * Parse a free-text inventory note into structured adjustments
 */
export async function parseInventoryNote(
  noteContent: string,
  products: KnownProduct[]
): Promise<ParsedAdjustment[]> {
  const productCatalog = products.map((p) => ({
    id: p.id,
    title: p.title,
    variants: p.variants.map((v) => ({
      id: v.id,
      title: v.title,
      sku: v.sku,
    })),
  }));

  const response = await callOpenRouter(AI_MODELS.query, [
    {
      role: 'system',
      content: `You are an inventory management assistant for a liquor/beverage delivery company called Party On Delivery. Your job is to parse free-text inventory notes into structured adjustments.

You will receive:
1. A free-text note from staff describing inventory changes
2. A product catalog to match against

For each item mentioned in the note, extract:
- productName: the product name as mentioned in the note
- productId: the best-matching product ID from the catalog (null if no good match)
- variantId: the best-matching variant ID if applicable (null if no variant match or product has only one variant)
- quantity: the number of units (positive integer). If they say "a case" or "a box", treat it as 1 unit unless context says otherwise. For bottles, use the exact count.
- action: "add" (receiving stock), "remove" (removing/writing off stock), or "set" (setting absolute count)
- confidence: 0.0-1.0 how confident you are in the product match

Default action is "add" unless the note says remove, take out, write off, broke, damaged, etc.

Respond with ONLY a JSON array. No explanation.`,
    },
    {
      role: 'user',
      content: `Note: "${noteContent}"

Product catalog:
${JSON.stringify(productCatalog, null, 2)}`,
    },
  ], {
    temperature: 0.1,
    maxTokens: 2000,
  });

  const text = response.choices[0]?.message?.content;
  if (!text) {
    throw new Error('No response from AI');
  }

  const parsed = extractJSON<ParsedAdjustment[]>(text);
  if (!parsed || !Array.isArray(parsed)) {
    throw new Error('Failed to parse AI response into adjustments');
  }

  return parsed;
}
