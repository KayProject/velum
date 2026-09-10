"use client";

import Link from "next/link";
import { useState, use } from "react";
import {
  CheckCircle,
  SealCheck,
  Prohibit,
  ClockCountdown,
  Buildings,
  PenNib,
  Lightning,
  WarningCircle,
} from "@phosphor-icons/react";
import { AppHeader } from "@/app/components/AppHeader";
import { AppFooter } from "@/app/components/AppFooter";
import { velumContract, decodeClaimStatus, fromWeiStrk, STRK_ADDRESS, explorerTxUrl, type ClaimStatus } from "@/lib/velum/contract";
import { textToFelt } from "@/lib/velum/hashes";

interface Receipt {
  earnerHandle: string;
  payer: string;
  token: string;
  fromTs: number;
  toTs: number;
  threshold: bigint;
  expiresAt: number;
  issuedAt: number;
}

type Phase =
  | { step: "input" }
  | { step: "checking" }
  | { step: "refused"; status: ClaimStatus }
  | { step: "valid"; receipt: Receipt }
  | { step: "redeeming"; receipt: Receipt }
  | { step: "redeemed"; receipt: Receipt; txHash: string }
  | { step: "redeem_failed"; receipt: Receipt; reason: string };

function isLikelyClaimId(value: string): boolean {
  return /^0x[0-9a-fA-F]{1,64}$/.test(value.trim());
}

