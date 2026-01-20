/**
 * Image-Based Inventory Counter
 * Uses Claude Vision via OpenRouter to count products in photos
 */

import { callOpenRouter, AI_MODELS, extractJSON, type AIResponse, type OpenRouterMessage, type OpenRouterContentPart } from './inventory-client';

/**
 * Product count result from image analysis
 */
export interface ProductCount {
  productName: string;
  estimatedQuantity: number;
  confidence: number; // 0-1
  notes?: string;
}

/**
 * Full inventory count result
 */
export interface InventoryCountResult {
  products: ProductCount[];
  totalItemsCounted: number;
  imageQuality: 'excellent' | 'good' | 'fair' | 'poor';
  suggestions?: string[];
  processingTime: number;
}

/**
 * Known product reference for better detection
 */
export interface KnownProduct {
  id: string;
  name: string;
  variants?: string[];
  packagingDescription?: string;
}

/**
 * System prompt for inventory counting
 */
const INVENTORY_COUNT_PROMPT = `You are an expert inventory counting assistant for a premium alcohol delivery service. Your task is to analyze images of storage areas, shelves, or inventory and count the products visible.

IMPORTANT GUIDELINES:
1. Count each distinct product type separately
2. For partially visible items, estimate the count based on visible portions
3. Be conservative - it's better to undercount than overcount
4. Note any products that appear damaged or incorrectly stored
5. If products are stacked, estimate the depth when possible
6. Distinguish between different sizes of the same product (e.g., 750ml vs 1L bottles)

OUTPUT FORMAT:
Return a JSON object with this structure:
{
  "products": [
    {
      "productName": "string - product name with size/variant if identifiable",
      "estimatedQuantity": number,
      "confidence": number between 0 and 1,
      "notes": "optional string for special observations"
    }
  ],
  "imageQuality": "excellent" | "good" | "fair" | "poor",
  "suggestions": ["optional array of suggestions for better counting"]
}

Be thorough but concise. Focus on accuracy over speed.`;

/**
 * Analyze an image and count inventory items
 */
export async function countInventoryFromImage(
  imageData: string, // Base64 encoded image or URL
  knownProducts?: KnownProduct[]
): Promise<AIResponse<InventoryCountResult>> {
  const startTime = Date.now();

  try {
    // Build user prompt with known products context
    let userPrompt = 'Please count all products visible in this inventory image.';
    if (knownProducts && knownProducts.length > 0) {
      userPrompt += '\n\nKnown products to look for:\n';
      knownProducts.forEach((p) => {
        userPrompt += `- ${p.name}`;
        if (p.variants) userPrompt += ` (variants: ${p.variants.join(', ')})`;
        if (p.packagingDescription) userPrompt += ` - ${p.packagingDescription}`;
        userPrompt += '\n';
      });
    }

    // Determine if imageData is URL or base64
    const isUrl = imageData.startsWith('http://') || imageData.startsWith('https://');

    // Build content array for OpenRouter vision request
    const contentParts: OpenRouterContentPart[] = [
      {
        type: 'image_url',
        image_url: {
          url: isUrl ? imageData : `data:${detectMediaType(imageData)};base64,${imageData.replace(/^data:image\/\w+;base64,/, '')}`,
        },
      },
      {
        type: 'text',
        text: userPrompt,
      },
    ];

    const messages: OpenRouterMessage[] = [
      { role: 'system', content: INVENTORY_COUNT_PROMPT },
      { role: 'user', content: contentParts },
    ];

    const response = await callOpenRouter(AI_MODELS.vision, messages, {
      maxTokens: 2000,
    });

    // Extract text response
    const textContent = response.choices?.[0]?.message?.content;
    if (!textContent) {
      return {
        success: false,
        error: 'No text response from AI model',
      };
    }

    // Parse JSON from response
    const parsed = extractJSON<{
      products: ProductCount[];
      imageQuality: InventoryCountResult['imageQuality'];
      suggestions?: string[];
    }>(textContent);

    if (!parsed) {
      return {
        success: false,
        error: 'Failed to parse AI response as JSON',
      };
    }

    const processingTime = Date.now() - startTime;

    // Calculate total items counted
    const totalItemsCounted = parsed.products.reduce(
      (sum, p) => sum + p.estimatedQuantity,
      0
    );

    // Calculate average confidence
    const avgConfidence =
      parsed.products.length > 0
        ? parsed.products.reduce((sum, p) => sum + p.confidence, 0) /
          parsed.products.length
        : 0;

    return {
      success: true,
      data: {
        products: parsed.products,
        totalItemsCounted,
        imageQuality: parsed.imageQuality,
        suggestions: parsed.suggestions,
        processingTime,
      },
      confidence: avgConfidence,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to analyze image',
    };
  }
}

