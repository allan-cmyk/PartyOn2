import type { ComponentType } from 'react';
import type { CategoryTemplateProps } from './template-types';
import { BartenderTemplate } from './BartenderTemplate';

const CATEGORY_TEMPLATES: Record<string, ComponentType<CategoryTemplateProps>> = {
  BARTENDER: BartenderTemplate,
};

export function getCategoryTemplate(category: string): ComponentType<CategoryTemplateProps> | null {
  return CATEGORY_TEMPLATES[category] ?? null;
}

export type { CategoryTemplateProps } from './template-types';
