"use client";

import Link from "next/link";
import Image from "next/image";

export function Navbar() {
  return (
    <header className="w-full bg-transparent pt-6 pb-4 relative z-40">
      <div className="mx-auto max-w-[1360px] px-6 sm:px-10 flex items-center justify-between">
        {/* Logo (Velum official logo mark + text) */}
        <Link href="/" className="flex items-center gap-3 group">
          <Image
            src="/velum.png"
            alt="Velum Logo"
            width={36}
            height={36}
            className="h-9 w-9 object-contain transition-transform group-hover:scale-105"
            priority
          />
          <span className="font-sans text-xl font-extrabold tracking-tight text-[#181818]">
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
          <a href="#faq" className="transition-colors hover:text-[#686868]">
            FAQ
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
