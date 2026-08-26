export function Testimonials() {
  const reviews = [
    {
      score: "5.0",
      quote:
        "I secured a flat in London with my shielded DAO income. Instead of handing over 40 pages of bank statements, I generated a Velum claim. My landlord verified my quarterly threshold in seconds.",
      author: "Alex Rivera",
      role: "Protocol Engineer & Independent Contractor",
    },
    {
      score: "5.0",
      quote:
        "We pay dozens of core contributors privately through Starknet. Emitting Velum attestations requires zero overhead and gives our team real-world credit credibility without doxxing treasury rails.",
      author: "Sarah Chen",
      role: "DAO Operations Lead",
    },
    {
      score: "4.9",
      quote:
        "Traditional underwriting demanded unredacted bank PDF statements or complete wallet disclosures. Velum gives us mathematical certainty on income thresholds with zero data liability.",
      author: "Marcus Vance",
      role: "Fintech Underwriter & Risk Officer",
    },
  ];

  return (
    <section className="border-b border-[#e4e4e7] py-20 md:py-28 bg-[#fafafa]">
      <div className="mx-auto max-w-[1360px] px-6">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="font-mono text-xs font-semibold uppercase tracking-widest text-[#059669] bg-[#ecfdf5] border border-[#a7f3d0] px-3 py-1 rounded-full">
            [ user perspectives ]
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-[#111827] sm:text-4xl md:text-5xl">
            Trusted by earners, DAOs, <br className="hidden sm:inline" />
            <span className="text-[#059669]">and underwriters.</span>
          </h2>
          <p className="mt-4 text-base text-[#4b5563]">
            See why privacy-conscious professionals and forward-thinking landlords choose zero-knowledge verification.
          </p>
        </div>

        {/* 3 Review Cards */}
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {reviews.map((r, i) => (
            <div
              key={i}
              className="flex flex-col justify-between rounded-2xl border border-[#e4e4e7] bg-white p-7 shadow-2xs transition-all hover:border-[#10b981]"
            >
              <div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, s) => (
                    <span key={s} className="text-[#10b981] text-sm">★</span>
                  ))}
                  <span className="ml-2 font-mono text-xs font-bold text-[#111827]">
                    {r.score}
                  </span>
                </div>

                <p className="mt-4 text-xs leading-relaxed text-[#374151] italic">
                  &ldquo;{r.quote}&rdquo;
                </p>
              </div>

              <div className="mt-6 border-t border-[#f4f4f5] pt-4">
                <div className="font-display text-sm font-bold text-[#111827]">
                  {r.author}
                </div>
                <div className="font-mono text-[11px] text-[#71717a]">
                  {r.role}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
