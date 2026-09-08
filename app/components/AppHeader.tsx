"use client";

import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";

/**
 * Shared header for the app shell (earner, payer, claims, verifier) — distinct
 * from the marketing Navbar. Compact, sticky by default, real logo mark
 * instead of a placeholder box, with a portal badge and a slot for
 * page-specific navigation (switch-portal / back links).
 */
export function AppHeader({
  badge,
  sticky = true,
  rightSlot,
}: {
  badge: string;
  sticky?: boolean;
  rightSlot?: ReactNode;
}) {
  return (
    <header
      className={`border-b border-[#e4e4e7] bg-white/90 backdrop-blur-md px-6 py-4 ${
        sticky ? "sticky top-0 z-30" : ""
      }`}
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <Image
            src="/velum.png"
            alt="Velum"
            width={28}
            height={28}
            className="h-7 w-7 object-contain transition-transform group-hover:scale-105"
          />
          <span className="font-display text-lg font-bold text-[#111827]">
            Velum
          </span>
          <span className="font-mono text-[10px] text-[#2563eb] bg-[#eff6ff] border border-[#bfdbfe] px-2 py-0.5 rounded-full font-semibold">
            {badge}
          </span>
        </Link>

        {rightSlot}
      </div>
    </header>
  );
}
