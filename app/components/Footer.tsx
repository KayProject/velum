"use client";

import Link from "next/link";
import { useState } from "react";

export function Footer() {
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setJoined(true);
    }
  };

  return (
    <footer className="bg-[#f9f9f9] pt-16 pb-12 text-xs text-[#686868]">
      <div className="mx-auto max-w-[1360px] px-4 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-12">
          {/* Col 1 & 2: Contact & Newsletter */}
          <div className="space-y-8 lg:col-span-6">
            <div>
              <span className="font-mono text-[11px] text-[#858585] block mb-2">
                [ Contact us through e-mail ]
              </span>
              <a
                href="mailto:contact@velum.cash"
                className="font-display text-xl sm:text-2xl font-bold text-[#181818] hover:underline"
              >
                contact@velum.cash
              </a>
            </div>

            <div>
              <span className="font-mono text-[11px] text-[#858585] block mb-2">
                [ Newsletter ]
              </span>
              <p className="text-sm font-semibold text-[#181818] mb-3">
                Stay connected
              </p>

              {joined ? (
                <div className="rounded-full bg-[#10b981]/10 px-4 py-2 text-xs font-medium text-[#059669] border border-[#10b981]/20">
                  ✓ You are on the Velum updates dispatch list.
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex max-w-sm gap-2">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full rounded-full border border-[#ededed] bg-white px-4 py-2 text-xs text-[#181818] placeholder:text-[#858585] focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="rounded-full bg-[#181818] px-5 py-2 text-xs font-medium text-white transition-colors hover:bg-[#2b2b2b]"
                  >
                    Join
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Col 3: Navigation Links */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 lg:col-span-6">
            <div>
              <span className="font-mono text-[11px] text-[#858585] block mb-4">
                [ Navigation ]
              </span>
              <ul className="space-y-2.5">
                <li>
                  <a href="#the-difference" className="hover:text-[#181818] transition-colors">
                    Difference
                  </a>
                </li>
                <li>
                  <a href="#features" className="hover:text-[#181818] transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#use-cases" className="hover:text-[#181818] transition-colors">
                    Use Cases
                  </a>
                </li>
                <li>
                  <a href="#how-it-works" className="hover:text-[#181818] transition-colors">
                    How it works
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-[#181818] transition-colors">
                    Pricing
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <span className="font-mono text-[11px] text-[#858585] block mb-4">
                [ resources ]
              </span>
              <ul className="space-y-2.5">
                <li>
                  <Link href="/app" className="hover:text-[#181818] transition-colors">
                    Earner Portal
                  </Link>
                </li>
                <li>
                  <Link href="/payer" className="hover:text-[#181818] transition-colors">
                    Payer Console
                  </Link>
                </li>
                <li>
                  <Link href="/v/demo" className="hover:text-[#181818] transition-colors">
                    Verifier Claim
                  </Link>
                </li>
                <li>
                  <span className="text-[#858585]">Apache-2.0</span>
                </li>
              </ul>
            </div>

            <div>
              <span className="font-mono text-[11px] text-[#858585] block mb-4">
                [ Social ]
              </span>
              <ul className="space-y-2.5">
                <li>
                  <a
                    href="https://x.com"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-[#181818] transition-colors"
                  >
                    X (Twitter)
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/KayProject/velum"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-[#181818] transition-colors"
                  >
                    GitHub
                  </a>
                </li>
                <li>
                  <span className="text-[#858585]">Telegram</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Copyright & Credit */}
        <div className="mt-16 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#ededed] pt-8 font-mono text-[11px] text-[#858585]">
          <div>© 2026 Velum | All Rights Reserved</div>
          <div>Built on Starknet STRK20 Privacy Pool</div>
        </div>
      </div>
    </footer>
  );
}
