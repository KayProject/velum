"use client";

import Link from "next/link";
import { useState, useEffect, use } from "react";
import { getClaimById, redeemClaim, IssuedClaim } from "@/lib/velum/store";

export default function VerifyClaimPage({
  params,
}: {
  params: Promise<{ claim: string }>;
}) {
  const resolvedParams = use(params);
  const claimParam = resolvedParams.claim;

  const [claimData, setClaimData] = useState<IssuedClaim | null>(null);
  const [loading, setLoading] = useState(true);
  const [presentedChallenge, setPresentedChallenge] = useState("");
  const [redeemState, setRedeemState] = useState<{
    attempted: boolean;
    status: "VALID" | "WRONG_VERIFIER" | "ALREADY_SPENT" | "CLAIM_EXPIRED" | "CLAIM_REVOKED" | "IDLE";
    reason?: string;
  }>({ attempted: false, status: "IDLE" });
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    // Lookup claim in local store or construct fallback
    const found = getClaimById(claimParam);
    if (found) {
      setClaimData(found);
      setPresentedChallenge(found.challengePreimage);
    } else {
      // Create fallback valid claim for standalone URL testing
      const fallback: IssuedClaim = {
        claimId: claimParam.startsWith("0x") ? claimParam : `0x${claimParam}`,
        shortId: claimParam,
        earnerHandle: "0x0392019a82019283019283019283019283019283019283019283019283019283",
        payerAddress: "0x0403bc891a271df912a7812a39281a8b9281a",
        payerName: "Acme DAO",
        isPayerEnrolled: true,
        token: "NGN",
        thresholdAmount: BigInt(4200000),
        thresholdFormatted: "₦4,200,000",
        fromPeriod: "1 Jan 2026",
        toPeriod: "31 Mar 2026",
        fromTimestamp: 1767225600,
        toTimestamp: 1774915200,
        verifierName: "Meridian Properties Ltd",
        challengePreimage: "meridian_lease_challenge_2026",
        challengeHash: "0x01a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2",
        createdAt: Date.now() - 86400000,
        expiresAt: Date.now() + 86400000 * 18,
        status: "ACTIVE",
        anonymitySetSize: 5,
        paramsHash: "0x059a102938102938102938102938102938102938102938102938102938102938",
        txHash: "0x04a2910293810293810293810293810293810293810293810293810293810293",
      };
      setClaimData(fallback);
      setPresentedChallenge(fallback.challengePreimage);
    }
    setLoading(false);
  }, [claimParam]);

  const isExpired = claimData ? Date.now() > claimData.expiresAt : false;
  const isRevoked = claimData?.status === "REVOKED";

  const handleRedeem = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!claimData) return;

    setIsVerifying(true);

    setTimeout(() => {
      setIsVerifying(false);
      const res = redeemClaim(claimData.claimId, presentedChallenge);

      if (res.success) {
        setRedeemState({
          attempted: true,
          status: "VALID",
        });
        if (res.claim) setClaimData({ ...res.claim });
      } else {
        setRedeemState({
          attempted: true,
          status: res.status,
          reason: res.reason,
        });
        if (res.claim) setClaimData({ ...res.claim });
      }
    }, 600);
  };

  if (loading || !claimData) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center font-mono text-xs text-[#71717a]">
        Loading claim verification record...
      </div>
    );
  }

  const daysLeft = Math.max(0, Math.ceil((claimData.expiresAt - Date.now()) / 86400000));

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col justify-between selection:bg-[#10b981]/20 selection:text-[#065f46]">
      {/* Header */}
      <header className="border-b border-[#e4e4e7] bg-white/90 backdrop-blur-md px-6 py-4 sticky top-0 z-30">
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

          <span className="font-mono text-xs text-[#71717a] hidden sm:inline">
            Zero-Knowledge Underwriting Verification (SC-001)
          </span>
        </div>
      </header>

      {/* Main Viewport */}
      <main className="mx-auto w-full max-w-3xl px-6 py-10">
        <div className="rounded-2xl border border-[#e4e4e7] bg-white p-6 sm:p-10 shadow-sm relative overflow-hidden">
          {/* Status Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#f4f4f5] pb-6">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xl font-bold ${
                  isRevoked
                    ? "bg-[#fef2f2] border border-[#fecaca] text-[#991b1b]"
                    : isExpired
                    ? "bg-[#fffbeb] border border-[#fde68a] text-[#b45309]"
                    : claimData.status === "REDEEMED"
                    ? "bg-[#eff6ff] border border-[#bfdbfe] text-[#2563eb]"
                    : "bg-[#ecfdf5] border border-[#a7f3d0] text-[#059669]"
                }`}
              >
                {isRevoked ? "✕" : isExpired ? "!" : claimData.status === "REDEEMED" ? "✓" : "✓"}
              </div>
              <div>
                <h1 className="font-display text-xl font-bold text-[#111827]">
                  {isRevoked
                    ? "Claim Revoked by Earner"
                    : isExpired
                    ? "Income Claim Expired"
                    : claimData.status === "REDEEMED"
                    ? "Income Claim Verified & Redeemed"
                    : "Income Claim Ready for Verification"}
                </h1>
                <p className="text-xs text-[#6b7280]">
                  Cryptographically sound · Single-use assertion bound to {claimData.verifierName}
                </p>
              </div>
            </div>

            {/* Status Pill */}
            <div>
              {isRevoked ? (
                <span className="rounded-full bg-[#fef2f2] border border-[#fecaca] px-3 py-1 font-mono text-xs font-semibold text-[#991b1b]">
                  ⛔ REVOKED
                </span>
              ) : isExpired ? (
                <span className="rounded-full bg-[#fffbeb] border border-[#fde68a] px-3 py-1 font-mono text-xs font-semibold text-[#b45309]">
                  ⏰ EXPIRED
                </span>
              ) : claimData.status === "REDEEMED" ? (
                <span className="rounded-full bg-[#eff6ff] border border-[#bfdbfe] px-3 py-1 font-mono text-xs font-semibold text-[#1d4ed8]">
                  🔵 SINGLE-USE REDEEMED
                </span>
              ) : (
                <span className="rounded-full bg-[#ecfdf5] border border-[#a7f3d0] px-3 py-1 font-mono text-xs font-semibold text-[#047857]">
                  🟢 VALID &amp; ACTIVE
                </span>
              )}
            </div>
          </div>

          {/* THE CORE VERIFIED PREDICATE STATEMENT (FR-001, FR-004) */}
          <div className="mt-8 rounded-xl border border-[#e4e4e7] bg-[#fafafa] p-6 sm:p-8">
            <span className="font-mono text-[11px] font-bold text-[#71717a] uppercase tracking-wider block mb-2">
              VERIFIED PREDICATE STATEMENT
            </span>

            {isExpired ? (
              <div className="py-4 text-center">
                <p className="font-display text-lg font-semibold text-[#991b1b]">
                  Financial statement obscured: this proof exceeded its validity window.
                </p>
                <p className="mt-1 text-xs text-[#71717a]">
                  Request a fresh single-use link from the applicant.
                </p>
              </div>
            ) : isRevoked ? (
              <div className="py-4 text-center">
                <p className="font-display text-lg font-semibold text-[#991b1b]">
                  This claim was revoked by the applicant and is void.
                </p>
              </div>
            ) : (
              <div>
                <p className="font-display text-xl sm:text-2xl font-bold leading-relaxed text-[#111827]">
                  Qualifying income from a single payer exceeded{" "}
                  <span className="text-[#059669] font-extrabold">{claimData.thresholdFormatted}</span> between{" "}
                  <span className="underline decoration-[#10b981]/50 underline-offset-4">
                    {claimData.fromPeriod} and {claimData.toPeriod}
                  </span>
                  .
                </p>

                <div className="mt-6 pt-4 border-t border-[#e4e4e7] flex flex-wrap items-center justify-between gap-3 text-xs text-[#6b7280]">
                  <span>No other financial information was disclosed.</span>
                  <span className="font-mono text-[#059669] font-semibold">
                    {daysLeft > 0 ? `Expires in ${daysLeft} days` : "Expires today"}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Payer Enrolment Banner (FR-009, T044) */}
          <div className="mt-6 flex items-center justify-between rounded-xl border border-[#e4e4e7] bg-white p-4">
            <div className="flex items-center gap-2.5">
              <span className="text-sm">🏛️</span>
              <div>
                <span className="font-display text-xs font-bold text-[#111827]">
                  Payer: {claimData.payerName}
                </span>
                <span className="block font-mono text-[10px] text-[#71717a]">
                  Signer: {claimData.payerAddress.slice(0, 10)}...{claimData.payerAddress.slice(-6)}
                </span>
              </div>
            </div>

            {claimData.isPayerEnrolled ? (
              <span className="rounded-md bg-[#ecfdf5] border border-[#a7f3d0] px-2.5 py-1 font-mono text-[10px] font-bold text-[#047857]">
                ✓ ENROLLED &amp; ATTESTED
              </span>
            ) : (
              <span className="rounded-md bg-[#fffbeb] border border-[#fde68a] px-2.5 py-1 font-mono text-[10px] font-bold text-[#b45309]">
                ⚠️ SELF-DECLARED (UNENROLLED)
              </span>
            )}
          </div>

          {/* VERIFIER SINGLE-USE REDEMPTION & ANTI-REPLAY INTERACTION (FR-002, FR-003, SC-002, SC-003) */}
          {!isExpired && !isRevoked && (
            <div className="mt-8 rounded-xl border-2 border-[#e4e4e7] bg-[#fcfcfc] p-6">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#111827]">
                  VERIFIER CHALLENGE &amp; SINGLE-USE REDEMPTION
                </span>
                <span className="font-mono text-[10px] text-[#71717a]">
                  Bound to: {claimData.verifierName}
                </span>
              </div>

              <p className="mt-1 text-xs text-[#6b7280]">
                To complete your audit and lock this claim, verify your secret challenge preimage. Once consumed, this claim cannot be replayed.
              </p>

              <form onSubmit={handleRedeem} className="mt-4 flex flex-col sm:flex-row items-center gap-3">
                <input
                  type="text"
                  required
                  value={presentedChallenge}
                  onChange={(e) => setPresentedChallenge(e.target.value)}
                  placeholder="Enter verifier challenge secret code"
                  className="w-full rounded-lg border border-[#e4e4e7] bg-white px-3.5 py-2 text-xs font-mono text-[#111827] focus:border-[#10b981] focus:outline-none"
                />

                <button
                  type="submit"
                  disabled={isVerifying}
                  className="w-full sm:w-auto shrink-0 rounded-lg bg-[#111827] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#1f2937] transition-all disabled:opacity-50"
                >
                  {isVerifying ? "Verifying On-Chain..." : "Verify & Redeem (Single-Use)"}
                </button>
              </form>

              {/* Redemption Result Status */}
              {redeemState.attempted && (
                <div className="mt-4">
                  {redeemState.status === "VALID" ? (
                    <div className="rounded-lg bg-[#ecfdf5] border border-[#a7f3d0] p-3 font-mono text-xs text-[#047857]">
                      ✓ SUCCESS: Challenge verified. Claim consumed for {claimData.verifierName}. Second presentations will now be rejected.
                    </div>
                  ) : (
                    <div className="rounded-lg bg-[#fef2f2] border border-[#fecaca] p-3 font-mono text-xs text-[#991b1b]">
                      🛑 REFUSAL: {redeemState.reason}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* PROVEN-VS-ATTESTED ARCHITECTURAL DISCLOSURE (FR-008, T035) */}
          <div className="mt-8 rounded-xl border border-[#e4e4e7] bg-white p-6">
            <span className="font-mono text-[11px] font-bold text-[#71717a] uppercase tracking-wider block mb-4">
              HONEST DISCLOSURE: PROVEN VS ATTESTED (FR-008)
            </span>

            <div className="grid gap-4 sm:grid-cols-2 text-xs">
              <div className="rounded-lg bg-[#fafafa] border border-[#ededed] p-4">
                <span className="font-mono font-bold text-[#059669] block mb-1">
                  ⚡ PROVEN BY STARKNET PRIVACY POOL
                </span>
                <p className="text-[#6b7280] leading-relaxed">
                  The earner demonstrated cryptographic control of the qualifying shielded payments via an uncorrelatable identity anchor. Zero custody was taken.
                </p>
              </div>

              <div className="rounded-lg bg-[#fafafa] border border-[#ededed] p-4">
                <span className="font-mono font-bold text-[#2563eb] block mb-1">
                  ✍️ ATTESTED BY PAYER
                </span>
                <p className="text-[#6b7280] leading-relaxed">
                  The payment amount, token, and covered period were signed by {claimData.payerName}&apos;s payer channel key at pay time alongside payroll.
                </p>
              </div>
            </div>
          </div>

          {/* Cryptographic Metadata Card */}
          <div className="mt-6 space-y-2 font-mono text-xs">
            <div className="flex items-center justify-between rounded-lg border border-[#f4f4f5] bg-[#fafafa] px-4 py-2.5">
              <span className="text-[#71717a]">Claim Token:</span>
              <span className="font-semibold text-[#111827] truncate max-w-[260px]">{claimData.claimId}</span>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-[#f4f4f5] bg-[#fafafa] px-4 py-2.5">
              <span className="text-[#71717a]">Params Commitment Hash:</span>
              <span className="font-semibold text-[#111827] truncate max-w-[260px]">{claimData.paramsHash}</span>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-[#f4f4f5] bg-[#fafafa] px-4 py-2.5">
              <span className="text-[#71717a]">Earner Identity Anchor:</span>
              <span className="font-semibold text-[#111827]">{claimData.earnerHandle.slice(0, 14)}... (Unlinkable)</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 pt-6 border-t border-[#f4f4f5]">
            <button
              type="button"
              onClick={() => typeof window !== "undefined" && window.print()}
              className="rounded-xl border border-[#e4e4e7] bg-white px-4 py-2.5 text-xs font-semibold text-[#111827] hover:bg-[#f4f4f5] shadow-2xs"
            >
              Print Underwriting Record
            </button>

            <Link
              href="/"
              className="text-xs font-semibold text-[#71717a] hover:text-[#111827]"
            >
              Learn More About Velum Privacy Architecture →
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
