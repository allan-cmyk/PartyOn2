/**
 * Natural Language Inventory Assistant
 * Answer questions about inventory in plain English
 */

import { getAnthropicClient, AI_MODELS, extractJSON, type AIResponse } from './inventory-client';

/**
 * Inventory item summary for context
 */
export interface InventoryItemSummary {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  lowStockThreshold: number;
  reorderPoint: number;
  category?: string;
  price?: number;
  lastSoldAt?: Date;
  salesLast30Days?: number;
}

/**
 * Query result with structured data and natural response
 */
export interface InventoryQueryResult {
  answer: string;
  relevantItems?: InventoryItemSummary[];
  suggestedActions?: SuggestedAction[];
  queryType: QueryType;
}

/**
 * Types of queries the assistant can handle
 */
export type QueryType =
  | 'low_stock'
  | 'stock_level'
  | 'reorder'
  | 'search'
  | 'comparison'
  | 'summary'
  | 'recommendation'
  | 'general';

/**
 * Suggested action from the assistant
 */
export interface SuggestedAction {
  type: 'reorder' | 'adjust_threshold' | 'view_details' | 'create_alert';
  label: string;
  data?: Record<string, unknown>;
}

/**
 * System prompt for inventory assistant
 */
const ASSISTANT_SYSTEM_PROMPT = `You are an expert inventory management assistant for a premium alcohol delivery service. You help administrators understand their inventory status and make informed decisions.

CAPABILITIES:
1. Answer questions about stock levels
2. Identify low stock items
3. Recommend reorder quantities
4. Provide inventory summaries
5. Compare products or time periods
6. Suggest optimizations

RESPONSE GUIDELINES:
- Be concise and actionable
- Use specific numbers when available
- Highlight urgent issues first
- Suggest next steps when appropriate

OUTPUT FORMAT:
Return a JSON object with this structure:
{
  "answer": "Your natural language response to the user",
  "relevantItemIds": ["array of relevant inventory item IDs"],
  "suggestedActions": [
    {
      "type": "reorder" | "adjust_threshold" | "view_details" | "create_alert",
      "label": "User-friendly action label",
      "data": { optional data for the action }
    }
  ],
  "queryType": "low_stock" | "stock_level" | "reorder" | "search" | "comparison" | "summary" | "recommendation" | "general"
}

Be helpful and proactive. If you notice issues the user didn't ask about, mention them briefly.`;

/**
 * Process a natural language inventory query
 */
export async function processInventoryQuery(
  query: string,
  inventoryContext: InventoryItemSummary[]
): Promise<AIResponse<InventoryQueryResult>> {
  try {
    const client = getAnthropicClient();

    // Build context about current inventory
    const contextSummary = buildInventoryContext(inventoryContext);

    const userPrompt = `Current Inventory Status:
${contextSummary}

User Question: ${query}

Please analyze the inventory data and answer the user's question.`;

    const response = await client.messages.create({
      model: AI_MODELS.query,
      max_tokens: 1500,
      system: ASSISTANT_SYSTEM_PROMPT,
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
      answer: string;
      relevantItemIds?: string[];
      suggestedActions?: SuggestedAction[];
      queryType: QueryType;
    }>(textContent.text);

    if (!parsed) {
      // Return the raw text if JSON parsing fails
      return {
        success: true,
        data: {
          answer: textContent.text,
          queryType: 'general',
        },
      };
    }

    // Map relevant item IDs back to full items
    const relevantItems = parsed.relevantItemIds
      ? inventoryContext.filter((item) =>
          parsed.relevantItemIds?.includes(item.id)
        )
      : undefined;

    return {
      success: true,
      data: {
        answer: parsed.answer,
        relevantItems,
        suggestedActions: parsed.suggestedActions,
        queryType: parsed.queryType,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process query',
    };
  }
}

/**
 * Get quick inventory insights without a specific question
 */
export async function getInventoryInsights(
  inventoryContext: InventoryItemSummary[]
): Promise<AIResponse<InventoryQueryResult>> {
  return processInventoryQuery(
    'Give me a quick summary of the inventory status, highlighting any urgent issues or recommended actions.',
    inventoryContext
  );
}

/**
 * Get low stock alerts
 */
export async function getLowStockAlerts(
  inventoryContext: InventoryItemSummary[]
): Promise<AIResponse<InventoryQueryResult>> {
  return processInventoryQuery(
    'What items are running low or need to be reordered? List them by urgency.',
    inventoryContext
  );
}

/**
 * Get reorder recommendations
 */
export async function getReorderRecommendations(
  inventoryContext: InventoryItemSummary[]
): Promise<AIResponse<InventoryQueryResult>> {
  return processInventoryQuery(
    'Based on current stock levels and sales velocity, what items should be reordered and in what quantities?',
    inventoryContext
  );
}

/**
 * Build a concise inventory context string
 */
function buildInventoryContext(items: InventoryItemSummary[]): string {
  if (items.length === 0) {
    return 'No inventory items found.';
  }

  // Summary stats
  const totalItems = items.length;
  const totalUnits = items.reduce((sum, i) => sum + i.quantity, 0);
  const lowStockItems = items.filter((i) => i.quantity <= i.lowStockThreshold);
  const outOfStock = items.filter((i) => i.quantity === 0);

  let context = `SUMMARY: ${totalItems} products, ${totalUnits} total units\n`;
  context += `- ${lowStockItems.length} items at or below low stock threshold\n`;
  context += `- ${outOfStock.length} items out of stock\n\n`;

  // Group by category if available
  const categories = new Map<string, InventoryItemSummary[]>();
  items.forEach((item) => {
    const cat = item.category || 'Uncategorized';
    if (!categories.has(cat)) {
      categories.set(cat, []);
    }
    categories.get(cat)!.push(item);
  });

  // List items by category
  context += 'INVENTORY DETAILS:\n';
  categories.forEach((categoryItems, category) => {
    context += `\n[${category}]\n`;
    categoryItems.forEach((item) => {
      const status = getStockStatus(item);
      context += `- ${item.name} (ID: ${item.id}): ${item.quantity} units ${status}`;
      if (item.salesLast30Days !== undefined) {
        context += ` | Sales/30d: ${item.salesLast30Days}`;
      }
      context += '\n';
    });
  });

  return context;
}

/**
 * Get stock status indicator
 */
function getStockStatus(item: InventoryItemSummary): string {
  if (item.quantity === 0) return '[OUT OF STOCK]';
  if (item.quantity <= item.reorderPoint) return '[REORDER NOW]';
  if (item.quantity <= item.lowStockThreshold) return '[LOW STOCK]';
  return '[OK]';
}

/**
 * Predefined queries for quick access
 */
export const QUICK_QUERIES = [
  { label: "What's running low?", query: 'What items are at or below low stock threshold?' },
  { label: 'Reorder suggestions', query: 'What should I reorder and how much?' },
  { label: 'Inventory summary', query: 'Give me an overview of current inventory status.' },
  { label: 'Best sellers', query: 'What are the best selling items in the last 30 days?' },
  { label: 'Dead stock', query: 'Which items have had no sales recently?' },
] as const;
