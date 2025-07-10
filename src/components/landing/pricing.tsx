import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Freemium",
    price: "$0",
    period: "/month",
    description: "For individuals & small projects getting started.",
    features: [
      "1 Remote Stage Timer",
      "Basic Messaging",
      "Limited AI Moderation",
      "1 Team Member",
    ],
    cta: "Get Started",
    href: "#",
  },
  {
    name: "Starter",
    price: "$29",
    period: "/month",
    description: "For small teams and regular events.",
    features: [
      "5 Remote Stage Timers",
      "Full Live Messaging",
      "Standard AI Moderation",
      "5 Team Members",
      "Smart Auto-Alerts",
    ],
    cta: "Get Started",
    href: "#",
    popular: true,
  },
  {
    name: "Professional",
    price: "$79",
    period: "/month",
    description: "For growing businesses with multiple events.",
    features: [
      "Unlimited Timers",
      "Advanced Team Roles",
      "Multi-Device Projection",
      "Analytics & Export",
      "Priority Support",
    ],
    cta: "Get Started",
    href: "#",
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large-scale operations with specific needs.",
    features: [
      "Everything in Professional",
      "Dedicated Account Manager",
      "Custom Integrations",
      "On-premise options",
      "SLA & Advanced Security",
    ],
    cta: "Contact Sales",
    href: "#contact",
  },
];

export function Pricing() {
  return (
    <div className="container">
      <div className="text-center">
        <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Choose Your Plan
        </h2>
        <p className="mt-4 text-lg text-foreground/80">
          Simple, transparent pricing. No hidden fees.
        </p>
      </div>
      <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => (
          <Card key={plan.name} className={`flex flex-col ${plan.popular ? "border-primary shadow-primary/20 shadow-lg" : ""}`}>
            <CardHeader className="relative">
              {plan.popular && <div className="absolute top-0 -translate-y-1/2 w-full flex justify-center"><div className="bg-primary text-primary-foreground px-3 py-1 text-sm font-semibold rounded-full">Most Popular</div></div>}
              <CardTitle className="font-headline text-2xl">{plan.name}</CardTitle>
              <CardDescription>
                <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </CardDescription>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
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
              <Button asChild className="w-full" variant={plan.popular ? "default" : "secondary"}>
                <Link href={plan.href}>{plan.cta}</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
