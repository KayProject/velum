/**
 * Velum Client Store & Local Registry
 *
 * Manages simulated/local on-chain state for Velum:
 * - Payer enrolments (FR-009, T040)
 * - Payer payment attestations (FR-014, T020, T041)
 * - Earner issued claims with revocation & access records (FR-010, T048)
 * - Single-use verifier challenge verification and redemption (FR-002, FR-003, T034)
 */

import {
  computeClaimId,
  computeEarnerHandle,
  computeParamsHash,
  computeRecipientTag,
  computeChallengeHash,
  Felt,
} from "./hashes";
import { deriveChannelKey, formatTag } from "./channel";

export interface PayerEnrolment {
  address: string;
  name: string;
  enrolledAt: string; // ISO date string
  txHash: string;
}

export interface PaymentAttestation {
  id: string;
  payerAddress: string;
  payerName?: string;
  recipientTag: string;
  amount: bigint;
  amountFormatted: string;
  token: string;
  windowPeriod: string; // e.g. "2026-Q1"
  fromTimestamp: number;
  toTimestamp: number;
  timestamp: number;
  txHash: string;
}

export interface IssuedClaim {
  claimId: string;
  shortId: string;
  earnerHandle: string;
  payerAddress: string;
  payerName: string;
  isPayerEnrolled: boolean;
  token: string;
  thresholdAmount: bigint;
  thresholdFormatted: string;
  fromPeriod: string;
  toPeriod: string;
  fromTimestamp: number;
  toTimestamp: number;
  verifierName: string;
  challengePreimage: string;
  challengeHash: string;
  createdAt: number;
  expiresAt: number;
  status: "ACTIVE" | "REDEEMED" | "REVOKED" | "EXPIRED";
  redeemedAt?: number;
  redeemedBy?: string;
  anonymitySetSize: number;
  paramsHash: string;
  txHash: string;
}

// Initial Seed Data
const INITIAL_ENROLMENTS: PayerEnrolment[] = [
  {
    address: "0x0403bc891a271df912a7812a39281a8b9281a",
    name: "Acme DAO",
    enrolledAt: "2026-01-12T10:00:00Z",
    txHash: "0x07f1a89c9012a812bf12a8901289cf012a",
  },
  {
    address: "0x0192cf318a9018274a1890cf3189a7123901a",
    name: "StarkWare Foundation",
    enrolledAt: "2026-01-20T14:30:00Z",
    txHash: "0x098dcf22189012a8819028910283910293810",
  },
];

