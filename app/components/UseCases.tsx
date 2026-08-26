"use client";

import { useState } from "react";

export function UseCases() {
  const [activeTab, setActiveTab] = useState(0);

  const cases = [
    {
      num: "001",
      tag: "FOR FREELANCERS & CONTRACTORS",
      title: "For freelancers & contractors",
      desc: "Prove quarterly revenue to landlords and rental agencies without disclosing client NDAs, individual invoice rates, or unrelated income streams. Quickly generate tailored single-use claims, test different threshold angles, and adapt your verification for any landlord in seconds.",
    },
    {
      num: "002",
      tag: "FOR DAO CONTRIBUTORS & BUILDERS",
      title: "For DAO contributors & builders",
      desc: "Transform private, shielded token payroll into institutional-grade income verification for mortgages, auto loans, and banking credit — without doxxing your mainnet addresses or governance treasury rails.",
    },
    {
      num: "003",
      tag: "FOR PSEUDONYMOUS & GLOBAL TALENT",
      title: "For pseudonymous & global talent",
      desc: "Satisfy consulate minimum income thresholds and digital nomad permits worldwide with an unforgeable, cryptographically signed claim that expires as soon as underwriting concludes.",
    },
  ];

  return (
    <section id="use-cases" className="py-20 sm:py-28 border-b border-[#ededed]/60 bg-transparent">
      <div className="mx-auto max-w-[1360px] px-6 sm:px-10">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center text-xs font-mono text-[#686868] mb-4">
            <span>[ use cases ]</span>
          </div>

          <h2 className="font-display text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#181818] leading-[1.15]">
            Built for how you actually <br />
            earn and live
          </h2>

          <p className="mt-4 text-sm sm:text-base text-[#686868] max-w-xl mx-auto">
            Whether you are freelancing across borders, contributing to DAOs, or operating under a pseudonym, Velum adapts to your workflow.
          </p>
        </div>

        {/* macOS Style Interactive Expandable Container (Verseo Image 4 Exact Replica) */}
        <div className="mt-14 mx-auto max-w-5xl rounded-2xl border border-[#ededed] bg-white/90 shadow-sm overflow-hidden backdrop-blur-xs">
          {/* Top Bar with Traffic Lights */}
          <div className="flex items-center gap-2 border-b border-[#ededed] px-6 py-3.5 bg-[#fcfcfc]">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
            <span className="ml-3 font-mono text-[10px] font-semibold text-[#858585] tracking-wider uppercase">
              {cases[activeTab].tag}
            </span>
          </div>

          {/* Rows */}
          <div className="divide-y divide-[#ededed]">
            {cases.map((c, i) => {
              const isExpanded = activeTab === i;
              return (
                <div
                  key={i}
                  className={`transition-colors ${isExpanded ? "bg-white" : "bg-[#fcfcfc] hover:bg-white"}`}
                >
                  <button
                    type="button"
                    onClick={() => setActiveTab(isExpanded ? (i === 0 ? 1 : 0) : i)}
                    className="w-full flex items-center justify-between p-6 sm:p-8 text-left"
                  >
                    <div className="flex items-center gap-6">
                      {/* Left Badge */}
                      <span
                        className={`inline-flex items-center justify-center rounded-md px-3 py-1.5 font-mono text-xs font-bold transition-all ${
                          isExpanded
                            ? "bg-[#181818] text-white shadow-xs"
                            : "bg-[#ededed] text-[#858585]"
                        }`}
                      >
                        {c.num}
                      </span>

                      {/* Expanded Icon Box */}
                      {isExpanded && (
                        <div className="hidden sm:flex h-16 w-16 items-center justify-center rounded-2xl border border-[#ededed] bg-[#f9f9f9] text-[#8b5cf6]">
                          <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor">
                            <rect x="2" y="2" width="4" height="4" rx="1" />
                            <rect x="10" y="2" width="4" height="4" rx="1" />
                            <rect x="18" y="2" width="4" height="4" rx="1" />
                            <rect x="6" y="10" width="4" height="4" rx="1" />
                            <rect x="14" y="10" width="4" height="4" rx="1" />
                            <rect x="10" y="18" width="4" height="4" rx="1" />
                          </svg>
                        </div>
                      )}

                      {/* Content */}
                      <div>
                        <h3 className="font-display text-lg sm:text-xl font-bold text-[#181818]">
                          {c.title}
                        </h3>
                        {isExpanded && (
                          <p className="mt-3 text-xs sm:text-sm leading-relaxed text-[#686868] max-w-2xl">
                            {c.desc}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Expand / Collapse Icon on Right */}
                    <div className="ml-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#ededed] bg-[#f9f9f9] text-[#181818] text-sm font-bold">
                      {isExpanded ? "—" : "+"}
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
