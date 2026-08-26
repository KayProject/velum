/**
 * Shield STRK into the STRK20 privacy pool.
 *
 *   node --experimental-strip-types --env-file=.env.local scripts/shield.ts 20
 *
 * There is no button for this anywhere. `strk20.starknet.io/app` has a shield control whose wallet
 * integration was stripped out (`app-shield.jsx:105-107`), and no mainnet wallet implements the
 * STRK20 wallet API — Braavos answers `Not implemented` to every STRK20 method. So the only way to
 * get a shielded balance is to drive the SDK yourself, which is what this does.
 *
 * Your private key is read from `.env.local`, which is gitignored. It is never a command-line
 * argument, because arguments land in your shell history and in `ps` output.
 */

import { Account, RpcProvider } from "starknet";
import { deriveViewingKey } from "@starkware-libs/starknet-privacy-client";

import { env } from "../lib/env.ts";
import { poolClient } from "../lib/pool/client.ts";

/** STRK on Starknet mainnet. Also the token the pool charges its protocol fee in. */
const STRK = "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d";

const DECIMALS = 18n;

/** "1.5" -> 1500000000000000000n. Decimal string in, wei out, no floating point anywhere. */
function toWei(amount: string): bigint {
  const [whole, fraction = ""] = amount.trim().split(".");
  if (!/^\d+$/.test(whole) || (fraction && !/^\d+$/.test(fraction))) {
    throw new Error(`not a decimal amount: "${amount}"`);
  }
  if (BigInt(fraction.length) > DECIMALS) {
    throw new Error(`more than ${DECIMALS} decimal places: "${amount}"`);
  }
  return BigInt(whole + fraction.padEnd(Number(DECIMALS), "0"));
}

function fromWei(wei: bigint): string {
  const whole = wei / 10n ** DECIMALS;
  const fraction = (wei % 10n ** DECIMALS).toString().padStart(Number(DECIMALS), "0");
  return `${whole}.${fraction.slice(0, 4)}`;
}

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set — see docs/SHIELDING.md`);
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
  const amountArg = process.argv[2];
  if (!amountArg) {
    console.error("usage: shield.ts <amount-in-STRK>   e.g. shield.ts 20");
    process.exit(2);
  }

  const config = env();
  const depositAmount = toWei(amountArg);

  const address = required("VELUM_ACCOUNT_ADDRESS");
  const privateKey = required("VELUM_ACCOUNT_PRIVATE_KEY");
  const passphrase = required("VELUM_PASSPHRASE");

  const provider = new RpcProvider({ nodeUrl: config.nodeUrl });
  const account = new Account({ provider, address, signer: privateKey, cairoVersion: "1" });

  console.log(`network         ${config.network}`);
  console.log(`account         ${address}`);
  console.log(`pool            ${config.poolAddress}`);
  console.log(`depositing      ${fromWei(depositAmount)} STRK`);

  // The pool's apply_actions calls collect_fee(), which pulls fee_amount STRK from whoever sent the
  // transaction — you. That is on top of the deposit, and it is the single most common reason a
  // first shield reverts: the allowance covered the deposit but not the fee.
  const feeAmount = await callFelt(provider, config.poolAddress, "get_fee_amount");
  console.log(`protocol fee    ${fromWei(feeAmount)} STRK`);

  const balance = await callFelt(provider, STRK, "balance_of", [address]);
  console.log(`your balance    ${fromWei(balance)} STRK`);

  // Gas is paid in STRK too, so leave headroom beyond deposit + fee rather than checking for exactly
  // enough and reverting at estimate time.
  const needed = depositAmount + feeAmount;
  if (balance < needed) {
    throw new Error(
      `short by ${fromWei(needed - balance)} STRK — you need ${fromWei(needed)} plus gas`
    );
  }

  const allowance = depositAmount + feeAmount;
  console.log(`\napproving ${fromWei(allowance)} STRK to the pool (deposit + fee)`);
  const approve = await account.execute({
    contractAddress: STRK,
    entrypoint: "approve",
    calldata: [config.poolAddress, allowance.toString(), "0"],
  });
  console.log(`  ${approve.transaction_hash}`);
  await provider.waitForTransaction(approve.transaction_hash);
  console.log("  confirmed");

  // The viewing key is derived from your passphrase, salted with your account address. Same
  // passphrase + same account = same key, forever. Lose the passphrase and the notes are still
  // yours on chain but you can no longer decrypt them.
  const viewingKey = deriveViewingKey(passphrase, address);

  const transfers = poolClient({
    account,
    viewingKey: { getViewingKey: async () => viewingKey },
  });

  console.log("\nproving and submitting — this takes around 30 seconds, it has not hung");
  const result = await transfers
    .build({
      autoRegister: true,
      autoSetup: true,
      autoDiscover: { notes: "refresh", channels: "refresh" },
      autoSelectNotes: "naive",
    })
    .surplusTo(address)
    .with(STRK, (token) => token.deposit({ amount: depositAmount, recipient: address }))
    .execute();

  const hash = (result as { transaction_hash?: string }).transaction_hash;
  console.log(`\nshielded. transaction: ${hash}`);
  console.log(`https://voyager.online/tx/${hash}`);
  console.log("\nThis hash touches the pool, so it counts as one of the three that strk20.json needs.");
}

main().catch((error) => {
  console.error(`\nfailed: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
