import Link from "next/link";
import { SkyBackdrop } from "./SkyBackdrop";

export function TerminalCTA() {
  return (
    <section id="contact" className="relative overflow-hidden py-24 sm:py-36 border-b border-[#ededed]/60">
      {/* Dynamic CTA Sky & Clouds */}
      <SkyBackdrop variant="cta" />

      <div className="mx-auto max-w-[1360px] px-6 sm:px-10">
        <div className="mx-auto max-w-3xl text-center">
          {/* Tag Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/90 px-3.5 py-1.5 text-xs font-mono text-[#404040] shadow-2xs backdrop-blur-md mb-4">
            <span className="h-2 w-2 rounded-full bg-[#10b981]" />
            <span>[ ready to start? ]</span>
          </div>

          {/* Headline */}
          <h2 className="font-display text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-[#181818] leading-[1.1]">
            Start proving your <br />
            <span className="text-[#059669]">income today</span>
          </h2>

          <p className="mt-6 text-sm sm:text-base md:text-lg leading-relaxed text-[#525252] max-w-2xl mx-auto">
            Turn private earnings into unforgeable claims in seconds. Prove, verify, and underwrite faster
            with zero-knowledge workflows designed for modern earners.
          </p>

          {/* 2 Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
            <Link
              href="/app"
              className="inline-flex items-center justify-center rounded-xl bg-[#181818] px-6 py-3.5 text-xs sm:text-sm font-medium text-white transition-all hover:bg-[#2b2b2b] shadow-md active:scale-95 gap-2"
            >
              <span>Launch Earner Portal</span>
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
            <Link
              href="/payer"
              className="inline-flex items-center justify-center rounded-xl border border-[#ededed] bg-white/95 px-6 py-3.5 text-xs sm:text-sm font-medium text-[#181818] transition-all hover:bg-[#f6f6f6] shadow-xs active:scale-95"
            >
              Try Demo
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

