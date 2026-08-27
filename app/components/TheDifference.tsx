export function TheDifference() {
  return (
    <section id="the-difference" className="py-20 sm:py-28 border-b border-[#ededed]/60 bg-transparent">
      <div className="mx-auto max-w-[1360px] px-6 sm:px-10">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center text-xs font-mono text-[#686868] mb-4">
            <span>[ the difference ]</span>
          </div>

          <h2 className="font-display text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#181818] leading-[1.15]">
            Where disclosure friction <br />
            <span className="text-[#059669]">ends, clarity begins</span>
          </h2>

          <p className="mt-4 text-sm sm:text-base text-[#686868] max-w-xl mx-auto">
            See how zero-knowledge proofs replace slow, manual bank statement disclosures with fast, structured income verification.
          </p>
        </div>

        {/* 3 Visual Cards */}
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {/* Card 1: Fragmented Disclosure */}
          <div className="flex flex-col justify-between rounded-2xl border border-[#ededed] bg-white p-7 sm:p-8 shadow-xs hover:border-[#d4d4d8] transition-all">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#fee2e2] bg-[#fef2f2] text-[#ef4444] text-xs font-bold">
                  ✕
                </div>
                <span className="font-mono text-[10px] uppercase font-semibold text-[#ef4444] bg-[#fef2f2] px-2 py-0.5 rounded border border-[#fee2e2]">
                  Exposed
                </span>
              </div>

              <h3 className="font-display text-lg font-bold text-[#181818]">
                Fragmented disclosure
              </h3>

              {/* Visual Mockup: Redacted Bank Statement */}
              <div className="my-5 rounded-xl border border-[#fee2e2]/60 bg-[#fafafa] p-3.5 space-y-2 font-mono text-[11px]">
                <div className="flex justify-between items-center text-[#991b1b] bg-[#fee2e2]/40 px-2 py-1 rounded">
                  <span>📄 bank_stmt_q1.pdf</span>
                  <span className="text-[10px]">62 Pages</span>
                </div>
                <div className="space-y-1.5 pt-1 text-[#71717a]">
                  <div className="flex justify-between text-[10px]">
                    <span>Total Balances Exposed</span>
                    <span className="text-[#ef4444] font-bold">₦14,850,200</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span>Medical & Personal</span>
                    <span className="text-[#ef4444]">Unredacted</span>
                  </div>
                </div>
              </div>

              <ul className="mt-4 space-y-2.5 text-xs text-[#686868]">
                <li className="flex items-start gap-2">
                  <span className="text-[#ef4444] font-bold">—</span>
                  <span>60-page PDF bank statements handed over for a simple check</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#ef4444] font-bold">—</span>
                  <span>Total savings, balances, and net worth exposed to agents</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Card 2: Manual Workflows */}
          <div className="flex flex-col justify-between rounded-2xl border border-[#ededed] bg-white p-7 sm:p-8 shadow-xs hover:border-[#d4d4d8] transition-all">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#fef3c7] bg-[#fffbeb] text-[#d97706] text-xs font-bold">
                  ⏳
                </div>
                <span className="font-mono text-[10px] uppercase font-semibold text-[#d97706] bg-[#fffbeb] px-2 py-0.5 rounded border border-[#fef3c7]">
                  3–5 Days
                </span>
              </div>

              <h3 className="font-display text-lg font-bold text-[#181818]">
                Manual workflows
              </h3>

              {/* Visual Mockup: Underwriting Queue */}
              <div className="my-5 rounded-xl border border-[#fef3c7]/60 bg-[#fafafa] p-3.5 space-y-2 font-mono text-[11px]">
                <div className="flex justify-between items-center text-[#92400e] bg-[#fef3c7]/40 px-2 py-1 rounded">
                  <span>⏱️ Underwriting Queue</span>
                  <span className="text-[10px]">Pending Review</span>
                </div>
                <div className="space-y-1.5 pt-1 text-[#71717a]">
                  <div className="flex justify-between text-[10px]">
                    <span>Third-Party Retention</span>
                    <span className="text-[#d97706]">Permanent Plaintext</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span>Compliance Risk</span>
                    <span className="text-[#d97706]">High Liability</span>
                  </div>
                </div>
              </div>

              <ul className="mt-4 space-y-2.5 text-xs text-[#686868]">
                <li className="flex items-start gap-2">
                  <span className="text-[#d97706] font-bold">—</span>
                  <span>3 to 5 business days spent reviewing unredacted paper files</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#d97706] font-bold">—</span>
                  <span>Permanent unencrypted copies stored on third-party servers</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Card 3: Zero-knowledge Proof Flow */}
          <div className="flex flex-col justify-between rounded-2xl border-2 border-[#10b981]/40 bg-white p-7 sm:p-8 shadow-sm relative ring-1 ring-[#10b981]/15">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#181818] text-white text-xs font-bold">
                  ✓
                </div>
                <span className="font-mono text-[10px] uppercase font-semibold text-[#047857] bg-[#ecfdf5] px-2 py-0.5 rounded-full border border-[#a7f3d0]">
                  🟢 Instant & Zero-Leak
                </span>
              </div>

              <h3 className="font-display text-lg font-bold text-[#181818]">
                Zero-knowledge proof flow
              </h3>

              {/* Visual Mockup: ZK Assertion Card */}
              <div className="my-5 rounded-xl border border-[#a7f3d0] bg-[#f0fdf4]/60 p-3.5 space-y-2 font-mono text-[11px]">
                <div className="flex justify-between items-center text-[#065f46] bg-[#dcfce7] px-2 py-1 rounded">
                  <span>⚡ Cairo 2.0 ZK-Assertion</span>
                  <span className="text-[10px]">0ms Gas</span>
                </div>
                <div className="space-y-1.5 pt-1 text-[#047857]">
                  <div className="flex justify-between text-[10px]">
                    <span>Threshold Proof</span>
                    <span className="font-bold text-[#059669]">✓ Satisfied</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span>Identity Correlation</span>
                    <span className="font-bold text-[#059669]">0% Unlinkable</span>
                  </div>
                </div>
              </div>

              <ul className="mt-4 space-y-2.5 text-xs text-[#525252]">
                <li className="flex items-start gap-2">
                  <span className="text-[#059669] font-bold">✦</span>
                  <span>Generate structured threshold claims in seconds</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#059669] font-bold">✦</span>
                  <span>Unlinkable identity anchors scoped per verifier</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

