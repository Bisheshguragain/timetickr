"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Play,
  Pause,
  RotateCcw,
  Plus,
  Minus,
  Timer,
  Settings,
  MonitorPlay,
  MessageSquare,
  Send,
  Loader,
} from "lucide-react";
import { useTimer } from "@/context/TimerContext";
import { Header } from "@/components/landing/header";
import { moderateMessage } from "@/ai/flows/moderate-message";
import { useToast } from "@/hooks/use-toast";

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
};

function LiveMessagingCard() {
    const { sendMessage } = useTimer();
    const { toast } = useToast();
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSend = async () => {
        if (!message.trim()) return;
        setIsLoading(true);
        try {
            const moderationResult = await moderateMessage({ message: message.trim() });
            if (moderationResult.isSafe) {
                sendMessage(message.trim());
                setMessage("");
            } else {
                toast({
                    variant: "destructive",
                    title: "Message Blocked",
                    description: `Reason: ${moderationResult.reason}`,
                });
            }
        } catch (error) {
            console.error("Error moderating message:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Could not send message. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <MessageSquare />
                    Live Messaging
                </CardTitle>
                <CardDescription>
                    Send messages directly to the speaker's display. Messages are moderated by AI.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <Textarea 
                        placeholder="Type your message here..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        disabled={isLoading}
                    />
                    <Button onClick={handleSend} className="w-full" disabled={isLoading}>
                        {isLoading ? <Loader className="mr-2 animate-spin" /> : <Send className="mr-2" />}
                        {isLoading ? "Analyzing..." : "Send Message"}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

export default function DashboardPage() {
  const {
    time,
    isActive,
    toggleTimer,
    resetTimer,
    setDuration,
  } = useTimer();

  const handleSetTime = (newTime: number) => {
    const clampedTime = Math.max(0, newTime);
    if (!isActive) {
      setDuration(clampedTime);
    }
  };

  const presetDurations = [300, 600, 900, 1800, 3600];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 p-4 md:p-8">
        <div className="container mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <h1 className="font-headline text-3xl font-bold">Admin Dashboard</h1>
            <Button asChild variant="outline">
              <Link href="/speaker-view" target="_blank">
                <MonitorPlay className="mr-2" />
                Open Speaker View
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Timer />
                  Live Timer Control
                </CardTitle>
                <CardDescription>
                  Manage the countdown timer that your speaker sees in real-time.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center space-y-6 pt-6">
                <div className="font-mono text-8xl font-bold tracking-tighter md:text-9xl">
                  {formatTime(time)}
                </div>
                <div className="flex w-full max-w-sm items-center justify-center space-x-4">
                  <Button
                    onClick={toggleTimer}
                    size="lg"
                    className="w-full"
                  >
                    {isActive ? (
                      <Pause className="mr-2" />
                    ) : (
                      <Play className="mr-2" />
                    )}
                    {isActive ? "Pause" : "Start"}
                  </Button>
                  <Button
                    onClick={() => resetTimer()}
                    size="lg"
                    variant="secondary"
                    className="w-full"
                  >
                    <RotateCcw className="mr-2" />
                    Reset
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-8">
                <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                    <Settings />
                    Timer Settings
                    </CardTitle>
                    <CardDescription>
                    Configure the timer duration before starting.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                    <label
                        htmlFor="custom-time"
                        className="mb-2 block text-sm font-medium text-muted-foreground"
                    >
                        Custom Duration (in minutes)
                    </label>
                    <div className="flex items-center gap-2">
                        <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleSetTime(time - 60)}
                        disabled={isActive}
                        >
                        <Minus />
                        </Button>
                        <Input
                        id="custom-time"
                        type="number"
                        className="text-center"
                        value={Math.floor(time / 60)}
                        onChange={(e) =>
                            handleSetTime(parseInt(e.target.value) * 60)
                        }
                        onFocus={(e) => e.target.select()}
                        disabled={isActive}
                        />
                        <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleSetTime(time + 60)}
                        disabled={isActive}
                        >
                        <Plus />
                        </Button>
                    </div>
                    </div>

                    <div>
                    <p className="mb-2 text-sm font-medium text-muted-foreground">
                        Preset Durations
                    </p>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {presetDurations.map((duration) => (
                        <Button
                            key={duration}
                            variant="outline"
                            onClick={() => handleSetTime(duration)}
                            disabled={isActive}
                        >
                            {duration / 60} min
                        </Button>
                        ))}
                    </div>
                    </div>
                </CardContent>
                </Card>
                <LiveMessagingCard />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
