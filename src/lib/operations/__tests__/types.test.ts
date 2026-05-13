import { describe, it, expect } from 'vitest';
import {
  buildDedupeKey,
  isHigherSeverity,
  knockDownSeverity,
} from '../types';

describe('operations/types', () => {
  describe('buildDedupeKey', () => {
    it('joins signalKind + targetEntityId with a colon', () => {
      expect(buildDedupeKey('receiving-lag', 'inv_123')).toBe('receiving-lag:inv_123');
    });

    it('treats different targetEntityIds as distinct keys', () => {
      expect(buildDedupeKey('repeated-shorts', 'v1')).not.toBe(
        buildDedupeKey('repeated-shorts', 'v2')
      );
    });
  });

  describe('isHigherSeverity', () => {
    it('urgent > high > normal', () => {
      expect(isHigherSeverity('urgent', 'high')).toBe(true);
      expect(isHigherSeverity('high', 'normal')).toBe(true);
      expect(isHigherSeverity('urgent', 'normal')).toBe(true);
    });

    it('returns false for equal severities', () => {
      expect(isHigherSeverity('high', 'high')).toBe(false);
      expect(isHigherSeverity('urgent', 'urgent')).toBe(false);
    });

    it('returns false when a is lower', () => {
      expect(isHigherSeverity('normal', 'high')).toBe(false);
      expect(isHigherSeverity('high', 'urgent')).toBe(false);
    });
  });

  describe('knockDownSeverity', () => {
    it('urgent → high', () => {
      expect(knockDownSeverity('urgent')).toBe('high');
    });
    it('high → normal', () => {
      expect(knockDownSeverity('high')).toBe('normal');
    });
    it('normal stays normal', () => {
      expect(knockDownSeverity('normal')).toBe('normal');
    });
  });
});
