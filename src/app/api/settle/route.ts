import { NextResponse } from "next/server";

import { settleCampaign } from "../../lib/settlement";
import { serverSupabase } from "../../lib/serverSupabase";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return NextResponse.json(
      { error: "CRON_SECRET is not configured." },
      { status: 500 }
    );
  }

  const authorization = request.headers.get("authorization");

  if (authorization !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { error: "Unauthorized." },
      { status: 401 }
    );
  }

  const now = new Date().toISOString();

  const { data: campaigns, error } = await serverSupabase
    .from("campaigns")
    .select("id, ends_at")
    .lte("ends_at", now)
    .limit(20);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  const results = [];

  for (const campaign of campaigns ?? []) {
    try {
      const result = await settleCampaign(campaign.id);

      results.push({
        campaignId: campaign.id,
        ...result,
      });
    } catch (error) {
      results.push({
        campaignId: campaign.id,
        error:
          error instanceof Error
            ? error.message
            : String(error),
      });
    }
  }

  return NextResponse.json({
    processed: results.length,
    results,
  });
}
