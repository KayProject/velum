export function TheDifference() {
  const withoutVelum = [
    {
      title: "Full PDF Bank Statements",
      desc: "Handing over dozens of unredacted pages for a simple yes/no income check.",
    },
    {
      title: "Net Worth & Balance Exposure",
      desc: "Lenders and landlords learn your total savings and cash position.",
    },
    {
      title: "Personal Spending Leaks",
      desc: "Every transaction — medical, personal, and family — is permanently visible.",
    },
    {
      title: "Permanent Third-Party Trail",
      desc: "Your raw financial data sits on unencrypted leasing agents' email servers.",
    },
  ];

  const withVelum = [
    {
      title: "One Precise Assertion",
      desc: "Prove only that qualifying income exceeded the threshold in the required window.",
    },
    {
      title: "Uncorrelatable Identity Anchors",
      desc: "Your identity key derives uniquely per application. Landlord A cannot match you with Lender B.",
    },
    {
      title: "Zero Balance or History Leaked",
      desc: "Total savings, client names, and unrelated transfers remain completely hidden.",
    },
    {
      title: "Expiring, Single-Use Proofs",
      desc: "Proof tokens expire automatically and cannot be re-used or sold to data brokers.",
    },
  ];

  return (
    <section id="the-difference" className="border-b border-[#e4e4e7] py-20 md:py-28 bg-[#fafafa]">
      <div className="mx-auto max-w-[1360px] px-6">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="font-mono text-xs font-semibold uppercase tracking-widest text-[#059669] bg-[#ecfdf5] border border-[#a7f3d0] px-3 py-1 rounded-full">
            [ the difference ]
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-[#111827] sm:text-4xl md:text-5xl">
            Where disclosure friction ends, <br className="hidden sm:inline" />
            <span className="text-[#059669]">clarity begins.</span>
          </h2>
          <p className="mt-4 text-base text-[#4b5563]">
            Traditional income verification forces you to disclose a hundred facts to prove one.
            Velum proves the one fact and keeps everything else yours.
          </p>
        </div>

        {/* Comparison Grid */}
        <div className="mt-14 grid gap-8 md:grid-cols-2">
          {/* Card 1: Traditional Disclosures */}
          <div className="rounded-2xl border border-[#e4e4e7] bg-white p-6 sm:p-8 shadow-2xs relative">
            <div className="flex items-center justify-between border-b border-[#f4f4f5] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#fee2e2] text-[#dc2626] font-mono text-sm font-bold">
                  ✕
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-[#111827]">
                    Traditional Financial Disclosure
                  </h3>
                  <p className="text-xs text-[#71717a]">Invasive, manual, permanent</p>
                </div>
              </div>
              <span className="rounded-full bg-[#fee2e2] px-2.5 py-0.5 font-mono text-[10px] font-semibold text-[#dc2626]">
                OVEREXPOSED
              </span>
            </div>

            <div className="mt-6 space-y-5">
              {withoutVelum.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#fef2f2] text-[#ef4444] text-xs font-bold">
                    ✕
                  </span>
                  <div>
                    <h4 className="text-sm font-semibold text-[#111827]">
                      {item.title}
                    </h4>
                    <p className="mt-0.5 text-xs text-[#6b7280]">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: With Velum */}
          <div className="rounded-2xl border-2 border-[#10b981]/30 bg-white p-6 sm:p-8 shadow-sm relative ring-1 ring-[#10b981]/10">
            <div className="flex items-center justify-between border-b border-[#ecfdf5] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#ecfdf5] text-[#059669] font-mono text-sm font-bold">
                  ✓
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-[#111827]">
                    Velum Zero-Knowledge Proof
                  </h3>
                  <p className="text-xs text-[#059669]">Precise, mathematical, uncorrelatable</p>
                </div>
              </div>
              <span className="rounded-full bg-[#ecfdf5] border border-[#a7f3d0] px-2.5 py-0.5 font-mono text-[10px] font-semibold text-[#047857]">
                🟢 CONFIDENTIAL
              </span>
            </div>

            <div className="mt-6 space-y-5">
              {withVelum.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#ecfdf5] text-[#059669] text-xs font-bold">
                    ✓
                  </span>
                  <div>
                    <h4 className="text-sm font-semibold text-[#111827]">
                      {item.title}
                    </h4>
                    <p className="mt-0.5 text-xs text-[#6b7280]">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
