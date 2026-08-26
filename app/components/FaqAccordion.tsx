"use client";

import { useState } from "react";

export function FaqAccordion() {
  const faqs = [
    {
      q: "What is Velum?",
      a: "Velum is a zero-knowledge income verification layer built on Starknet STRK20. It allows earners to generate time-limited, mathematically proven income claims for landlords, lenders, and visa officers without disclosing bank statements, balances, or unrelated transactions.",
    },
    {
      q: "Who is Velum designed for?",
      a: "Velum is designed for freelancers, independent contractors, DAO contributors, and pseudonymous professionals who earn confidential or crypto income and need to prove qualification to traditional real-world institutions.",
    },
    {
      q: "Do I need any cryptographic experience?",
      a: "No. The interface works in any standard web browser. You select your payer, date range, and threshold, and Velum handles the client-side virtual block computation automatically.",
    },
    {
      q: "Can I customize the generated claim?",
      a: "Yes. You can specify the exact minimum threshold (in NGN, STRK, USD, or EUR), the date window, and bind the claim solely to a specific verifier code so it cannot be forwarded or traded.",
    },
    {
      q: "What types of proof claims can I create?",
      a: "You can create claims for residential tenancy leases, mortgage loan underwriting, vehicle financing, digital nomad visas, and commercial contracts.",
    },
    {
      q: "Does the verifier need a crypto wallet or account?",
      a: "No. Verifiers simply open the unique link in a standard web browser and see a verified statement in less than 2 seconds with zero gas and zero install.",
    },
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="border-b border-[#ededed] py-20 sm:py-28 bg-[#f9f9f9]">
      <div className="mx-auto max-w-[1360px] px-4 sm:px-6">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#ededed] bg-[#f6f6f6] px-3.5 py-1 text-xs font-mono text-[#686868]">
            <span>[</span>
            <span className="text-[#181818] font-medium">faq</span>
            <span>]</span>
          </div>

          <h2 className="mt-6 font-display text-3xl sm:text-5xl font-bold tracking-tight text-[#181818]">
            Everything you need <br className="hidden sm:inline" />
            to know
          </h2>
        </div>

        {/* Accordion List (Verseo exact layout) */}
        <div className="mt-14 mx-auto max-w-3xl space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-[#ededed] bg-white overflow-hidden shadow-2xs transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-5 sm:p-6 text-left"
                >
                  <span className="font-display text-sm sm:text-base font-bold text-[#181818]">
                    {faq.q}
                  </span>
                  <span className="ml-4 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#f6f6f6] text-xs font-mono font-medium text-[#686868]">
                    {isOpen ? "−" : "+"}
                  </span>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 pt-0 text-xs sm:text-sm leading-relaxed text-[#686868] border-t border-[#ededed]/60">
                    <div className="pt-4">{faq.a}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