/**
 * Count inventory from multiple images and merge results
 */
export async function countInventoryFromMultipleImages(
  images: string[],
  knownProducts?: KnownProduct[]
): Promise<AIResponse<InventoryCountResult>> {
  const startTime = Date.now();

  try {
    // Process all images in parallel
    const results = await Promise.all(
      images.map((img) => countInventoryFromImage(img, knownProducts))
    );

    // Merge successful results
    const successfulResults = results.filter(
      (r): r is AIResponse<InventoryCountResult> & { data: InventoryCountResult } =>
        r.success && r.data !== undefined
    );

    if (successfulResults.length === 0) {
      return {
        success: false,
        error: 'All image analyses failed',
      };
    }

    // Merge product counts
    const mergedProducts = new Map<string, ProductCount>();

    for (const result of successfulResults) {
      for (const product of result.data.products) {
        const key = product.productName.toLowerCase();
        const existing = mergedProducts.get(key);

        if (existing) {
          // Take the higher count and average the confidence
          mergedProducts.set(key, {
            productName: product.productName,
            estimatedQuantity: Math.max(
              existing.estimatedQuantity,
              product.estimatedQuantity
            ),
            confidence: (existing.confidence + product.confidence) / 2,
            notes: existing.notes || product.notes,
          });
        } else {
          mergedProducts.set(key, { ...product });
        }
      }
    }

    const products = Array.from(mergedProducts.values());
    const totalItemsCounted = products.reduce(
      (sum, p) => sum + p.estimatedQuantity,
      0
    );

    // Determine overall image quality (worst of all)
    const qualityOrder = ['excellent', 'good', 'fair', 'poor'] as const;
    const worstQuality = successfulResults.reduce((worst, r) => {
      const idx = qualityOrder.indexOf(r.data.imageQuality);
      const worstIdx = qualityOrder.indexOf(worst);
      return idx > worstIdx ? r.data.imageQuality : worst;
    }, 'excellent' as InventoryCountResult['imageQuality']);

    // Merge suggestions
    const allSuggestions = new Set<string>();
    successfulResults.forEach((r) => {
      r.data.suggestions?.forEach((s) => allSuggestions.add(s));
    });

    const avgConfidence =
      products.length > 0
        ? products.reduce((sum, p) => sum + p.confidence, 0) / products.length
        : 0;

    return {
      success: true,
      data: {
        products,
        totalItemsCounted,
        imageQuality: worstQuality,
        suggestions: Array.from(allSuggestions),
        processingTime: Date.now() - startTime,
      },
      confidence: avgConfidence,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to analyze images',
    };
  }
}

/**
 * Detect media type from base64 string
 */
function detectMediaType(
  base64: string
): 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp' {
  if (base64.startsWith('data:image/')) {
    const match = base64.match(/^data:image\/(\w+);/);
    if (match) {
      const type = match[1].toLowerCase();
      if (type === 'jpeg' || type === 'jpg') return 'image/jpeg';
      if (type === 'png') return 'image/png';
      if (type === 'gif') return 'image/gif';
      if (type === 'webp') return 'image/webp';
    }
  }

  // Default to JPEG
  return 'image/jpeg';
}
