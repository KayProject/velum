export function Features() {
  const features = [
    {
      title: "Identity Anchors",
      desc: "Unforgeable identity derivation from your viewing key. Proving income to Landlord A cannot be correlated with your verification at Lender B.",
      tagline: "Unlinkable proofs across applications.",
      icon: "🛡️",
    },
    {
      title: "Virtual Block Compute",
      desc: "Evaluate payments and threshold predicates inside a proven client virtual block. Calldata stays private; only the boolean assertion lands on chain.",
      tagline: "Zero calldata leaked on chain.",
      icon: "⚡",
    },
    {
      title: "Payer Commitments",
      desc: "Employers and DAOs emit cryptographic attestations alongside normal payroll. Income records cannot be manufactured or forged by third parties.",
      tagline: "Cryptographic payer authenticity.",
      icon: "✍️",
    },
    {
      title: "Ready Templates",
      desc: "Pre-built proof formats for housing leases, vehicle financing, and visa applications. Open a single link to verify in seconds with zero wallet needed.",
      tagline: "Instant single-use verification links.",
      icon: "📄",
    },
  ];

  return (
    <section id="features" className="border-b border-[#ededed] py-20 sm:py-28 bg-white">
      <div className="mx-auto max-w-[1360px] px-4 sm:px-6">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#ededed] bg-[#f6f6f6] px-3.5 py-1 text-xs font-mono text-[#686868]">
            <span>[</span>
            <span className="text-[#181818] font-medium">features</span>
            <span>]</span>
          </div>

          <h2 className="mt-6 font-display text-3xl sm:text-5xl font-bold tracking-tight text-[#181818]">
            Everything you need to <br className="hidden sm:inline" />
            prove private income
          </h2>

          <p className="mt-4 text-sm sm:text-base text-[#686868] max-w-xl mx-auto">
            Generate, verify, and manage income claims — faster and without exposing confidential records.
          </p>
        </div>

        {/* 4-Card Grid (Verseo exact layout) */}
        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {features.map((f, i) => (
            <div
              key={i}
              className="flex flex-col justify-between rounded-[24px] border border-[#ededed] bg-[#f9f9f9] p-6 sm:p-8 transition-all hover:bg-white hover:border-[#181818]/20 hover:shadow-sm"
            >
              <div>
                <span className="text-2xl">{f.icon}</span>
                <h3 className="mt-4 font-display text-xl font-bold text-[#181818]">
                  {f.title}
                </h3>
                <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-[#686868]">
                  {f.desc}
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-[#ededed]">
                <p className="font-mono text-xs font-medium text-[#181818]">
                  {f.tagline}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
