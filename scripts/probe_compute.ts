import { RpcProvider, num } from "starknet";
import { env } from "../lib/env.ts";

const config = env();
const provider = new RpcProvider({ nodeUrl: config.nodeUrl });
const velumAddress = process.env.MAINNET_VELUM_ADDRESS!;

async function callFeltArray(contractAddress: string, entrypoint: string, calldata: string[]) {
  return provider.callContract({ contractAddress, entrypoint, calldata });
}

async function main() {
  // arbitrary probe values — privacy_compute has NO caller check, so this is a free read-only call
  const identity_key = "0x1";
  const channel_key = "0x2";
  const payer = "0x07a92ded878f2d353a2155099df9838860ac00605153a1f4b58debf5b8e9d005";
  const STRK = "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d";
  const from_ts = "0";
  const to_ts = String(Math.floor(Date.now() / 1000));
  const threshold = "1"; // low bar, just to see if we get past BELOW_THRESHOLD
  const challenge_hash = "0x3";
  const expires_at = String(Math.floor(Date.now() / 1000) + 1000);
  const nonce = "0x4";

  console.log("calling privacy_compute directly (read-only, no caller check)...");
  try {
    const result = await callFeltArray(velumAddress, "privacy_compute", [
      identity_key, channel_key, payer, STRK, from_ts, to_ts, threshold, challenge_hash, expires_at, nonce,
    ]);
    console.log("compute_result raw felts:", result);
    console.log("count:", result.length);

    // now feed compute_result ++ invoke_additional_data into privacy_invoke_with_computation
    // this WILL fail UNAUTHORIZED_CALLER since we're not the pool -- but that tells us if we get
    // PAST calldata decoding (a different, named error) vs before it (generic deserialize failure)
    const invoke_additional_data = [payer, STRK, from_ts, to_ts, threshold, challenge_hash, expires_at];
    console.log("\ncalling privacy_invoke_with_computation directly (expect UNAUTHORIZED_CALLER)...");
    try {
      const invokeResult = await callFeltArray(velumAddress, "privacy_invoke_with_computation", [
        ...result, ...invoke_additional_data,
      ]);
      console.log("invoke result:", invokeResult);
    } catch (e) {
      console.log("invoke call failed (expected):", e instanceof Error ? e.message : e);
    }
  } catch (e) {
    console.log("compute call failed:", e instanceof Error ? e.message : e);
  }
}

main();
