/**
 * Environment, resolved once and network-scoped.
 *
 * The failure this guards against is a half-configured network: a mainnet pool address sitting
 * next to a Sepolia prover, which does not error, it just produces proofs the pool rejects for
 * reasons that read like a protocol bug. So the network picks a whole set, and a missing member of
 * that set is a startup failure with the variable named.
 */

export type Network = "mainnet" | "sepolia";

export interface VelumEnv {
  network: Network;
  nodeUrl: string;
  provingServiceUrl: string;
  discoveryUrl: string;
  poolAddress: string;
  /** Only needed for shadow-account reads; Velum's own flow does not use them. */
  shadowAccountAnonymizerAddress?: string;
  /** Empty until the contract is deployed on this network. */
  velumAddress?: string;
}

export interface RelayerEnv {
  address: string;
  privateKey: string;
}

function readNetwork(): Network {
  const raw = process.env.VELUM_NETWORK ?? "mainnet";
  if (raw !== "mainnet" && raw !== "sepolia") {
    throw new Error(`VELUM_NETWORK must be "mainnet" or "sepolia", got "${raw}"`);
  }
  return raw;
}

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set — see .env.example`);
  return value;
}

function optional(name: string): string | undefined {
  return process.env[name] || undefined;
}

let cached: VelumEnv | undefined;

export function env(): VelumEnv {
  if (cached) return cached;

  const network = readNetwork();
  const prefix = network === "mainnet" ? "MAINNET" : "SEPOLIA";

  cached = {
    network,
    nodeUrl: required(`${prefix}_NODE_URL`),
    provingServiceUrl: required(`${prefix}_PROVING_SERVICE_URL`),
    discoveryUrl: required(`${prefix}_DISCOVERY_URL`),
    poolAddress: required(`${prefix}_POOL_ADDRESS`),
    shadowAccountAnonymizerAddress: optional(`${prefix}_SHADOW_ACCOUNT_ANONYMIZER_ADDRESS`),
    velumAddress: optional(`${prefix}_VELUM_ADDRESS`),
  };
  return cached;
}

/**
 * Server-side only. Importing this from a client component is a build error by construction: the
 * variables have no NEXT_PUBLIC_ prefix, so they are `undefined` in the browser and this throws.
 */
export function relayer(): RelayerEnv {
  return {
    address: required("VELUM_RELAYER_ADDRESS"),
    privateKey: required("VELUM_RELAYER_PRIVATE_KEY"),
  };
}

/** The Starknet chain id for the configured network, in the form the prover expects. */
export type ChainId = "0x534e5f4d41494e" | "0x534e5f5345504f4c4941";

export function chainId(network: Network = env().network): ChainId {
  // 'SN_MAIN' / 'SN_SEPOLIA' as short strings.
  return network === "mainnet" ? "0x534e5f4d41494e" : "0x534e5f5345504f4c4941";
}
