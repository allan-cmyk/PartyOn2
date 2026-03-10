export interface CategoryTemplateProps {
  affiliate: {
    businessName: string;
    code: string;
    category: string;
    customerPerk: string;
    contactName: string;
    phone: string | null;
    email: string;
    partnerSlug: string | null;
  };
  partnerLogo: string | null;
  partnerHeroImage: string | null;
}
