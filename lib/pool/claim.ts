/**
 * Claim construction and the real STRK20 pool broadcast for Velum.
 *
 * The cheap, free half (`validateClaimParameters`, `buildClaimParams`, `calculateClaimIdentifiers`)
 * runs anywhere, including the browser. `simulateClaim` / `broadcastClaim` are server-only: they
 * drive `@starkware-libs/starknet-privacy-client`'s `CorePrivateTransfersProver` + `SdkWallet`, which
 * needs a raw Starknet signer — something a browser wallet extension deliberately never exposes to a
 * dApp (see the vendored client's `Snip12CallSetSigner`: it signs a precomputed felt hash directly,
 * which only a handful of institutional wallets like Fordefi support; consumer extensions such as
 * Argent X/Braavos only expose structured typed-data/transaction signing). So this account is a
 * relayer Velum itself controls, not the earner's own wallet — the same one `scripts/claim.ts`,
 * `shield.ts` and `redeem.ts` already use. It pays the pool's ~6 STRK protocol fee from its own
 * privately shielded balance on every real attempt, success or not — see docs in `broadcastClaim`.
 */

import { Account, RpcProvider, constants } from "starknet";
import {
  createEmptyRegistry,
  IndexerDiscoveryProvider,
  ProvingServiceProofProvider,
} from "@starkware-libs/starknet-privacy-sdk";
import { AvnuPaymaster, CorePrivateTransfersProver, SdkWallet } from "@starkware-libs/starknet-privacy-client";
import { ClaimParams, computeClaimId, computeParamsHash } from "../velum/hashes";
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

/** Pre-evaluates threshold logic to catch BELOW_THRESHOLD before spending anything. */
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

export function calculateClaimIdentifiers(args: PrepareClaimArgs, nonce = BigInt(Date.now())) {
  const params = buildClaimParams(args);
  const paramsHash = computeParamsHash(params);
  const claimId = computeClaimId(args.identityKey, args.verifierChallengeHash, nonce);
  return { params, paramsHash, claimId, nonce };
}

// -------------------------------------------------------------------------------------------------
// Real pool broadcast — server only, spends the relayer's own STRK. See module header.
// -------------------------------------------------------------------------------------------------

const STRK = "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d";

