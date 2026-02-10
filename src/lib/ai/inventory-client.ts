/**
 * AI Inventory Client
 * OpenRouter client for inventory management features
 */

/**
 * Model configurations for different use cases (OpenRouter format)
 */
export const AI_MODELS = {
  // Vision model for image analysis
  vision: 'anthropic/claude-sonnet-4',
  // Fast model for queries
  query: 'anthropic/claude-sonnet-4',
  // Analytical model for predictions
  analysis: 'anthropic/claude-sonnet-4',
} as const;

/**
 * OpenRouter API configuration
 */
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

/**
 * Get OpenRouter API key
 */
function getOpenRouterApiKey(): string {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY environment variable is required');
  }
  return apiKey;
}

/**
 * OpenRouter message types
 */
export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | OpenRouterContentPart[];
}

export interface OpenRouterContentPart {
  type: 'text' | 'image_url';
  text?: string;
  image_url?: {
    url: string;
  };
}

export interface OpenRouterResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Call OpenRouter API
 */
export async function callOpenRouter(
  model: string,
  messages: OpenRouterMessage[],
  options?: {
    temperature?: number;
    maxTokens?: number;
  }
): Promise<OpenRouterResponse> {
  const apiKey = getOpenRouterApiKey();

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://partyondelivery.com',
      'X-Title': 'Party On Delivery Inventory AI',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: options?.temperature ?? 0.3,
      max_tokens: options?.maxTokens ?? 2000,
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error('OpenRouter API error:', response.status, errorData);
    throw new Error(`OpenRouter API error: ${response.status} - ${errorData}`);
  }

  return response.json();
}

/**
 * Common response types
 */
export interface AIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  confidence?: number;
}

/**
 * Utility to extract JSON from AI response text
 */
export function extractJSON<T>(text: string): T | null {
  try {
    // Try to find JSON in the response
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]) as T;
    }

    // Try to parse the entire response as JSON
    const cleaned = text.trim();
    if (cleaned.startsWith('{') || cleaned.startsWith('[')) {
      return JSON.parse(cleaned) as T;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Format a date for AI context
 */
export function formatDateForAI(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Calculate days between two dates
 */
export function daysBetween(date1: Date, date2: Date): number {
  const diff = Math.abs(date2.getTime() - date1.getTime());
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
