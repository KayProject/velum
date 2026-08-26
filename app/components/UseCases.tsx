export function UseCases() {
  const useCases = [
    {
      num: "001",
      title: "For Freelancers & Contractors",
      desc: "Prove quarterly revenue to landlords and rental agencies without disclosing client NDAs, individual invoice rates, or unrelated income streams. Quickly generate tailored claims for any landlord in seconds.",
    },
    {
      num: "002",
      title: "For DAO Contributors & Builders",
      desc: "Transform private, shielded token payroll into institutional-grade income verification for mortgages, auto loans, and banking credit — without doxxing your mainnet addresses or governance activity.",
    },
    {
      num: "003",
      title: "For Pseudonymous & Global Talent",
      desc: "Satisfy consulate minimum income thresholds and digital nomad permits worldwide with an unforgeable, cryptographically signed claim that expires as soon as underwriting concludes.",
    },
  ];

  return (
    <section id="use-cases" className="border-b border-[#ededed] py-20 sm:py-28 bg-[#f9f9f9]">
      <div className="mx-auto max-w-[1360px] px-4 sm:px-6">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#ededed] bg-[#f6f6f6] px-3.5 py-1 text-xs font-mono text-[#686868]">
            <span>[</span>
            <span className="text-[#181818] font-medium">use cases</span>
            <span>]</span>
          </div>

          <h2 className="mt-6 font-display text-3xl sm:text-5xl font-bold tracking-tight text-[#181818]">
            Built for how you <br className="hidden sm:inline" />
            actually earn and live
          </h2>

          <p className="mt-4 text-sm sm:text-base text-[#686868] max-w-xl mx-auto">
            Whether you are freelancing across borders, contributing to DAOs, or operating under a pseudonym, Velum adapts to your life.
          </p>
        </div>

        {/* 3-Card Grid (Verseo exact layout with 001, 002, 003 numbers) */}
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {useCases.map((u, i) => (
            <div
              key={i}
              className="flex flex-col justify-between rounded-[24px] border border-[#ededed] bg-white p-6 sm:p-8 shadow-2xs transition-all hover:border-[#181818]/20 hover:shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between border-b border-[#ededed] pb-4">
                  <h3 className="font-display text-base sm:text-lg font-bold text-[#181818]">
                    {u.title}
                  </h3>
                  <span className="font-mono text-sm font-bold text-[#858585]">
                    {u.num}
                  </span>
                </div>

                <p className="mt-6 text-xs sm:text-sm leading-relaxed text-[#686868]">
                  {u.desc}
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-[#ededed]/60 flex items-center justify-between font-mono text-[11px] text-[#858585]">
                <span>Zero Disclosure</span>
                <span className="text-[#10b981] font-semibold">● Ready</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
