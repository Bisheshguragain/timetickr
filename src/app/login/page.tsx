
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

function LoginContent() {
  const { auth } = useFirebase();
  const { setPlan } = useTimer();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const selectedPlan = searchParams.get("plan") as SubscriptionPlan | null;

  const handleAuth = async () => {
    setLoading(true);
    setErrorMsg(null);

    if (!auth) {
      setLoading(false);
      setErrorMsg("Firebase is not configured.");
      return;
    }

    try {
      if (isSignUp) {
        // Password validation before attempting to create a user
        if (password.length < 8 || !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password)) {
          setLoading(false);
          setErrorMsg("Password must be at least 8 characters with uppercase, lowercase, and a number.");
          return;
        }

        const credential = await createUserWithEmailAndPassword(auth, email, password);
        const user = credential.user;

        toast({ title: "Account Created!", description: "You're successfully signed up." });

        if (selectedPlan && selectedPlan !== "Freemium") {
          // The server action now takes the plan name directly
          const { sessionId, error: sessionError } = await createStripeCheckoutSession({
            plan: selectedPlan,
            userId: user.uid,
            userEmail: user.email!,
          });

          if (sessionError) throw new Error(sessionError);

          const stripe = (await import("@/lib/stripe-client")).default;
          if (!stripe || !sessionId) throw new Error("Stripe or Session ID not available");
          
          const { error: stripeError } = await stripe.redirectToCheckout({ sessionId });
          if (stripeError) throw stripeError;
          // User is redirected to Stripe, no further action here
          return; 
        } else {
          // For Freemium or no plan selected
          if (selectedPlan) setPlan(selectedPlan);
          router.push("/dashboard");
        }
      } else {
        // Sign In logic
        await signInWithEmailAndPassword(auth, email, password);
        toast({ title: "Signed In!", description: "Welcome back." });
        router.push("/dashboard");
      }
    } catch (err: any) {
      const code = err.code || "";
      if (code.includes("email-already-in-use")) {
        setErrorMsg("Email already in use. Try signing in.");
      } else if (code.includes("invalid-credential") || code.includes("user-not-found") || code.includes("wrong-password")) {
        setErrorMsg("Invalid email or password.");
      } else {
        setErrorMsg(err.message || "An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  const currentMode = isSignUp ? 'signup' : 'signin';

  return (
    <Tabs value={currentMode} onValueChange={(value) => setIsSignUp(value === 'signup')} className="w-full max-w-sm">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="signin">Sign In</TabsTrigger>
        <TabsTrigger value="signup">Sign Up</TabsTrigger>
      </TabsList>
        <TabsContent value={currentMode}>
          <Card>
            <CardHeader>
              <CardTitle>{isSignUp ? "Sign Up" : "Sign In"}</CardTitle>
              <CardDescription>
                {isSignUp
                  ? selectedPlan
                    ? `Create an account to start your ${selectedPlan} plan.`
                    : "Create a new account to get started."
                  : "Enter your credentials to access your dashboard."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={`email-${currentMode}`}>Email</Label>
                <Input id={`email-${currentMode}`} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="m@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`password-${currentMode}`}>Password</Label>
                <Input id={`password-${currentMode}`} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              {errorMsg && <p className="text-sm text-destructive">{errorMsg}</p>}
            </CardContent>
            <CardFooter className="flex-col gap-4">
              <Button onClick={handleAuth} className="w-full" disabled={loading}>
                {loading && <Loader className="mr-2 animate-spin" />}
                {isSignUp
                  ? selectedPlan && selectedPlan !== "Freemium"
                    ? "Proceed to Payment"
                    : "Sign Up"
                  : "Sign In"}
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
  );
}
