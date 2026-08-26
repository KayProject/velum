import Link from "next/link";

export function TerminalCTA() {
  return (
    <section className="relative overflow-hidden py-20 md:py-28 bg-[#111827] text-white">
      {/* Subtle Glow & Matrix Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-20" />
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-[#10b981]/15 blur-3xl" />

      <div className="relative mx-auto max-w-[1360px] px-6">
        <div className="mx-auto max-w-3xl text-center">
          <span className="font-mono text-xs font-semibold uppercase tracking-widest text-[#6ee7b7] bg-[#064e3b]/60 border border-[#059669] px-3 py-1 rounded-full">
            [ ready to start? ]
          </span>

          <h2 className="mt-6 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
            Prove your income. <br />
            <span className="text-[#10b981]">Reveal nothing else.</span>
          </h2>

          <p className="mt-4 text-base text-[#9ca3af]">
            Velum gives earners, DAOs, and underwriters mathematical certainty with zero custody,
            zero data leaks, and instant browser verification.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/app"
              className="inline-flex items-center gap-2 rounded-full bg-[#10b981] px-6 py-3.5 text-sm font-semibold text-[#111827] transition-all hover:bg-[#34d399] shadow-lg shadow-[#10b981]/25 hover:shadow-xl hover:shadow-[#10b981]/35 active:scale-95"
            >
              <span>Launch Earner App</span>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>

            <Link
              href="/payer"
              className="inline-flex items-center gap-2 rounded-full border border-[#374151] bg-[#1f2937] px-6 py-3.5 text-sm font-semibold text-white transition-all hover:border-[#6b7280] hover:bg-[#374151] active:scale-95"
            >
              <span>Payer Portal</span>
            </Link>
          </div>
        </div>

        {/* Terminal Execution Card */}
        <div className="mt-14 mx-auto max-w-3xl overflow-hidden rounded-2xl border border-[#374151] bg-[#0d1117] shadow-2xl">
          {/* Terminal Window Bar */}
          <div className="flex items-center justify-between border-b border-[#21262d] bg-[#161b22] px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-[#ef4444]/80" />
              <span className="h-3 w-3 rounded-full bg-[#eab308]/80" />
              <span className="h-3 w-3 rounded-full bg-[#10b981]/80" />
              <span className="ml-2 font-mono text-xs text-[#8b949e]">
                velum_virtual_block_circuit
              </span>
            </div>
            <span className="font-mono text-[10px] text-[#58a6ff]">STRK20-PROVER</span>
          </div>

          {/* Terminal Content */}
          <div className="p-6 font-mono text-xs leading-relaxed space-y-2 text-[#c9d1d9]">
            <div className="text-[#8b949e]">proof_request:</div>
            <div className="text-[#7ee787] pl-4">&gt; Payer: 0x040337b1af3c66...812a [Acme DAO]</div>
            <div className="text-[#7ee787] pl-4">&gt; Threshold: &gt;= ₦4,200,000 (2026-Q1)</div>
            <div className="text-[#7ee787] pl-4">&gt; Verifier: 0x7a81...b201 [Meridian Lease]</div>
            <div className="text-[#8b949e] pt-2">processing client virtual block...</div>
            <div className="text-[#79c0ff] pl-4">→ verifying payer signature: VALID ✓</div>
            <div className="text-[#79c0ff] pl-4">→ deriving identity anchor: 0x4892c9...b110</div>
            <div className="text-[#79c0ff] pl-4">→ private sum aggregation: CONFIDENTIAL</div>
            <div className="text-[#79c0ff] pl-4">→ evaluating threshold predicate: TRUE ✓</div>
            <div className="text-[#8b949e] pt-2">output:</div>
            <div className="text-[#ecfdf5] font-semibold pl-4">+ status: VALIDATED_THRESHOLD_MET ✓</div>
            <div className="text-[#a7f3d0] pl-4">+ claim_token: 0x93bf4012...8e4a (Single-Use)</div>
            <div className="text-[#6ee7b7] pt-2 font-bold">status: proof ready for verifier ✓</div>
          </div>
        </div>
      </div>
    </section>
  );
}
