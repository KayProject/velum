"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { getNicknames, addNickname, PayerNickname } from "@/lib/velum/store";
import { WarningCircle, LockKey } from "@phosphor-icons/react";
import { AppHeader } from "@/app/components/AppHeader";
import { AppFooter } from "@/app/components/AppFooter";

export default function PayerEnrolPage() {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [nicknames, setNicknames] = useState<PayerNickname[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setNicknames(getNicknames());
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const res = addNickname(name, address);
    if (!res.success) {
      setError(res.error || "Failed to save.");
      return;
    }

    setNicknames(getNicknames());
    setSuccess(`Saved "${name}" locally.`);
    setName("");
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col justify-between selection:bg-[#2563eb]/20 selection:text-[#1e40af]">
      <AppHeader
        badge="ADDRESS BOOK"
        sticky={false}
        rightSlot={
          <Link href="/payer" className="text-xs font-semibold text-[#71717a] hover:text-[#111827]">
            ← Back to Payer Console
          </Link>
        }
      />

      <main className="mx-auto w-full max-w-4xl px-6 py-12">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="rounded-2xl border border-[#e4e4e7] bg-white p-6 sm:p-8 shadow-sm lg:col-span-6">
            <span className="font-mono text-xs font-semibold uppercase tracking-widest text-[#2563eb]">
              [ Local Convenience — Not On-Chain ]
            </span>
            <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-[#111827]">
              Save a Payer Name
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-[#6b7280]">
              Velum's deployed contract has an <code className="font-mono text-[#2563eb]">enrolment_of()</code> view
              function, but nothing currently writes to it — there is no real on-chain enrolment to
              register. This just saves an address-to-name mapping in your browser so you don't have
              to re-type addresses.
            </p>

            <form onSubmit={handleSave} className="mt-6 space-y-4">
              <div>
                <label className="font-mono text-xs font-bold text-[#111827]">01 // NAME</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Acme DAO, Superteam UK, StarkWare"
                  className="mt-1.5 w-full rounded-lg border border-[#e4e4e7] bg-white px-3 py-2 text-xs font-medium text-[#111827] focus:border-[#2563eb] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-mono text-xs font-bold text-[#111827]">02 // STARKNET ADDRESS</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="0x..."
                  className="mt-1.5 w-full rounded-lg border border-[#e4e4e7] bg-white px-3 py-2 text-xs font-mono text-[#111827] focus:border-[#2563eb] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-[#111827] py-3 text-xs font-bold text-white hover:bg-[#1f2937] transition-all shadow-sm"
              >
                Save Locally
              </button>
            </form>

            {error && (
              <div className="flex items-center gap-1.5 mt-4 rounded-lg bg-[#fef2f2] border border-[#fecaca] p-3 text-xs font-mono text-[#b91c1c]">
                <WarningCircle size={14} weight="bold" className="shrink-0" /> {error}
              </div>
            )}
            {success && (
              <div className="mt-4 rounded-lg bg-[#eff6ff] border border-[#bfdbfe] p-3 text-xs font-medium text-[#1d4ed8]">
                {success}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-[#e4e4e7] bg-white p-6 sm:p-8 shadow-sm lg:col-span-6 flex flex-col justify-between">
            <div>
              <h2 className="font-display text-base font-bold text-[#111827]">Saved Names ({nicknames.length})</h2>
              <div className="mt-4 divide-y divide-[#f4f4f5]">
                {nicknames.map((n, i) => (
                  <div key={i} className="py-3 space-y-1">
                    <span className="font-display text-sm font-bold text-[#111827]">{n.name}</span>
                    <div className="flex items-center justify-between font-mono text-[11px] text-[#71717a]">
                      <span>{n.address.slice(0, 14)}...{n.address.slice(-6)}</span>
                      <span>{new Date(n.addedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-start gap-1.5 mt-6 rounded-xl bg-[#fafafa] border border-[#e4e4e7] p-3 font-mono text-[11px] text-[#71717a]">
              <LockKey size={14} weight="bold" className="shrink-0 mt-0.5" />
              This list lives only in your browser. Anyone else viewing a claim from this payer sees
              a raw address, not this name.
            </div>
          </div>
        </div>
      </main>

      <AppFooter />
    </div>
  );
}
