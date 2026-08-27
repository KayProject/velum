"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  getAttestations,
  recordAttestation,
  recordBatchAttestations,
  getEnrolments,
  enrolPayer,
  PaymentAttestation,
  PayerEnrolment,
} from "@/lib/velum/store";
import { deriveChannelKey, deriveRecipientTag, formatTag } from "@/lib/velum/channel";

export default function PayerConsolePage() {
  const [activeTab, setActiveTab] = useState<"single" | "batch" | "enrol" | "ledger">("single");

  // Single Attestation state
  const [recipientTag, setRecipientTag] = useState("");
  const [amount, setAmount] = useState("1500000");
  const [token, setToken] = useState("NGN");
  const [windowPeriod, setWindowPeriod] = useState("2026-Q1");
  const [selectedPayerAddress, setSelectedPayerAddress] = useState("0x0403bc891a271df912a7812a39281a8b9281a");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  // Recipient Tag derivation helper state
  const [showTagDeriver, setShowTagDeriver] = useState(false);
  const [channelSeed, setChannelSeed] = useState("earner_viewing_passphrase_seed");
  const [payerContext, setPayerContext] = useState("acme_dao_payroll_context");
  const [derivedChannelKey, setDerivedChannelKey] = useState("");
  const [derivedTag, setDerivedTag] = useState("");

  // Batch Attestation state
  const [csvContent, setCsvContent] = useState(
    `# recipient_tag, amount, token, window\n0x05b291a2810f99a8127390182739182739182739182739182739182739182739, 1500000, NGN, 2026-Q1\n0x07a112233445566778899aabbccddeeff00112233445566778899aabbccddeeff, 2200000, NGN, 2026-Q1\n0x08b2233445566778899aabbccddeeff00112233445566778899aabbccddeeff, 1800000, NGN, 2026-Q1`
  );
  const [parsedBatch, setParsedBatch] = useState<Array<{ recipientTag: string; amount: bigint; token: string; windowPeriod: string }>>([]);
  const [batchError, setBatchError] = useState<string | null>(null);
  const [batchSuccess, setBatchSuccess] = useState<string | null>(null);

  // Enrolment state
  const [enrolName, setEnrolName] = useState("");
  const [enrolAddress, setEnrolAddress] = useState("0x0403bc891a271df912a7812a39281a8b9281a");
  const [enrolError, setEnrolError] = useState<string | null>(null);
  const [enrolSuccess, setEnrolSuccess] = useState<string | null>(null);

  // Ledger & Enrolments store data
  const [attestations, setAttestations] = useState<PaymentAttestation[]>([]);
  const [enrolments, setEnrolments] = useState<PayerEnrolment[]>([]);

  useEffect(() => {
    setAttestations(getAttestations());
    setEnrolments(getEnrolments());
  }, []);

  // Compute live channel tag derivation
  useEffect(() => {
    try {
      const seedFelt = BigInt("0x" + Buffer.from(channelSeed || "seed").toString("hex").slice(0, 30));
      const contextFelt = BigInt("0x" + Buffer.from(payerContext || "context").toString("hex").slice(0, 30));
      const chKey = deriveChannelKey(seedFelt, contextFelt);
      const tag = deriveRecipientTag(chKey);
      setDerivedChannelKey("0x" + chKey.toString(16));
      setDerivedTag(formatTag(tag));
    } catch {
      // ignore
    }
  }, [channelSeed, payerContext]);

  // Parse CSV whenever batch content changes
  useEffect(() => {
    try {
      const lines = csvContent
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l && !l.startsWith("#"));

      const parsed = lines.map((line) => {
        const parts = line.split(",").map((p) => p.trim());
        if (parts.length < 4) throw new Error("Invalid CSV line format. Required: tag, amount, token, window");
        const [tag, amtStr, tok, win] = parts;
        const amt = BigInt(amtStr.replace(/[^0-9]/g, ""));
        return { recipientTag: tag, amount: amt, token: tok, windowPeriod: win };
      });
      setParsedBatch(parsed);
      setBatchError(null);
    } catch (err: unknown) {
      setBatchError(err instanceof Error ? err.message : "CSV Parse error");
    }
  }, [csvContent]);

  // Handle single submit
  const handleSingleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitSuccess(null);

    setTimeout(() => {
      const amt = BigInt(amount.replace(/[^0-9]/g, ""));
      const res = recordAttestation({
        payerAddress: selectedPayerAddress,
        recipientTag: recipientTag.trim() || derivedTag,
        amount: amt,
        token,
        windowPeriod,
      });

      setAttestations(getAttestations());
      setIsSubmitting(false);
      setSubmitSuccess(`✓ Attestation published! Tx Hash: ${res.attestation.txHash.slice(0, 18)}...`);
    }, 600);
  };

  // Handle batch submit
  const handleBatchSubmit = () => {
    if (parsedBatch.length === 0) return;
    setIsSubmitting(true);
    setBatchSuccess(null);

    setTimeout(() => {
      const res = recordBatchAttestations(selectedPayerAddress, parsedBatch);
      setAttestations(getAttestations());
      setIsSubmitting(false);
      setBatchSuccess(`✓ Batch processed! Published ${res.count} payment attestations in 1 transaction.`);
    }, 800);
  };

  // Handle Enrolment
  const handleEnrol = (e: React.FormEvent) => {
    e.preventDefault();
    setEnrolError(null);
    setEnrolSuccess(null);

    const res = enrolPayer(enrolName, enrolAddress);
    if (!res.success) {
      setEnrolError(res.error || "Enrolment failed");
      return;
    }

    setEnrolments(getEnrolments());
    setEnrolSuccess(`✓ Successfully enrolled "${enrolName}" for address ${enrolAddress.slice(0, 10)}...!`);
    setEnrolName("");
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col justify-between selection:bg-[#2563eb]/20 selection:text-[#1e40af]">
      {/* Header */}
      <header className="border-b border-[#e4e4e7] bg-white/90 backdrop-blur-md px-6 py-4 sticky top-0 z-30">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#111827] text-white font-mono font-bold text-xs">
              V
            </div>
            <span className="font-display text-lg font-bold text-[#111827]">
              Velum
            </span>
            <span className="font-mono text-[10px] text-[#2563eb] bg-[#eff6ff] border border-[#bfdbfe] px-2 py-0.5 rounded-full font-semibold">
              PAYER PORTAL
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/app"
              className="text-xs font-semibold text-[#059669] hover:underline"
            >
              Switch to Earner Portal →
            </Link>
            <Link
              href="/"
              className="text-xs font-semibold text-[#71717a] hover:text-[#111827]"
            >
              ← Overview
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto w-full max-w-5xl px-6 py-10">
        {/* Intro */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="font-mono text-xs font-semibold uppercase tracking-widest text-[#2563eb]">
              [ Payer Infrastructure &amp; Payroll Attestations ]
            </span>
            <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#111827]">
              Payer Console &amp; Payroll Ledger
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[#6b7280]">
              Emit cryptographic payment commitments against uncorrelatable recipient tags. Learn nothing new about the earner&apos;s personal addresses.
            </p>
          </div>

          {/* Quick Enrolment Status Pill */}
          <div className="rounded-xl border border-[#e4e4e7] bg-white p-3 shadow-2xs font-mono text-xs">
            <span className="text-[#71717a] block text-[10px]">Active Payer Identity:</span>
            <span className="font-bold text-[#111827]">
              {enrolments.find((e) => e.address.toLowerCase() === selectedPayerAddress.toLowerCase())?.name || "Unenrolled Address"}
            </span>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex flex-wrap items-center gap-2 border-b border-[#e4e4e7] pb-3 mb-8">
          <button
            type="button"
            onClick={() => setActiveTab("single")}
            className={`rounded-lg px-3.5 py-2 font-mono text-xs font-semibold transition-all ${
              activeTab === "single"
                ? "bg-[#111827] text-white shadow-xs"
                : "bg-white text-[#71717a] border border-[#e4e4e7] hover:text-[#111827]"
            }`}
          >
            01 // Single Attestation
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("batch")}
            className={`rounded-lg px-3.5 py-2 font-mono text-xs font-semibold transition-all ${
              activeTab === "batch"
                ? "bg-[#111827] text-white shadow-xs"
                : "bg-white text-[#71717a] border border-[#e4e4e7] hover:text-[#111827]"
            }`}
          >
            02 // Batch Payroll Upload (CSV)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("enrol")}
            className={`rounded-lg px-3.5 py-2 font-mono text-xs font-semibold transition-all ${
              activeTab === "enrol"
                ? "bg-[#111827] text-white shadow-xs"
                : "bg-white text-[#71717a] border border-[#e4e4e7] hover:text-[#111827]"
            }`}
          >
            03 // Payer Enrolment &amp; Registry
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("ledger")}
            className={`rounded-lg px-3.5 py-2 font-mono text-xs font-semibold transition-all ${
              activeTab === "ledger"
                ? "bg-[#111827] text-white shadow-xs"
                : "bg-white text-[#71717a] border border-[#e4e4e7] hover:text-[#111827]"
            }`}
          >
            04 // Published Ledger ({attestations.length})
          </button>
        </div>

        {/* TAB 1: Single Attestation */}
        {activeTab === "single" && (
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="rounded-2xl border border-[#e4e4e7] bg-white p-6 sm:p-8 shadow-sm lg:col-span-7">
              <h2 className="font-display text-lg font-bold text-[#111827]">
                Record a Payment Attestation
              </h2>
              <p className="mt-1 text-xs text-[#6b7280]">
                Calls <code className="font-mono text-[#2563eb]">velum.attest(recipient_tag, token, amount)</code> on Starknet.
              </p>

              <form onSubmit={handleSingleSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="font-mono text-xs font-bold text-[#111827]">
                    01 // SENDER / PAYER ACCOUNT
                  </label>
                  <select
                    value={selectedPayerAddress}
                    onChange={(e) => setSelectedPayerAddress(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-[#e4e4e7] bg-white px-3 py-2 text-xs font-mono text-[#111827] focus:border-[#2563eb] focus:outline-none"
                  >
                    {enrolments.map((enr) => (
                      <option key={enr.address} value={enr.address}>
                        {enr.name} ({enr.address.slice(0, 10)}...{enr.address.slice(-6)})
                      </option>
                    ))}
                    <option value="0x0999aa887766554433221100ffeeddccbbaa00">
                      Custom Unenrolled Payer Address (0x0999...aa00)
                    </option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="font-mono text-xs font-bold text-[#111827]">
                      02 // RECIPIENT COMMITMENT TAG
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowTagDeriver(!showTagDeriver)}
                      className="text-[11px] font-mono text-[#2563eb] hover:underline"
                    >
                      {showTagDeriver ? "Hide Derivation Helper" : "⚡ Open Derivation Helper"}
                    </button>
                  </div>

                  <input
                    type="text"
                    required
                    value={recipientTag}
                    onChange={(e) => setRecipientTag(e.target.value)}
                    placeholder={derivedTag || "0x05b291a2810f99a8..."}
                    className="mt-1.5 w-full rounded-lg border border-[#e4e4e7] bg-white px-3 py-2 text-xs font-mono text-[#111827] placeholder:text-[#a1a1aa] focus:border-[#2563eb] focus:outline-none"
                  />
                </div>

                {/* Recipient Tag Deriver Helper */}
                {showTagDeriver && (
                  <div className="rounded-xl border border-[#bfdbfe] bg-[#eff6ff] p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-[#1e40af]">
                        Poseidon Channel Derivation Simulator
                      </span>
                      <span className="font-mono text-[10px] text-[#2563eb] bg-white px-2 py-0.5 rounded border border-[#bfdbfe]">
                        h(VELUM_RECIPIENT_TAG, channel_key)
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <span className="font-mono text-[10px] text-[#475569]">Earner Secret Seed:</span>
                        <input
                          type="text"
                          value={channelSeed}
                          onChange={(e) => setChannelSeed(e.target.value)}
                          className="mt-1 w-full rounded border border-[#cbd5e1] bg-white px-2 py-1 text-[11px] font-mono"
                        />
                      </div>
                      <div>
                        <span className="font-mono text-[10px] text-[#475569]">Payer Context:</span>
                        <input
                          type="text"
                          value={payerContext}
                          onChange={(e) => setPayerContext(e.target.value)}
                          className="mt-1 w-full rounded border border-[#cbd5e1] bg-white px-2 py-1 text-[11px] font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <span className="font-mono text-[10px] text-[#475569]">Derived Recipient Commitment Tag:</span>
                      <div className="mt-1 flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={derivedTag}
                          className="w-full rounded border border-[#cbd5e1] bg-white px-2 py-1 text-[11px] font-mono text-[#1e293b]"
                        />
                        <button
                          type="button"
                          onClick={() => setRecipientTag(derivedTag)}
                          className="shrink-0 rounded bg-[#2563eb] px-2.5 py-1 text-[11px] font-bold text-white hover:bg-[#1d4ed8]"
                        >
                          Use Tag
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-mono text-xs font-bold text-[#111827]">
                      03 // PAYMENT AMOUNT
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
                      04 // TOKEN / CURRENCY
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
                    05 // COVERED WINDOW / PERIOD
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
                  {isSubmitting ? "Signing &amp; Emitting Attestation on Starknet..." : "Sign &amp; Record Attestation"}
                </button>
              </form>

              {submitSuccess && (
                <div className="mt-4 rounded-lg bg-[#ecfdf5] border border-[#a7f3d0] p-3 text-xs font-medium text-[#047857]">
                  {submitSuccess}
                </div>
              )}
            </div>

            {/* Right: Security & Privacy Guarantees */}
            <div className="space-y-6 lg:col-span-5">
              <div className="rounded-2xl border border-[#e4e4e7] bg-white p-6 shadow-sm">
                <h3 className="font-display text-sm font-bold text-[#111827]">
                  Declared Protocol Guarantee (FR-014)
                </h3>
                <ul className="mt-4 space-y-3 text-xs text-[#6b7280]">
                  <li className="flex items-start gap-2">
                    <span className="text-[#2563eb] font-bold">✓</span>
                    <span>
                      <strong>Unlinkability:</strong> The recipient commitment tag does not disclose the recipient&apos;s mainnet address or wallet balance.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#2563eb] font-bold">✓</span>
                    <span>
                      <strong>Authenticity:</strong> Because the channel key derives from the payer&apos;s context, the earner cannot fabricate fake payment records.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#2563eb] font-bold">✓</span>
                    <span>
                      <strong>No Custody:</strong> Velum does not hold token balances. Attestations are purely non-repudiable assertions over payroll.
                    </span>
                  </li>
                </ul>
              </div>

              <div className="rounded-2xl border border-[#e4e4e7] bg-[#fcfcfc] p-6 text-xs text-[#71717a] font-mono">
                <span className="font-bold text-[#111827] block mb-1">Contract Entrypoint:</span>
                <code>fn attest(ref self: T, recipient_tag: felt252, token: ContractAddress, amount: u128)</code>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Batch Payroll Upload */}
        {activeTab === "batch" && (
          <div className="rounded-2xl border border-[#e4e4e7] bg-white p-6 sm:p-8 shadow-sm">
            <div>
              <span className="font-mono text-xs font-semibold uppercase tracking-widest text-[#2563eb]">
                [ Slice 2 · T041 / T043 ]
              </span>
              <h2 className="mt-1 font-display text-xl font-bold text-[#111827]">
                Batch Payroll Attestation (1 Transaction)
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-[#6b7280]">
                Attest an entire monthly payroll run in a single transaction. Upstream payroll tools can pipe their payout CSVs directly into this entrypoint.
              </p>
            </div>

            <div className="mt-6">
              <label className="font-mono text-xs font-bold text-[#111827]">
                PASTE PAYROLL CSV DATA
              </label>
              <textarea
                rows={6}
                value={csvContent}
                onChange={(e) => setCsvContent(e.target.value)}
                className="mt-2 w-full rounded-xl border border-[#e4e4e7] bg-[#fafafa] p-4 font-mono text-xs text-[#111827] focus:border-[#2563eb] focus:outline-none"
              />
            </div>

            {batchError && (
              <div className="mt-3 rounded-lg bg-[#fef2f2] border border-[#fecaca] p-3 font-mono text-xs text-[#b91c1c]">
                ⚠️ {batchError}
              </div>
            )}

            {/* Parsed Preview Table */}
            <div className="mt-6 border border-[#e4e4e7] rounded-xl overflow-hidden">
              <div className="bg-[#fafafa] px-4 py-2.5 border-b border-[#e4e4e7] flex items-center justify-between font-mono text-xs font-bold text-[#71717a]">
                <span>PARSED ENTRIES ({parsedBatch.length})</span>
                <span>TOTAL PAYOUT: ₦{parsedBatch.reduce((sum, i) => sum + Number(i.amount), 0).toLocaleString()}</span>
              </div>

              <div className="divide-y divide-[#f4f4f5] max-h-56 overflow-y-auto">
                {parsedBatch.map((entry, idx) => (
                  <div key={idx} className="px-4 py-3 flex items-center justify-between text-xs font-mono">
                    <span className="text-[#111827] truncate max-w-xs">{entry.recipientTag}</span>
                    <span className="font-bold text-[#059669]">
                      ₦{Number(entry.amount).toLocaleString()} ({entry.token})
                    </span>
                    <span className="text-[#71717a]">{entry.windowPeriod}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <span className="font-mono text-xs text-[#71717a]">
                Emits <code className="text-[#2563eb]">velum.attest_batch(entries)</code> in 1 atomic transaction.
              </span>
              <button
                type="button"
                disabled={isSubmitting || parsedBatch.length === 0}
                onClick={handleBatchSubmit}
                className="rounded-xl bg-[#111827] px-6 py-3 text-xs font-bold text-white hover:bg-[#1f2937] transition-all disabled:opacity-50"
              >
                {isSubmitting ? "Emitting Batch Attestation..." : `Execute Batch Attest (${parsedBatch.length} Items)`}
              </button>
            </div>

            {batchSuccess && (
              <div className="mt-4 rounded-lg bg-[#ecfdf5] border border-[#a7f3d0] p-3 text-xs font-medium text-[#047857]">
                {batchSuccess}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Payer Enrolment */}
        {activeTab === "enrol" && (
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="rounded-2xl border border-[#e4e4e7] bg-white p-6 sm:p-8 shadow-sm lg:col-span-6">
              <span className="font-mono text-xs font-semibold uppercase tracking-widest text-[#2563eb]">
                [ Slice 2 · T040 / T043 ]
              </span>
              <h2 className="mt-1 font-display text-xl font-bold text-[#111827]">
                Enrol Organization Identity
              </h2>
              <p className="mt-1 text-xs text-[#6b7280]">
                Bind a verified human-readable name to your Starknet signing address so claims read &quot;from Acme DAO&quot; rather than an unnamed address.
              </p>

              <form onSubmit={handleEnrol} className="mt-6 space-y-4">
                <div>
                  <label className="font-mono text-xs font-bold text-[#111827]">
                    01 // ORGANIZATION / DAO NAME
                  </label>
                  <input
                    type="text"
                    required
                    value={enrolName}
                    onChange={(e) => setEnrolName(e.target.value)}
                    placeholder="e.g. Acme DAO or Superteam UK"
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
                  className="w-full rounded-xl bg-[#111827] py-3 text-xs font-bold text-white hover:bg-[#1f2937] transition-all"
                >
                  Register Payer Enrolment
                </button>
              </form>

              {enrolError && (
                <div className="mt-4 rounded-lg bg-[#fef2f2] border border-[#fecaca] p-3 text-xs font-mono text-[#b91c1c]">
                  ⚠️ {enrolError}
                </div>
              )}

              {enrolSuccess && (
                <div className="mt-4 rounded-lg bg-[#ecfdf5] border border-[#a7f3d0] p-3 text-xs font-medium text-[#047857]">
                  {enrolSuccess}
                </div>
              )}
            </div>

            {/* Right: Enrolled Organizations List */}
            <div className="rounded-2xl border border-[#e4e4e7] bg-white p-6 sm:p-8 shadow-sm lg:col-span-6 flex flex-col justify-between">
              <div>
                <h3 className="font-display text-base font-bold text-[#111827]">
                  Enrolled Payers ({enrolments.length})
                </h3>
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
                🔒 Payers who do not enrol appear on verifier claims as &quot;Self-Declared, Unattested&quot;.
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Published Ledger */}
        {activeTab === "ledger" && (
          <div className="rounded-2xl border border-[#e4e4e7] bg-white p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#f4f4f5] pb-4 mb-4">
              <div>
                <h2 className="font-display text-lg font-bold text-[#111827]">
                  Published Payment Commitments
                </h2>
                <p className="text-xs text-[#6b7280]">
                  On-chain record of signed payroll attestations.
                </p>
              </div>
              <span className="font-mono text-xs font-semibold text-[#2563eb]">
                {attestations.length} Published
              </span>
            </div>

            <div className="divide-y divide-[#f4f4f5] max-h-96 overflow-y-auto">
              {attestations.map((att, idx) => (
                <div key={idx} className="py-3.5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-[#111827]">
                        {att.amountFormatted}
                      </span>
                      <span className="font-mono text-[10px] text-[#71717a] bg-[#f4f4f5] px-2 py-0.5 rounded">
                        {att.payerName || "Unenrolled Payer"}
                      </span>
                    </div>
                    <span className="rounded bg-[#ecfdf5] border border-[#a7f3d0] px-2 py-0.5 font-mono text-[10px] font-semibold text-[#047857]">
                      COMMITTED
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] text-[#71717a]">
                    <span className="truncate max-w-sm">Recipient Tag: {att.recipientTag}</span>
                    <span>Window: {att.windowPeriod}</span>
                    <span className="text-[#2563eb]">Tx: {att.txHash.slice(0, 14)}...</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#e4e4e7] bg-white px-6 py-6 text-center font-mono text-xs text-[#71717a]">
        © 2026 Velum · Private Income Proof Layer on Starknet STRK20
      </footer>
    </div>
  );
}
