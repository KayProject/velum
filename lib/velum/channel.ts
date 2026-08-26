/**
 * Channel and recipient tag derivations for Velum.
 *
 * A recipient derives a unique channel_key that the payer can use to calculate the recipient_tag.
 * Because attestations attach to this tag rather than an on-chain address, paying someone through
 * Velum leaks nothing about their mainnet account or other earnings (FR-014).
 */

import { computeRecipientTag, poseidon, Felt } from "./hashes";
import { ec, hash, shortString } from "starknet";

const CHANNEL_DERIVATION_TAG = "VELUM_CHANNEL_KEY:V1";

/**
 * Derive a channel key from a viewing key or private seed and a payer-specific context.
 */
export function deriveChannelKey(seed: Felt, payerContext: Felt): bigint {
  const tagFelt = BigInt(shortString.encodeShortString(CHANNEL_DERIVATION_TAG));
  return poseidon([tagFelt, BigInt(seed), BigInt(payerContext)]);
}

/**
 * Compute the public recipient tag that the payer records on-chain.
 */
export function deriveRecipientTag(channelKey: Felt): bigint {
  return computeRecipientTag(channelKey);
}

/**
 * Format a recipient tag as a readable hexadecimal string.
 */
export function formatTag(tag: bigint): string {
  return "0x" + tag.toString(16).padStart(64, "0");
}
