
"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from 'next/navigation';
import { TimerProvider, useTimer } from "@/context/TimerContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader, Send, CheckCircle, MessageSquareQuote } from "lucide-react";
import { Logo } from "@/components/landing/logo";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { useTeam, TeamProvider } from "@/context/TeamContext";

// Optional analytics stub
const logQuestionSubmission = async (question: string, sessionCode: string) => {
  try {
    await fetch("/api/analytics", {
      method: "POST",
      body: JSON.stringify({ question, sessionCode }),
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    // Logging is non-blocking; fail silently
  }
};

function ParticipantForm() {
  const { submitAudienceQuestion, isSessionFound } = useTimer();
  const { customLogo, teamId: sessionCode } = useTeam();
  const { toast } = useToast();
  const router = useRouter();

  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!question.trim()) {
      setError("Please enter a question.");
      return;
    }

    setError("");
    setIsLoading(true);
    setIsSubmitting(true);

    try {
      submitAudienceQuestion(question); // Backend call
      if (sessionCode) {
        logQuestionSubmission(question, sessionCode);
      }
      setIsSubmitted(true);
    } catch(e: any) {
      toast({
        variant: 'destructive',
        title: 'Submission Error',
        description: e.message || 'Could not submit your question. Please try again.',
      });
       setIsSubmitting(false); // Allow retry on error
    } finally {
      setIsLoading(false);
      // Don't reset isSubmitting here on success, as we show the success message.
      // Set a timeout to prevent spamming
      setTimeout(() => {
        setIsSubmitting(false);
      }, 5000);
    }
  };

  if (!isMounted) {
    return (
        <div className="flex flex-col items-center gap-4 text-foreground">
            <Loader className="h-8 w-8 animate-spin" />
            <p>Loading...</p>
        </div>
    );
  }

  if (isSessionFound === false) {
    return (
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Session Not Found</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-destructive">This Q&A link is invalid or has expired.</p>
          <p className="text-xs text-muted-foreground">
            Code <span className="font-mono">{sessionCode}</span> is not active.
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={() => router.push("/")} className="w-full">
            Go to Homepage
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (isSessionFound === null) {
    return (
      <div className="flex flex-col items-center gap-4 text-foreground">
        <Loader className="h-8 w-8 animate-spin" />
        <p>Connecting to session...</p>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <Card className="w-full max-w-lg text-center">
        <CardHeader>
          <CardTitle className="flex items-center justify-center gap-2">
            <CheckCircle className="text-green-500" />
            Question Submitted!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Your question has been sent for moderation. Thank you!</p>
        </CardContent>
        <CardFooter className="flex-col gap-4">
          <Button onClick={() => { setQuestion(""); setIsSubmitted(false); }} className="w-full">
            Ask Another Question
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-lg">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <MessageSquareQuote />
            Ask a Question
          </CardTitle>
          <CardDescription>
            Your message will be reviewed before posting.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Type your question here..."
              rows={5}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={isLoading || isSubmitting}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading || isSubmitting}>
              {isLoading ? <Loader className="mr-2 animate-spin" /> : <Send className="mr-2" />}
              Send Question
            </Button>
          </CardFooter>
        </form>
      </Card>
      <div className="flex justify-center mt-8">
        {customLogo && typeof customLogo === "string" && customLogo.startsWith("data:image") ? (
          <Image src={customLogo} alt="Event Logo" width={100} height={40} className="object-contain" />
        ) : (
          <Logo className="text-muted-foreground" />
        )}
      </div>
    </div>
  );
}

function ParticipantPageWrapper() {
  const searchParams = useSearchParams();
  const sessionCode = searchParams.get('code');

  if (!sessionCode) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-secondary p-4">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>Missing Code</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">This link is missing a session code. Please check with the event host.</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // The TeamProvider now manages the sessionCode/teamId
  return (
      <TimerProvider sessionCode={sessionCode}>
        <div className="flex min-h-screen flex-col items-center justify-center bg-secondary p-4">
          <ParticipantForm />
        </div>
      </TimerProvider>
  );
}

export default function ParticipantPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-screen items-center justify-center bg-secondary">
        <Loader className="h-12 w-12 animate-spin text-foreground" />
      </div>
    }>
      <TeamProvider>
        <ParticipantPageWrapper />
      </TeamProvider>
    </Suspense>
  );
}
