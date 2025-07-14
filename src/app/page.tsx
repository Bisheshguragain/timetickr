import { Header } from "@/components/landing/header";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { Pricing } from "@/components/landing/pricing";
import { Contact } from "@/components/landing/contact";
import { Footer } from "@/components/landing/footer";
import { AiDemo } from "@/components/landing/ai-demo";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <Hero />
        <section id="features" className="py-20 md:py-28 bg-secondary/50">
          <Features />
        </section>
        <section className="py-20 md:py-28 ">
          <AiDemo />
        </section>
        <section id="pricing" className="py-20 md:py-28 bg-secondary/50">
          <Pricing />
        </section>
        <section id="contact" className="py-20 md:py-28">
          <Contact />
        </section>
      </main>
      <Footer />
    </div>
  );
}
