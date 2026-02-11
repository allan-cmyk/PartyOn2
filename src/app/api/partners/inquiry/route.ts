import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/group-orders/database-vercel'
import { sendPartnerInquiryNotification } from '@/lib/email/email-service'
import type { PartnerInquiryData } from '@/lib/email/email-service'
import { kv, isKVConfigured } from '@/lib/database/client'

// In-memory rate limit fallback when KV is not configured
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT_WINDOW_MS = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX = 3 // max 3 submissions per minute per IP

async function checkRateLimit(ip: string): Promise<boolean> {
  if (isKVConfigured()) {
    try {
      const key = `ratelimit:partner-inquiry:${ip}`
      const current = (await kv.get(key)) as number | null
      if (current !== null && current >= RATE_LIMIT_MAX) {
        return false // rate limited
      }
      // Increment. If key is new, set with expiry; otherwise just increment.
      if (current === null) {
        await kv.set(key, 1, { ex: 60 }) // expires in 60 seconds
      } else {
        await kv.set(key, current + 1, { ex: 60 })
      }
      return true
    } catch (error) {
      console.error('[Rate Limit] KV error, falling back to in-memory:', error)
    }
  }

  // In-memory fallback
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (entry && now < entry.resetAt) {
    if (entry.count >= RATE_LIMIT_MAX) return false
    entry.count++
  } else {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
  }
  return true
}

/**
 * Normalize form data from all partner form types into a consistent shape.
 * Different forms send different field names - this maps them all.
 */
function normalizeInquiry(body: Record<string, unknown>): PartnerInquiryData {
  // Contact name: may come as contactName, or firstName+lastName
  const firstName = String(body.firstName || '').trim();
  const lastName = String(body.lastName || '').trim();
  const contactName = String(body.contactName || '').trim()
    || [firstName, lastName].filter(Boolean).join(' ')
    || 'Unknown';

  // Business name: may be businessName, hotelName, or company
  const businessName = String(body.hotelName || body.businessName || body.company || '').trim();

  // Event types / interests: may be array or comma-separated string
  let eventTypes = '';
  if (Array.isArray(body.eventTypes)) {
    eventTypes = body.eventTypes.join(', ');
  } else if (typeof body.eventTypes === 'string') {
    eventTypes = body.eventTypes;
  }

  let interests = '';
  if (Array.isArray(body.interests)) {
    interests = body.interests.join(', ');
  } else if (typeof body.interests === 'string') {
    interests = body.interests;
  }

  return {
    contactName,
    email: String(body.email || '').trim(),
    phone: String(body.phone || '').trim() || undefined,
    businessName: businessName || undefined,
    businessType: String(body.businessType || body.eventType || '').trim() || undefined,
    partnerType: String(body.partnerType || '').trim() || undefined,
    website: String(body.website || '').trim() || undefined,
    message: String(body.message || '').trim() || undefined,
    notes: String(body.notes || '').trim() || undefined,
    eventTypes: eventTypes || undefined,
    serviceArea: String(body.serviceArea || '').trim() || undefined,
    guestCount: String(body.guestCount || '').trim() || undefined,
    timeframe: String(body.timeframe || '').trim() || undefined,
    eventDate: String(body.eventDate || '').trim() || undefined,
    venue: String(body.venue || '').trim() || undefined,
    numberOfRooms: String(body.numberOfRooms || '').trim() || undefined,
    monthlyVolume: String(body.monthlyVolume || '').trim() || undefined,
    currentProvider: String(body.currentProvider || '').trim() || undefined,
    interests: interests || undefined,
    source: String(body.source || '').trim() || undefined,
    submittedAt: String(body.submittedAt || new Date().toISOString()),
  };
}

export async function POST(request: NextRequest) {
  const userAgent = request.headers.get('user-agent') || 'Unknown'
  const origin = request.headers.get('origin') || 'Unknown'
  const referer = request.headers.get('referer') || 'Unknown'
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'Unknown'

  try {
    const body = await request.json()

    console.log('[Partner Inquiry] Request received:', {
      timestamp: new Date().toISOString(),
      ip,
      origin,
      referer,
      hasData: !!body && Object.keys(body).length > 0
    })

    // Honeypot check — hidden field that should always be empty
    if (body.website_url || body.fax_number) {
      console.warn('[Partner Inquiry] REJECTED: Honeypot triggered', { ip, userAgent })
      // Return success to not tip off bots
      return NextResponse.json({
        success: true,
        message: 'Thank you for your interest! Our partnership team will contact you within 24 hours.',
      })
    }

    // Rate limiting
    const allowed = await checkRateLimit(ip)
    if (!allowed) {
      console.warn('[Partner Inquiry] REJECTED: Rate limited', { ip, userAgent })
      return NextResponse.json(
        { success: false, error: 'Too many submissions. Please try again in a minute.' },
        { status: 429 }
      )
    }

    // Normalize all form variants into consistent shape
    const inquiry = normalizeInquiry(body);

    // Validate required fields
    if (!inquiry.email) {
      console.warn('[Partner Inquiry] REJECTED: Missing email', { ip, userAgent })
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      )
    }

    if (!inquiry.contactName || inquiry.contactName === 'Unknown') {
      console.warn('[Partner Inquiry] REJECTED: Missing contact name', { ip, userAgent })
      return NextResponse.json(
        { success: false, error: 'Contact name is required' },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(inquiry.email)) {
      console.warn('[Partner Inquiry] REJECTED: Invalid email format', { email: inquiry.email, ip })
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Save to database
    const dbResult = await db.savePartnerInquiry({
      businessName: inquiry.businessName || inquiry.contactName,
      businessType: inquiry.businessType || inquiry.partnerType || 'general',
      contactName: inquiry.contactName,
      email: inquiry.email,
      phone: inquiry.phone,
      numberOfRooms: inquiry.numberOfRooms,
      monthlyVolume: inquiry.monthlyVolume,
      currentProvider: inquiry.currentProvider,
      interests: inquiry.interests ? inquiry.interests.split(', ') : [],
      message: inquiry.message || inquiry.notes,
    })

    // Send email notification via Resend
    try {
      await sendPartnerInquiryNotification(inquiry);
      console.log('[Partner Inquiry] Email notification sent for:', inquiry.email);
    } catch (emailError) {
      console.error('[Partner Inquiry] Email notification failed:', emailError);
      // Don't fail the request if email fails
    }

    // Also send to Zapier webhook as backup
    const zapierWebhookUrl = process.env.ZAPIER_PARTNER_INQUIRY_WEBHOOK_URL || process.env.ZAPIER_WEBHOOK_URL;
    if (zapierWebhookUrl) {
      try {
        const zapierPayload = {
          ...inquiry,
          formType: 'partner_inquiry',
          submittedFrom: { ip, userAgent, referer },
        };

        const zapierResponse = await fetch(zapierWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(zapierPayload),
        });

        if (!zapierResponse.ok) {
          console.error('[Partner Inquiry] Zapier webhook failed:', zapierResponse.status);
        }
      } catch (zapierError) {
        console.error('[Partner Inquiry] Zapier error:', zapierError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Thank you for your interest! Our partnership team will contact you within 24 hours.',
      inquiryId: dbResult?.id,
    })
  } catch (error) {
    console.error('Partner inquiry error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to submit inquiry. Please try again.' },
      { status: 500 }
    )
  }
}
