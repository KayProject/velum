"use client";

import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import {
  getEnrolments,
  getAttestations,
  getIssuedClaims,
  createIssuedClaim,
  revokeClaim,
  calculateAnonymitySet,
  IssuedClaim,
  PayerEnrolment,
} from "@/lib/velum/store";
import {
  computeEarnerHandle,
  computeChallengeHash,
} from "@/lib/velum/hashes";

export default function EarnerPortalPage() {
  const [activeTab, setActiveTab] = useState<"builder" | "claims">("builder");

  // Step 1: Viewing Key / Passphrase
  const [passphrase, setPassphrase] = useState("earner_master_viewing_key_seed");
  const [identityKey, setIdentityKey] = useState("0x07f83bc4190e8a71289102938102938102938102938102938102938102938102");
  const [earnerHandle, setEarnerHandle] = useState("");

  // Step 2: Payer Selection
  const [enrolments, setEnrolments] = useState<PayerEnrolment[]>([]);
  const [selectedPayerAddress, setSelectedPayerAddress] = useState("0x0403bc891a271df912a7812a39281a8b9281a");
  const [customPayerName, setCustomPayerName] = useState("");

  // Step 3: Window & Threshold
  const [windowPeriod, setWindowPeriod] = useState("2026-Q1");
  const [threshold, setThreshold] = useState("4200000");
  const [currency, setCurrency] = useState("NGN");
  const [expiryDays, setExpiryDays] = useState(18);

  // Step 4: Verifier Challenge
  const [verifierName, setVerifierName] = useState("Meridian Properties Ltd");
  const [challengeCode, setChallengeCode] = useState("meridian_lease_2026");

  // Execution state
  const [isGenerating, setIsGenerating] = useState(false);
  const [refusalError, setRefusalError] = useState<string | null>(null);
  const [generatedClaim, setGeneratedClaim] = useState<IssuedClaim | null>(null);
  const [copied, setCopied] = useState(false);

  // Issued claims list
  const [claimsList, setClaimsList] = useState<IssuedClaim[]>([]);

  useEffect(() => {
    setEnrolments(getEnrolments());
    setClaimsList(getIssuedClaims());
  }, []);

  // Update identity derivations
  useEffect(() => {
    try {
      const derivedFelt = BigInt("0x" + Buffer.from(passphrase || "seed").toString("hex").slice(0, 30));
      const idKey = "0x" + derivedFelt.toString(16).padStart(64, "0");
      setIdentityKey(idKey);
      const handle = computeEarnerHandle(derivedFelt);
      setEarnerHandle("0x" + handle.toString(16).padStart(64, "0"));
    } catch {
      // ignore
    }
  }, [passphrase]);

  // Selected payer entity
  const selectedPayer = useMemo(() => {
    const found = enrolments.find((e) => e.address.toLowerCase() === selectedPayerAddress.toLowerCase());
    return found || {
      name: customPayerName || "Unenrolled Payer",
      address: selectedPayerAddress,
      enrolledAt: "",
      txHash: "",
    };
  }, [enrolments, selectedPayerAddress, customPayerName]);

  // Real Anonymity Set calculation (FR-012, T032)
  const anonymitySet = useMemo(() => {
    return calculateAnonymitySet(selectedPayer.name || selectedPayerAddress, windowPeriod);
  }, [selectedPayer, selectedPayerAddress, windowPeriod]);

  // Accumulated qualifying attestations for the selected payer & window
  const accumulatedTotal = useMemo(() => {
    const allAtts = getAttestations();
    const matches = allAtts.filter(
      (a) =>
        (a.payerAddress.toLowerCase() === selectedPayerAddress.toLowerCase() ||
          (a.payerName && a.payerName.toLowerCase() === selectedPayer.name.toLowerCase())) &&
        a.token === currency &&
        (a.windowPeriod === windowPeriod || !windowPeriod)
    );
    return matches.reduce((sum, a) => sum + Number(a.amount), 0);
  }, [selectedPayerAddress, selectedPayer, currency, windowPeriod]);

  // Handle claim generation
  const handleGenerateClaim = (e: React.FormEvent) => {
    e.preventDefault();
    setRefusalError(null);
    setGeneratedClaim(null);
    setIsGenerating(true);

    const reqThreshold = Number(threshold.replace(/[^0-9]/g, ""));

    setTimeout(() => {
      // Pre-flight threshold validation (FR-007)
      // For demo realism: if user requested > accumulatedTotal and accumulatedTotal > 0, refuse without on-chain record
      if (accumulatedTotal > 0 && reqThreshold > accumulatedTotal) {
        setIsGenerating(false);
        setRefusalError(
          `BELOW_THRESHOLD: Qualifying attestations in ${windowPeriod} total ₦${accumulatedTotal.toLocaleString()}, which falls short of the requested ₦${reqThreshold.toLocaleString()} threshold. Proof halted locally. Zero traces were left on-chain.`
        );
        return;
      }

      const res = createIssuedClaim({
        identityKey,
        payerAddress: selectedPayerAddress,
        payerName: selectedPayer.name,
        token: currency,
        thresholdAmount: BigInt(reqThreshold || 4200000),
        fromPeriod: windowPeriod === "2026-Q1" ? "1 Jan 2026" : "1 Oct 2025",
        toPeriod: windowPeriod === "2026-Q1" ? "31 Mar 2026" : "31 Dec 2025",
        fromTimestamp: 1767225600,
        toTimestamp: 1774915200,
        verifierName: verifierName.trim() || "Independent Verifier",
        challengePreimage: challengeCode.trim() || "default_challenge",
        expiryDays,
        anonymitySetSize: anonymitySet,
      });

      setIsGenerating(false);
      setGeneratedClaim(res.claim);
      setClaimsList(getIssuedClaims());
    }, 1200);
  };

  // Revoke claim
  const handleRevoke = (claimId: string) => {
    revokeClaim(claimId);
    setClaimsList(getIssuedClaims());
    if (generatedClaim && generatedClaim.claimId === claimId) {
      setGeneratedClaim({ ...generatedClaim, status: "REVOKED" });
    }
  };

  const copyClaimUrl = () => {
    if (!generatedClaim) return;
    const url = `${window.location.origin}/v/${generatedClaim.shortId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col justify-between selection:bg-[#10b981]/20 selection:text-[#065f46]">
      {/* Top Navbar */}
      <header className="border-b border-[#e4e4e7] bg-white/90 backdrop-blur-md px-6 py-4 sticky top-0 z-30">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#111827] text-white font-mono font-bold text-xs">
              V
            </div>
            <span className="font-display text-lg font-bold text-[#111827]">
              Velum
            </span>
            <span className="font-mono text-[10px] text-[#059669] bg-[#ecfdf5] border border-[#a7f3d0] px-2 py-0.5 rounded-full font-semibold">
              EARNER PORTAL
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/payer"
              className="text-xs font-semibold text-[#2563eb] hover:underline"
            >
              Switch to Payer Portal →
            </Link>
            <Link
              href="/"
              className="text-xs font-semibold text-[#71717a] hover:text-[#111827]"
            >
              ← Overview
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto w-full max-w-5xl px-6 py-10">
        {/* Intro */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="font-mono text-xs font-semibold uppercase tracking-widest text-[#059669]">
              [ Confidential Claim Builder · Zero-Custody ]
            </span>
            <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#111827]">
              Income Proof Generator
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[#6b7280]">
              Prove that qualifying income from a single payer exceeded your required threshold — without disclosing your balance, other income, or transaction history.
            </p>
          </div>

          <div className="rounded-xl border border-[#e4e4e7] bg-white p-3 shadow-2xs font-mono text-xs">
            <span className="text-[#71717a] block text-[10px]">Unlinkable Earner Handle:</span>
            <span className="font-bold text-[#111827]">{earnerHandle.slice(0, 10)}...{earnerHandle.slice(-6)}</span>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 border-b border-[#e4e4e7] pb-3 mb-8">
          <button
            type="button"
            onClick={() => setActiveTab("builder")}
            className={`rounded-lg px-4 py-2 font-mono text-xs font-semibold transition-all ${
              activeTab === "builder"
                ? "bg-[#111827] text-white shadow-xs"
                : "bg-white text-[#71717a] border border-[#e4e4e7] hover:text-[#111827]"
            }`}
          >
            01 // Generate Income Proof
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("claims")}
            className={`rounded-lg px-4 py-2 font-mono text-xs font-semibold transition-all ${
              activeTab === "claims"
                ? "bg-[#111827] text-white shadow-xs"
                : "bg-white text-[#71717a] border border-[#e4e4e7] hover:text-[#111827]"
            }`}
          >
            02 // Issued Claims &amp; Revocation ({claimsList.length})
          </button>
        </div>

        {/* TAB 1: Builder */}
        {activeTab === "builder" && (
          <div className="grid gap-8 lg:grid-cols-12">
            {/* Left Form */}
            <div className="rounded-2xl border border-[#e4e4e7] bg-white p-6 sm:p-8 shadow-sm lg:col-span-7">
              <form onSubmit={handleGenerateClaim} className="space-y-6">
                {/* 1. Viewing Key / Passphrase */}
                <div className="rounded-xl border border-[#e4e4e7] bg-[#fafafa] p-4">
                  <div className="flex items-center justify-between">
                    <label className="font-mono text-xs font-bold text-[#111827]">
                      01 // VIEWING KEY / PASSPHRASE
                    </label>
                    <span className="font-mono text-[10px] text-[#059669]">
                      ● In-Memory Only (FR-006)
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-[#71717a]">
                    Used solely inside your local browser to derive your contract-scoped identity anchor.
                  </p>
                  <input
                    type="password"
                    required
                    value={passphrase}
                    onChange={(e) => setPassphrase(e.target.value)}
                    placeholder="Enter your confidential account viewing passphrase"
                    className="mt-3 w-full rounded-lg border border-[#e4e4e7] bg-white px-3.5 py-2.5 text-xs font-mono text-[#111827] focus:border-[#10b981] focus:outline-none"
                  />
                </div>

                {/* 2. Payer Selection */}
                <div>
                  <div className="flex items-center justify-between">
                    <label className="font-mono text-xs font-bold text-[#111827]">
                      02 // SELECT PAYER ATTESTATION SOURCE
                    </label>
                    {selectedPayer.enrolledAt && (
                      <span className="font-mono text-[10px] text-[#2563eb] bg-[#eff6ff] px-2 py-0.5 rounded border border-[#bfdbfe]">
                        ✓ Attested Enrolment
                      </span>
                    )}
                  </div>

                  <select
                    value={selectedPayerAddress}
                    onChange={(e) => setSelectedPayerAddress(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-[#e4e4e7] bg-white px-3.5 py-2.5 text-xs font-medium text-[#111827] focus:border-[#10b981] focus:outline-none"
                  >
                    {enrolments.map((enr) => (
                      <option key={enr.address} value={enr.address}>
                        {enr.name} — Enrolled Treasury ({enr.address.slice(0, 8)}...{enr.address.slice(-4)})
                      </option>
                    ))}
                    <option value="0x0999aa887766554433221100ffeeddccbbaa00">
                      Custom Unenrolled Attestation Channel
                    </option>
                  </select>
                </div>

                {/* 3. Window & Threshold */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-mono text-xs font-bold text-[#111827]">
                      03 // COVERED WINDOW
                    </label>
                    <select
                      value={windowPeriod}
                      onChange={(e) => setWindowPeriod(e.target.value)}
                      className="mt-2 w-full rounded-lg border border-[#e4e4e7] bg-white px-3.5 py-2.5 text-xs font-medium text-[#111827] focus:border-[#10b981] focus:outline-none"
                    >
                      <option value="2026-Q1">Jan 1 – Mar 31, 2026 (Q1)</option>
                      <option value="2025-Q4">Oct 1 – Dec 31, 2025 (Q4)</option>
                      <option value="2025-ALL">Full Calendar Year 2025</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-mono text-xs font-bold text-[#111827]">
                      04 // MINIMUM THRESHOLD FLOOR
                    </label>
                    <div className="mt-2 flex rounded-lg border border-[#e4e4e7] bg-white">
                      <input
                        type="number"
                        required
                        value={threshold}
                        onChange={(e) => setThreshold(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs font-semibold text-[#111827] focus:outline-none"
                      />
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="rounded-r-lg border-l border-[#e4e4e7] bg-[#fafafa] px-3 text-xs font-medium text-[#71717a] focus:outline-none"
                      >
                        <option value="NGN">₦ NGN</option>
                        <option value="STRK">STRK</option>
                        <option value="USD">$ USD</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Anonymity Set Warning Banner (FR-012 / T032) */}
                <div
                  className={`rounded-xl border p-4 text-xs ${
                    anonymitySet <= 1
                      ? "border-[#fecaca] bg-[#fef2f2] text-[#991b1b]"
                      : anonymitySet < 5
                      ? "border-[#fde68a] bg-[#fffbeb] text-[#92400e]"
                      : "border-[#a7f3d0] bg-[#ecfdf5] text-[#065f46]"
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span>
                      {anonymitySet <= 1 ? "⚠️ PRIVACY WARNING (ANONYMITY SET: 1)" : `ANONYMITY CROWD: ${anonymitySet} RECIPIENTS`}
                    </span>
                    <span className="font-mono text-[10px]">FR-012 Compliance</span>
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed">
                    {anonymitySet <= 1
                      ? `This payer published only 1 attestation in ${windowPeriod}. Proving this claim narrows your crowd to 1 person, which may identify you to the verifier.`
                      : `The payer published attestations for ${anonymitySet} distinct recipient tags in this window. Your proof blends into this crowd.`}
                  </p>
                </div>

                {/* 5. Verifier Binding & Expiry */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="font-mono text-xs font-bold text-[#111827]">
                      05 // VERIFIER BINDING (SCOPED CODE)
                    </label>
                    <input
                      type="text"
                      required
                      value={verifierName}
                      onChange={(e) => setVerifierName(e.target.value)}
                      placeholder="e.g. Meridian Properties Ltd"
                      className="mt-2 w-full rounded-lg border border-[#e4e4e7] bg-white px-3.5 py-2.5 text-xs font-medium text-[#111827] focus:border-[#10b981] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-mono text-xs font-bold text-[#111827]">
                      06 // EXPIRY
                    </label>
                    <select
                      value={expiryDays}
                      onChange={(e) => setExpiryDays(Number(e.target.value))}
                      className="mt-2 w-full rounded-lg border border-[#e4e4e7] bg-white px-3.5 py-2.5 text-xs font-medium text-[#111827] focus:border-[#10b981] focus:outline-none"
                    >
                      <option value={7}>7 Days</option>
                      <option value={18}>18 Days</option>
                      <option value={30}>30 Days</option>
                    </select>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#10b981] py-3.5 text-xs font-bold text-white transition-all hover:bg-[#059669] active:scale-[0.99] disabled:opacity-75 shadow-md shadow-[#10b981]/20"
                >
                  {isGenerating ? (
                    <>
                      <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      <span>Proving Attestations in Virtual Block (0ms Gas)...</span>
                    </>
                  ) : (
                    <>
                      <span>Execute Claim Proof</span>
                      <span className="font-mono text-[10px] opacity-80">(1 Private Tx)</span>
                    </>
                  )}
                </button>
              </form>

              {/* Refusal Alert (FR-007) */}
              {refusalError && (
                <div className="mt-6 rounded-xl border border-[#fecaca] bg-[#fef2f2] p-4 text-xs font-mono text-[#991b1b]">
                  <span className="font-bold block mb-1">🛑 PROOF REFUSAL (ZERO ON-CHAIN TRACE):</span>
                  {refusalError}
                </div>
              )}

              {/* Generated Claim Output Card */}
              {generatedClaim && (
                <div className="mt-8 rounded-2xl border-2 border-[#10b981] bg-[#ecfdf5] p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#065f46]">
                      🟢 PROOF GENERATED &amp; REGISTERED ON-CHAIN
                    </span>
                    <span className="font-mono text-[10px] text-[#047857] bg-white px-2 py-0.5 rounded-full border border-[#a7f3d0]">
                      Expires in {expiryDays} days
                    </span>
                  </div>

                  <p className="mt-2 text-xs text-[#065f46] leading-relaxed">
                    Share this unique single-use link with <span className="font-bold">{generatedClaim.verifierName}</span>. They will see only the verified threshold statement.
                  </p>

                  <div className="mt-4 flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={typeof window !== "undefined" ? `${window.location.origin}/v/${generatedClaim.shortId}` : `/v/${generatedClaim.shortId}`}
                      className="w-full rounded-lg border border-[#a7f3d0] bg-white px-3.5 py-2.5 font-mono text-xs text-[#111827] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={copyClaimUrl}
                      className="shrink-0 rounded-lg bg-[#111827] px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#1f2937]"
                    >
                      {copied ? "Copied!" : "Copy Link"}
                    </button>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#a7f3d0] font-mono text-[11px] text-[#047857]">
                    <span>Challenge Binding: {generatedClaim.verifierName}</span>
                    <Link
                      href={`/v/${generatedClaim.shortId}`}
                      className="font-bold underline hover:text-[#065f46]"
                    >
                      Open Verifier View →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Right Guide Column */}
            <div className="space-y-6 lg:col-span-5">
              <div className="rounded-2xl border border-[#e4e4e7] bg-white p-6 shadow-sm">
                <h3 className="font-display text-sm font-bold text-[#111827]">
                  What Lands On-Chain (FR-011)
                </h3>
                <ul className="mt-3 space-y-2.5 text-xs text-[#6b7280]">
                  <li className="flex items-start gap-2">
                    <span className="text-[#059669] font-bold">✓</span>
                    <span><strong>Receipt:</strong> Claim ID + Verifier Challenge Hash</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#059669] font-bold">✓</span>
                    <span><strong>Predicate:</strong> Qualifying income floor was exceeded</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#059669] font-bold">✓</span>
                    <span><strong>Expiry:</strong> Absolute block timestamp expiry</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#991b1b] font-bold">✕</span>
                    <span><strong>Never on-chain:</strong> Note amounts, wallet balances, or account address</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-2xl border border-[#e4e4e7] bg-white p-6 shadow-sm">
                <h3 className="font-display text-sm font-bold text-[#111827]">
                  Single-Use &amp; Replay Guard (FR-003)
                </h3>
                <p className="mt-2 text-xs text-[#6b7280] leading-relaxed">
                  Once <span className="font-semibold text-[#111827]">{verifierName}</span> opens and consumes this link, the single-use challenge is marked <code className="font-mono text-[#059669]">spent</code> on-chain. Second presentations immediately fail.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Issued Claims & Revocation */}
        {activeTab === "claims" && (
          <div className="rounded-2xl border border-[#e4e4e7] bg-white p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#f4f4f5] pb-4 mb-6">
              <div>
                <span className="font-mono text-xs font-semibold uppercase tracking-widest text-[#059669]">
                  [ Slice 3 · T048 / FR-010 ]
                </span>
                <h2 className="mt-1 font-display text-xl font-bold text-[#111827]">
                  Issued Claims Log &amp; Revocation Kill Switch
                </h2>
                <p className="text-xs text-[#6b7280]">
                  Track which verifiers have accessed your claims and revoke active claims at any time.
                </p>
              </div>

              <span className="font-mono text-xs font-bold text-[#059669]">
                {claimsList.length} Total Claims
              </span>
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
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#e4e4e7] bg-white px-6 py-6 text-center font-mono text-xs text-[#71717a]">
        © 2026 Velum · Private Income Proof Layer on Starknet STRK20
      </footer>
    </div>
  );
}
