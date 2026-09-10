"use client";

import Link from "next/link";
import { useState, useEffect, useMemo, useCallback } from "react";
import { hash as starkHash } from "starknet";
import {
  getLocalClaims,
  saveLocalClaim,
  hideLocalClaim,
  getNicknames,
  nicknameFor,
  LocalClaim,
} from "@/lib/velum/store";
import {
  computeEarnerHandle,
  computeChallengeHash,
  computeClaimId,
  computeParamsHash,
  textToFelt,
} from "@/lib/velum/hashes";
import { deriveChannelKey, deriveRecipientTag, formatTag } from "@/lib/velum/channel";
import { velumContract, readProvider, velumAddress, STRK_ADDRESS, toWeiStrk, fromWeiStrk } from "@/lib/velum/contract";
import { WarningCircle, Prohibit, CheckCircle, Info } from "@phosphor-icons/react";
import { AppHeader } from "@/app/components/AppHeader";
import { AppFooter } from "@/app/components/AppFooter";

const WINDOWS = [
  { key: "24h", label: "Last 24 hours", seconds: 86400 },
  { key: "7d", label: "Last 7 days", seconds: 7 * 86400 },
  { key: "30d", label: "Last 30 days", seconds: 30 * 86400 },
  { key: "90d", label: "Last 90 days", seconds: 90 * 86400 },
  { key: "all", label: "All time", seconds: 0 },
] as const;

