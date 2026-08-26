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
