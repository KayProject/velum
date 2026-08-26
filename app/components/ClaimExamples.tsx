"use client";

import { useState } from "react";

export function ClaimExamples() {
  const examples = [
    {
      id: "tenancy",
      tab: "Apartment Lease",
      title: "Berlin Flat Tenancy Application",
      category: "Tenancy | Real Estate | Private Earner",
      verifier: "Meridian Properties GmbH",
      window: "1 Jan 2026 – 31 Mar 2026",
      threshold: "₦4,200,000 (equiv. ~2,800 STRK)",
      statement: "Qualifying income from a single verified payer exceeded ₦4,200,000 between 1 Jan and 31 Mar 2026.",
      hiddenData: ["Total bank balance", "Other 3 client contracts", "Crypto trading history", "Personal expenses"],
      latency: "Validated in 1.4s",
      expiry: "Expires in 14 days",
    },
    {
      id: "mortgage",
      tab: "Mortgage Underwriting",
      title: "Digital Nomad Home Loan Qualification",
      category: "Banking | Mortgage | DAO Contributor",
      verifier: "Apex Credit Union Underwriting",
      window: "1 Oct 2025 – 31 Mar 2026 (6 Mos)",
      threshold: "$38,000 USD (equiv. in STRK)",
      statement: "Cumulative qualifying income from verified DAO treasuries exceeded $38,000 between 1 Oct 2025 and 31 Mar 2026.",
      hiddenData: ["Treasury wallet addresses", "Governance voting records", "Exact monthly salary breakdown", "DeFi liquidity positions"],
      latency: "Validated in 1.8s",
      expiry: "Expires in 30 days",
    },
    {
      id: "visa",
      tab: "Digital Nomad Visa",
      title: "Consulate Income Verification",
      category: "Immigration | Visa | Remote Worker",
      verifier: "Ministry of Foreign Affairs / Visa Portal",
      window: "1 Jan 2025 – 31 Dec 2025 (Annual)",
      threshold: "€32,000 EUR",
      statement: "Remote income from sovereign contracts exceeded €32,000 for the 2025 calendar year.",
      hiddenData: ["Employer client list", "Bank branch location", "Savings accounts", "Personal wire details"],
      latency: "Validated in 1.2s",
      expiry: "Single-Use Verified",
    },
  ];

  const [activeTab, setActiveTab] = useState(examples[0].id);
  const activeExample = examples.find((e) => e.id === activeTab) || examples[0];

  return (
    <section className="border-b border-[#e4e4e7] py-20 md:py-28 bg-white">
      <div className="mx-auto max-w-[1360px] px-6">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="font-mono text-xs font-semibold uppercase tracking-widest text-[#059669] bg-[#ecfdf5] border border-[#a7f3d0] px-3 py-1 rounded-full">
            [ real-world examples ]
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-[#111827] sm:text-4xl md:text-5xl">
            See what verifiers <br className="hidden sm:inline" />
            <span className="text-[#059669]">actually see.</span>
          </h2>
          <p className="mt-4 text-base text-[#4b5563]">
            Explore live claim scenarios across housing, mortgage lending, and visa processing.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
          {examples.map((ex) => (
            <button
              key={ex.id}
              type="button"
              onClick={() => setActiveTab(ex.id)}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                activeTab === ex.id
                  ? "bg-[#111827] text-white shadow-sm"
                  : "border border-[#e4e4e7] bg-[#fafafa] text-[#71717a] hover:bg-white hover:text-[#111827]"
              }`}
            >
              {ex.tab}
            </button>
          ))}
        </div>

        {/* Example Showcase Card */}
        <div className="mt-8 mx-auto max-w-4xl rounded-2xl border border-[#e4e4e7] bg-[#fafafa] p-6 sm:p-8 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e4e4e7] pb-4">
            <div>
              <span className="font-mono text-[11px] text-[#71717a]">
                {activeExample.category}
              </span>
              <h3 className="font-display text-xl font-bold text-[#111827]">
                {activeExample.title}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[#ecfdf5] border border-[#a7f3d0] px-3 py-1 font-mono text-xs font-semibold text-[#047857]">
                🟢 VERIFIED
              </span>
            </div>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-12">
            {/* Left: Verifier Output Box */}
            <div className="rounded-xl border border-[#e4e4e7] bg-white p-5 md:col-span-7 shadow-2xs">
              <div className="font-mono text-xs font-bold text-[#71717a] mb-2">
                VERIFIER VIEWPORT // {activeExample.verifier}
              </div>

              <p className="font-display text-base font-semibold leading-relaxed text-[#111827]">
                &ldquo;{activeExample.statement}&rdquo;
              </p>

              <div className="mt-6 space-y-2 border-t border-[#f4f4f5] pt-4 font-mono text-xs text-[#71717a]">
                <div className="flex justify-between">
                  <span>Verified Window:</span>
                  <span className="text-[#111827] font-medium">{activeExample.window}</span>
                </div>
                <div className="flex justify-between">
                  <span>Threshold Checked:</span>
                  <span className="text-[#059669] font-semibold">{activeExample.threshold}</span>
                </div>
                <div className="flex justify-between">
                  <span>Speed:</span>
                  <span className="text-[#111827] font-medium">{activeExample.latency}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="text-[#059669] font-medium">{activeExample.expiry}</span>
                </div>
              </div>
            </div>

            {/* Right: What stays 100% hidden */}
            <div className="flex flex-col justify-between rounded-xl border border-[#fee2e2]/60 bg-[#fff5f5] p-5 md:col-span-5">
              <div>
                <div className="font-mono text-xs font-bold text-[#dc2626] mb-3 flex items-center gap-1.5">
                  <span>🔒</span>
                  <span>100% CONCEALED &amp; PROTECTED</span>
                </div>
                <p className="text-xs text-[#6b7280] mb-4">
                  The verifier learned none of the following:
                </p>

                <ul className="space-y-2 text-xs font-medium text-[#374151]">
                  {activeExample.hiddenData.map((item, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="text-[#ef4444] font-bold text-xs">✕</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 pt-3 border-t border-[#fecaca] text-[11px] font-mono text-[#991b1b]">
                Zero balance or unrelated transactions leaked.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
