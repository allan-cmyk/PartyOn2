/**
 * Affiliate Service
 * CRUD operations for affiliates and partner applications
 */

import { prisma } from '@/lib/database/client';
import { AffiliateStatus, ApplicationStatus, AffiliateCategory } from '@prisma/client';
import crypto from 'crypto';
import { NON_AFFILIATE_PARTNER_PAGES } from '@/lib/affiliates/non-affiliate-pages';

/**
 * A partnerSlug that matches a static non-affiliate /partners page would never
 * receive path attribution (the middleware refuses to set the cookie for those
 * slugs), so refuse it at write time instead of shipping a silently dead code.
 */
function assertSlugNotReserved(partnerSlug: string | null | undefined): void {
  if (partnerSlug && NON_AFFILIATE_PARTNER_PAGES.has(partnerSlug.toLowerCase())) {
    throw new Error(
      `Partner slug "${partnerSlug}" is reserved by a static page — remove it from ` +
      `NON_AFFILIATE_PARTNER_PAGES (src/lib/affiliates/non-affiliate-pages.ts) first, ` +
      `or pick a different slug`
    );
  }
}

/**
 * Characters a real referral code or partner slug can contain. Anything else
 * is rejected before it reaches a query: Prisma's `mode: 'insensitive'`
 * compiles to ILIKE on Postgres WITHOUT escaping, so `%` and `_` in user
 * input act as wildcards (`?ref=%` matched an arbitrary affiliate in prod,
 * verified 2026-09-19).
 */
const VALID_REF = /^[A-Za-z0-9-]{1,64}$/;

/**
 * Get an active affiliate by referral code
 */
export async function getAffiliateByCode(code: string) {
  if (!VALID_REF.test(code)) return null;
  return prisma.affiliate.findFirst({
    where: { code: { equals: code, mode: 'insensitive' } },
  });
}

/**
 * Get affiliate by partner page slug (tries partnerSlug first, falls back to code)
 */
export async function getAffiliateBySlug(slug: string) {
  if (!VALID_REF.test(slug)) return null;
  const lower = slug.toLowerCase();
  // Try partnerSlug first
  const bySlug = await prisma.affiliate.findUnique({
    where: { partnerSlug: lower },
  });
  if (bySlug) return bySlug;
  // Fall back to code lookup (case-insensitive)
  return prisma.affiliate.findFirst({
    where: { code: { equals: slug, mode: 'insensitive' } },
  });
}

/**
 * Get the URL slug for a partner page
 */
export function getPartnerSlug(affiliate: { partnerSlug?: string | null; code: string }): string {
  return affiliate.partnerSlug ?? affiliate.code.toLowerCase();
}

/**
 * Resolve a `ref_code` cookie value (or any user-supplied ref) to an affiliate.
 *
 * The middleware writes the cookie in two forms: an Affiliate.code from
 * `?ref=<code>`, or an UPPERCASED partnerSlug from a `/partners/<slug>` visit
 * ("COCKTAIL-COWBOYS" for code "COWBOYS"). linkOrderToAffiliate delegates
 * here, so attribution, perks, and commissions agree on what resolves.
 * Code-only lookups (getAffiliateByCode) cannot see the slug form.
 *
 * Deterministic precedence: a code match wins over a partnerSlug match, so a
 * pathological collision (one affiliate's code equals another's slug) cannot
 * flip winners between queries. Callers own the ACTIVE-status check.
 *
 * Selects only the fields attribution needs — never secrets like
 * passwordHash, payoutDetails, or the callback/webhook API keys.
 */
export async function resolveAffiliateByRef(ref: string) {
  const trimmed = ref?.trim();
  if (!trimmed || !VALID_REF.test(trimmed)) return null;

  const select = {
    id: true,
    code: true,
    partnerSlug: true,
    status: true,
    businessName: true,
    contactName: true,
    email: true,
    customerPerk: true,
    commissionRateOverride: true,
  } as const;

  const byCode = await prisma.affiliate.findFirst({
    where: { code: { equals: trimmed, mode: 'insensitive' } },
    select,
  });
  if (byCode) return byCode;

  return prisma.affiliate.findUnique({
    where: { partnerSlug: trimmed.toLowerCase() },
    select,
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
  return prisma.affiliate.findFirst({
    where: { email: { equals: email, mode: 'insensitive' } },
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
  partnerSlug?: string;
  status?: AffiliateStatus;
}) {
  // Normalize a supplied code the same way updateAffiliateCode does: codes
  // are strictly alphanumeric (VALID_REF rejects anything else at read time,
  // so an underscore or space here would ship a code that never resolves).
  const supplied = data.code ? data.code.toUpperCase().replace(/[^A-Z0-9]/g, '') : '';
  const code = supplied || generateReferralCode(data.businessName);
  assertSlugNotReserved(data.partnerSlug);

  // Check code uniqueness, regenerate if needed
  const existing = await prisma.affiliate.findUnique({ where: { code } });
  const finalCode = existing ? generateReferralCode(data.businessName) : code;

  return prisma.affiliate.create({
    data: {
      code: finalCode,
      partnerSlug: data.partnerSlug || null,
      contactName: data.contactName,
      businessName: data.businessName,
      email: data.email.toLowerCase(),
      phone: data.phone,
      category: data.category,
      status: data.status ?? AffiliateStatus.ACTIVE,
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
    'categoryRateOverride', 'payoutMethod', 'payoutDetails', 'internalNotes', 'customerPerk', 'partnerSlug', 'category'];
  const filtered: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in data) filtered[key] = data[key];
  }
  if ('partnerSlug' in filtered && typeof filtered.partnerSlug === 'string') {
    assertSlugNotReserved(filtered.partnerSlug);
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
