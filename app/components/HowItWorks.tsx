"use client";

import { useState } from "react";

export function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      badge: "STEP 1",
      title: "Enter your parameters",
      desc: "Choose the payer, time window, and threshold amount in a simple prompt — or use standard housing & visa presets.",
      bubble: "Prove qualifying income >= ₦4,200,000 in 2026-Q1 from Acme DAO",
      status: "Configuring parameters...",
      renderVisual: () => (
        <div className="rounded-2xl border border-[#ededed] bg-white p-4 space-y-3 font-mono text-xs shadow-xs">
          <div className="flex justify-between items-center text-[11px] pb-2 border-b border-[#ededed]">
            <span className="text-[#858585]">CONFIG://EARNER_CLAIM</span>
            <span className="text-[#059669] font-bold">READY</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2 rounded bg-[#f6f6f6]">
              <span className="text-[#858585] block text-[10px]">PAYER</span>
              <span className="text-[#181818] font-semibold">Acme DAO</span>
            </div>
            <div className="p-2 rounded bg-[#f6f6f6]">
              <span className="text-[#858585] block text-[10px]">WINDOW</span>
              <span className="text-[#181818] font-semibold">2026-Q1</span>
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-[#ecfdf5] border border-[#a7f3d0] flex justify-between items-center text-[11px]">
            <span className="text-[#047857]">Floor Threshold:</span>
            <span className="font-bold text-[#065f46]">₦4,200,000 NGN</span>
          </div>
        </div>
      ),
    },
    {
      badge: "STEP 2",
      title: "Generate ZK proof",
      desc: "Velum executes a Cairo 2.0 virtual block on the client, evaluating your private STRK20 notes and attestations with zero gas.",
      bubble: "Executing poseidon threshold circuit over 3 private STRK20 attestations...",
      status: "Virtual block proven on client (0ms gas)...",
      renderVisual: () => (
        <div className="rounded-2xl border border-[#10b981]/40 bg-[#f0fdf4]/80 p-4 space-y-3 font-mono text-xs shadow-xs">
          <div className="flex justify-between items-center text-[11px] pb-2 border-b border-[#a7f3d0]">
            <span className="text-[#047857]">⚡ CAIRO_VM_VIRTUAL_BLOCK</span>
            <span className="text-[#059669] font-bold animate-pulse">PROVING</span>
          </div>
          <div className="space-y-1.5 text-[11px] text-[#065f46]">
            <div className="flex justify-between">
              <span>Attestation 1 (Jan 2026):</span>
              <span>1,400,000 ✓</span>
            </div>
            <div className="flex justify-between">
              <span>Attestation 2 (Feb 2026):</span>
              <span>1,400,000 ✓</span>
            </div>
            <div className="flex justify-between">
              <span>Attestation 3 (Mar 2026):</span>
              <span>1,400,000 ✓</span>
            </div>
          </div>
          <div className="pt-1.5 border-t border-[#a7f3d0] flex justify-between items-center text-[11px] font-bold text-[#059669]">
            <span>Aggregate Sum:</span>
            <span>₦4,200,000 &gt;= ₦4,200,000 (Pass)</span>
          </div>
        </div>
      ),
    },
    {
      badge: "STEP 3",
      title: "Verifier checks link",
      desc: "The verifier opens the single-use URL on any phone or browser. One green line verifies the claim; the link cannot be replayed.",
      bubble: "🟢 Verified: Qualifying income exceeded ₦4,200,000 for 2026-Q1. No records leaked.",
      status: "Verified & Locked against replay ✓",
      renderVisual: () => (
        <div className="rounded-2xl border border-[#ededed] bg-white p-5 space-y-3.5 shadow-sm text-center">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#10b981] text-white text-lg font-bold mx-auto shadow-xs">
            ✓
          </div>
          <div>
            <h4 className="font-display font-bold text-sm text-[#181818]">
              Income Requirement Satisfied
            </h4>
            <p className="font-mono text-[11px] text-[#059669] mt-0.5">
              Acme DAO · 2026-Q1 &gt;= ₦4,200,000
            </p>
          </div>
          <div className="rounded-lg bg-[#fafafa] border border-[#f0f0f0] p-2 font-mono text-[10px] text-[#858585] flex justify-between">
            <span>Verifier: Meridian Ltd</span>
            <span className="text-[#059669]">Single-Use Token Valid</span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section id="how-it-works" className="py-20 sm:py-28 border-b border-[#ededed]/60 bg-transparent">
      <div className="mx-auto max-w-[1360px] px-6 sm:px-10">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center text-xs font-mono text-[#686868] mb-4">
            <span>[ how it works ]</span>
          </div>

          <h2 className="font-display text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#181818] leading-[1.15]">
            Turn confidential earnings into <br />
            <span className="text-[#059669]">ready-to-use claims in seconds</span>
          </h2>

          <p className="mt-4 text-sm sm:text-base text-[#686868] max-w-xl mx-auto">
            No complex tools or long workflows — just select what you need, and Velum does the rest.
          </p>
        </div>

        {/* 2-Column Layout */}
        <div className="mt-14 grid gap-8 lg:grid-cols-12 items-start">
          {/* Left Column: 3 Steps */}
          <div className="space-y-4 lg:col-span-5">
            {steps.map((s, idx) => {
              const isSelected = activeStep === idx;
              return (
                <div
                  key={idx}
                  onClick={() => setActiveStep(idx)}
                  className={`cursor-pointer rounded-2xl border p-6 transition-all ${
                    isSelected
                      ? "border-[#181818] bg-white shadow-md ring-1 ring-[#181818]/10"
                      : "border-[#ededed] bg-[#fcfcfc] hover:bg-white hover:border-[#181818]/20"
                  }`}
                >
                  <span
                    className={`inline-block rounded-md px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider ${
                      isSelected ? "bg-[#181818] text-white" : "bg-[#ededed] text-[#858585]"
                    }`}
                  >
                    {s.badge}
                  </span>

                  <h3 className="mt-4 font-display text-base font-bold text-[#181818]">
                    {s.title}
                  </h3>

                  <p className="mt-2 text-xs leading-relaxed text-[#686868]">
                    {s.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Right Column: Dynamic Interactive Mockup */}
          <div className="lg:col-span-7 flex flex-col justify-between rounded-2xl border border-[#ededed] bg-[#fafafa] p-6 sm:p-8 min-h-[380px] shadow-xs">
            {/* Top quote */}
            <div className="text-right font-sans text-xs italic text-[#858585] mb-4">
              The simpler the input, the faster you get results
            </div>

            {/* Chat message bubble & Visual Card */}
            <div className="space-y-4 max-w-lg mx-auto w-full">
              <div className="flex justify-end">
                <div className="rounded-xl bg-white border border-[#ededed] px-4 py-3 text-xs text-[#181818] shadow-2xs font-medium">
                  {steps[activeStep].bubble}
                </div>
              </div>

              {/* Dynamic step-specific visual component */}
              <div className="py-2">
                {steps[activeStep].renderVisual()}
              </div>

              <div className="text-[11px] font-mono text-[#858585] pl-2 flex items-center gap-1.5">
                <span className="animate-pulse">●</span>
                <span>{steps[activeStep].status}</span>
              </div>
            </div>

            <div />
          </div>
        </div>
      </div>
    </section>
  );
}