const INITIAL_ATTESTATIONS: PaymentAttestation[] = [
  {
    id: "att_0x92af3312019a",
    payerAddress: "0x0403bc891a271df912a7812a39281a8b9281a",
    payerName: "Acme DAO",
    recipientTag: "0x05b291a2810f99a8127390182739182739182739182739182739182739182739",
    amount: BigInt(1500000),
    amountFormatted: "₦1,500,000",
    token: "NGN",
    windowPeriod: "2026-Q1",
    fromTimestamp: 1767225600, // Jan 1 2026
    toTimestamp: 1774915200,   // Mar 31 2026
    timestamp: 1768435200,     // Jan 15 2026
    txHash: "0x04a2b18991820381029381029381029381029381029381029381029381029381",
  },
  {
    id: "att_0x18ea902199b1",
    payerAddress: "0x0403bc891a271df912a7812a39281a8b9281a",
    payerName: "Acme DAO",
    recipientTag: "0x05b291a2810f99a8127390182739182739182739182739182739182739182739",
    amount: BigInt(1500000),
    amountFormatted: "₦1,500,000",
    token: "NGN",
    windowPeriod: "2026-Q1",
    fromTimestamp: 1767225600,
    toTimestamp: 1774915200,
    timestamp: 1771113600,     // Feb 15 2026
    txHash: "0x098dcf22a8901289cf012a819028910283910293810293810293810293810293",
  },
  {
    id: "att_0x77c21098ef01",
    payerAddress: "0x0403bc891a271df912a7812a39281a8b9281a",
    payerName: "Acme DAO",
    recipientTag: "0x05b291a2810f99a8127390182739182739182739182739182739182739182739",
    amount: BigInt(1500000),
    amountFormatted: "₦1,500,000",
    token: "NGN",
    windowPeriod: "2026-Q1",
    fromTimestamp: 1767225600,
    toTimestamp: 1774915200,
    timestamp: 1773532800,     // Mar 15 2026
    txHash: "0x07f199aa18273918273918273918273918273918273918273918273918273918",
  },
  // Additional attestations for anonymity set
  {
    id: "att_0x334455667788",
    payerAddress: "0x0403bc891a271df912a7812a39281a8b9281a",
    payerName: "Acme DAO",
    recipientTag: "0x07a112233445566778899aabbccddeeff00112233445566778899aabbccddeeff",
    amount: BigInt(2200000),
    amountFormatted: "₦2,200,000",
    token: "NGN",
    windowPeriod: "2026-Q1",
    fromTimestamp: 1767225600,
    toTimestamp: 1774915200,
    timestamp: 1768435200,
    txHash: "0x0112233445566778899aabbccddeeff00112233445566778899aabbccddeeff",
  },
  {
    id: "att_0x445566778899",
    payerAddress: "0x0403bc891a271df912a7812a39281a8b9281a",
    payerName: "Acme DAO",
    recipientTag: "0x08b2233445566778899aabbccddeeff00112233445566778899aabbccddeeff",
    amount: BigInt(1800000),
    amountFormatted: "₦1,800,000",
    token: "NGN",
    windowPeriod: "2026-Q1",
    fromTimestamp: 1767225600,
    toTimestamp: 1774915200,
    timestamp: 1771113600,
    txHash: "0x02233445566778899aabbccddeeff00112233445566778899aabbccddeeff00",
  },
];

const INITIAL_CLAIMS: IssuedClaim[] = [
  {
    claimId: "0x07f83bc4190e8a71289102938102938102938102938102938102938102938102",
    shortId: "vlm_0x7f83bc41",
    earnerHandle: "0x0392019a82019283019283019283019283019283019283019283019283019283",
    payerAddress: "0x0403bc891a271df912a7812a39281a8b9281a",
    payerName: "Acme DAO",
    isPayerEnrolled: true,
    token: "NGN",
    thresholdAmount: BigInt(4200000),
    thresholdFormatted: "₦4,200,000",
    fromPeriod: "1 Jan 2026",
    toPeriod: "31 Mar 2026",
    fromTimestamp: 1767225600,
    toTimestamp: 1774915200,
    verifierName: "Meridian Properties Ltd",
    challengePreimage: "meridian_lease_challenge_2026",
    challengeHash: "0x01a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2",
    createdAt: Date.now() - 86400000 * 2, // 2 days ago
    expiresAt: Date.now() + 86400000 * 18, // 18 days left
    status: "ACTIVE",
    anonymitySetSize: 5,
    paramsHash: "0x059a102938102938102938102938102938102938102938102938102938102938",
    txHash: "0x04a2910293810293810293810293810293810293810293810293810293810293",
  },
];

const STORAGE_KEYS = {
  ENROLMENTS: "velum_enrolments",
  ATTESTATIONS: "velum_attestations",
  CLAIMS: "velum_claims",
};

// Safe LocalStorage helpers
function getFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw, (k, v) => {
      if (typeof v === "string" && /^\d+n$/.test(v)) {
        return BigInt(v.slice(0, -1));
      }
      return v;
    });
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  try {
    const serialized = JSON.stringify(data, (k, v) =>
      typeof v === "bigint" ? `${v}n` : v
    );
    localStorage.setItem(key, serialized);
  } catch {
    // ignore
  }
}

// -------------------------------------------------------------
// Payer Enrolment API (T040, T043)
// -------------------------------------------------------------