export default function EarnerPortalPage() {
  const [activeTab, setActiveTab] = useState<"builder" | "claims">("builder");

  // Held in memory only — never written to localStorage or sent anywhere. Real derivation, not a
  // placeholder: it's what every felt below is actually computed from.
  const [passphrase, setPassphrase] = useState("");
  const [payerAddress, setPayerAddress] = useState("");
  const [windowKey, setWindowKey] = useState<(typeof WINDOWS)[number]["key"]>("30d");
  const [threshold, setThreshold] = useState("1");
  const [verifierName, setVerifierName] = useState("");
  const [challengeCode, setChallengeCode] = useState("");
  const [expiryDays, setExpiryDays] = useState(18);

  const [nicknames, setNicknames] = useState(getNicknames());
  const [claimsList, setClaimsList] = useState<LocalClaim[]>([]);

  const [checking, setChecking] = useState(false);
  const [checkError, setCheckError] = useState<string | null>(null);
  const [accumulated, setAccumulated] = useState<bigint | null>(null);
  const [anonymitySet, setAnonymitySet] = useState<number | null>(null);

  const [refusalError, setRefusalError] = useState<string | null>(null);
  const [prepared, setPrepared] = useState<LocalClaim | null>(null);

  useEffect(() => {
    setNicknames(getNicknames());
    setClaimsList(getLocalClaims());
  }, []);

  const identityKey = useMemo(() => {
    if (!passphrase) return null;
    try {
      const bytesHex = Buffer.from(passphrase).toString("hex").slice(0, 62);
      return BigInt("0x" + bytesHex);
    } catch {
      return null;
    }
  }, [passphrase]);

  const earnerHandle = useMemo(
    () => (identityKey !== null ? computeEarnerHandle(identityKey) : null),
    [identityKey]
  );

  const channelKey = useMemo(() => {
    if (identityKey === null || !payerAddress.trim()) return null;
    try {
      return deriveChannelKey(identityKey, BigInt(payerAddress.trim()));
    } catch {
      return null;
    }
  }, [identityKey, payerAddress]);

  const recipientTag = useMemo(
    () => (channelKey !== null ? formatTag(deriveRecipientTag(channelKey)) : null),
    [channelKey]
  );

  const activeWindow = WINDOWS.find((w) => w.key === windowKey) ?? WINDOWS[2];
  const nowSec = Math.floor(Date.now() / 1000);
  const fromTs = activeWindow.seconds === 0 ? 0 : nowSec - activeWindow.seconds;
  const toTs = nowSec;

  const checkOnChain = useCallback(async () => {
    if (!payerAddress.trim() || !recipientTag) {
      setCheckError("Enter a payer address and a passphrase first.");
      return;
    }
    setChecking(true);
    setCheckError(null);
    setAccumulated(null);
    setAnonymitySet(null);
    try {
      const selector = starkHash.getSelectorFromName("Attested");
      const provider = readProvider();
      const result = await provider.getEvents({
        address: velumAddress(),
        from_block: { block_number: 0 },
        to_block: "latest",
        keys: [[selector], [payerAddress.trim()], [recipientTag]],
        chunk_size: 100,
      });
      const total = result.events.reduce((sum, ev) => {
        const attestedAt = Number(ev.data[2]);
        if (attestedAt < fromTs || attestedAt >= toTs + 1) return sum;
        return sum + BigInt(ev.data[1]);
      }, 0n);
      setAccumulated(total);

      const contract = await velumContract();
      const setSize = await contract.anonymity_set(payerAddress.trim(), fromTs, toTs);
      setAnonymitySet(Number(setSize));
    } catch (err) {
      setCheckError(err instanceof Error ? err.message : "Failed to read chain state.");
    } finally {
      setChecking(false);
    }
  }, [payerAddress, recipientTag, fromTs, toTs]);

  const handleGenerateClaim = (e: React.FormEvent) => {
    e.preventDefault();
    setRefusalError(null);
    setPrepared(null);

    if (identityKey === null || channelKey === null || recipientTag === null) {
      setRefusalError("Enter a passphrase and a payer address first.");
      return;
    }
    if (accumulated === null) {
      setRefusalError("Check on-chain attestations before generating a claim.");
      return;
    }

    let thresholdWei: bigint;
    try {
      thresholdWei = toWeiStrk(threshold);
    } catch (err) {
      setRefusalError(err instanceof Error ? err.message : "Invalid threshold amount.");
      return;
    }

    if (thresholdWei > accumulated) {
      setRefusalError(
        `BELOW_THRESHOLD: Qualifying attestations in this window total ${fromWeiStrk(accumulated)} STRK, which falls short of the requested ${fromWeiStrk(thresholdWei)} STRK threshold. This is the same check privacy_compute runs on chain — a real attempt would panic here and leave nothing on chain.`
      );
      return;
    }

    let challengeHash: bigint;
    try {
      challengeHash = computeChallengeHash(textToFelt(challengeCode || "default_challenge"));
    } catch (err) {
      setRefusalError(err instanceof Error ? err.message : "Invalid challenge code.");
      return;
    }

    const nonceBytes = new Uint8Array(8);
    crypto.getRandomValues(nonceBytes);
    const nonce = nonceBytes.reduce((acc, b) => (acc << 8n) | BigInt(b), 0n);

    const claimIdFelt = computeClaimId(identityKey, challengeHash, nonce);
    const paramsHashFelt = computeParamsHash({
      payer: payerAddress.trim(),
      token: STRK_ADDRESS,
      fromTs,
      toTs,
      threshold: thresholdWei,
      challengeHash,
      expiresAt: Math.floor(Date.now() / 1000) + expiryDays * 86400,
    });

    const claim: LocalClaim = {
      claimId: "0x" + claimIdFelt.toString(16),
      earnerHandle: "0x" + (earnerHandle ?? 0n).toString(16),
      payerAddress: payerAddress.trim(),
      payerName: nicknameFor(payerAddress.trim()) || "Unnamed payer",
      token: STRK_ADDRESS,
      thresholdAmount: thresholdWei,
      thresholdFormatted: `${fromWeiStrk(thresholdWei)} STRK`,
      fromPeriod: new Date(fromTs * 1000).toLocaleDateString(),
      toPeriod: new Date(toTs * 1000).toLocaleDateString(),
      fromTimestamp: fromTs,
      toTimestamp: toTs,
      verifierName: verifierName.trim() || "Independent Verifier",
      challengePreimage: challengeCode.trim() || "default_challenge",
      challengeHash: "0x" + challengeHash.toString(16),
      createdAt: Date.now(),
      expiresAt: Date.now() + expiryDays * 86400000,
      hiddenLocally: false,
      anonymitySetSize: anonymitySet ?? 0,
      paramsHash: "0x" + paramsHashFelt.toString(16),
    };

    saveLocalClaim(claim);
    setClaimsList(getLocalClaims());
    setPrepared(claim);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col justify-between selection:bg-[#3b82f6]/20 selection:text-[#1e40af]">
      <AppHeader
        badge="EARNER PORTAL"
        rightSlot={
          <div className="flex items-center gap-4">
            <Link href="/payer" className="text-xs font-semibold text-[#2563eb] hover:underline">Switch to Payer Portal →</Link>
            <Link href="/" className="text-xs font-semibold text-[#71717a] hover:text-[#111827]">← Overview</Link>
          </div>
        }
      />

      <main className="mx-auto w-full max-w-5xl px-6 py-10">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="font-mono text-xs font-semibold uppercase tracking-widest text-[#2563eb]">
              [ Real On-Chain Threshold Check — Broadcast Still Requires the CLI ]
            </span>
            <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#111827]">Income Proof Builder</h1>
            <p className="mt-1 text-xs sm:text-sm text-[#6b7280]">
              Every value below is computed with the real Poseidon derivations used on chain, and
              your accumulated total is read live from Starknet — not a local seed. See the notice
              below for what still can&apos;t run from a browser.
            </p>
          </div>
          {earnerHandle !== null && (
            <div className="rounded-xl border border-[#e4e4e7] bg-white p-3 shadow-2xs font-mono text-xs">
              <span className="text-[#71717a] block text-[10px]">Unlinkable Earner Handle:</span>
              <span className="font-bold text-[#111827]">0x{earnerHandle.toString(16).slice(0, 10)}...{earnerHandle.toString(16).slice(-6)}</span>
            </div>
          )}
        </div>

        <div className="mb-6 flex items-start gap-2 rounded-xl border border-[#bfdbfe] bg-[#eff6ff] p-4 text-xs text-[#1e40af]">
          <Info size={16} weight="bold" className="shrink-0 mt-0.5" />
          <div>
            <strong>Why there's no &quot;Submit Claim&quot; button:</strong> broadcasting a claim goes
            through the STRK20 privacy pool's <code className="font-mono">ComputeAndInvoke</code> —
            a proving pipeline that needs a raw account key (a browser wallet extension deliberately
            doesn&apos;t expose one to a dApp) and currently reverts on mainnet with
            <code className="font-mono mx-1">argent/multicall-failed</code> regardless, a bug
            upstream of Velum's own contract. This page computes and checks every real value up to
            that point; the actual broadcast is a CLI operation (<code className="font-mono">scripts/claim.ts</code>).
          </div>
        </div>

        <div className="flex items-center gap-2 border-b border-[#e4e4e7] pb-3 mb-8">
          <button type="button" onClick={() => setActiveTab("builder")} className={`rounded-lg px-4 py-2 font-mono text-xs font-semibold transition-all ${activeTab === "builder" ? "bg-[#111827] text-white shadow-xs" : "bg-white text-[#71717a] border border-[#e4e4e7] hover:text-[#111827]"}`}>
            01 // Check &amp; Prepare Claim
          </button>
          <button type="button" onClick={() => setActiveTab("claims")} className={`rounded-lg px-4 py-2 font-mono text-xs font-semibold transition-all ${activeTab === "claims" ? "bg-[#111827] text-white shadow-xs" : "bg-white text-[#71717a] border border-[#e4e4e7] hover:text-[#111827]"}`}>
            02 // Prepared Claims ({claimsList.filter((c) => !c.hiddenLocally).length})
          </button>
        </div>

        {activeTab === "builder" && (
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="rounded-2xl border border-[#e4e4e7] bg-white p-6 sm:p-8 shadow-sm lg:col-span-7">
              <form onSubmit={handleGenerateClaim} className="space-y-6">
                <div className="rounded-xl border border-[#e4e4e7] bg-[#fafafa] p-4">
                  <div className="flex items-center justify-between">
                    <label className="font-mono text-xs font-bold text-[#111827]">01 // VIEWING KEY / PASSPHRASE</label>
                    <span className="font-mono text-[10px] text-[#2563eb]">● In-Memory Only</span>
                  </div>
                  <p className="mt-1 text-[11px] text-[#71717a]">
                    Never leaves your browser, never saved to disk. Everything below is deterministically derived from it.
                  </p>
                  <input
                    type="password"
                    required
                    value={passphrase}
                    onChange={(e) => setPassphrase(e.target.value)}
                    placeholder="Enter your confidential viewing passphrase"
                    className="mt-3 w-full rounded-lg border border-[#e4e4e7] bg-white px-3.5 py-2.5 text-xs font-mono text-[#111827] focus:border-[#3b82f6] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-mono text-xs font-bold text-[#111827]">02 // PAYER ADDRESS</label>
                  <input
                    type="text"
                    required
                    list="payer-nicknames"
                    value={payerAddress}
                    onChange={(e) => setPayerAddress(e.target.value)}
                    placeholder="0x... (the payer's Starknet address)"
                    className="mt-2 w-full rounded-lg border border-[#e4e4e7] bg-white px-3.5 py-2.5 text-xs font-mono text-[#111827] focus:border-[#3b82f6] focus:outline-none"
                  />
                  <datalist id="payer-nicknames">
                    {nicknames.map((n) => (
                      <option key={n.address} value={n.address}>{n.name}</option>
                    ))}
                  </datalist>
                  {recipientTag && (
                    <p className="mt-1.5 text-[10px] font-mono text-[#71717a] break-all">
                      Your recipient tag for this payer: {recipientTag} — give this to the payer, never your passphrase.
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-mono text-xs font-bold text-[#111827]">03 // WINDOW</label>
                    <select value={windowKey} onChange={(e) => setWindowKey(e.target.value as typeof windowKey)} className="mt-2 w-full rounded-lg border border-[#e4e4e7] bg-white px-3.5 py-2.5 text-xs font-medium text-[#111827] focus:border-[#3b82f6] focus:outline-none">
                      {WINDOWS.map((w) => <option key={w.key} value={w.key}>{w.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="font-mono text-xs font-bold text-[#111827]">04 // THRESHOLD (STRK)</label>
                    <input type="text" required value={threshold} onChange={(e) => setThreshold(e.target.value)} className="mt-2 w-full rounded-lg border border-[#e4e4e7] bg-white px-3.5 py-2.5 text-xs font-semibold text-[#111827] focus:outline-none" />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={checkOnChain}
                  disabled={checking || !payerAddress.trim() || !recipientTag}
                  className="w-full rounded-xl border border-[#3b82f6] bg-white py-3 text-xs font-bold text-[#2563eb] hover:bg-[#eff6ff] disabled:opacity-50"
                >
                  {checking ? "Reading Starknet mainnet..." : "Check Real Attestations On Chain"}
                </button>

                {checkError && (
                  <div className="rounded-lg bg-[#fef2f2] border border-[#fecaca] p-3 text-xs font-mono text-[#991b1b]">{checkError}</div>
                )}

                {accumulated !== null && (
                  <div
                    className={`rounded-xl border p-4 text-xs ${
                      (anonymitySet ?? 0) <= 1
                        ? "border-[#fecaca] bg-[#fef2f2] text-[#991b1b]"
                        : (anonymitySet ?? 0) < 5
                        ? "border-[#fde68a] bg-[#fffbeb] text-[#92400e]"
                        : "border-[#bfdbfe] bg-[#eff6ff] text-[#1e40af]"
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span>Accumulated in window: {fromWeiStrk(accumulated)} STRK</span>
                      <span className="font-mono text-[10px]">anonymity_set() = {anonymitySet}</span>
                    </div>
                    {(anonymitySet ?? 0) <= 1 && (
                      <p className="mt-1 text-[11px] leading-relaxed">
                        This payer published attestations to only 1 distinct recipient in this
                        window (a real read of <code className="font-mono">anonymity_set()</code>).
                        Proving this claim narrows your crowd to 1 person.
                      </p>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="font-mono text-xs font-bold text-[#111827]">05 // VERIFIER NAME</label>
                    <input type="text" required value={verifierName} onChange={(e) => setVerifierName(e.target.value)} placeholder="e.g. Meridian Properties Ltd" className="mt-2 w-full rounded-lg border border-[#e4e4e7] bg-white px-3.5 py-2.5 text-xs font-medium text-[#111827] focus:border-[#3b82f6] focus:outline-none" />
                  </div>
                  <div>
                    <label className="font-mono text-xs font-bold text-[#111827]">06 // EXPIRY</label>
                    <select value={expiryDays} onChange={(e) => setExpiryDays(Number(e.target.value))} className="mt-2 w-full rounded-lg border border-[#e4e4e7] bg-white px-3.5 py-2.5 text-xs font-medium text-[#111827] focus:border-[#3b82f6] focus:outline-none">
                      <option value={7}>7 Days</option>
                      <option value={18}>18 Days</option>
                      <option value={30}>30 Days</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-mono text-xs font-bold text-[#111827]">07 // VERIFIER CHALLENGE CODE</label>
                  <input type="text" required value={challengeCode} onChange={(e) => setChallengeCode(e.target.value)} placeholder="A secret phrase you'll share with the verifier out of band" className="mt-2 w-full rounded-lg border border-[#e4e4e7] bg-white px-3.5 py-2.5 text-xs font-mono text-[#111827] focus:border-[#3b82f6] focus:outline-none" />
                  <p className="mt-1 text-[10px] text-[#71717a]">Max 31 characters (a Cairo short string).</p>
                </div>

                <button type="submit" className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#3b82f6] py-3.5 text-xs font-bold text-white transition-all hover:bg-[#2563eb] active:scale-[0.99] shadow-md shadow-[#3b82f6]/20">
                  Compute Claim Parameters
                </button>
              </form>

              {refusalError && (
                <div className="mt-6 rounded-xl border border-[#fecaca] bg-[#fef2f2] p-4 text-xs font-mono text-[#991b1b]">
                  <span className="inline-flex items-center gap-1.5 font-bold mb-1"><Prohibit size={14} weight="bold" /> REFUSED LOCALLY:</span>
                  {refusalError}
                </div>
              )}

              {prepared && (
                <div className="mt-8 rounded-2xl border-2 border-[#3b82f6] bg-[#eff6ff] p-6">
                  <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-[#1e40af]">
                    <CheckCircle size={14} weight="bold" /> CLAIM PARAMETERS COMPUTED — NOT YET ON CHAIN
                  </span>
                  <p className="mt-2 text-xs text-[#1e40af] leading-relaxed">
                    These are the real values a broadcast would use. Nothing has been submitted to
                    Starknet — there is no claim to share with {prepared.verifierName} yet.
                  </p>
                  <div className="mt-4 space-y-1.5 font-mono text-[11px] text-[#1d4ed8]">
                    <div className="truncate">claim_id: {prepared.claimId}</div>
                    <div className="truncate">params_hash: {prepared.paramsHash}</div>
                    <div>threshold: {prepared.thresholdFormatted}</div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6 lg:col-span-5">
              <div className="rounded-2xl border border-[#e4e4e7] bg-white p-6 shadow-sm">
                <h3 className="font-display text-sm font-bold text-[#111827]">What Lands On-Chain, If Broadcast</h3>
                <ul className="mt-3 space-y-2.5 text-xs text-[#6b7280]">
                  <li className="flex items-start gap-2"><span className="text-[#2563eb] font-bold">✓</span><span><strong>Receipt:</strong> Claim ID + Verifier Challenge Hash</span></li>
                  <li className="flex items-start gap-2"><span className="text-[#2563eb] font-bold">✓</span><span><strong>Predicate:</strong> Qualifying income floor was exceeded</span></li>
                  <li className="flex items-start gap-2"><span className="text-[#991b1b] font-bold">✕</span><span><strong>Never on-chain:</strong> Note amounts, wallet balances, or your account address</span></li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === "claims" && (
          <div className="rounded-2xl border border-[#e4e4e7] bg-white p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#f4f4f5] pb-4 mb-6">
              <div>
                <h2 className="font-display text-xl font-bold text-[#111827]">Prepared Claims</h2>
                <p className="text-xs text-[#6b7280]">
                  Saved locally so you can find your own claim parameters again — Velum's contract
                  has no &quot;list claims by earner&quot; query by design.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              {claimsList.filter((c) => !c.hiddenLocally).map((claim) => (
                <div key={claim.claimId} className="rounded-xl border border-[#e4e4e7] bg-[#fafafa] p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <span className="font-display text-base font-bold text-[#111827]">{claim.thresholdFormatted} from {claim.payerName}</span>
                      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-[#71717a]">
                        <span>Bound Verifier: <strong className="text-[#111827]">{claim.verifierName}</strong></span>
                        <span>Window: {claim.fromPeriod} – {claim.toPeriod}</span>
                      </div>
                    </div>
                    <button type="button" onClick={() => { hideLocalClaim(claim.claimId); setClaimsList(getLocalClaims()); }} className="rounded-lg bg-white border border-[#e4e4e7] px-3 py-1.5 font-mono text-xs font-semibold text-[#71717a] hover:bg-[#f4f4f5]">
                      Hide From My List
                    </button>
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-[#fffbeb] border border-[#fde68a] px-3 py-2 font-mono text-[10px] text-[#92400e]">
                    <WarningCircle size={12} weight="bold" className="shrink-0" />
                    &quot;Hide&quot; only affects your own local list — Velum's contract has no
                    revocation function, so if this claim was ever actually broadcast, it stays
                    valid on chain until redeemed or expired regardless.
                  </div>
                </div>
              ))}
              {claimsList.filter((c) => !c.hiddenLocally).length === 0 && (
                <div className="text-xs text-[#71717a] font-mono">No prepared claims yet.</div>
              )}
            </div>
          </div>
        )}
      </main>

      <AppFooter />
    </div>
  );
}
