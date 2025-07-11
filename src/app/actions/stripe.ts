
'use server';

interface CreateCheckoutSessionArgs {
    priceId: string;
    userId: string;
    userEmail: string;
    mode?: 'subscription' | 'payment';
    quantity?: number;
}

/**
 * Creates a Stripe Checkout session by calling a secure backend API route.
 * 
 * IMPORTANT: This function is now a CLIENT-SIDE action that calls your backend.
 * The actual Stripe API call with your secret key must happen on the server.
 * 
 * To make this work:
 * 1. Create a Next.js API route (e.g., at `src/app/api/create-checkout-session/route.ts`).
 * 2. In that API route, use the Stripe Node.js library with your SECRET KEY to create a session.
 * 3. The secret key must be stored as an environment variable (e.g., process.env.STRIPE_SECRET_KEY).
 * 4. This function will now call that API route.
 * 5. You will also need to set up a Stripe webhook to listen for `checkout.session.completed`
 *    events. This webhook will update your Firebase database (using the Firebase Admin SDK) 
 *    with the user's new plan or add credits to their account.
 */
export async function createStripeCheckoutSession(
    args: CreateCheckoutSessionArgs
): Promise<{ sessionId?: string; error?: string; }> {

    console.log(`Requesting checkout session for user ${args.userId} with price ${args.priceId}`);

    try {
        // In a real app, you'd get the base URL from the environment
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9002';
        
        const response = await fetch(`${apiBaseUrl}/api/create-checkout-session`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(args),
        });

        if (!response.ok) {
            const errorBody = await response.json();
            throw new Error(errorBody.error || 'Failed to create checkout session');
        }

        const { sessionId } = await response.json();
        return { sessionId };

    } catch (error: any) {
        console.error("Error creating Stripe checkout session:", error);
        return { error: error.message };
    }
}
