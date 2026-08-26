"use client";

import Link from "next/link";
import { useState } from "react";

export function Footer() {
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
    }
  };

  return (
    <footer className="border-t border-[#e4e4e7] bg-[#fafafa] pt-16 pb-12">
      <div className="mx-auto max-w-[1360px] px-6">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Left Column: Brand and Newsletter */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#111827] text-[#fafafa] font-mono font-bold text-sm shadow-sm">
                V
              </div>
              <span className="font-display text-2xl font-bold tracking-tight text-[#111827]">
                Velum
              </span>
            </div>

            <p className="text-sm leading-relaxed text-[#4b5563] max-w-sm">
              The zero-knowledge proof layer for private income on Starknet. Prove what matters.
              Reveal nothing else.
            </p>

            {/* Newsletter */}
            <div className="pt-2">
              <span className="font-mono text-xs text-[#71717a] block mb-2">
                [ Stay connected ]
              </span>
              {subscribed ? (
                <div className="rounded-lg bg-[#ecfdf5] border border-[#a7f3d0] px-4 py-2.5 text-xs font-semibold text-[#047857]">
                  ✓ You are on the STRK20 Velum dispatch list.
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex max-w-sm gap-2">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full rounded-xl border border-[#e4e4e7] bg-white px-3.5 py-2 text-xs font-medium text-[#111827] placeholder:text-[#a1a1aa] focus:border-[#10b981] focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-[#111827] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#374151]"
                  >
                    Join
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Right Column: Navigation Links */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 lg:col-span-7">
            <div>
              <span className="font-mono text-xs font-semibold text-[#111827] block mb-4">
                [ Navigation ]
              </span>
              <ul className="space-y-2.5 text-xs text-[#4b5563]">
                <li>
                  <Link href="/app" className="hover:text-[#10b981] transition-colors">
                    Earner Portal
                  </Link>
                </li>
                <li>
                  <Link href="/payer" className="hover:text-[#10b981] transition-colors">
                    Payer Attestations
                  </Link>
                </li>
                <li>
                  <Link href="/v/demo" className="hover:text-[#10b981] transition-colors">
                    Verifier Claim Check
                  </Link>
                </li>
                <li>
                  <a href="#how-it-works" className="hover:text-[#10b981] transition-colors">
                    How It Works
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <span className="font-mono text-xs font-semibold text-[#111827] block mb-4">
                [ Resources ]
              </span>
              <ul className="space-y-2.5 text-xs text-[#4b5563]">
                <li>
                  <a
                    href="https://github.com/starkience/strk20-hackathon"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-[#10b981] transition-colors"
                  >
                    STRK20 Sprint
                  </a>
                </li>
                <li>
                  <span className="text-[#9ca3af]">Architecture Spec</span>
                </li>
                <li>
                  <span className="text-[#9ca3af]">Cairo Contracts</span>
                </li>
                <li>
                  <span className="text-[#9ca3af]">Apache-2.0 License</span>
                </li>
              </ul>
            </div>

            <div>
              <span className="font-mono text-xs font-semibold text-[#111827] block mb-4">
                [ Network ]
              </span>
              <ul className="space-y-2.5 text-xs text-[#4b5563]">
                <li className="font-mono text-[11px] text-[#71717a]">
                  Chain: SN_MAIN
                </li>
                <li className="font-mono text-[11px] text-[#71717a]">
                  Pool: V2.0
                </li>
                <li className="font-mono text-[11px] text-[#71717a]">
                  Cairo: 2.0 Virtual
                </li>
                <li className="font-mono text-[11px] text-[#059669] font-medium">
                  🟢 Operational
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-14 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#e4e4e7] pt-8 font-mono text-xs text-[#71717a]">
          <div>© 2026 Velum. Built under Apache-2.0 License.</div>
          <div className="flex items-center gap-2">
            <span>Powered by Starknet STRK20 Privacy Pool</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
