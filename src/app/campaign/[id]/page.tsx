import { notFound } from "next/navigation";
import { campaignData, Campaign } from "./data";
import CampaignDetail from "./CampaignDetail";
import { supabase } from "../../lib/supabase";

export const dynamic = "force-dynamic";

type CampaignPageProps = {
  params: Promise<{ id: string }>;
};

function getRemainingTime(endsAt: string | null) {
  if (!endsAt) return "—";

  const diff = new Date(endsAt).getTime() - Date.now();

  if (diff <= 0) {
    return "Ended";
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );

  if (days > 0) {
    return `${days}d ${hours}h`;
  }

  return `${hours}h`;
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
    const validStatus: Campaign["status"] =
      data.status === "Ended"
        ? "Ended"
        : data.status === "Ending soon"
          ? "Ending soon"
          : "Active";

    const rules = Array.isArray(data.rules)
      ? data.rules.filter(
          (rule): rule is string => typeof rule === "string"
        )
      : undefined;

    const campaign: Campaign = {
      id: data.id,
      brand: data.brand_name,
      initial: data.brand_name?.charAt(0).toUpperCase() || "?",
      title: data.title,
      description: data.description,
      category: data.category || "General",
      status: validStatus,
      prize: `${Number(data.prize_pool).toFixed(2)} SOL`,
      submissions: 0,
      remaining: getRemainingTime(data.ends_at),
      tone: "from-orange-600/20 to-neutral-900",
      dynamic: true,
      productName: data.product_name || undefined,
      creatorBrief: data.creator_brief || undefined,
      rules,
    };

    return <CampaignDetail campaign={campaign} />;
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