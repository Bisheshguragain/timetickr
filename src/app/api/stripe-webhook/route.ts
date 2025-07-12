
import { NextResponse, NextRequest } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { db } from '@/lib/firebase';
import { ref, update, get } from 'firebase/database';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Helper function to find user ID by email in team members list
const findUserIdByEmail = async (sessionCode: string, email: string) => {
    // This is a placeholder. In a real app, you'd have a more direct way
    // to look up users, probably from a central /users/{userId} node.
    // For now, we search within the session's team members.
    const teamRef = ref(db, `sessions/${sessionCode}/teamMembers`);
    const snapshot = await get(teamRef);
    if (snapshot.exists()) {
        const teamMembers = snapshot.val();
        const member = Object.values(teamMembers).find((m: any) => m.email === email);
        // This is tricky because we don't have a stable userId here.
        // We are using client_reference_id instead.
    }
    return null; 
}


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

      const userId = session.client_reference_id || session.metadata?.userId;

      if (!userId) {
        console.warn("Webhook received but no userId found in session.");
        return NextResponse.json({ error: "Webhook Error: No user ID provided." }, { status: 400 });
      }
      
      console.log(`Fulfilling order for user: ${userId}`);

      // Now, let's determine what was purchased.
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
      
      for (const item of lineItems.data) {
        const priceId = item.price?.id;
        
        // This is a simplified mapping. In a real app, you might store this in your DB.
        const PLAN_MAP: Record<string, string> = {
            'price_1RjjsqJKlah40zYD9kzCBaLp': 'Starter',
            'price_1Rjjt0JKlah40zYDMo3ROCAn': 'Professional',
            'price_1RjjtcJKlah40zYDHjeNdXAV': 'Enterprise',
        };
        const TIMER_ADDON_PRICE_ID = 'price_1Rjju3JKlah40zYDFMQtGHhF';

        if (priceId && PLAN_MAP[priceId]) {
            const newPlan = PLAN_MAP[priceId];
            console.log(`Updating user ${userId} to plan: ${newPlan}`);
            // In a real app, you would update the user's plan in a central /users/{userId} node.
            // For this demo, we can't reliably find the user's session, so we'll log it.
            // Example of what you WOULD do:
            // const userRef = ref(db, `users/${userId}`);
            // await update(userRef, { plan: newPlan });
             console.log(`ACTION (DEMO): Would update user ${userId} to plan ${newPlan}.`);

        } else if (priceId === TIMER_ADDON_PRICE_ID) {
            const quantity = item.quantity || 0;
            console.log(`Adding ${quantity} timer credits to user ${userId}`);
            // This is also tricky. We need to find the right session/user to update.
            // Example of what you WOULD do:
            // const userUsageRef = ref(db, `users/${userId}/usage`);
            // const snapshot = await get(userUsageRef);
            // const currentExtra = snapshot.val()?.extra || 0;
            // await update(userUsageRef, { extra: currentExtra + quantity });
             console.log(`ACTION (DEMO): Would add ${quantity} extra timers to user ${userId}.`);
        }
      }

      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

    