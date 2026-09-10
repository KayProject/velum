"use client";

import { useWallet } from "@/lib/velum/wallet";
import { WarningCircle } from "@phosphor-icons/react";

function short(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Real wallet connect/disconnect. Whatever page renders this gets an actual signer — nothing
 * downstream of a connected state here is simulated.
 */
export function WalletButton({ wallet }: { wallet: ReturnType<typeof useWallet> }) {
  const { address, connecting, error, connect, disconnect } = wallet;

  if (address) {
    return (
      <button
        type="button"
        onClick={disconnect}
        className="flex items-center gap-2 rounded-lg border border-[#bfdbfe] bg-[#eff6ff] px-3 py-1.5 font-mono text-xs font-semibold text-[#1d4ed8] hover:bg-[#dbeafe]"
        title="Click to disconnect"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
        {short(address)}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {error && (
        <span className="hidden sm:inline-flex items-center gap-1 font-mono text-[10px] text-[#991b1b]">
          <WarningCircle size={12} weight="bold" /> {error}
        </span>
      )}
      <button
        type="button"
        onClick={connect}
        disabled={connecting}
        className="rounded-lg bg-[#111827] px-3.5 py-1.5 font-mono text-xs font-bold text-white hover:bg-[#1f2937] disabled:opacity-60"
      >
        {connecting ? "Connecting..." : "Connect Wallet"}
      </button>
    </div>
  );
}
