import Link from "next/link";

export function TerminalCTA() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-28 bg-[#f9f9f9] border-b border-[#ededed]">
      <div className="mx-auto max-w-[1360px] px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          {/* Tag Pill */}
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#ededed] bg-[#f6f6f6] px-3.5 py-1 text-xs font-mono text-[#686868]">
            <span>[</span>
            <span className="text-[#181818] font-medium">ready to start?</span>
            <span>]</span>
          </div>

          {/* Heading */}
          <h2 className="mt-6 font-display text-3xl sm:text-5xl font-bold tracking-tight text-[#181818]">
            Start proving your <br className="hidden sm:inline" />
            income today
          </h2>

          <p className="mt-4 text-sm sm:text-base text-[#686868] max-w-xl mx-auto">
            Turn private earnings into unforgeable claims in seconds. Prove, verify, and underwrite faster
            with zero-knowledge workflows designed for modern earners.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/app"
              className="inline-flex items-center justify-center rounded-full bg-[#181818] px-6 py-3 text-xs sm:text-sm font-medium text-white transition-all hover:bg-[#2b2b2b] shadow-2xs active:scale-95"
            >
              Get Started
            </Link>
            <Link
              href="/payer"
              className="inline-flex items-center justify-center rounded-full border border-[#ededed] bg-white px-6 py-3 text-xs sm:text-sm font-medium text-[#181818] transition-all hover:bg-[#f6f6f6] shadow-2xs active:scale-95"
            >
              Payer Console
            </Link>
          </div>
        </div>

        {/* Verseo Exact Terminal Code Execution Box */}
        <div className="mt-14 mx-auto max-w-2xl rounded-2xl border border-[#ededed] bg-[#181818] p-6 sm:p-8 font-mono text-xs shadow-xl text-[#f6f6f6]">
          <div className="flex items-center justify-between border-b border-[#2b2b2b] pb-4 mb-4">
            <span className="text-[#858585]">velum_terminal // strk20</span>
            <span className="h-2 w-2 rounded-full bg-[#10b981]" />
          </div>

          <div className="space-y-2.5">
            <div className="text-[#858585]">claim_request:</div>
            <div className="text-white pl-4">&gt; Prove qualifying income &gt;= ₦4,200,000 in 2026-Q1</div>
            
            <div className="text-[#858585] pt-2">processing…</div>
            <div className="text-[#10b981] pl-4">→ loading STRK20 viewing key</div>
            <div className="text-[#10b981] pl-4">→ verifying payer attestation</div>
            <div className="text-[#10b981] pl-4">→ computing virtual block aggregate</div>

            <div className="text-[#858585] pt-2">output:</div>
            <div className="text-white pl-4">+ unforgeable identity anchor</div>
            <div className="text-white pl-4">+ single-use verifier binding</div>
            <div className="text-white pl-4">+ timestamped expiration window</div>

            <div className="pt-3 border-t border-[#2b2b2b] text-[#10b981] font-bold">
              status: ready to verify ✓
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
