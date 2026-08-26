/**
 * Wiring to the STRK20 privacy pool.
 *
 * Velum never holds funds and never touches shadow accounts. All it needs from the SDK is the
 * ability to build a proven transaction whose last action is a ComputeAndInvoke against the Velum
 * contract. That means: a proving provider, a discovery provider, the pool address, and a viewing
 * key that stays on the earner's side.
 */

import { createPrivateTransfers } from "@starkware-libs/starknet-privacy-sdk";
import type {
  PrivateTransfersInterface,
  PrivateTransfersUser,
} from "@starkware-libs/starknet-privacy-sdk";
import { RpcProvider } from "starknet";

import { chainId, env } from "../env";

/**
 * The earner's viewing key. Held in memory for the life of one page, never written to
 * localStorage: on mainnet a leaked viewing key hands over the ability to decrypt every note the
 * earner has ever received, which is exactly the disclosure Velum exists to avoid.
 */
export interface ViewingKeySource {
  getViewingKey(): Promise<string>;
}

export interface PoolClientParams {
  /** Anything with `{ address, signer }` — a full starknet.js `Account` fits structurally. */
  account: PrivateTransfersUser;
  viewingKey: ViewingKeySource;
  /** Override for tests and for the local TLS proxy. */
  nodeUrl?: string;
}

/** A read-only provider pointed at the configured node. */
export function nodeProvider(nodeUrl = env().nodeUrl): RpcProvider {
  return new RpcProvider({ nodeUrl });
}

/**
 * Build a pool client from the environment.
 *
 * Every `execute()` on the returned object proves, including a plain deposit — there is no
 * unproven fast path. Budget roughly 30 seconds per private transaction and put a progress state
 * in front of it, because a silent 30-second wait reads as a hang.
 */
export function poolClient(params: PoolClientParams): PrivateTransfersInterface {
  const config = env();

  return createPrivateTransfers({
    account: params.account,
    viewingKeyProvider: { getViewingKey: () => params.viewingKey.getViewingKey() },
    provingProvider: {
      url: config.provingServiceUrl,
      chainId: chainId(config.network),
      nodeUrl: params.nodeUrl ?? config.nodeUrl,
    },
    discoveryProvider: { url: config.discoveryUrl },
    poolContractAddress: config.poolAddress,
    shadowAccountAnonymizerAddress: config.shadowAccountAnonymizerAddress,
  });
}

/**
 * The Velum contract address on the configured network, or a named failure.
 *
 * Kept separate from `env()` so a missing deployment surfaces at the call site that needs it,
 * rather than blocking the whole app from starting before anything is deployed.
 */
export function velumAddress(): string {
  const { velumAddress: address, network } = env();
  if (!address) {
    throw new Error(
      `Velum is not deployed on ${network} yet — set ${
        network === "mainnet" ? "MAINNET" : "SEPOLIA"
      }_VELUM_ADDRESS`
    );
  }
  return address;
}

/**
 * Is the discovery service reachable and near the chain head?
 *
 * Worth calling before a claim: discovery lag means the earner's own notes may not be visible yet,
 * and the claim fails at proving time with an error that does not say so.
 */
export async function discoveryHealth(): Promise<{
  ok: boolean;
  head?: number;
  lagSeconds?: number;
}> {
  try {
    const response = await fetch(new URL("/health", env().discoveryUrl));
    if (!response.ok) return { ok: false };
    const body = (await response.json()) as {
      status?: string;
      head?: number;
      lag_secs?: number;
    };
    return { ok: body.status === "OK", head: body.head, lagSeconds: body.lag_secs };
  } catch {
    return { ok: false };
  }
}
