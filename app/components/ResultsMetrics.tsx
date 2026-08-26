export function ResultsMetrics() {
  const blocks = [
    {
      title: "Stay in complete control",
      desc: "Generate, scope, and expire claims without breaking privacy. No more switching between PDF editors, bank portals, and unencrypted emails.",
      tagline: "No more disclosing raw bank statements.",
      metric: "100%",
      metricLabel: "Privacy Retained",
    },
    {
      title: "Ready to Verify",
      desc: "Review, test, share, and export your single-use verification links wherever you need them.",
      tagline: "Instant single-use verifier links.",
      metric: "< 2s",
      metricLabel: "Verification Speed",
    },
    {
      title: "Zero time spent in manual review",
      desc: "Instant mathematical validation replaces 5-day manual document reviews and compliance underwriting.",
      tagline: "Instant on-chain guarantee.",
      metric: "0",
      metricLabel: "Records Leaked",
    },
    {
      title: "Claims that fit anywhere",
      desc: "From residential tenancy and auto financing to cross-border visas and institutional loan underwriting.",
      tagline: "From local leases to global visas.",
      metric: "0 STRK",
      metricLabel: "Custody Required",
    },
  ];

  return (
    <section id="results" className="border-b border-[#ededed] py-20 sm:py-28 bg-[#f9f9f9]">
      <div className="mx-auto max-w-[1360px] px-4 sm:px-6">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#ededed] bg-[#f6f6f6] px-3.5 py-1 text-xs font-mono text-[#686868]">
            <span>[</span>
            <span className="text-[#181818] font-medium">results</span>
            <span>]</span>
          </div>

          <h2 className="mt-6 font-display text-3xl sm:text-5xl font-bold tracking-tight text-[#181818]">
            See the impact instantly
          </h2>

          <p className="mt-4 text-sm sm:text-base text-[#686868] max-w-xl mx-auto">
            Prove income faster, stay completely confidential across every verifier, and achieve better credibility with zero disclosure.
          </p>
        </div>

        {/* 4 Cards Grid (Verseo exact layout) */}
        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {blocks.map((b, i) => (
            <div
              key={i}
              className="flex flex-col justify-between rounded-[24px] border border-[#ededed] bg-white p-6 sm:p-8 shadow-2xs transition-all hover:border-[#181818]/20 hover:shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between border-b border-[#ededed] pb-4">
                  <h3 className="font-display text-lg sm:text-xl font-bold text-[#181818]">
                    {b.title}
                  </h3>
                  <div className="text-right">
                    <span className="font-display text-xl font-bold text-[#181818]">
                      {b.metric}
                    </span>
                    <span className="block font-mono text-[10px] text-[#858585]">
                      {b.metricLabel}
                    </span>
                  </div>
                </div>

                <p className="mt-6 text-xs sm:text-sm leading-relaxed text-[#686868]">
                  {b.desc}
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-[#ededed]/60">
                <span className="font-mono text-xs text-[#181818]">
                  {b.tagline}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
