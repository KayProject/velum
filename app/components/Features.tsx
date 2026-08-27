export function Features() {
  const cards = [
    {
      title: "Identity Anchors",
      desc: "Unforgeable identity derivation from your viewing key. Proving income to Landlord A cannot be correlated with Lender B.",
      note: "Unlinkable proofs across applications.",
      badge: "h(tag, user, vk)",
      badgeColor: "text-[#181818] bg-[#f4f4f5]",
      iconBg: "bg-[#181818] text-white",
      icon: "🛡️",
    },
    {
      title: "Virtual Block Compute",
      desc: "Evaluate payments and threshold predicates inside a proven client virtual block without leaking calldata on chain.",
      note: "Zero calldata leaked on chain.",
      badge: "Cairo 2.0 VM",
      badgeColor: "text-[#059669] bg-[#ecfdf5]",
      iconBg: "bg-[#10b981] text-white",
      icon: "⚡",
    },
    {
      title: "Payer Commitments",
      desc: "Employers and DAOs emit cryptographic attestations alongside payroll so records cannot be forged.",
      note: "Cryptographic payer authenticity.",
      badge: "STRK20 Attestation",
      badgeColor: "text-[#d97706] bg-[#fffbeb]",
      iconBg: "bg-[#f59e0b] text-white",
      icon: "📜",
    },
    {
      title: "Ready Templates",
      desc: "Pre-built proof formats for housing leases, mortgages, and visa applications with instant validation.",
      note: "Start faster with the right structure.",
      badge: "1-Click Schemas",
      badgeColor: "text-[#7c3aed] bg-[#f5f3ff]",
      iconBg: "bg-[#8b5cf6] text-white",
      icon: "📋",
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
            <span className="text-[#059669]">to prove private income</span>
          </h2>

          <p className="mt-4 text-sm sm:text-base text-[#686868] max-w-xl mx-auto">
            Create, refine, and scale claims — faster and without starting from scratch.
          </p>
        </div>

        {/* 4-Card Grid with Visual Badges */}
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c, i) => (
            <div
              key={i}
              className="flex flex-col justify-between rounded-2xl border border-[#ededed] bg-white p-7 sm:p-8 shadow-xs hover:border-[#10b981]/50 hover:shadow-md transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg ${c.iconBg} shadow-xs group-hover:scale-105 transition-transform`}>
                    {c.icon}
                  </div>
                  <span className={`font-mono text-[10px] font-semibold px-2 py-0.5 rounded-full ${c.badgeColor}`}>
                    {c.badge}
                  </span>
                </div>

                <h3 className="font-display text-lg font-bold text-[#181818]">
                  {c.title}
                </h3>

                <p className="mt-3 text-xs sm:text-sm leading-relaxed text-[#686868]">
                  {c.desc}
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-[#ededed]/60">
                <p className="font-sans text-xs font-medium text-[#858585]">
                  ✦ {c.note}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

