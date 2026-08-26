export function TrustBar() {
  const pillars = [
    {
      label: "STRK20 Privacy Pool (V2)",
      detail: "Mainnet Contract 0x0403...812a",
      icon: "🔒",
    },
    {
      label: "Cairo Virtual Blocks",
      detail: "Client-Side Virtual Block Compute",
      icon: "⚡",
    },
    {
      label: "Unlinkable Identity Anchors",
      detail: "h(tag, user, vk, contract)",
      icon: "🛡️",
    },
    {
      label: "Zero Protocol Custody",
      detail: "No Fund Escrow or Lockup",
      icon: "✨",
    },
  ];

  return (
    <div className="border-y border-[#e4e4e7] bg-white py-8">
      <div className="mx-auto max-w-[1360px] px-6">
        <p className="text-center font-mono text-xs uppercase tracking-widest text-[#71717a]">
          Cryptographic Foundation & Mainnet Guarantees
        </p>

        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {pillars.map((p, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center justify-center rounded-xl border border-[#f4f4f5] bg-[#fafafa] p-4 text-center transition-colors hover:border-[#e4e4e7] hover:bg-white"
            >
              <span className="text-xl mb-1.5">{p.icon}</span>
              <span className="font-display text-sm font-bold text-[#111827]">
                {p.label}
              </span>
              <span className="mt-0.5 font-mono text-[11px] text-[#71717a]">
                {p.detail}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
