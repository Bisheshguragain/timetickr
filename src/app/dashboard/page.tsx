

"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
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
  Palette,
  Check,
  Signal,
  Star,
  ArrowRight,
  RefreshCcw,
  ShoppingCart,
  BarChart,
  FileClock,
  Copy,
  Users,
  ThumbsDown,
  ThumbsUp,
  PersonStanding,
  ExternalLink,
  UserPlus,
  Mail,
  MoreHorizontal,
  Info,
  LogOut,
  UserCircle,
  KeyRound,
  ShieldCheck,
  Image as ImageIcon,
  Upload,
  Trash2,
  FileDown,
  Sparkles,
  ClipboardCopy,
  Undo2,
  CheckCircle2,
  XCircle,
  Clock,
  Volume2,
  ListPlus,
} from "lucide-react";
import { useTimer, TimerTheme, AudienceQuestion, TeamMember, SubscriptionPlan } from "@/context/TimerContext";
import { moderateMessage } from "@/ai/flows/moderate-message";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Bar as BarRechart, BarChart as BarChartRechart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { generateAlerts, GenerateAlertsOutput } from "@/ai/flows/generate-alerts-flow";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { generateSpeech, GenerateSpeechOutput } from "@/ai/flows/generate-speech-flow";
import { createStripeCheckoutSession } from "@/app/actions/stripe";
import { updatePassword } from "firebase/auth";
import { generateImage, GenerateImageOutput } from "@/ai/flows/generate-image-flow";
import { generateSpeechAudio, GenerateSpeechAudioOutput } from "@/ai/flows/generate-speech-audio-flow";
import ProtectedLayout from "@/components/layouts/ProtectedLayout";
import { usePlanGate } from "@/hooks/use-plan-gate";
import { useUsageReset } from "@/hooks/use-usage-reset";
import { usePlanSync } from "@/hooks/use-plan-sync";
import { useTimerPersistence } from "@/hooks/use-timer-persistence";
import { useStripeRecovery } from "@/hooks/use-stripe-recovery";


const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
};

