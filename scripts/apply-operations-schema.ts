/**
 * One-shot DDL applier for the Operations Director Phase 1B tables.
 *
 * Adds:
 *   - operations_recommendations: drift detector queue with dedupe + action log
 *   - operations_snapshots: daily ops snapshot for the briefing + trend charts
 *
 * Why raw SQL: per memory note "Prisma schema drift", schema.prisma has
 * columns deleted that still hold prod data. `prisma db push` would clobber
 * those. Additive migrations go through this script.
 *
 * Usage:
 *   DATABASE_URL=<prod> npx tsx scripts/apply-operations-schema.ts
 *
 * Idempotent — safe to run multiple times.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const STATEMENTS: Array<[string, string]> = [
  [
    'operations_recommendations table',
    `CREATE TABLE IF NOT EXISTS operations_recommendations (
      id TEXT PRIMARY KEY,
      signal_kind TEXT NOT NULL,
      severity TEXT NOT NULL,
      title TEXT NOT NULL,
      evidence JSONB NOT NULL,
      target_entity_type TEXT NOT NULL,
      target_entity_id TEXT NOT NULL,
      action_payload JSONB NOT NULL,
      status TEXT NOT NULL DEFAULT 'open',
      snooze_until TIMESTAMP(3),
      dismiss_reason TEXT,
      action_log JSONB NOT NULL DEFAULT '[]',
      source TEXT NOT NULL DEFAULT 'auto-snapshot',
      shipped_at TIMESTAMP(3),
      measured_at TIMESTAMP(3),
      measurement_result JSONB,
      dedupe_key TEXT NOT NULL,
      created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
  ],
  [
    'operations_recommendations dedupe_key uniq',
    'CREATE UNIQUE INDEX IF NOT EXISTS operations_recommendations_dedupe_key_key ON operations_recommendations(dedupe_key)',
  ],
  [
    'operations_recommendations status_idx',
    'CREATE INDEX IF NOT EXISTS operations_recommendations_status_idx ON operations_recommendations(status)',
  ],
  [
    'operations_recommendations severity_status_idx',
    'CREATE INDEX IF NOT EXISTS operations_recommendations_severity_status_idx ON operations_recommendations(severity, status)',
  ],
  [
    'operations_recommendations signal_kind_status_idx',
    'CREATE INDEX IF NOT EXISTS operations_recommendations_signal_kind_status_idx ON operations_recommendations(signal_kind, status)',
  ],
  [
    'operations_snapshots table',
    `CREATE TABLE IF NOT EXISTS operations_snapshots (
      id TEXT PRIMARY KEY,
      captured_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      inventory_accuracy_pct DOUBLE PRECISION,
      drift_events_total INTEGER NOT NULL,
      drift_events_by_signal JSONB NOT NULL,
      urgent_shortages_count INTEGER NOT NULL,
      cost_coverage_pct DOUBLE PRECISION NOT NULL,
      receiving_lag_p50_hours DOUBLE PRECISION,
      receiving_lag_p90_hours DOUBLE PRECISION,
      cycle_counts_completed_last_7d INTEGER NOT NULL,
      paid_orders_14d_shortage_count INTEGER NOT NULL
    )`,
  ],
  [
    'operations_snapshots captured_at_idx',
    'CREATE INDEX IF NOT EXISTS operations_snapshots_captured_at_idx ON operations_snapshots(captured_at)',
  ],
];

async function main(): Promise<void> {
  console.log('[apply-operations-schema] applying additive DDL…');
  for (const [label, sql] of STATEMENTS) {
    process.stdout.write(`  • ${label.padEnd(54)} `);
    await prisma.$executeRawUnsafe(sql);
    console.log('OK');
  }
  console.log('[apply-operations-schema] done. Safe to deploy now.');
}

main()
  .catch((err) => {
    console.error('[apply-operations-schema] FAILED:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
