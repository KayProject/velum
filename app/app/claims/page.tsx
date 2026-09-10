"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { getLocalClaims, hideLocalClaim, LocalClaim } from "@/lib/velum/store";
import { WarningCircle } from "@phosphor-icons/react";
import { AppHeader } from "@/app/components/AppHeader";
import { AppFooter } from "@/app/components/AppFooter";

export default function EarnerClaimsPage() {
  const [claimsList, setClaimsList] = useState<LocalClaim[]>([]);

  useEffect(() => {
    setClaimsList(getLocalClaims());
  }, []);

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col justify-between selection:bg-[#3b82f6]/20 selection:text-[#1e40af]">
      <AppHeader
        badge="PREPARED CLAIMS"
        sticky={false}
        rightSlot={
          <Link href="/app" className="text-xs font-semibold text-[#71717a] hover:text-[#111827]">
            ← Back to Claim Builder
          </Link>
        }
      />

      <main className="mx-auto w-full max-w-4xl px-6 py-12">
        <div className="rounded-2xl border border-[#e4e4e7] bg-white p-6 sm:p-8 shadow-sm">
          <div className="border-b border-[#f4f4f5] pb-4 mb-6">
            <h1 className="font-display text-2xl font-bold text-[#111827]">Prepared Claims (Local)</h1>
            <p className="mt-1 text-xs text-[#6b7280]">
              Claim parameters computed on the builder page and saved to your browser — Velum has no
              on-chain way to list "my claims," so this is the only index of them that exists.
            </p>
          </div>

          <div className="space-y-4">
            {claimsList.filter((c) => !c.hiddenLocally).map((claim) => (
              <div key={claim.claimId} className="rounded-xl border border-[#e4e4e7] bg-[#fafafa] p-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <span className="font-display text-base font-bold text-[#111827]">
                      {claim.thresholdFormatted} from {claim.payerName}
                    </span>
                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-[#71717a]">
                      <span>Bound Verifier: <strong className="text-[#111827]">{claim.verifierName}</strong></span>
                      <span>Window: {claim.fromPeriod} – {claim.toPeriod}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => { hideLocalClaim(claim.claimId); setClaimsList(getLocalClaims()); }}
                    className="rounded-lg bg-white border border-[#e4e4e7] px-3 py-1.5 font-mono text-xs font-semibold text-[#71717a] hover:bg-[#f4f4f5]"
                  >
                    Hide From My List
                  </button>
                </div>
                <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-[#fffbeb] border border-[#fde68a] px-3 py-2 font-mono text-[10px] text-[#92400e]">
                  <WarningCircle size={12} weight="bold" className="shrink-0" />
                  Local only — Velum's contract has no revocation function, so this doesn't affect
                  anything on chain.
                </div>
              </div>
            ))}
            {claimsList.filter((c) => !c.hiddenLocally).length === 0 && (
              <div className="text-xs text-[#71717a] font-mono">No prepared claims yet.</div>
            )}
          </div>
        </div>
      </main>

      <AppFooter />
    </div>
  );
}
