import Image from "next/image";

export function TrustBar() {
  const partners = [
    { name: "STRK20 Pool", logo: "/logos/strk20.png", wordmark: true },
    { name: "Cairo 2.0", logo: "/logos/cairo.png" },
    { name: "Starknet", logo: "/logos/starknet.png" },
    { name: "Argent", logo: "/logos/argent.svg" },
    { name: "Braavos", logo: "/logos/braavos.svg" },
    { name: "Cartridge", logo: "/logos/cartridge.svg" },
  ];

  return (
    <div className="border-b border-[#ededed]/60 py-8 bg-transparent">
      <div className="mx-auto max-w-[1360px] px-6 sm:px-10 text-center">
        <p className="font-sans text-xs text-[#858585] mb-6 font-medium">
          Trusted by modern teams &amp; DAOs
        </p>

        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 opacity-70">
          {partners.map((p, idx) =>
            p.wordmark ? (
              <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-[#181818]">
                <div className="flex h-6 items-center rounded-md bg-[#181818] px-2">
                  <Image
                    src={p.logo}
                    alt={`${p.name} logo`}
                    width={72}
                    height={18}
                    className="h-[13px] w-auto object-contain"
                  />
                </div>
                <span>Pool</span>
              </div>
            ) : (
              <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-[#181818]">
                <Image
                  src={p.logo}
                  alt={`${p.name} logo`}
                  width={16}
                  height={16}
                  className="h-4 w-4 object-contain"
                />
                <span>{p.name}</span>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
