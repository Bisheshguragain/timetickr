
'use server';

import { Stripe } from 'stripe';

// Define a type for the plan names for type safety
type SubscriptionPlan = 'Starter' | 'Professional' | 'Enterprise';

interface CreateCheckoutSessionArgs {
    plan: SubscriptionPlan;
    userId: string;
    userEmail: string;
    mode?: 'subscription' | 'payment';
    quantity?: number;
}

/**
 * Creates a Stripe Checkout session.
 * 
 * IMPORTANT: This function is a SERVER-SIDE action.
 * It securely looks up the Price ID based on the plan name.
 * 
 * You must set up a Stripe webhook to listen for `checkout.session.completed`
 * events. This webhook will update your Firebase database (using the Firebase Admin SDK) 
 * with the user's new plan.
 */
export async function createStripeCheckoutSession(
    args: CreateCheckoutSessionArgs
): Promise<{ sessionId?: string; error?: string; }> {

    console.log(`Requesting checkout session for user ${args.userId} for plan ${args.plan}`);

    if (!process.env.STRIPE_SECRET_KEY) {
        console.error('STRIPE_SECRET_KEY is not set in the environment.');
        return { error: 'Server configuration error. Please contact support.' };
    }

    const PLAN_TO_PRICE_ID_MAP: Record<SubscriptionPlan, string | undefined> = {
        Starter: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID,
        Professional: process.env.NEXT_PUBLIC_STRIPE_PROFESSIONAL_PRICE_ID,
        Enterprise: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID,
    };

    const priceId = PLAN_TO_PRICE_ID_MAP[args.plan];

    if (!priceId) {
        console.error(`No price ID found for plan: ${args.plan}`);
        return { error: 'Invalid plan specified. Please contact support.' };
    }
    
    const successUrl = process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment_success=true` : 'http://localhost:9002/dashboard?payment_success=true';
    const cancelUrl = process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment_canceled=true` : 'http://localhost:9002/dashboard?payment_canceled=true';

    try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: args.quantity || 1,
                },
            ],
            mode: args.mode || 'subscription',
            success_url: successUrl,
            cancel_url: cancelUrl,
            customer_email: args.userEmail,
            client_reference_id: args.userId, // Pass the user ID to the session
            metadata: {
                userId: args.userId, // Also store in metadata for the webhook
            },
        });

        if (!session.id) {
            throw new Error('Failed to create a checkout session.');
        }

        return { sessionId: session.id };

    } catch (error: any) {
        console.error("Error creating Stripe checkout session:", error);
        return { error: error.message };
    }
}
