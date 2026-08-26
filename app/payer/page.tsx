"use client";

import Link from "next/link";
import { useState } from "react";

export default function PayerPage() {
  const [recipientTag, setRecipientTag] = useState("");
  const [amount, setAmount] = useState("1500000");
  const [token, setToken] = useState("NGN");
  const [windowPeriod, setWindowPeriod] = useState("2026-Q1");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [attestations, setAttestations] = useState([
    {
      id: "att_0x92af...3312",
      recipient: "tag_0x8f21...91a2",
      amount: "₦1,500,000",
      window: "2026-Q1",
      tx: "0x04a2...b189",
      status: "Committed",
    },
    {
      id: "att_0x18ea...9021",
      recipient: "tag_0x33b8...77e1",
      amount: "₦2,700,000",
      window: "2026-Q1",
      tx: "0x098d...cf22",
      status: "Committed",
    },
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess(true);
      const newAtt = {
        id: "att_0x" + Math.random().toString(16).slice(2, 8) + "...live",
        recipient: recipientTag || "tag_0x" + Math.random().toString(16).slice(2, 8),
        amount: token === "NGN" ? `₦${Number(amount).toLocaleString()}` : `${amount} ${token}`,
        window: windowPeriod,
        tx: "0x07f1...99aa",
        status: "Committed",
      };
      setAttestations([newAtt, ...attestations]);
    }, 1000);
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
            <span className="font-mono text-[10px] text-[#2563eb] bg-[#eff6ff] border border-[#bfdbfe] px-2 py-0.5 rounded-full font-semibold">
              PAYER CONSOLE
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
      <main className="mx-auto w-full max-w-4xl px-6 py-12">
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Left: Form */}
          <div className="rounded-2xl border border-[#e4e4e7] bg-white p-6 sm:p-8 shadow-sm lg:col-span-6">
            <div>
              <span className="font-mono text-xs font-semibold uppercase tracking-widest text-[#2563eb]">
                [ record payroll attestation ]
              </span>
              <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-[#111827]">
                Record an Attestation
              </h1>
              <p className="mt-1.5 text-xs text-[#6b7280]">
                Publish a signed payment commitment against an uncorrelatable recipient tag. You learn
                nothing new about the earner&apos;s other accounts.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="font-mono text-xs font-bold text-[#111827]">
                  01 // RECIPIENT COMMITMENT TAG
                </label>
                <input
                  type="text"
                  required
                  value={recipientTag}
                  onChange={(e) => setRecipientTag(e.target.value)}
                  placeholder="tag_0x8f2191a2... or recipient channel key"
                  className="mt-1.5 w-full rounded-lg border border-[#e4e4e7] bg-white px-3 py-2 text-xs font-mono text-[#111827] placeholder:text-[#a1a1aa] focus:border-[#2563eb] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-mono text-xs font-bold text-[#111827]">
                    02 // PAYMENT AMOUNT
                  </label>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-[#e4e4e7] bg-white px-3 py-2 text-xs font-semibold text-[#111827] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-mono text-xs font-bold text-[#111827]">
                    03 // TOKEN / CURRENCY
                  </label>
                  <select
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-[#e4e4e7] bg-white px-3 py-2 text-xs font-medium text-[#111827] focus:outline-none"
                  >
                    <option value="NGN">₦ NGN</option>
                    <option value="STRK">STRK</option>
                    <option value="USD">$ USD</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-mono text-xs font-bold text-[#111827]">
                  04 // COVERED PERIOD
                </label>
                <select
                  value={windowPeriod}
                  onChange={(e) => setWindowPeriod(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-[#e4e4e7] bg-white px-3 py-2 text-xs font-medium text-[#111827] focus:outline-none"
                >
                  <option value="2026-Q1">Jan 1 – Mar 31, 2026 (Q1)</option>
                  <option value="2025-Q4">Oct 1 – Dec 31, 2025 (Q4)</option>
                  <option value="2025-Q3">Jul 1 – Sep 30, 2025 (Q3)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#111827] py-3 text-xs font-bold text-white transition-all hover:bg-[#1f2937] active:scale-[0.99] disabled:opacity-75 shadow-sm"
              >
                {isSubmitting ? (
                  <span>Signing &amp; Publishing Attestation...</span>
                ) : (
                  <span>Record Signed Attestation</span>
                )}
              </button>
            </form>

            {success && (
              <div className="mt-4 rounded-lg bg-[#ecfdf5] border border-[#a7f3d0] p-3 text-xs font-medium text-[#047857]">
                ✓ Attestation published to Velum contract with payer signature.
              </div>
            )}
          </div>

          {/* Right: Attestation Ledger */}
          <div className="rounded-2xl border border-[#e4e4e7] bg-white p-6 sm:p-8 shadow-sm lg:col-span-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-[#f4f4f5] pb-4">
                <h2 className="font-display text-base font-bold text-[#111827]">
                  Recent Attestations
                </h2>
                <span className="font-mono text-[10px] text-[#71717a]">
                  {attestations.length} Published
                </span>
              </div>

              <div className="mt-4 divide-y divide-[#f4f4f5]">
                {attestations.map((att, i) => (
                  <div key={i} className="py-3.5 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-[#111827]">
                        {att.amount}
                      </span>
                      <span className="rounded bg-[#ecfdf5] border border-[#a7f3d0] px-2 py-0.5 font-mono text-[10px] font-semibold text-[#047857]">
                        {att.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between font-mono text-[11px] text-[#71717a]">
                      <span>Recipient: {att.recipient}</span>
                      <span>{att.window}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 rounded-xl bg-[#fafafa] border border-[#e4e4e7] p-3 font-mono text-[11px] text-[#71717a]">
              🔒 Payer signatures guarantee authenticity without revealing recipient balances.
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#e4e4e7] bg-white px-6 py-6 text-center font-mono text-xs text-[#71717a]">
        © 2026 Velum · Private Income Proof Layer on Starknet STRK20
      </footer>
    </div>
  );
}
