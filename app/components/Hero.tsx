"use client";

import Link from "next/link";
import { useState } from "react";
import { SkyBackdrop } from "./SkyBackdrop";

export function Hero() {
  const [prompt, setPrompt] = useState("Prove qualifying income >= ₦4,200,000 in 2026-Q1 from Acme DAO");
  const [activeChip, setActiveChip] = useState("Earner Proof");
  const [proving, setProving] = useState(false);
  const [copied, setCopied] = useState(false);

  const chips = [
    {
      label: "Earner Proof",
      text: "Prove qualifying income >= ₦4,200,000 in 2026-Q1 from Acme DAO",
      payer: "Acme DAO (0x04f7...91a2)",
      period: "2026-Q1 (Jan–Mar)",
      threshold: "₦4,200,000",
      attestations: "3/3 Signed",
      status: "🟢 Threshold Met (₦4,200,000)",
    },
    {
      label: "Payer Tag",
      text: "Emit signed payment attestation for March 2026 payroll",
      payer: "Meridian Labs (0x071b...882c)",
      period: "March 2026",
      threshold: "₦1,400,000",
      attestations: "1/1 Emitted",
      status: "🟢 Attestation Signed On-Chain",
    },
    {
      label: "Virtual Block",
      text: "Evaluate sum(attestations) >= ₦4,200,000 threshold client-side",
      payer: "Client Circuit (Cairo 2.0)",
      period: "0ms Gas / Client Virtual Block",
      threshold: "₦4,200,000",
      attestations: "3 Attestations Aggregated",
      status: "⚡ Zero Calldata Leaked",
    },
    {
      label: "Landlord Verify",
      text: "Validate single-use proof token for Meridian Properties Ltd",
      payer: "Meridian Properties Ltd",
      period: "Expires in 48 Hours",
      threshold: "Single-Use Bound",
      attestations: "1 Replay Guard",
      status: "🔒 Valid & Uncorrelatable",
    },
  ];

  const currentChip = chips.find((c) => c.label === activeChip) || chips[0];

  const handleChip = (c: typeof chips[0]) => {
    setActiveChip(c.label);
    setPrompt(c.text);
    setProving(true);
    setTimeout(() => setProving(false), 600);
  };

  const handleCopyLink = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="relative overflow-hidden pt-12 pb-20 sm:pt-16 sm:pb-32">
      {/* Sky & Multi-layer Animated Parallax Clouds with Technical Grid */}
      <SkyBackdrop variant="hero" />

      <div className="mx-auto max-w-[1360px] px-6 sm:px-10">
        <div className="mx-auto max-w-3xl text-center">
          {/* Tag Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/90 px-3.5 py-1.5 text-xs font-mono text-[#404040] shadow-2xs backdrop-blur-md mb-5">
            <span className="h-2 w-2 rounded-full bg-[#10b981] animate-pulse" />
            <span>STRK20 Private Sprint</span>
            <span className="text-[#a3a3a3]">|</span>
            <span className="text-[#737373]">Cairo ZK Proof Layer</span>
          </div>

          {/* Headline */}
          <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-[#181818] leading-[1.08]">
            Prove what matters. <br />
            <span className="text-[#059669]">Reveal nothing else.</span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-sm sm:text-base md:text-lg leading-relaxed text-[#525252] max-w-2xl mx-auto">
            Velum turns private salaries and shielded payments into unforgeable income claims for
            landlords, lenders, and visa officers — without disclosing your balance, counterparty, or transaction history.
          </p>

          {/* 2 Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
            <Link
              href="/app"
              className="inline-flex items-center justify-center rounded-xl bg-[#181818] px-6 py-3.5 text-xs sm:text-sm font-medium text-white transition-all hover:bg-[#2b2b2b] shadow-md active:scale-95 gap-2"
            >
              <span>Launch Earner Portal</span>
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
            <Link
              href="/payer"
              className="inline-flex items-center justify-center rounded-xl border border-[#ededed] bg-white/95 px-6 py-3.5 text-xs sm:text-sm font-medium text-[#181818] transition-all hover:bg-[#f6f6f6] shadow-xs backdrop-blur-xs active:scale-95"
            >
              Payer Attestations
            </Link>
          </div>
        </div>

        {/* Hero Browser Mockup with Floating Prompt Bar */}
        <div className="relative mt-14 sm:mt-18 mx-auto max-w-5xl">
          {/* Floating Prompt Bar */}
          <div className="relative z-20 mx-auto max-w-2xl rounded-2xl border border-white/90 bg-white/95 p-3.5 sm:p-4 shadow-[0_16px_48px_rgba(0,0,0,0.08)] backdrop-blur-md">
            <div className="flex items-center gap-3">
              <span className="text-[#10b981] text-sm">✦</span>
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="What income do you want to prove today?"
                className="w-full bg-transparent font-sans text-xs sm:text-sm text-[#181818] placeholder:text-[#858585] focus:outline-none"
              />
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-[#ededed]/70">
              <div className="flex flex-wrap items-center gap-1.5">
                {chips.map((c) => (
                  <button
                    key={c.label}
                    type="button"
                    onClick={() => handleChip(c)}
                    className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-medium transition-all ${
                      activeChip === c.label
                        ? "bg-[#181818] text-white shadow-2xs"
                        : "bg-[#f6f6f6] text-[#686868] hover:bg-[#ededed] hover:text-[#181818]"
                    }`}
                  >
                    <span className="text-[9px]">⠶</span>
                    <span>{c.label}</span>
                  </button>
                ))}
              </div>

              {/* Waveform Icon / Audio ZK trigger */}
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#181818] text-white transition-transform hover:scale-105">
                <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2a1 1 0 011 1v18a1 1 0 11-2 0V3a1 1 0 011-1zm-6 4a1 1 0 011 1v10a1 1 0 11-2 0V7a1 1 0 011-1zm12 0a1 1 0 011 1v10a1 1 0 11-2 0V7a1 1 0 011-1z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Underneath Interactive Browser Window */}
          <div className="relative -mt-8 rounded-2xl border border-white/80 bg-white/95 p-4 sm:p-6 shadow-[0_24px_60px_rgba(0,0,0,0.07)] backdrop-blur-md">
            {/* macOS Window Controls */}
            <div className="flex items-center justify-between border-b border-[#ededed]/70 pb-3">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-[#ff5f56]" />
                <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
                <span className="h-3 w-3 rounded-full bg-[#27c93f]" />
                <span className="ml-3 font-mono text-[11px] text-[#858585]">
                  velum.app/earner/preview · SN_MAINNET
                </span>
              </div>
              <div className="flex items-center gap-2 font-mono text-[10px] text-[#059669] bg-[#ecfdf5] border border-[#a7f3d0] px-2 py-0.5 rounded-full">
                <span>0x0403...812a</span>
                <span>[STRK20 POOL]</span>
              </div>
            </div>

            {/* Window Content Grid */}
            <div className="mt-5 grid grid-cols-12 gap-6 min-h-[260px]">
              {/* Left Mock Sidebar */}
              <div className="hidden sm:block sm:col-span-4 border-r border-[#ededed]/70 pr-4 space-y-3 font-sans">
                <div className="flex items-center justify-between rounded-lg bg-[#f6f6f6] px-3 py-2 text-xs font-semibold text-[#181818]">
                  <span>Claim Parameters</span>
                  <span className="font-mono text-[10px] text-[#059669]">LIVE</span>
                </div>
                
                <div className="space-y-2 pt-1 font-mono text-[11px]">
                  <div className="p-2 rounded-lg bg-[#fafafa] border border-[#f0f0f0]">
                    <span className="text-[#858585] block text-[10px]">PAYER</span>
                    <span className="font-medium text-[#181818]">{currentChip.payer}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#fafafa] border border-[#f0f0f0]">
                    <span className="text-[#858585] block text-[10px]">WINDOW</span>
                    <span className="font-medium text-[#181818]">{currentChip.period}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#fafafa] border border-[#f0f0f0]">
                    <span className="text-[#858585] block text-[10px]">MIN THRESHOLD</span>
                    <span className="font-bold text-[#059669]">{currentChip.threshold}</span>
                  </div>
                </div>
              </div>

              {/* Main Interactive Studio Area */}
              <div className="col-span-12 sm:col-span-8 flex flex-col justify-between space-y-4">
                {/* Proof Evaluation Live Display */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-[#181818]">
                      Virtual Block Execution Trace
                    </span>
                    <span className="font-mono text-[10px] text-[#059669] bg-[#ecfdf5] px-2 py-0.5 rounded">
                      {currentChip.attestations}
                    </span>
                  </div>

                  {/* Attestation Stream Card */}
                  <div className="rounded-xl border border-[#ededed] bg-[#fafafa] p-3 text-xs space-y-2 font-mono">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#686868]">Attestation Commitment</span>
                      <span className="text-[#181818] font-bold">0x04f7a...912c</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#686868]">Poseidon Derivation</span>
                      <span className="text-[#059669]">h(tag, recipient, vk) ✓</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-[#ededed]/60">
                      <span className="text-[#686868]">Threshold Status</span>
                      <span className="font-semibold text-[#059669]">{currentChip.status}</span>
                    </div>
                  </div>

                  {/* Generating Status Badge */}
                  <div className="pt-1 flex items-center justify-between">
                    <div className="inline-flex items-center gap-2 rounded-lg bg-[#10b981]/10 px-3 py-1 text-xs font-mono font-medium text-[#059669] border border-[#10b981]/20">
                      <span className={`h-1.5 w-1.5 rounded-full bg-[#10b981] ${proving ? "animate-ping" : "animate-pulse"}`} />
                      <span>{proving ? "evaluating virtual block proof..." : "client virtual block proven · 0 calldata leaked"}</span>
                    </div>

                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="inline-flex items-center gap-1 text-[11px] font-mono text-[#181818] hover:text-[#059669] bg-white border border-[#ededed] px-2.5 py-1 rounded-md shadow-2xs hover:bg-[#f6f6f6]"
                    >
                      <span>{copied ? "✓ Copied!" : "📋 Copy Verifier Link"}</span>
                    </button>
                  </div>
                </div>

                {/* Bottom Verifier Preview Bar */}
                <div className="rounded-xl border border-[#ecfdf5] bg-[#f0fdf4] p-3 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#10b981] text-white text-[11px] font-bold">
                      ✓
                    </span>
                    <span className="font-medium text-[#065f46] text-[11px] sm:text-xs">
                      Single-use claim generated: Landlord receives 1-line verified assertion
                    </span>
                  </div>
                  <Link href="/v/demo" className="font-mono text-[11px] font-semibold text-[#059669] hover:underline">
                    View Portal →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

