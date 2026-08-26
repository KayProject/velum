import Link from "next/link";
import { ProofSimulator } from "./ProofSimulator";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-28 pb-16 sm:pt-36 sm:pb-24 border-b border-[#ededed]">
      {/* Background Grid Pattern (Verseo exact style) */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#ededed_1px,transparent_1px),linear-gradient(to_bottom,#ededed_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-50" />

      <div className="mx-auto max-w-[1360px] px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          {/* Category Tag (Verseo exact bracketed pill style) */}
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#ededed] bg-[#f6f6f6] px-3.5 py-1 text-xs font-mono text-[#686868] shadow-2xs">
            <span className="text-[#858585]">[</span>
            <span className="text-[#181818] font-medium">STRK20 Zero-Knowledge Proof Layer</span>
            <span className="text-[#858585]">]</span>
          </div>

          {/* Main Title (Verseo exact two-line display typography) */}
          <h1 className="mt-6 font-display text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-[#181818]">
            Prove what matters. <br />
            <span className="text-[#858585] font-normal">Reveal nothing else.</span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-sm sm:text-base md:text-lg leading-relaxed text-[#686868] max-w-2xl mx-auto">
            Velum turns private salaries and shielded payments into unforgeable income claims for
            landlords, lenders, and visa officers — without disclosing your balance or transaction history.
          </p>

          {/* CTAs (Verseo exact button sizes and styles) */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/app"
              className="inline-flex items-center justify-center rounded-full bg-[#181818] px-6 py-3 text-xs sm:text-sm font-medium text-white transition-all hover:bg-[#2b2b2b] hover:shadow-sm active:scale-95"
            >
              Get Started
            </Link>
            <Link
              href="/payer"
              className="inline-flex items-center justify-center rounded-full border border-[#ededed] bg-white px-6 py-3 text-xs sm:text-sm font-medium text-[#181818] transition-all hover:bg-[#f6f6f6] active:scale-95 shadow-2xs"
            >
              Try Demo
            </Link>
          </div>

          <p className="mt-4 font-mono text-[11px] text-[#858585]">
            Verifiers do not need a crypto wallet, account, or install.
          </p>
        </div>

        {/* Hero Interactive Proof Engine Card */}
        <div className="relative mt-12 sm:mt-16">
          <ProofSimulator />
        </div>
      </div>
    </section>
  );
}
