/**
 * Claim construction and virtual block execution for Velum.
 *
 * A claim transaction proves that qualifying income exceeded the threshold.
 * Order of actions:
 *   1. UseNote (spend existing note for replay protection)
 *   2. CreateEncNote (self-transfer, preserves balance)
 *   3. invokeWithComputation (calls velum.privacy_compute and verifies receipt)
 */

import { Contract, RpcProvider } from "starknet";
import { ClaimParams, computeClaimId, computeParamsHash } from "../velum/hashes";
import { nodeProvider, velumAddress } from "./client";
import { env } from "../env";

export interface ClaimExecutionResult {
  success: boolean;
  txHash?: string;
  claimId?: string;
  error?: string;
  belowThreshold?: boolean;
}

export interface PrepareClaimArgs {
  payerAddress: string;
  tokenAddress: string;
  fromTimestamp: number;
  toTimestamp: number;
  thresholdAmount: bigint;
  verifierChallengeHash: string;
  expirationTimestamp: number;
  identityKey: string;
  nonce?: bigint;
}

/**
 * Pre-evaluates threshold logic to catch BELOW_THRESHOLD before spending proving compute.
 */
export function validateClaimParameters(
  accumulatedAmount: bigint,
  thresholdAmount: bigint
): { valid: boolean; reason?: string } {
  if (accumulatedAmount < thresholdAmount) {
    return {
      valid: false,
      reason: "BELOW_THRESHOLD: Accumulated qualifying payments do not satisfy the minimum claim threshold.",
    };
  }
  return { valid: true };
}

/**
 * Encodes claim parameters for contract calldata.
 */
export function buildClaimParams(args: PrepareClaimArgs): ClaimParams {
  return {
    payer: args.payerAddress,
    token: args.tokenAddress,
    fromTs: args.fromTimestamp,
    toTs: args.toTimestamp,
    threshold: args.thresholdAmount.toString(),
    challengeHash: args.verifierChallengeHash,
    expiresAt: args.expirationTimestamp,
  };
}

/**
 * Calculates claim ID and expected params hash for client-side pre-flight assertion.
 */
export function calculateClaimIdentifiers(
  args: PrepareClaimArgs,
  nonce = BigInt(Date.now())
) {
  const params = buildClaimParams(args);
  const paramsHash = computeParamsHash(params);
  const claimId = computeClaimId(args.identityKey, args.verifierChallengeHash, nonce);

  return {
    params,
    paramsHash,
    claimId,
    nonce,
  };
}
