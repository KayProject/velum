export function Testimonials() {
  const reviews = [
    {
      score: "4,9",
      quote:
        "\"We tested several income verification tools, but Velum felt the most practical. It's fast, cryptographic, and fits naturally into our workflow.\"",
      name: "Emma Rodriguez",
      role: "Content Strategist & Freelancer",
    },
    {
      score: "5,0",
      quote:
        "\"Velum cut our leasing approval time in half. What used to take days of bank statement redactions now takes seconds, and our privacy is 100% protected.\"",
      name: "Sarah Chen",
      role: "Marketing Manager & DAO Contributor",
    },
    {
      score: "5,0",
      quote:
        "\"The biggest win for us is uncorrelatable identity. Every landlord and lender gets their own single-use proof without ever linking our accounts.\"",
      name: "David Miller",
      role: "Startup Founder & Contractor",
    },
  ];

  return (
    <section id="testimonials" className="border-b border-[#ededed] py-20 sm:py-28 bg-[#f9f9f9]">
      <div className="mx-auto max-w-[1360px] px-4 sm:px-6">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#ededed] bg-[#f6f6f6] px-3.5 py-1 text-xs font-mono text-[#686868]">
            <span>[</span>
            <span className="text-[#181818] font-medium">testimonials</span>
            <span>]</span>
          </div>

          <h2 className="mt-6 font-display text-3xl sm:text-5xl font-bold tracking-tight text-[#181818]">
            Loved by earners who <br className="hidden sm:inline" />
            value their financial privacy
          </h2>

          <p className="mt-4 text-sm sm:text-base text-[#686868] max-w-xl mx-auto">
            From independent contractors and DAO founders to underwriting teams — Velum helps people prove credibility without sacrificing privacy.
          </p>
        </div>

        {/* 3 Review Cards (Verseo exact layout) */}
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {reviews.map((r, i) => (
            <div
              key={i}
              className="flex flex-col justify-between rounded-[24px] border border-[#ededed] bg-white p-6 sm:p-8 shadow-2xs transition-all hover:border-[#181818]/20 hover:shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between border-b border-[#ededed] pb-4">
                  <span className="font-mono text-xs font-bold text-[#181818]">
                    {r.score}
                  </span>
                  <div className="flex text-[#10b981] text-xs">
                    ★★★★★
                  </div>
                </div>

                <p className="mt-6 text-xs sm:text-sm leading-relaxed text-[#686868]">
                  {r.quote}
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-[#ededed]/60">
                <div className="font-display text-sm font-bold text-[#181818]">
                  {r.name}
                </div>
                <div className="font-mono text-[11px] text-[#858585] mt-0.5">
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
