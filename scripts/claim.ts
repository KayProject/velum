/**
 * Exercise Velum's actual product path: attest a payment publicly, then claim it privately
 * through the pool's ComputeAndInvoke — the third of the three pool transactions strk20.json
 * needs, and the only one that touches the Velum contract rather than just the pool.
 *
 *   node --experimental-strip-types --env-file=.env.local scripts/claim.ts
 *
 * This script plays both sides for demonstration: the same account attests a payment to itself
 * (as "payer"), then claims it (as "earner"). A real flow has two different parties — a payer
 * calling `attest` publicly, and an earner who never touches Velum directly, reaching it only
 * through the pool's private ComputeAndInvoke.
 *
 * `channel_key` is the earner's secret — whoever knows it can compute the `recipient_tag` a payer
 * attests to and later prove they control it. It never appears on chain. Neither does the
 * `challenge_preimage`, which locks a later `verify`/`redeem` to one intended verifier.
 *
 * Uses the same paymaster submission path as shield.ts/redeem.ts — see that file's header for why
 * a plain `account.execute()` can't submit this at all. A ComputeAndInvoke alone has no WriteOnce
 * action (nothing spends or creates a note), so it's folded in alongside a tiny private withdraw —
 * not a fresh deposit, which forces a different (and here, broken) submission path — purely to
 * satisfy replay protection. Draws on whatever's already privately shielded from prior runs.
 */

import { Account, RpcProvider, constants, num } from "starknet";
import {
  createEmptyRegistry,
  IndexerDiscoveryProvider,
  ProvingServiceProofProvider,
} from "@starkware-libs/starknet-privacy-sdk";
import {
  AvnuPaymaster,
  CorePrivateTransfersProver,
  SdkWallet,
} from "@starkware-libs/starknet-privacy-client";

import { env } from "../lib/env.ts";
import { computeChallengeHash, computeRecipientTag } from "../lib/velum/hashes.ts";

const STRK = "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d";
const DECIMALS = 18n;

function toWei(amount: string): bigint {
  const [whole, fraction = ""] = amount.trim().split(".");
  return BigInt(whole + fraction.padEnd(Number(DECIMALS), "0"));
}

