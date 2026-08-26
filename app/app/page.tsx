"use client";

import Link from "next/link";
import { useState } from "react";

export default function EarnerPage() {
  const [passphrase, setPassphrase] = useState("");
  const [payerTag, setPayerTag] = useState("Acme DAO (0x0403...812a)");
  const [windowPeriod, setWindowPeriod] = useState("2026-Q1");
  const [threshold, setThreshold] = useState("4200000");
  const [currency, setCurrency] = useState("NGN");
  const [verifierTag, setVerifierTag] = useState("Meridian Properties Ltd");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerateClaim = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    setTimeout(() => {
      setIsGenerating(false);
      const claimHash = "vlm_0x" + Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
      setGeneratedLink(claimHash);
    }, 1200);
  };

  const copyToClipboard = () => {
    if (generatedLink) {
      const fullUrl = `${window.location.origin}/v/${generatedLink}`;
      navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="border-b border-[#e4e4e7] bg-white/90 backdrop-blur-md px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#111827] text-white font-mono font-bold text-xs">
              V
            </div>
            <span className="font-display text-lg font-bold text-[#111827]">
              Velum
            </span>
            <span className="font-mono text-[10px] text-[#059669] bg-[#ecfdf5] border border-[#a7f3d0] px-2 py-0.5 rounded-full font-semibold">
              EARNER PORTAL
            </span>
          </Link>
          <Link
            href="/"
            className="text-xs font-semibold text-[#71717a] hover:text-[#111827]"
          >
            ← Back to Overview
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto w-full max-w-3xl px-6 py-12">
        <div className="rounded-2xl border border-[#e4e4e7] bg-white p-6 sm:p-10 shadow-sm">
          <div>
            <span className="font-mono text-xs font-semibold uppercase tracking-widest text-[#059669]">
              [ confidential claim builder ]
            </span>
            <h1 className="mt-2 font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#111827]">
              Generate an Income Proof
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-[#6b7280]">
              Specify the payer, period, and minimum threshold. Velum computes the proof inside a
              client virtual block; only a single assertion lands on chain.
            </p>
          </div>

          <form onSubmit={handleGenerateClaim} className="mt-8 space-y-6">
            {/* 1. Passphrase / Viewing Key */}
            <div className="rounded-xl border border-[#e4e4e7] bg-[#fafafa] p-4">
              <div className="flex items-center justify-between">
                <label className="font-mono text-xs font-bold text-[#111827]">
                  01 // VIEWING KEY / PASSPHRASE
                </label>
                <span className="font-mono text-[10px] text-[#059669]">
                  ● Memory Only (Never Persisted)
                </span>
              </div>
              <p className="mt-1 text-[11px] text-[#71717a]">
                Used locally to derive your unforgeable identity anchor.
              </p>
              <input
                type="password"
                required
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                placeholder="Enter your confidential account viewing passphrase"
                className="mt-3 w-full rounded-lg border border-[#e4e4e7] bg-white px-3.5 py-2.5 text-xs font-mono text-[#111827] placeholder:text-[#a1a1aa] focus:border-[#10b981] focus:outline-none"
              />
            </div>

            {/* 2. Payer Selection */}
            <div>
              <label className="font-mono text-xs font-bold text-[#111827]">
                02 // SELECT PAYER ATTESTATION
              </label>
              <select
                value={payerTag}
                onChange={(e) => setPayerTag(e.target.value)}
                className="mt-2 w-full rounded-lg border border-[#e4e4e7] bg-white px-3.5 py-2.5 text-xs font-medium text-[#111827] focus:border-[#10b981] focus:outline-none"
              >
                <option value="Acme DAO (0x0403...812a)">Acme DAO — Mainnet Treasury (0x0403...812a)</option>
                <option value="StarkWare Foundation (0x0192...cf31)">StarkWare Foundation (0x0192...cf31)</option>
                <option value="Custom Confidential Client">Custom Attestation Commitment</option>
              </select>
            </div>

            {/* 3. Window & Threshold */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-mono text-xs font-bold text-[#111827]">
                  03 // COVERED WINDOW
                </label>
                <select
                  value={windowPeriod}
                  onChange={(e) => setWindowPeriod(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-[#e4e4e7] bg-white px-3.5 py-2.5 text-xs font-medium text-[#111827] focus:border-[#10b981] focus:outline-none"
                >
                  <option value="2026-Q1">Jan 1 – Mar 31, 2026 (Q1)</option>
                  <option value="2025-Q4">Oct 1 – Dec 31, 2025 (Q4)</option>
                  <option value="2025-ALL">Full Calendar Year 2025</option>
                </select>
              </div>

              <div>
                <label className="font-mono text-xs font-bold text-[#111827]">
                  04 // MINIMUM THRESHOLD TO PROVE
                </label>
                <div className="mt-2 flex rounded-lg border border-[#e4e4e7] bg-white">
                  <input
                    type="number"
                    required
                    value={threshold}
                    onChange={(e) => setThreshold(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs font-semibold text-[#111827] focus:outline-none"
                  />
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="rounded-r-lg border-l border-[#e4e4e7] bg-[#fafafa] px-3 text-xs font-medium text-[#71717a] focus:outline-none"
                  >
                    <option value="NGN">₦ NGN</option>
                    <option value="STRK">STRK</option>
                    <option value="USD">$ USD</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 4. Verifier Binding */}
            <div>
              <label className="font-mono text-xs font-bold text-[#111827]">
                05 // VERIFIER BINDING (SCOPED CODE)
              </label>
              <p className="mt-0.5 text-[11px] text-[#71717a]">
                Binds the proof solely to this recipient so it cannot be forwarded or traded.
              </p>
              <input
                type="text"
                required
                value={verifierTag}
                onChange={(e) => setVerifierTag(e.target.value)}
                placeholder="e.g. Meridian Properties Ltd or Underwriter Code"
                className="mt-2 w-full rounded-lg border border-[#e4e4e7] bg-white px-3.5 py-2.5 text-xs font-medium text-[#111827] placeholder:text-[#a1a1aa] focus:border-[#10b981] focus:outline-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isGenerating}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#10b981] py-3.5 text-xs font-bold text-white transition-all hover:bg-[#059669] active:scale-[0.99] disabled:opacity-75 shadow-md shadow-[#10b981]/20"
            >
              {isGenerating ? (
                <>
                  <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  <span>Proving Attestations in Virtual Block...</span>
                </>
              ) : (
                <>
                  <span>Execute Prove Transaction</span>
                  <span className="font-mono text-[10px] opacity-80">(1 Tx)</span>
                </>
              )}
            </button>
          </form>

          {/* Generated Claim Output Card */}
          {generatedLink && (
            <div className="mt-8 rounded-2xl border-2 border-[#10b981] bg-[#ecfdf5] p-6">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#065f46]">
                  🟢 PROOF GENERATED SUCCESSFULLY
                </span>
                <span className="font-mono text-[10px] text-[#047857] bg-white px-2 py-0.5 rounded-full border border-[#a7f3d0]">
                  Expires in 18 days
                </span>
              </div>

              <p className="mt-2 text-xs text-[#065f46]">
                Share this secure link with <span className="font-bold">{verifierTag}</span>. They will
                see only the verified threshold assertion.
              </p>

              <div className="mt-4 flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={typeof window !== "undefined" ? `${window.location.origin}/v/${generatedLink}` : `/v/${generatedLink}`}
                  className="w-full rounded-lg border border-[#a7f3d0] bg-white px-3.5 py-2.5 font-mono text-xs text-[#111827] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={copyToClipboard}
                  className="shrink-0 rounded-lg bg-[#111827] px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#1f2937]"
                >
                  {copied ? "Copied!" : "Copy Link"}
                </button>
              </div>

              <div className="mt-4 flex items-center justify-between pt-3 border-t border-[#a7f3d0] font-mono text-[11px] text-[#047857]">
                <span>Identity Anchor: 0x7f83...190e</span>
                <Link
                  href={`/v/${generatedLink}`}
                  className="font-bold underline hover:text-[#065f46]"
                >
                  Preview Verifier View →
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#e4e4e7] bg-white px-6 py-6 text-center font-mono text-xs text-[#71717a]">
        © 2026 Velum · Private Income Proof Layer on Starknet STRK20
      </footer>
    </div>
  );
}
