/**
 * Affiliate Service
 * CRUD operations for affiliates and partner applications
 */

import { prisma } from '@/lib/database/client';
import { AffiliateStatus, ApplicationStatus, AffiliateCategory } from '@prisma/client';
import crypto from 'crypto';

/**
 * Get an active affiliate by referral code
 */
export async function getAffiliateByCode(code: string) {
  return prisma.affiliate.findUnique({
    where: { code: code.toUpperCase() },
  });
}

/**
 * Get affiliate by ID with relations
 */
export async function getAffiliateById(id: string) {
  return prisma.affiliate.findUnique({
    where: { id },
    include: {
      commissions: {
        orderBy: { createdAt: 'desc' },
        take: 50,
      },
      payouts: {
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
      applications: true,
    },
  });
}

/**
 * Get affiliate by email
 */
export async function getAffiliateByEmail(email: string) {
  return prisma.affiliate.findUnique({
    where: { email: email.toLowerCase() },
  });
}

/**
 * List affiliates with optional status filter
 */
export async function listAffiliates(status?: AffiliateStatus) {
  return prisma.affiliate.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: {
          commissions: true,
          orders: true,
        },
      },
    },
  });
}

/**
 * Generate a unique, URL-friendly referral code from business name
 */
export function generateReferralCode(businessName: string): string {
  const base = businessName
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 10);
  const suffix = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `${base || 'PARTNER'}${suffix}`;
}

/**
 * Create an affiliate from an approved application
 */
export async function createAffiliate(data: {
  contactName: string;
  businessName: string;
  email: string;
  phone?: string;
  category: AffiliateCategory;
  code?: string;
}) {
  const code = data.code || generateReferralCode(data.businessName);

  // Check code uniqueness, regenerate if needed
  const existing = await prisma.affiliate.findUnique({ where: { code } });
  const finalCode = existing ? generateReferralCode(data.businessName) : code;

  return prisma.affiliate.create({
    data: {
      code: finalCode,
      contactName: data.contactName,
      businessName: data.businessName,
      email: data.email.toLowerCase(),
      phone: data.phone,
      category: data.category,
      status: AffiliateStatus.ACTIVE,
    },
  });
}

/**
 * Update affiliate status
 */
export async function updateAffiliateStatus(id: string, status: AffiliateStatus) {
  return prisma.affiliate.update({
    where: { id },
    data: { status },
  });
}

/**
 * Update affiliate code
 */
export async function updateAffiliateCode(id: string, newCode: string) {
  const upper = newCode.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (upper.length < 3) {
    throw new Error('Code must be at least 3 characters');
  }

  // Check uniqueness
  const existing = await prisma.affiliate.findUnique({ where: { code: upper } });
  if (existing && existing.id !== id) {
    throw new Error('Code already in use');
  }

  return prisma.affiliate.update({
    where: { id },
    data: { code: upper },
  });
}

/**
 * Update affiliate details
 */
export async function updateAffiliate(id: string, data: Record<string, unknown>) {
  // Filter to only allowed fields
  const allowed = ['contactName', 'businessName', 'phone', 'commissionRateOverride',
    'categoryRateOverride', 'payoutMethod', 'payoutDetails', 'internalNotes', 'customerPerk'];
  const filtered: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in data) filtered[key] = data[key];
  }
  return prisma.affiliate.update({
    where: { id },
    data: filtered,
  });
}

// ==========================================
// PARTNER APPLICATIONS
// ==========================================

/**
 * Create a partner application (public intake)
 */
export async function createPartnerApplication(data: {
  contactName: string;
  businessName: string;
  email: string;
  phone?: string;
  category: AffiliateCategory;
  websiteOrSocial?: string;
  serviceArea?: string;
  notes?: string;
  consent: boolean;
}) {
  return prisma.partnerApplication.create({
    data: {
      ...data,
      email: data.email.toLowerCase(),
      status: ApplicationStatus.PENDING,
    },
  });
}

/**
 * List partner applications with optional status filter
 */
export async function listApplications(status?: ApplicationStatus) {
  return prisma.partnerApplication.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: 'desc' },
    include: {
      affiliate: true,
    },
  });
}

/**
 * Get a single application by ID
 */
export async function getApplicationById(id: string) {
  return prisma.partnerApplication.findUnique({
    where: { id },
    include: { affiliate: true },
  });
}

/**
 * Approve a partner application -- creates an Affiliate record
 */
export async function approveApplication(id: string, reviewedBy?: string) {
  const application = await prisma.partnerApplication.findUnique({
    where: { id },
  });

  if (!application) throw new Error('Application not found');
  if (application.status !== 'PENDING') throw new Error('Application is not pending');

  // Check if affiliate with same email already exists
  const existingAffiliate = await prisma.affiliate.findUnique({
    where: { email: application.email.toLowerCase() },
  });

  if (existingAffiliate) {
    // Link existing affiliate to this application
    await prisma.partnerApplication.update({
      where: { id },
      data: {
        status: ApplicationStatus.APPROVED,
        reviewedAt: new Date(),
        reviewedBy,
        affiliateId: existingAffiliate.id,
      },
    });
    return existingAffiliate;
  }

  // Create new affiliate and update application in a transaction
  const affiliate = await prisma.$transaction(async (tx) => {
    const newAffiliate = await tx.affiliate.create({
      data: {
        code: generateReferralCode(application.businessName),
        contactName: application.contactName,
        businessName: application.businessName,
        email: application.email.toLowerCase(),
        phone: application.phone,
        category: application.category,
        status: AffiliateStatus.ACTIVE,
      },
    });

    await tx.partnerApplication.update({
      where: { id },
      data: {
        status: ApplicationStatus.APPROVED,
        reviewedAt: new Date(),
        reviewedBy,
        affiliateId: newAffiliate.id,
      },
    });

    return newAffiliate;
  });

  return affiliate;
}

/**
 * Reject a partner application
 */
export async function rejectApplication(id: string, reviewedBy?: string) {
  return prisma.partnerApplication.update({
    where: { id },
    data: {
      status: ApplicationStatus.REJECTED,
      reviewedAt: new Date(),
      reviewedBy,
    },
  });
}
