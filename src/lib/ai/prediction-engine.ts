/**
 * Stock Prediction Engine
 * Predicts stockouts, recommends reorder timing and quantities
 */

import { getAnthropicClient, AI_MODELS, extractJSON, formatDateForAI, type AIResponse } from './inventory-client';

/**
 * Sales history data point
 */
export interface SalesDataPoint {
  date: Date;
  quantity: number;
  revenue?: number;
}

/**
 * Product for prediction analysis
 */
export interface PredictionProduct {
  id: string;
  name: string;
  currentStock: number;
  reorderPoint: number;
  lowStockThreshold: number;
  leadTimeDays: number; // How long it takes to receive new stock
  unitCost?: number;
  salesHistory: SalesDataPoint[]; // Last 30-90 days ideally
}

/**
 * Stock prediction result
 */
export interface StockPrediction {
  productId: string;
  productName: string;
  currentStock: number;
  predictedDaysUntilStockout: number | null;
  predictedStockoutDate: Date | null;
  averageDailySales: number;
  salesTrend: 'increasing' | 'stable' | 'decreasing';
  confidence: number;
  urgency: 'critical' | 'high' | 'medium' | 'low' | 'none';
  recommendation: ReorderRecommendation | null;
}

/**
 * Reorder recommendation
 */
export interface ReorderRecommendation {
  recommendedQuantity: number;
  recommendedOrderDate: Date;
  estimatedCost?: number;
  reasoning: string;
}

/**
 * Batch prediction result
 */
export interface BatchPredictionResult {
  predictions: StockPrediction[];
  criticalItems: StockPrediction[];
  upcomingStockouts: StockPrediction[];
  totalReorderCost?: number;
  generatedAt: Date;
}

/**
 * System prompt for prediction engine
 */
const PREDICTION_SYSTEM_PROMPT = `You are an expert inventory prediction system for a premium alcohol delivery service. Analyze sales history and current stock levels to predict stockouts and recommend reorder actions.

ANALYSIS GUIDELINES:
1. Calculate average daily sales from recent history
2. Identify sales trends (increasing, stable, decreasing)
3. Account for seasonality if visible in data
4. Consider lead time when recommending order dates
5. Suggest reorder quantities that balance stock costs and stockout risk

URGENCY LEVELS:
- critical: Will stock out before reorder can arrive
- high: Will stock out within lead time
- medium: Will reach reorder point within 7 days
- low: Will reach reorder point within 14 days
- none: Adequate stock for foreseeable future

OUTPUT FORMAT:
Return a JSON object with this structure:
{
  "productId": "string",
  "predictedDaysUntilStockout": number or null if >90 days,
  "averageDailySales": number (units per day),
  "salesTrend": "increasing" | "stable" | "decreasing",
  "confidence": number 0-1,
  "urgency": "critical" | "high" | "medium" | "low" | "none",
  "recommendation": {
    "recommendedQuantity": number,
    "recommendOrderInDays": number (0 = now),
    "reasoning": "Brief explanation"
  } or null if no action needed
}

Be accurate and conservative. False urgency is as bad as missed alerts.`;

/**
 * Generate stock prediction for a single product
 */
