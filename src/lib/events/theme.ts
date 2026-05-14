import type { EventTheme } from './types';

/**
 * Color palette per event theme. Mirrors the landing-page theme structure
 * so event pages feel like part of the same brand system.
 */
export type EventColorTheme = {
  primary: string;
  primaryHover: string;
  primaryText: string;
  navy: string;
  cream: string;
  blue: string;
  accent: string;
};

export const EVENT_THEMES: Record<EventTheme, EventColorTheme> = {
  birthday: {
    primary: '#F2D34F',
    primaryHover: '#FACC15',
    primaryText: '#0A1F33',
    navy: '#0A1F33',
    cream: '#FAF6EE',
    blue: '#0B74B8',
    accent: '#EF4444',
  },
  bachelor: {
    primary: '#F2D34F',
    primaryHover: '#FACC15',
    primaryText: '#0A1F33',
    navy: '#0A1F33',
    cream: '#FAF6EE',
    blue: '#0B74B8',
    accent: '#1E40AF',
  },
  bachelorette: {
    primary: '#F472B6',
    primaryHover: '#EC4899',
    primaryText: '#3B0764',
    navy: '#3B0764',
    cream: '#FDF4FF',
    blue: '#9333EA',
    accent: '#DB2777',
  },
  corporate: {
    primary: '#0B74B8',
    primaryHover: '#0E5A8E',
    primaryText: '#FFFFFF',
    navy: '#0A1F33',
    cream: '#F8FAFC',
    blue: '#0B74B8',
    accent: '#0EA5E9',
  },
  wedding: {
    primary: '#D4AF37',
    primaryHover: '#B8951F',
    primaryText: '#FFFFFF',
    navy: '#1F2937',
    cream: '#FAF7F2',
    blue: '#1F2937',
    accent: '#92400E',
  },
  casual: {
    primary: '#0B74B8',
    primaryHover: '#0E5A8E',
    primaryText: '#FFFFFF',
    navy: '#0A1F33',
    cream: '#FAF6EE',
    blue: '#0B74B8',
    accent: '#10B981',
  },
};
