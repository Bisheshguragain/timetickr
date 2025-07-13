
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { TimerDemo } from "./timer-demo";

export function Hero() {

  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
      >
        <div className="absolute inset-0 bg-background" />
        <div className="absolute inset-x-0 top-0 h-[800px] bg-[radial-gradient(circle_800px_at_50%_200px,hsl(var(--primary)/0.1),transparent)]"></div>
      </div>
      <div className="container">
        <div className="flex flex-col items-center">
            <div className="max-w-3xl text-center">
              <h1 className="mt-2 font-headline text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl">
                Professional Event Timers for Flawless Presentations
              </h1>
              <p className="mt-6 text-lg text-foreground/80">
                TimeTickR helps event professionals manage time effectively with beautiful, customizable countdown timers that work seamlessly across all devices.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button asChild size="lg" className="font-semibold w-full sm:w-auto">
                  <Link href="/dashboard">Get Started Free <ArrowRight className="ml-2 h-5 w-5" /></Link>
                </Button>
                 <Button asChild size="lg" variant="outline" className="font-semibold w-full sm:w-auto">
                  <Link href="#features">Learn More</Link>
                </Button>
              </div>
            </div>
            <div className="mt-20 w-full max-w-5xl">
              <TimerDemo />
            </div>
        </div>
      </div>
    </section>
  );
}
