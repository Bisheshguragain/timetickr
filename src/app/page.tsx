import { Header } from "@/components/landing/header";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { TimerDemo } from "@/components/landing/timer-demo";
import { Pricing } from "@/components/landing/pricing";
import { Contact } from "@/components/landing/contact";
import { Footer } from "@/components/landing/footer";
import { AiDemo } from "@/components/landing/ai-demo";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <section id="features" className="py-12 md:py-24">
          <Features />
        </section>
        <section id="demo" className="py-12 md:py-24 bg-card">
          <AiDemo />
        </section>
        <section className="py-12 md:py-24">
          <TimerDemo />
        </section>
        <section id="pricing" className="py-12 md:py-24 bg-card">
          <Pricing />
        </section>
        <section id="contact" className="py-12 md:py-24">
          <Contact />
        </section>
      </main>
      <Footer />
    </div>
  );
}
