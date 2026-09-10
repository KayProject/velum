/**
 * Velum's four derivations, in TypeScript.
 *
 * Every function here has a twin in `contracts/src/hashes.cairo`. `hashes.test.ts` and
 * `contracts/tests/test_hashes.cairo` run the same vectors through both and assert the results
 * match. If they ever drift, a claim fails on chain with nothing in the receipt to explain why —
 * so the parity test is not optional scaffolding, it is the thing that keeps this debuggable.
 */

import { hash, shortString } from "starknet";

/** Domain tags, byte-identical to `contracts/src/hashes.cairo`. */
export const TAGS = {
  RECIPIENT: "VELUM_RECIPIENT_TAG:V1",
  CLAIM_ID: "VELUM_CLAIM_ID_TAG:V1",
  EARNER_HANDLE: "VELUM_EARNER_HANDLE_TAG:V1",
  PARAMS_HASH: "VELUM_PARAMS_HASH_TAG:V1",
  CHALLENGE: "VELUM_CHALLENGE_TAG:V1",
} as const;

export type Felt = string | bigint | number;

const tag = (t: string): bigint => BigInt(shortString.encodeShortString(t));
const felt = (v: Felt): bigint => BigInt(v);

/**
 * Turns arbitrary human-typed text into a felt252, the way a verifier challenge code or channel
 * seed actually needs to travel on chain.
 *
 * `felt()` above only accepts something `BigInt()` already parses (hex or decimal) — passing plain
 * text like "meridian_lease_2026" straight into it throws. Cairo's short-string encoding is the
 * real, on-chain-compatible way to turn short ASCII text into a felt252 (31 bytes max); anything
 * already hex or decimal is left as a numeric felt rather than re-encoded.
 */
export function textToFelt(input: string): bigint {
  const trimmed = input.trim();
  if (!trimmed) throw new Error("Cannot derive a felt from empty input.");
  if (/^0x[0-9a-fA-F]+$/.test(trimmed) || /^[0-9]+$/.test(trimmed)) {
    return BigInt(trimmed);
  }
  if (trimmed.length > 31) {
    throw new Error(
      `"${trimmed}" is ${trimmed.length} characters — Cairo short strings top out at 31.`
    );
  }
  return BigInt(shortString.encodeShortString(trimmed));
}

/** Cairo's `poseidon_hash_span`. */
export const poseidon = (data: bigint[]): bigint =>
  BigInt(hash.computePoseidonHashOnElements(data));

/** `h(VELUM_RECIPIENT_TAG, channel_key)` — what a payer attests to. */
export const computeRecipientTag = (channelKey: Felt): bigint =>
  poseidon([tag(TAGS.RECIPIENT), felt(channelKey)]);

/** `h(VELUM_CLAIM_ID_TAG, identity_key, challenge_hash, nonce)`. */
export const computeClaimId = (
  identityKey: Felt,
  challengeHash: Felt,
  nonce: Felt,
): bigint =>
  poseidon([tag(TAGS.CLAIM_ID), felt(identityKey), felt(challengeHash), felt(nonce)]);

/** `h(VELUM_EARNER_HANDLE_TAG, identity_key)` — scoped to Velum, uncorrelatable elsewhere. */
export const computeEarnerHandle = (identityKey: Felt): bigint =>
  poseidon([tag(TAGS.EARNER_HANDLE), felt(identityKey)]);

/** The public claim parameters, in the exact order the contract hashes them. */
export interface ClaimParams {
  payer: Felt;
  token: Felt;
  fromTs: Felt;
  toTs: Felt;
  threshold: Felt;
  challengeHash: Felt;
  expiresAt: Felt;
}

/**
 * Binds the proven half of a claim to the published half.
 *
 * Field order here must match `compute_params_hash` in Cairo exactly. Reordering one argument
 * produces a hash that is wrong in a way no test but the parity test will catch.
 */
export const computeParamsHash = (p: ClaimParams): bigint =>
  poseidon([
    tag(TAGS.PARAMS_HASH),
    felt(p.payer),
    felt(p.token),
    felt(p.fromTs),
    felt(p.toTs),
    felt(p.threshold),
    felt(p.challengeHash),
    felt(p.expiresAt),
  ]);

/** `h(VELUM_CHALLENGE_TAG, preimage)` — the verifier keeps the preimage. */
export const computeChallengeHash = (preimage: Felt): bigint =>
  poseidon([tag(TAGS.CHALLENGE), felt(preimage)]);