export function getEnrolments(): PayerEnrolment[] {
  return getFromStorage(STORAGE_KEYS.ENROLMENTS, INITIAL_ENROLMENTS);
}

export function enrolPayer(name: string, address: string): { success: boolean; error?: string; enrolment?: PayerEnrolment } {
  const enrolments = getEnrolments();
  const trimmed = name.trim();
  if (!trimmed) return { success: false, error: "NAME_EMPTY: Payer name cannot be empty." };

  const existing = enrolments.find(
    (e) => e.name.toLowerCase() === trimmed.toLowerCase() && e.address.toLowerCase() !== address.toLowerCase()
  );
  if (existing) {
    return { success: false, error: "NAME_TAKEN: This organization name is already enrolled by another address." };
  }

  const txHash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
  const newEnrolment: PayerEnrolment = {
    name: trimmed,
    address,
    enrolledAt: new Date().toISOString(),
    txHash,
  };

  const updated = [newEnrolment, ...enrolments.filter((e) => e.address.toLowerCase() !== address.toLowerCase())];
  saveToStorage(STORAGE_KEYS.ENROLMENTS, updated);
  return { success: true, enrolment: newEnrolment };
}

export function getPayerEnrolment(addressOrName: string): PayerEnrolment | undefined {
  const enrolments = getEnrolments();
  const search = addressOrName.toLowerCase();
  return enrolments.find((e) => e.address.toLowerCase() === search || e.name.toLowerCase() === search);
}

// -------------------------------------------------------------
// Payment Attestation API (T020, T041)
// -------------------------------------------------------------

export function getAttestations(): PaymentAttestation[] {
  return getFromStorage(STORAGE_KEYS.ATTESTATIONS, INITIAL_ATTESTATIONS);
}

export function recordAttestation(params: {
  payerAddress: string;
  recipientTag: string;
  amount: bigint;
  token: string;
  windowPeriod: string;
  fromTimestamp?: number;
  toTimestamp?: number;
}): { success: boolean; attestation: PaymentAttestation } {
  const attestations = getAttestations();
  const enrolment = getPayerEnrolment(params.payerAddress);

  const formattedAmount =
    params.token === "NGN"
      ? `₦${Number(params.amount).toLocaleString()}`
      : `${params.amount.toString()} ${params.token}`;

  const txHash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
  const attId = "att_0x" + Math.random().toString(16).slice(2, 14);

  const nowSec = Math.floor(Date.now() / 1000);
  const newAtt: PaymentAttestation = {
    id: attId,
    payerAddress: params.payerAddress,
    payerName: enrolment?.name,
    recipientTag: params.recipientTag,
    amount: params.amount,
    amountFormatted: formattedAmount,
    token: params.token,
    windowPeriod: params.windowPeriod,
    fromTimestamp: params.fromTimestamp || nowSec - 86400 * 90,
    toTimestamp: params.toTimestamp || nowSec,
    timestamp: nowSec,
    txHash,
  };

  const updated = [newAtt, ...attestations];
  saveToStorage(STORAGE_KEYS.ATTESTATIONS, updated);
  return { success: true, attestation: newAtt };
}

export function recordBatchAttestations(
  payerAddress: string,
  entries: Array<{ recipientTag: string; amount: bigint; token: string; windowPeriod: string }>
): { success: boolean; count: number; attestations: PaymentAttestation[] } {
  const current = getAttestations();
  const enrolment = getPayerEnrolment(payerAddress);
  const nowSec = Math.floor(Date.now() / 1000);
  const txHash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");

  const newItems: PaymentAttestation[] = entries.map((e, idx) => {
    const formattedAmount =
      e.token === "NGN"
        ? `₦${Number(e.amount).toLocaleString()}`
        : `${e.amount.toString()} ${e.token}`;

    return {
      id: `att_batch_0x${Math.random().toString(16).slice(2, 10)}_${idx}`,
      payerAddress,
      payerName: enrolment?.name,
      recipientTag: e.recipientTag,
      amount: e.amount,
      amountFormatted: formattedAmount,
      token: e.token,
      windowPeriod: e.windowPeriod,
      fromTimestamp: nowSec - 86400 * 90,
      toTimestamp: nowSec,
      timestamp: nowSec,
      txHash,
    };
  });

  const updated = [...newItems, ...current];
  saveToStorage(STORAGE_KEYS.ATTESTATIONS, updated);
  return { success: true, count: newItems.length, attestations: newItems };
}

