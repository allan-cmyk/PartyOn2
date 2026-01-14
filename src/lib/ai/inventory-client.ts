/**
 * AI Inventory Client
 * Anthropic SDK client for inventory management features
 */

import Anthropic from '@anthropic-ai/sdk';

let anthropicClient: Anthropic | null = null;

/**
 * Get or create Anthropic client instance
 */
export function getAnthropicClient(): Anthropic {
  if (!anthropicClient) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY environment variable is required');
    }
    anthropicClient = new Anthropic({ apiKey });
  }
  return anthropicClient;
}

/**
 * Model configurations for different use cases
 */
export const AI_MODELS = {
  // Vision model for image analysis
  vision: 'claude-sonnet-4-20250514',
  // Fast model for queries
  query: 'claude-sonnet-4-20250514',
  // Analytical model for predictions
  analysis: 'claude-sonnet-4-20250514',
} as const;

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
