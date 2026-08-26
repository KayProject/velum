export function HowItWorks() {
  const steps = [
    {
      step: "Step 01",
      title: "Payer Records Attestation",
      desc: "When paying an earner, the employer or DAO writes a signed attestation commitment to Velum alongside their regular shielded transaction. The attestation binds the recipient tag, amount, and payment window.",
      tag: "EMIT COMMITMENT",
      code: "velum.record_attestation(recipient_tag, hash(amount, window))",
    },
    {
      step: "Step 02",
      title: "Earner Generates Claim",
      desc: "The earner selects the payment window, configures the minimum threshold to prove, and binds the verification code to the intended recipient. A single private client transaction executes inside a proven virtual block.",
      tag: "COMPUTE & INVOKE",
      code: "velum.compute_and_invoke(attestations, min_threshold, verifier_tag)",
    },
    {
      step: "Step 03",
      title: "Verifier Validates Instantly",
      desc: "The verifier opens the unique claim link. They see a green checkmark and a single line of truth. No crypto wallet, zero gas, no private keys, and zero custody required.",
      tag: "SINGLE-USE VERIFY",
      code: "GET /v/[claim] → 🟢 Verified: Qualifying income exceeded threshold",
    },
  ];

  return (
    <section id="how-it-works" className="border-b border-[#e4e4e7] py-20 md:py-28 bg-white">
      <div className="mx-auto max-w-[1360px] px-6">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="font-mono text-xs font-semibold uppercase tracking-widest text-[#059669] bg-[#ecfdf5] border border-[#a7f3d0] px-3 py-1 rounded-full">
            [ how it works ]
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-[#111827] sm:text-4xl md:text-5xl">
            Three steps. <br className="hidden sm:inline" />
            <span className="text-[#059669]">Zero financial leaks.</span>
          </h2>
          <p className="mt-4 text-base text-[#4b5563]">
            No complex manual audit trails or privacy compromises — just mathematical proof of income
            powered by Starknet privacy primitives.
          </p>
        </div>

        {/* 3 Steps Process Grid */}
        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {steps.map((s, idx) => (
            <div
              key={idx}
              className="relative flex flex-col justify-between rounded-2xl border border-[#e4e4e7] bg-[#fafafa] p-7 transition-all hover:border-[#10b981]/50 hover:bg-white hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#059669]">
                    {s.step}
                  </span>
                  <span className="rounded-full bg-white border border-[#e4e4e7] px-2.5 py-0.5 font-mono text-[10px] font-semibold text-[#71717a]">
                    {s.tag}
                  </span>
                </div>

                <h3 className="mt-4 font-display text-lg font-bold text-[#111827]">
                  {s.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-[#4b5563]">
                  {s.desc}
                </p>
              </div>

              <div className="mt-6 overflow-x-auto rounded-xl border border-[#e4e4e7] bg-[#111827] p-3 font-mono text-[11px] text-[#ecfdf5]">
                <span className="text-[#34d399]">$ </span>
                <span className="text-[#e5e7eb]">{s.code}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
