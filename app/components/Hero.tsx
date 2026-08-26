import Link from "next/link";
import { ProofSimulator } from "./ProofSimulator";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24">
      {/* Background Subtle Technical Grid */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40" />

      <div className="mx-auto max-w-[1360px] px-6">
        <div className="mx-auto max-w-3xl text-center">
          {/* Tag Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[#e4e4e7] bg-white px-3.5 py-1.5 shadow-2xs">
            <span className="h-2 w-2 rounded-full bg-[#10b981]" />
            <span className="font-mono text-xs font-semibold text-[#111827]">
              STRK20 Private Sprint
            </span>
            <span className="text-xs text-[#a1a1aa]">|</span>
            <span className="font-mono text-xs text-[#71717a]">
              Cairo 2.0 Proof Layer
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="mt-8 font-display text-4xl font-bold tracking-tight text-[#111827] sm:text-6xl md:text-7xl">
            Prove what matters.{" "}
            <span className="text-[#9ca3af] block sm:inline font-normal">
              Reveal nothing else.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base leading-relaxed text-[#4b5563] sm:text-lg">
            A shielded salary is an unprovable salary. Velum is the proof layer for private income:
            prove qualifying earnings to a landlord, lender, or visa officer with a single
            time-limited assertion — without disclosing your balance, transactions, or other clients.
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/app"
              className="inline-flex items-center gap-2 rounded-full bg-[#10b981] px-6 py-3.5 text-sm font-semibold text-white transition-all hover:bg-[#059669] shadow-md shadow-[#10b981]/25 hover:shadow-lg hover:shadow-[#10b981]/35 active:scale-95"
            >
              <span>Launch Earner Portal</span>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>

            <Link
              href="/payer"
              className="inline-flex items-center gap-2 rounded-full border border-[#e4e4e7] bg-white px-6 py-3.5 text-sm font-semibold text-[#111827] transition-all hover:border-[#a1a1aa] hover:bg-[#f4f4f5] shadow-2xs active:scale-95"
            >
              <span>Payer Attestations</span>
            </Link>
          </div>

          {/* Verifier Notice */}
          <p className="mt-4 font-mono text-xs text-[#9ca3af]">
            Verifiers do not need a crypto wallet, account, or install.
          </p>
        </div>

        {/* Interactive Showcase / Proof Simulator */}
        <div className="relative mt-14 sm:mt-18">
          <div className="crosshair-corner crosshair-tl">+</div>
          <div className="crosshair-corner crosshair-tr">+</div>
          <div className="crosshair-corner crosshair-bl">+</div>
          <div className="crosshair-corner crosshair-br">+</div>
          
          <ProofSimulator />
        </div>
      </div>
    </section>
  );
}
