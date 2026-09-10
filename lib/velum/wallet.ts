"use client";

/**
 * Real browser wallet connection (Argent X, Braavos, or any injected get-starknet-compatible
 * wallet) — replaces the fake "no wallet" builder forms with an actual signer.
 *
 * `WalletAccount` (starknet.js) wraps the raw injected wallet object into a full `AccountInterface`
 * usable anywhere a starknet.js `Account` is: `Contract.connect()`, `account.execute()`, etc. It's
 * the officially supported bridge between get-starknet's wallet handshake and starknet.js.
 */

import { useCallback, useEffect, useState } from "react";
import { WalletAccount } from "starknet";
import { getStarknet } from "@starknet-io/get-starknet-core";
import { readProvider } from "./contract";

export interface WalletState {
  account: WalletAccount | null;
  address: string | null;
  connecting: boolean;
  error: string | null;
}

const LAST_WALLET_KEY = "velum_last_wallet_id";

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    account: null,
    address: null,
    connecting: false,
    error: null,
  });

  const connect = useCallback(async () => {
    setState((s) => ({ ...s, connecting: true, error: null }));
    try {
      const starknet = getStarknet();
      const wallets = await starknet.getAvailableWallets();
      if (wallets.length === 0) {
        throw new Error(
          "No Starknet wallet found. Install Argent X or Braavos as a browser extension, then reload."
        );
      }
      // If more than one wallet extension is installed, take the first — a picker UI is future
      // work, not something to fake with a dropdown of names we can't actually distinguish yet.
      const chosen = wallets[0];
      const account = await WalletAccount.connect(readProvider(), chosen);
      try {
        window.localStorage.setItem(LAST_WALLET_KEY, chosen.id);
      } catch {
        // best-effort only
      }
      setState({ account, address: account.address, connecting: false, error: null });
    } catch (err) {
      setState({
        account: null,
        address: null,
        connecting: false,
        error: err instanceof Error ? err.message : "Failed to connect wallet.",
      });
    }
  }, []);

  const disconnect = useCallback(async () => {
    try {
      await getStarknet().disconnect({ clearLastWallet: true });
    } catch {
      // best-effort only
    }
    setState({ account: null, address: null, connecting: false, error: null });
  }, []);

  // Silently reconnect to a previously-authorized wallet on page load, so a refresh doesn't drop
  // the session — but never prompt; only reconnect if the wallet already granted access.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const starknet = getStarknet();
        const last = await starknet.getLastConnectedWallet();
        if (!last || cancelled) return;
        const account = await WalletAccount.connect(readProvider(), last, undefined, undefined, true);
        if (!cancelled) {
          setState({ account, address: account.address, connecting: false, error: null });
        }
      } catch {
        // no prior session, or the wallet no longer authorizes silent reconnect — fine, stay
        // disconnected until the user clicks Connect.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { ...state, connect, disconnect };
}
