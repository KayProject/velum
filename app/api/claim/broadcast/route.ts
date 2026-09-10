import { NextRequest, NextResponse } from "next/server";
import { simulateClaim, broadcastClaim, type RelayedClaimParams } from "@/lib/pool/claim";
import { velumAddress } from "@/lib/pool/client";

/**
 * The real STRK20 `compute_and_invoke` broadcast — the one leg of Velum's product that a browser
 * wallet cannot drive (see lib/pool/claim.ts's header). Deliberately NOT called from the public
 * earner page: every real attempt spends the relayer's own STRK (a ~6 STRK protocol fee) whether it
 * succeeds or not, and per HANDOVER.md every real attempt so far has hit the same upstream
 * `argent/multicall-failed` bug in AVNU's shadow account — so an unauthenticated public button here
 * would be a real fund-drain path for a feature that's currently expected to fail anyway.
 *
 * Gated behind `VELUM_OPERATOR_KEY` (server-only, set in .env.local) — call it yourself:
 *
 *   curl -X POST http://localhost:3000/api/claim/broadcast \
 *     -H "Content-Type: application/json" -H "x-velum-operator-key: $VELUM_OPERATOR_KEY" \
 *     -d '{"mode":"simulate", ...RelayedClaimParams}'
 *
 * `mode: "simulate"` (the default) is free and never broadcasts — always run it first.
 * `mode: "broadcast"` is real and requires `iUnderstandThisCostsRealStrk: true` in the body.
 */

export async function POST(req: NextRequest) {
  const operatorKey = process.env.VELUM_OPERATOR_KEY;
  if (!operatorKey) {
    return NextResponse.json({ error: "VELUM_OPERATOR_KEY is not configured on this server." }, { status: 503 });
  }
  if (req.headers.get("x-velum-operator-key") !== operatorKey) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { mode = "simulate", iUnderstandThisCostsRealStrk, ...rest } = body as {
      mode?: "simulate" | "broadcast";
      iUnderstandThisCostsRealStrk?: boolean;
    } & Record<string, unknown>;

    const required = ["channelKey", "payer", "token", "fromTs", "toTs", "threshold", "challengeHash", "expiresAt", "nonce"];
    for (const key of required) {
      if (rest[key] === undefined || rest[key] === null) {
        return NextResponse.json({ error: `MISSING_PARAMETER: ${key}` }, { status: 400 });
      }
    }

    const params: RelayedClaimParams = {
      channelKey: String(rest.channelKey),
      payer: String(rest.payer),
      token: String(rest.token),
      fromTs: Number(rest.fromTs),
      toTs: Number(rest.toTs),
      threshold: BigInt(rest.threshold as string),
      challengeHash: String(rest.challengeHash),
      expiresAt: Number(rest.expiresAt),
      nonce: String(rest.nonce),
    };

    const address = velumAddress();

    if (mode === "simulate") {
      const result = await simulateClaim(address, params);
      return NextResponse.json(result);
    }

    if (!iUnderstandThisCostsRealStrk) {
      return NextResponse.json(
        { error: "mode=broadcast requires iUnderstandThisCostsRealStrk: true — this spends real STRK, success or not." },
        { status: 400 }
      );
    }

    const result = await broadcastClaim(address, params);
    return NextResponse.json(result, { status: result.success ? 200 : 502 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
