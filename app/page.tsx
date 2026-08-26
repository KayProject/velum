import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { TrustBar } from "./components/TrustBar";
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
    <div className="min-h-screen bg-[#fafafa] flex flex-col justify-between">
      <Navbar />
      <main>
        <Hero />
        <TrustBar />
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
