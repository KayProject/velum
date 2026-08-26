import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { TrustBar } from "./components/TrustBar";
import { TheDifference } from "./components/TheDifference";
import { Features } from "./components/Features";
import { UseCases } from "./components/UseCases";
import { HowItWorks } from "./components/HowItWorks";
import { FaqAccordion } from "./components/FaqAccordion";
import { TerminalCTA } from "./components/TerminalCTA";
import { Footer } from "./components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-[#181818] flex flex-col justify-between selection:bg-[#10b981]/20 selection:text-[#065f46]">
      <Navbar />
      <main className="w-full">
        <Hero />
        <TrustBar />
        <TheDifference />
        <Features />
        <UseCases />
        <HowItWorks />
        <FaqAccordion />
        <TerminalCTA />
      </main>
      <Footer />
    </div>
  );
}
