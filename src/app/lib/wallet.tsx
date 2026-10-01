"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { supabase } from "./supabase";

// ============================================================
// PHANTOM PROVIDER TYPE (minimal — avoids pulling in a full
// wallet-adapter dependency for a hackathon prototype)
// ============================================================

type PhantomPublicKey = { toString(): string };

interface PhantomProvider {
  isPhantom?: boolean;
  publicKey?: PhantomPublicKey | null;
  isConnected?: boolean;
  connect: (opts?: {
    onlyIfTrusted?: boolean;
  }) => Promise<{ publicKey: PhantomPublicKey }>;
  disconnect: () => Promise<void>;
  on: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener: (
    event: string,
    handler: (...args: unknown[]) => void
  ) => void;
}

declare global {
  interface Window {
    solana?: PhantomProvider;
  }
}

function getProvider(): PhantomProvider | undefined {
  if (typeof window === "undefined") return undefined;
  return window.solana?.isPhantom ? window.solana : undefined;
}

// ============================================================
// SOLANA DEVNET CONNECTION (module-level singleton)
// ============================================================

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
const LAMPORTS_PER_SOL = 1_000_000_000;

// ============================================================
// SUPABASE PROFILE ASSOCIATION
// ============================================================

async function linkWalletToProfile(walletAddress: string) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Not logged into ROT ME — the wallet still works locally, we just
    // don't have anywhere to save the association yet.
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .upsert({ id: user.id, wallet_address: walletAddress }, { onConflict: "id" });

    if (error) {
      console.error("Failed to link wallet to profile:", error);
    }
  } catch (err) {
    console.error("Failed to link wallet to profile:", err);
  }
}

// ============================================================
// CONTEXT
// ============================================================

export type WalletStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "disconnecting"
  | "error";

type WalletContextValue = {
  status: WalletStatus;
  publicKey: string | null;
  balance: number | null;
  balanceLoading: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
};

const WalletContext = createContext<WalletContextValue | null>(null);

export function useWallet(): WalletContextValue {
  const ctx = useContext(WalletContext);
  if (!ctx) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return ctx;
}

// ============================================================
// PROVIDER
// ============================================================

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<WalletStatus>("disconnected");
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Guards against a stale async balance fetch overwriting state after
  // the user has since disconnected or switched accounts.
  const activeAddressRef = useRef<string | null>(null);

  const refreshBalance = useCallback(async (address: string) => {
    activeAddressRef.current = address;
    setBalanceLoading(true);
    try {
      const lamports = await connection.getBalance(new PublicKey(address));
      if (activeAddressRef.current === address) {
        setBalance(lamports / LAMPORTS_PER_SOL);
      }
    } catch (err) {
      console.error("Failed to fetch devnet balance:", err);
      if (activeAddressRef.current === address) {
        setBalance(null);
      }
    } finally {
      if (activeAddressRef.current === address) {
        setBalanceLoading(false);
      }
    }
  }, []);

  const handleConnected = useCallback(
    (address: string) => {
      setPublicKey(address);
      setStatus("connected");
      setError(null);
      refreshBalance(address);
      linkWalletToProfile(address);
    },
    [refreshBalance]
  );

  const clearWallet = useCallback(() => {
    activeAddressRef.current = null;
    setPublicKey(null);
    setBalance(null);
    setBalanceLoading(false);
    setStatus("disconnected");
  }, []);

  const connect = useCallback(async () => {
    const provider = getProvider();
    if (!provider) {
      setStatus("error");
      setError("Phantom wallet not found. Install it from phantom.app.");
      return;
    }

    setStatus("connecting");
    setError(null);
    try {
      const resp = await provider.connect();
      handleConnected(resp.publicKey.toString());
    } catch (err: unknown) {
      console.error("Wallet connect error:", err);
      const code = (err as { code?: number } | null)?.code;
      setStatus("error");
      setError(
        code === 4001
          ? "Connection request was rejected."
          : "Couldn't connect to Phantom. Please try again."
      );
    }
  }, [handleConnected]);

  const disconnect = useCallback(async () => {
    const provider = getProvider();
    setStatus("disconnecting");
    try {
      if (provider) await provider.disconnect();
    } catch (err) {
      console.error("Wallet disconnect error:", err);
    } finally {
      clearWallet();
    }
  }, [clearWallet]);

  // Eager (silent) reconnect + account/disconnect event listeners.
  useEffect(() => {
    const provider = getProvider();
    if (!provider) return;

    provider
      .connect({ onlyIfTrusted: true })
      .then((resp) => handleConnected(resp.publicKey.toString()))
      .catch(() => {
        // No previously-trusted connection for this site — normal, stay
        // disconnected rather than surfacing this as an error.
      });

    function onAccountChanged(...args: unknown[]) {
      const next = args[0] as PhantomPublicKey | null | undefined;
      if (!next) {
        clearWallet();
        return;
      }
      handleConnected(next.toString());
    }

    function onDisconnect() {
      clearWallet();
    }

    provider.on("accountChanged", onAccountChanged);
    provider.on("disconnect", onDisconnect);

    return () => {
      provider.removeListener("accountChanged", onAccountChanged);
      provider.removeListener("disconnect", onDisconnect);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <WalletContext.Provider
      value={{
        status,
        publicKey,
        balance,
        balanceLoading,
        error,
        connect,
        disconnect,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}