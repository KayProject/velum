/**
 * Browser-side wiring to the real, deployed Velum contract.
 *
 * Everything here is read/write against mainnet (or sepolia) directly from the browser: no local
 * proxy, no server round trip. That only works because `attest`, `verify`, `read_claim` and
 * `redeem` are plain public Starknet calls — none of them touch the STRK20 privacy pool's proving
 * pipeline, which is the part that still needs a Node process (see scripts/claim.ts).
 *
 * Only NEXT_PUBLIC_-prefixed env vars are readable here — see .env.example's own warning about
 * never putting a signing key behind that prefix.
 */

import { Contract, RpcProvider, type AccountInterface, type ProviderInterface } from "starknet";

export type Network = "mainnet" | "sepolia";

const DEFAULT_NODE_URL: Record<Network, string> = {
  mainnet: "https://api.cartridge.gg/x/starknet/mainnet",
  sepolia: "https://api.cartridge.gg/x/starknet/sepolia",
};

/** STRK on Starknet — the only token this deployment's demo flows use. */
export const STRK_ADDRESS =
  "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d";

export function network(): Network {
  const raw = process.env.NEXT_PUBLIC_VELUM_NETWORK ?? "mainnet";
  return raw === "sepolia" ? "sepolia" : "mainnet";
}

export function nodeUrl(): string {
  const net = network();
  const envKey = net === "mainnet" ? "NEXT_PUBLIC_MAINNET_NODE_URL" : "NEXT_PUBLIC_SEPOLIA_NODE_URL";
  return process.env[envKey] || DEFAULT_NODE_URL[net];
}

export function velumAddress(): string {
  const address = process.env.NEXT_PUBLIC_VELUM_ADDRESS;
  if (!address) {
    throw new Error(
      "NEXT_PUBLIC_VELUM_ADDRESS is not set — Velum is not configured for this network yet."
    );
  }
  return address;
}

let cachedProvider: RpcProvider | undefined;

/** A read-only provider hitting the public RPC directly — safe to call from any browser. */
export function readProvider(): RpcProvider {
  if (!cachedProvider) {
    cachedProvider = new RpcProvider({ nodeUrl: nodeUrl() });
  }
  return cachedProvider;
}

let cachedAbi: Awaited<ReturnType<RpcProvider["getClassAt"]>>["abi"] | undefined;

/**
 * Fetches the deployed contract's own ABI (rather than shipping a hand-copied one) so a future
 * redeploy at the same address can never silently drift out of sync with the frontend.
 */
async function velumAbi() {
  if (cachedAbi) return cachedAbi;
  const provider = readProvider();
  const classAt = await provider.getClassAt(velumAddress());
  cachedAbi = classAt.abi;
  return cachedAbi;
}

/**
 * A `Contract` bound to the real deployed Velum contract. Pass a connected wallet account to
 * sign and submit; omit it (or pass a provider) for read-only calls.
 */
export async function velumContract(
  signerOrProvider?: AccountInterface | ProviderInterface
): Promise<Contract> {
  const abi = await velumAbi();
  return new Contract({ abi, address: velumAddress(), providerOrAccount: signerOrProvider ?? readProvider() });
}

const STRK_DECIMALS = 18n;

/** Decimal STRK amount ("10.5") -> raw u128 wei, the unit `attest`/`privacy_compute` deal in. */
export function toWeiStrk(amount: string): bigint {
  const trimmed = amount.trim();
  const [whole, fraction = ""] = trimmed.split(".");
  if (!/^\d+$/.test(whole) || (fraction && !/^\d+$/.test(fraction))) {
    throw new Error(`Not a plain decimal STRK amount: "${amount}"`);
  }
  if (BigInt(fraction.length) > STRK_DECIMALS) {
    throw new Error(`More than ${STRK_DECIMALS} decimal places: "${amount}"`);
  }
  return BigInt(whole + fraction.padEnd(Number(STRK_DECIMALS), "0"));
}

/** Raw u128 wei -> a readable decimal STRK string, trimmed to 4 fractional digits. */
export function fromWeiStrk(wei: bigint | string | number): string {
  const value = BigInt(wei);
  const whole = value / 10n ** STRK_DECIMALS;
  const fraction = (value % 10n ** STRK_DECIMALS).toString().padStart(Number(STRK_DECIMALS), "0");
  const trimmedFraction = fraction.slice(0, 4).replace(/0+$/, "");
  return trimmedFraction ? `${whole}.${trimmedFraction}` : whole.toString();
}

export function explorerTxUrl(hash: string): string {
  return `https://voyager.online/tx/${hash}`;
}

export function explorerAddressUrl(address: string): string {
  return `https://voyager.online/contract/${address}`;
}

/** Cairo's `ClaimStatus` enum, decoded from what starknet.js's `Contract` returns for it. */
export type ClaimStatus = "Unknown" | "WrongVerifier" | "Expired" | "Spent" | "Valid";

export function decodeClaimStatus(raw: unknown): ClaimStatus {
  // starknet.js decodes a Cairo enum into a `CairoCustomEnum` instance — `.activeVariant()` is the
  // authoritative accessor. Fall back to a plain string or a `{ VariantName: ... }` object only for
  // ABI/parser shapes that don't go through that class.
  if (raw && typeof raw === "object" && typeof (raw as { activeVariant?: unknown }).activeVariant === "function") {
    return (raw as { activeVariant: () => string }).activeVariant() as ClaimStatus;
  }
  if (typeof raw === "string") return raw as ClaimStatus;
  if (raw && typeof raw === "object") {
    const keys = Object.keys(raw as Record<string, unknown>);
    if (keys.length > 0) return keys[0] as ClaimStatus;
  }
  return "Unknown";
}
