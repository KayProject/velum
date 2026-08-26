export function Features() {
  const features = [
    {
      tag: "IDENTITY ANCHORING",
      title: "Uncorrelatable Identity Proofs",
      desc: "Your identity key is derived uniquely per target contract: h(tag, user_addr, private_key, contract). Proving your income to Landlord A produces a cryptographic anchor that cannot be linked to your verification at Lender B.",
      code: "identity_key = poseidon(IDENTITY_TAG, addr, vk, contract)",
      badge: "Unlinkable",
    },
    {
      tag: "VIRTUAL BLOCK COMPUTE",
      title: "Client-Side Zero-Knowledge Sums",
      desc: "Income attestations are aggregated inside a client-proven virtual block. The individual payment amounts and dates stay inside the proof; only the boolean threshold assertion is published on-chain.",
      code: "assert sum(attestations) >= threshold_amount",
      badge: "Private Calldata",
    },
    {
      tag: "PAYER COMMITMENTS",
      title: "Payer-Signed Attestations",
      desc: "Payers emit a cryptographic commitment alongside normal payroll. Because attestations are signed with the payer's key, income records cannot be manufactured or forged by anyone else.",
      code: "attestation = sign_payer(recipient_tag, amount, window)",
      badge: "Non-Manufacturable",
    },
    {
      tag: "ZERO CUSTODY",
      title: "Instant Walletless Verification",
      desc: "Velum takes zero custody of funds, holds no escrow, and requires no governance keys. Verifiers need no crypto wallet, browser extension, or account — opening the single-use link validates the proof in seconds.",
      code: "custody = 0 STRK | gas = 0 for verifier",
      badge: "Zero Friction",
    },
  ];

  return (
    <section id="features" className="border-b border-[#e4e4e7] py-20 md:py-28 bg-white">
      <div className="mx-auto max-w-[1360px] px-6">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="font-mono text-xs font-semibold uppercase tracking-widest text-[#059669] bg-[#ecfdf5] border border-[#a7f3d0] px-3 py-1 rounded-full">
            [ core architecture ]
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-[#111827] sm:text-4xl md:text-5xl">
            Cryptographic certainty. <br className="hidden sm:inline" />
            <span className="text-[#059669]">Zero financial exposure.</span>
          </h2>
          <p className="mt-4 text-base text-[#4b5563]">
            Built directly on Cairo 2.0 and Starknet's STRK20 Privacy Pool. Every primitive is designed
            for mathematical soundness and uncompromising personal sovereignty.
          </p>
        </div>

        {/* 4-Bento Grid */}
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
          {features.map((feat, idx) => (
            <div
              key={idx}
              className="group relative flex flex-col justify-between rounded-2xl border border-[#e4e4e7] bg-[#fafafa] p-7 transition-all hover:border-[#10b981]/50 hover:bg-white hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-bold tracking-wider text-[#059669]">
                    {feat.tag}
                  </span>
                  <span className="rounded-full border border-[#e4e4e7] bg-white px-2.5 py-0.5 font-mono text-[10px] font-medium text-[#71717a]">
                    {feat.badge}
                  </span>
                </div>

                <h3 className="mt-4 font-display text-xl font-bold text-[#111827]">
                  {feat.title}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-[#4b5563]">
                  {feat.desc}
                </p>
              </div>

              <div className="mt-6 rounded-xl border border-[#e4e4e7] bg-[#111827] p-3 font-mono text-xs text-[#ecfdf5]">
                <span className="text-[#6ee7b7]">&gt; </span>
                <span className="text-[#d1d5db]">{feat.code}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
