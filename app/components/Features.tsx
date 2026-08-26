export function Features() {
  const cards = [
    {
      title: "Identity Anchors",
      desc: "Unforgeable identity derivation from your viewing key. Proving income to Landlord A cannot be correlated with Lender B.",
      note: "Unlinkable proofs across applications.",
      iconColor: "text-[#181818]",
    },
    {
      title: "Virtual Block Compute",
      desc: "Evaluate payments and threshold predicates inside a proven client virtual block without leaking calldata on chain.",
      note: "Zero calldata leaked on chain.",
      iconColor: "text-[#10b981]",
    },
    {
      title: "Payer Commitments",
      desc: "Employers and DAOs emit cryptographic attestations alongside payroll so records cannot be forged.",
      note: "Cryptographic payer authenticity.",
      iconColor: "text-[#f59e0b]",
    },
    {
      title: "Ready Templates",
      desc: "Pre-built proof formats for housing leases, mortgages, and visa applications with instant validation.",
      note: "Start faster with the right structure.",
      iconColor: "text-[#8b5cf6]",
    },
  ];

  return (
    <section id="features" className="py-20 sm:py-28 border-b border-[#ededed]/60 bg-transparent">
      <div className="mx-auto max-w-[1360px] px-6 sm:px-10">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center text-xs font-mono text-[#686868] mb-4">
            <span>[ features ]</span>
          </div>

          <h2 className="font-display text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#181818] leading-[1.15]">
            Everything you need <br />
            to prove private income
          </h2>

          <p className="mt-4 text-sm sm:text-base text-[#686868] max-w-xl mx-auto">
            Create, refine, and scale claims - faster and without starting from scratch.
          </p>
        </div>

        {/* 4-Card Grid (Verseo Image 3 Exact Replica) */}
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c, i) => (
            <div
              key={i}
              className="flex flex-col justify-between rounded-2xl border border-[#ededed] bg-white p-7 sm:p-8 shadow-xs"
            >
              <div>
                {/* 3x3 Pixel Dot Grid Icon */}
                <div className={`mb-8 ${c.iconColor}`}>
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="2" y="2" width="4.5" height="4.5" rx="1" />
                    <rect x="9.5" y="2" width="4.5" height="4.5" rx="1" />
                    <rect x="17" y="2" width="4.5" height="4.5" rx="1" />
                    <rect x="2" y="9.5" width="4.5" height="4.5" rx="1" />
                    <rect x="9.5" y="9.5" width="4.5" height="4.5" rx="1" />
                    <rect x="17" y="9.5" width="4.5" height="4.5" rx="1" />
                    <rect x="2" y="17" width="4.5" height="4.5" rx="1" />
                    <rect x="9.5" y="17" width="4.5" height="4.5" rx="1" />
                    <rect x="17" y="17" width="4.5" height="4.5" rx="1" />
                  </svg>
                </div>

                <h3 className="font-display text-lg font-bold text-[#181818]">
                  {c.title}
                </h3>

                <p className="mt-3 text-xs sm:text-sm leading-relaxed text-[#686868]">
                  {c.desc}
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-[#ededed]/60">
                <p className="font-sans text-xs italic text-[#858585]">
                  {c.note}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
