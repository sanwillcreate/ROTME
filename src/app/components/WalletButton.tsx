"use client";

import { useWallet } from "../lib/wallet";

function shortenAddress(address: string): string {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

export default function WalletButton() {
  const { status, publicKey, balance, balanceLoading, error, connect, disconnect } =
    useWallet();

  if (status === "connected" && publicKey) {
    return (
      <div className="flex items-center gap-3">
        <div className="text-right leading-tight">
          <div className="text-[10px] uppercase tracking-wide text-neutral-500">
            Wallet
          </div>
          <div className="text-sm font-medium text-neutral-100">
            {shortenAddress(publicKey)}
          </div>
          <div className="text-xs text-neutral-500">
            {balanceLoading
              ? "Loading balance..."
              : balance !== null
              ? `${balance.toFixed(3)} SOL`
              : "Balance unavailable"}
          </div>
        </div>
        <button
          onClick={disconnect}
          disabled={status !== "connected"}
          className="text-sm font-medium rounded-lg border border-white/15 px-3 py-2 text-neutral-200 hover:bg-white/5 transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={connect}
        disabled={status === "connecting" || status === "disconnecting"}
        className="text-sm font-medium bg-neutral-50 text-neutral-950 rounded-lg px-4 py-2 hover:bg-neutral-200 transition-colors disabled:opacity-60"
      >
        {status === "connecting" ? "Connecting..." : "Connect Wallet"}
      </button>
      {error && (
        <span className="max-w-[220px] text-right text-[11px] text-red-400">
          {error}
        </span>
      )}
    </div>
  );
}