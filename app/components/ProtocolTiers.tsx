"use client";

import Link from "next/link";
import { useState } from "react";

export function ProtocolTiers() {
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");

  const plans = [
    {
      name: "Starter",
      desc: "For individuals and freelancers",
      priceMonthly: "$0",
      priceAnnual: "$0",
      period: "Free forever",
      features: [
        "Client-side ZK claim generator",
        "Unlinkable identity anchors",
        "Multi-currency threshold claims",
        "Open source under Apache-2.0",
      ],
      popular: false,
      cta: "Get Started",
      href: "/app",
    },
    {
      name: "Pro",
      desc: "For creators and professionals",
      priceMonthly: "$29",
      priceAnnual: "$24",
      period: "per month",
      features: [
        "Advanced multi-payer aggregation",
        "Automated expiration rules",
        "Priority virtual block proving",
        "Custom verifier challenge bindings",
      ],
      popular: true,
      cta: "Get Started",
      href: "/app",
    },
    {
      name: "Team",
      desc: "For agencies and growing teams",
      priceMonthly: "$79",
      priceAnnual: "$64",
      period: "per month",
      features: [
        "Batch attestation emission SDK",
        "Multi-recipient payroll commitment",
        "Shared team workspace",
        "Priority institutional support",
      ],
      popular: false,
      cta: "Payer Console",
      href: "/payer",
    },
  ];

  return (
    <section id="pricing" className="border-b border-[#ededed] py-20 sm:py-28 bg-white">
      <div className="mx-auto max-w-[1360px] px-4 sm:px-6">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#ededed] bg-[#f6f6f6] px-3.5 py-1 text-xs font-mono text-[#686868]">
            <span>[</span>
            <span className="text-[#181818] font-medium">pricing</span>
            <span>]</span>
          </div>

          <h2 className="mt-6 font-display text-3xl sm:text-5xl font-bold tracking-tight text-[#181818]">
            Choose the plan that <br className="hidden sm:inline" />
            grows with you
          </h2>

          <p className="mt-4 text-sm sm:text-base text-[#686868] max-w-xl mx-auto">
            Whether you are creating claims solo or managing payroll across a team, there is a plan designed for your workflow.
          </p>

          {/* Monthly / Annual Toggle (Verseo exact layout) */}
          <div className="mt-8 inline-flex items-center rounded-full border border-[#ededed] bg-[#f9f9f9] p-1 shadow-2xs">
            <button
              type="button"
              onClick={() => setBilling("monthly")}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                billing === "monthly"
                  ? "bg-[#181818] text-white shadow-2xs"
                  : "text-[#686868] hover:text-[#181818]"
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBilling("annual")}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                billing === "annual"
                  ? "bg-[#181818] text-white shadow-2xs"
                  : "text-[#686868] hover:text-[#181818]"
              }`}
            >
              Annual
            </button>
          </div>
        </div>

        {/* 3 Pricing Cards (Verseo exact layout) */}
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {plans.map((p, i) => (
            <div
              key={i}
              className={`flex flex-col justify-between rounded-[24px] border p-6 sm:p-8 transition-all ${
                p.popular
                  ? "border-[#181818] bg-[#f9f9f9] shadow-md ring-1 ring-[#181818]/10"
                  : "border-[#ededed] bg-white shadow-2xs hover:border-[#181818]/20"
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display text-xl font-bold text-[#181818]">
                      {p.name}
                    </h3>
                    <p className="mt-1 text-xs text-[#686868]">{p.desc}</p>
                  </div>
                  {p.popular && (
                    <span className="rounded-full bg-[#181818] px-3 py-1 font-mono text-[10px] font-semibold text-white">
                      Popular
                    </span>
                  )}
                </div>

                <div className="mt-6 border-y border-[#ededed] py-5">
                  <div className="flex items-baseline gap-1">
                    <span className="font-display text-4xl font-extrabold text-[#181818]">
                      {billing === "monthly" ? p.priceMonthly : p.priceAnnual}
                    </span>
                    <span className="font-mono text-xs text-[#858585]">
                      / {p.period}
                    </span>
                  </div>
                </div>

                <ul className="mt-6 space-y-3.5">
                  {p.features.map((f, fi) => (
                    <li key={fi} className="flex items-center gap-2.5 text-xs text-[#686868]">
                      <span className="text-[#10b981] font-bold">✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 pt-4">
                <Link
                  href={p.href}
                  className={`w-full block text-center rounded-full py-3 text-xs font-medium transition-all ${
                    p.popular
                      ? "bg-[#181818] text-white hover:bg-[#2b2b2b] shadow-sm"
                      : "border border-[#ededed] bg-white text-[#181818] hover:bg-[#f6f6f6]"
                  }`}
                >
                  {p.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
