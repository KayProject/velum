"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { getIssuedClaims, revokeClaim, IssuedClaim } from "@/lib/velum/store";

export default function EarnerClaimsPage() {
  const [claimsList, setClaimsList] = useState<IssuedClaim[]>([]);

  useEffect(() => {
    setClaimsList(getIssuedClaims());
  }, []);

  const handleRevoke = (claimId: string) => {
    revokeClaim(claimId);
    setClaimsList(getIssuedClaims());
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col justify-between selection:bg-[#10b981]/20 selection:text-[#065f46]">
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
              ISSUED CLAIMS REGISTRY
            </span>
          </Link>

          <Link
            href="/app"
            className="text-xs font-semibold text-[#71717a] hover:text-[#111827]"
          >
            ← Back to Claim Builder
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl px-6 py-12">
        <div className="rounded-2xl border border-[#e4e4e7] bg-white p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#f4f4f5] pb-4 mb-6">
            <div>
              <span className="font-mono text-xs font-semibold uppercase tracking-widest text-[#059669]">
                [ Slice 3 · T048 / FR-010 ]
              </span>
              <h1 className="mt-1 font-display text-2xl font-bold text-[#111827]">
                Issued Claims &amp; Revocation Kill Switch
              </h1>
              <p className="mt-1 text-xs text-[#6b7280]">
                Manage all verifiable income claims created from your viewing key. Revoking a claim renders the verifier link immediately invalid.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {claimsList.map((claim) => (
              <div
                key={claim.claimId}
                className="rounded-xl border border-[#e4e4e7] bg-[#fafafa] p-5 transition-all hover:bg-white"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="font-display text-base font-bold text-[#111827]">
                        {claim.thresholdFormatted} from {claim.payerName}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold ${
                          claim.status === "ACTIVE"
                            ? "bg-[#ecfdf5] text-[#047857] border border-[#a7f3d0]"
                            : claim.status === "REDEEMED"
                            ? "bg-[#eff6ff] text-[#1d4ed8] border border-[#bfdbfe]"
                            : claim.status === "REVOKED"
                            ? "bg-[#fef2f2] text-[#991b1b] border border-[#fecaca]"
                            : "bg-[#f4f4f5] text-[#71717a] border border-[#e4e4e7]"
                        }`}
                      >
                        {claim.status}
                      </span>
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-[#71717a]">
                      <span>Bound Verifier: <strong className="text-[#111827]">{claim.verifierName}</strong></span>
                      <span>Window: {claim.fromPeriod} – {claim.toPeriod}</span>
                      <span>Expires: {new Date(claim.expiresAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/v/${claim.shortId}`}
                      className="rounded-lg bg-white border border-[#e4e4e7] px-3 py-1.5 font-mono text-xs font-semibold text-[#111827] hover:bg-[#f4f4f5]"
                    >
                      View Claim →
                    </Link>

                    {claim.status === "ACTIVE" && (
                      <button
                        type="button"
                        onClick={() => handleRevoke(claim.claimId)}
                        className="rounded-lg bg-[#ef4444] px-3 py-1.5 font-mono text-xs font-bold text-white hover:bg-[#dc2626] transition-colors"
                      >
                        Revoke (Kill Switch)
                      </button>
                    )}
                  </div>
                </div>

                {claim.redeemedAt && (
                  <div className="mt-3 pt-3 border-t border-[#ededed] font-mono text-[11px] text-[#2563eb]">
                    ✓ Redeemed and validated by {claim.verifierName} on {new Date(claim.redeemedAt).toLocaleString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="border-t border-[#e4e4e7] bg-white px-6 py-6 text-center font-mono text-xs text-[#71717a]">
        © 2026 Velum · Private Income Proof Layer on Starknet STRK20
      </footer>
    </div>
  );
}
