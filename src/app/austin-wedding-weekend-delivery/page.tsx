import type { Metadata } from 'next';
import LandingPageTemplate from '@/components/landing/LandingPageTemplate';
import { weddingConfig } from '@/components/landing/configs/wedding';
import { getCuratedCatalog } from '@/lib/landing/getCuratedCatalog';

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
  const catalog = await getCuratedCatalog();
  return <LandingPageTemplate config={weddingConfig} catalog={catalog} />;
}
