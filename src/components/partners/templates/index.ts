import type { ComponentType } from 'react';
import type { CategoryTemplateProps } from './template-types';
import { BartenderTemplate } from './BartenderTemplate';
import { DefaultTemplate } from './DefaultTemplate';

const CATEGORY_TEMPLATES: Record<string, ComponentType<CategoryTemplateProps>> = {
  BARTENDER: BartenderTemplate,
};

export function getCategoryTemplate(category: string): ComponentType<CategoryTemplateProps> {
  return CATEGORY_TEMPLATES[category] ?? DefaultTemplate;
}

export type { CategoryTemplateProps } from './template-types';