export default function VerifyClaimPage({
  params,
}: {
  params: Promise<{ claim: string }>;
}) {
  const { claim: claimId } = use(params);
  const [challenge, setChallenge] = useState("");
  const [phase, setPhase] = useState<Phase>({ step: "input" });

  const validId = isLikelyClaimId(claimId);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!challenge.trim()) return;
    setPhase({ step: "checking" });

    try {
      const preimageFelt = textToFelt(challenge);
      const contract = await velumContract();

      // verify() never reverts — it returns a named status for every case, including "no such
      // claim." Reading that first (free) means read_claim below only ever runs against a claim
      // we already know is genuinely open right now.
      const statusRaw = await contract.verify(claimId, preimageFelt.toString());
      const status = decodeClaimStatus(statusRaw);

      if (status !== "Valid") {
        setPhase({ step: "refused", status });
        return;
      }

      const raw = await contract.read_claim(claimId, preimageFelt.toString());
      const receipt: Receipt = {
        earnerHandle: "0x" + BigInt(raw.earner_handle).toString(16),
        payer: "0x" + BigInt(raw.payer).toString(16),
        token: "0x" + BigInt(raw.token).toString(16),
        fromTs: Number(raw.from_ts),
        toTs: Number(raw.to_ts),
        threshold: BigInt(raw.threshold),
        expiresAt: Number(raw.expires_at),
        issuedAt: Number(raw.issued_at),
      };
      setPhase({ step: "valid", receipt });
    } catch (err) {
      setPhase({
        step: "refused",
        status: "Unknown",
      });
      console.error(err);
    }
  };

  const handleRedeem = async () => {
    if (phase.step !== "valid") return;
    const { receipt } = phase;
    setPhase({ step: "redeeming", receipt });

    try {
      const res = await fetch("/api/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claimId, challengePreimage: challenge }),
      });
      const data = await res.json();

      if (data.success && data.transactionHash) {
        setPhase({ step: "redeemed", receipt, txHash: data.transactionHash });
      } else {
        setPhase({
          step: "redeem_failed",
          receipt,
          reason: data.reason || data.error || "Redemption failed for an unknown reason.",
        });
      }
    } catch (err) {
      setPhase({
        step: "redeem_failed",
        receipt,
        reason: err instanceof Error ? err.message : "Network error while redeeming.",
      });
    }
  };

  if (!validId) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex flex-col justify-between">
        <AppHeader badge="VERIFIER PORTAL" sticky={false} />
        <main className="mx-auto w-full max-w-2xl px-6 py-10 flex-1 flex items-center">
          <div className="w-full rounded-2xl border border-[#fecaca] bg-[#fef2f2] p-8 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#fee2e2] text-xl font-bold text-[#991b1b]">
              ✕
            </div>
            <h1 className="mt-4 font-display text-xl font-bold text-[#991b1b]">Not a Claim ID</h1>
            <p className="mt-2 text-sm text-[#7f1d1d]">
              &ldquo;{claimId}&rdquo; isn&apos;t a felt (a <code>0x...</code> hex value). Ask the
              applicant to resend the full claim link.
            </p>
          </div>
        </main>
        <AppFooter />
      </div>
    );
  }

  const isSTRK = phase.step !== "input" && phase.step !== "checking" && phase.step !== "refused"
    ? phase.receipt.token.toLowerCase() === STRK_ADDRESS.toLowerCase()
    : false;

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col justify-between selection:bg-[#3b82f6]/20 selection:text-[#1e40af]">
      <AppHeader
        badge="VERIFIER PORTAL"
        rightSlot={
          <span className="font-mono text-xs text-[#71717a] hidden sm:inline">
            Reads the real Velum contract on Starknet mainnet
          </span>
        }
      />

      <main className="mx-auto w-full max-w-3xl px-6 py-10">
        <div className="rounded-2xl border border-[#e4e4e7] bg-white p-6 sm:p-10 shadow-sm">
          <div className="border-b border-[#f4f4f5] pb-4 mb-6">
            <span className="font-mono text-[11px] text-[#71717a]">Claim ID</span>
            <div className="font-mono text-xs text-[#111827] break-all">{claimId}</div>
          </div>

          {/* STEP 1: Challenge input — nothing about the claim is shown until this is correct,
              matching read_claim()'s own access control (only readable by the holder of the
              preimage). */}
          {(phase.step === "input" || phase.step === "checking" || phase.step === "refused") && (
            <form onSubmit={handleCheck} className="space-y-4">
              <div>
                <label className="font-mono text-xs font-bold text-[#111827]">
                  VERIFICATION CHALLENGE CODE
                </label>
                <p className="mt-1 text-xs text-[#6b7280]">
                  Enter the code the applicant gave you out of band. This is a single-use link:
                  once it opens the claim successfully, it consumes it on chain.
                </p>
                <input
                  type="text"
                  required
                  value={challenge}
                  onChange={(e) => setChallenge(e.target.value)}
                  placeholder="e.g. meridian_lease_2026"
                  className="mt-2 w-full rounded-lg border border-[#e4e4e7] bg-white px-3.5 py-2.5 text-xs font-mono text-[#111827] focus:border-[#3b82f6] focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={phase.step === "checking"}
                className="w-full rounded-xl bg-[#111827] py-3 text-xs font-bold text-white hover:bg-[#1f2937] disabled:opacity-60"
              >
                {phase.step === "checking" ? "Reading Starknet mainnet..." : "Open Claim"}
              </button>

              {phase.step === "refused" && (
                <div className="flex items-center gap-1.5 rounded-lg bg-[#fef2f2] border border-[#fecaca] p-3 font-mono text-xs text-[#991b1b]">
                  <Prohibit size={14} weight="bold" className="shrink-0" />
                  {phase.status === "Expired"
                    ? "CLAIM_EXPIRED: This claim has passed its expiration timestamp."
                    : phase.status === "Spent"
                    ? "ALREADY_SPENT: This single-use claim has already been redeemed."
                    : "This code did not open a valid claim. Either the code is wrong, or no such claim exists — Velum deliberately doesn't distinguish the two, so a probing guess can't confirm a claim's existence."}
                </div>
              )}
            </form>
          )}

          {/* STEP 2+: A real Receipt read from chain. */}
          {phase.step !== "input" && phase.step !== "checking" && phase.step !== "refused" && (
            <div>
              <div className="flex items-center gap-3 pb-4">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                    phase.step === "redeemed"
                      ? "bg-[#eef2ff] border border-[#c7d2fe] text-[#4338ca]"
                      : "bg-[#eff6ff] border border-[#bfdbfe] text-[#2563eb]"
                  }`}
                >
                  {phase.step === "redeemed" ? (
                    <SealCheck size={22} weight="fill" />
                  ) : (
                    <CheckCircle size={22} weight="fill" />
                  )}
                </div>
                <div>
                  <h1 className="font-display text-xl font-bold text-[#111827]">
                    {phase.step === "redeemed" ? "Claim Verified & Redeemed" : "Claim Opened"}
                  </h1>
                  <p className="text-xs text-[#6b7280]">Read live from the deployed Velum contract.</p>
                </div>
              </div>

              <div className="rounded-xl border border-[#e4e4e7] bg-[#fafafa] p-6 sm:p-8">
                <span className="font-mono text-[11px] font-bold text-[#71717a] uppercase tracking-wider block mb-2">
                  Verified Predicate Statement
                </span>
                <p className="font-display text-xl sm:text-2xl font-bold leading-relaxed text-[#111827]">
                  Qualifying income from a single payer exceeded{" "}
                  <span className="text-[#2563eb] font-extrabold">
                    {fromWeiStrk(phase.receipt.threshold)} {isSTRK ? "STRK" : "(token units)"}
                  </span>{" "}
                  between{" "}
                  <span className="underline decoration-[#3b82f6]/50 underline-offset-4">
                    {new Date(phase.receipt.fromTs * 1000).toLocaleDateString()} and{" "}
                    {new Date(phase.receipt.toTs * 1000).toLocaleDateString()}
                  </span>
                  .
                </p>
                <div className="mt-6 pt-4 border-t border-[#e4e4e7] flex flex-wrap items-center justify-between gap-3 text-xs text-[#6b7280]">
                  <span>No other financial information was disclosed.</span>
                  <span className="font-mono text-[#2563eb] font-semibold">
                    Expires {new Date(phase.receipt.expiresAt * 1000).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between rounded-xl border border-[#e4e4e7] bg-white p-4">
                <div className="flex items-center gap-2.5">
                  <Buildings size={18} weight="fill" className="text-[#71717a]" />
                  <div>
                    <span className="font-display text-xs font-bold text-[#111827]">Payer (on-chain address)</span>
                    <span className="block font-mono text-[10px] text-[#71717a]">
                      {phase.receipt.payer.slice(0, 12)}...{phase.receipt.payer.slice(-6)}
                    </span>
                  </div>
                </div>
              </div>

              {phase.step === "valid" && (
                <div className="mt-8 rounded-xl border-2 border-[#e4e4e7] bg-[#fcfcfc] p-6">
                  <p className="text-xs text-[#6b7280]">
                    This is a single-use link. Confirming redemption submits a real transaction that
                    marks this claim spent on Starknet mainnet — a second presentation will then be
                    rejected.
                  </p>
                  <button
                    type="button"
                    onClick={handleRedeem}
                    className="mt-4 w-full sm:w-auto rounded-lg bg-[#111827] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#1f2937]"
                  >
                    Confirm & Redeem (Single-Use)
                  </button>
                </div>
              )}

              {phase.step === "redeeming" && (
                <div className="mt-8 rounded-lg bg-[#fffbeb] border border-[#fde68a] p-3 font-mono text-xs text-[#92400e]">
                  Submitting redeem() via the relayer — this is a real Starknet transaction, usually
                  confirmed within a block or two.
                </div>
              )}

              {phase.step === "redeemed" && (
                <div className="mt-8 rounded-lg bg-[#eff6ff] border border-[#bfdbfe] p-4 font-mono text-xs text-[#1d4ed8] space-y-2">
                  <div>✓ SUCCESS: Claim redeemed on chain. Second presentations will now be rejected.</div>
                  <a
                    href={explorerTxUrl(phase.txHash)}
                    target="_blank"
                    rel="noreferrer"
                    className="underline break-all block"
                  >
                    {phase.txHash}
                  </a>
                </div>
              )}

              {phase.step === "redeem_failed" && (
                <div className="mt-8 flex items-start gap-1.5 rounded-lg bg-[#fef2f2] border border-[#fecaca] p-3 font-mono text-xs text-[#991b1b]">
                  <WarningCircle size={14} weight="bold" className="shrink-0 mt-0.5" />
                  {phase.reason}
                </div>
              )}
            </div>
          )}

          {/* Honest disclosure, unconditional. */}
          <div className="mt-8 rounded-xl border border-[#e4e4e7] bg-white p-6">
            <span className="font-mono text-[11px] font-bold text-[#71717a] uppercase tracking-wider block mb-4">
              Honest Disclosure: Proven vs Attested
            </span>
            <div className="grid gap-4 sm:grid-cols-2 text-xs">
              <div className="rounded-lg bg-[#fafafa] border border-[#ededed] p-4">
                <span className="inline-flex items-center gap-1 font-mono font-bold text-[#2563eb] mb-1">
                  <Lightning size={13} weight="bold" /> Proven via the STRK20 privacy pool
                </span>
                <p className="text-[#6b7280] leading-relaxed">
                  The earner demonstrated cryptographic control of the qualifying shielded payments
                  via an uncorrelatable identity anchor. Zero custody was taken.
                </p>
              </div>
              <div className="rounded-lg bg-[#fafafa] border border-[#ededed] p-4">
                <span className="inline-flex items-center gap-1 font-mono font-bold text-[#2563eb] mb-1">
                  <PenNib size={13} weight="bold" /> Attested by the payer
                </span>
                <p className="text-[#6b7280] leading-relaxed">
                  The payment amount, token, and covered period are whatever the payer's address
                  called <code>attest()</code> with — Velum takes their word for the amount, and only
                  hides who received it.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 pt-6 border-t border-[#f4f4f5]">
            <button
              type="button"
              onClick={() => typeof window !== "undefined" && window.print()}
              className="rounded-xl border border-[#e4e4e7] bg-white px-4 py-2.5 text-xs font-semibold text-[#111827] hover:bg-[#f4f4f5] shadow-2xs"
            >
              Print Underwriting Record
            </button>
            <Link href="/" className="text-xs font-semibold text-[#71717a] hover:text-[#111827]">
              Learn More About Velum Privacy Architecture →
            </Link>
          </div>
        </div>
      </main>

      <AppFooter />
    </div>
  );
}
