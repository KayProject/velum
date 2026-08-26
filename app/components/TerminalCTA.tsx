import Link from "next/link";

export function TerminalCTA() {
  return (
    <section id="contact" className="relative overflow-hidden py-24 sm:py-36 border-b border-[#ededed]/60">
      {/* Cloud & Sky Background (Verseo Image 6 Exact Replica) */}
      <div 
        className="absolute inset-0 -z-10 bg-cover bg-center bg-no-repeat opacity-90"
        style={{ backgroundImage: "url('/images/clouds-bg.png')" }}
      />

      {/* Subtle overlay grid */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgba(255,255,255,0.4)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.4)_1px,transparent_1px)] bg-[size:4.5rem_4.5rem]" />

      <div className="mx-auto max-w-[1360px] px-6 sm:px-10">
        <div className="mx-auto max-w-3xl text-center">
          {/* Tag Pill */}
          <div className="inline-flex items-center text-xs font-mono text-[#686868] mb-4">
            <span>[ ready to start? ]</span>
          </div>

          {/* Headline */}
          <h2 className="font-display text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-[#181818] leading-[1.1]">
            Start proving your <br />
            income today
          </h2>

          <p className="mt-6 text-sm sm:text-base md:text-lg leading-relaxed text-[#686868] max-w-2xl mx-auto">
            Turn private earnings into unforgeable claims in seconds. Prove, verify, and underwrite faster
            with zero-knowledge workflows designed for modern earners.
          </p>

          {/* 2 Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/app"
              className="inline-flex items-center justify-center rounded-lg bg-[#181818] px-6 py-3 text-xs sm:text-sm font-medium text-white transition-all hover:bg-[#2b2b2b] shadow-sm active:scale-95"
            >
              Get Started
            </Link>
            <Link
              href="/payer"
              className="inline-flex items-center justify-center rounded-lg border border-[#ededed] bg-white px-6 py-3 text-xs sm:text-sm font-medium text-[#181818] transition-all hover:bg-[#f6f6f6] shadow-xs active:scale-95"
            >
              Try Demo
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
