"use client";

import { useEffect, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { useWallet } from "../lib/wallet";
import { supabase } from "../lib/supabase";

function shortenAddress(address: string): string {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

type ProfileStats = {
  walletAddress: string | null;
  memeTaste: number;
  campaignsParticipated: number;
  memesSubmitted: number;
};

async function loadProfileStats(userId: string): Promise<ProfileStats> {
  const [profileRes, memeTasteRes, picksRes, submissionsRes] = await Promise.all([
    supabase.from("profiles").select("wallet_address").eq("id", userId).maybeSingle(),
    supabase
      .from("memetaste_profiles")
      .select("score")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase.from("picks").select("campaign_id").eq("user_id", userId),
    supabase
      .from("submissions")
      .select("id", { count: "exact", head: true })
      .eq("creator_id", userId),
  ]);

  if (profileRes.error) console.error("Failed to load profile:", profileRes.error);
  if (memeTasteRes.error)
    console.error("Failed to load MemeTaste score:", memeTasteRes.error);
  if (picksRes.error) console.error("Failed to load picks:", picksRes.error);
  if (submissionsRes.error)
    console.error("Failed to load submissions:", submissionsRes.error);

  // Distinct campaigns participated in — computed client-side since a
  // "count distinct column" isn't directly expressible via the query
  // builder. picksRes.data is every pick row (campaign_id, one per pick)
  // for this user; a Set collapses repeats down to unique campaigns.
  const distinctCampaigns = new Set(
    (picksRes.data ?? []).map((p: { campaign_id: string }) => p.campaign_id)
  ).size;

  return {
    walletAddress: profileRes.data?.wallet_address ?? null,
    memeTaste: memeTasteRes.data?.score ?? 0,
    campaignsParticipated: distinctCampaigns,
    memesSubmitted: submissionsRes.count ?? 0,
  };
}

// ============================================================
// SIGN-IN PROMPT (reuses the same Supabase magic-link mechanism
// used elsewhere in the app — not a second auth system)
// ============================================================

function SignInPrompt() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignIn() {
    const trimmed = email.trim();
    if (!trimmed) {
      setError("Enter your email address.");
      return;
    }

    setSending(true);
    setError(null);

    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: trimmed,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/` },
    });

    if (otpError) {
      setError(otpError.message);
      setSending(false);
      return;
    }

    setSent(true);
    setSending(false);
  }

  if (sent) {
    return (
      <div className="py-2 text-center">
        <p className="text-sm text-neutral-300">Check your email</p>
        <p className="mt-1 text-xs text-neutral-500">
          We sent a sign-in link to {email}.
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-neutral-400">Sign in to view your profile.</p>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSignIn();
        }}
        placeholder="you@example.com"
        className="mt-3 w-full rounded-lg border border-white/10 bg-neutral-950/60 px-3.5 py-2.5 text-sm text-neutral-100 outline-none placeholder:text-neutral-600 focus:border-orange-500/40"
      />
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
      <button
        onClick={handleSignIn}
        disabled={sending}
        className="mt-3 w-full rounded-lg bg-orange-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {sending ? "Sending link..." : "Continue with email"}
      </button>
    </div>
  );
}

// ============================================================
// PROFILE STAT ROW
// ============================================================

function StatRow({
  label,
  value,
  loading,
}: {
  label: string;
  value: React.ReactNode;
  loading?: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-b border-white/[0.06] py-2.5 last:border-b-0">
      <span className="text-xs text-neutral-500">{label}</span>
      <span className="text-sm font-medium text-neutral-100">
        {loading ? "..." : value}
      </span>
    </div>
  );
}

// ============================================================
// PROFILE PANEL (logged-in content)
// ============================================================

function ProfilePanel({ user }: { user: User }) {
  const { status: walletStatus, publicKey, balance, balanceLoading } = useWallet();
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setStatsLoading(true);
    loadProfileStats(user.id).then((result) => {
      if (!cancelled) {
        setStats(result);
        setStatsLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [user.id]);

  // Prefer the live, actively-connected wallet address; fall back to the
  // address already saved on the profile from a previous session.
  const walletAddress = publicKey ?? stats?.walletAddress ?? null;

  function handleCopy() {
    if (!walletAddress) return;
    navigator.clipboard.writeText(walletAddress).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div>
      <StatRow label="Email" value={user.email ?? "—"} />

      <div className="flex items-center justify-between border-b border-white/[0.06] py-2.5">
        <span className="text-xs text-neutral-500">Wallet</span>
        {walletAddress ? (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-neutral-100">
              {shortenAddress(walletAddress)}
            </span>
            <button
              onClick={handleCopy}
              className="text-[11px] text-neutral-500 transition-colors hover:text-neutral-200"
              title="Copy address"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        ) : (
          <span className="text-sm text-neutral-500">Not connected</span>
        )}
      </div>

      <StatRow
        label="Balance"
        value={
          walletStatus === "connected"
            ? balance !== null
              ? `${balance.toFixed(3)} SOL`
              : "Unavailable"
            : "Connect wallet"
        }
        loading={walletStatus === "connected" && balanceLoading}
      />

      <StatRow
        label="MemeTaste"
        value={`${stats?.memeTaste ?? 0} MT`}
        loading={statsLoading}
      />
      <StatRow
        label="Campaigns Participated"
        value={stats?.campaignsParticipated ?? 0}
        loading={statsLoading}
      />
      <StatRow
        label="Memes Submitted"
        value={stats?.memesSubmitted ?? 0}
        loading={statsLoading}
      />
    </div>
  );
}

// ============================================================
// PROFILE MENU (navbar trigger + popover)
// ============================================================

export default function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
      setAuthChecked(true);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  async function handleSignOut() {
    setSigningOut(true);
    setSignOutError(null);

    // Supabase sign-out only — Phantom's own connection is untouched, so
    // WalletButton keeps whatever wallet state it already had.
    const { error } = await supabase.auth.signOut();

    setSigningOut(false);

    if (error) {
      console.error("Sign out failed:", error);
      setSignOutError("Couldn't sign out. Try again.");
      return;
    }

    setUser(null);
    setOpen(false);
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => {
          setOpen((v) => !v);
          setSignOutError(null);
        }}
        aria-label="Profile"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-neutral-300 transition-colors hover:bg-white/5"
      >
        {user?.email ? (
          <span className="text-xs font-semibold uppercase text-neutral-100">
            {user.email[0]}
          </span>
        ) : (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.6}
            className="h-4 w-4"
          >
            <circle cx="12" cy="8" r="3.2" />
            <path d="M5 20c1.3-3.5 4-5.2 7-5.2s5.7 1.7 7 5.2" />
          </svg>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-[calc(100vw-2.5rem)] max-w-sm rounded-xl border border-white/10 bg-neutral-900/95 p-5 shadow-xl shadow-black/40 backdrop-blur-md sm:w-80">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-orange-500/80">
              Your Profile
            </span>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="text-neutral-500 transition-colors hover:text-neutral-200"
            >
              ×
            </button>
          </div>

          {!authChecked ? (
            <p className="py-2 text-center text-sm text-neutral-500">
              Loading...
            </p>
          ) : !user ? (
            <SignInPrompt />
          ) : (
            <>
              <ProfilePanel user={user} />
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                className="mt-4 w-full rounded-lg border border-white/10 py-2.5 text-sm font-medium text-neutral-400 transition-colors hover:border-red-500/30 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {signingOut ? "Signing out..." : "Sign out"}
              </button>
              {signOutError && (
                <p className="mt-2 text-center text-xs text-red-400">
                  {signOutError}
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}