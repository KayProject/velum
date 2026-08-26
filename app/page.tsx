import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { TheDifference } from "./components/TheDifference";
import { Features } from "./components/Features";
import { UseCases } from "./components/UseCases";
import { HowItWorks } from "./components/HowItWorks";
import { ResultsMetrics } from "./components/ResultsMetrics";
import { ClaimExamples } from "./components/ClaimExamples";
import { Testimonials } from "./components/Testimonials";
import { ProtocolTiers } from "./components/ProtocolTiers";
import { FaqAccordion } from "./components/FaqAccordion";
import { TerminalCTA } from "./components/TerminalCTA";
import { Footer } from "./components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#181818] flex flex-col justify-between selection:bg-[#10b981]/20 selection:text-[#065f46]">
      <Navbar />
      <main className="w-full">
        <Hero />
        <TheDifference />
        <Features />
        <UseCases />
        <HowItWorks />
        <ResultsMetrics />
        <ClaimExamples />
        <Testimonials />
        <ProtocolTiers />
        <FaqAccordion />
        <TerminalCTA />
      </main>
      <Footer />
    </div>
  );
}
