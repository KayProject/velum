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

  function getArg(flag: string): string | undefined {
    const idx = process.argv.indexOf(flag);
    return idx !== -1 && idx + 1 < process.argv.length ? process.argv[idx + 1] : undefined;
  }
  const hasFlag = (flag: string) => process.argv.includes(flag);

  const argPayer = getArg("--payer");
  const argThreshold = getArg("--threshold");
  const argChannelKey = getArg("--channel-key");
  const argChallenge = getArg("--challenge");
  const skipAttest = hasFlag("--skip-attest");

  const payer = argPayer || address;
  const channelKey = argChannelKey || num.toHex(BigInt(Date.now()) * 1000003n + 7n);
  const recipientTag = num.toHex(computeRecipientTag(channelKey));
  const threshold = argThreshold ? toWei(argThreshold) : toWei("5");
  const challengePreimage = argChallenge
    ? (argChallenge.startsWith("0x") ? argChallenge : num.toHex(Buffer.from(argChallenge)))
    : num.toHex(BigInt(Date.now()) * 1000033n + 11n);
  const challengeHash = num.toHex(computeChallengeHash(challengePreimage));
  const expiresAt = BigInt(Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60); // 30 days out
  const fromTs = 0n;
  let toTs = BigInt(Math.floor(Date.now() / 1000)) + 3600n;
  const nonce = num.toHex(BigInt(Date.now()) * 1000037n + 13n);

  let attestBlockNumber = 0;
  if (!skipAttest) {
    const attestAmount = threshold > toWei("10") ? threshold * 2n : toWei("10");
    console.log(`\nattesting ${fromWei(attestAmount)} STRK to recipient_tag ${recipientTag}`);
    const attestCall = await account.execute({
      contractAddress: velumAddress,
      entrypoint: "attest",
      calldata: [recipientTag, STRK, attestAmount.toString()],
    });
    console.log(`  ${attestCall.transaction_hash}`);
    const attestReceipt = await provider.waitForTransaction(attestCall.transaction_hash);
    console.log("  confirmed");

    attestBlockNumber = (attestReceipt as { block_number: number }).block_number;
    const attestedAt = (await provider.getBlockWithTxHashes(attestBlockNumber)).timestamp;
    toTs = BigInt(attestedAt) + 3600n;
  }

  // --- 2. earner claims it privately, through the pool's ComputeAndInvoke ---------------------
  console.log(`\nclaiming: threshold ${fromWei(threshold)} STRK, payer ${payer}`);
  console.log(`expires: ${new Date(Number(expiresAt) * 1000).toISOString()}`);
  console.log(`challenge preimage: ${challengePreimage}`);

  const feeAmount = await callFelt(provider, config.poolAddress, "get_fee_amount");
  console.log(`\nprotocol fee    ${fromWei(feeAmount)} STRK (paid from existing private balance)`);

  const currentPrivateBalance = toWei("8.0");
  const claimWithdrawAmount = currentPrivateBalance - feeAmount;

  const PROVING_MARGIN = 10;
  let currentBlock = await provider.getBlockLatestAccepted();
  if (attestBlockNumber > 0) {
    while (currentBlock.block_number - PROVING_MARGIN < attestBlockNumber + 2) {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      currentBlock = await provider.getBlockLatestAccepted();
    }
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
        payer,
        STRK,
        fromTs.toString(),
        toTs.toString(),
        threshold.toString(),
        challengeHash,
        expiresAt.toString(),
        nonce,
      ],
      invoke_calldata: [
        payer,
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