export interface RelayedClaimParams {
  /** The earner's channel key — a plain witness value, not a signing secret. */
  channelKey: string;
  payer: string;
  token: string;
  fromTs: number;
  toTs: number;
  threshold: bigint;
  challengeHash: string;
  expiresAt: number;
  nonce: string;
}

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set`);
  return value;
}

/**
 * Builds every dependency `CorePrivateTransfersProver` / `SdkWallet` need, from the relayer's own
 * env-configured account — the exact wiring `scripts/claim.ts` already proved works up to broadcast.
 */
async function relayerPoolWallet() {
  const config = env();
  const address = required("VELUM_ACCOUNT_ADDRESS");
  const privateKey = required("VELUM_ACCOUNT_PRIVATE_KEY");
  const passphrase = required("VELUM_PASSPHRASE");
  const paymasterUrl = required("AVNU_PAYMASTER_URL");
  const paymasterApiKey = required("AVNU_PAYMASTER_API_KEY");

  const provider = new RpcProvider({ nodeUrl: config.nodeUrl });
  const account = new Account({ provider, address, signer: privateKey, cairoVersion: "1" });

  // A fixed margin behind head, same as scripts/claim.ts — the paymaster needs its own view of head
  // not to be "too recent." Unlike that script (which attests and claims in the same run), an API
  // call arrives well after the earner's attestation actually landed, so there's no need to also
  // poll for the chain to clear a specific block the way scripts/claim.ts does.
  const PROVING_MARGIN = 10;
  const currentBlock = await provider.getBlockLatestAccepted();
  const provingBlock = currentBlock.block_number - PROVING_MARGIN;

  const provingProvider = new ProvingServiceProofProvider(
    config.provingServiceUrl,
    constants.StarknetChainId.SN_MAIN,
    { nodeUrl: config.nodeUrl, poolAddress: config.poolAddress, blockIdentifier: provingBlock }
  );
  const discoveryProvider = new IndexerDiscoveryProvider(config.discoveryUrl, config.poolAddress);

  const prover = new CorePrivateTransfersProver({
    signer: account.signer,
    address,
    passphrase,
    // The SDK's own `node` type is read off its internal builder signature specifically because it
    // can be a *different* vendored `starknet` version than this package's — see strk20-prover.d.ts's
    // own comment ("making a bare ProviderInterface import incompatible"). A plain `RpcProvider` is
    // structurally exactly what it wants at runtime; this cast just routes around two TS copies of
    // the same shape disagreeing nominally.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    node: provider as any,
    discovery: discoveryProvider,
    prover: provingProvider,
    poolContractAddress: config.poolAddress,
    // Only used for shadow-account reads, which Velum's own flow never does (see lib/env.ts).
    shadowAccountAnonymizerAddress: config.shadowAccountAnonymizerAddress ?? "0x0",
    storage: {
      loadRegistry: async () => createEmptyRegistry(),
      saveRegistry: async () => {},
    },
  });

  const paymaster = new AvnuPaymaster({
    url: paymasterUrl,
    apiKey: paymasterApiKey,
    feeMode: { mode: "sponsored_private", poolFeeToken: STRK, tip: "normal" },
  });

  const wallet = new SdkWallet({
    prover,
    paymaster,
    poolContractAddress: config.poolAddress,
    signer: account.signer,
    userAddress: address,
  });

  return { wallet, provider, config, address };
}

/**
 * `compute_and_invoke` action calldata for `params`, matching Velum's own argument order
 * (velum.cairo's `privacy_compute` / `privacy_invoke_with_computation`, minus the pool-prepended
 * fields).
 */
function computeAndInvokeAction(velumAddress: string, params: RelayedClaimParams) {
  return {
    type: "compute_and_invoke" as const,
    contract: velumAddress,
    compute_calldata: [
      params.channelKey,
      params.payer,
      params.token,
      params.fromTs.toString(),
      params.toTs.toString(),
      params.threshold.toString(),
      params.challengeHash,
      params.expiresAt.toString(),
      params.nonce,
    ],
    invoke_calldata: [
      params.payer,
      params.token,
      params.fromTs.toString(),
      params.toTs.toString(),
      params.threshold.toString(),
      params.challengeHash,
      params.expiresAt.toString(),
    ],
  };
}

/**
 * The relayer's currently-shielded private STRK balance. There is no on-chain view for this — the
 * SDK only surfaces it indirectly from a compiler error. Rather than guess, this is tracked manually
 * (updated after every real shield/redeem/claim) exactly like `scripts/claim.ts` and `probe_prove.ts`
 * already do — moved to an env var so it doesn't need a code edit each time.
 */
function relayerPrivateBalanceWei(): bigint {
  const raw = required("VELUM_ACCOUNT_PRIVATE_BALANCE_WEI");
  return BigInt(raw);
}

/**
 * Free, no-broadcast check: does this claim clear `privacy_compute`'s threshold, and does the actual
 * proof construction succeed against the relayer's real on-chain state? Always run this before
 * `broadcastClaim` — a real attempt costs the protocol fee whether or not it ultimately succeeds.
 */
export async function simulateClaim(
  velumAddress: string,
  params: RelayedClaimParams
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const { wallet, provider, config, address } = await relayerPoolWallet();
    const feeAmount = await provider
      .callContract({ contractAddress: config.poolAddress, entrypoint: "get_fee_amount" })
      .then((r) => BigInt(r[0]));
    const privateBalance = relayerPrivateBalanceWei();
    const withdrawAmount = privateBalance - feeAmount;
    if (withdrawAmount < 0n) {
      return { ok: false, error: `Relayer's private balance (${privateBalance} wei) is below the protocol fee (${feeAmount} wei) — top it up first.` };
    }

    const actions = [
      { type: "withdraw" as const, token: STRK, amount: withdrawAmount.toString(), recipient: address },
      computeAndInvokeAction(velumAddress, params),
    ];
    await wallet.strk20PrepareInvoke(actions, true);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

/**
 * The real, fee-costing broadcast. Only call this after `simulateClaim` returns `ok: true` — see
 * that function's doc. Success or on-chain revert, this leaves a real transaction; a thrown error
 * here means it never reached broadcast (e.g. proving/paymaster failure).
 */
export async function broadcastClaim(
  velumAddress: string,
  params: RelayedClaimParams
): Promise<ClaimExecutionResult> {
  try {
    const { wallet, config, address } = await relayerPoolWallet();
    const feeAmount = await new RpcProvider({ nodeUrl: config.nodeUrl })
      .callContract({ contractAddress: config.poolAddress, entrypoint: "get_fee_amount" })
      .then((r) => BigInt(r[0]));
    const privateBalance = relayerPrivateBalanceWei();
    const withdrawAmount = privateBalance - feeAmount;
    if (withdrawAmount < 0n) {
      return { success: false, error: `Relayer's private balance is below the protocol fee — top it up first.` };
    }

    const actions = [
      { type: "withdraw" as const, token: STRK, amount: withdrawAmount.toString(), recipient: address },
      computeAndInvokeAction(velumAddress, params),
    ];

    const { transaction_hash } = await wallet.strk20InvokeTransaction(actions);
    return { success: true, txHash: transaction_hash };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}
