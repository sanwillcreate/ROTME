"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const next = params.get("next");

      if (code) {
        const { error } =
          await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          console.error("Auth callback error:", error);
          router.replace("/");
          return;
        }
      }

      if (next) {
        router.replace(next);
        return;
      }

      const pending = localStorage.getItem("rotme_pending_pick");

      if (pending) {
        try {
          const { campaignId } = JSON.parse(pending);

          router.replace(`/campaign/${campaignId}/pick`);
          return;
        } catch {
          localStorage.removeItem("rotme_pending_pick");
        }
      }

      router.replace("/");
    };

    handleAuth();
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 text-neutral-100">
      <div className="text-center">
        <p className="text-sm text-neutral-400">
          Signing you in...
        </p>
      </div>
    </main>
  );
}