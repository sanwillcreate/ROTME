"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import WalletButton from "./WalletButton";
import ProfileMenu from "./ProfileMenu";
import { supabase } from "../lib/supabase";

// Shows a "Log in" entry point only when a session is known to be absent,
// so a signed-in user never sees it flash on load. Uses the existing
// magic-link flow on /login.
function LoginLink() {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setLoggedIn(!!data.user);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setLoggedIn(!!session?.user);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  if (loggedIn !== false) return null;

  return (
    <Link
      href="/login"
      className="hidden px-3 py-2 text-sm font-medium text-neutral-300 transition-colors hover:text-neutral-50 sm:inline-flex"
    >
      Log in
    </Link>
  );
}

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-neutral-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
        <div className="flex items-center gap-10">
          <Link
            href="/"
            className="text-lg font-bold tracking-tight text-neutral-50"
          >
            ROT<span className="text-orange-500">ME</span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm text-neutral-400 md:flex">
            <Link
              href="/campaigns"
              className="transition-colors hover:text-neutral-100"
            >
              Campaigns
            </Link>
            <Link
              href="/#picks"
              className="transition-colors hover:text-neutral-100"
            >
              Picks
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/campaign/create"
            className="hidden px-3 py-2 text-sm font-medium text-neutral-300 transition-colors hover:text-neutral-50 sm:inline-flex"
          >
            Create Campaign
          </Link>

          <LoginLink />
          <WalletButton />
          <ProfileMenu />
        </div>
      </div>
    </header>
  );
}