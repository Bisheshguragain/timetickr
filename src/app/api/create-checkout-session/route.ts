// src/app/api/create-checkout-session/route.ts
import { NextResponse, NextRequest } from 'next/server';
import Stripe from 'stripe';

// Initialize Stripe with the secret key from environment variables
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export async function POST(req: NextRequest) {
  try {
    const { 
      priceId, 
      userId, 
      userEmail,
      mode = 'subscription', // default to subscription
      quantity = 1 
    } = await req.json();

    if (!priceId || !userId || !userEmail) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Get the base URL from the request headers for dynamic success/cancel URLs
    const origin = req.headers.get('origin') || 'http://localhost:9002';

    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      {
        price: priceId,
        quantity: quantity,
      },
    ];
    
    // Create a Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode,
      success_url: `${origin}/dashboard?payment_success=true`,
      cancel_url: `${origin}/dashboard?payment_canceled=true`,
      customer_email: userEmail,
      client_reference_id: userId, // Pass the user ID to the session
      metadata: {
        userId: userId, // Also store in metadata for the webhook
      },
    });

    return NextResponse.json({ sessionId: session.id });

  } catch (err: any) {
    console.error('Error creating Stripe session:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
