/**
 * AI Inventory Module
 * Exports all AI-powered inventory features
 */

// Client and utilities
export { callOpenRouter, AI_MODELS, extractJSON, formatDateForAI, daysBetween } from './inventory-client';
export type { OpenRouterMessage, OpenRouterContentPart, OpenRouterResponse } from './inventory-client';
export type { AIResponse } from './inventory-client';

// Image-based inventory counter
export {
  countInventoryFromImage,
  countInventoryFromMultipleImages,
} from './inventory-counter';
export type {
  ProductCount,
  InventoryCountResult,
  KnownProduct,
} from './inventory-counter';

// Natural language assistant
export {
  processInventoryQuery,
  getInventoryInsights,
  getLowStockAlerts,
  getReorderRecommendations,
  QUICK_QUERIES,
} from './inventory-assistant';
export type {
  InventoryItemSummary,
  InventoryQueryResult,
  QueryType,
  SuggestedAction,
} from './inventory-assistant';

// Stock prediction engine
export {
  predictStockForProduct,
  predictStockBatch,
  quickPredict,
} from './prediction-engine';
export type {
  SalesDataPoint,
  PredictionProduct,
  StockPrediction,
  ReorderRecommendation,
  BatchPredictionResult,
} from './prediction-engine';
