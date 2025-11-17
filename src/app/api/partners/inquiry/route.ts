import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/group-orders/database-vercel'

export async function POST(request: NextRequest) {
  // Log request details for debugging
  const userAgent = request.headers.get('user-agent') || 'Unknown'
  const origin = request.headers.get('origin') || 'Unknown'
  const referer = request.headers.get('referer') || 'Unknown'
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'Unknown'

  try {
    const body = await request.json()

    // Log incoming request
    console.log('[Partner Inquiry] Request received:', {
      timestamp: new Date().toISOString(),
      ip,
      userAgent,
      origin,
      referer,
      hasData: !!body && Object.keys(body).length > 0
    })

    // VALIDATION: Require at least email and contact name
    if (!body.email || !body.email.trim()) {
      console.warn('[Partner Inquiry] REJECTED: Missing email', { ip, userAgent })
      return NextResponse.json(
        {
          success: false,
          error: 'Email is required'
        },
        { status: 400 }
      )
    }

    if (!body.contactName || !body.contactName.trim()) {
      console.warn('[Partner Inquiry] REJECTED: Missing contact name', { ip, userAgent })
      return NextResponse.json(
        {
          success: false,
          error: 'Contact name is required'
        },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email.trim())) {
      console.warn('[Partner Inquiry] REJECTED: Invalid email format', {
        email: body.email,
        ip,
        userAgent
      })
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email format'
        },
        { status: 400 }
      )
    }

    // Save to database
    const inquiry = await db.savePartnerInquiry({
      businessName: body.hotelName || body.businessName,
      businessType: body.businessType || 'hotel',
      contactName: body.contactName.trim(),
      email: body.email.trim(),
      phone: body.phone,
      numberOfRooms: body.numberOfRooms,
      monthlyVolume: body.monthlyVolume,
      currentProvider: body.currentProvider,
      interests: body.interests || [],
      message: body.message,
    })

    // Send to Zapier webhook (use specific URL or fallback to shared URL)
    const zapierWebhookUrl = process.env.ZAPIER_PARTNER_INQUIRY_WEBHOOK_URL || process.env.ZAPIER_WEBHOOK_URL;

    if (zapierWebhookUrl) {
      try {
        const zapierPayload = {
          // Contact Information
          firstName: body.firstName || '',
          lastName: body.lastName || '',
          businessName: body.hotelName || body.businessName || '',
          businessType: body.businessType || 'hotel',
          contactName: body.contactName.trim(),
          email: body.email.trim(),
          phone: body.phone || '',
          website: body.website || '',

          // Hotel/Resort specific fields
          numberOfRooms: body.numberOfRooms || '',
          monthlyVolume: body.monthlyVolume || '',
          currentProvider: body.currentProvider || '',

          // Mobile Bartender specific fields
          serviceArea: body.serviceArea || '',
          eventTypes: body.eventTypes || body.interests || [],
          guestCount: body.guestCount || '',
          timeframe: body.timeframe || '',
          notes: body.notes || '',

          // Common fields
          interests: body.interests || [],
          message: body.message || '',
          partnerType: body.partnerType || 'Partner',

          // Tracking fields
          utm_source: body.utm_source || '',
          utm_medium: body.utm_medium || '',
          utm_campaign: body.utm_campaign || '',
          utm_content: body.utm_content || '',
          source: body.source || '',

          // System fields
          submittedAt: body.submittedAt || new Date().toISOString(),
          formType: 'partner_inquiry',

          // Add tracking metadata
          submittedFrom: {
            ip,
            userAgent,
            referer
          }
        };

        console.log('[Partner Inquiry] Sending to Zapier:', {
          email: zapierPayload.email,
          contactName: zapierPayload.contactName,
          businessName: zapierPayload.businessName
        })

        const zapierResponse = await fetch(zapierWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(zapierPayload),
        });

        if (!zapierResponse.ok) {
          const errorText = await zapierResponse.text();
          console.error('[Partner Inquiry] Zapier webhook failed:', {
            status: zapierResponse.status,
            error: errorText,
            email: zapierPayload.email
          });
        } else {
          console.log('[Partner Inquiry] Successfully sent to Zapier:', {
            email: zapierPayload.email,
            contactName: zapierPayload.contactName
          });
        }
      } catch (zapierError) {
        console.error('[Partner Inquiry] Error sending to Zapier:', {
          error: zapierError,
          email: body.email
        });
        // Don't fail the request if Zapier fails
      }
    } else {
      console.warn('[Partner Inquiry] ZAPIER_PARTNER_INQUIRY_WEBHOOK_URL not configured');
    }

    if (inquiry) {
      return NextResponse.json({
        success: true,
        message: 'Thank you for your interest! Our partnership team will contact you within 24 hours.',
        inquiryId: inquiry.id,
      })
    } else {
      // Still return success even if DB save failed (could send email notification instead)
      return NextResponse.json({
        success: true,
        message: 'Thank you for your interest! Our partnership team will contact you soon.',
      })
    }
  } catch (error) {
    console.error('Partner inquiry error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to submit inquiry. Please try again.'
      },
      { status: 500 }
    )
  }
}