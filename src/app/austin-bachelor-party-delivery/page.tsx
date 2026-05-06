import type { Metadata } from 'next';
import LandingPageTemplate from '@/components/landing/LandingPageTemplate';
import { bachelorConfig } from '@/components/landing/configs/bachelor';
import { getCuratedCatalog } from '@/lib/landing/getCuratedCatalog';
import { getOccasionPackages } from '@/lib/landing/getOccasionPackages';

export const metadata: Metadata = {
  title: bachelorConfig.metaTitle,
  description: bachelorConfig.metaDescription,
  alternates: { canonical: `/${bachelorConfig.slug}` },
  openGraph: {
    title: bachelorConfig.metaTitle,
    description: bachelorConfig.metaDescription,
    images: [bachelorConfig.ogImage],
  },
  robots: { index: true, follow: true },
};

export default async function AustinBachelorPartyDeliveryPage() {
  const [catalog, packages] = await Promise.all([
    getCuratedCatalog(),
    getOccasionPackages('bachelor'),
  ]);
  const config = { ...bachelorConfig, packages };
  return <LandingPageTemplate config={config} catalog={catalog} />;
}
