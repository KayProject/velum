"use client";

import Link from "next/link";
import { useState } from "react";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#e4e4e7] bg-[#fafafa]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1360px] items-center justify-between px-6 py-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#111827] text-[#fafafa] font-mono font-bold text-sm shadow-sm transition-transform group-hover:scale-105">
              V
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-xl font-bold tracking-tight text-[#111827]">
                Velum
              </span>
              <span className="hidden font-mono text-[10px] uppercase tracking-wider text-[#71717a] sm:inline-block">
                [ strk20 · v0.1 ]
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="hidden items-center gap-8 md:flex">
          <a
            href="#the-difference"
            className="text-sm font-medium text-[#71717a] transition-colors hover:text-[#111827]"
          >
            The Difference
          </a>
          <a
            href="#features"
            className="text-sm font-medium text-[#71717a] transition-colors hover:text-[#111827]"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className="text-sm font-medium text-[#71717a] transition-colors hover:text-[#111827]"
          >
            How It Works
          </a>
          <a
            href="#use-cases"
            className="text-sm font-medium text-[#71717a] transition-colors hover:text-[#111827]"
          >
            Use Cases
          </a>
          <a
            href="#faq"
            className="text-sm font-medium text-[#71717a] transition-colors hover:text-[#111827]"
          >
            FAQ
          </a>
        </nav>

        {/* CTAs */}
        <div className="hidden items-center gap-3 sm:flex">
          <Link
            href="/payer"
            className="rounded-full border border-[#e4e4e7] bg-white px-4 py-2 text-xs font-semibold text-[#111827] transition-all hover:border-[#a1a1aa] hover:bg-[#f4f4f5] shadow-2xs"
          >
            Payer Portal
          </Link>
          <Link
            href="/app"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#10b981] px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-[#059669] shadow-sm shadow-[#10b981]/20 hover:shadow-md hover:shadow-[#10b981]/30"
          >
            <span>Launch App</span>
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e4e4e7] bg-white text-[#111827] md:hidden"
          aria-label="Toggle menu"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {mobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="border-b border-[#e4e4e7] bg-white px-6 py-5 md:hidden">
          <div className="flex flex-col gap-4">
            <a
              href="#the-difference"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-[#71717a] hover:text-[#111827]"
            >
              The Difference
            </a>
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-[#71717a] hover:text-[#111827]"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-[#71717a] hover:text-[#111827]"
            >
              How It Works
            </a>
            <a
              href="#use-cases"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-[#71717a] hover:text-[#111827]"
            >
              Use Cases
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-[#71717a] hover:text-[#111827]"
            >
              FAQ
            </a>
            <div className="mt-2 flex flex-col gap-2 pt-4 border-t border-[#f4f4f5]">
              <Link
                href="/payer"
                className="w-full text-center rounded-lg border border-[#e4e4e7] py-2.5 text-xs font-semibold text-[#111827]"
              >
                Payer Portal
              </Link>
              <Link
                href="/app"
                className="w-full text-center rounded-lg bg-[#10b981] py-2.5 text-xs font-semibold text-white shadow-sm"
              >
                Launch App
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
