
"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { TimerProvider, useTimer } from "@/context/TimerContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader, Send, CheckCircle, MessageSquareQuote } from "lucide-react";
import { Logo } from "@/components/landing/logo";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

function ParticipantForm() {
    const { submitAudienceQuestion, isSessionFound, sessionCode, plan, customLogo } = useTimer();
    const { toast } = useToast();
    const router = useRouter();
    const pathname = usePathname();

    const [question, setQuestion] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState("");


    if (isSessionFound === false) {
        return (
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <CardTitle>Invalid Link</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <p className="text-destructive">This Q&A link is invalid or has expired. Please check the link and try again.</p>
                     <p className="text-xs text-muted-foreground">
                        The session code <span className="font-mono">{sessionCode}</span> could not be found.
                    </p>
                </CardContent>
                 <CardFooter>
                    <Button onClick={() => router.push(pathname)} className="w-full">
                        Try Again
                    </Button>
                </CardFooter>
            </Card>
        )
    }

    if (isSessionFound === null) {
        return (
             <div className="flex flex-col items-center gap-4 text-foreground">
                <Loader className="h-8 w-8 animate-spin" />
                <p>Connecting to session...</p>
             </div>
        )
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!question.trim()) {
            setError("Please enter a question.");
            return;
        }
        setError("");
        setIsLoading(true);

        try {
            submitAudienceQuestion(question);
            setIsSubmitted(true);
        } catch (err) {
            toast({
                variant: 'destructive',
                title: 'Submission Error',
                description: 'Could not submit your question. Please try again.'
            });
        } finally {
            setIsLoading(false);
        }
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
                    <p className="text-muted-foreground">Your question has been sent to the moderator for review. Thank you!</p>
                </CardContent>
                <CardFooter className="flex-col gap-4">
                     <Button onClick={() => { setQuestion(""); setIsSubmitted(false); }} className="w-full">
                        Ask Another Question
                    </Button>
                </CardFooter>
            </Card>
        )
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
                        Your question will be sent to the event moderator for review.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <Textarea 
                            placeholder="Type your question here..."
                            rows={5}
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            disabled={isLoading}
                        />
                        {error && <p className="text-sm text-destructive">{error}</p>}
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? <Loader className="mr-2 animate-spin" /> : <Send className="mr-2" />}
                            Send Question
                        </Button>
                    </CardFooter>
                </form>
            </Card>
            <div className="flex justify-center mt-8">
                {customLogo && plan === "Enterprise" ? (
                    <Image src={customLogo} alt="Custom Event Logo" width={100} height={40} className="object-contain" />
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
                        <CardTitle>Invalid Link</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-destructive">This Q&A link is missing a session code. Please use the link provided by the event organizer.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <TimerProvider sessionCode={sessionCode}>
             <div className="flex min-h-screen flex-col items-center justify-center bg-secondary p-4">
                <ParticipantForm />
            </div>
        </TimerProvider>
    )
}


export default function ParticipantPage() {
    return (
        <Suspense fallback={<div className="flex h-screen w-screen items-center justify-center bg-secondary"><Loader className="h-12 w-12 animate-spin text-foreground" /></div>}>
            <ParticipantPageWrapper />
        </Suspense>
    );
}
