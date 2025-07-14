
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
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, type User } from "firebase/auth";
import { useFirebase } from "@/hooks/use-firebase";
import { createStripeCheckoutSession } from "@/app/actions/stripe";
import { ref, set } from "firebase/database";

const testPlans: Record<string, SubscriptionPlan> = {
    "forfree@gmail.com": "Freemium",
    "starter@gmail.com": "Starter",
    "pro@gmail.com": "Professional",
    "enterprise@gmail.com": "Enterprise",
};

// Function to seed test user data
const seedTestUserData = async (user: User, db: any) => {
    const userPlan = testPlans[user.email!];

    if (userPlan) {
        const userRef = ref(db, `users/${user.uid}`);
        await set(userRef, {
            plan: userPlan,
            email: user.email
        });
        console.log(`Seeded plan '${userPlan}' for test user: ${user.email}`);
    }
}


function LoginContent() {
  const { auth, db } = useFirebase();
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

    if (!auth || !db) {
      setLoading(false);
      setErrorMsg("Firebase is not configured correctly.");
      return;
    }

    try {
      let userCredential;
      if (isSignUp) {
        if (password.length < 6) {
          setErrorMsg("Password must be at least 6 characters long.");
          setLoading(false);
          return;
        }
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await seedTestUserData(userCredential.user, db);
        toast({ title: "Account Created!", description: "You're successfully signed up." });

      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
        await seedTestUserData(userCredential.user, db);
        toast({ title: "Signed In!", description: "Welcome back." });
      }

      const user = userCredential.user;

      // For new sign-ups, handle Stripe checkout if a paid plan is selected
      if (isSignUp && selectedPlan && selectedPlan !== "Freemium" && !Object.keys(testPlans).includes(email)) {
          const { sessionId, error: sessionError } = await createStripeCheckoutSession({
            plan: selectedPlan,
            userId: user.uid,
            userEmail: user.email!,
          });

          if (sessionError) throw new Error(sessionError);

          const stripe = (await import("@/lib/stripe-client")).default;
          if (!stripe || !sessionId) throw new Error("Stripe could not be initialized.");
          
          const { error: stripeError } = await stripe.redirectToCheckout({ sessionId });
          if (stripeError) throw stripeError;
          return;
      }
      
      // For all other cases, redirect to dashboard
      router.push("/dashboard");

    } catch (err: any) {
      const code = err.code || "";
      if (code.includes("email-already-in-use")) {
        setErrorMsg("Email already in use. Try signing in.");
      } else if (code.includes("invalid-credential") || code.includes("user-not-found") || code.includes('wrong-password')) {
        setErrorMsg("Invalid email or password.");
      } else {
        console.error("Authentication error:", err);
        setErrorMsg(err.message || "An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  const currentTab = isSignUp ? "signup" : "signin";

  return (
    <Tabs value={currentTab} onValueChange={(value) => setIsSignUp(value === 'signup')} className="w-full max-w-sm">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="signin">Sign In</TabsTrigger>
        <TabsTrigger value="signup">Sign Up</TabsTrigger>
      </TabsList>

        <TabsContent value={currentTab}>
          <Card>
            <CardHeader>
              <CardTitle>{isSignUp ? "Sign Up" : "Sign In"}</CardTitle>
              <CardDescription>
                {isSignUp
                  ? selectedPlan
                    ? `Create an account to start your ${selectedPlan} plan.`
                    : "Create an account to get started."
                  : "Enter your credentials to access your dashboard."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={`email-${currentTab}`}>Email</Label>
                <Input id={`email-${currentTab}`} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="m@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`password-${currentTab}`}>Password</Label>
                <Input id={`password-${currentTab}`} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              {errorMsg && <p className="text-sm text-destructive">{errorMsg}</p>}
            </CardContent>
            <CardFooter className="flex-col gap-4">
              <Button onClick={handleAuth} className="w-full" disabled={loading}>
                {loading && <Loader className="mr-2 animate-spin" />}
                {isSignUp
                  ? selectedPlan && selectedPlan !== "Freemium" && !Object.keys(testPlans).includes(email)
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
