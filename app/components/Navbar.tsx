"use client";

import Link from "next/link";
import { useState } from "react";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full">
      <div className="mx-auto max-w-[1360px] px-4 sm:px-6 pt-4">
        <div className="flex h-14 items-center justify-between rounded-full border border-[#ededed] bg-[#f9f9f9]/80 px-4 sm:px-6 backdrop-blur-md shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#181818] text-white font-mono font-bold text-xs shadow-sm transition-transform group-hover:scale-105">
              V
            </div>
            <span className="font-display text-lg font-bold tracking-tight text-[#181818]">
              Velum
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden items-center gap-6 lg:gap-8 md:flex">
            <a
              href="#the-difference"
              className="text-xs font-medium text-[#686868] transition-colors hover:text-[#181818]"
            >
              Difference
            </a>
            <a
              href="#features"
              className="text-xs font-medium text-[#686868] transition-colors hover:text-[#181818]"
            >
              Features
            </a>
            <a
              href="#use-cases"
              className="text-xs font-medium text-[#686868] transition-colors hover:text-[#181818]"
            >
              Use cases
            </a>
            <a
              href="#how-it-works"
              className="text-xs font-medium text-[#686868] transition-colors hover:text-[#181818]"
            >
              How it works
            </a>
            <a
              href="#results"
              className="text-xs font-medium text-[#686868] transition-colors hover:text-[#181818]"
            >
              Results
            </a>
            <a
              href="#examples"
              className="text-xs font-medium text-[#686868] transition-colors hover:text-[#181818]"
            >
              Examples
            </a>
            <a
              href="#pricing"
              className="text-xs font-medium text-[#686868] transition-colors hover:text-[#181818]"
            >
              Pricing
            </a>
            <a
              href="#faq"
              className="text-xs font-medium text-[#686868] transition-colors hover:text-[#181818]"
            >
              FAQ
            </a>
          </nav>

          {/* Right Action Button */}
          <div className="hidden items-center gap-2.5 md:flex">
            <Link
              href="/payer"
              className="rounded-full px-3.5 py-1.5 text-xs font-medium text-[#686868] transition-colors hover:text-[#181818]"
            >
              Payer Portal
            </Link>
            <Link
              href="/app"
              className="inline-flex items-center justify-center rounded-full bg-[#181818] px-4 py-1.5 text-xs font-medium text-white transition-all hover:bg-[#2b2b2b] hover:shadow-sm"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[#ededed] bg-white text-[#181818] md:hidden"
            aria-label="Toggle menu"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="mt-2 rounded-2xl border border-[#ededed] bg-white/95 p-5 backdrop-blur-md shadow-lg md:hidden">
            <div className="flex flex-col gap-3 font-medium text-xs text-[#686868]">
              <a href="#the-difference" onClick={() => setMobileMenuOpen(false)} className="py-1 hover:text-[#181818]">Difference</a>
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="py-1 hover:text-[#181818]">Features</a>
              <a href="#use-cases" onClick={() => setMobileMenuOpen(false)} className="py-1 hover:text-[#181818]">Use cases</a>
              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="py-1 hover:text-[#181818]">How it works</a>
              <a href="#results" onClick={() => setMobileMenuOpen(false)} className="py-1 hover:text-[#181818]">Results</a>
              <a href="#examples" onClick={() => setMobileMenuOpen(false)} className="py-1 hover:text-[#181818]">Examples</a>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="py-1 hover:text-[#181818]">Pricing</a>
              <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="py-1 hover:text-[#181818]">FAQ</a>
              <div className="mt-2 flex flex-col gap-2 pt-3 border-t border-[#ededed]">
                <Link href="/payer" className="rounded-full border border-[#ededed] py-2 text-center text-xs font-semibold text-[#181818]">
                  Payer Portal
                </Link>
                <Link href="/app" className="rounded-full bg-[#181818] py-2 text-center text-xs font-semibold text-white">
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
