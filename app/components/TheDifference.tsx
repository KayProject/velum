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
            ends, clarity begins
          </h2>

          <p className="mt-4 text-sm sm:text-base text-[#686868] max-w-xl mx-auto">
            See how zero-knowledge proofs replace slow, manual bank statement disclosures with fast, structured income verification.
          </p>
        </div>

        {/* 3 Cards (Verseo Image 2 Exact Replica) */}
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {/* Card 1 */}
          <div className="flex flex-col justify-between rounded-2xl border border-[#ededed] bg-white p-7 sm:p-8 shadow-xs">
            <div>
              {/* Top square with X */}
              <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#ededed] bg-[#f6f6f6] text-[#858585] text-xs font-bold mb-8">
                ✕
              </div>

              <h3 className="font-display text-lg font-bold text-[#181818]">
                Fragmented disclosure
              </h3>

              <ul className="mt-6 space-y-3.5 text-xs sm:text-sm text-[#686868]">
                <li className="flex items-start gap-2">
                  <span className="text-[#858585] font-bold">—</span>
                  <span>60-page PDF bank statements handed over for a simple check</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#858585] font-bold">—</span>
                  <span>Total savings, balances, and net worth exposed to agents</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#858585] font-bold">—</span>
                  <span>Unrelated personal, family, and medical spending visible</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Card 2 */}
          <div className="flex flex-col justify-between rounded-2xl border border-[#ededed] bg-white p-7 sm:p-8 shadow-xs">
            <div>
              {/* Top square with X */}
              <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#ededed] bg-[#f6f6f6] text-[#858585] text-xs font-bold mb-8">
                ✕
              </div>

              <h3 className="font-display text-lg font-bold text-[#181818]">
                Manual workflows
              </h3>

              <ul className="mt-6 space-y-3.5 text-xs sm:text-sm text-[#686868]">
                <li className="flex items-start gap-2">
                  <span className="text-[#858585] font-bold">—</span>
                  <span>3 to 5 business days spent reviewing unredacted paper files</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#858585] font-bold">—</span>
                  <span>Permanent unencrypted copies stored on third-party servers</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#858585] font-bold">—</span>
                  <span>High compliance liability and data breach exposure</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Card 3 (Active / ZK Flow) */}
          <div className="flex flex-col justify-between rounded-2xl border border-[#ededed] bg-white p-7 sm:p-8 shadow-xs">
            <div>
              {/* Top solid black square with checkmark */}
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#181818] text-white text-xs font-bold mb-8">
                ✓
              </div>

              <h3 className="font-display text-lg font-bold text-[#181818]">
                Zero-knowledge proof flow
              </h3>

              <ul className="mt-6 space-y-3.5 text-xs sm:text-sm text-[#686868]">
                <li className="flex items-start gap-2">
                  <span className="text-[#181818] font-bold">✦</span>
                  <span>Generate structured threshold claims in seconds</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#181818] font-bold">✦</span>
                  <span>Unlinkable identity anchors scoped per verifier</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#181818] font-bold">✦</span>
                  <span>100% financial privacy retained with zero custody</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
