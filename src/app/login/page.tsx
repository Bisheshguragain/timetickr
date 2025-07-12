
"use client";

import { useState, Suspense, useEffect } from "react";
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

function LoginContent() {
  const { firebaseServices } = useTimer();
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

  useEffect(() => {
    // This logic runs only on the client, after hydration
    const plan = searchParams.get('plan') as SubscriptionPlan;
    if (plan) {
      localStorage.setItem('selectedPlan', plan);
    }
  }, [searchParams]);

  const handleSignUp = async () => {
    setLoading(true);
    setSignUpError(null);
    if (!firebaseServices) {
      setLoading(false);
      setSignUpError("Firebase is not configured correctly.");
      return;
    }

    try {
      await createUserWithEmailAndPassword(firebaseServices.auth, signUpEmail, signUpPassword);
      toast({
        title: "Account Created!",
        description: "You have been successfully signed up.",
      });
      router.push("/dashboard");
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setSignUpError("This email is already in use. Please sign in instead.");
      } else {
        setSignUpError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    setLoading(true);
    setSignInError(null);
    if (!firebaseServices) {
        setLoading(false);
        setSignInError("Firebase is not configured correctly.");
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
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setSignInError("Invalid email or password. Please try again or sign up.");
      } else {
        setSignInError(err.message);
      }
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
              <CardDescription>
                Enter your credentials to access your dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-signin">Email</Label>
                <Input id="email-signin" type="email" placeholder="m@example.com" value={signInEmail} onChange={(e) => setSignInEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password-signin">Password</Label>
                <Input id="password-signin" type="password" value={signInPassword} onChange={(e) => setSignInPassword(e.target.value)} />
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
                Create an account to get started with TimeTickR.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-signup">Email</Label>
                <Input id="email-signup" type="email" placeholder="m@example.com" value={signUpEmail} onChange={(e) => setSignUpEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password-signup">Password</Label>
                <Input id="password-signup" type="password" value={signUpPassword} onChange={(e) => setSignUpPassword(e.target.value)} />
              </div>
               {signUpError && <p className="text-sm text-destructive">{signUpError}</p>}
            </CardContent>
            <CardFooter className="flex-col gap-4">
              <Button onClick={handleSignUp} className="w-full" disabled={loading}>
                 {loading && <Loader className="mr-2 animate-spin" />}
                Sign Up
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
  const { firebaseServices } = useTimer();

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
      <Suspense fallback={<Loader className="animate-spin" />}>
        {firebaseServices ? <LoginContent /> : <Loader className="animate-spin" />}
      </Suspense>
    </div>
  )
}