export async function predictStockForProduct(
  product: PredictionProduct
): Promise<AIResponse<StockPrediction>> {
  try {
    const client = getAnthropicClient();

    // Prepare sales history summary
    const salesSummary = summarizeSalesHistory(product.salesHistory);

    const userPrompt = `Analyze this product and predict stockout:

Product: ${product.name} (ID: ${product.id})
Current Stock: ${product.currentStock} units
Reorder Point: ${product.reorderPoint} units
Low Stock Threshold: ${product.lowStockThreshold} units
Lead Time: ${product.leadTimeDays} days
${product.unitCost ? `Unit Cost: $${product.unitCost}` : ''}

Sales History (last ${product.salesHistory.length} days):
${salesSummary}

Today's Date: ${formatDateForAI(new Date())}

Provide your prediction and recommendation.`;

    const response = await client.messages.create({
      model: AI_MODELS.analysis,
      max_tokens: 1000,
      system: PREDICTION_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    // Extract text response
    const textContent = response.content.find((c) => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      return {
        success: false,
        error: 'No text response from AI model',
      };
    }

    // Parse JSON from response
    const parsed = extractJSON<{
      productId: string;
      predictedDaysUntilStockout: number | null;
      averageDailySales: number;
      salesTrend: StockPrediction['salesTrend'];
      confidence: number;
      urgency: StockPrediction['urgency'];
      recommendation: {
        recommendedQuantity: number;
        recommendOrderInDays: number;
        reasoning: string;
      } | null;
    }>(textContent.text);

    if (!parsed) {
      return {
        success: false,
        error: 'Failed to parse prediction response',
      };
    }

    // Calculate dates
    const today = new Date();
    const predictedStockoutDate =
      parsed.predictedDaysUntilStockout !== null
        ? new Date(
            today.getTime() + parsed.predictedDaysUntilStockout * 24 * 60 * 60 * 1000
          )
        : null;

    const recommendation = parsed.recommendation
      ? {
          recommendedQuantity: parsed.recommendation.recommendedQuantity,
          recommendedOrderDate: new Date(
            today.getTime() +
              parsed.recommendation.recommendOrderInDays * 24 * 60 * 60 * 1000
          ),
          estimatedCost: product.unitCost
            ? product.unitCost * parsed.recommendation.recommendedQuantity
            : undefined,
          reasoning: parsed.recommendation.reasoning,
        }
      : null;

    return {
      success: true,
      data: {
        productId: product.id,
        productName: product.name,
        currentStock: product.currentStock,
        predictedDaysUntilStockout: parsed.predictedDaysUntilStockout,
        predictedStockoutDate,
        averageDailySales: parsed.averageDailySales,
        salesTrend: parsed.salesTrend,
        confidence: parsed.confidence,
        urgency: parsed.urgency,
        recommendation,
      },
      confidence: parsed.confidence,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to generate prediction',
    };
  }
}

/**
 * Generate predictions for multiple products (batch)
 */
export async function predictStockBatch(
  products: PredictionProduct[]
): Promise<AIResponse<BatchPredictionResult>> {
  try {
    // Process products in parallel (max 5 concurrent)
    const batchSize = 5;
    const predictions: StockPrediction[] = [];

    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);
      const results = await Promise.all(
        batch.map((product) => predictStockForProduct(product))
      );

      for (const result of results) {
        if (result.success && result.data) {
          predictions.push(result.data);
        }
      }
    }

    // Categorize predictions
    const criticalItems = predictions.filter((p) => p.urgency === 'critical');
    const upcomingStockouts = predictions.filter(
      (p) =>
        p.predictedDaysUntilStockout !== null &&
        p.predictedDaysUntilStockout <= 14
    );

    // Calculate total reorder cost
    const totalReorderCost = predictions.reduce((sum, p) => {
      return sum + (p.recommendation?.estimatedCost || 0);
    }, 0);

    return {
      success: true,
      data: {
        predictions,
        criticalItems,
        upcomingStockouts,
        totalReorderCost: totalReorderCost > 0 ? totalReorderCost : undefined,
        generatedAt: new Date(),
      },
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to generate batch predictions',
    };
  }
}

/**
 * Quick local prediction without AI (for real-time estimates)
 */
