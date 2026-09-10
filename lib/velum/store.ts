/**
 * Local-only bookkeeping for Velum's frontend.
 *
 * Everything that used to be simulated here — payment attestations, a fake tx hash on every
 * action, "REDEEMED" status flipped by a local function — is gone. Attestations and claim status
 * are read live from the real deployed contract (see lib/velum/contract.ts) instead.
 *
 * What's left is what genuinely has no on-chain source of truth to read back from:
 *  - A payer nickname book. Purely a local convenience — Velum's contract has an `enrolment_of`
 *    view function but nothing ever writes to it, so there is no real on-chain enrolment yet.
 *  - An earner's own list of claims they've computed. The contract has no "list claims by earner"
 *    query (nor could it, without deanonymizing them) — an earner has to remember her own claim
 *    parameters (including the nonce, which isn't stored in the on-chain Receipt) to find a claim
 *    again. This is exactly what a wallet's local activity log is for; it's not a substitute for
 *    the chain, it's a client-side index into what a specific address already did.
 */

export interface PayerNickname {
  address: string;
  name: string;
  addedAt: string; // ISO date string, local-only
}

export interface LocalClaim {
  claimId: string;
  earnerHandle: string;
  payerAddress: string;
  payerName: string;
  token: string;
  thresholdAmount: bigint; // raw u128 (wei)
  thresholdFormatted: string; // decimal STRK, for display only
  fromPeriod: string;
  toPeriod: string;
  fromTimestamp: number;
  toTimestamp: number;
  verifierName: string;
  challengePreimage: string;
  challengeHash: string;
  createdAt: number;
  expiresAt: number;
  hiddenLocally: boolean;
  anonymitySetSize: number;
  paramsHash: string;
}

const STORAGE_KEYS = {
  NICKNAMES: "velum_payer_nicknames",
  CLAIMS: "velum_local_claims",
};

function getFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw, (k, v) => {
      if (typeof v === "string" && /^\d+n$/.test(v)) return BigInt(v.slice(0, -1));
      return v;
    });
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  try {
    const serialized = JSON.stringify(data, (k, v) => (typeof v === "bigint" ? `${v}n` : v));
    localStorage.setItem(key, serialized);
  } catch {
    // ignore
  }
}

// -------------------------------------------------------------
// Payer nickname book (local convenience, not on-chain)
// -------------------------------------------------------------

export function getNicknames(): PayerNickname[] {
  return getFromStorage(STORAGE_KEYS.NICKNAMES, []);
}

export function addNickname(name: string, address: string): { success: boolean; error?: string } {
  const trimmed = name.trim();
  if (!trimmed) return { success: false, error: "Name cannot be empty." };
  if (!/^0x[0-9a-fA-F]+$/.test(address.trim())) {
    return { success: false, error: "Address must be a 0x-prefixed hex Starknet address." };
  }
  const current = getNicknames();
  const updated = [
    { name: trimmed, address: address.trim(), addedAt: new Date().toISOString() },
    ...current.filter((n) => n.address.toLowerCase() !== address.trim().toLowerCase()),
  ];
  saveToStorage(STORAGE_KEYS.NICKNAMES, updated);
  return { success: true };
}

export function nicknameFor(address: string): string | undefined {
  return getNicknames().find((n) => n.address.toLowerCase() === address.toLowerCase())?.name;
}

// -------------------------------------------------------------
// Earner's local claim index
// -------------------------------------------------------------

export function getLocalClaims(): LocalClaim[] {
  return getFromStorage(STORAGE_KEYS.CLAIMS, []);
}

export function saveLocalClaim(claim: LocalClaim): void {
  const current = getLocalClaims();
  saveToStorage(STORAGE_KEYS.CLAIMS, [claim, ...current.filter((c) => c.claimId !== claim.claimId)]);
}

export function hideLocalClaim(claimId: string): void {
  const claims = getLocalClaims();
  const index = claims.findIndex((c) => c.claimId === claimId);
  if (index === -1) return;
  claims[index].hiddenLocally = true;
  saveToStorage(STORAGE_KEYS.CLAIMS, claims);
}
