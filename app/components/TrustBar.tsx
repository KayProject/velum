export function TrustBar() {
  const partners = [
    { name: "STRK20 Pool", icon: "⬡" },
    { name: "Cairo 2.0", icon: "⚡" },
    { name: "Pathfinder", icon: "◈" },
    { name: "Starknet", icon: "✳" },
    { name: "Argent", icon: "▲" },
    { name: "Braavos", icon: "🛡️" },
    { name: "Cartridge", icon: "🎮" },
  ];

  return (
    <div className="border-b border-[#ededed]/60 py-8 bg-transparent">
      <div className="mx-auto max-w-[1360px] px-6 sm:px-10 text-center">
        <p className="font-sans text-xs text-[#858585] mb-6 font-medium">
          Trusted by modern teams &amp; DAOs
        </p>

        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 opacity-70">
          {partners.map((p, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-[#181818]">
              <span className="text-sm">{p.icon}</span>
              <span>{p.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
