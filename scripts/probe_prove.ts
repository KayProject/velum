import { Account, RpcProvider, constants, num } from "starknet";
import {
  createEmptyRegistry,
  IndexerDiscoveryProvider,
  ProvingServiceProofProvider,
} from "@starkware-libs/starknet-privacy-sdk";
import { CorePrivateTransfersProver } from "@starkware-libs/starknet-privacy-client";
import { env } from "../lib/env.ts";
import { computeChallengeHash, computeRecipientTag } from "../lib/velum/hashes.ts";

const STRK = "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d";
const config = env();
const address = process.env.VELUM_ACCOUNT_ADDRESS!;
const privateKey = process.env.VELUM_ACCOUNT_PRIVATE_KEY!;
const passphrase = process.env.VELUM_PASSPHRASE!;
const velumAddress = process.env.MAINNET_VELUM_ADDRESS!;
const provider = new RpcProvider({ nodeUrl: config.nodeUrl });
const account = new Account({ provider, address, signer: privateKey, cairoVersion: "1" });

async function main() {
  const channelKey = num.toHex(BigInt(Date.now()) * 1000003n + 7n);
  const recipientTag = num.toHex(computeRecipientTag(channelKey));
  const threshold = "1";
  const challengeHash = num.toHex(computeChallengeHash("0xabc"));
  const expiresAt = String(Math.floor(Date.now() / 1000) + 1000);
  const fromTs = "0";
  const nonce = num.toHex(BigInt(Date.now()));

  console.log(`attesting tiny amount to recipient_tag ${recipientTag}`);
  const attestCall = await account.execute({
    contractAddress: velumAddress,
    entrypoint: "attest",
    calldata: [recipientTag, STRK, "1"],
  });
  console.log(`  ${attestCall.transaction_hash}`);
  const attestReceipt = await provider.waitForTransaction(attestCall.transaction_hash);
  console.log("  confirmed");
  const attestBlockNumber = (attestReceipt as { block_number: number }).block_number;
  const attestedAt = (await provider.getBlockWithTxHashes(attestBlockNumber)).timestamp;
  const toTs = String(attestedAt + 3600);

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

  const feeAmount = await provider.callContract({
    contractAddress: config.poolAddress,
    entrypoint: "get_fee_amount",
  }).then((r) => BigInt(r[0]));
  console.log(`\nprotocol fee ${feeAmount}`);
  // Replicate strk20InvokeTransaction's REAL shape: a user withdraw sized balance-minus-fee, plus a
  // second, separate fee withdraw to a different recipient (the paymaster, in the real flow) —
  // instead of this probe's earlier single merged withdraw, to see if the split itself is the trigger.
  // Real 6.0 STRK fee exceeds current 5.0 STRK balance, so this uses an arbitrary in-budget split
  // (3.0 + 2.0 = 5.0) purely to test whether splitting the withdraw around compute_and_invoke, by
  // itself, is what triggers the bug — not to match the real fee amount.
  const currentPrivateBalance = BigInt("5000000000000000000"); // 5.0 STRK, inferred from prior surplus error
  const claimWithdrawAmount = BigInt("3000000000000000000");
  const secondWithdrawAmount = currentPrivateBalance - claimWithdrawAmount;

  const actions = [
    { type: "withdraw" as const, token: STRK, amount: claimWithdrawAmount.toString(), recipient: address },
    {
      type: "compute_and_invoke" as const,
      contract: velumAddress,
      compute_calldata: [channelKey, address, STRK, fromTs, toTs, threshold, challengeHash, expiresAt, nonce],
      invoke_calldata: [address, STRK, fromTs, toTs, threshold, challengeHash, expiresAt],
    },
    { type: "withdraw" as const, token: STRK, amount: secondWithdrawAmount.toString(), recipient: address },
  ];

  console.log("proving (simulate=true, no broadcast, no cost)...");
  const { call } = await prover.prove(actions, true);
  console.log("\napply_actions call:");
  console.log(JSON.stringify(call, (_, v) => typeof v === "bigint" ? v.toString() : v, 2));
}

main().catch((e) => console.error("failed:", e instanceof Error ? e.message : e));
