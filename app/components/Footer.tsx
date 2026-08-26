import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-white py-16 sm:py-24 border-t border-[#ededed]/60 text-xs text-[#686868]">
      <div className="mx-auto max-w-[1360px] px-6 sm:px-10">
        <div className="grid gap-12 lg:grid-cols-12 items-start justify-between">
          {/* Left Column: Logo & Tagline (Verseo Image 6 Exact Replica) */}
          <div className="space-y-4 lg:col-span-6 max-w-sm">
            <Link href="/" className="flex items-center gap-2.5 group">
              <svg
                className="h-5 w-5 text-[#181818]"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
              </svg>
              <span className="font-display text-base font-extrabold tracking-wider text-[#181818]">
                VELUM
              </span>
            </Link>

            <p className="text-xs leading-relaxed text-[#686868]">
              Velum helps earners create, prove, and verify private income claims faster — without
              complicated workflows or data disclosures.
            </p>
          </div>

          {/* Right Column: Contact Email (Verseo Image 6 Exact Replica) */}
          <div className="space-y-3 lg:col-span-6 lg:text-right">
            <span className="font-mono text-[11px] text-[#858585] block">
              [ contact us through e-mail ]
            </span>
            <a
              href="mailto:contact@velum.cash"
              className="font-display text-2xl sm:text-4xl font-bold text-[#181818] hover:underline"
            >
              contact@velum.cash
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#ededed]/60 pt-8 font-mono text-[11px] text-[#858585]">
          <div>© 2026 Velum | All Rights Reserved</div>
          <div>Built on Starknet STRK20 Privacy Pool</div>
        </div>
      </div>
    </footer>
  );
}