export function quickPredict(product: PredictionProduct): StockPrediction {
  const salesHistory = product.salesHistory;

  // Calculate average daily sales
  const totalSales = salesHistory.reduce((sum, d) => sum + d.quantity, 0);
  const daysCovered = salesHistory.length > 0 ? salesHistory.length : 1;
  const avgDailySales = totalSales / daysCovered;

  // Calculate trend (compare first half to second half)
  let salesTrend: StockPrediction['salesTrend'] = 'stable';
  if (salesHistory.length >= 14) {
    const midpoint = Math.floor(salesHistory.length / 2);
    const firstHalf = salesHistory.slice(0, midpoint);
    const secondHalf = salesHistory.slice(midpoint);

    const firstAvg =
      firstHalf.reduce((sum, d) => sum + d.quantity, 0) / firstHalf.length;
    const secondAvg =
      secondHalf.reduce((sum, d) => sum + d.quantity, 0) / secondHalf.length;

    const changePercent = ((secondAvg - firstAvg) / firstAvg) * 100;
    if (changePercent > 15) salesTrend = 'increasing';
    else if (changePercent < -15) salesTrend = 'decreasing';
  }

  // Predict days until stockout
  const predictedDaysUntilStockout =
    avgDailySales > 0
      ? Math.floor(product.currentStock / avgDailySales)
      : null;

  // Determine urgency
  let urgency: StockPrediction['urgency'] = 'none';
  if (predictedDaysUntilStockout !== null) {
    if (predictedDaysUntilStockout <= product.leadTimeDays) {
      urgency = 'critical';
    } else if (predictedDaysUntilStockout <= product.leadTimeDays * 1.5) {
      urgency = 'high';
    } else if (product.currentStock <= product.reorderPoint) {
      urgency = 'medium';
    } else if (product.currentStock <= product.lowStockThreshold) {
      urgency = 'low';
    }
  }

  // Generate recommendation
  let recommendation: ReorderRecommendation | null = null;
  if (urgency !== 'none' && avgDailySales > 0) {
    // Recommend 30 days of stock
    const recommendedQuantity = Math.ceil(avgDailySales * 30);
    const orderInDays = Math.max(
      0,
      (predictedDaysUntilStockout || 0) - product.leadTimeDays
    );

    recommendation = {
      recommendedQuantity,
      recommendedOrderDate: new Date(
        Date.now() + orderInDays * 24 * 60 * 60 * 1000
      ),
      estimatedCost: product.unitCost
        ? product.unitCost * recommendedQuantity
        : undefined,
      reasoning: `Based on ${avgDailySales.toFixed(1)} units/day average sales`,
    };
  }

  return {
    productId: product.id,
    productName: product.name,
    currentStock: product.currentStock,
    predictedDaysUntilStockout,
    predictedStockoutDate:
      predictedDaysUntilStockout !== null
        ? new Date(Date.now() + predictedDaysUntilStockout * 24 * 60 * 60 * 1000)
        : null,
    averageDailySales: avgDailySales,
    salesTrend,
    confidence: salesHistory.length >= 30 ? 0.8 : salesHistory.length >= 14 ? 0.6 : 0.4,
    urgency,
    recommendation,
  };
}

/**
 * Summarize sales history for AI context
 */
function summarizeSalesHistory(history: SalesDataPoint[]): string {
  if (history.length === 0) {
    return 'No sales history available';
  }

  // Sort by date
  const sorted = [...history].sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );

  // Calculate stats
  const quantities = sorted.map((d) => d.quantity);
  const totalSales = quantities.reduce((sum, q) => sum + q, 0);
  const avgSales = totalSales / quantities.length;
  const maxSales = Math.max(...quantities);
  const minSales = Math.min(...quantities);

  // Build summary
  let summary = `Period: ${formatDateForAI(sorted[0].date)} to ${formatDateForAI(sorted[sorted.length - 1].date)}\n`;
  summary += `Total Sales: ${totalSales} units over ${sorted.length} days\n`;
  summary += `Average: ${avgSales.toFixed(1)} units/day | Min: ${minSales} | Max: ${maxSales}\n`;

  // Last 7 days detail
  const recent = sorted.slice(-7);
  summary += `\nLast 7 days:\n`;
  recent.forEach((d) => {
    summary += `  ${d.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}: ${d.quantity} units\n`;
  });

  return summary;
}
