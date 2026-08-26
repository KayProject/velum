"use client";

import { useState } from "react";

export function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      badge: "STEP 1",
      title: "Enter your parameters",
      desc: "Describe what you want to prove in a simple prompt - even a rough idea works.",
      bubble: "Prove qualifying income >= ₦4,200,000 in 2026-Q1 from Acme DAO",
      status: "Turning your parameters into proof...",
    },
    {
      badge: "STEP 2",
      title: "Generate ZK proof",
      desc: "Velum turns your input into structured, cryptographic assertions in seconds inside a client virtual block.",
      bubble: "Executing poseidon threshold circuit over 3 private STRK20 attestations...",
      status: "Virtual block proven on client (0ms gas)...",
    },
    {
      badge: "STEP 3",
      title: "Verifier checks link",
      desc: "The verifier opens the unique single-use link, validates the green checkmark, and completes underwriting.",
      bubble: "🟢 Verified: Qualifying income exceeded ₦4,200,000 for 2026-Q1. No records leaked.",
      status: "Ready for landlord verification ✓",
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
            ready-to-use claims in seconds
          </h2>

          <p className="mt-4 text-sm sm:text-base text-[#686868] max-w-xl mx-auto">
            No complex tools or long workflows - just describe what you need, and Velum does the rest.
          </p>
        </div>

        {/* 2-Column Layout (Verseo Image 5 Exact Replica) */}
        <div className="mt-14 grid gap-8 lg:grid-cols-12 items-start">
          {/* Left Column: 3 Steps */}
          <div className="space-y-4 lg:col-span-4">
            {steps.map((s, idx) => {
              const isSelected = activeStep === idx;
              return (
                <div
                  key={idx}
                  onClick={() => setActiveStep(idx)}
                  className={`cursor-pointer rounded-2xl border p-6 transition-all ${
                    isSelected
                      ? "border-[#181818] bg-white shadow-md"
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

          {/* Right Column: App Mockup */}
          <div className="lg:col-span-8 flex flex-col justify-between rounded-2xl border border-[#ededed] bg-[#f9f9f9]/80 p-6 sm:p-8 min-h-[380px] shadow-xs">
            {/* Top quote */}
            <div className="text-right font-sans text-xs italic text-[#858585] mb-6">
              The simpler the input, the faster you get results
            </div>

            {/* Chat message bubble */}
            <div className="space-y-4 max-w-lg mx-auto w-full">
              <div className="flex justify-end">
                <div className="rounded-xl bg-[#ededed]/70 px-4 py-3 text-xs text-[#181818] shadow-2xs font-medium">
                  {steps[activeStep].bubble}
                </div>
              </div>

              <div className="text-[11px] font-mono text-[#858585] pl-2 flex items-center gap-1.5">
                <span>...</span>
                <span>{steps[activeStep].status}</span>
              </div>

              {/* Mockup Prompt bar */}
              <div className="rounded-2xl border border-[#ededed] bg-white p-3 sm:p-4 shadow-sm">
                <div className="flex flex-wrap items-center gap-2 pb-2.5 mb-2.5 border-b border-[#ededed]/60">
                  <span className="flex items-center gap-1 rounded bg-[#f6f6f6] px-2 py-0.5 text-[10px] font-medium text-[#181818]">
                    <span>⠶</span> Earner Proof
                  </span>
                  <span className="flex items-center gap-1 rounded bg-[#f6f6f6] px-2 py-0.5 text-[10px] font-medium text-[#686868]">
                    <span>⠶</span> Payer Tag
                  </span>
                  <span className="flex items-center gap-1 rounded bg-[#f6f6f6] px-2 py-0.5 text-[10px] font-medium text-[#686868]">
                    <span>⠶</span> Virtual Block
                  </span>
                  <span className="flex items-center gap-1 rounded bg-[#f6f6f6] px-2 py-0.5 text-[10px] font-medium text-[#686868]">
                    <span>⠶</span> Landlord Verify
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs text-[#858585]">
                    <span>✦</span>
                    <span className="text-[#181818] font-medium">Your claim is taking shape</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button type="button" className="flex h-6 w-6 items-center justify-center rounded bg-[#f6f6f6] text-xs text-[#181818]">
                      +
                    </button>
                    <span className="flex items-center gap-1 rounded-md border border-[#ededed] bg-[#fcfcfc] px-2 py-1 text-[10px] font-medium text-[#181818]">
                      ⚡ Client Virtual Block
                    </span>
                    <div className="flex h-6 w-6 items-center justify-center rounded bg-[#181818] text-white">
                      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2a1 1 0 011 1v18a1 1 0 11-2 0V3a1 1 0 011-1z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div />
          </div>
        </div>
      </div>
    </section>
  );
}
