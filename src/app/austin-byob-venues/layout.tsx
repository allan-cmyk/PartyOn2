import type { ReactElement, ReactNode } from 'react';
import { metadata } from './metadata';

export { metadata };

interface LayoutProps {
  children: ReactNode;
}

export default function AustinBYOBVenuesLayout({ children }: LayoutProps): ReactElement {
  return <>{children}</>;
}
