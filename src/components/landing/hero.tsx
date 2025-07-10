import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative py-20 md:py-32">
       <div
        aria-hidden="true"
        className="absolute inset-0 top-0 -z-10 h-full w-full bg-background"
      >
        <div className="absolute bottom-auto left-auto right-0 top-0 h-[500px] w-[500px] -translate-x-[30%] translate-y-[20%] rounded-full bg-[rgba(37,99,235,0.5)] opacity-50 blur-[80px]"></div>
      </div>
      <div className="container text-center">
        <div className="mx-auto max-w-4xl">
          <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            Never Miss a Cue.
            <br />
            <span className="text-primary">Perfectly Timed Events.</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-foreground/80">
            Control countdown timers from any device while your speakers see a
            clean, distraction-free display. TimeTickR is the ultimate tool for
            flawless presentations, conferences, and live events.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button asChild size="lg">
              <Link href="#demo">Try the Demo</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="#pricing">See Pricing</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
