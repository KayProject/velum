export function ResultsMetrics() {
  const metrics = [
    {
      stat: "100%",
      label: "Financial Privacy Retained",
      desc: "Zero transaction histories, client rosters, or account balances ever leave your device.",
    },
    {
      stat: "0",
      label: "Unrelated Data Leaked",
      desc: "Medical bills, family transfers, and personal habits remain completely hidden.",
    },
    {
      stat: "< 2s",
      label: "Verifier Confirmation Time",
      desc: "One-click browser validation. No Web3 wallet, extension, or deposit required.",
    },
    {
      stat: "0 STRK",
      label: "Protocol Custody Risk",
      desc: "Velum takes no token deposits, locks no collateral, and requires no admin keys.",
    },
  ];

  return (
    <section className="border-b border-[#e4e4e7] py-20 md:py-28 bg-[#fafafa]">
      <div className="mx-auto max-w-[1360px] px-6">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="font-mono text-xs font-semibold uppercase tracking-widest text-[#059669] bg-[#ecfdf5] border border-[#a7f3d0] px-3 py-1 rounded-full">
            [ verified outcomes ]
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-[#111827] sm:text-4xl md:text-5xl">
            Instant verification. <br className="hidden sm:inline" />
            <span className="text-[#059669]">Absolute data sovereignty.</span>
          </h2>
          <p className="mt-4 text-base text-[#4b5563]">
            Replace invasive PDF bank statement submissions with high-assurance cryptographic claims.
          </p>
        </div>

        {/* 4 Metrics Grid */}
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((m, idx) => (
            <div
              key={idx}
              className="flex flex-col justify-between rounded-2xl border border-[#e4e4e7] bg-white p-7 shadow-2xs transition-all hover:border-[#10b981]"
            >
              <div>
                <span className="font-display text-4xl font-extrabold tracking-tight text-[#111827]">
                  {m.stat}
                </span>
                <h3 className="mt-3 font-display text-base font-bold text-[#111827]">
                  {m.label}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-[#6b7280]">
                  {m.desc}
                </p>
              </div>

              <div className="mt-6 h-1 w-8 rounded-full bg-[#10b981]" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
