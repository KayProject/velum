"use client";

import { useState } from "react";

export function ProofSimulator() {
  const [payer, setPayer] = useState("Acme DAO");
  const [windowPeriod, setWindowPeriod] = useState("2026-Q1");
  const [threshold, setThreshold] = useState("4,200,000");
  const [currency, setCurrency] = useState("NGN");
  const [verifierName, setVerifierName] = useState("Meridian Properties Ltd");
  const [isGenerating, setIsGenerating] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [hasGenerated, setHasGenerated] = useState(true);

  const handleSimulate = () => {
    setIsGenerating(true);
    setStepIndex(1);

    setTimeout(() => setStepIndex(2), 500);
    setTimeout(() => setStepIndex(3), 1000);
    setTimeout(() => {
      setStepIndex(4);
      setIsGenerating(false);
      setHasGenerated(true);
    }, 1500);
  };

  return (
    <div className="w-full rounded-2xl border border-[#e4e4e7] bg-white p-4 sm:p-6 shadow-sm">
      {/* Top Header / Mode Switch */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-[#f4f4f5] pb-4">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-[#10b981] animate-pulse" />
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#111827]">
            Interactive Proof Engine
          </span>
          <span className="rounded bg-[#f4f4f5] px-1.5 py-0.5 font-mono text-[10px] text-[#71717a]">
            STRK20 V2
          </span>
        </div>
        <div className="flex items-center gap-1.5 rounded-lg border border-[#e4e4e7] bg-[#fafafa] p-1 text-xs">
          <button
            type="button"
            className="rounded-md bg-white px-2.5 py-1 font-medium text-[#111827] shadow-2xs"
          >
            Earner Setup
          </button>
          <button
            type="button"
            className="rounded-md px-2.5 py-1 font-medium text-[#71717a] hover:text-[#111827]"
          >
            Verifier Output
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column: Earner Parameters Configuration */}
        <div className="space-y-4 lg:col-span-6">
          <div>
            <label className="block font-mono text-xs font-medium text-[#71717a]">
              01 // WHO PAID YOU
            </label>
            <div className="mt-1.5 grid grid-cols-3 gap-2">
              {[
                { name: "Acme DAO", label: "Acme DAO" },
                { name: "StarkWare Fdn", label: "Foundation" },
                { name: "Client #4092", label: "Confidential" },
              ].map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => setPayer(item.name)}
                  className={`rounded-lg border px-3 py-2 text-left text-xs transition-all ${
                    payer === item.name
                      ? "border-[#10b981] bg-[#ecfdf5] font-semibold text-[#065f46]"
                      : "border-[#e4e4e7] bg-white text-[#3f3f46] hover:border-[#d4d4d8]"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-mono text-xs font-medium text-[#71717a]">
                02 // COVERED PERIOD
              </label>
              <select
                value={windowPeriod}
                onChange={(e) => setWindowPeriod(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-[#e4e4e7] bg-white px-3 py-2 text-xs font-medium text-[#111827] focus:border-[#10b981] focus:outline-none"
              >
                <option value="2026-Q1">Jan 1 – Mar 31, 2026 (Q1)</option>
                <option value="2025-Q4">Oct 1 – Dec 31, 2025 (Q4)</option>
                <option value="2025-ALL">Full Year 2025</option>
              </select>
            </div>

            <div>
              <label className="block font-mono text-xs font-medium text-[#71717a]">
                03 // THRESHOLD TO PROVE
              </label>
              <div className="mt-1.5 flex rounded-lg border border-[#e4e4e7] bg-white">
                <input
                  type="text"
                  value={threshold}
                  onChange={(e) => setThreshold(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold text-[#111827] focus:outline-none"
                />
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="rounded-r-lg border-l border-[#e4e4e7] bg-[#fafafa] px-2 text-[11px] font-medium text-[#71717a] focus:outline-none"
                >
                  <option value="NGN">₦ NGN</option>
                  <option value="STRK">STRK</option>
                  <option value="USD">$ USD</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block font-mono text-xs font-medium text-[#71717a]">
              04 // VERIFIER BINDING (WHO GETS TO CHECK)
            </label>
            <input
              type="text"
              value={verifierName}
              onChange={(e) => setVerifierName(e.target.value)}
              placeholder="e.g. Landlord name, Bank, Visa officer"
              className="mt-1.5 w-full rounded-lg border border-[#e4e4e7] bg-white px-3 py-2 text-xs font-medium text-[#111827] placeholder:text-[#a1a1aa] focus:border-[#10b981] focus:outline-none"
            />
          </div>

          <button
            type="button"
            onClick={handleSimulate}
            disabled={isGenerating}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#111827] py-3 text-xs font-semibold text-white transition-all hover:bg-[#1f2937] active:scale-[0.99] disabled:opacity-75 shadow-sm"
          >
            {isGenerating ? (
              <>
                <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                <span>Computing Virtual Block Proof...</span>
              </>
            ) : (
              <>
                <span>Generate Zero-Knowledge Claim</span>
                <span className="font-mono text-[10px] text-[#10b981]">→ 1 Tx</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Simulated Verifier Output / Terminal View */}
        <div className="flex flex-col justify-between rounded-xl border border-[#e4e4e7] bg-[#fafafa] p-4 lg:col-span-6">
          {/* Top Verifier Card */}
          <div>
            <div className="flex items-center justify-between border-b border-[#e4e4e7] pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#ecfdf5] text-[#10b981] text-xs font-bold">
                  ✓
                </span>
                <span className="font-mono text-xs font-bold text-[#111827]">
                  VERIFIER VIEW
                </span>
              </div>
              <span className="rounded bg-[#ecfdf5] px-2 py-0.5 font-mono text-[10px] font-semibold text-[#047857] border border-[#a7f3d0]">
                🟢 VERIFIED
              </span>
            </div>

            {/* The One-Line Proof Message */}
            <div className="mt-4 rounded-xl border border-[#e4e4e7] bg-white p-4 shadow-2xs">
              <div className="text-xs font-mono text-[#71717a] mb-2">
                CLAIM STATEMENT:
              </div>
              <p className="font-display text-sm font-semibold leading-relaxed text-[#111827]">
                Qualifying income from{" "}
                <span className="text-[#059669] font-bold">{payer}</span> exceeded{" "}
                <span className="text-[#059669] font-bold">
                  {currency === "NGN" ? `₦${threshold}` : `${threshold} ${currency}`}
                </span>{" "}
                between{" "}
                <span className="underline decoration-[#10b981]/50 underline-offset-2">
                  {windowPeriod === "2026-Q1"
                    ? "1 Jan and 31 Mar 2026"
                    : windowPeriod === "2025-Q4"
                    ? "1 Oct and 31 Dec 2025"
                    : "1 Jan and 31 Dec 2025"}
                </span>
                .
              </p>
              
              <div className="mt-4 pt-3 border-t border-[#f4f4f5] flex items-center justify-between text-[11px] text-[#71717a]">
                <span>No other financial records disclosed.</span>
                <span className="font-mono text-[#059669] font-medium">Expires in 18 days</span>
              </div>
            </div>
          </div>

          {/* Cryptographic Guarantees Breakdown */}
          <div className="mt-4 space-y-2 font-mono text-[11px]">
            <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2 border border-[#e4e4e7]">
              <span className="text-[#71717a]">Identity Anchor:</span>
              <span className="font-semibold text-[#111827]">0x7f83...bc19 (Unlinkable)</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2 border border-[#e4e4e7]">
              <span className="text-[#71717a]">Bound Verifier:</span>
              <span className="font-semibold text-[#111827]">{verifierName || "Meridian Properties"}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2 border border-[#e4e4e7]">
              <span className="text-[#71717a]">Custody / Escrow:</span>
              <span className="font-semibold text-[#10b981]">0 STRK (Zero Custody)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
