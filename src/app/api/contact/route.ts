import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.email) {
      return NextResponse.json(
        { success: false, error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Send to Zapier webhook (use specific URL or fallback to shared URL)
    const zapierWebhookUrl = process.env.ZAPIER_CONTACT_WEBHOOK_URL || process.env.ZAPIER_WEBHOOK_URL;

    if (zapierWebhookUrl) {
      try {
        const zapierResponse = await fetch(zapierWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: body.name,
            email: body.email,
            phone: body.phone || '',
            eventType: body.eventType || '',
            eventDate: body.eventDate || '',
            guestCount: body.guestCount || '',
            message: body.message || '',
            submittedAt: new Date().toISOString(),
            formType: 'contact'
          }),
        });

        if (!zapierResponse.ok) {
          console.error('Zapier webhook failed:', await zapierResponse.text());
        } else {
          console.log('Contact form sent to Zapier successfully');
        }
      } catch (zapierError) {
        console.error('Error sending to Zapier:', zapierError);
        // Don't fail the request if Zapier fails
      }
    } else {
      console.warn('ZAPIER_CONTACT_WEBHOOK_URL not configured');
    }

    return NextResponse.json({
      success: true,
      message: 'Thank you for contacting us! We\'ll get back to you within 24 hours.',
    });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to submit form. Please try again.'
      },
      { status: 500 }
    );
  }
}
