"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { hash } from "starknet";
import { getNicknames, addNickname, PayerNickname } from "@/lib/velum/store";
import { deriveChannelKey, deriveRecipientTag, formatTag } from "@/lib/velum/channel";
import { velumContract, readProvider, velumAddress, STRK_ADDRESS, toWeiStrk, fromWeiStrk, explorerTxUrl } from "@/lib/velum/contract";
import { useWallet } from "@/lib/velum/wallet";
import { Lightning, WarningCircle, LockKey } from "@phosphor-icons/react";
import { AppHeader } from "@/app/components/AppHeader";
import { AppFooter } from "@/app/components/AppFooter";
import { WalletButton } from "@/app/components/WalletButton";

interface LedgerEntry {
  recipientTag: string;
  amount: bigint;
  attestedAt: number;
  txHash?: string;
}

export default function PayerConsolePage() {
  const wallet = useWallet();
  const [activeTab, setActiveTab] = useState<"single" | "batch" | "book" | "ledger">("single");

  // Single attestation
  const [recipientTag, setRecipientTag] = useState("");
  const [amount, setAmount] = useState("10");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [singleResult, setSingleResult] = useState<{ txHash: string } | null>(null);
  const [singleError, setSingleError] = useState<string | null>(null);

  // Local derivation playground (not a real payer step — see note in the UI)
  const [showTagDeriver, setShowTagDeriver] = useState(false);
  const [channelSeed, setChannelSeed] = useState("earner_viewing_passphrase_seed");
  const [payerContext, setPayerContext] = useState("acme_dao_payroll_context");
  const [derivedTag, setDerivedTag] = useState("");

  // Batch attestation (real multicall — one signature, one transaction, N attest() calls)
  const [csvContent, setCsvContent] = useState(
    `# recipient_tag, amount (STRK)\n0x05b291a2810f99a8127390182739182739182739182739182739182739182739, 1.5\n0x07a112233445566778899aabbccddeeff00112233445566778899aabbccddeeff, 2.2`
  );
  const [parsedBatch, setParsedBatch] = useState<Array<{ recipientTag: string; amount: string }>>([]);
  const [batchError, setBatchError] = useState<string | null>(null);
  const [batchResult, setBatchResult] = useState<{ txHash: string } | null>(null);
  const [batchSubmitting, setBatchSubmitting] = useState(false);

  // Nickname book (local only)
  const [nickName, setNickName] = useState("");
  const [nickAddress, setNickAddress] = useState("");
  const [nickError, setNickError] = useState<string | null>(null);
  const [nicknames, setNicknames] = useState<PayerNickname[]>([]);

  // Ledger (real chain read)
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [ledgerLoading, setLedgerLoading] = useState(false);
  const [ledgerError, setLedgerError] = useState<string | null>(null);

  useEffect(() => {
    setNicknames(getNicknames());
  }, []);

  useEffect(() => {
    try {
      const seedFelt = BigInt("0x" + Buffer.from(channelSeed || "seed").toString("hex").slice(0, 30));
      const contextFelt = BigInt("0x" + Buffer.from(payerContext || "context").toString("hex").slice(0, 30));
      const chKey = deriveChannelKey(seedFelt, contextFelt);
      setDerivedTag(formatTag(deriveRecipientTag(chKey)));
    } catch {
      // ignore
    }
  }, [channelSeed, payerContext]);

  useEffect(() => {
    try {
      const lines = csvContent
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l && !l.startsWith("#"));
      const parsed = lines.map((line) => {
        const parts = line.split(",").map((p) => p.trim());
        if (parts.length < 2) throw new Error("Each line needs: recipient_tag, amount");
        const [tag, amt] = parts;
        toWeiStrk(amt); // validate it parses; throws if not a plain decimal
        return { recipientTag: tag, amount: amt };
      });
      setParsedBatch(parsed);
      setBatchError(null);
    } catch (err) {
      setBatchError(err instanceof Error ? err.message : "CSV parse error");
      setParsedBatch([]);
    }
  }, [csvContent]);

  const loadLedger = useCallback(async () => {
    if (!wallet.address) return;
    setLedgerLoading(true);
    setLedgerError(null);
    try {
      const selector = hash.getSelectorFromName("Attested");
      const provider = readProvider();
      const result = await provider.getEvents({
        address: velumAddress(),
        from_block: { block_number: 0 },
        to_block: "latest",
        keys: [[selector], [wallet.address]],
        chunk_size: 50,
      });
      const entries: LedgerEntry[] = result.events.map((ev) => ({
        recipientTag: "0x" + BigInt(ev.keys[2]).toString(16),
        amount: BigInt(ev.data[1]),
        attestedAt: Number(ev.data[2]),
        txHash: ev.transaction_hash,
      }));
      setLedger(entries.reverse());
    } catch (err) {
      setLedgerError(err instanceof Error ? err.message : "Failed to read events from chain.");
    } finally {
      setLedgerLoading(false);
    }
  }, [wallet.address]);

  useEffect(() => {
    if (activeTab === "ledger") loadLedger();
  }, [activeTab, loadLedger]);

  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet.account) return;
    setIsSubmitting(true);
    setSingleError(null);
    setSingleResult(null);
    try {
      const tag = recipientTag.trim() || derivedTag;
      const amountWei = toWeiStrk(amount);
      const contract = await velumContract(wallet.account);
      const { transaction_hash } = await contract.attest(tag, STRK_ADDRESS, amountWei.toString());
      setSingleResult({ txHash: transaction_hash });
    } catch (err) {
      setSingleError(err instanceof Error ? err.message : "Transaction failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBatchSubmit = async () => {
    if (!wallet.account || parsedBatch.length === 0) return;
    setBatchSubmitting(true);
    setBatchError(null);
    setBatchResult(null);
    try {
      const contract = await velumContract(wallet.account);
      const calls = parsedBatch.map((row) =>
        contract.populate("attest", [row.recipientTag, STRK_ADDRESS, toWeiStrk(row.amount).toString()])
      );
      const { transaction_hash } = await wallet.account.execute(calls);
      setBatchResult({ txHash: transaction_hash });
    } catch (err) {
      setBatchError(err instanceof Error ? err.message : "Batch transaction failed.");
    } finally {
      setBatchSubmitting(false);
    }
  };

  const handleAddNickname = (e: React.FormEvent) => {
    e.preventDefault();
    setNickError(null);
    const res = addNickname(nickName, nickAddress);
    if (!res.success) {
      setNickError(res.error || "Failed to save.");
      return;
    }
    setNicknames(getNicknames());
    setNickName("");
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col justify-between selection:bg-[#2563eb]/20 selection:text-[#1e40af]">
      <AppHeader
        badge="PAYER PORTAL"
        rightSlot={
          <div className="flex items-center gap-4">
            <WalletButton wallet={wallet} />
            <Link href="/app" className="text-xs font-semibold text-[#2563eb] hover:underline">
              Switch to Earner Portal →
            </Link>
            <Link href="/" className="text-xs font-semibold text-[#71717a] hover:text-[#111827]">
              ← Overview
            </Link>
          </div>
        }
      />

      <main className="mx-auto w-full max-w-5xl px-6 py-10">
        <div className="mb-8">
          <span className="font-mono text-xs font-semibold uppercase tracking-widest text-[#2563eb]">
            [ Payer Infrastructure — real on-chain attestations ]
          </span>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#111827]">
            Payer Console &amp; Payroll Ledger
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#6b7280]">
            Every action below is a real transaction on Starknet {process.env.NEXT_PUBLIC_VELUM_NETWORK || "mainnet"},
            signed by whichever wallet you connect. Nothing here is simulated.
          </p>
        </div>

        {!wallet.address && (
          <div className="mb-6 rounded-xl border border-[#fde68a] bg-[#fffbeb] p-4 text-xs text-[#92400e] flex items-center gap-2">
            <WarningCircle size={16} weight="bold" className="shrink-0" />
            Connect a wallet (top right) to attest — every action here signs and submits a real
            Starknet transaction.
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 border-b border-[#e4e4e7] pb-3 mb-8">
          {(["single", "batch", "book", "ledger"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-lg px-3.5 py-2 font-mono text-xs font-semibold transition-all ${
                activeTab === tab
                  ? "bg-[#111827] text-white shadow-xs"
                  : "bg-white text-[#71717a] border border-[#e4e4e7] hover:text-[#111827]"
              }`}
            >
              {tab === "single" && "01 // Single Attestation"}
              {tab === "batch" && "02 // Batch Payroll (multicall)"}
              {tab === "book" && "03 // Local Address Book"}
              {tab === "ledger" && "04 // My On-Chain Ledger"}
            </button>
          ))}
        </div>

        {activeTab === "single" && (
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="rounded-2xl border border-[#e4e4e7] bg-white p-6 sm:p-8 shadow-sm lg:col-span-7">
              <h2 className="font-display text-lg font-bold text-[#111827]">Record a Payment Attestation</h2>
              <p className="mt-1 text-xs text-[#6b7280]">
                Calls <code className="font-mono text-[#2563eb]">velum.attest(recipient_tag, token, amount)</code>{" "}
                on Starknet, signed by your connected wallet.
              </p>

              <form onSubmit={handleSingleSubmit} className="mt-6 space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <label className="font-mono text-xs font-bold text-[#111827]">
                      01 // RECIPIENT COMMITMENT TAG
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowTagDeriver(!showTagDeriver)}
                      className="inline-flex items-center gap-1 text-[11px] font-mono text-[#2563eb] hover:underline"
                    >
                      {showTagDeriver ? "Hide Derivation Playground" : (
                        <><Lightning size={11} weight="bold" /> Derivation Playground</>
                      )}
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={recipientTag}
                    onChange={(e) => setRecipientTag(e.target.value)}
                    placeholder="0x... (the earner gives you this — it doesn't reveal their identity)"
                    className="mt-1.5 w-full rounded-lg border border-[#e4e4e7] bg-white px-3 py-2 text-xs font-mono text-[#111827] placeholder:text-[#a1a1aa] focus:border-[#2563eb] focus:outline-none"
                  />
                </div>

                {showTagDeriver && (
                  <div className="rounded-xl border border-[#bfdbfe] bg-[#eff6ff] p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-[#1e40af]">
                        Poseidon Channel Derivation
                      </span>
                      <span className="font-mono text-[10px] text-[#2563eb] bg-white px-2 py-0.5 rounded border border-[#bfdbfe]">
                        h(VELUM_RECIPIENT_TAG, channel_key)
                      </span>
                    </div>
                    <p className="text-[11px] text-[#475569]">
                      Real math, but not a real payer step — in production the earner computes this
                      privately and only ever hands you the resulting tag. This is here so one person
                      can demo both sides.
                    </p>
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
                        <input type="text" readOnly value={derivedTag} className="w-full rounded border border-[#cbd5e1] bg-white px-2 py-1 text-[11px] font-mono text-[#1e293b]" />
                        <button type="button" onClick={() => setRecipientTag(derivedTag)} className="shrink-0 rounded bg-[#2563eb] px-2.5 py-1 text-[11px] font-bold text-white hover:bg-[#1d4ed8]">
                          Use Tag
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="font-mono text-xs font-bold text-[#111827]">02 // AMOUNT (STRK)</label>
                  <input
                    type="text"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-[#e4e4e7] bg-white px-3 py-2 text-xs font-semibold text-[#111827] focus:outline-none"
                  />
                  <p className="mt-1 text-[10px] text-[#71717a]">
                    Token is fixed to STRK (<code className="font-mono">{STRK_ADDRESS.slice(0, 10)}...</code>) — the
                    only token this deployment has been exercised against.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !wallet.account}
                  className="w-full rounded-xl bg-[#111827] py-3 text-xs font-bold text-white transition-all hover:bg-[#1f2937] disabled:opacity-50"
                >
                  {isSubmitting ? "Signing & submitting on Starknet..." : !wallet.account ? "Connect a wallet first" : "Sign & Submit Attestation"}
                </button>
              </form>

              {singleResult && (
                <div className="mt-4 rounded-lg bg-[#eff6ff] border border-[#bfdbfe] p-3 text-xs font-mono text-[#1d4ed8] space-y-1">
                  <div>✓ Submitted.</div>
                  <a href={explorerTxUrl(singleResult.txHash)} target="_blank" rel="noreferrer" className="underline break-all block">
                    {singleResult.txHash}
                  </a>
                </div>
              )}
              {singleError && (
                <div className="mt-4 flex items-center gap-1.5 rounded-lg bg-[#fef2f2] border border-[#fecaca] p-3 text-xs font-mono text-[#b91c1c]">
                  <WarningCircle size={14} weight="bold" className="shrink-0" /> {singleError}
                </div>
              )}
            </div>

            <div className="space-y-6 lg:col-span-5">
              <div className="rounded-2xl border border-[#e4e4e7] bg-white p-6 shadow-sm">
                <h3 className="font-display text-sm font-bold text-[#111827]">Declared Protocol Guarantee (FR-014)</h3>
                <ul className="mt-4 space-y-3 text-xs text-[#6b7280]">
                  <li className="flex items-start gap-2"><span className="text-[#2563eb] font-bold">✓</span><span><strong>Unlinkability:</strong> The recipient commitment tag does not disclose the recipient&apos;s mainnet address or wallet balance.</span></li>
                  <li className="flex items-start gap-2"><span className="text-[#2563eb] font-bold">✓</span><span><strong>No Custody:</strong> Velum does not hold token balances. Attestations are non-repudiable assertions, nothing more.</span></li>
                </ul>
              </div>
              <div className="rounded-2xl border border-[#e4e4e7] bg-[#fcfcfc] p-6 text-xs text-[#71717a] font-mono">
                <span className="font-bold text-[#111827] block mb-1">Contract Entrypoint:</span>
                <code>fn attest(ref self: T, recipient_tag: felt252, token: ContractAddress, amount: u128)</code>
              </div>
            </div>
          </div>
        )}

        {activeTab === "batch" && (
          <div className="rounded-2xl border border-[#e4e4e7] bg-white p-6 sm:p-8 shadow-sm">
            <h2 className="font-display text-xl font-bold text-[#111827]">Batch Payroll Attestation (1 Transaction)</h2>
            <p className="mt-1 text-xs sm:text-sm text-[#6b7280]">
              Every row becomes one <code className="font-mono text-[#2563eb]">attest()</code> call inside a single
              Starknet multicall — real native multicall, one signature, one transaction, not a
              contract-level batch function (Velum&apos;s contract doesn&apos;t have one).
            </p>

            <div className="mt-6">
              <label className="font-mono text-xs font-bold text-[#111827]">PASTE recipient_tag, amount PAIRS</label>
              <textarea
                rows={6}
                value={csvContent}
                onChange={(e) => setCsvContent(e.target.value)}
                className="mt-2 w-full rounded-xl border border-[#e4e4e7] bg-[#fafafa] p-4 font-mono text-xs text-[#111827] focus:border-[#2563eb] focus:outline-none"
              />
            </div>

            {batchError && (
              <div className="flex items-center gap-1.5 mt-3 rounded-lg bg-[#fef2f2] border border-[#fecaca] p-3 font-mono text-xs text-[#b91c1c]">
                <WarningCircle size={14} weight="bold" className="shrink-0" /> {batchError}
              </div>
            )}

            <div className="mt-6 border border-[#e4e4e7] rounded-xl overflow-hidden">
              <div className="bg-[#fafafa] px-4 py-2.5 border-b border-[#e4e4e7] flex items-center justify-between font-mono text-xs font-bold text-[#71717a]">
                <span>PARSED ENTRIES ({parsedBatch.length})</span>
                <span>TOTAL: {parsedBatch.reduce((sum, i) => sum + Number(i.amount), 0).toLocaleString()} STRK</span>
              </div>
              <div className="divide-y divide-[#f4f4f5] max-h-56 overflow-y-auto">
                {parsedBatch.map((entry, idx) => (
                  <div key={idx} className="px-4 py-3 flex items-center justify-between text-xs font-mono">
                    <span className="text-[#111827] truncate max-w-xs">{entry.recipientTag}</span>
                    <span className="font-bold text-[#2563eb]">{entry.amount} STRK</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <span className="font-mono text-xs text-[#71717a]">
                One <code className="text-[#2563eb]">account.execute([...])</code> multicall.
              </span>
              <button
                type="button"
                disabled={batchSubmitting || parsedBatch.length === 0 || !wallet.account}
                onClick={handleBatchSubmit}
                className="rounded-xl bg-[#111827] px-6 py-3 text-xs font-bold text-white hover:bg-[#1f2937] transition-all disabled:opacity-50"
              >
                {batchSubmitting ? "Submitting multicall..." : !wallet.account ? "Connect a wallet first" : `Execute Batch (${parsedBatch.length} calls)`}
              </button>
            </div>

            {batchResult && (
              <div className="mt-4 rounded-lg bg-[#eff6ff] border border-[#bfdbfe] p-3 text-xs font-mono text-[#1d4ed8] space-y-1">
                <div>✓ Submitted {parsedBatch.length} attestations in one transaction.</div>
                <a href={explorerTxUrl(batchResult.txHash)} target="_blank" rel="noreferrer" className="underline break-all block">
                  {batchResult.txHash}
                </a>
              </div>
            )}
          </div>
        )}

        {activeTab === "book" && (
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="rounded-2xl border border-[#e4e4e7] bg-white p-6 sm:p-8 shadow-sm lg:col-span-6">
              <h2 className="mt-1 font-display text-xl font-bold text-[#111827]">Local Address Book</h2>
              <p className="mt-1 text-xs text-[#6b7280]">
                A name saved here only exists in your browser — Velum&apos;s deployed contract has an
                <code className="mx-1 font-mono text-[#2563eb]">enrolment_of()</code> view function, but
                nothing currently writes to it, so there is no on-chain enrolment to point to yet.
                This just saves you from re-typing addresses.
              </p>

              <form onSubmit={handleAddNickname} className="mt-6 space-y-4">
                <div>
                  <label className="font-mono text-xs font-bold text-[#111827]">NAME</label>
                  <input type="text" required value={nickName} onChange={(e) => setNickName(e.target.value)} placeholder="e.g. Acme DAO" className="mt-1.5 w-full rounded-lg border border-[#e4e4e7] bg-white px-3 py-2 text-xs font-medium text-[#111827] focus:border-[#2563eb] focus:outline-none" />
                </div>
                <div>
                  <label className="font-mono text-xs font-bold text-[#111827]">STARKNET ADDRESS</label>
                  <input type="text" required value={nickAddress} onChange={(e) => setNickAddress(e.target.value)} placeholder="0x..." className="mt-1.5 w-full rounded-lg border border-[#e4e4e7] bg-white px-3 py-2 text-xs font-mono text-[#111827] focus:border-[#2563eb] focus:outline-none" />
                </div>
                <button type="submit" className="w-full rounded-xl bg-[#111827] py-3 text-xs font-bold text-white hover:bg-[#1f2937] transition-all">
                  Save Nickname (Local Only)
                </button>
              </form>
              {nickError && (
                <div className="flex items-center gap-1.5 mt-4 rounded-lg bg-[#fef2f2] border border-[#fecaca] p-3 text-xs font-mono text-[#b91c1c]">
                  <WarningCircle size={14} weight="bold" className="shrink-0" /> {nickError}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-[#e4e4e7] bg-white p-6 sm:p-8 shadow-sm lg:col-span-6">
              <h3 className="font-display text-base font-bold text-[#111827]">Saved Names ({nicknames.length})</h3>
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
              <div className="flex items-start gap-1.5 mt-6 rounded-xl bg-[#fafafa] border border-[#e4e4e7] p-3 font-mono text-[11px] text-[#71717a]">
                <LockKey size={14} weight="bold" className="shrink-0 mt-0.5" />
                This list is stored in your browser only — it isn&apos;t visible to anyone else and
                doesn&apos;t affect what a verifier sees.
              </div>
            </div>
          </div>
        )}

        {activeTab === "ledger" && (
          <div className="rounded-2xl border border-[#e4e4e7] bg-white p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#f4f4f5] pb-4 mb-4">
              <div>
                <h2 className="font-display text-lg font-bold text-[#111827]">Your On-Chain Attestations</h2>
                <p className="text-xs text-[#6b7280]">
                  Read live via <code className="font-mono text-[#2563eb]">Attested</code> events, filtered to your
                  connected address — not a local cache.
                </p>
              </div>
              {wallet.address && (
                <button type="button" onClick={loadLedger} className="rounded-lg border border-[#e4e4e7] bg-white px-3 py-1.5 font-mono text-xs font-semibold text-[#111827] hover:bg-[#f4f4f5]">
                  Refresh
                </button>
              )}
            </div>

            {!wallet.address && (
              <div className="text-xs text-[#71717a] font-mono">Connect a wallet to see your published attestations.</div>
            )}
            {wallet.address && ledgerLoading && (
              <div className="text-xs text-[#71717a] font-mono">Reading events from Starknet...</div>
            )}
            {ledgerError && (
              <div className="flex items-center gap-1.5 rounded-lg bg-[#fef2f2] border border-[#fecaca] p-3 font-mono text-xs text-[#b91c1c]">
                <WarningCircle size={14} weight="bold" className="shrink-0" /> {ledgerError}
              </div>
            )}
            {wallet.address && !ledgerLoading && !ledgerError && ledger.length === 0 && (
              <div className="text-xs text-[#71717a] font-mono">No attestations found for this address yet.</div>
            )}

            <div className="divide-y divide-[#f4f4f5] max-h-96 overflow-y-auto">
              {ledger.map((entry, idx) => (
                <div key={idx} className="py-3.5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-bold text-[#111827]">{fromWeiStrk(entry.amount)} STRK</span>
                    <span className="rounded bg-[#eff6ff] border border-[#bfdbfe] px-2 py-0.5 font-mono text-[10px] font-semibold text-[#1d4ed8]">
                      {new Date(entry.attestedAt * 1000).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] text-[#71717a]">
                    <span className="truncate max-w-sm">Recipient Tag: {entry.recipientTag}</span>
                    {entry.txHash && (
                      <a href={explorerTxUrl(entry.txHash)} target="_blank" rel="noreferrer" className="text-[#2563eb] hover:underline">
                        {entry.txHash.slice(0, 14)}...
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <AppFooter />
    </div>
  );
}
