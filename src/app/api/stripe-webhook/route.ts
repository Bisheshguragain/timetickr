import { NextResponse, NextRequest } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { db } from '@/lib/firebase';
import { ref, update, get, serverTimestamp } from 'firebase/database';

// Note: This webhook is a simplified example. For hardened production use, it's
// best practice to run fulfillment logic in a secure serverless environment
// (like a Cloud Function for Firebase) using the Firebase Admin SDK, which provides
// elevated privileges and doesn't rely on database security rules.
// This implementation uses the client-side SDK for demonstration purposes within this project's structure.

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const sig = headers().get('stripe-signature');
  const body = await req.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig!, endpointSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      
      console.log('Checkout session completed:', session);

      // IMPORTANT: Use client_reference_id which we set to our Firebase user's UID.
      const userId = session.client_reference_id;

      if (!userId) {
        console.warn("Webhook received but no userId (client_reference_id) found in session.");
        return NextResponse.json({ error: "Webhook Error: No user ID provided." }, { status: 400 });
      }
      
      console.log(`Fulfilling order for user: ${userId}`);
      
      try {
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
        
        for (const item of lineItems.data) {
          const priceId = item.price?.id;
          
          const PLAN_MAP: Record<string, string> = {
              [process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID!]: 'Starter',
              [process.env.NEXT_PUBLIC_STRIPE_PROFESSIONAL_PRICE_ID!]: 'Professional',
              [process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID!]: 'Enterprise',
          };
          const TIMER_ADDON_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_TIMER_ADDON_PRICE_ID!;

          if (priceId && PLAN_MAP[priceId]) {
              const newPlan = PLAN_MAP[priceId];
              console.log(`Updating user ${userId} to plan: ${newPlan}`);
              
              const userPlanRef = ref(db, `users/${userId}/plan`);
              await set(userPlanRef, newPlan);
              
              // Optional: Reset timer usage when a new subscription is created
              const userUsageRef = ref(db, `users/${userId}/usage`);
              await set(userUsageRef, { used: 0, extra: 0, month: new Date().getMonth() });


          } else if (priceId === TIMER_ADDON_PRICE_ID) {
              const quantity = item.quantity || 0;
              console.log(`Adding ${quantity} timer credits to user ${userId}`);
              
              const userUsageRef = ref(db, `users/${userId}/usage`);
              const snapshot = await get(userUsageRef);
              const currentExtra = snapshot.val()?.extra || 0;
              await update(userUsageRef, { extra: currentExtra + quantity });
          }
        }
      } catch (dbError: any) {
        console.error(`Error fulfilling order for user ${userId}:`, dbError);
        return NextResponse.json({ error: `Database update failed: ${dbError.message}` }, { status: 500 });
      }

      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
