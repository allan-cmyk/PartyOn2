/**
 * Orchestrator tests — focused on the snooze/dismiss suppression rule, which
 * is THE behavior that keeps the queue trustworthy (§5d). Per-detector
 * behavior lives in detectors-*.test.ts.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

const prismaMock = vi.hoisted(() => ({
  operationsRecommendation: { findFirst: vi.fn() },
}));

vi.mock('@/lib/database/client', () => ({ prisma: prismaMock }));

import { applySuppression } from '../recommendations';
import type { OperationsRecommendationInput } from '../types';

function rec(overrides: Partial<OperationsRecommendationInput> = {}): OperationsRecommendationInput {
  return {
    signalKind: 'receiving-lag',
    severity: 'high',
    title: 't',
    evidence: [{ metricName: 'm', metricValue: 1 }],
    targetEntityType: 'receivingInvoice',
    targetEntityId: 'inv_1',
    actionPayload: { kind: 'navigate', params: { href: '/x' } },
    ...overrides,
  };
}

beforeEach(() => {
  prismaMock.operationsRecommendation.findFirst.mockReset();
});

describe('applySuppression', () => {
  it('passes recs through when no recent resolution exists', async () => {
    prismaMock.operationsRecommendation.findFirst.mockResolvedValue(null);
    const out = await applySuppression([rec()]);
    expect(out.kept).toHaveLength(1);
    expect(out.suppressedSnoozed).toBe(0);
    expect(out.suppressedKnockdown).toBe(0);
  });

  it('drops recs whose snoozeUntil is in the future', async () => {
    const now = new Date('2026-05-13T10:00:00Z');
    prismaMock.operationsRecommendation.findFirst.mockResolvedValue({
      status: 'snoozed',
      snoozeUntil: new Date('2026-05-20T00:00:00Z'),
    });
    const out = await applySuppression([rec()], now);
    expect(out.kept).toHaveLength(0);
    expect(out.suppressedSnoozed).toBe(1);
  });

  it('surfaces recs whose snoozeUntil has passed', async () => {
    const now = new Date('2026-05-13T10:00:00Z');
    prismaMock.operationsRecommendation.findFirst.mockResolvedValue({
      status: 'snoozed',
      snoozeUntil: new Date('2026-05-10T00:00:00Z'),
    });
    const out = await applySuppression([rec()], now);
    expect(out.kept).toHaveLength(1);
    expect(out.suppressedSnoozed).toBe(0);
  });

  it('knocks severity down one tier when recently rejected', async () => {
    prismaMock.operationsRecommendation.findFirst.mockResolvedValue({
      status: 'rejected',
      snoozeUntil: null,
      dismissReason: 'intentional buffer',
    });
    const out = await applySuppression([rec({ severity: 'urgent' })]);
    expect(out.kept).toHaveLength(1);
    expect(out.kept[0].severity).toBe('high');
    expect(out.suppressedKnockdown).toBe(1);
  });

  it('also knocks down when recently invalidated', async () => {
    prismaMock.operationsRecommendation.findFirst.mockResolvedValue({
      status: 'invalidated',
      snoozeUntil: null,
    });
    const out = await applySuppression([rec({ severity: 'high' })]);
    expect(out.kept[0].severity).toBe('normal');
    expect(out.suppressedKnockdown).toBe(1);
  });

  it("doesn't lower below normal — normal stays normal", async () => {
    prismaMock.operationsRecommendation.findFirst.mockResolvedValue({
      status: 'rejected',
      snoozeUntil: null,
    });
    const out = await applySuppression([rec({ severity: 'normal' })]);
    expect(out.kept[0].severity).toBe('normal');
  });
});
