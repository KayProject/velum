"use client";

import { useState } from "react";

export function ProofSimulator() {
  const [query, setQuery] = useState("Qualifying income exceeded ₦4,200,000 in 2026-Q1");
  const [activeChip, setActiveChip] = useState("Tenancy Lease");
  const [payer, setPayer] = useState("Acme DAO");
  const [period, setPeriod] = useState("2026-Q1");
  const [threshold, setThreshold] = useState("4,200,000");
  const [verifier, setVerifier] = useState("Meridian Properties Ltd");
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(true);

  const chips = [
    { name: "Tenancy Lease", prompt: "Qualifying income exceeded ₦4,200,000 in 2026-Q1", payer: "Acme DAO", threshold: "4,200,000", verifier: "Meridian Properties Ltd" },
    { name: "Mortgage Proof", prompt: "Monthly salary exceeded $6,500 over 6 months", payer: "StarkWare Fdn", threshold: "39,000", verifier: "Apex Credit Union" },
    { name: "Visa Threshold", prompt: "Remote annual income exceeded €32,000 for 2025", payer: "Autonomous Labs", threshold: "32,000", verifier: "Consulate Visa Office" },
    { name: "Payer Attestation", prompt: "Commitment emission for March 2026 payroll", payer: "Global Payroll DAO", threshold: "5,000", verifier: "Underwriting Relayer" },
  ];

  const handleChipClick = (chip: typeof chips[0]) => {
    setActiveChip(chip.name);
    setQuery(chip.prompt);
    setPayer(chip.payer);
    setThreshold(chip.threshold);
    setVerifier(chip.verifier);
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setHasGenerated(true);
    }, 1000);
  };

  return (
    <div className="w-full rounded-[24px] border border-[#ededed] bg-white p-4 sm:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      {/* Top Prompt / Search Box (Verseo exact style) */}
      <div className="relative flex flex-col gap-3 rounded-2xl border border-[#ededed] bg-[#f9f9f9] p-3 sm:p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#181818] text-white text-xs font-mono">
            ✦
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What income do you want to prove today?"
            className="w-full bg-transparent font-sans text-xs sm:text-sm font-medium text-[#181818] placeholder:text-[#858585] focus:outline-none"
          />
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="shrink-0 rounded-full bg-[#181818] px-4 py-2 text-xs font-medium text-white transition-all hover:bg-[#2b2b2b] active:scale-95 disabled:opacity-75"
          >
            {isGenerating ? "Proving..." : "Generate Proof"}
          </button>
        </div>

        {/* Quick Chips (Verseo exact style) */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#ededed]/60">
          <span className="font-mono text-[11px] text-[#858585] mr-1">Templates:</span>
          {chips.map((c) => (
            <button
              key={c.name}
              type="button"
              onClick={() => handleChipClick(c)}
              className={`rounded-full px-3 py-1 text-[11px] font-medium transition-all ${
                activeChip === c.name
                  ? "bg-[#181818] text-white"
                  : "bg-white border border-[#ededed] text-[#686868] hover:border-[#181818]/30 hover:text-[#181818]"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Showcase Grid */}
      <div className="mt-6 grid gap-6 lg:grid-cols-12">
        {/* Left: Input Parameters */}
        <div className="space-y-4 lg:col-span-6 rounded-2xl border border-[#ededed] bg-[#f9f9f9] p-4 sm:p-5">
          <div className="flex items-center justify-between border-b border-[#ededed] pb-3">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#10b981] animate-pulse" />
              <span className="font-mono text-xs font-semibold text-[#181818]">
                CLAIM CONFIGURATION
              </span>
            </div>
            <span className="font-mono text-[10px] text-[#71717a] bg-white px-2 py-0.5 rounded-full border border-[#ededed]">
              Client Virtual Block
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-mono text-[11px] font-medium text-[#71717a]">
                PAYER SOURCE
              </label>
              <select
                value={payer}
                onChange={(e) => setPayer(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[#ededed] bg-white px-3 py-2 text-xs font-medium text-[#181818] focus:outline-none"
              >
                <option value="Acme DAO">Acme DAO (0x0403...812a)</option>
                <option value="StarkWare Fdn">StarkWare Foundation</option>
                <option value="Autonomous Labs">Autonomous Labs</option>
                <option value="Global Payroll DAO">Global Payroll DAO</option>
              </select>
            </div>

            <div>
              <label className="block font-mono text-[11px] font-medium text-[#71717a]">
                COVERED WINDOW
              </label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[#ededed] bg-white px-3 py-2 text-xs font-medium text-[#181818] focus:outline-none"
              >
                <option value="2026-Q1">Jan 1 – Mar 31, 2026 (Q1)</option>
                <option value="2025-Q4">Oct 1 – Dec 31, 2025 (Q4)</option>
                <option value="2025-ALL">Full Year 2025</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-mono text-[11px] font-medium text-[#71717a]">
                MINIMUM THRESHOLD
              </label>
              <input
                type="text"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[#ededed] bg-white px-3 py-2 text-xs font-semibold text-[#181818] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-mono text-[11px] font-medium text-[#71717a]">
                VERIFIER SCOPE
              </label>
              <input
                type="text"
                value={verifier}
                onChange={(e) => setVerifier(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[#ededed] bg-white px-3 py-2 text-xs font-medium text-[#181818] focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#181818] py-2.5 text-xs font-medium text-white transition-all hover:bg-[#2b2b2b] active:scale-95"
            >
              <span>Execute Prove Transaction</span>
              <span className="font-mono text-[10px] text-[#10b981]">→ 1 Tx</span>
            </button>
          </div>
        </div>

        {/* Right: Live Verifier Card */}
        <div className="flex flex-col justify-between rounded-2xl border border-[#ededed] bg-[#f9f9f9] p-4 sm:p-5 lg:col-span-6">
          <div>
            <div className="flex items-center justify-between border-b border-[#ededed] pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#10b981]/15 text-[#10b981] text-xs font-bold">
                  ✓
                </span>
                <span className="font-mono text-xs font-semibold text-[#181818]">
                  VERIFIER VIEWPORT
                </span>
              </div>
              <span className="rounded-full bg-[#10b981]/10 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-[#059669] border border-[#10b981]/25">
                🟢 VERIFIED
              </span>
            </div>

            <div className="mt-4 rounded-xl border border-[#ededed] bg-white p-4 shadow-2xs">
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#858585] mb-2">
                One-Sentence Verified Predicate:
              </div>
              <p className="font-display text-sm font-semibold leading-relaxed text-[#181818]">
                Qualifying income from{" "}
                <span className="text-[#059669] font-bold">{payer}</span> exceeded{" "}
                <span className="text-[#059669] font-bold">
                  {threshold.includes("$") || threshold.includes("€") ? threshold : `₦${threshold}`}
                </span>{" "}
                between{" "}
                <span className="underline decoration-[#10b981]/50 underline-offset-2">
                  {period === "2026-Q1"
                    ? "1 Jan and 31 Mar 2026"
                    : period === "2025-Q4"
                    ? "1 Oct and 31 Dec 2025"
                    : "1 Jan and 31 Dec 2025"}
                </span>
                .
              </p>
              
              <div className="mt-4 pt-3 border-t border-[#f4f4f5] flex items-center justify-between text-[11px] text-[#686868]">
                <span>No other financial records disclosed.</span>
                <span className="font-mono text-[#059669] font-medium">Expires in 18 days</span>
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-2 font-mono text-[11px]">
            <div className="flex items-center justify-between rounded-xl bg-white px-3 py-2 border border-[#ededed]">
              <span className="text-[#858585]">Identity Key:</span>
              <span className="font-semibold text-[#181818]">0x7f83...bc19 (Unlinkable)</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-white px-3 py-2 border border-[#ededed]">
              <span className="text-[#858585]">Bound Recipient:</span>
              <span className="font-semibold text-[#181818]">{verifier}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
