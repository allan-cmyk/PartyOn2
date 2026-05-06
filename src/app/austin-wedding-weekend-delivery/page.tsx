import type { Metadata } from 'next';
import LandingPageTemplate from '@/components/landing/LandingPageTemplate';
import { weddingConfig } from '@/components/landing/configs/wedding';
import { getCuratedCatalog } from '@/lib/landing/getCuratedCatalog';
import { getOccasionPackages } from '@/lib/landing/getOccasionPackages';

export const metadata: Metadata = {
  title: weddingConfig.metaTitle,
  description: weddingConfig.metaDescription,
  alternates: { canonical: `/${weddingConfig.slug}` },
  openGraph: {
    title: weddingConfig.metaTitle,
    description: weddingConfig.metaDescription,
    images: [weddingConfig.ogImage],
  },
  robots: { index: true, follow: true },
};

export default async function Page() {
  const [catalog, packages] = await Promise.all([
    getCuratedCatalog(),
    getOccasionPackages('wedding'),
  ]);
  const config = { ...weddingConfig, packages };
  return <LandingPageTemplate config={config} catalog={catalog} />;
}
