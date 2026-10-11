import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import type { Campaign } from "../campaign/[id]/data";

// Moved from the homepage. Same Supabase queries, with the leftover debug
// console.log calls removed and the "—" fallback replaced by "Open-ended".

const DAY_MS = 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;
const MINUTE_MS = 60 * 1000;

function formatRemaining(endsAt: string | null, now: number): string {
  if (!endsAt) return "Open-ended";

  const diff = new Date(endsAt).getTime() - now;
  if (diff <= 0) return "Ended";

  const days = Math.floor(diff / DAY_MS);
  const hours = Math.floor((diff % DAY_MS) / HOUR_MS);
  const minutes = Math.floor((diff % HOUR_MS) / MINUTE_MS);

  if (days > 0) return `${days}d ${hours}h remaining`;
  if (hours > 0) return `${hours}h ${minutes}m remaining`;
  return `${minutes}m remaining`;
}

export function useCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("campaigns")
        .select(
          "id, brand_name, title, description, category, prize_pool, status, ends_at"
        )
        .order("created_at", { ascending: false });

      if (cancelled) return;

      if (error) {
        console.error("Failed to fetch campaigns:", {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
        setCampaigns([]);
        setLoading(false);
        return;
      }

      const rows = data ?? [];
      const campaignIds = rows.map((row) => row.id);
      const submissionCounts = new Map<string, number>();

      if (campaignIds.length > 0) {
        const { data: submissionRows, error: submissionError } = await supabase
          .from("submissions")
          .select("campaign_id")
          .in("campaign_id", campaignIds)
          .eq("status", "approved");

        if (submissionError) {
          console.error("Failed to fetch submission counts:", submissionError);
        }

        for (const row of submissionRows ?? []) {
          submissionCounts.set(
            row.campaign_id,
            (submissionCounts.get(row.campaign_id) ?? 0) + 1
          );
        }
      }

      if (cancelled) return;

      const now = Date.now();

      const mapped: Campaign[] = rows.map((row) => {
        const endsPassed = row.ends_at
          ? new Date(row.ends_at).getTime() <= now
          : false;
        const ended = row.status === "Ended" || endsPassed;

        const status: Campaign["status"] = ended
          ? "Ended"
          : row.status === "Ending soon"
            ? "Ending soon"
            : "Active";

        return {
          id: row.id,
          brand: row.brand_name,
          initial: row.brand_name?.charAt(0).toUpperCase() || "?",
          title: row.title,
          description: row.description,
          category: row.category || "General",
          status,
          prize: `${Number(row.prize_pool).toFixed(2)} SOL`,
          submissions: submissionCounts.get(row.id) ?? 0,
          remaining: ended ? "Ended" : formatRemaining(row.ends_at, now),
          tone: "from-orange-600/20 to-neutral-900",
          dynamic: true,
        };
      });

      setCampaigns(mapped);
      setLoading(false);
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  return { campaigns, loading };
}