function fromWei(wei: bigint): string {
  const whole = wei / 10n ** DECIMALS;
  const fraction = (wei % 10n ** DECIMALS).toString().padStart(Number(DECIMALS), "0");
  return `${whole}.${fraction.slice(0, 4)}`;
}

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set`);
  return value;
}

async function callFelt(
  provider: RpcProvider,
  contractAddress: string,
  entrypoint: string,
  calldata: string[] = []
): Promise<bigint> {
  const result = await provider.callContract({ contractAddress, entrypoint, calldata });
  return BigInt(result[0]);
}

async function main() {
  const config = env();
  const address = required("VELUM_ACCOUNT_ADDRESS");
  const privateKey = required("VELUM_ACCOUNT_PRIVATE_KEY");
  const passphrase = required("VELUM_PASSPHRASE");
  const paymasterUrl = required("AVNU_PAYMASTER_URL");
  const paymasterApiKey = required("AVNU_PAYMASTER_API_KEY");
  const velumAddress = required("MAINNET_VELUM_ADDRESS");

  const provider = new RpcProvider({ nodeUrl: config.nodeUrl });
  const account = new Account({ provider, address, signer: privateKey, cairoVersion: "1" });

  console.log(`account   ${address}`);
  console.log(`velum     ${velumAddress}`);

  // --- 1. payer attests a payment, publicly, directly (no privacy involved on this side) ------
  const channelKey = num.toHex(BigInt(Date.now()) * 1000003n + 7n); // arbitrary secret, not random-quality — fine for a demo claim
  const recipientTag = num.toHex(computeRecipientTag(channelKey));
  const attestAmount = toWei("10");

  console.log(`\nattesting ${fromWei(attestAmount)} STRK to recipient_tag ${recipientTag}`);
  const attestCall = await account.execute({
    contractAddress: velumAddress,
    entrypoint: "attest",
    calldata: [recipientTag, STRK, attestAmount.toString()],
  });
  console.log(`  ${attestCall.transaction_hash}`);
  const attestReceipt = await provider.waitForTransaction(attestCall.transaction_hash);
  console.log("  confirmed");

  const attestBlockNumber = (attestReceipt as { block_number: number }).block_number;
  const attestedAt = (await provider.getBlockWithTxHashes(attestBlockNumber)).timestamp;

  // --- 2. earner claims it privately, through the pool's ComputeAndInvoke ---------------------
  const threshold = toWei("5"); // claim "at least 5 STRK", well under what was attested
  const challengePreimage = num.toHex(BigInt(Date.now()) * 1000033n + 11n);
  const challengeHash = num.toHex(computeChallengeHash(challengePreimage));
  const expiresAt = BigInt(Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60); // 30 days out
  const fromTs = 0n;
  const toTs = BigInt(attestedAt) + 3600n;
  const nonce = num.toHex(BigInt(Date.now()) * 1000037n + 13n);

  console.log(`\nclaiming: threshold ${fromWei(threshold)} STRK, expires ${new Date(Number(expiresAt) * 1000).toISOString()}`);
  console.log(`challenge preimage (keep this — it's what a verifier needs): ${challengePreimage}`);

  const feeAmount = await callFelt(provider, config.poolAddress, "get_fee_amount");
  console.log(`\nprotocol fee    ${fromWei(feeAmount)} STRK (paid from existing private balance)`);

  // A tiny real withdraw, paired with the claim — not a fresh public deposit. A withdraw already
  // produces a change/surplus note (a WriteOnce — see redeem.ts's header for why one is required
  // at all), without a public approve or the invoke_and_apply_action multicall path a deposit
  // forces, which is what a combined deposit+compute_and_invoke tripped on
  // (INVALID_INVOKE_RETURN_DATA / argent/multicall-failed). Relies on the private balance already
  // shielded from prior runs (shield.ts, redeem.ts's leftover surplus) covering withdraw + fee —
  // the SDK's own compiler fails fast, before any cost, if it doesn't.
  // Net must come out to exactly zero, not merely non-negative: a leftover surplus above what
  // withdraw+fee consumes needs an explicit surplus action to land anywhere, which Strk20Action
  // has no case for here — that's the "no surplus action found" this amount is chosen to avoid.
  // 8.0 STRK is this account's current private balance (shield.ts x2 + redeem.ts's leftover).
  const currentPrivateBalance = toWei("8.0");
  const claimWithdrawAmount = currentPrivateBalance - feeAmount;

  // Proving runs against a block 10 behind head (see shield.ts) so the paymaster's own view of
  // head isn't "too recent" by the time this reaches execution. That margin must not reach back
  // past the attest confirmed above, or sum_attestations() runs against state that predates it —
  // BELOW_THRESHOLD with nothing wrong about the claim itself. Wait for the chain to clear that.
  const PROVING_MARGIN = 10;
  let currentBlock = await provider.getBlockLatestAccepted();
  while (currentBlock.block_number - PROVING_MARGIN < attestBlockNumber + 2) {
    await new Promise((resolve) => setTimeout(resolve, 5000));
    currentBlock = await provider.getBlockLatestAccepted();
  }
  const provingBlock = currentBlock.block_number - PROVING_MARGIN;

  const provingProvider = new ProvingServiceProofProvider(config.provingServiceUrl, constants.StarknetChainId.SN_MAIN, {
    nodeUrl: config.nodeUrl,
    poolAddress: config.poolAddress,
    blockIdentifier: provingBlock,
  });
  const discoveryProvider = new IndexerDiscoveryProvider(config.discoveryUrl, config.poolAddress);

  const prover = new CorePrivateTransfersProver({
    signer: account.signer,
    address,
    passphrase,
    node: provider,
    discovery: discoveryProvider,
    prover: provingProvider,
    poolContractAddress: config.poolAddress,
    shadowAccountAnonymizerAddress: config.shadowAccountAnonymizerAddress,
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

  // compute_calldata matches privacy_compute's params after identity_key (the pool prepends
  // identity_key itself — velum.cairo:26). invoke_calldata matches privacy_invoke_with_computation's
  // params after (claim_id, earner_handle, params_hash) — the pool prepends those three from the
  // compute phase's result (velum.cairo:48-53).
  console.log("\nproving and submitting via the AVNU paymaster — this takes around 30 seconds, it has not hung");
  const { transaction_hash } = await wallet.strk20InvokeTransaction([
    { type: "withdraw", token: STRK, amount: claimWithdrawAmount.toString(), recipient: address },
    {
      type: "compute_and_invoke",
      contract: velumAddress,
      compute_calldata: [
        channelKey,
        address,
        STRK,
        fromTs.toString(),
        toTs.toString(),
        threshold.toString(),
        challengeHash,
        expiresAt.toString(),
        nonce,
      ],
      invoke_calldata: [
        address,
        STRK,
        fromTs.toString(),
        toTs.toString(),
        threshold.toString(),
        challengeHash,
        expiresAt.toString(),
      ],
    },
  ]);

  console.log(`\nclaimed. transaction: ${transaction_hash}`);
  console.log(`https://voyager.online/tx/${transaction_hash}`);
  console.log("\nThis hash touches the Velum contract through the pool's ComputeAndInvoke — the third");
  console.log("pool transaction strk20.json needs, and the one that actually exercises the product.");
}

main().catch((error) => {
  console.error(`\nfailed: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
