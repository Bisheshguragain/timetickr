"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader } from "lucide-react";
import Link from "next/link";
import { SubscriptionPlan, useTimer } from "@/context/TimerContext";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { useFirebase } from "@/hooks/use-firebase";
import { createStripeCheckoutSession } from "@/app/actions/stripe";

function isStrongPassword(password: string): boolean {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
}

function getPriceIdForPlan(plan: SubscriptionPlan): string | null {
  const priceMap: Partial<Record<SubscriptionPlan, string | undefined>> = {
    Starter: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID,
    Professional: process.env.NEXT_PUBLIC_STRIPE_PROFESSIONAL_PRICE_ID,
    Enterprise: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID,
  };
  return priceMap[plan] ?? null;
}

function LoginContent() {
  const firebaseServices = useFirebase();
  const { setPlan } = useTimer();
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [signInError, setSignInError] = useState<string | null>(null);
  const [signUpError, setSignUpError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();

  const selectedPlan = searchParams.get('plan') as SubscriptionPlan | null;

  const handleSignUp = async () => {
    setLoading(true);
    setSignUpError(null);

    if (!firebaseServices) {
      setLoading(false);
      setSignUpError("Internal error: Firebase not initialized.");
      return;
    }

    if (!isStrongPassword(signUpPassword)) {
      setLoading(false);
      setSignUpError("Password must be at least 8 characters with uppercase, lowercase, and a number.");
      return;
    }

    try {
      const { user } = await createUserWithEmailAndPassword(firebaseServices.auth, signUpEmail, signUpPassword);

      toast({
        title: "Account Created",
        description: "Welcome to TimeTickR!",
      });

      if (selectedPlan && selectedPlan !== 'Freemium') {
        const priceId = getPriceIdForPlan(selectedPlan);
        if (!priceId) {
          toast({
            variant: "destructive",
            title: "Plan Error",
            description: "Invalid plan selected. Defaulting to Freemium.",
          });
          setPlan("Freemium");
          router.push("/dashboard");
          return;
        }

        const { sessionId, error: sessionError } = await createStripeCheckoutSession({
          priceId,
          userId: user.uid,
          userEmail: user.email!,
        });

        if (sessionError) throw new Error(sessionError);

        const stripe = (await import("@/lib/stripe-client")).default;
        const { error: stripeError } = await stripe.redirectToCheckout({ sessionId: sessionId! });
        if (stripeError) throw stripeError;

      } else {
        setPlan(selectedPlan ?? 'Freemium');
        router.push("/dashboard");
      }
    } catch (err: any) {
      const knownErrors: Record<string, string> = {
        'auth/email-already-in-use': "Email already registered. Try signing in.",
      };
      setSignUpError(knownErrors[err.code] ?? err.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    setLoading(true);
    setSignInError(null);

    if (!firebaseServices) {
      setLoading(false);
      setSignInError("Firebase services not initialized.");
      return;
    }

    try {
      await signInWithEmailAndPassword(firebaseServices.auth, signInEmail, signInPassword);

      toast({
        title: "Signed In!",
        description: "Welcome back.",
      });

      router.push("/dashboard");
    } catch (err: any) {
      const knownErrors: Record<string, string> = {
        'auth/invalid-credential': "Invalid credentials.",
        'auth/user-not-found': "No account found with that email.",
        'auth/wrong-password': "Incorrect password.",
      };
      setSignInError(knownErrors[err.code] ?? err.message ?? "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Tabs defaultValue="signin" className="w-full max-w-sm">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="signin">Sign In</TabsTrigger>
        <TabsTrigger value="signup">Sign Up</TabsTrigger>
      </TabsList>
      <TabsContent value="signin">
        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Enter your credentials to access your dashboard.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email-signin">Email</Label>
              <Input
                id="email-signin"
                type="email"
                placeholder="m@example.com"
                value={signInEmail}
                onChange={(e) => setSignInEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password-signin">Password</Label>
              <Input
                id="password-signin"
                type="password"
                value={signInPassword}
                onChange={(e) => setSignInPassword(e.target.value)}
                required
              />
            </div>
            {signInError && <p className="text-sm text-destructive">{signInError}</p>}
          </CardContent>
          <CardFooter className="flex-col gap-4">
            <Button onClick={handleSignIn} className="w-full" disabled={loading}>
              {loading && <Loader className="mr-2 animate-spin" />}
              Sign In
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
      <TabsContent value="signup">
        <Card>
          <CardHeader>
            <CardTitle>Sign Up</CardTitle>
            <CardDescription>
              {selectedPlan
                ? `Create an account to start your ${selectedPlan} plan.`
                : "Create an account to get started with TimeTickR."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email-signup">Email</Label>
              <Input
                id="email-signup"
                type="email"
                placeholder="m@example.com"
                value={signUpEmail}
                onChange={(e) => setSignUpEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password-signup">Password</Label>
              <Input
                id="password-signup"
                type="password"
                value={signUpPassword}
                onChange={(e) => setSignUpPassword(e.target.value)}
                required
              />
            </div>
            {signUpError && <p className="text-sm text-destructive">{signUpError}</p>}
          </CardContent>
          <CardFooter className="flex-col gap-4">
            <Button onClick={handleSignUp} className="w-full" disabled={loading}>
              {loading && <Loader className="mr-2 animate-spin" />}
              {selectedPlan && selectedPlan !== "Freemium" ? "Proceed to Payment" : "Sign Up"}
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
      <div className="mt-4 text-center text-sm">
        <Link href="/" className="underline text-muted-foreground">
          Back to Home
        </Link>
      </div>
    </Tabs>
  );
}

export default function LoginPage() {
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
        <Suspense fallback={<Loader className="animate-spin" />}>
          <LoginContent />
        </Suspense>
      </div>
    )
}
