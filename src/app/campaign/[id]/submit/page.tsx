import Link from "next/link";
import { campaignData, Campaign } from "../data";
import SubmitClient from "./SubmitClient";
import { supabase } from "../../../lib/supabase";

export const dynamic = "force-dynamic";

type SubmitPageProps = {
  params: Promise<{ id: string }>;
};

const DAY_MS = 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;
const MINUTE_MS = 60 * 1000;

/*
 * Time left for display. Returns "Ended", "Open-ended", or "3d 4h remaining".
 * Never returns an em dash: a campaign without an end date is open-ended.
 */
function getTimeLeft(endsAt: string | null, storedStatus: string | null): string {
  if (storedStatus === "Ended") return "Ended";
  if (!endsAt) return "Open-ended";

  const diff = new Date(endsAt).getTime() - Date.now();
  if (diff <= 0) return "Ended";

  const days = Math.floor(diff / DAY_MS);
  const hours = Math.floor((diff % DAY_MS) / HOUR_MS);
  const minutes = Math.floor((diff % HOUR_MS) / MINUTE_MS);

  if (days > 0) return `${days}d ${hours}h remaining`;
  if (hours > 0) return `${hours}h ${minutes}m remaining`;
  return `${minutes}m remaining`;
}

export default async function SubmitPage({ params }: SubmitPageProps) {
  const { id } = await params;
  const campaignId = id.toLowerCase();

  // Keep existing hard-coded campaigns working.
  const staticCampaign = campaignData[campaignId];

  if (staticCampaign) {
    return <SubmitClient campaign={staticCampaign} />;
  }

  // Load newly created campaigns from Supabase.
  const { data, error } = await supabase
    .from("campaigns")
    .select(
      `
        id,
        brand_name,
        product_name,
        title,
        description,
        creator_brief,
        category,
        rules,
        prize_pool,
        status,
        ends_at
      `
    )
    .eq("id", campaignId)
    .maybeSingle();

  if (error) {
    console.error("Submit campaign fetch error:", error);
  }

  if (!data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080808] px-5 text-neutral-100">
        <div className="max-w-md text-center">
          <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-orange-500/80">
            Submit a meme
          </span>

          <h1 className="mt-4 font-[family-name:var(--font-anton)] text-4xl text-white">
            Campaign not found.
          </h1>

          <p className="mt-3 text-sm text-neutral-500">
            There&apos;s no campaign at this link. It may have ended, or the
            link might be off.
          </p>

          <Link
            href="/campaigns"
            className="mt-8 inline-flex rounded-lg border border-white/15 px-5 py-3 text-sm font-semibold text-neutral-200 transition-colors hover:bg-white/5"
          >
            ← Back to campaigns
          </Link>
        </div>
      </main>
    );
  }

  const timeLeft = getTimeLeft(data.ends_at, data.status);

  const validStatus: Campaign["status"] =
    timeLeft === "Ended"
      ? "Ended"
      : data.status === "Ending soon"
        ? "Ending soon"
        : "Active";

  const rules = Array.isArray(data.rules)
    ? data.rules.filter(
        (rule: unknown): rule is string => typeof rule === "string"
      )
    : undefined;

  const { count: submissionCount, error: submissionCountError } =
    await supabase
      .from("submissions")
      .select("id", { count: "exact", head: true })
      .eq("campaign_id", data.id)
      .eq("status", "approved");

  if (submissionCountError) {
    console.error("Submit page submission count error:", submissionCountError);
  }

  const campaign: Campaign = {
    id: data.id,
    brand: data.brand_name,
    initial: data.brand_name?.charAt(0).toUpperCase() || "?",
    title: data.title,
    description: data.description,
    category: data.category || "General",
    status: validStatus,
    prize: `${Number(data.prize_pool).toFixed(2)} SOL`,
    submissions: submissionCount ?? 0,
    remaining: timeLeft,
    tone: "from-orange-600/20 to-neutral-900",
    productName: data.product_name || undefined,
    creatorBrief: data.creator_brief || undefined,
    rules,
    dynamic: true,
  };

  return <SubmitClient campaign={campaign} />;
}