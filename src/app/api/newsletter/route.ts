import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // In production, you would:
    // 1. Add to your email service (Mailchimp, SendGrid, etc.)
    // 2. Store in database
    // 3. Send welcome email
    
    // For now, we'll just log it
    console.log('Newsletter signup:', email);

    // Mock delay to simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to newsletter'
    });
  } catch (error) {
    console.error('Newsletter signup error:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe' },
      { status: 500 }
    );
  }
}