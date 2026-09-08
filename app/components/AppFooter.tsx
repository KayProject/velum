import Link from "next/link";
import Image from "next/image";

/**
 * Shared footer for the app shell — deliberately smaller and more functional
 * than the marketing Footer: a mark, the legal links, and where it's built.
 * No quicklinks or tagline; this isn't a page meant to be browsed.
 */
export function AppFooter() {
  return (
    <footer className="border-t border-[#e4e4e7] bg-white px-6 py-6">
      <div className="mx-auto max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-[11px] text-[#858585]">
        <div className="flex items-center gap-2">
          <Image
            src="/velum.png"
            alt="Velum"
            width={16}
            height={16}
            className="h-4 w-4 object-contain"
          />
          <span>© 2026 Velum</span>
        </div>

        <div className="flex items-center gap-5">
          <Link href="/terms" className="hover:text-[#181818] transition-colors">
            Terms
          </Link>
          <Link href="/privacy" className="hover:text-[#181818] transition-colors">
            Privacy
          </Link>
          <span>Built on Starknet STRK20 Privacy Pool</span>
        </div>
      </div>
    </footer>
  );
}
