import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Freemium",
    price: "£0",
    period: "Free Forever",
    description: "For individuals & small projects getting started.",
    features: [
      "3 Timers / Month",
      "Basic Timer Functionality",
      "TimeTickR Branding",
      "Single User",
      "Email Support",
    ],
    cta: "Get Started",
    href: "/dashboard",
  },
  {
    name: "Starter",
    price: "£7",
    period: "/month",
    description: "For small teams and regular events.",
    features: [
      "10 Timers / Month",
      "Remote Timer Control",
      "Live Messaging",
      "Up to 3 team members",
      "TimeTickR Branding",
      "All core features",
    ],
    cta: "Start Free Trial",
    href: "/dashboard",
    popular: true,
  },
  {
    name: "Professional",
    price: "£12",
    period: "/month",
    description: "For growing businesses with multiple events.",
    features: [
      "50 Timers / Month",
      "Everything in Starter",
      "Unlimited team members",
      "AI-Powered Moderation",
      "TimeTickR Branding",
      "Event analytics & export",
      "Priority support",
    ],
    cta: "Start Free Trial",
    href: "/dashboard",
  },
  {
    name: "Enterprise",
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
    cta: "Contact Sales",
    href: "#contact",
  },
];

export function Pricing() {
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
          <Card key={plan.name} className={`flex flex-col ${plan.popular ? "border-primary shadow-primary/20 shadow-lg" : ""}`}>
            <CardHeader className="relative pb-4">
              {plan.popular && <div className="absolute top-0 -translate-y-1/2 w-full flex justify-center"><div className="bg-primary text-primary-foreground px-3 py-1 text-sm font-semibold rounded-full">Most Popular</div></div>}
              <CardTitle className="font-headline text-2xl">{plan.name}</CardTitle>
              <CardDescription>
                <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              <p className="text-foreground/80">{plan.description}</p>
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center">
                    <Check className="mr-2 h-5 w-5 text-green-500" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full" variant={plan.popular ? "default" : "outline"}>
                <Link href={plan.href}>{plan.cta}</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
