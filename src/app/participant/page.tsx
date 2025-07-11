
"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from 'next/navigation';
import { useTimer } from "@/context/TimerContext";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader, Send, CheckCircle, MessageSquareQuote } from "lucide-react";
import { Logo } from "@/components/landing/logo";
import { useToast } from "@/hooks/use-toast";

function ParticipantForm() {
    const { audiencePairingCode: validPairingCode, plan, submitAudienceQuestion } = useTimer();
    const { toast } = useToast();
    const searchParams = useSearchParams();
    const code = searchParams.get('code');

    const [question, setQuestion] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState("");

    const isPaired = code === validPairingCode;

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

    if (!isPaired) {
        return (
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <CardTitle>Invalid Link</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <p className="text-destructive">This Q&A link is invalid or has expired. Please check the link and try again.</p>
                    <p className="text-xs text-muted-foreground">
                        Note: This prototype uses browser storage. For this link to work, it must be opened in the same browser where the admin dashboard is running. The expected code is: <code className="font-mono bg-secondary p-1 rounded">{validPairingCode}</code>
                    </p>
                </CardContent>
            </Card>
        )
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
        <Card className="w-full max-w-lg">
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
    );
}

export default function ParticipantPage() {
    const { plan } = useTimer();
    const showBranding = plan !== "Enterprise";
    
    return (
        <Suspense fallback={<div className="flex h-screen w-screen items-center justify-center bg-gray-900"><Loader className="h-12 w-12 animate-spin text-white" /></div>}>
            <div className="flex min-h-screen flex-col items-center justify-center bg-secondary p-4">
                <div className="w-full max-w-lg">
                    <ParticipantForm />
                </div>
                {showBranding && (
                    <div className="absolute bottom-4">
                        <Logo className="text-muted-foreground" />
                    </div>
                )}
            </div>
        </Suspense>
    );
}
