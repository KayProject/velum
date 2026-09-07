/**
 * Redeem (withdraw) STRK back out of the STRK20 privacy pool, to a public address.
 *
 *   node --experimental-strip-types --env-file=.env.local scripts/redeem.ts 1
 *
 * Every pool operation — shield or redeem — pays the same flat protocol fee (6 STRK on this
 * deployment, `get_fee_amount()`), reimbursed to the AVNU paymaster via a private withdraw folded
 * into the same proof (see scripts/shield.ts's header for why a plain `account.execute()` can't
 * submit this at all). That fee floor applies regardless of how much is being redeemed, so a
 * redeem below the pool's *existing* private balance would go negative unless it's topped up.
 * Rather than track exact existing balance (a discovery-service round trip this script skips),
 * this always folds in a top-up deposit sized to cover the redeem + fee outright — the existing
 * private balance (if any) just becomes bonus surplus.
 *
 * Your private key is read from `.env.local`, which is gitignored. It is never a command-line
 * argument, because arguments land in your shell history and in `ps` output.
 */

import { Account, RpcProvider, constants } from "starknet";
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

/** STRK on Starknet mainnet. Also the token the pool charges its protocol fee in. */
const STRK = "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d";

const DECIMALS = 18n;

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
    console.error("usage: redeem.ts <amount-in-STRK>   e.g. redeem.ts 1");
    process.exit(2);
  }

  const config = env();
  const redeemAmount = toWei(amountArg);

  const address = required("VELUM_ACCOUNT_ADDRESS");
  const privateKey = required("VELUM_ACCOUNT_PRIVATE_KEY");
  const passphrase = required("VELUM_PASSPHRASE");
  const paymasterUrl = required("AVNU_PAYMASTER_URL");
  const paymasterApiKey = required("AVNU_PAYMASTER_API_KEY");

  const provider = new RpcProvider({ nodeUrl: config.nodeUrl });
  const account = new Account({ provider, address, signer: privateKey, cairoVersion: "1" });

  console.log(`network         ${config.network}`);
  console.log(`account         ${address}`);
  console.log(`pool            ${config.poolAddress}`);
  console.log(`redeeming       ${fromWei(redeemAmount)} STRK to self`);

  const feeAmount = await callFelt(provider, config.poolAddress, "get_fee_amount");
  console.log(`protocol fee    ${fromWei(feeAmount)} STRK (paid privately, folded into the proof)`);

  // Every client transaction needs at least one WriteOnce action for replay protection
  // (`privacy.cairo:267-309`) — netting exactly to zero here produces none (no note is
  // created, nothing is set up), and the tx reverts NO_REPLAY_PROTECTION. Leaving a small
  // positive surplus makes the compiler auto-create a change note (a WriteOnce), on top of
  // making this transaction self-sufficient regardless of whatever's already privately shielded.
  const surplusBuffer = toWei("0.01");
  const topUpAmount = redeemAmount + feeAmount + surplusBuffer;

  const balance = await callFelt(provider, STRK, "balance_of", [address]);
  console.log(`your balance    ${fromWei(balance)} STRK`);
  if (balance < topUpAmount) {
    throw new Error(`short by ${fromWei(topUpAmount - balance)} STRK — you need ${fromWei(topUpAmount)}`);
  }

  const currentBlock = await provider.getBlockLatestAccepted();
  const provingBlock = { block_number: currentBlock.block_number - 10 };

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

  console.log(`\ntopping up ${fromWei(topUpAmount)} STRK (redeem + fee + surplus buffer) and redeeming in one proof`);
  console.log("proving and submitting via the AVNU paymaster — this takes around 30 seconds, it has not hung");
  const { transaction_hash } = await wallet.strk20InvokeTransaction([
    { type: "deposit", token: STRK, amount: topUpAmount.toString() },
    { type: "withdraw", token: STRK, amount: redeemAmount.toString(), recipient: address },
  ]);

  console.log(`\nredeemed. transaction: ${transaction_hash}`);
  console.log(`https://voyager.online/tx/${transaction_hash}`);
  console.log("\nThis hash touches the pool, so it counts as one of the three that strk20.json needs.");
}

main().catch((error) => {
  console.error(`\nfailed: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