function LiveMessagingCard() {
    const { sendAdminMessage } = useTimer();
    const { canUseAi } = usePlanGate();
    const { toast } = useToast();
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState<string | null>(null);

    const presetMessages = [
        "5 minutes remaining",
        "3 minutes remaining",
        "1 minute left",
        "Time is up!",
        "Q&A starting now",
        "Please wrap up",
        "You're doing great!",
        "Amazing energy!",
        "The audience is loving this!",
        "Technical difficulties, please stand by.",
        "Mic is off.",
        "Let's welcome our next speaker!",
        "Thank you for that insightful presentation!",
        "Incredible work!",
        "Fantastic point!",
        "Keep the energy high!",
        "Powerful message.",
    ];

    const presetEmojis = ["👍", "❤️", "😂", "👏", "🤯", "🔥"];

    const handleSend = async (messageToSend: string) => {
        if (!messageToSend) return;
        setIsLoading(true);
        setLoadingMessage(messageToSend);
        try {
            if(canUseAi) {
                const moderationResult = await moderateMessage({ message: messageToSend });
                if (moderationResult.isSafe) {
                    sendAdminMessage(messageToSend);
                    setMessage("");
                } else {
                    toast({
                        variant: "destructive",
                        title: "Message Blocked",
                        description: `Reason: ${moderationResult.reason}`,
                    });
                }
            } else {
                sendAdminMessage(messageToSend);
                setMessage("");
            }
        } catch (error: any) {
            console.error("Error sending message:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Could not send message. Please try again.",
            });
        } finally {
            setIsLoading(false);
            setLoadingMessage(null);
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
                    Send messages directly to the speaker's display.
                    {canUseAi ? (
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                            <ShieldCheck className="text-green-500" /> AI Moderation is active.
                        </span>
                    ) : (
                        <span className="text-xs text-muted-foreground mt-1">
                            <Link href="/#pricing" className="underline font-medium">Upgrade to Professional</Link> to enable AI moderation.
                        </span>
                    )}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Textarea
                        placeholder="Type your custom message here..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend(message.trim());
                            }
                        }}
                        disabled={isLoading}
                    />
                    <Button onClick={() => handleSend(message.trim())} className="w-full" disabled={isLoading || !message.trim()}>
                        {isLoading && loadingMessage === message.trim() ? <Loader className="mr-2 animate-spin" /> : <Send className="mr-2" />}
                        {isLoading && loadingMessage === message.trim() ? "Analyzing..." : "Send Custom Message"}
                    </Button>
                </div>
                 <div className="space-y-3">
                    <p className="text-sm font-medium text-muted-foreground">
                        Quick Messages
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {presetMessages.map((msg) => (
                            <Button
                                key={msg}
                                variant="outline"
                                size="sm"
                                onClick={() => handleSend(msg)}
                                disabled={isLoading}
                                className="flex-grow"
                            >
                                {isLoading && loadingMessage === msg ? <Loader className="mr-2 animate-spin" /> : null}
                                {msg}
                            </Button>
                        ))}
                    </div>
                </div>
                <div className="space-y-3">
                    <p className="text-sm font-medium text-muted-foreground">
                        Quick Emojis
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {presetEmojis.map((emoji) => (
                            <Button
                                key={emoji}
                                variant="outline"
                                size="icon"
                                onClick={() => handleSend(emoji)}
                                disabled={isLoading}
                                className="text-xl"
                            >
                                {isLoading && loadingMessage === emoji ? <Loader className="animate-spin" /> : emoji}
                            </Button>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

function ThemeSelectorCard() {
  const { theme, setTheme } = useTimer();
  const themes: { name: TimerTheme; bg: string; text: string; time: string; }[] = [
    { name: "Classic", bg: "bg-gray-800", text: "text-white", time: "font-mono" },
    { name: "Modern", bg: "bg-gray-900", text: "text-white", time: "font-headline tracking-wide" },
    { name: "Minimalist", bg: "bg-gray-100", text: "text-gray-800", time: "font-sans font-light border-2 border-gray-200" },
    { name: "Industrial", bg: "bg-gray-800", text: "text-amber-400", time: "font-mono uppercase" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette />
          Theme Selector
        </CardTitle>
        <CardDescription>
          Choose a visual theme for the speaker's display.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        {themes.map((t) => (
          <button
            key={t.name}
            className={cn(
              "relative aspect-video rounded-lg p-3 flex flex-col justify-center items-center cursor-pointer transition-all duration-200 border-2",
              t.bg,
              theme === t.name ? "border-primary" : "border-transparent"
            )}
            onClick={() => setTheme(t.name)}
          >
            <div className={cn("text-2xl font-bold", t.time, t.text)}>
              01:23
            </div>
            <div className={cn("text-xs mt-1", t.text === 'text-white' || t.text === 'text-amber-400' ? t.text : 'text-gray-500')}>
              {t.name}
            </div>
            {theme === t.name && (
              <div className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Check className="h-4 w-4" />
              </div>
            )}
          </button>
        ))}
      </CardContent>
    </Card>
  );
}

function DeviceConnectionCard() {
  const {
    sessionCode,
    speakerDevices,
    participantDevices,
  } = useTimer();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [speakerViewUrl, setSpeakerViewUrl] = useState('');
  const [participantUrl, setParticipantUrl] = useState('');

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined' && sessionCode) {
        setSpeakerViewUrl(`${window.location.origin}/speaker-view?code=${sessionCode}`);
        setParticipantUrl(`${window.location.origin}/participant?code=${sessionCode}`);
    }
  }, [sessionCode]);

  if (!isClient) {
    return (
        <Card>
            <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                    <Signal />
                    Connect a Device
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex justify-center items-center h-40">
                    <Loader className="animate-spin" />
                </div>
            </CardContent>
        </Card>
    );
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard!", description: text });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Signal />
          Connect a Device
        </CardTitle>
        <CardDescription>
          Pair displays or share links to connect participants.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            Session Pairing Code
          </label>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-full items-center justify-center rounded-md border border-dashed bg-secondary font-mono text-lg">
              {sessionCode || <Loader className="animate-spin" size="sm" />}
            </div>
            <Button variant="outline" size="icon" onClick={() => copyToClipboard(sessionCode || "")} disabled={!sessionCode}>
              <Copy />
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            Speaker View Link
          </label>
          <div className="flex items-center gap-2">
            <Input
              value={speakerViewUrl}
              readOnly
              className="truncate"
              placeholder="Generating link..."
            />
            <Button variant="outline" size="icon" onClick={() => copyToClipboard(speakerViewUrl)} disabled={!speakerViewUrl}>
              <Copy />
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            Audience Q&A Link
          </label>
          <div className="flex items-center gap-2">
            <Input
              value={participantUrl}
              readOnly
              className="truncate"
              placeholder="Generating link..."
            />
            <Button variant="outline" size="icon" onClick={() => copyToClipboard(participantUrl)} disabled={!participantUrl}>
              <Copy />
            </Button>
          </div>
          <Button asChild variant="secondary" className="w-full mt-2" disabled={!participantUrl}>
              <a href={participantUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2" />
                Open Q&A Page
              </a>
          </Button>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Connected Devices
          </p>
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="flex items-center gap-2">
              <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                <span className="font-bold text-primary">{speakerDevices}</span>
              </div>
              <p className="text-sm text-muted-foreground">{speakerDevices === 1 ? "Speaker" : "Speakers"} Online</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                <span className="font-bold text-primary">{participantDevices}</span>
              </div>
              <p className="text-sm text-muted-foreground">{participantDevices === 1 ? "Participant" : "Participants"} Online</p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full" disabled={!speakerViewUrl}>
          <a href={speakerViewUrl} target="_blank" rel="noopener noreferrer">
            <MonitorPlay className="mr-2" />
            Open New Speaker View
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}

function CurrentPlanCard() {
  const { plan, timersUsed, timerLimit } = useTimer();
  const { isEnterprise } = usePlanGate();

  const planDetails: Record<SubscriptionPlan, { name: string; description: string }> = {
    Freemium: { name: "Freemium", description: "Get started with our basic features." },
    Starter: { name: "Starter", description: "Unlock more features for small teams." },
    Professional: { name: "Professional", description: "Power features for growing businesses." },
    Enterprise: { name: "Enterprise", description: "You have access to all our top-tier features." },
    TimerAddon: { name: "Add-on", description: "Additional timers purchased." },
  };

  const currentPlanDetails = planDetails[plan];
  const usagePercentage = timerLimit > 0 ? (timersUsed / timerLimit) * 100 : (isEnterprise ? 0 : 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Star />
                Current Plan
            </div>
             <span className="text-sm font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">{currentPlanDetails.name}</span>
        </CardTitle>
        <CardDescription>
          {currentPlanDetails.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
         <div>
            <div className="flex justify-between items-center mb-2 text-sm font-medium text-muted-foreground">
                <span>Monthly Usage</span>
                {isEnterprise ? (
                    <span>Unlimited Timers</span>
                ) : (
                    <span>
                        <span className="text-foreground font-bold">{timersUsed}</span> / {timerLimit} Timers
                    </span>
                )}
            </div>
            <Progress value={usagePercentage} />
         </div>
      </CardContent>
      {!isEnterprise && (
        <CardFooter>
          <Button asChild className="w-full">
            <Link href="/#pricing">Upgrade Plan <ArrowRight className="ml-2" /></Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

function PurchaseTimersDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { toast } = useToast();
  const { currentUser } = useTimer();
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const pricePerTimer = 2; // Display only
  const totalCost = quantity * pricePerTimer;

  const handlePurchase = async () => {
    if (!currentUser) {
      toast({
        variant: 'destructive',
        title: 'Not Logged In',
        description: 'You must be logged in to make a purchase.',
      });
      return;
    }
    
    setIsLoading(true);

    try {
      const { sessionId, error: sessionError } = await createStripeCheckoutSession({
          plan: 'TimerAddon', // Special plan name for this action
          userId: currentUser.uid,
          userEmail: currentUser.email!,
       });

      if (sessionError) throw new Error(sessionError);

      const stripe = (await import('@/lib/stripe-client')).default;
      const { error } = await stripe.redirectToCheckout({ sessionId: sessionId! });

      if (error) {
        console.error("Stripe redirect error:", error);
        toast({
            variant: "destructive",
            title: "Checkout Error",
            description: error.message || "An unexpected error occurred. Please try again.",
        });
      }
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Error",
            description: error.message || "Could not initiate checkout. Please contact support.",
        });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <ShoppingCart />
            Need More Timers?
          </AlertDialogTitle>
          <AlertDialogDescription>
            You've reached your monthly limit. Purchase additional timers to
            continue. Each timer costs £{pricePerTimer}.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-4 space-y-4">
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={isLoading}
            >
              <Minus />
            </Button>
            <span className="text-4xl font-bold w-20 text-center">{quantity}</span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setQuantity(quantity + 1)}
              disabled={isLoading}
            >
              <Plus />
            </Button>
          </div>
          <p className="text-center text-lg font-semibold">
            Total Cost: £{totalCost}
          </p>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handlePurchase} disabled={isLoading}>
            {isLoading && <Loader className="mr-2 animate-spin" />}
            Complete Purchase
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function AnalyticsCard() {
    const { analytics, resetAnalytics } = useTimer();
    const { hasAnalyticsExport, isEnterprise } = usePlanGate();
    const { toast } = useToast();
    const { totalTimers, avgDuration, messagesSent, durationBrackets, maxAudience, maxSpeakers } = analytics;

    const chartData = [
        { name: "0-5m", count: durationBrackets["0-5"] },
        { name: "5-15m", count: durationBrackets["5-15"] },
        { name: "15-30m", count: durationBrackets["15-30"] },
        { name: "30-60m", count: durationBrackets["30-60"] },
        { name: "60m+", count: durationBrackets["60+"] },
    ];

    const chartConfig = {
      count: {
        label: "Count",
        color: "hsl(var(--primary))",
      },
    }

    const handleExport = () => {
        const headers = ["Metric", "Value"];
        const rows = [
            ["Total Timers Started", totalTimers],
            ["Average Duration (seconds)", avgDuration],
            ["Total Messages Sent", messagesSent],
            ["Peak Concurrent Speakers", maxSpeakers],
            ["Peak Concurrent Audience", maxAudience],
            ["Durations: 0-5 mins", durationBrackets["0-5"]],
            ["Durations: 5-15 mins", durationBrackets["5-15"]],
            ["Durations: 15-30 mins", durationBrackets["15-30"]],
            ["Durations: 30-60 mins", durationBrackets["30-60"]],
            ["Durations: 60+ mins", durationBrackets["60+"]],
        ];

        let csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "analytics-export.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast({
            title: "Export Started",
            description: "Your analytics data is being downloaded."
        });
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BarChart />
                    {isEnterprise ? "Advanced Analytics" : "Basic Analytics"}
                </CardTitle>
                <CardDescription>
                    {isEnterprise
                        ? "In-depth summary of timer usage and event engagement."
                        : "Summary of timer and message usage for this event."
                    }
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-4 rounded-lg bg-secondary/50">
                        <p className="text-3xl font-bold">{totalTimers}</p>
                        <p className="text-xs text-muted-foreground">Timers Used</p>
                    </div>
                     <div className="p-4 rounded-lg bg-secondary/50">
                        <p className="text-3xl font-bold">{formatTime(avgDuration)}</p>
                        <p className="text-xs text-muted-foreground">Avg. Duration</p>
                    </div>
                     <div className="p-4 rounded-lg bg-secondary/50">
                        <p className="text-3xl font-bold">{messagesSent}</p>
                        <p className="text-xs text-muted-foreground">Messages Sent</p>
                    </div>
                     <div className="p-4 rounded-lg bg-secondary/50">
                        <p className="text-3xl font-bold">{maxSpeakers}</p>
                        <p className="text-xs text-muted-foreground">Peak Speakers</p>
                    </div>
                     <div className="p-4 rounded-lg bg-secondary/50 col-span-2">
                        <p className="text-3xl font-bold">{maxAudience}</p>
                        <p className="text-xs text-muted-foreground">Peak Audience</p>
                    </div>
                </div>

                {isEnterprise && (
                  <div>
                      <p className="mb-2 text-sm font-medium text-muted-foreground">
                          Duration Breakdown
                      </p>
                      <ChartContainer config={chartConfig} className="h-40 w-full">
                        <BarChartRechart accessibilityLayer data={chartData} layout="vertical" margin={{ left: -10 }}>
                          <XAxis type="number" dataKey="count" hide />
                          <YAxis
                            dataKey="name"
                            type="category"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={10}
                            width={50}
                          />
                          <ChartTooltip
                              cursor={false}
                              content={<ChartTooltipContent hideLabel />}
                          />
                          <BarRechart dataKey="count" fill="var(--color-count)" radius={4} />
                        </BarChartRechart>
                      </ChartContainer>
                  </div>
                )}

                 {hasAnalyticsExport ? (
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <Button onClick={resetAnalytics} variant="link" size="sm" className="p-0 h-auto text-muted-foreground">
                            <RefreshCcw className="mr-2" /> Reset analytics
                        </Button>
                        <Button onClick={handleExport} variant="outline" size="sm">
                            <FileDown className="mr-2" /> Export Data
                        </Button>
                    </div>
                 ) : (
                    <p className="text-xs text-muted-foreground text-center">
                        <Link href="/#pricing" className="underline font-medium">Upgrade to Enterprise</Link> for detailed reporting and data export.
                    </p>
                 )}
            </CardContent>
        </Card>
    )
}

function SmartAlertsCard() {
  const { toast } = useToast();
  const { setScheduledAlerts } = useTimer();
  const { hasSmartAlerts } = usePlanGate();
  const [duration, setDuration] = useState(30);
  const [speakers, setSpeakers] = useState(3);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedAlerts, setGeneratedAlerts] = useState<GenerateAlertsOutput['alerts'] | null>(null);

  if (!hasSmartAlerts) {
    return (
        <Card data-testid="smart-alerts-card">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileClock />
                    AI-Generated Smart Alerts
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-center text-muted-foreground p-4 bg-secondary rounded-lg">
                    <p>This feature is available on Professional and Enterprise plans.</p>
                    <Button asChild variant="link" className="p-0 h-auto">
                        <Link href="/#pricing">Upgrade to generate smart schedules</Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
  }

  const handleGenerateAlerts = async () => {
    if (duration <= 0 || speakers <= 0) {
        toast({ variant: 'destructive', title: 'Invalid Input', description: 'Please enter positive numbers for duration and speakers.' });
        return;
    }
    setIsLoading(true);
    setGeneratedAlerts(null);
    try {
        const result = await generateAlerts({ durationInMinutes: duration, numberOfSpeakers: speakers });
        setGeneratedAlerts(result.alerts);
    } catch(error) {
        console.error("Error generating smart alerts:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not generate alerts. Please try again.' });
    } finally {
        setIsLoading(false);
    }
  }

  const handleLoadSchedule = () => {
    if (!generatedAlerts) return;
    setScheduledAlerts(generatedAlerts);
    toast({
        title: "Schedule Loaded",
        description: "The smart alerts will be sent automatically when you start the timer."
    })
  }

  const getIconForType = (type: string) => {
    switch(type) {
        case 'encouragement': return '😊';
        case 'warning': return '⚠️';
        case 'info': return 'ℹ️';
        default: return '💬';
    }
  }

  return (
    <Card data-testid="smart-alerts-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <FileClock />
            AI-Generated Smart Alerts
        </CardTitle>
        <CardDescription>
            Automatically generate a schedule of timed alerts to keep speakers on track.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label
                    htmlFor="alert-duration"
                    className="mb-2 block text-sm font-medium text-muted-foreground"
                >
                    Total Duration (mins)
                </label>
                <Input
                    id="alert-duration"
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value, 10) || 0)}
                    placeholder="e.g., 45"
                />
            </div>
             <div>
                <label
                    htmlFor="alert-speakers"
                    className="mb-2 block text-sm font-medium text-muted-foreground"
                >
                    Number of Speakers
                </label>
                <Input
                    id="alert-speakers"
                    type="number"
                    value={speakers}
                    onChange={(e) => setSpeakers(parseInt(e.target.value, 10) || 0)}
                    placeholder="e.g., 3"
                />
            </div>
        </div>
        <Button onClick={handleGenerateAlerts} disabled={isLoading} className="w-full">
            {isLoading ? <Loader className="mr-2 animate-spin" /> : null}
            Generate Schedule
        </Button>
        {generatedAlerts && (
            <div className="space-y-3 pt-4">
                 <h4 className="text-sm font-medium text-muted-foreground">Generated Alert Schedule</h4>
                 <div className="space-y-2 rounded-lg border p-3 max-h-60 overflow-y-auto">
                 {generatedAlerts.sort((a,b) => a.time - b.time).map((alert, index) => (
                    <div key={index} className="flex items-start gap-3">
                        <div className="flex h-8 w-16 flex-shrink-0 items-center justify-center rounded-md bg-secondary text-sm font-mono">
                           {formatTime(alert.time)}
                        </div>
                        <div className="flex-grow rounded-md bg-secondary/50 p-2 text-sm">
                            <span className="mr-2">{getIconForType(alert.type)}</span>
                            {alert.message}
                        </div>
                    </div>
                 ))}
                 </div>
                 <Button onClick={handleLoadSchedule} className="w-full">
                    <ListPlus className="mr-2" /> Load Schedule into Timer
                 </Button>
            </div>
        )}
      </CardContent>
    </Card>
  )
}

