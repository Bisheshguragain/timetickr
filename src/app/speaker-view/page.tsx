
"use client";

import React, { useEffect, useState, Suspense, useRef } from "react";
import { TimerProvider, useTimer } from "@/context/TimerContext";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { MessageSquare, X, MonitorPlay, Loader, MessageSquareQuote } from "lucide-react";
import { Logo } from "@/components/landing/logo";
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { TeamProvider, useTeam } from "@/context/TeamContext";
import { usePlanGate } from "@/hooks/use-plan-gate";

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
};

function PairingGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { setTeamId } = useTeam();
  const { isSessionFound } = useTimer();
  const searchParams = useSearchParams();
  const [isRateLimited, setIsRateLimited] = useState(false);

  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const urlCode = searchParams.get('code');

  useEffect(() => {
    if (urlCode) {
      setTeamId(urlCode);
    }
  }, [urlCode, setTeamId]);
  
  const handleRateLimit = () => {
    setIsRateLimited(true);
    setTimeout(() => {
      setIsRateLimited(false);
    }, 5000);
  };

  if (urlCode && isSessionFound) return <>{children}</>;

  if (urlCode && isSessionFound === false) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-900 p-4">
        <Card className="w-full max-w-sm">
          <CardHeader><CardTitle>Session Not Found</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-destructive">Invalid or expired code <span className="font-mono">{urlCode}</span>.</p>
            <Button onClick={() => router.push(pathname)} className="w-full">Try a different code</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (urlCode) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-900">
        <div className="flex flex-col items-center gap-4 text-white">
          <Loader className="h-12 w-12 animate-spin" />
          <p>Connecting to session <span className="font-mono">{urlCode}</span>...</p>
        </div>
      </div>
    );
  }

  const handlePair = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRateLimited) return;
    handleRateLimit();
    
    if (code.trim()) {
      router.push(`${pathname}?code=${code.trim().toUpperCase()}`);
    } else {
      setError('Please enter a pairing code.');
    }
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gray-900 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><MonitorPlay /> Pair Speaker View</CardTitle>
          <CardDescription>Enter the pairing code from your admin dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePair} className="space-y-4">
            <Input 
              placeholder="Enter pairing code..."
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="text-center text-lg font-mono tracking-widest"
              autoCapitalize="characters"
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={isRateLimited}>Connect Display</Button>
          </form>
          <p className="text-xs text-muted-foreground mt-4">
            Note: This display requires the admin dashboard to be active.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function SpeakerDisplay() {
  const {
    time,
    isFinished,
    theme,
    plan,
    adminMessage,
    audienceQuestionMessage,
    dismissAdminMessage,
    dismissAudienceQuestionMessage,
  } = useTimer();
  const { customLogo } = useTeam();
  const { isEnterprise } = usePlanGate();

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = "auto"; };
  }, []);

  const themeClasses = {
    Classic: { bg: "bg-gray-900 text-white", time: "font-mono", warningBg: "bg-yellow-600", urgentBg: "bg-orange-700", finishedBg: "bg-red-800", alert: "bg-white/90 text-black border-gray-300", logo: "text-white/50" },
    Modern: { bg: "bg-gray-900 text-white", time: "font-headline tracking-wide", warningBg: "bg-blue-800", urgentBg: "bg-purple-800", finishedBg: "bg-red-900", alert: "bg-gray-800/90 text-white border-gray-600 backdrop-blur-sm", logo: "text-white/40" },
    Minimalist: { bg: "bg-gray-100 text-gray-800", time: "font-sans font-light border-4 border-gray-200 p-8 rounded-lg", warningBg: "bg-yellow-200 border-yellow-300", urgentBg: "bg-orange-200 border-orange-300", finishedBg: "bg-red-200 border-red-300", alert: "bg-white/80 text-gray-800 border-gray-300 backdrop-blur-sm shadow-2xl", logo: "text-gray-400" },
    Industrial: { bg: "bg-gray-800 text-amber-400", time: "font-mono uppercase", warningBg: "bg-yellow-800/50", urgentBg: "bg-orange-800/60", finishedBg: "bg-red-800/70", alert: "bg-gray-900/90 text-amber-300 border-amber-900/50 backdrop-blur-sm", logo: "text-amber-400/30" },
  };

  const currentTheme = themeClasses[theme] || themeClasses.Classic;
  const safeLogo = typeof customLogo === "string" && customLogo.startsWith("data:image");

  const safeDismiss = (action: () => void) => {
    try { action(); } catch { /* no-op fallback */ }
  };

  return (
    <div className={cn("relative flex h-screen w-screen flex-col items-center justify-center transition-colors duration-500", currentTheme.bg, {
      [currentTheme.warningBg]: !isFinished && time <= 300 && time > 180,
      [currentTheme.urgentBg]: !isFinished && time <= 180 && time > 0,
      [currentTheme.finishedBg]: isFinished,
    })}>
      {adminMessage && (
        <div className="absolute top-10 left-10 z-10 max-w-lg animate-in fade-in-50 slide-in-from-top-10 duration-500">
          <Alert variant="default" className={cn("shadow-2xl", currentTheme.alert)}>
            <MessageSquare className="h-6 w-6" />
            <AlertTitle className="text-lg font-bold">Message from Admin</AlertTitle>
            <AlertDescription className="text-md">{adminMessage.text}</AlertDescription>
            <button onClick={() => safeDismiss(dismissAdminMessage)} className="absolute top-3 right-3 p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10">
              <X className="h-5 w-5"/>
            </button>
          </Alert>
        </div>
      )}

      <div className={cn("font-bold", currentTheme.time)} style={{ fontSize: "clamp(5rem, 25vw, 20rem)", lineHeight: 1 }}>
        {formatTime(time)}
      </div>

      {audienceQuestionMessage && (
        <div className="z-10 mt-8 max-w-4xl w-full px-10 animate-in fade-in-50 slide-in-from-bottom-10 duration-500">
          <Alert variant="default" className={cn("shadow-2xl", currentTheme.alert)}>
            <MessageSquareQuote className="h-6 w-6" />
            <AlertTitle className="text-xl font-bold">Audience Question</AlertTitle>
            <AlertDescription className="text-lg">{audienceQuestionMessage.text}</AlertDescription>
            <button onClick={() => safeDismiss(dismissAudienceQuestionMessage)} className="absolute top-3 right-3 p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10">
              <X className="h-5 w-5"/>
            </button>
          </Alert>
        </div>
      )}

      <div className="absolute top-4 right-5 z-20">
        {customLogo && isEnterprise && safeLogo ? (
             <Image src={customLogo} alt="Custom Event Logo" width={120} height={50} className="object-contain" />
        ) : !isEnterprise ? (
            <Logo className={currentTheme.logo}/>
        ) : null}
      </div>
    </div>
  );
}

function SpeakerViewWrapper() {
    const searchParams = useSearchParams();
    const sessionCode = searchParams.get('code');

    return (
        <TimerProvider sessionCode={sessionCode}>
            <PairingGate>
                <SpeakerDisplay />
            </PairingGate>
        </TimerProvider>
    )
}

export default function SpeakerViewPage() {
    return (
        <Suspense fallback={<div className="flex h-screen w-screen items-center justify-center bg-gray-900"><Loader className="h-12 w-12 animate-spin text-white" /></div>}>
            <TeamProvider>
                <SpeakerViewWrapper />
            </TeamProvider>
        </Suspense>
    )
}
