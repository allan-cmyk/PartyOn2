import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/group-orders/database-vercel'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Save to database
    const inquiry = await db.savePartnerInquiry({
      businessName: body.hotelName || body.businessName,
      businessType: body.businessType || 'hotel',
      contactName: body.contactName,
      email: body.email,
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
        const zapierResponse = await fetch(zapierWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            businessName: body.hotelName || body.businessName,
            businessType: body.businessType || 'hotel',
            contactName: body.contactName,
            email: body.email,
            phone: body.phone || '',
            numberOfRooms: body.numberOfRooms || '',
            monthlyVolume: body.monthlyVolume || '',
            currentProvider: body.currentProvider || '',
            interests: body.interests || [],
            message: body.message || '',
            submittedAt: new Date().toISOString(),
            formType: 'partner_inquiry'
          }),
        });

        if (!zapierResponse.ok) {
          console.error('Zapier webhook failed:', await zapierResponse.text());
        } else {
          console.log('Partner inquiry sent to Zapier successfully');
        }
      } catch (zapierError) {
        console.error('Error sending to Zapier:', zapierError);
        // Don't fail the request if Zapier fails
      }
    } else {
      console.warn('ZAPIER_PARTNER_INQUIRY_WEBHOOK_URL not configured');
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