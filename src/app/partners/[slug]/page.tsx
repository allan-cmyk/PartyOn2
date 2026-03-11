import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getAffiliateBySlug } from '@/lib/affiliates/affiliate-service';
import { getCategoryTemplate } from '@/components/partners/templates';
import partnersData from '@/data/austin-partners.json';

interface Props {
  params: Promise<{ slug: string }>;
}

function findPartnerData(businessName: string): { logo: string | null; heroImage: string | null } {
  const lower = businessName.toLowerCase();
  const match = partnersData.partners.find(
    (p) => p.name.toLowerCase() === lower
  );
  return {
    logo: match?.logo ?? null,
    heroImage: match?.heroImage ?? null,
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const affiliate = await getAffiliateBySlug(slug);

  if (!affiliate || affiliate.status !== 'ACTIVE') {
    return { title: 'Partner Not Found' };
  }

  return {
    title: `${affiliate.businessName} x Party On Delivery | Free Drink Delivery for Your Event`,
    description: `Book ${affiliate.businessName} for your Austin event and get drinks delivered for free. Spirits, mixers, seltzers, ice, and cups delivered to your door by Party On Delivery.`,
    openGraph: {
      title: `${affiliate.businessName} x Party On Delivery | Free Drink Delivery for Your Event`,
      description: `Book ${affiliate.businessName} for your Austin event and get drinks delivered for free.`,
      images: [{ url: '/images/hero/austin-skyline-night-lake.webp' }],
    },
  };
}

export default async function DynamicPartnerPage({ params }: Props) {
  const { slug } = await params;
  const affiliate = await getAffiliateBySlug(slug);

  if (!affiliate || affiliate.status !== 'ACTIVE') {
    notFound();
  }

  const { logo: partnerLogo, heroImage: partnerHeroImage } = findPartnerData(affiliate.businessName);
  const CategoryTemplate = getCategoryTemplate(affiliate.category);

  return (
    <CategoryTemplate
      affiliate={{
        businessName: affiliate.businessName,
        code: affiliate.code,
        category: affiliate.category,
        customerPerk: affiliate.customerPerk,
        contactName: affiliate.contactName,
        phone: affiliate.phone,
        email: affiliate.email,
        partnerSlug: affiliate.partnerSlug,
      }}
      partnerLogo={partnerLogo}
      partnerHeroImage={partnerHeroImage}
    />
  );
}
