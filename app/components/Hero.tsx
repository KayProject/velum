"use client";

import Link from "next/link";
import { useState } from "react";

export function Hero() {
  const [prompt, setPrompt] = useState("Prove qualifying income >= ₦4,200,000 in 2026-Q1 from Acme DAO");
  const [activeChip, setActiveChip] = useState("Earner Proof");

  const chips = [
    { label: "Earner Proof", text: "Prove qualifying income >= ₦4,200,000 in 2026-Q1 from Acme DAO" },
    { label: "Payer Tag", text: "Emit signed payment attestation for March 2026 payroll" },
    { label: "Virtual Block", text: "Evaluate sum(attestations) >= ₦4,200,000 threshold client-side" },
    { label: "Landlord Verify", text: "Validate single-use proof token for Meridian Properties Ltd" },
  ];

  const handleChip = (c: typeof chips[0]) => {
    setActiveChip(c.label);
    setPrompt(c.text);
  };

  return (
    <section className="relative overflow-hidden pt-12 pb-20 sm:pt-16 sm:pb-32">
      {/* Cloud & Sky Background (Verseo exact background image & grid) */}
      <div 
        className="absolute inset-0 -z-10 bg-cover bg-center bg-no-repeat opacity-90"
        style={{ backgroundImage: "url('/images/clouds-bg.png')" }}
      />

      {/* Subtle overlay grid */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgba(255,255,255,0.4)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.4)_1px,transparent_1px)] bg-[size:4.5rem_4.5rem]" />

      {/* Crosshairs & Pixel clusters decorations */}
      <div className="absolute top-24 left-1/4 hidden lg:flex h-8 w-8 items-center justify-center rounded-full bg-white/60 text-[#858585] text-xs font-mono backdrop-blur-xs shadow-xs">
        +
      </div>
      <div className="absolute top-24 right-1/4 hidden lg:flex h-8 w-8 items-center justify-center rounded-full bg-white/60 text-[#858585] text-xs font-mono backdrop-blur-xs shadow-xs">
        +
      </div>

      <div className="mx-auto max-w-[1360px] px-6 sm:px-10">
        <div className="mx-auto max-w-3xl text-center">
          {/* Tag Pill (Verseo exact style) */}
          <div className="inline-flex items-center text-xs font-mono text-[#686868] mb-4">
            <span>[ Zero-Knowledge Income Proof Layer ]</span>
          </div>

          {/* Headline (Verseo exact 2-line bold title) */}
          <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-[#181818] leading-[1.1]">
            Prove what matters. <br />
            Faster. With ZK
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-sm sm:text-base md:text-lg leading-relaxed text-[#686868] max-w-2xl mx-auto">
            Velum turns private salaries and shielded payments into unforgeable income claims for
            landlords, lenders, and visa officers — without disclosing your balance or transaction history.
          </p>

          {/* 2 Buttons (Verseo exact style) */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/app"
              className="inline-flex items-center justify-center rounded-lg bg-[#181818] px-6 py-3 text-xs sm:text-sm font-medium text-white transition-all hover:bg-[#2b2b2b] shadow-sm active:scale-95"
            >
              Get Started
            </Link>
            <Link
              href="/payer"
              className="inline-flex items-center justify-center rounded-lg border border-[#ededed] bg-white px-6 py-3 text-xs sm:text-sm font-medium text-[#181818] transition-all hover:bg-[#f6f6f6] shadow-xs active:scale-95"
            >
              Try Demo
            </Link>
          </div>
        </div>

        {/* Hero Browser Mockup with Floating Prompt Bar (Exact Verseo Image 1 Replica) */}
        <div className="relative mt-14 sm:mt-18 mx-auto max-w-5xl">
          {/* Floating Prompt Bar */}
          <div className="relative z-20 mx-auto max-w-2xl rounded-2xl border border-white/80 bg-white/95 p-3 sm:p-4 shadow-[0_12px_40px_rgba(0,0,0,0.08)] backdrop-blur-md">
            <div className="flex items-center gap-3">
              <span className="text-[#858585] text-xs">✦</span>
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="What income do you want to prove today?"
                className="w-full bg-transparent font-sans text-xs sm:text-sm text-[#181818] placeholder:text-[#858585] focus:outline-none"
              />
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#ededed]/60">
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

              {/* Waveform Icon on right */}
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#181818] text-white">
                <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2a1 1 0 011 1v18a1 1 0 11-2 0V3a1 1 0 011-1zm-6 4a1 1 0 011 1v10a1 1 0 11-2 0V7a1 1 0 011-1zm12 0a1 1 0 011 1v10a1 1 0 11-2 0V7a1 1 0 011-1z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Underneath Browser Window */}
          <div className="relative -mt-8 rounded-2xl border border-white/80 bg-white/90 p-4 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.06)] backdrop-blur-md">
            {/* macOS Window Controls */}
            <div className="flex items-center gap-2 border-b border-[#ededed]/60 pb-4">
              <span className="h-3 w-3 rounded-full bg-[#ff5f56]" />
              <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
              <span className="h-3 w-3 rounded-full bg-[#27c93f]" />
            </div>

            {/* Window Content Grid */}
            <div className="mt-4 grid grid-cols-12 gap-6 min-h-[220px]">
              {/* Left Mock Sidebar */}
              <div className="hidden sm:block sm:col-span-3 border-r border-[#ededed]/60 pr-4 space-y-3">
                <div className="rounded-lg bg-[#f6f6f6] px-3 py-1.5 font-sans text-xs font-semibold text-[#181818]">
                  New claim
                </div>
                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-2">
                    <div className="h-3.5 w-3.5 rounded bg-[#ededed]" />
                    <div className="h-2.5 w-20 rounded bg-[#ededed]" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3.5 w-3.5 rounded bg-[#ededed]" />
                    <div className="h-2.5 w-24 rounded bg-[#ededed]" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3.5 w-3.5 rounded bg-[#ededed]" />
                    <div className="h-2.5 w-16 rounded bg-[#ededed]" />
                  </div>
                </div>
              </div>

              {/* Main Prompt & Output Area */}
              <div className="col-span-12 sm:col-span-9 space-y-4">
                {/* Prompt Bubble on Right */}
                <div className="flex justify-end">
                  <div className="rounded-xl bg-[#f6f6f6] p-3 text-xs text-[#181818] max-w-md shadow-2xs">
                    <span className="font-mono text-[10px] text-[#858585] block mb-1">prompt:</span>
                    {prompt}
                  </div>
                </div>

                {/* Skeleton placeholders */}
                <div className="space-y-2 max-w-md pt-2">
                  <div className="h-2.5 w-full rounded bg-[#ededed]/80" />
                  <div className="h-2.5 w-3/4 rounded bg-[#ededed]/60" />
                </div>

                {/* Generating Status Badge */}
                <div className="pt-2">
                  <div className="inline-flex items-center gap-2 rounded-lg bg-[#10b981]/10 px-3 py-1 text-xs font-mono font-medium text-[#059669] border border-[#10b981]/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#10b981] animate-pulse" />
                    <span>generating zero-knowledge proof...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