function AudienceQuestionsCard() {
    const { audienceQuestions, updateAudienceQuestionStatus, sendAudienceQuestionMessage } = useTimer();
    const { canUseAi } = usePlanGate();
    const { toast } = useToast();
    const [approving, setApproving] = useState<number | null>(null);

    const handleApprove = async (question: AudienceQuestion) => {
        setApproving(question.id);
        try {
            if (canUseAi) {
                const moderationResult = await moderateMessage({ message: question.text });
                if (moderationResult.isSafe) {
                    sendAudienceQuestionMessage(question.text);
                    updateAudienceQuestionStatus(question.id, 'approved');
                } else {
                    toast({
                        variant: "destructive",
                        title: "Question Blocked",
                        description: `Reason: ${moderationResult.reason}`,
                    });
                    updateAudienceQuestionStatus(question.id, 'dismissed');
                }
            } else {
                sendAudienceQuestionMessage(question.text);
                updateAudienceQuestionStatus(question.id, 'approved');
            }
        } catch (error: any) {
            console.error("Error approving question:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Could not approve question. Please try again.",
            });
        } finally {
            setApproving(null);
        }
    };
    
    const handleDismiss = (id: number) => {
        updateAudienceQuestionStatus(id, 'dismissed');
    }

    const handleRestore = (id: number) => {
        updateAudienceQuestionStatus(id, 'pending');
    }
    
    const pendingQuestions = audienceQuestions.filter(q => q.status === 'pending');
    const approvedQuestions = audienceQuestions.filter(q => q.status === 'approved');
    const dismissedQuestions = audienceQuestions.filter(q => q.status === 'dismissed');

    const QuestionItem = ({ question }: { question: AudienceQuestion }) => (
        <div className="p-3 rounded-lg border bg-secondary/30 space-y-3">
            <p className="text-sm">{question.text}</p>
            <div className="flex justify-end gap-2">
                {question.status === 'pending' && (
                    <>
                        <Button size="sm" variant="outline" onClick={() => handleDismiss(question.id)} disabled={approving === question.id}>
                            <ThumbsDown className="mr-2" />
                            Dismiss
                        </Button>
                        <Button size="sm" onClick={() => handleApprove(question)} disabled={approving === question.id}>
                            {approving === question.id ? <Loader className="mr-2 animate-spin" /> : <ThumbsUp className="mr-2" />}
                            Approve & Send
                        </Button>
                    </>
                )}
                 {question.status === 'approved' && (
                    <>
                        <Button size="sm" variant="outline" onClick={() => sendAudienceQuestionMessage(question.text)}>
                            <Send className="mr-2" />
                            Send Again
                        </Button>
                    </>
                )}
                {question.status === 'dismissed' && (
                     <Button size="sm" variant="outline" onClick={() => handleRestore(question.id)}>
                        <Undo2 className="mr-2" />
                        Restore
                    </Button>
                )}
            </div>
        </div>
    );

    return (
        <Card data-testid="audience-questions-card">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Users />
                    Audience Questions
                </CardTitle>
                <CardDescription>
                    Review and manage questions from the audience.
                    {canUseAi ? (
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                            <ShieldCheck className="text-green-500" /> AI Moderation is active.
                        </span>
                    ) : (
                        <span className="text-xs text-muted-foreground mt-1">
                            <Link href="/#pricing" className="underline font-medium">Upgrade to Professional</Link> to enable AI moderation.
                        </span>
                    )}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {audienceQuestions.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                        <p>No questions yet.</p>
                        <p className="text-xs">Share the Q&A link to get started.</p>
                    </div>
                ) : (
                    <Accordion type="multiple" defaultValue={['pending']} className="w-full">
                        <AccordionItem value="pending">
                            <AccordionTrigger>
                                <div className="flex items-center gap-2">
                                    <Clock />
                                    Pending ({pendingQuestions.length})
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="space-y-3 pt-3">
                                {pendingQuestions.length > 0 ? (
                                    pendingQuestions.map((q) => <QuestionItem key={q.id} question={q} />)
                                ) : (
                                    <p className="text-sm text-muted-foreground">No pending questions.</p>
                                )}
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="approved">
                             <AccordionTrigger>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="text-green-500" />
                                    Approved ({approvedQuestions.length})
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="space-y-3 pt-3">
                               {approvedQuestions.length > 0 ? (
                                    approvedQuestions.map((q) => (
                                        <QuestionItem key={q.id} question={q} />
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground">No approved questions.</p>
                                )}
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="dismissed">
                            <AccordionTrigger>
                                <div className="flex items-center gap-2">
                                    <XCircle className="text-destructive" />
                                    Dismissed ({dismissedQuestions.length})
                                </div>
                            </AccordionTrigger>
                           <AccordionContent className="space-y-3 pt-3">
                                {dismissedQuestions.length > 0 ? (
                                    dismissedQuestions.map((q) => <QuestionItem key={q.id} question={q} />)
                                ) : (
                                    <p className="text-sm text-muted-foreground">No dismissed questions.</p>
                                )}
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                )}
            </CardContent>
        </Card>
    );
}

