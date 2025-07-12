
'use server';

import { Stripe } from 'stripe';

interface CreateCheckoutSessionArgs {
    priceId: string;
    userId: string;
    userEmail: string;
    mode?: 'subscription' | 'payment';
    quantity?: number;
}

/**
 * Creates a Stripe Checkout session.
 * 
 * IMPORTANT: This function is a SERVER-SIDE action.
 * The actual Stripe API call with your secret key happens here.
 * 
 * You must set up a Stripe webhook to listen for `checkout.session.completed`
 * events. This webhook will update your Firebase database (using the Firebase Admin SDK) 
 * with the user's new plan or add credits to their account.
 */
export async function createStripeCheckoutSession(
    args: CreateCheckoutSessionArgs
): Promise<{ sessionId?: string; error?: string; }> {

    console.log(`Requesting checkout session for user ${args.userId} with price ${args.priceId}`);

    if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error('STRIPE_SECRET_KEY is not set in the environment.');
    }
    
    // In a real app, you'd get the base URL from the environment or request headers
    const successUrl = process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment_success=true` : 'http://localhost:9002/dashboard?payment_success=true';
    const cancelUrl = process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment_canceled=true` : 'http://localhost:9002/dashboard?payment_canceled=true';

    try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: args.priceId,
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

    