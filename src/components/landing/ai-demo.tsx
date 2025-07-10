"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { moderateMessage, ModerateMessageOutput } from "@/ai/flows/moderate-message";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { ThumbsUp, ThumbsDown, Bot, Loader } from "lucide-react";

export function AiDemo() {
  const [message, setMessage] = useState("Hello everyone, have a fantastic day!");
  const [result, setResult] = useState<ModerateMessageOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsLoading(true);
    setResult(null);

    try {
      const moderationResult = await moderateMessage({ message });
      setResult(moderationResult);
    } catch (error) {
      console.error("Error moderating message:", error);
      // Handle error display to the user if needed
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="mx-auto max-w-4xl">
        <div className="text-center">
          <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            AI-Powered Moderation in Action
          </h2>
          <p className="mt-4 text-lg text-foreground/80">
            Keep your on-screen messages professional. Our AI automatically detects and flags inappropriate content.
          </p>
        </div>
        <Card className="mt-12">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Bot className="h-6 w-6" />
                    <span>Moderation Demo</span>
                </CardTitle>
                <CardDescription>
                    Enter a message below and our AI will assess it for appropriateness.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Textarea
                    placeholder="Enter a message to test..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    />
                    <Button type="submit" disabled={isLoading}>
                        {isLoading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                        {isLoading ? "Analyzing..." : "Moderate Message"}
                    </Button>
                </form>

                {result && (
                <div className="mt-6">
                    <Alert variant={result.isSafe ? "default" : "destructive"} className={result.isSafe ? "bg-green-500/10 border-green-500/50" : ""}>
                    {result.isSafe ? (
                        <ThumbsUp className="h-4 w-4" />
                    ) : (
                        <ThumbsDown className="h-4 w-4" />
                    )}
                    <AlertTitle>{result.isSafe ? "Message is Safe" : "Message is Not Safe"}</AlertTitle>
                    <AlertDescription>{result.reason}</AlertDescription>
                    </Alert>
                </div>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
