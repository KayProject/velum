import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="bg-white py-16 sm:py-24 border-t border-[#ededed]/60 text-xs text-[#686868]">
      <div className="mx-auto max-w-[1360px] px-6 sm:px-10">
        <div className="grid gap-12 lg:grid-cols-12 items-start justify-between">
          {/* Left Column: Logo & Tagline */}
          <div className="space-y-4 lg:col-span-6 max-w-sm">
            <Link href="/" className="flex items-center gap-3 group">
              <Image
                src="/velum.png"
                alt="Velum Logo"
                width={36}
                height={36}
                className="h-9 w-9 object-contain transition-transform group-hover:scale-105"
              />
              <span className="font-sans text-xl font-extrabold tracking-tight text-[#181818]">
                VELUM
              </span>
            </Link>

            <p className="text-xs leading-relaxed text-[#686868]">
              Velum helps earners create, prove, and verify private income claims faster — without
              complicated workflows or data disclosures.
            </p>
          </div>

          {/* Right Column: Quick Links */}
          <div className="grid grid-cols-2 gap-8 lg:col-span-6 lg:justify-items-end">
            <div className="space-y-3">
              <span className="font-mono text-[11px] uppercase tracking-wider text-[#858585] block">
                Product
              </span>
              <nav className="flex flex-col gap-2 text-xs font-medium text-[#181818]">
                <Link href="/app" className="hover:text-[#2563eb] transition-colors">
                  Earner Portal
                </Link>
                <Link href="/payer" className="hover:text-[#2563eb] transition-colors">
                  Payer Console
                </Link>
                <a href="/#how-it-works" className="hover:text-[#2563eb] transition-colors">
                  How It Works
                </a>
                <a href="/#faq" className="hover:text-[#2563eb] transition-colors">
                  FAQ
                </a>
              </nav>
            </div>

            <div className="space-y-3 lg:text-right">
              <span className="font-mono text-[11px] uppercase tracking-wider text-[#858585] block">
                Legal
              </span>
              <nav className="flex flex-col gap-2 text-xs font-medium text-[#181818]">
                <Link href="/terms" className="hover:text-[#2563eb] transition-colors">
                  Terms &amp; Conditions
                </Link>
                <Link href="/privacy" className="hover:text-[#2563eb] transition-colors">
                  Privacy Policy
                </Link>
              </nav>
            </div>
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
