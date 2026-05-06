import type { Metadata } from 'next';
import LandingPageTemplate from '@/components/landing/LandingPageTemplate';
import { bachelorConfig } from '@/components/landing/configs/bachelor';
import { getCuratedCatalog } from '@/lib/landing/getCuratedCatalog';

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
  const catalog = await getCuratedCatalog();
  return <LandingPageTemplate config={bachelorConfig} catalog={catalog} />;
}
