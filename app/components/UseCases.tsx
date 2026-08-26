export function UseCases() {
  const useCases = [
    {
      num: "001",
      role: "For Freelancers & Contractors",
      scenario: "Tenancy & Apartment Leases",
      desc: "Prove to a landlord that your quarterly revenue from a single client exceeded ₦4.2m without revealing client contracts, hourly rates, or how much you earned in other months.",
      outcome: "Landlord sees: 🟢 Verified threshold met for Q1. Zero NDAs broken.",
    },
    {
      num: "002",
      role: "For DAO Contributors & Web3 Workers",
      scenario: "Mortgages & Bank Credit Lines",
      desc: "Transform private, shielded token payroll into institutional-grade income verification for mortgages, auto loans, and credit underwriting without doxxing your mainnet addresses.",
      outcome: "Lender sees: 🟢 Recurring qualifying income validated. Zero balance leaked.",
    },
    {
      num: "003",
      role: "For Pseudonymous & Global Talent",
      scenario: "Visa & Digital Nomad Permits",
      desc: "Satisfy consulate and immigration minimum income thresholds worldwide with an unforgeable, cryptographically signed claim that expires as soon as underwriting concludes.",
      outcome: "Embassy sees: 🟢 Verified monthly income threshold. Zero treasury doxxing.",
    },
  ];

  return (
    <section id="use-cases" className="border-b border-[#e4e4e7] py-20 md:py-28 bg-[#fafafa]">
      <div className="mx-auto max-w-[1360px] px-6">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="font-mono text-xs font-semibold uppercase tracking-widest text-[#059669] bg-[#ecfdf5] border border-[#a7f3d0] px-3 py-1 rounded-full">
            [ use cases ]
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-[#111827] sm:text-4xl md:text-5xl">
            Built for how modern earners <br className="hidden sm:inline" />
            <span className="text-[#059669]">actually work.</span>
          </h2>
          <p className="mt-4 text-base text-[#4b5563]">
            Whether you are freelancing across borders, contributing to DAOs, or operating under a
            pseudonym, Velum turns private compensation into bankable credibility.
          </p>
        </div>

        {/* 3 Numbered Cards */}
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {useCases.map((uc, i) => (
            <div
              key={i}
              className="relative flex flex-col justify-between rounded-2xl border border-[#e4e4e7] bg-white p-7 shadow-2xs transition-all hover:border-[#10b981] hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between border-b border-[#f4f4f5] pb-4">
                  <span className="font-mono text-xs font-semibold text-[#059669]">
                    {uc.role}
                  </span>
                  <span className="font-mono text-xl font-bold text-[#d4d4d8]">
                    {uc.num}
                  </span>
                </div>

                <h3 className="mt-4 font-display text-lg font-bold text-[#111827]">
                  {uc.scenario}
                </h3>
                <p className="mt-2.5 text-xs leading-relaxed text-[#4b5563]">
                  {uc.desc}
                </p>
              </div>

              <div className="mt-6 rounded-xl bg-[#ecfdf5] border border-[#a7f3d0] p-3 text-xs font-medium text-[#065f46]">
                {uc.outcome}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
