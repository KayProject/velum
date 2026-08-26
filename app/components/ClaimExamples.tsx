export function ClaimExamples() {
  const examples = [
    {
      title: "Quarterly Tenancy Verification",
      desc: "Learn how independent contractors and freelancers use ZK proofs to streamline apartment lease applications, eliminate PDF redactions, and protect total balances.",
      category: "Residential | Lease | Freelancers",
      badges: ["Ready to verify", "Generated in 1.4s"],
    },
    {
      title: "Home Mortgage Underwriting",
      desc: "Generate verifiable income claims with clear threshold criteria, strong cryptographic backing, and unforgeable identity anchors for bank loan officers.",
      category: "Banking | Loan | DAO Contributors",
      badges: ["Ready to submit", "Zero balance leak"],
    },
    {
      title: "Digital Nomad Visa Permit",
      desc: "Satisfy embassy minimum income thresholds with unforgeable proof tokens that communicate qualification clearly, build trust, and expire automatically.",
      category: "Immigration | Visa | Remote Workers",
      badges: ["Single-use verified", "Expires in 30 days"],
    },
  ];

  return (
    <section id="examples" className="border-b border-[#ededed] py-20 sm:py-28 bg-white">
      <div className="mx-auto max-w-[1360px] px-4 sm:px-6">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#ededed] bg-[#f6f6f6] px-3.5 py-1 text-xs font-mono text-[#686868]">
            <span>[</span>
            <span className="text-[#181818] font-medium">examples</span>
            <span>]</span>
          </div>

          <h2 className="mt-6 font-display text-3xl sm:text-5xl font-bold tracking-tight text-[#181818]">
            See what you can <br className="hidden sm:inline" />
            prove with Velum
          </h2>

          <p className="mt-4 text-sm sm:text-base text-[#686868] max-w-xl mx-auto">
            From apartment leases and mortgage applications to digital nomad visas — generate verifiable claims tailored to any recipient in seconds.
          </p>
        </div>

        {/* 3 Showcase Cards (Verseo exact layout) */}
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {examples.map((ex, i) => (
            <div
              key={i}
              className="flex flex-col justify-between rounded-[24px] border border-[#ededed] bg-[#f9f9f9] p-6 sm:p-8 transition-all hover:border-[#181818]/20 hover:bg-white hover:shadow-sm"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {ex.badges.map((b, bi) => (
                    <span
                      key={bi}
                      className="rounded-full bg-white border border-[#ededed] px-2.5 py-0.5 font-mono text-[10px] font-medium text-[#181818]"
                    >
                      {b}
                    </span>
                  ))}
                </div>

                <h3 className="font-display text-lg sm:text-xl font-bold text-[#181818]">
                  {ex.title}
                </h3>

                <p className="mt-3 text-xs sm:text-sm leading-relaxed text-[#686868]">
                  {ex.desc}
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-[#ededed]">
                <span className="font-mono text-[11px] text-[#858585]">
                  {ex.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
