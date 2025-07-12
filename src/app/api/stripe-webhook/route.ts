
// src/app/api/stripe-webhook/route.ts
import { NextResponse, NextRequest } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { db } from '@/lib/firebase';
import { ref, update } from 'firebase/database';

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

      // This is a placeholder for your business logic.
      // In a real app, you would:
      // 1. Get the userId from session.client_reference_id or session.metadata.userId
      // 2. Look up the user in your database (e.g., Firebase Auth/Firestore)
      // 3. Update their subscription plan or add credits based on the purchase.
      // For this demo, we'll just log the information.

      const userId = session.client_reference_id || session.metadata?.userId;
      if (userId) {
          console.log(`Fulfilling order for user: ${userId}`);
          
          // Example: Update a 'plan' field in Firebase Realtime Database
          // Note: This is a simplified example. You might need a more complex user model.
          const userSessionRef = ref(db, `sessions/${userId}`); // This assumes sessionCode is the userId, which may not be the case. Adjust as needed.
          
          // A more robust way would be to have a /users/{userId} node
          // const userRef = ref(db, `users/${userId}`);
          
          // For now, let's log what we *would* do
           console.log("In a real app, you'd now update the user's plan in the database.");
      } else {
        console.warn("Webhook received but no userId found in session.");
      }
      
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
