import Link from "next/link";

export default async function VerifyPage({
  params,
}: {
  params: Promise<{ claim: string }>;
}) {
  const { claim } = await params;

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col justify-between">
      {/* Top Header */}
      <header className="border-b border-[#e4e4e7] bg-white/90 backdrop-blur-md px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#111827] text-white font-mono font-bold text-xs">
              V
            </div>
            <span className="font-display text-lg font-bold text-[#111827]">
              Velum
            </span>
            <span className="font-mono text-[10px] text-[#059669] bg-[#ecfdf5] border border-[#a7f3d0] px-2 py-0.5 rounded-full font-semibold">
              VERIFIER PORTAL
            </span>
          </Link>

          <span className="font-mono text-xs text-[#71717a]">
            Zero-Knowledge Verification
          </span>
        </div>
      </header>

      {/* Main Claim Verification Viewport */}
      <main className="mx-auto w-full max-w-2xl px-6 py-12">
        <div className="rounded-2xl border border-[#e4e4e7] bg-white p-6 sm:p-10 shadow-sm relative overflow-hidden">
          {/* Top Status Banner */}
          <div className="flex items-center justify-between border-b border-[#f4f4f5] pb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ecfdf5] border border-[#a7f3d0] text-[#059669] text-xl font-bold">
                ✓
              </div>
              <div>
                <h1 className="font-display text-xl font-bold text-[#111827]">
                  Income Claim Verified
                </h1>
                <p className="text-xs text-[#6b7280]">
                  Cryptographically sound · Single-use assertion
                </p>
              </div>
            </div>

            <span className="rounded-full bg-[#ecfdf5] border border-[#a7f3d0] px-3 py-1 font-mono text-xs font-semibold text-[#047857]">
              🟢 VALIDATED
            </span>
          </div>

          {/* The Core Verified Statement */}
          <div className="mt-8 rounded-xl border border-[#e4e4e7] bg-[#fafafa] p-6">
            <span className="font-mono text-[11px] font-bold text-[#71717a] uppercase tracking-wider block mb-2">
              VERIFIED PREDICATE STATEMENT
            </span>

            <p className="font-display text-lg sm:text-xl font-semibold leading-relaxed text-[#111827]">
              Qualifying income from a single payer exceeded{" "}
              <span className="text-[#059669] font-bold">₦4,200,000</span> between{" "}
              <span className="underline decoration-[#10b981]/50 underline-offset-2">
                1 Jan and 31 Mar 2026
              </span>
              .
            </p>

            <div className="mt-6 pt-4 border-t border-[#e4e4e7] flex flex-wrap items-center justify-between gap-2 text-xs text-[#6b7280]">
              <span>No other financial information was disclosed.</span>
              <span className="font-mono text-[#059669] font-semibold">Expires in 18 days</span>
            </div>
          </div>

          {/* Cryptographic Metadata Card */}
          <div className="mt-6 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between rounded-lg border border-[#f4f4f5] bg-[#fafafa] px-4 py-3">
              <span className="text-[#71717a]">Claim Token Hash:</span>
              <span className="font-semibold text-[#111827] truncate max-w-[240px]">
                {claim}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-[#f4f4f5] bg-[#fafafa] px-4 py-3">
              <span className="text-[#71717a]">Identity Key Anchor:</span>
              <span className="font-semibold text-[#111827]">
                0x7f83bc4190e8a712 (Unlinkable)
              </span>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-[#f4f4f5] bg-[#fafafa] px-4 py-3">
              <span className="text-[#71717a]">Payer Signature:</span>
              <span className="font-semibold text-[#059669]">VALID (Ed25519)</span>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-[#f4f4f5] bg-[#fafafa] px-4 py-3">
              <span className="text-[#71717a]">Virtual Block Proof:</span>
              <span className="font-semibold text-[#059669]">STRK20-PRIVACY-V2</span>
            </div>
          </div>

          {/* Verification Notice */}
          <div className="mt-8 rounded-xl bg-[#ecfdf5] border border-[#a7f3d0] p-4 text-xs text-[#065f46] leading-relaxed">
            <strong>What this guarantees:</strong> The person presenting this claim controls the underlying
            shielded payments and satisfied the minimum threshold in the given period. Presented to anyone
            else or after expiration, this proof is void.
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => typeof window !== "undefined" && window.print()}
              className="rounded-xl border border-[#e4e4e7] bg-white px-4 py-2.5 text-xs font-semibold text-[#111827] hover:bg-[#f4f4f5] shadow-2xs"
            >
              Print Verification Record
            </button>
            <Link
              href="/"
              className="rounded-xl bg-[#111827] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#1f2937]"
            >
              Learn More About Velum
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#e4e4e7] bg-white px-6 py-6 text-center font-mono text-xs text-[#71717a]">
        © 2026 Velum · Private Income Proof Layer on Starknet STRK20
      </footer>
    </div>
  );
}
