import { notFound } from "next/navigation";
import { campaignData, Campaign } from "./data";
import CampaignDetail, { type ApprovedSubmission } from "./CampaignDetail";
import { supabase } from "../../lib/supabase";
export const dynamic = "force-dynamic";

type CampaignPageProps = {
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

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / DAY_MS);
  if (days >= 1) return `${days} day${days === 1 ? "" : "s"} ago`;
  const hours = Math.floor(diff / HOUR_MS);
  if (hours >= 1) return `${hours}h ago`;
  return "Just now";
}

export default async function CampaignPage({
  params,
}: CampaignPageProps) {
  const { id } = await params;
  const campaignId = id.toLowerCase();

  /*
   * Always check Supabase first.
   * This ensures database changes to existing campaigns
   * such as ElevenLabs are reflected on the public page.
   */
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
        starts_at,
        ends_at
      `
    )
    .eq("id", campaignId)
    .maybeSingle();

  if (error) {
    console.error("Campaign fetch error:", error);
  }

  /*
   * Use the Supabase campaign whenever it exists.
   */
  if (data) {
    const rules = Array.isArray(data.rules)
      ? data.rules.filter(
          (rule: unknown): rule is string => typeof rule === "string"
        )
      : undefined;

    const { count: submissionCount } = await supabase
      .from("submissions")
      .select("id", { count: "exact", head: true })
      .eq("campaign_id", data.id)
      .eq("status", "approved");

    /*
     * Approved memes for the gallery. Read-only; uses the same public
     * "approved" rows the Pick page already reads.
     */
    const { data: approvedRows, error: approvedError } = await supabase
      .from("submissions")
      .select("id, caption, media_url, created_at")
      .eq("campaign_id", data.id)
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(6);

    if (approvedError) {
      console.error("Approved submissions fetch error:", approvedError);
    }

    const approvedSubmissions: ApprovedSubmission[] = (approvedRows ?? []).map(
      (row: { id: string; caption: string; media_url: string | null; created_at: string | null }) => ({
        id: row.id,
        caption: row.caption,
        mediaUrl: row.media_url ?? null,
        postedAgo: row.created_at ? timeAgo(row.created_at) : "",
      })
    );

    const timeLeft = getTimeLeft(data.ends_at, data.status);

    const campaign: Campaign = {
      id: data.id,
      brand: data.brand_name,
      initial: data.brand_name?.charAt(0).toUpperCase() || "?",
      title: data.title,
      description: data.description,
      category: data.category || "General",
      status:
        timeLeft === "Ended"
          ? "Ended"
          : data.status === "Ending soon"
            ? "Ending soon"
            : "Active",
      prize: `${Number(data.prize_pool).toFixed(2)} SOL`,
      submissions: submissionCount ?? 0,
      remaining: timeLeft,
      tone: "from-orange-600/20 to-neutral-900",
      dynamic: true,
      productName: data.product_name || undefined,
      creatorBrief: data.creator_brief || undefined,
      rules,
    };

    return (
      <CampaignDetail
        campaign={campaign}
        approvedSubmissions={approvedSubmissions}
      />
    );
  }

  /*
   * Fall back to the existing hard-coded campaigns
   * only when there is no Supabase campaign.
   */
  const staticCampaign = campaignData[campaignId];

  if (staticCampaign) {
    return <CampaignDetail campaign={staticCampaign} />;
  }

  notFound();
}