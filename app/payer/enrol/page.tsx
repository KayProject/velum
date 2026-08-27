"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { getEnrolments, enrolPayer, PayerEnrolment } from "@/lib/velum/store";

export default function PayerEnrolPage() {
  const [enrolName, setEnrolName] = useState("");
  const [enrolAddress, setEnrolAddress] = useState("0x0403bc891a271df912a7812a39281a8b9281a");
  const [enrolments, setEnrolments] = useState<PayerEnrolment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setEnrolments(getEnrolments());
  }, []);

  const handleEnrol = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const res = enrolPayer(enrolName, enrolAddress);
    if (!res.success) {
      setError(res.error || "Enrolment failed");
      return;
    }

    setEnrolments(getEnrolments());
    setSuccess(`✓ Successfully registered "${enrolName}" as an attested payer.`);
    setEnrolName("");
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col justify-between selection:bg-[#2563eb]/20 selection:text-[#1e40af]">
      <header className="border-b border-[#e4e4e7] bg-white/90 backdrop-blur-md px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#111827] text-white font-mono font-bold text-xs">
              V
            </div>
            <span className="font-display text-lg font-bold text-[#111827]">
              Velum
            </span>
            <span className="font-mono text-[10px] text-[#2563eb] bg-[#eff6ff] border border-[#bfdbfe] px-2 py-0.5 rounded-full font-semibold">
              PAYER ENROLMENT
            </span>
          </Link>

          <Link
            href="/payer"
            className="text-xs font-semibold text-[#71717a] hover:text-[#111827]"
          >
            ← Back to Payer Console
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl px-6 py-12">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="rounded-2xl border border-[#e4e4e7] bg-white p-6 sm:p-8 shadow-sm lg:col-span-6">
            <span className="font-mono text-xs font-semibold uppercase tracking-widest text-[#2563eb]">
              [ Payer Identity Registration ]
            </span>
            <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-[#111827]">
              Enrol Payer Organization
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-[#6b7280]">
              Bind your DAO or company name to your Starknet signing address on-chain. Claims produced from your attestations will display your registered name.
            </p>

            <form onSubmit={handleEnrol} className="mt-6 space-y-4">
              <div>
                <label className="font-mono text-xs font-bold text-[#111827]">
                  01 // ORGANIZATION NAME
                </label>
                <input
                  type="text"
                  required
                  value={enrolName}
                  onChange={(e) => setEnrolName(e.target.value)}
                  placeholder="e.g. Acme DAO, Superteam UK, StarkWare"
                  className="mt-1.5 w-full rounded-lg border border-[#e4e4e7] bg-white px-3 py-2 text-xs font-medium text-[#111827] focus:border-[#2563eb] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-mono text-xs font-bold text-[#111827]">
                  02 // STARKNET SIGNER ADDRESS
                </label>
                <input
                  type="text"
                  required
                  value={enrolAddress}
                  onChange={(e) => setEnrolAddress(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-[#e4e4e7] bg-white px-3 py-2 text-xs font-mono text-[#111827] focus:border-[#2563eb] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-[#111827] py-3 text-xs font-bold text-white hover:bg-[#1f2937] transition-all shadow-sm"
              >
                Register On-Chain Enrolment
              </button>
            </form>

            {error && (
              <div className="mt-4 rounded-lg bg-[#fef2f2] border border-[#fecaca] p-3 text-xs font-mono text-[#b91c1c]">
                ⚠️ {error}
              </div>
            )}

            {success && (
              <div className="mt-4 rounded-lg bg-[#ecfdf5] border border-[#a7f3d0] p-3 text-xs font-medium text-[#047857]">
                {success}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-[#e4e4e7] bg-white p-6 sm:p-8 shadow-sm lg:col-span-6 flex flex-col justify-between">
            <div>
              <h2 className="font-display text-base font-bold text-[#111827]">
                Enrolled Organizations ({enrolments.length})
              </h2>
              <div className="mt-4 divide-y divide-[#f4f4f5]">
                {enrolments.map((enr, i) => (
                  <div key={i} className="py-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-display text-sm font-bold text-[#111827]">
                        {enr.name}
                      </span>
                      <span className="rounded bg-[#eff6ff] border border-[#bfdbfe] px-2 py-0.5 font-mono text-[10px] font-semibold text-[#2563eb]">
                        ENROLLED
                      </span>
                    </div>
                    <div className="flex items-center justify-between font-mono text-[11px] text-[#71717a]">
                      <span>{enr.address.slice(0, 14)}...{enr.address.slice(-6)}</span>
                      <span>{new Date(enr.enrolledAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 rounded-xl bg-[#fafafa] border border-[#e4e4e7] p-3 font-mono text-[11px] text-[#71717a]">
              🔒 Payer enrolments prevent impersonation. Unregistered payers are displayed to landlords as self-declared.
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-[#e4e4e7] bg-white px-6 py-6 text-center font-mono text-xs text-[#71717a]">
        © 2026 Velum · Private Income Proof Layer on Starknet STRK20
      </footer>
    </div>
  );
}
