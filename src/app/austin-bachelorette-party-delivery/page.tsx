import type { Metadata } from 'next';
import LandingPageTemplate from '@/components/landing/LandingPageTemplate';
import { bacheloretteConfig } from '@/components/landing/configs/bachelorette';
import { getCuratedCatalog } from '@/lib/landing/getCuratedCatalog';
import { getOccasionPackages } from '@/lib/landing/getOccasionPackages';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: bacheloretteConfig.metaTitle,
  description: bacheloretteConfig.metaDescription,
  alternates: { canonical: `/${bacheloretteConfig.slug}` },
  openGraph: {
    title: bacheloretteConfig.metaTitle,
    description: bacheloretteConfig.metaDescription,
    images: [bacheloretteConfig.ogImage],
  },
  robots: { index: true, follow: true },
};

export default async function Page() {
  const [catalog, packages] = await Promise.all([
    getCuratedCatalog(),
    getOccasionPackages('bachelorette'),
  ]);
  const config = { ...bacheloretteConfig, packages };
  return <LandingPageTemplate config={config} catalog={catalog} />;
}
