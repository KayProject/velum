"use client";

import Link from "next/link";

export function Navbar() {
  return (
    <header className="w-full bg-transparent pt-6 pb-4 relative z-40">
      <div className="mx-auto max-w-[1360px] px-6 sm:px-10 flex items-center justify-between">
        {/* Logo (Star icon + VELUM matching Verseo Image 1) */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <svg
            className="h-5 w-5 text-[#181818]"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            {/* Verseo 4-pointed star / diamond mark */}
            <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
          </svg>
          <span className="font-display text-base font-extrabold tracking-wider text-[#181818]">
            VELUM
          </span>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden items-center gap-8 md:flex text-xs font-medium text-[#181818]">
          <a href="#the-difference" className="transition-colors hover:text-[#686868]">
            Product
          </a>
          <a href="#use-cases" className="transition-colors hover:text-[#686868]">
            Use Cases
          </a>
          <a href="#how-it-works" className="transition-colors hover:text-[#686868]">
            How It Works
          </a>
          <a href="#features" className="transition-colors hover:text-[#686868]">
            Features
          </a>
          <a href="#contact" className="transition-colors hover:text-[#686868]">
            Contact Us
          </a>
        </nav>

        {/* Top Right Black Button */}
        <div className="flex items-center gap-3">
          <Link
            href="/app"
            className="inline-flex items-center justify-center rounded-lg bg-[#181818] px-4 py-2 text-xs font-medium text-white transition-all hover:bg-[#2b2b2b] shadow-xs active:scale-95"
          >
            Launch App
          </Link>
        </div>
      </div>
    </header>
  );
}
