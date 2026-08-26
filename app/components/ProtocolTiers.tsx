import Link from "next/link";

export function ProtocolTiers() {
  const tiers = [
    {
      name: "Earner (Individual)",
      role: "For freelancers & contractors",
      badge: "Sovereign",
      cost: "Free",
      costPeriod: "Open Source (Apache-2.0)",
      features: [
        "Client-side ZK claim generator",
        "Unlinkable per-contract identity anchors",
        "Unlimited custom threshold claims",
        "Configurable expiration windows",
        "Single-use link protection",
        "Zero custody or token lockups",
      ],
      cta: "Launch Earner App",
      href: "/app",
      popular: false,
    },
    {
      name: "Payer (DAO & Enterprise)",
      role: "For employers & payroll protocols",
      badge: "Protocol Native",
      cost: "6 STRK",
      costPeriod: "per mainnet attestation batch",
      features: [
        "Batch attestation emission SDK",
        "Non-interactive recipient tag derivation",
        "Full compatibility with STRK20 Privacy Pool",
        "Zero recipient address disclosure",
        "Automated payroll pipeline scripts",
        "Verifiable Ed25519 / ECDSA signatures",
      ],
      cta: "Payer Console",
      href: "/payer",
      popular: true,
    },
    {
      name: "Verifier (Institutional)",
      role: "For landlords, lenders & visa portals",
      badge: "Zero Friction",
      cost: "0 Gas",
      costPeriod: "No wallet or account required",
      features: [
        "Instant one-click browser verification",
        "Single boolean predicate validation",
        "Zero Web3 wallet or extension needed",
        "Automatic claim status verification",
        "Tamper-proof on-chain commitment check",
        "Zero compliance data liability",
      ],
      cta: "Try Verifier Flow",
      href: "/v/demo-claim-token-2026",
      popular: false,
    },
  ];

  return (
    <section className="border-b border-[#e4e4e7] py-20 md:py-28 bg-white">
      <div className="mx-auto max-w-[1360px] px-6">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="font-mono text-xs font-semibold uppercase tracking-widest text-[#059669] bg-[#ecfdf5] border border-[#a7f3d0] px-3 py-1 rounded-full">
            [ ecosystem roles ]
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-[#111827] sm:text-4xl md:text-5xl">
            Choose your portal in <br className="hidden sm:inline" />
            <span className="text-[#059669]">the proof layer.</span>
          </h2>
          <p className="mt-4 text-base text-[#4b5563]">
            Whether you earn privately, pay contributors, or underwrite claims, Velum provides dedicated,
            frictionless interfaces.
          </p>
        </div>

        {/* 3 Tiers Grid */}
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {tiers.map((t, idx) => (
            <div
              key={idx}
              className={`relative flex flex-col justify-between rounded-2xl p-7 transition-all ${
                t.popular
                  ? "border-2 border-[#10b981] bg-[#fafafa] shadow-md ring-1 ring-[#10b981]/20"
                  : "border border-[#e4e4e7] bg-white shadow-2xs hover:border-[#a1a1aa]"
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display text-lg font-bold text-[#111827]">
                      {t.name}
                    </h3>
                    <p className="text-xs text-[#71717a] mt-0.5">{t.role}</p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold ${
                      t.popular
                        ? "bg-[#ecfdf5] text-[#047857] border border-[#a7f3d0]"
                        : "bg-[#f4f4f5] text-[#71717a] border border-[#e4e4e7]"
                    }`}
                  >
                    {t.badge}
                  </span>
                </div>

                <div className="mt-6 border-y border-[#f4f4f5] py-4">
                  <div className="flex items-baseline gap-1">
                    <span className="font-display text-3xl font-extrabold text-[#111827]">
                      {t.cost}
                    </span>
                  </div>
                  <p className="font-mono text-xs text-[#71717a] mt-1">
                    {t.costPeriod}
                  </p>
                </div>

                <ul className="mt-6 space-y-3">
                  {t.features.map((f, fi) => (
                    <li key={fi} className="flex items-start gap-2 text-xs text-[#374151]">
                      <span className="text-[#10b981] font-bold">✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8">
                <Link
                  href={t.href}
                  className={`w-full block text-center rounded-xl py-3 text-xs font-semibold transition-all ${
                    t.popular
                      ? "bg-[#10b981] text-white hover:bg-[#059669] shadow-sm shadow-[#10b981]/20"
                      : "border border-[#e4e4e7] bg-white text-[#111827] hover:bg-[#f4f4f5]"
                  }`}
                >
                  {t.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