function TeamManagementCard() {
    const { teamMembers, inviteTeamMember, updateMemberStatus, currentUser } = useTimer();
    const { canInviteAdmins, memberLimit, isStarter, isFreemium, isProfessional, isEnterprise } = usePlanGate();
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");

    const canInviteMoreMembers = (memberLimit === -1) || (teamMembers.length < memberLimit);

    const handleInvite = (e: React.FormEvent) => {
        e.preventDefault();

        if (isStarter && !canInviteMoreMembers) {
            setAlertMessage(`You have reached the ${memberLimit}-member limit for the Starter plan.`);
            setShowAlert(true);
            return;
        }

        const formData = new FormData(e.target as HTMLFormElement);
        const email = formData.get("email") as string;
        const role = formData.get("role") as TeamMember['role'];

        if (isFreemium && role === 'Admin') {
            toast({
                variant: 'destructive',
                title: 'Plan Limit',
                description: "You cannot invite another Admin on the Freemium plan."
            });
            return;
        }

        if (teamMembers.some(m => m.email.toLowerCase() === email.toLowerCase())) {
             toast({
                variant: 'destructive',
                title: 'User Already Invited',
                description: `${email} is already a member of this team.`
            });
            return;
        }

        inviteTeamMember(email, role);

        toast({
            title: "Invitation Sent!",
            description: `${email} has been invited as a ${role}.`
        });
        setOpen(false);
    }

    const resendInvitation = (email: string) => {
        toast({
            title: "Invitation Resent!",
            description: `A new invitation has been sent to ${email}.`
        });
    }

    return (
        <Card>
            <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Team Limit Reached</AlertDialogTitle>
                        <AlertDialogDescription>
                            {alertMessage} Please <Link href="/#pricing" className="font-bold underline">upgrade your plan</Link> to invite more members.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction asChild>
                            <Link href="/#pricing">Upgrade Plan</Link>
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2">
                        <Users />
                        Team Management
                    </CardTitle>
                    <CardDescription>
                        Invite and manage team members for this event.
                    </CardDescription>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <UserPlus className="mr-2" /> Invite Member
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Invite a new team member</DialogTitle>
                            <DialogDescription>
                                They will receive an email with instructions to join your team.
                            </DialogDescription>
                        </DialogHeader>
                        <form id="invite-form" onSubmit={handleInvite}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <label htmlFor="email" className="text-right">Email</label>
                                <Input id="email" name="email" type="email" placeholder="name@company.com" className="col-span-3" required />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <label htmlFor="role" className="text-right">Role</label>
                                <Select name="role" defaultValue="Speaker">
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select a role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Admin" disabled={!canInviteAdmins}>Admin (Full control)</SelectItem>
                                        <SelectItem value="Speaker">Speaker (View-only)</SelectItem>
                                        <SelectItem value="Viewer">Viewer (Display mode)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {isFreemium && (
                                <Alert variant="default" className="col-span-4">
                                    <Info className="h-4 w-4" />
                                    <AlertDescription>
                                        Your Freemium plan only allows inviting members with 'Speaker' or 'Viewer' roles. <Link href="/#pricing" className="font-bold underline">Upgrade</Link> to unlock Admin roles.
                                    </AlertDescription>
                                </Alert>
                            )}
                            {isStarter && (
                                 <Alert variant="default" className="col-span-4">
                                    <Info className="h-4 w-4" />
                                    <AlertDescription>
                                        Your Starter plan includes up to {memberLimit} team members. ({teamMembers.length} / {memberLimit})
                                    </AlertDescription>
                                </Alert>
                            )}
                            {(isProfessional || isEnterprise) && (
                                 <Alert variant="default" className="col-span-4">
                                    <Info className="h-4 w-4" />
                                    <AlertDescription>
                                        Your plan includes unlimited team members. You currently have {teamMembers.length} members.
                                    </AlertDescription>
                                </Alert>
                            )}
                        </div>
                        </form>
                        <DialogFooter>
                            <Button type="submit" form="invite-form">
                                <Mail className="mr-2" /> Send Invitation
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {teamMembers.map((member) => (
                        <div key={member.email} className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Avatar>
                                    <AvatarImage src={member.avatar} data-ai-hint="person face" />
                                    <AvatarFallback>{member.email.charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium">{member.email === currentUser?.email ? "You" : member.name}</p>
                                    <p className="text-sm text-muted-foreground">{member.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <p className="text-sm font-medium">{member.role}</p>
                                    <Badge variant={member.status === 'Active' ? 'default' : member.status === 'Pending' ? 'secondary' : 'outline'} className={
                                        cn({
                                            'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300': member.status === 'Active',
                                            'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300': member.status === 'Pending',
                                        })
                                    }>
                                        {member.status}
                                    </Badge>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" disabled={member.email === currentUser?.email}>
                                            <MoreHorizontal />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        {member.status === 'Pending' && (
                                            <DropdownMenuItem onClick={() => resendInvitation(member.email)}>
                                                <Send className="mr-2"/> Resend Invitation
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuItem onClick={() => updateMemberStatus(member.email, member.status === 'Active' ? 'Inactive' : 'Active')}>
                                            <Check className="mr-2"/> Mark as {member.status === 'Active' ? 'Inactive' : 'Active'}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="text-destructive">
                                            <ThumbsDown className="mr-2"/> Remove Member
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

function ChangePasswordDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
    const { toast } = useToast();
    const { firebaseServices } = useTimer();
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters long.");
            return;
        }
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setIsLoading(true);

        if (!firebaseServices) {
            setError("Firebase not initialized correctly.");
            setIsLoading(false);
            return;
        }

        const user = firebaseServices.auth.currentUser;
        if (user) {
            try {
                await updatePassword(user, newPassword);
                toast({
                    title: "Password Updated",
                    description: "Your password has been changed successfully.",
                });
                setNewPassword("");
                setConfirmPassword("");
                onOpenChange(false);
            } catch (err: any) {
                console.error("Password update error:", err);
                setError(err.message);
                toast({
                    variant: "destructive",
                    title: "Update Failed",
                    description: "Could not update password. You may need to sign in again.",
                });
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <KeyRound />
                        Change Password
                    </DialogTitle>
                    <DialogDescription>
                        Enter a new password for your account below.
                    </DialogDescription>
                </DialogHeader>
                <form id="change-password-form" onSubmit={handleChangePassword}>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <label htmlFor="new-password">New Password</label>
                            <Input
                                id="new-password"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="confirm-password">Confirm New Password</label>
                            <Input
                                id="confirm-password"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                        {error && <p className="text-sm text-destructive">{error}</p>}
                    </div>
                </form>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button type="submit" form="change-password-form" disabled={isLoading}>
                        {isLoading && <Loader className="mr-2 animate-spin" />}
                        Update Password
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function CustomBrandingCard() {
    const { customLogo, setCustomLogo } = useTimer();
    const { canUploadLogo } = usePlanGate();
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!canUploadLogo) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ImageIcon />
                        Custom Branding
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center text-muted-foreground p-4 bg-secondary rounded-lg">
                        <p>This feature is available on the Enterprise plan.</p>
                        <Button asChild variant="link" className="p-0 h-auto">
                            <Link href="/#pricing">Upgrade to remove branding</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > 1024 * 1024) { // 1MB limit
                toast({
                    variant: 'destructive',
                    title: 'File Too Large',
                    description: 'Please upload an image smaller than 1MB.',
                });
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result as string;
                setCustomLogo(result);
                 toast({
                    title: 'Logo Updated!',
                    description: 'Your new logo has been saved.',
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveLogo = () => {
        setCustomLogo(null);
        toast({
            title: 'Logo Removed',
            description: 'Branding has been reset to default.',
        });
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ImageIcon />
                    Custom Branding
                </CardTitle>
                <CardDescription>
                    Upload your company logo to be displayed on speaker and participant views.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="aspect-video w-full rounded-md border-2 border-dashed bg-secondary flex items-center justify-center">
                    {customLogo ? (
                        <Image src={customLogo} alt="Custom Logo Preview" width={200} height={100} className="object-contain max-h-full max-w-full" />
                    ) : (
                        <p className="text-muted-foreground text-sm">No logo uploaded</p>
                    )}
                </div>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/png, image/jpeg, image/svg+xml"
                    className="hidden"
                />
                 <div className="flex gap-2">
                    <Button onClick={() => fileInputRef.current?.click()} className="w-full">
                        <Upload className="mr-2"/> Upload Logo
                    </Button>
                    {customLogo && (
                        <Button onClick={handleRemoveLogo} variant="destructive" className="w-full">
                            <Trash2 className="mr-2"/> Remove Logo
                        </Button>
                    )}
                 </div>
            </CardContent>
        </Card>
    )
}

function AiAssistantCard() {
  const { toast } = useToast();
  const { canUseAi, canUseTts } = usePlanGate();
  const [topic, setTopic] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [speechResult, setSpeechResult] = useState<GenerateSpeechOutput | null>(null);
  const [imageResult, setImageResult] = useState<GenerateImageOutput | null>(null);
  const [audioResult, setAudioResult] = useState<GenerateSpeechAudioOutput | null>(null);

  if (!canUseAi) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Sparkles />
                    AI Presentation Assistant
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-center text-muted-foreground p-4 bg-secondary rounded-lg">
                    <p>This feature is available on Professional and Enterprise plans.</p>
                    <Button asChild variant="link" className="p-0 h-auto">
                        <Link href="/#pricing">Upgrade to use the AI Assistant</Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
  }

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast({ variant: 'destructive', title: 'Invalid Input', description: 'Please enter a topic for your presentation.' });
      return;
    }
    setIsLoading(true);
    setSpeechResult(null);
    setImageResult(null);
    setAudioResult(null);

    try {
      const [speech, image] = await Promise.all([
        generateSpeech({ topic }),
        generateImage({ topic })
      ]);
      setSpeechResult(speech);
      setImageResult(image);
    } catch (error) {
      console.error("Error generating AI content:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not generate content. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateAudio = async () => {
    if (!speechResult) return;
    setIsGeneratingAudio(true);
    setAudioResult(null);
    
    try {
        const fullText = `${speechResult.title}. ${speechResult.openingStatement}. ${speechResult.outline.join('. ')}`;
        const result = await generateSpeechAudio({ text: fullText });
        setAudioResult(result);
    } catch (error) {
         console.error("Error generating audio:", error);
         toast({ variant: 'destructive', title: 'Audio Error', description: 'Could not generate audio. Please try again.' });
    } finally {
        setIsGeneratingAudio(false);
    }
  };

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard!", description: `${fieldName} has been copied.` });
  };
  
  const downloadImage = () => {
    if (imageResult?.imageUrl) {
        const link = document.createElement('a');
        link.href = imageResult.imageUrl;
        link.download = `presentation-background-${topic.replace(/\s+/g, '-').toLowerCase()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  }


  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles />
          AI Presentation Assistant
        </CardTitle>
        <CardDescription>
          Get a head start. Enter a topic and let AI create a title, outline, opening statement, and a background image.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label htmlFor="speech-topic" className="mb-2 block text-sm font-medium text-muted-foreground">
            Presentation Topic
          </label>
          <Textarea
            id="speech-topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., The future of renewable energy"
            rows={2}
          />
        </div>
        <Button onClick={handleGenerate} disabled={isLoading} className="w-full">
          {isLoading ? <Loader className="mr-2 animate-spin" /> : <Sparkles className="mr-2" />}
          Generate All Content
        </Button>
        
        {isLoading && (
            <div className="text-center text-muted-foreground py-4">
                <p>Generating content... this may take a moment.</p>
            </div>
        )}

        {(speechResult || imageResult) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
            {speechResult && (
                <div className="space-y-6">
                    <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <h4 className="font-semibold text-muted-foreground">Generated Title</h4>
                        <Button variant="ghost" size="icon" onClick={() => copyToClipboard(speechResult.title, 'Title')}>
                            <ClipboardCopy />
                        </Button>
                    </div>
                    <p className="p-3 rounded-md bg-secondary text-lg font-bold">{speechResult.title}</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <h4 className="font-semibold text-muted-foreground">Opening Statement</h4>
                            <Button variant="ghost" size="icon" onClick={() => copyToClipboard(speechResult.openingStatement, 'Opening Statement')}>
                                <ClipboardCopy />
                            </Button>
                        </div>
                    <p className="p-3 rounded-md bg-secondary italic">"{speechResult.openingStatement}"</p>
                    </div>
                    <div className="space-y-2">
                    <div className="flex justify-between items-center">
                            <h4 className="font-semibold text-muted-foreground">Presentation Outline</h4>
                            <Button variant="ghost" size="icon" onClick={() => copyToClipboard(speechResult.outline.join('\n'), 'Outline')}>
                                <ClipboardCopy />
                            </Button>
                        </div>
                    <ul className="space-y-2 p-3 rounded-md bg-secondary list-disc list-inside">
                        {speechResult.outline.map((point, index) => (
                        <li key={index}>{point}</li>
                        ))}
                    </ul>
                    </div>
                    <div>
                        <Button onClick={handleGenerateAudio} disabled={isGeneratingAudio || !canUseTts} className="w-full">
                            {isGeneratingAudio ? <Loader className="mr-2 animate-spin" /> : <Volume2 className="mr-2" />}
                            {isGeneratingAudio ? "Generating Audio..." : "Generate Audio (Enterprise Only)"}
                        </Button>
                        {!canUseTts && (
                            <p className="text-xs text-center text-muted-foreground mt-2">
                                <Link href="/#pricing" className="underline font-medium">Upgrade to Enterprise</Link> to unlock Text-to-Speech.
                            </p>
                        )}
                        {audioResult && canUseTts && (
                            <div className="mt-4">
                                <audio controls className="w-full">
                                    <source src={audioResult.audioUrl} type="audio/wav" />
                                    Your browser does not support the audio element.
                                </audio>
                            </div>
                        )}
                    </div>
                </div>
            )}
             {imageResult && (
                <div className="space-y-2">
                    <h4 className="font-semibold text-muted-foreground">AI-Generated Image</h4>
                     <div className="aspect-video w-full rounded-md border bg-secondary flex items-center justify-center overflow-hidden">
                        <Image src={imageResult.imageUrl} alt="AI Generated Presentation Background" width={500} height={281} className="object-cover w-full h-full" />
                    </div>
                    <Button onClick={downloadImage} className="w-full" variant="outline">
                        <FileDown className="mr-2" />
                        Download Image
                    </Button>
                </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function DashboardContent() {
  useUsageReset();
  usePlanSync();
  useTimerPersistence();
  useStripeRecovery();
  
  const {
    time,
    isActive,
    toggleTimer,
    resetTimer,
    setDuration,
    theme,
    timersUsed,
    timerLimit,
    currentUser,
    logout,
  } = useTimer();

  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const { toast } = useToast();

  const handleSignOut = async () => {
    await logout();
    // The ProtectedLayout will handle the redirect.
  }

  const handleToggleTimer = () => {
    if(!isActive) { // Only when starting
        if (timerLimit !== -1 && timersUsed >= timerLimit) {
            toast({
                variant: 'destructive',
                title: 'Usage Limit Reached',
                description: 'You have used all your timers for this month. Please upgrade or buy more.',
                action: (
                    <Button variant="secondary" onClick={() => setShowPurchaseDialog(true)}>
                        Buy More Timers
                    </Button>
                )
            });
            return;
        }
    }
    toggleTimer();
  }

  const handleSetTime = (newTime: number) => {
    const clampedTime = Math.max(0, newTime);
    if (!isActive) {
      setDuration(clampedTime);
    }
  };

  const presetDurations = [300, 600, 900, 1800, 3600];

  const themeClasses = {
    Classic: "font-mono text-foreground",
    Modern: "font-headline tracking-wide text-foreground",
    Minimalist: "font-sans font-light text-foreground",
    Industrial: "font-mono uppercase text-amber-400",
  };

  const currentThemeClass = themeClasses[theme] || themeClasses.Classic;

  const isAtLimit = timerLimit !== -1 && timersUsed >= timerLimit;

  return (
    <>
      <main className="flex-1 p-4 md:p-8">
        <div className="container mx-auto">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <h1 className="font-headline text-3xl font-bold">Admin Dashboard</h1>
            <div className="flex items-center gap-4">
                <ThemeToggle />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={currentUser!.photoURL || undefined} data-ai-hint="person face" />
                                <AvatarFallback>{currentUser!.email?.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">My Account</p>
                                <p className="text-xs leading-none text-muted-foreground truncate">
                                    {currentUser!.email}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={() => setShowSettingsDialog(true)}>
                            <KeyRound className="mr-2" />
                            <span>Change Password</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={handleSignOut}>
                            <LogOut className="mr-2" />
                            <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:items-start">
            <div className="lg:col-span-2 space-y-8">
                <Card>
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
                    <div className={cn(
                    "text-8xl font-bold tracking-tighter md:text-9xl",
                    currentThemeClass
                    )}>
                    {formatTime(time)}
                    </div>
                    <div className="flex w-full max-w-sm items-center justify-center space-x-4">
                    <Button
                        onClick={handleToggleTimer}
                        size="lg"
                        className="w-full"
                        disabled={isAtLimit && !isActive}
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
                <AiAssistantCard />
                <LiveMessagingCard />
                <AudienceQuestionsCard />
                <TeamManagementCard />
                <AnalyticsCard />
            </div>

            <div className="space-y-8 lg:col-span-1">
                <CurrentPlanCard />
                <CustomBrandingCard />
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
                <SmartAlertsCard />
                <ThemeSelectorCard />
                <DeviceConnectionCard />
            </div>
          </div>
        </div>
      </main>
      <PurchaseTimersDialog
        open={showPurchaseDialog}
        onOpenChange={setShowPurchaseDialog}
      />
      <ChangePasswordDialog
        open={showSettingsDialog}
        onOpenChange={setShowSettingsDialog}
      />
    </>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedLayout>
      <DashboardContent />
    </ProtectedLayout>
  )
}


