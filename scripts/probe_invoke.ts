import { Account, RpcProvider, num } from "starknet";
import { env } from "../lib/env.ts";
import { computeRecipientTag, computeChallengeHash } from "../lib/velum/hashes.ts";

const STRK = "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d";
const config = env();
const provider = new RpcProvider({ nodeUrl: config.nodeUrl });
const address = process.env.VELUM_ACCOUNT_ADDRESS!;
const privateKey = process.env.VELUM_ACCOUNT_PRIVATE_KEY!;
const velumAddress = process.env.MAINNET_VELUM_ADDRESS!;
const account = new Account({ provider, address, signer: privateKey, cairoVersion: "1" });

async function main() {
  const channelKey = num.toHex(BigInt(Date.now()) * 1000003n + 7n);
  const recipientTag = num.toHex(computeRecipientTag(channelKey));
  const attestAmount = 1n; // 1 wei of STRK — nearly free public attest, just to get a real record

  console.log(`attesting tiny amount to recipient_tag ${recipientTag}`);
  const attestCall = await account.execute({
    contractAddress: velumAddress,
    entrypoint: "attest",
    calldata: [recipientTag, STRK, attestAmount.toString()],
  });
  console.log(`  ${attestCall.transaction_hash}`);
  const receipt = await provider.waitForTransaction(attestCall.transaction_hash);
  console.log("  confirmed");
  const blockNumber = (receipt as { block_number: number }).block_number;
  const attestedAt = (await provider.getBlockWithTxHashes(blockNumber)).timestamp;

  const identity_key = "0x1";
  const threshold = "1";
  const challenge_hash = num.toHex(computeChallengeHash("0x99"));
  const from_ts = "0";
  const to_ts = String(attestedAt + 3600);
  const expires_at = String(Math.floor(Date.now() / 1000) + 1000);
  const nonce = num.toHex(BigInt(Date.now()));

  console.log("\ncalling privacy_compute directly (real attestation, should pass threshold)...");
  const computeResult = await provider.callContract({
    contractAddress: velumAddress,
    entrypoint: "privacy_compute",
    calldata: [identity_key, channelKey, address, STRK, from_ts, to_ts, threshold, challenge_hash, expires_at, nonce],
  });
  console.log("compute_result:", computeResult);

  console.log("\ncalling privacy_invoke_with_computation directly (expect UNAUTHORIZED_CALLER if calldata decodes)...");
  try {
    const invokeResult = await provider.callContract({
      contractAddress: velumAddress,
      entrypoint: "privacy_invoke_with_computation",
      calldata: [...computeResult, address, STRK, from_ts, to_ts, threshold, challenge_hash, expires_at],
    });
    console.log("invoke result (unexpected success):", invokeResult);
  } catch (e) {
    console.log("invoke call result:", e instanceof Error ? e.message : e);
  }
}

main();