export function calculateAnonymitySet(payerAddressOrName: string, windowPeriod: string): number {
  const attestations = getAttestations();
  const payer = payerAddressOrName.toLowerCase();
  const matches = attestations.filter(
    (a) =>
      (a.payerAddress.toLowerCase() === payer ||
        (a.payerName && a.payerName.toLowerCase() === payer)) &&
      (a.windowPeriod === windowPeriod || !windowPeriod)
  );

  const uniqueTags = new Set(matches.map((a) => a.recipientTag));
  return Math.max(uniqueTags.size, matches.length > 0 ? matches.length : 1);
}

// -------------------------------------------------------------
// Earner Issued Claims API (T028, T031, T048)
// -------------------------------------------------------------

export function getIssuedClaims(): IssuedClaim[] {
  return getFromStorage(STORAGE_KEYS.CLAIMS, INITIAL_CLAIMS);
}

export function getClaimById(claimIdOrShort: string): IssuedClaim | undefined {
  const claims = getIssuedClaims();
  const norm = claimIdOrShort.trim().toLowerCase();
  return claims.find(
    (c) =>
      c.claimId.toLowerCase() === norm ||
      c.shortId.toLowerCase() === norm ||
      c.claimId.toLowerCase().includes(norm) ||
      norm.includes(c.shortId.toLowerCase())
  );
}

export function createIssuedClaim(params: {
  identityKey: string;
  payerAddress: string;
  payerName: string;
  token: string;
  thresholdAmount: bigint;
  fromPeriod: string;
  toPeriod: string;
  fromTimestamp: number;
  toTimestamp: number;
  verifierName: string;
  challengePreimage: string;
  expiryDays: number;
  anonymitySetSize: number;
}): { success: boolean; claim: IssuedClaim } {
  const claims = getIssuedClaims();
  const challengeHashFelt = computeChallengeHash(params.challengePreimage);
  const challengeHashStr = "0x" + challengeHashFelt.toString(16);

  const earnerHandleFelt = computeEarnerHandle(params.identityKey);
  const earnerHandleStr = "0x" + earnerHandleFelt.toString(16);

  const nonce = BigInt(Date.now());
  const claimIdFelt = computeClaimId(params.identityKey, challengeHashFelt, nonce);
  const claimIdStr = "0x" + claimIdFelt.toString(16).padStart(64, "0");

  const expiresAt = Date.now() + params.expiryDays * 86400000;

  const paramsHashFelt = computeParamsHash({
    payer: params.payerAddress,
    token: params.token === "NGN" ? BigInt(1) : BigInt(2),
    fromTs: BigInt(params.fromTimestamp),
    toTs: BigInt(params.toTimestamp),
    threshold: params.thresholdAmount,
    challengeHash: challengeHashFelt,
    expiresAt: BigInt(Math.floor(expiresAt / 1000)),
  });

  const formattedThreshold =
    params.token === "NGN"
      ? `₦${Number(params.thresholdAmount).toLocaleString()}`
      : `${params.thresholdAmount.toString()} ${params.token}`;

  const shortId = `vlm_0x${claimIdStr.slice(2, 10)}`;
  const enrolment = getPayerEnrolment(params.payerAddress) || getPayerEnrolment(params.payerName);

  const newClaim: IssuedClaim = {
    claimId: claimIdStr,
    shortId,
    earnerHandle: earnerHandleStr,
    payerAddress: params.payerAddress,
    payerName: params.payerName || enrolment?.name || "Unenrolled Payer",
    isPayerEnrolled: Boolean(enrolment),
    token: params.token,
    thresholdAmount: params.thresholdAmount,
    thresholdFormatted: formattedThreshold,
    fromPeriod: params.fromPeriod,
    toPeriod: params.toPeriod,
    fromTimestamp: params.fromTimestamp,
    toTimestamp: params.toTimestamp,
    verifierName: params.verifierName,
    challengePreimage: params.challengePreimage,
    challengeHash: challengeHashStr,
    createdAt: Date.now(),
    expiresAt,
    status: "ACTIVE",
    anonymitySetSize: params.anonymitySetSize,
    paramsHash: "0x" + paramsHashFelt.toString(16),
    txHash: "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
  };

  const updated = [newClaim, ...claims];
  saveToStorage(STORAGE_KEYS.CLAIMS, updated);
  return { success: true, claim: newClaim };
}

