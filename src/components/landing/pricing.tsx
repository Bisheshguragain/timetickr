
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Loader } from "lucide-react";
import { useState } from "react";
import { useTimer } from "@/context/TimerContext";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { createStripeCheckoutSession } from "@/app/actions/stripe";


const plans = [
  {
    name: "Freemium",
    priceId: null,
    price: "£0",
    period: "Free Forever",
    description: "For individuals & small projects getting started.",
    features: [
      "3 Timers / Month",
      "Basic Timer Functionality",
      "Smart Auto-Alerts",
      "TimeTickR Branding",
      "Single User",
      "Email Support",
    ],
    cta: "Get Started",
    href: "/login?plan=Freemium",
  },
  {
    name: "Starter",
    priceId: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID,
    price: "£7",
    period: "/month",
    description: "For small teams and regular events.",
    features: [
      "10 Timers / Month",
      "Remote Timer Control",
      "Live Messaging",
      "Up to 3 team members",
      "Basic analytics",
      "All core features",
    ],
    cta: "Upgrade",
    href: "/login?plan=Starter",
    popular: true,
  },
  {
    name: "Professional",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PROFESSIONAL_PRICE_ID,
    price: "£12",
    period: "/month",
    description: "For growing businesses with multiple events.",
    features: [
      "50 Timers / Month",
      "Everything in Starter",
      "Unlimited team members",
      "AI-Powered Moderation",
      "Advanced role management",
      "Event analytics & export",
      "Priority support",
    ],
    cta: "Upgrade",
    href: "/login?plan=Professional",
  },
  {
    name: "Enterprise",
    priceId: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID,
    price: "£29",
    period: "/month",
    description: "For large-scale operations with specific needs.",
    features: [
      "Unlimited Timers",
      "Everything in Professional",
      "Custom branding",
      "Advanced analytics",
      "Dedicated support & SLA",
      "Custom integrations",
      "GDPR compliance tools",
    ],
    cta: "Upgrade",
    href: "/login?plan=Enterprise",
  },
];

export function Pricing() {
  const [loading, setLoading] = useState<string | null>(null);
  const { currentUser } = useTimer();
  const router = useRouter();
  const { toast } = useToast();

  const handleCheckout = async (plan: typeof plans[0]) => {
    // For Freemium, just redirect
    if (plan.name === "Freemium") {
        router.push(plan.href);
        return;
    }
    
    // If not logged in, redirect to login page with the selected plan
    if (!currentUser) {
      router.push(plan.href);
      return;
    }

    if (!plan.priceId) {
        toast({
            variant: "destructive",
            title: "Plan Not Available",
            description: "This plan is not available for online checkout. Please contact sales.",
        });
        return;
    }
    
    setLoading(plan.name);

    try {
      const { sessionId, error: sessionError } = await createStripeCheckoutSession({ 
          priceId: plan.priceId,
          userId: currentUser.uid,
          userEmail: currentUser.email!,
       });

      if (sessionError) {
        throw new Error(sessionError);
      }

      const stripe = (await import('@/lib/stripe-client')).default;
      const { error } = await stripe.redirectToCheckout({ sessionId: sessionId! });

      if (error) {
        console.error("Stripe redirect error:", error);
        toast({
            variant: "destructive",
            title: "Checkout Error",
            description: error.message || "An unexpected error occurred. Please try again.",
        })
      }
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Error",
            description: error.message || "Could not initiate checkout. Please contact support.",
        })
    } finally {
        setLoading(null);
    }
  }

  return (
    <div className="container">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Choose Your Plan
        </h2>
        <p className="mt-4 text-lg text-foreground/80">
          Simple, transparent pricing. No hidden fees.
        </p>
      </div>
      <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => (
          <Card key={plan.name} className={`flex flex-col bg-card/50 hover:bg-card transition-all duration-300 ${plan.popular ? "border-accent shadow-accent/20 shadow-lg transform-gpu hover:-translate-y-2" : ""}`}>
            <CardHeader className="relative pb-4">
              {plan.popular && <div className="absolute top-0 -translate-y-1/2 w-full flex justify-center"><div className="bg-accent text-accent-foreground px-3 py-1 text-sm font-semibold rounded-full">Most Popular</div></div>}
              <CardTitle className="font-headline text-2xl">{plan.name}</CardTitle>
              <CardDescription>
                <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-4 pt-4">
              <p className="text-foreground/80">{plan.description}</p>
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center">
                    <Check className="mr-2 h-5 w-5 text-accent" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
                <Button onClick={() => handleCheckout(plan)} className="w-full" variant={plan.popular ? "default" : "outline"} disabled={loading === plan.name}>
                   {loading === plan.name ? <Loader className="mr-2 animate-spin"/> : null}
                   {plan.cta}
                </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
