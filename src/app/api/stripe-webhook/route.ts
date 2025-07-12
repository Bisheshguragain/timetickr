
import { NextResponse, NextRequest } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { db } from '@/lib/firebase';
import { ref, update, get } from 'firebase/database';

// Note: This webhook is a simplified example. In a real-world application,
// you would want to use the Firebase Admin SDK for secure database writes
// from a serverless function, rather than relying on client-side SDK rules.
// This approach is for demonstration purposes within this project's structure.

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

      const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
      
      for (const item of lineItems.data) {
        const priceId = item.price?.id;
        
        // This mapping connects Stripe Price IDs to your internal plan names.
        const PLAN_MAP: Record<string, string> = {
            [process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID!]: 'Starter',
            [process.env.NEXT_PUBLIC_STRIPE_PROFESSIONAL_PRICE_ID!]: 'Professional',
            [process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID!]: 'Enterprise',
        };
        const TIMER_ADDON_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_TIMER_ADDON_PRICE_ID!;

        if (priceId && PLAN_MAP[priceId]) {
            const newPlan = PLAN_MAP[priceId];
            console.log(`Updating user ${userId} to plan: ${newPlan}`);

            // This is a simplified demo. We can't directly update a session from here.
            // In a real app, you would have a `/users/{userId}` node to store plan info.
            // For now, we log the action.
            console.log(`ACTION (DEMO): Would update user ${userId} to plan ${newPlan}.`);
            // Example of what you would do with Firebase Admin SDK in a function:
            // await admin.database().ref(`users/${userId}`).update({ plan: newPlan });

        } else if (priceId === TIMER_ADDON_PRICE_ID) {
            const quantity = item.quantity || 0;
            console.log(`Adding ${quantity} timer credits to user ${userId}`);
            
            // This is also a demo. A real app would update a central user usage node.
            console.log(`ACTION (DEMO): Would add ${quantity} extra timers to user ${userId}.`);
             // Example of what you would do with Firebase Admin SDK:
            // const userUsageRef = admin.database().ref(`users/${userId}/usage`);
            // const snapshot = await userUsageRef.once('value');
            // const currentExtra = snapshot.val()?.extra || 0;
            // await userUsageRef.update({ extra: currentExtra + quantity });
        }
      }

      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
