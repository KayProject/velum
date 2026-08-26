export function HowItWorks() {
  const steps = [
    {
      step: "Step 1",
      title: "Enter your parameters",
      desc: "Select the payer, period window, minimum threshold to prove, and verifier binding code in a simple prompt.",
    },
    {
      step: "Step 2",
      title: "Generate ZK proof",
      desc: "Velum evaluates your private attestations inside a client virtual block and publishes only the verified predicate assertion.",
    },
    {
      step: "Step 3",
      title: "Verifier checks link",
      desc: "The verifier opens the unique single-use link, confirms the green checkmark, and completes underwriting in seconds.",
    },
  ];

  return (
    <section id="how-it-works" className="border-b border-[#ededed] py-20 sm:py-28 bg-white">
      <div className="mx-auto max-w-[1360px] px-4 sm:px-6">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#ededed] bg-[#f6f6f6] px-3.5 py-1 text-xs font-mono text-[#686868]">
            <span>[</span>
            <span className="text-[#181818] font-medium">how it works</span>
            <span>]</span>
          </div>

          <h2 className="mt-6 font-display text-3xl sm:text-5xl font-bold tracking-tight text-[#181818]">
            Turn confidential earnings into <br className="hidden sm:inline" />
            verified claims in seconds
          </h2>

          <p className="mt-4 text-sm sm:text-base text-[#686868] max-w-xl mx-auto">
            No complex paperwork or invasive audits — just describe what you need to prove, and Velum does the rest.
          </p>
        </div>

        {/* 3 Step Cards (Verseo exact layout) */}
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <div
              key={i}
              className="flex flex-col justify-between rounded-[24px] border border-[#ededed] bg-[#f9f9f9] p-6 sm:p-8 transition-all hover:border-[#181818]/20 hover:bg-white hover:shadow-sm"
            >
              <div>
                <span className="font-mono text-xs font-semibold text-[#181818]">
                  {s.step}
                </span>
                <h3 className="mt-4 font-display text-lg sm:text-xl font-bold text-[#181818]">
                  {s.title}
                </h3>
                <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-[#686868]">
                  {s.desc}
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-[#ededed]">
                <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#858585]">
                  <span>0{i + 1}</span>
                  <span>/ 03</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sub-quote Banner (Verseo exact style) */}
        <div className="mt-10 text-center">
          <p className="font-mono text-xs text-[#858585]">
            The more precise the claim, the more private your record.
          </p>
        </div>
      </div>
    </section>
  );
}
