/**
 * Half of the Cairo↔TS parity check.
 *
 * These vectors are generated once here and asserted in `contracts/tests/test_hashes.cairo`
 * against the same inputs. `npm run test:vectors` regenerates the fixture both sides read.
 */

import { describe, expect, it } from "vitest";
import {
  computeChallengeHash,
  computeClaimId,
  computeEarnerHandle,
  computeParamsHash,
  computeRecipientTag,
  poseidon,
} from "./hashes.js";
import vectors from "./hashes.vectors.json" with { type: "json" };

describe("hash derivations", () => {
  it("matches the Cairo vectors for recipient_tag", () => {
    for (const v of vectors.recipientTag) {
      expect(computeRecipientTag(v.channelKey).toString()).toBe(v.expected);
    }
  });

  it("matches the Cairo vectors for claim_id", () => {
    for (const v of vectors.claimId) {
      expect(computeClaimId(v.identityKey, v.challengeHash, v.nonce).toString()).toBe(v.expected);
    }
  });

  it("matches the Cairo vectors for earner_handle", () => {
    for (const v of vectors.earnerHandle) {
      expect(computeEarnerHandle(v.identityKey).toString()).toBe(v.expected);
    }
  });

  it("matches the Cairo vectors for params_hash", () => {
    for (const v of vectors.paramsHash) {
      expect(computeParamsHash(v).toString()).toBe(v.expected);
    }
  });

  it("matches the Cairo vectors for challenge_hash", () => {
    for (const v of vectors.challengeHash) {
      expect(computeChallengeHash(v.preimage).toString()).toBe(v.expected);
    }
  });

  it("separates domains: the same input under two tags never collides", () => {
    const x = 12345n;
    const all = new Set([
      computeRecipientTag(x).toString(),
      computeEarnerHandle(x).toString(),
      computeChallengeHash(x).toString(),
      poseidon([x]).toString(),
    ]);
    expect(all.size).toBe(4);
  });
});
