export function TheDifference() {
  const cards = [
    {
      title: "Fragmented disclosure",
      items: [
        "60-page PDF bank statements handed over for a simple check",
        "Total net worth and savings exposed to property agents",
        "Unrelated personal, family, and medical spending visible",
      ],
      isAccent: false,
    },
    {
      title: "Manual workflows",
      items: [
        "3 to 5 business days spent reviewing unredacted documents",
        "Permanent unencrypted files stored on third-party email servers",
        "High compliance liability and data breach exposure",
      ],
      isAccent: false,
    },
    {
      title: "Zero-knowledge proof flow",
      items: [
        "Generate verifiable single-assertion claims in seconds",
        "Unlinkable identity anchors scoped per verifier",
        "100% financial privacy retained with zero protocol custody",
      ],
      isAccent: true,
    },
  ];

  return (
    <section id="the-difference" className="border-b border-[#ededed] py-20 sm:py-28 bg-[#f9f9f9]">
      <div className="mx-auto max-w-[1360px] px-4 sm:px-6">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#ededed] bg-[#f6f6f6] px-3.5 py-1 text-xs font-mono text-[#686868]">
            <span>[</span>
            <span className="text-[#181818] font-medium">the difference</span>
            <span>]</span>
          </div>

          <h2 className="mt-6 font-display text-3xl sm:text-5xl font-bold tracking-tight text-[#181818]">
            Where disclosure friction ends, <br className="hidden sm:inline" />
            clarity begins
          </h2>

          <p className="mt-4 text-sm sm:text-base text-[#686868] max-w-xl mx-auto">
            See how zero-knowledge proofs replace slow, manual bank statement disclosures with fast, structured income verification.
          </p>
        </div>

        {/* 3-Card Grid (Verseo exact layout) */}
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {cards.map((c, i) => (
            <div
              key={i}
              className={`flex flex-col justify-between rounded-[24px] border p-6 sm:p-8 transition-all ${
                c.isAccent
                  ? "border-[#10b981]/40 bg-[#10b981]/5 shadow-sm ring-1 ring-[#10b981]/15"
                  : "border-[#ededed] bg-white shadow-2xs"
              }`}
            >
              <div>
                <h3 className="font-display text-lg sm:text-xl font-bold text-[#181818]">
                  {c.title}
                </h3>

                <ul className="mt-6 space-y-3.5">
                  {c.items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#686868]">
                      <span className={`font-bold mt-0.5 ${c.isAccent ? "text-[#10b981]" : "text-[#858585]"}`}>
                        {c.isAccent ? "✓" : "–"}
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 pt-4 border-t border-[#ededed]/60">
                <span className="font-mono text-[11px] uppercase tracking-wider text-[#858585]">
                  {c.isAccent ? "● Confirmed Zero-Knowledge" : "○ Traditional Disclosure"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
