import { describe, it, expect } from "vitest";
import { validateClaimParameters, calculateClaimIdentifiers } from "./claim";

describe("claim construction & validation", () => {
  it("validates when accumulated payments meet or exceed threshold", () => {
    const res = validateClaimParameters(5000000n, 4200000n);
    expect(res.valid).toBe(true);
  });

  it("refuses with BELOW_THRESHOLD when accumulated payments are short", () => {
    const res = validateClaimParameters(3000000n, 4200000n);
    expect(res.valid).toBe(false);
    expect(res.reason).toContain("BELOW_THRESHOLD");
  });

  it("calculates claim ID and deterministic params hash", () => {
    const args = {
      payerAddress: "0x040337b1af3c663e86e333bab5a4b28da8d4652a15a69beee2b677776ffe812a",
      tokenAddress: "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
      fromTimestamp: 1735689600,
      toTimestamp: 1743465600,
      thresholdAmount: 4200000n,
      verifierChallengeHash: "0x1234567890abcdef",
      expirationTimestamp: 1745000000,
      identityKey: "0xabcdef1234567890",
    };

    const idents = calculateClaimIdentifiers(args, 1001n);
    expect(idents.paramsHash).toBeTypeOf("bigint");
    expect(idents.claimId).toBeTypeOf("bigint");
    expect(idents.nonce).toBe(1001n);
  });
});