export function revokeClaim(claimId: string): { success: boolean; error?: string } {
  const claims = getIssuedClaims();
  const index = claims.findIndex((c) => c.claimId === claimId || c.shortId === claimId);
  if (index === -1) return { success: false, error: "CLAIM_NOT_FOUND" };

  claims[index].status = "REVOKED";
  saveToStorage(STORAGE_KEYS.CLAIMS, claims);
  return { success: true };
}

export function redeemClaim(
  claimId: string,
  presentedPreimage: string
): { success: boolean; status: "VALID" | "WRONG_VERIFIER" | "ALREADY_SPENT" | "CLAIM_EXPIRED" | "CLAIM_REVOKED"; reason?: string; claim?: IssuedClaim } {
  const claims = getIssuedClaims();
  const claim = claims.find((c) => c.claimId === claimId || c.shortId === claimId);

  if (!claim) {
    return {
      success: false,
      status: "WRONG_VERIFIER",
      reason: "Claim ID not found in local registry.",
    };
  }

  // Expiry check (FR-004)
  if (Date.now() > claim.expiresAt || claim.status === "EXPIRED") {
    claim.status = "EXPIRED";
    saveToStorage(STORAGE_KEYS.CLAIMS, claims);
    return {
      success: false,
      status: "CLAIM_EXPIRED",
      reason: "CLAIM_EXPIRED: This claim has passed its expiration date and is no longer valid.",
      claim,
    };
  }

  // Revocation check (FR-010)
  if (claim.status === "REVOKED") {
    return {
      success: false,
      status: "CLAIM_REVOKED",
      reason: "CLAIM_REVOKED: This claim was revoked by the issuing earner.",
      claim,
    };
  }

  // Single-use check (FR-003, SC-003)
  if (claim.status === "REDEEMED") {
    return {
      success: false,
      status: "ALREADY_SPENT",
      reason: "ALREADY_SPENT: This single-use claim has already been presented and verified. Replay rejected.",
      claim,
    };
  }

  // Verifier Challenge check (FR-002, SC-002)
  const cleanPresented = presentedPreimage.trim();
  const cleanExpected = claim.challengePreimage.trim();
  const presentedHash = "0x" + computeChallengeHash(cleanPresented).toString(16);

  if (cleanPresented !== cleanExpected && presentedHash !== claim.challengeHash) {
    return {
      success: false,
      status: "WRONG_VERIFIER",
      reason: `WRONG_VERIFIER: Verification challenge mismatch. This claim is bound solely to "${claim.verifierName}".`,
      claim,
    };
  }

  // Valid single-use redemption!
  claim.status = "REDEEMED";
  claim.redeemedAt = Date.now();
  claim.redeemedBy = claim.verifierName;
  saveToStorage(STORAGE_KEYS.CLAIMS, claims);

  return {
    success: true,
    status: "VALID",
    claim,
  };
}
