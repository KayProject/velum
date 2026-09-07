/**
 * Declare + deploy the Velum contract, bypassing sncast.
 *
 * sncast's declare/deploy always probe the RPC with a "pre_confirmed"/"pending" block_id as part
 * of its own version-compatibility check, and the RPC backend
 * answers neither tag (only "latest") — every sncast declare attempt fails with "Invalid block id"
 * regardless of explicit --nonce/--l1-gas/etc overrides. starknet.js's `blockIdentifier: "latest"`
 * routes every internal call (nonce fetch, fee estimation) through the one tag this RPC actually
 * supports.
 *
 *   node --experimental-strip-types --env-file=../.env.local scripts/deploy.mjs
 *
 * Run from contracts/. Reads the same VELUM_ACCOUNT_* vars shield.ts uses.
 */

import { Account, RpcProvider, json } from "starknet";
import { readFileSync } from "node:fs";

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set`);
  return value;
}

async function main() {
  const nodeUrl = required("MAINNET_NODE_URL");
  const address = required("VELUM_ACCOUNT_ADDRESS");
  const privateKey = required("VELUM_ACCOUNT_PRIVATE_KEY");
  const poolAddress = required("MAINNET_POOL_ADDRESS");

  const provider = new RpcProvider({ nodeUrl });
  const account = new Account({ provider, address, signer: privateKey, cairoVersion: "1" });

  const sierra = json.parse(
    readFileSync(new URL("../target/dev/velum_Velum.contract_class.json", import.meta.url), "utf8")
  );
  const casm = json.parse(
    readFileSync(
      new URL("../target/dev/velum_Velum.compiled_contract_class.json", import.meta.url),
      "utf8"
    )
  );

  console.log(`account   ${address}`);
  console.log(`pool      ${poolAddress}`);
  console.log("\ndeclaring + deploying Velum (UDC) — routed through 'latest' block, not pending");

  const result = await account.declareAndDeploy(
    { contract: sierra, casm, constructorCalldata: [poolAddress] },
    { blockIdentifier: "latest" }
  );

  console.log(`\nclass hash:       ${result.declare.class_hash}`);
  console.log(`declare tx:       ${result.declare.transaction_hash}`);
  console.log(`contract address: ${result.deploy.contract_address}`);
  console.log(`deploy tx:        ${result.deploy.transaction_hash}`);
  console.log(`\nhttps://voyager.online/contract/${result.deploy.contract_address}`);
}

main().catch((error) => {
  console.error(`\nfailed: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
