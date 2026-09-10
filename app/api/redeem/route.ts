import { NextRequest, NextResponse } from "next/server";
import { Account } from "starknet";
import { relayer } from "@/lib/env";
import { readProvider, velumContract, decodeClaimStatus, explorerTxUrl } from "@/lib/velum/contract";
import { textToFelt } from "@/lib/velum/hashes";

/**
 * Real redeem, server-signed.
 *
 * `redeem()` is a state-changing on-chain call — the verifier never holds a wallet (that's the
 * whole point of FR-003's single-use design), so a relayer account pays the gas and submits it on
 * their behalf. Every other read here (`verify`) is free, so it runs first: submitting `redeem()`
 * on a claim that's going to revert anyway would burn real gas on the relayer's account for
 * nothing, and an unauthenticated endpoint that does that on every request is a gas-drain vector.
 */

const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 30;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) || [];
  const validTimestamps = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (validTimestamps.length >= MAX_REQUESTS_PER_WINDOW) return false;
  validTimestamps.push(now);
  rateLimitMap.set(ip, validTimestamps);
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "local_client";
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "RATE_LIMITED: Too many redemption requests from this client." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { claimId, challengePreimage } = body as { claimId?: string; challengePreimage?: string };

    if (!claimId || !challengePreimage) {
      return NextResponse.json(
        { error: "MISSING_PARAMETERS: claimId and challengePreimage are required." },
        { status: 400 }
      );
    }

    let preimageFelt: bigint;
    try {
      preimageFelt = textToFelt(challengePreimage);
    } catch (err) {
      return NextResponse.json(
        { error: `INVALID_CHALLENGE: ${err instanceof Error ? err.message : String(err)}` },
        { status: 400 }
      );
    }

    const contract = await velumContract();

    // Free read first (see header comment) — also lets us return the exact, honest reason
    // (Unknown / WrongVerifier / Expired / Spent) instead of a generic revert message.
    const statusRaw = await contract.verify(claimId, preimageFelt.toString());
    const status = decodeClaimStatus(statusRaw);

    if (status !== "Valid") {
      const reasons: Record<string, string> = {
        Unknown: "This claim ID does not exist on chain, or the preimage does not open it.",
        WrongVerifier: "This claim ID does not exist on chain, or the preimage does not open it.",
        Expired: "This claim has passed its expiration timestamp.",
        Spent: "This single-use claim was already redeemed. Replay rejected.",
      };
      return NextResponse.json(
        { success: false, status, reason: reasons[status] ?? "Claim is not valid." },
        { status: 200 }
      );
    }

    const { address, privateKey } = relayer();
    const provider = readProvider();
    const relayerAccount = new Account({ provider, address, signer: privateKey, cairoVersion: "1" });
    contract.connect(relayerAccount);

    const { transaction_hash } = await contract.redeem(claimId, preimageFelt.toString());

    return NextResponse.json({
      success: true,
      status: "VALID_SINGLE_USE_REDEEMED",
      claimId,
      transactionHash: transaction_hash,
      explorerUrl: explorerTxUrl(transaction_hash),
      verifiedAt: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
