/**
 * Drift-signal detector barrel — see detectors/signals-a.ts and signals-b.ts
 * for the actual implementations. Re-exported here so callers can
 * `import { detectXxx } from '@/lib/operations/detectors'` without caring
 * which batch a signal belongs to.
 */

export {
  detectReceivingLag,
  detectPickInventoryLag,
  detectRepeatedShorts,
  detectNegativeAvailable,
  detectVelocityAnomaly,
} from './detectors/signals-a';

export {
  detectAiNoteBacklog,
  detectVariantMismapping,
  detectCostCoverageGap,
  detectCycleCountOverdue,
  detectPreFulfillmentShortage,
} from './detectors/signals-b';
