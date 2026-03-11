import { DefaultTemplate } from './DefaultTemplate';
import type { CategoryTemplateProps } from './template-types';

export function BartenderTemplate(props: CategoryTemplateProps) {
  return <DefaultTemplate {...props} />;
}
