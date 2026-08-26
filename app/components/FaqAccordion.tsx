"use client";

import { useState } from "react";

export function FaqAccordion() {
  const faqs = [
    {
      q: "What is Velum?",
      a: "Velum is the zero-knowledge proof layer for private income on Starknet (STRK20). It allows freelancers, contractors, and DAO contributors to prove qualifying earnings to landlords, lenders, and visa officers with a single time-limited assertion — without disclosing bank statements, balances, or unrelated transactions.",
    },
    {
      q: "Does the verifier need a crypto wallet or account?",
      a: "No. Verifiers need no wallet, no account, no browser extension, and zero gas. They simply open the secure claim link in any standard browser and view the verified assertion.",
    },
    {
      q: "Can a verifier see my full balance or other clients?",
      a: "No. The verifier sees only one line: that qualifying income exceeded the specific threshold during the specified window. Total balances, client rosters, and other income sources remain completely hidden inside the client zero-knowledge proof.",
    },
    {
      q: "How does Velum prevent fabricated income records?",
      a: "Income claims must be backed by cryptographic attestations signed with the payer's key. Furthermore, the earner proves control of those payments using Starknet's STRK20 identity anchor derived from their viewing key. Neither the earner nor an imposter can manufacture fake claims.",
    },
    {
      q: "Can verifiers correlate my identity across different applications?",
      a: "No. Velum derives identity anchors per target contract: h(IDENTITY_KEY_TAG, user_addr, private_key, contract_address). Presenting a proof to Landlord A produces an anchor that is cryptographically distinct and unlinkable to your verification at Lender B.",
    },
    {
      q: "Does Velum hold funds in custody or escrow?",
      a: "Never. Velum takes zero custody of tokens, requires no deposit lockups, and has no administrative keys or governance roles that could freeze user assets.",
    },
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="border-b border-[#e4e4e7] py-20 md:py-28 bg-[#fafafa]">
      <div className="mx-auto max-w-[1360px] px-6">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="font-mono text-xs font-semibold uppercase tracking-widest text-[#059669] bg-[#ecfdf5] border border-[#a7f3d0] px-3 py-1 rounded-full">
            [ faq ]
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-[#111827] sm:text-4xl md:text-5xl">
            Everything you need <br className="hidden sm:inline" />
            <span className="text-[#059669]">to know.</span>
          </h2>
          <p className="mt-4 text-base text-[#4b5563]">
            Common questions about zero-knowledge income proofs, verifier security, and Starknet privacy mechanics.
          </p>
        </div>

        {/* Accordion List */}
        <div className="mt-14 mx-auto max-w-3xl space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-[#e4e4e7] bg-white transition-all overflow-hidden shadow-2xs"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <span className="font-display text-base font-bold text-[#111827]">
                    {faq.q}
                  </span>
                  <span className="ml-4 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#f4f4f5] text-xs font-mono font-bold text-[#71717a]">
                    {isOpen ? "−" : "+"}
                  </span>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-0 text-sm leading-relaxed text-[#4b5563] border-t border-[#f4f4f5]">
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
