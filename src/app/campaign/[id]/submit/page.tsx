import Link from "next/link";
import { campaignData, Campaign } from "../data";
import SubmitClient from "./SubmitClient";
import { supabase } from "../../../lib/supabase";

export const dynamic = "force-dynamic";

type SubmitPageProps = {
  params: Promise<{ id: string }>;
};

function getRemainingTime(endsAt: string | null) {
  if (!endsAt) return "—";

  const diff = new Date(endsAt).getTime() - Date.now();

  if (diff <= 0) return "Ended";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );

  if (days > 0) {
    return `${days}d ${hours}h`;
  }

  return `${hours}h`;
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
      <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-5 text-neutral-100">
        <div className="max-w-md text-center">
          <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-orange-500/80">
            Submit a meme
          </span>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-neutral-50">
            Campaign not found.
          </h1>

          <p className="mt-3 text-sm text-neutral-500">
            There&apos;s no campaign at &quot;{id}&quot;. It may have ended,
            or the link might be off.
          </p>

          <Link
            href="/#campaigns"
            className="mt-8 inline-flex rounded-lg border border-white/15 px-5 py-3 text-sm font-semibold text-neutral-200 transition-colors hover:bg-white/5"
          >
            ← Back to campaigns
          </Link>
        </div>
      </main>
    );
  }

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

const { count: submissionCount, error: submissionCountError } =
  await supabase
    .from("submissions")
    .select("id", { count: "exact", head: true })
    .eq("campaign_id", data.id)
    .eq("status", "approved");

if (submissionCountError) {
  console.error(
    "Submit page submission count error:",
    submissionCountError
  );
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
  remaining: getRemainingTime(data.ends_at),
  tone: "from-orange-600/20 to-neutral-900",
  productName: data.product_name || undefined,
  creatorBrief: data.creator_brief || undefined,
  rules,
  dynamic: true,
};
  return <SubmitClient campaign={campaign} />;
}